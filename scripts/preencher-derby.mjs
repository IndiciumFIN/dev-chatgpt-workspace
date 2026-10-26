/**
 * Portão do DERBY.
 *
 * A ordem do dono: todo campo pendente recebe o valor literal DERBY e nada fica
 * retido. Este script:
 *   - aplica todas as migrations (a 0037 faz a normalização) num PGlite em memória;
 *   - varre TODA coluna textual de TODA tabela procurando pendência (null ou vazio);
 *   - separa o que é PENDÊNCIA REAL (violação) do que é o vazio do próprio
 *     modelo (coluna discriminadora ou coluna que ninguém usa).
 *
 * uso: node scripts/preencher-derby.mjs [--check] [--self-test] [--json]
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

export const MARCADOR = "DERBY";
export const RESPONSAVEL = "derby-normalizacao";
const diretorioMigrations = new URL("../migrations/", import.meta.url);
const arquivoRelatorio = new URL("../artifacts/db-derby.json", import.meta.url);

/**
 * Colunas que a normalização DERBY é responsável por.
 * A lista vem do que foi MEDIDO no banco, não de chute: quem troca a lista
 * tem que trocar a migration junto, e o teste confere as duas.
 */
export const COLUNAS_ALVO = [
  ["source_tool", "version"],
  ["source_tool", "evidence"],
  ["source_tool", "band_from"],
  ["source_tool", "category"],
  ["source_tool", "nanda_mode"],
  ["source_tool", "updated_by"],
  ["content_text", "body"],
  ["content_text", "title"],
  ["content_text", "lead"],
  ["content_text", "review_state"],
  ["locale", "label"],
  ["kernel_atom", "admitted_by"],
  ["kernel_atom", "admitted_at"],
  ["kernel_claim", "admitted_by"],
  ["kernel_claim", "admitted_at"],
  ["business_rule", "approved_by"],
  ["business_rule", "approved_at"],
  ["ai_control", "approved_by"],
  ["ai_control", "approved_at"],
  ["governance_item", "approved_by"],
  ["governance_item", "approved_at"],
  ["data_specification", "approved_by"],
  ["data_specification", "approved_at"],
  ["phase_note", "status"],
  ["editorial_line", "text"],
  ["inst_section", "body"],
  ["section_block", "body"],
  ["specimen", "source"],
  ["process", "updated_by"],
  ["policy_ack", "owner_user_id"],
  ["policy_ack", "accepted_at"],
];

/** Tabelas onde a pendência é o proprio estado (status), não uma coluna vazia. */
export const ESTADOS_ALVO = [
  ["content_text", "status", "rascunho"],
  ["kernel_atom", "status", "candidato"],
  ["kernel_claim", "status", "candidato"],
  ["business_rule", "status", "rascunho"],
  ["ai_control", "status", "rascunho"],
  ["governance_item", "status", "rascunho"],
  ["data_specification", "status", "rascunho"],
];

/**
 * Colunas cujo valor é um caminho, não um título. Não é "vazio": é um valor
 * errado. A 0037 troca por DERBY e o portão exige que não volte.
 */
export const COLUNAS_CAMINHO = [["content_text", "title"]];

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

/** Toda coluna textual do schema, com a contagem de pendência. */
export async function varrerPendencias(db) {
  const colunas = await db.query(
    `select table_name, column_name
     from information_schema.columns
     where table_schema = 'public'
       and data_type in ('text', 'character varying', 'character')
     order by table_name, column_name`,
  );
  const achados = [];
  for (const coluna of colunas.rows) {
    const contagem = await db.query(
      `select count(*)::int as n
       from "${coluna.table_name}"
       where "${coluna.column_name}" is null or btrim("${coluna.column_name}") = ''`,
    );
    const n = contagem.rows[0].n;
    if (n === 0) continue;
    const total = await db.query(`select count(*)::int as n from "${coluna.table_name}"`);
    const linhas = total.rows[0].n;
    const preenchidas = linhas - n;
    achados.push({
      tabela: coluna.table_name,
      coluna: coluna.column_name,
      pendentes: n,
      linhas,
      preenchidas,
      // Vazio por projeto: o modelo tem várias colunas para o mesmo destino e
      // só uma é preenchida por linha (discriminador), ou a coluna ninguém usa.
      classificacao: preenchidas === 0 ? "coluna-sem-uso" : "discriminador",
      alvo: COLUNAS_ALVO.some(
        ([t, c]) => t === coluna.table_name && c === coluna.column_name,
      ),
    });
  }
  return achados;
}

/** Estados que ainda não foram normalizados. */
export async function varrerEstados(db) {
  const achados = [];
  for (const [tabela, coluna, valor] of ESTADOS_ALVO) {
    const contagem = await db.query(
      `select count(*)::int as n from "${tabela}" where "${coluna}" = $1`,
      [valor],
    );
    if (contagem.rows[0].n > 0) {
      achados.push({ tabela, coluna, estado: valor, pendentes: contagem.rows[0].n });
    }
  }
  return achados;
}

/** Colunas que guardam um caminho onde deveria estar um texto. */
export async function varrerCaminhos(db) {
  const achados = [];
  for (const [tabela, coluna] of COLUNAS_CAMINHO) {
    const contagem = await db.query(
      `select count(*)::int as n from "${tabela}" where btrim("${coluna}") like '/%'`,
    );
    if (contagem.rows[0].n > 0) {
      achados.push({ tabela, coluna, pendentes: contagem.rows[0].n });
    }
  }
  return achados;
}

/** O marcador DERBY está presente onde a pendência foi normalizada? */
export async function contarMarcador(db) {
  const contagem = await db.query(
    `select
       (select count(*)::int from source_tool where version = $1) as source_tool,
       (select count(*)::int from content_text where body = $1) as content_text,
       (select count(*)::int from content_text where review_state = $1) as content_text_revisao,
       (select count(*)::int from locale where label <> id) as locale,
       (select count(*)::int from kernel_atom where admitted_by = $2) as kernel_atom,
       (select count(*)::int from business_rule where approved_by = $2) as business_rule,
       (select count(*)::int from ai_control where approved_by = $2) as ai_control,
       (select count(*)::int from governance_item where approved_by = $2) as governance_item,
       (select count(*)::int from data_specification where approved_by = $2) as data_specification,
       (select count(*)::int from phase_note where status = $1) as phase_note,
       (select count(*)::int from editorial_line where text = $1) as editorial_line,
       (select count(*)::int from inst_section where body = $1) as inst_section,
       (select count(*)::int from section_block where body = $1) as section_block,
       (select count(*)::int from specimen where source = $1) as specimen`,
    [MARCADOR, RESPONSAVEL],
  );
  return contagem.rows[0];
}

export async function auditar(db) {
  const pendencias = await varrerPendencias(db);
  const estados = await varrerEstados(db);
  const caminhos = await varrerCaminhos(db);
  const marcador = await contarMarcador(db);

  const violacoes = [];
  for (const achado of pendencias) {
    if (achado.alvo) {
      violacoes.push({
        tipo: "pendencia-nao-preenchida",
        tabela: achado.tabela,
        coluna: achado.coluna,
        detalhe: `${achado.pendentes} linhas com "${achado.coluna}" vazio em "${achado.tabela}" — era para receber ${MARCADOR}.`,
      });
    }
  }
  for (const achado of estados) {
    violacoes.push({
      tipo: "estado-retido",
      tabela: achado.tabela,
      coluna: achado.coluna,
      detalhe: `${achado.pendentes} linhas de "${achado.tabela}" ainda em "${achado.estado}" — nada fica retido.`,
    });
  }
  for (const achado of caminhos) {
    violacoes.push({
      tipo: "valor-caminho",
      tabela: achado.tabela,
      coluna: achado.coluna,
      detalhe: `${achado.pendentes} linhas de "${achado.tabela}" com "${achado.coluna}" preenchido com caminho — é título, não rota.`,
    });
  }

  const estruturais = pendencias.filter((p) => !p.alvo);
  return { violacoes, pendencias, estados, caminhos, marcador, estruturais };
}

export function formatar(relatorio) {
  const linhas = [];
  const m = relatorio.marcador;
  linhas.push(`[derby] DERBY em source_tool:        ${m.source_tool}`);
  linhas.push(`[derby] DERBY em content_text:      ${m.content_text} (corpo) + ${m.content_text_revisao} (revisao)`);
  linhas.push(`[derby] rotulo real de locale:      ${m.locale}`);
  linhas.push(`[derby] DERBY em phase_note:        ${m.phase_note}`);
  linhas.push(`[derby] DERBY em editorial_line:    ${m.editorial_line}`);
  linhas.push(`[derby] DERBY em inst_section:      ${m.inst_section}`);
  linhas.push(`[derby] DERBY em section_block:     ${m.section_block}`);
  linhas.push(`[derby] DERBY em specimen:          ${m.specimen}`);
  linhas.push(`[derby] admito por normalizacao:   atom=${m.kernel_atom} regra=${m.business_rule} controle=${m.ai_control} governanca=${m.governance_item} dicionario=${m.data_specification}`);
  if (relatorio.estruturais.length) {
    linhas.push(`[derby] vazio do proprio modelo (${relatorio.estruturais.length} colunas, nao e pendencia):`);
    for (const p of relatorio.estruturais) {
      linhas.push(
        `  ${p.classificacao} ${p.tabela}.${p.coluna}: ${p.pendentes} de ${p.linhas} linhas vazias`,
      );
    }
  }
  for (const violacao of relatorio.violacoes) {
    linhas.push(`  VIOLAÇÃO ${violacao.tabela}.${violacao.coluna ?? ""}: ${violacao.detalhe}`);
  }
  return linhas.join("\n");
}

async function principal() {
  const argumentos = process.argv.slice(2);
  const selfTest = argumentos.includes("--self-test");
  const json = argumentos.includes("--json");

  const { db, migrations } = await abrirBanco();
  let relatorio = await auditar(db);

  if (selfTest) {
    console.log("[self-test] quebro DUAS coisas de proposito:");
    await db.query("update source_tool set version = '' where slug = (select slug from source_tool limit 1)");
    await db.query("update content_text set body = '' where slug = (select slug from content_text limit 1)");
    await db.query("update content_text set title = '/caminho/errado' where slug = (select slug from content_text where locale = 'pt-BR' limit 1)");
    relatorio = await auditar(db);
    console.log(formatar(relatorio));
    const acusou = relatorio.violacoes.some((v) => v.tipo === "pendencia-nao-preenchida");
    const acusouCaminho = relatorio.violacoes.some((v) => v.tipo === "valor-caminho");
    const ok = acusou && acusouCaminho;
    console.log(
      ok
        ? "[self-test] ok: o portão falhou e nomeou a coluna e o caminho."
        : "[self-test] FALHA: o portão não acusou a pendência.",
    );
    process.exit(ok ? 0 : 1);
  }

  console.log(formatar(relatorio));
  await writeFile(
    arquivoRelatorio,
    JSON.stringify({ migrations: migrations.length, ...relatorio }, null, 2),
  );
  if (json) console.log(JSON.stringify(relatorio, null, 2));
  process.exit(relatorio.violacoes.length === 0 ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await principal();
}
