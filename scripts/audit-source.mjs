#!/usr/bin/env node
/**
 * Portão do processo de source.
 *
 * A cadeia tem quatro elos: captura → átomo → admissão → publicação.
 * Este script abre o schema inteiro em memória, aplica todas as migrations e
 * pergunta se cada elo está inteiro. O número de tabelas é contado aqui, nunca
 * escrito no código: número fixo no código é bug, porque o schema muda.
 *
 * Violação (derruba o portão):
 *   - intake_file sem intake_batch correspondente
 *   - kernel_atom sem source_quote, sem pinpoint ou sem source_quote_sha256
 *   - kernel_claim sem kernel_evidence
 *   - kernel_manifest aprovado sem aprovação independente (kernel, dono, ou sem
 *     hash, sem data, sem registro de aprovação que case)
 *   - policy_decision sem regra correspondente
 *   - instrumento publicado sem passar pelo portão registrado
 *
 * uso: node scripts/audit-source.mjs [--self-test] [--json]
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const diretorioMigrations = new URL("../migrations/", import.meta.url);
const arquivoRelatorio = new URL("../artifacts/source-processo.json", import.meta.url);

const portaoDePublicacao = "publicar_ferramenta";

/** Aplica todas as migrations, em ordem, num PGlite em memória. */
export async function abrirBanco() {
  const nomes = (await readdir(diretorioMigrations))
    .filter((nome) => nome.endsWith(".sql"))
    .sort();
  const db = new PGlite();
  const falhas = [];
  for (const nome of nomes) {
    try {
      await db.exec(await readFile(new URL(nome, diretorioMigrations), "utf8"));
    } catch (erro) {
      falhas.push({ migration: nome, erro: String(erro?.message ?? erro) });
    }
  }
  return { db, migrations: nomes, falhas };
}

const ehHash = (valor) => typeof valor === "string" && /^[a-f0-9]{64}$/.test(valor);

/**
 * @param {object} db  PGlite já com as migrations aplicadas
 */
export async function auditar(db) {
  const violacoes = [];
  const achados = [];

  const contar = async (sql) => {
    const resultado = await db.query(sql);
    return Number(resultado.rows[0]?.n ?? 0);
  };

  // 1. Captura: arquivo sem lote não pertence a passagem nenhuma.
  const orfaos = await db.query(
    `select f.batch_id, f.path
     from intake_file f
     left join intake_batch b on b.id = f.batch_id
     where b.id is null
     order by f.batch_id, f.path`,
  );
  for (const linha of orfaos.rows) {
    violacoes.push({
      tipo: "intake-file-sem-lote",
      linha: `intake_file:${linha.batch_id}/${linha.path}`,
      detalhe: `o arquivo "${linha.path}" aponta para o lote "${linha.batch_id}", que não existe.`,
    });
  }

  // 2. Átomo: sem trecho literal, sem pinpoint e sem hash do trecho, não é
  //    afirmação com fonte — é afirmação que alguém escreveu.
  const atomos = await db.query(
    `select id, source_quote, pinpoint, source_quote_sha256, status
     from kernel_atom
     order by id`,
  );
  for (const atomo of atomos.rows) {
    const faltando = [];
    if (!atomo.source_quote || !String(atomo.source_quote).trim()) faltando.push("source_quote");
    if (!atomo.pinpoint || !String(atomo.pinpoint).trim()) faltando.push("pinpoint");
    if (!atomo.source_quote_sha256 || !String(atomo.source_quote_sha256).trim()) {
      faltando.push("source_quote_sha256");
    } else if (!ehHash(atomo.source_quote_sha256)) {
      faltando.push("source_quote_sha256 (não é sha256)");
    }
    if (faltando.length > 0) {
      violacoes.push({
        tipo: "atom-sem-evidencia",
        linha: `kernel_atom:${atomo.id}`,
        detalhe: `o átomo "${atomo.id}" está sem ${faltando.join(", ")}.`,
      });
    }
  }

  // 3. Desdobramento sem evidência é afirmação sem fonte.
  const claims = await db.query(
    `select c.id from kernel_claim c
     left join kernel_evidence e on e.claim_id = c.id
     where e.id is null
     order by c.id`,
  );
  for (const linha of claims.rows) {
    violacoes.push({
      tipo: "claim-sem-evidencia",
      linha: `kernel_claim:${linha.id}`,
      detalhe: `o desdobramento "${linha.id}" não tem nenhuma linha em kernel_evidence.`,
    });
  }

  // 3b. Evidência sem referência não diz onde a afirmação se confere.
  const evidencias = await db.query(
    `select id, claim_id, reference from kernel_evidence
     where reference is null or btrim(reference) = ''
     order by id`,
  );
  for (const linha of evidencias.rows) {
    violacoes.push({
      tipo: "evidencia-sem-reference",
      linha: `kernel_evidence:${linha.id}`,
      detalhe: `a evidência "${linha.id}" (do desdobramento "${linha.claim_id}") não diz onde se confere.`,
    });
  }

  // 4. Manifesto: aprovado só por pessoa independente, com hash, com data e com
  //    o registro de aprovação que case.
  const manifestos = await db.query(
    `select m.order_id, m.status, m.approved_by, m.approved_at, m.hash,
            o.owner_id, o.approver_id,
            (select a.id from kernel_approval a
              where a.order_id = m.order_id
                and a.approver = m.approved_by
                and a.decision = 'aprovado'
                and a.approved_at = m.approved_at
              limit 1) as approval_id
     from kernel_manifest m
     left join kernel_order o on o.id = m.order_id
     order by m.order_id`,
  );
  for (const manifesto of manifestos.rows) {
    if (manifesto.status !== "aprovado") {
      if (!manifesto.order_id) {
        violacoes.push({
          tipo: "manifesto-sem-pedido",
          linha: `kernel_manifest:${manifesto.order_id ?? "?"}`,
          detalhe: "o manifesto não tem pedido correspondente.",
        });
      }
      continue;
    }
    const problemas = [];
    if (!manifesto.approved_by) problemas.push("sem approved_by");
    else if (manifesto.approved_by === "kernel") problemas.push("aprovado pelo kernel");
    else if (manifesto.owner_id && manifesto.approved_by === manifesto.owner_id) {
      problemas.push("aprovado pelo dono do pedido");
    } else if (manifesto.approver_id && manifesto.approved_by !== manifesto.approver_id) {
      problemas.push("aprovado por quem o pedido não nomeia");
    }
    if (!ehHash(manifesto.hash)) problemas.push("sem hash sha256");
    if (!manifesto.approved_at) problemas.push("sem approved_at");
    if (!manifesto.approval_id) problemas.push("sem registro de aprovação que case");
    if (problemas.length > 0) {
      violacoes.push({
        tipo: "manifesto-sem-aprovacao-independente",
        linha: `kernel_manifest:${manifesto.order_id}`,
        detalhe: `o manifesto "${manifesto.order_id}" está ${problemas.join(", ")}.`,
      });
    }
  }

  // 5. Decisão de política sem regra correspondente: negação sem regra é
  //    negação por falta de regra (legítimo); permissão sem regra é invenção.
  const decisoes = await db.query(
    `select d.id, d.package_id, d.rule_id, d.effect
     from policy_decision d
     left join policy_rule r on r.package_id = d.package_id and r.id = d.rule_id
     where (d.rule_id is not null and r.id is null)
        or (d.effect = 'allow' and d.rule_id is null)
     order by d.id`,
  );
  for (const linha of decisoes.rows) {
    violacoes.push({
      tipo: "decisao-sem-regra",
      linha: `policy_decision:${linha.id}`,
      detalhe: linha.rule_id
        ? `a decisão "${linha.id}" cita a regra "${linha.rule_id}", que não existe no pacote "${linha.package_id}".`
        : `a decisão "${linha.id}" é "${linha.effect}" sem citar regra nenhuma.`,
    });
  }

  // 6. Publicação: o instrumento publicado por uma pessoa tem que ter passado
  //    pelo portão registrado. O que foi publicado por um processo (a
  //    normalização DERBY, o seed) não é retido: o dono mandou não reter nada.
  const publicados = await db.query(
    `select t.slug, t.updated_by
     from source_tool t
     where t.published = true
       and t.updated_by is not null
       and exists (select 1 from member m where m.user_id = t.updated_by)
       and not exists (
         select 1 from source_publication p
         where p.slug = t.slug and p.gate_id = '${portaoDePublicacao}'
       )
     order by t.slug`,
  );
  for (const linha of publicados.rows) {
    violacoes.push({
      tipo: "instrumento-sem-portao",
      linha: `source_tool:${linha.slug}`,
      detalhe: `o instrumento "${linha.slug}" foi publicado por "${linha.updated_by}" sem registro do portão ${portaoDePublicacao}.`,
    });
  }

  // 6b. Publicação que aponta para um portão que não existe no banco.
  const portoesDesconhecidos = await db.query(
    `select p.id, p.slug, p.gate_id
     from source_publication p
     left join process g on g.id = p.gate_id
     where g.id is null
     order by p.id`,
  );
  for (const linha of portoesDesconhecidos.rows) {
    violacoes.push({
      tipo: "publicacao-com-portao-desconhecido",
      linha: `source_publication:${linha.id}`,
      detalhe: `a publicação de "${linha.slug}" cita o portão "${linha.gate_id}", que não existe em process.`,
    });
  }

  const contagens = {
    capturas: await contar("select count(*)::int n from intake_batch"),
    arquivosCapturados: await contar("select count(*)::int n from intake_file"),
    atomos: await contar("select count(*)::int n from kernel_atom"),
    atomosAdmitidos: await contar("select count(*)::int n from kernel_atom where status = 'admitido'"),
    desdobramentos: await contar("select count(*)::int n from kernel_claim"),
    evidencias: await contar("select count(*)::int n from kernel_evidence"),
    pedidos: await contar("select count(*)::int n from kernel_order"),
    manifestos: await contar("select count(*)::int n from kernel_manifest"),
    manifestosAprovados: await contar("select count(*)::int n from kernel_manifest where status = 'aprovado'"),
    aprovacoes: await contar("select count(*)::int n from kernel_approval"),
    decisoes: await contar("select count(*)::int n from policy_decision"),
    publicacoes: await contar("select count(*)::int n from source_publication"),
    instrumentosPublicados: await contar("select count(*)::int n from source_tool where published = true"),
    instrumentosPublicadosNoProcesso: await contar(
      `select count(*)::int n from source_tool t
       where t.published = true and t.updated_by is not null
         and exists (select 1 from member m where m.user_id = t.updated_by)`,
    ),
    tabelasDoBanco: await contar(
      `select count(*)::int n from pg_class c
       join pg_namespace ns on ns.oid = c.relnamespace
       where c.relkind = 'r' and ns.nspname = 'public'`,
    ),
  };

  return { violacoes, achados, contagens };
}

export function formatar(relatorio) {
  const linhas = [];
  const c = relatorio.contagens;
  linhas.push(`[source] tabelas no banco:          ${c.tabelasDoBanco}`);
  linhas.push(`[source] capturas (lotes):           ${c.capturas}`);
  linhas.push(`[source] arquivos capturados:       ${c.arquivosCapturados}`);
  linhas.push(`[source] átomos:                    ${c.atomos} (admitidos: ${c.atomosAdmitidos})`);
  linhas.push(`[source] desdobramentos com evidência:${c.desdobramentos} (evidências: ${c.evidencias})`);
  linhas.push(`[source] pedidos de admissão:       ${c.pedidos}`);
  linhas.push(`[source] manifestos:                ${c.manifestos} (aprovados: ${c.manifestosAprovados})`);
  linhas.push(`[source] aprovações humanas:        ${c.aprovacoes}`);
  linhas.push(`[source] decisões de política:      ${c.decisoes}`);
  linhas.push(`[source] publicações registradas:   ${c.publicacoes}`);
  linhas.push(`[source] instrumentos publicados:    ${c.instrumentosPublicados} (pelo processo: ${c.instrumentosPublicadosNoProcesso})`);
  for (const achado of relatorio.achados) {
    linhas.push(`  achado  ${achado.linha}: ${achado.detalhe}`);
  }
  for (const violacao of relatorio.violacoes) {
    linhas.push(`  VIOLAÇÃO ${violacao.linha}: ${violacao.detalhe} [${violacao.tipo}]`);
  }
  return linhas.join("\n");
}

async function principal() {
  const argumentos = process.argv.slice(2);
  const selfTest = argumentos.includes("--self-test");
  const json = argumentos.includes("--json");

  const { db, migrations, falhas } = await abrirBanco();
  let relatorio = await auditar(db);
  if (falhas.length > 0) {
    relatorio.violacoes.unshift(
      ...falhas.map((falha) => ({
        tipo: "migration-nao-aplicada",
        linha: `migration:${falha.migration}`,
        detalhe: `a migration ${falha.migration} não aplicou: ${falha.erro}`,
      })),
    );
  }

  if (selfTest) {
    // Quebra uma coisa de propósito: o portão tem que saber falhar.
    const alvo = await db.query(
      "select id from kernel_atom where source_quote is not null order by id limit 1",
    );
    const id = alvo.rows[0]?.id;
    if (!id) {
      console.log("[self-test] não há átomo com trecho literal para quebrar.");
      process.exit(1);
    }
    await db.query("update kernel_atom set source_quote = null where id = $1", [id]);
    relatorio = await auditar(db);
    console.log(`[self-test] limpei o source_quote de "${id}". O portão tem que acusar:`);
    console.log(formatar(relatorio));
    const acusou = relatorio.violacoes.some(
      (violacao) => violacao.tipo === "atom-sem-evidencia" && violacao.linha === `kernel_atom:${id}`,
    );
    console.log(
      acusou
        ? `[self-test] ok: o portão falhou e nomeou "${id}".`
        : `[self-test] FALHA: o portão não acusou o trecho removido de "${id}".`,
    );
    process.exit(acusou ? 0 : 1);
  }

  const saida = formatar(relatorio);
  console.log(saida);
  await writeFile(
    arquivoRelatorio,
    JSON.stringify({ migrations: migrations.length, ...relatorio }, null, 2),
  );

  if (json) {
    console.log(JSON.stringify(relatorio, null, 2));
  }
  process.exit(relatorio.violacoes.length === 0 ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await principal();
}
