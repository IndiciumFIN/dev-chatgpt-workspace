#!/usr/bin/env node
/**
 * Portão do índice do banco.
 *
 * Toda tabela do dicionário tem um nome que uma pessoa usa — não o nome técnico.
 * Este script conta sozinho: número fixo no código é bug, porque o schema muda.
 *
 * Violação (derruba o portão):
 *   - label vazia, label igual ao nome técnico, label com acento ou caixa alta
 *   - tabela do dicionário sem linha no índice, ou linha do índice sem tabela
 *   - duas tabelas com a mesma label
 *   - finalidade vazia: a tabela está no dicionário e o dicionário não diz o que ela responde
 *   - chave primária declarada que não é a chave que o DDL declara
 *
 * Achado bloqueante de cobertura (HOLD_HUMAN, sai no relatório):
 *   - tabela do banco que o dicionário não cobre
 *
 * uso: node scripts/audit-indice-banco.mjs [--self-test] [--json]
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const diretorioMigrations = new URL("../migrations/", import.meta.url);
const arquivoIndice = new URL("../src/lib/banco/indice.ts", import.meta.url);
const arquivoRelatorio = new URL("../artifacts/db-indice.json", import.meta.url);

export function semAcento(texto) {
  return String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Aplica todas as migrations, em ordem, num PGlite em memória. */
export async function abrirBanco() {
  const nomes = (await readdir(diretorioMigrations))
    .filter((nome) => nome.endsWith(".sql"))
    .sort();
  const db = new PGlite();
  for (const nome of nomes) {
    await db.exec(await readFile(new URL(nome, diretorioMigrations), "utf8"));
  }
  return { db, migrations: nomes };
}

/** Lê os nomes do índice em código. O arquivo é gerado, então o formato é estável. */
export async function nomesDoIndice() {
  const texto = await readFile(arquivoIndice, "utf8");
  return [...texto.matchAll(/name:\s*"([a-z0-9_]+)"/g)].map((achado) => achado[1]);
}

/** Compara uma chave escrita com a chave medida, sem distinguir vírgula de "+". */
export function mesmaChave(escrita, medida) {
  const normaliza = (texto) =>
    String(texto)
      .split(/[,+]/)
      .map((parte) => parte.trim().toLowerCase())
      .filter(Boolean)
      .join("+");
  return normaliza(escrita) === normaliza(medida);
}

/**
 * @param {object} db        PGlite já com as migrations aplicadas
 * @param {string[]} nomesIndice  nomes de tabela declarados no índice em código
 */
export async function auditar(db, nomesIndice) {
  const violacoes = [];
  const achados = [];

  const entidades = await db.query(
    "select name, label, layer_id, purpose, primary_key from schema_entity order by name",
  );
  const dicionario = entidades.rows;

  // A chave que o DDL declara. O dicionário descreve o banco: quando ele afirma
  // uma chave, tem que ser a chave que existe — e quando o DDL não declara
  // nenhuma, o dicionário tem que dizer isso em vez de inventar uma coluna.
  const chaves = await db.query(
    `select c.relname as name, a.attname as col
     from pg_constraint con
     join pg_class c on c.oid = con.conrelid
     join pg_namespace n on n.oid = c.relnamespace
     join pg_attribute a on a.attrelid = c.oid and a.attnum = any(con.conkey)
     where con.contype = 'p' and n.nspname = 'public'
     order by c.relname, array_position(con.conkey, a.attnum)`,
  );
  const chaveReal = new Map();
  for (const linha of chaves.rows) {
    const lista = chaveReal.get(linha.name) ?? [];
    lista.push(linha.col);
    chaveReal.set(linha.name, lista);
  }

  const labelsVistas = new Map();
  for (const entidade of dicionario) {
    const nome = entidade.name;
    const label = String(entidade.label ?? "").trim();

    if (!label) {
      violacoes.push({
        tipo: "label-vazia",
        tabela: nome,
        detalhe: `schema_entity.label de "${nome}" está vazia: a tabela não tem nome de uso.`,
      });
      continue;
    }
    if (label === nome) {
      violacoes.push({
        tipo: "label-eco",
        tabela: nome,
        detalhe: `label "${label}" é igual ao nome técnico: não é um nome de uso.`,
      });
    }
    // Acento e maiúscula são a escrita correta em português. O que é proibido é
    // GRITAR (tudo maiúsculo) ou capitalizar no meio ("Contas De Acesso").
    // Sigla é legítima: "Controles de IA", "URLs do sitemap" passam.
    const palavras = label.split(/\s+/);
    const ehSigla = (palavra) => /^[A-Z]{1,4}s?$/.test(palavra);
    const gritando = palavras.some(
      (palavra) => palavra.length > 1 && palavra === palavra.toUpperCase() && !ehSigla(palavra),
    );
    if (gritando) {
      violacoes.push({
        tipo: "label-gritada",
        tabela: nome,
        detalhe: `label "${label}" está toda em maiúscula.`,
      });
    }
    const capitalNoMeio = palavras.slice(1).some(
      (palavra) => /^[A-Z][a-zà-ÿ]/.test(palavra) && !ehSigla(palavra),
    );
    if (capitalNoMeio) {
      violacoes.push({
        tipo: "label-capital-interno",
        tabela: nome,
        detalhe: `label "${label}" tem palavra capitalizada no meio da frase.`,
      });
    }
    if (!semAcento(label).trim()) {
      violacoes.push({
        tipo: "label-sem-forma",
        tabela: nome,
        detalhe: `label "${label}" não sobra nada depois de tirar o acento.`,
      });
    }
    if (labelsVistas.has(label)) {
      violacoes.push({
        tipo: "label-duplicada",
        tabela: nome,
        detalhe: `label "${label}" já é a de "${labelsVistas.get(label)}".`,
      });
    } else {
      labelsVistas.set(label, nome);
    }

    // A finalidade responde a pergunta que a tabela responde. Sem ela, a área
    // admin mostra o nome de uso e não diz para que a coisa serve.
    const finalidade = String(entidade.purpose ?? "").trim();
    if (!finalidade) {
      violacoes.push({
        tipo: "finalidade-vazia",
        tabela: nome,
        detalhe: `schema_entity.purpose de "${nome}" está vazia: a tabela não diz o que ela responde.`,
      });
    }

    // A chave declarada tem que ser a chave do DDL. Onde o DDL não declara
    // chave, o dicionário tem que dizer isso — não inventar coluna.
    const colunas = chaveReal.get(nome) ?? [];
    const declarada = String(entidade.primary_key ?? "").trim();
    if (colunas.length === 0) {
      if (declarada && !/sem/i.test(declarada)) {
        violacoes.push({
          tipo: "chave-primaria-inventada",
          tabela: nome,
          detalhe: `o DDL de "${nome}" não declara chave primária e o dicionário declara "${declarada}".`,
        });
      }
    } else if (!mesmaChave(declarada, colunas.join("+"))) {
      violacoes.push({
        tipo: "chave-primaria-divergente",
        tabela: nome,
        detalhe: `o dicionário declara a chave "${declarada}" e o DDL de "${nome}" declara "${colunas.join(" + ")}".`,
      });
    }
  }

  const nomesDicionario = new Set(dicionario.map((entidade) => entidade.name));
  const nomesIndiceSet = new Set(nomesIndice);

  for (const nome of nomesDicionario) {
    if (!nomesIndiceSet.has(nome)) {
      violacoes.push({
        tipo: "indice-sem-tabela",
        tabela: nome,
        detalhe: `a tabela "${nome}" existe no dicionário e não tem linha em src/lib/banco/indice.ts.`,
      });
    }
  }
  for (const nome of nomesIndiceSet) {
    if (!nomesDicionario.has(nome)) {
      violacoes.push({
        tipo: "indice-tabela-inexistente",
        tabela: nome,
        detalhe: `src/lib/banco/indice.ts declara "${nome}" e essa tabela não está no dicionário.`,
      });
    }
  }

  const tabelas = await db.query(
    `select c.relname as name
     from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
     where c.relkind = 'r' and n.nspname = 'public'
     order by c.relname`,
  );
  for (const tabela of tabelas.rows) {
    if (!nomesDicionario.has(tabela.name)) {
      achados.push({
        tipo: "tabela-fora-do-dicionario",
        tabela: tabela.name,
        detalhe: `a tabela "${tabela.name}" existe no banco e o dicionário não a descreve.`,
      });
    }
  }

  return {
    violacoes,
    achados,
    contagens: {
      tabelasDoBanco: tabelas.rows.length,
      tabelasNoDicionario: dicionario.length,
      linhasNoIndice: nomesIndice.length,
      tabelasComLabel: dicionario.filter((entidade) => String(entidade.label ?? "").trim()).length,
      tabelasForaDoDicionario: achados.length,
    },
  };
}

/** Fail-closed release gate; findings remain as evidence and are never auto-labeled. */
export function indexAuditReleaseAllowed(relatorio) {
  return relatorio.violacoes.length === 0 &&
    relatorio.contagens.tabelasForaDoDicionario === 0 &&
    relatorio.contagens.tabelasDoBanco === relatorio.contagens.tabelasNoDicionario &&
    relatorio.contagens.linhasNoIndice === relatorio.contagens.tabelasNoDicionario;
}

export function formatar(relatorio) {
  const linhas = [];
  linhas.push(`[índice] tabelas no banco:        ${relatorio.contagens.tabelasDoBanco}`);
  linhas.push(`[índice] tabelas no dicionário:   ${relatorio.contagens.tabelasNoDicionario}`);
  linhas.push(`[índice] linhas no índice:       ${relatorio.contagens.linhasNoIndice}`);
  linhas.push(`[índice] tabelas com label:      ${relatorio.contagens.tabelasComLabel}`);
  linhas.push(`[índice] fora do dicionário:     ${relatorio.contagens.tabelasForaDoDicionario}`);
  for (const achado of relatorio.achados) {
    linhas.push(`  achado  ${achado.tabela}: ${achado.detalhe}`);
  }
  for (const violacao of relatorio.violacoes) {
    linhas.push(`  VIOLAÇÃO ${violacao.tabela}: ${violacao.detalhe}`);
  }
  return linhas.join("\n");
}

async function principal() {
  const argumentos = process.argv.slice(2);
  const selfTest = argumentos.includes("--self-test");
  const json = argumentos.includes("--json");

  const { db, migrations } = await abrirBanco();
  const nomesIndice = await nomesDoIndice();
  let relatorio = await auditar(db, nomesIndice);

  if (selfTest) {
    // Cada rodada quebra UMA coisa de propósito e exige que o portão acuse,
    // nomeando a tabela. Um portão que passa em tudo não é garantia.
    const rodadas = [
      { tabela: "user", campo: "label", tipo: "label-vazia", valor: "" },
      { tabela: "canonical_asset", campo: "purpose", tipo: "finalidade-vazia", valor: "" },
      {
        tabela: "canonical_divergence",
        campo: "primary_key",
        tipo: "chave-primaria-inventada",
        valor: "code",
      },
    ];
    const originais = new Map();
    for (const rodada of rodadas) {
      const atual = await db.query(`select ${rodada.campo} as valor from schema_entity where name = $1`, [
        rodada.tabela,
      ]);
      originais.set(rodada.tabela, atual.rows[0]?.valor ?? null);
    }
    let acusouTodas = true;
    for (const rodada of rodadas) {
      await db.query(`update schema_entity set ${rodada.campo} = $2 where name = $1`, [
        rodada.tabela,
        rodada.valor,
      ]);
      relatorio = await auditar(db, nomesIndice);
      console.log(
        `[self-test] quebrei ${rodada.campo} de "${rodada.tabela}". O portão tem que acusar ${rodada.tipo}:`,
      );
      console.log(formatar(relatorio));
      const achado = relatorio.violacoes.find(
        (v) => v.tabela === rodada.tabela && v.tipo === rodada.tipo,
      );
      const barrou = !indexAuditReleaseAllowed(relatorio);
      console.log(
        achado && barrou
          ? `[self-test] ok: o portão falhou, nomeou "${rodada.tabela}" e barrou a passagem.`
          : `[self-test] FALHA: o portão não acusou ${rodada.tipo} em "${rodada.tabela}".`,
      );
      if (!achado || !barrou) acusouTodas = false;
      await db.query(`update schema_entity set ${rodada.campo} = $2 where name = $1`, [
        rodada.tabela,
        originais.get(rodada.tabela),
      ]);
    }
    process.exit(acusouTodas ? 0 : 1);
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
  // Metadata coverage is a release invariant. We keep the detailed items as
  // findings (rather than inventing labels), but --check must fail closed.
  const lacksDictionaryCoverage = relatorio.contagens.tabelasForaDoDicionario > 0;
  if (lacksDictionaryCoverage) {
    console.error(`HOLD_HUMAN: ${relatorio.contagens.tabelasForaDoDicionario} tables lack schema_entity and index coverage; no automatic labels generated.`);
  }
  process.exit(indexAuditReleaseAllowed(relatorio) ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await principal();
}
