/**
 * Portão do DERBY.
 *
 * A ordem do dono: todo campo pendente recebe o valor literal DERBY e nada fica
 * retido. Este script:
 *   - aplica todas as migrations (a 0037 faz a normalização) num PGlite em memória;
 *   - varre TODA coluna textual de TODA tabela procurando pendência (null ou vazio);
 *   - separa o que é PENDÊNCIA REAL (violação) do que é o vazio do próprio
 *     modelo — e a separação é por DECLARAÇÃO com razão, não por estatística:
 *     coluna sem declaração é pendência e vira violação.
 *
 * uso: node scripts/preencher-derby.mjs [--check] [--self-test] [--json]
 *
 * O --check é o modo padrão: o portão sempre roda e o código de saída é 1
 * quando há violação. --self-test quebra o banco de propósito e prova que o
 * portão acusa, nomeando a tabela e a coluna. Modo desconhecido é erro (2).
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
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

/**
 * Colunas cujo vazio é o DESENHO do modelo — com a razão de cada uma.
 *
 * Antes, o portão deduzia isso por estatística ("algumas linhas preenchidas
 * => discriminador"), e estatística é desculpa: uma coluna com pendência
 * escondida passava por estrutural só porque o irmão tinha valor. Aqui a
 * afirmação é explícita e datada: se a coluna não está nesta lista, o vazio
 * dela é PENDÊNCIA e o portão acusa. Declaração sem pendência é obsolescente
 * e também vira violação — a lista não pode apodrecer em silêncio.
 *
 * A razão aponta a prova (o código que lê, a migration que grava, o dicionário
 * que declara), não a aparência do dado.
 */
export const DECLARACOES_ESTRUTURAIS = {
  "catalog_item.dest_id":
    "item de catálogo: ou aponta para um destino (dest_id) ou é um arquivo/seção da biblioteca — uma forma por linha",
  "catalog_item.file":
    "item de catálogo que é arquivo da biblioteca; item de link não tem arquivo (o hash e o nome do arquivo andam juntos)",
  "catalog_item.hash": "sha256 do arquivo: existe só quando o item é arquivo",
  "catalog_item.icon": "ícone do item de ferramenta ou seção; item de arquivo não tem",
  "catalog_item.section": "seção de destino do item; item de arquivo não tem",
  "catalog_item.slug": "slug do destino do item; item de arquivo não tem",
  "content_object.tool_slug":
    "o objeto carrega o instrumento quando é ferramenta; página e institucional não têm",
  "content_place.inst_path":
    "o lugar é uma página canônica (object_slug) ou uma página legada (inst_path) — um dos dois, nunca os dois",
  "content_place.object_slug":
    "o lugar é uma seção (section_slug) ou um objeto canônico (object_slug) — um dos dois, nunca os dois",
  "content_place.section_slug":
    "o lugar é uma seção (section_slug) ou um objeto canônico (object_slug) — um dos dois, nunca os dois",
  "data_specification.unit": "a unidade só existe para característica mensurável",
  "inst_child.path":
    "caminho do pai: '' é a raiz da árvore — o app lê e ignora explicitamente `child.path !== ''` (src/lib/stored.functions.ts:367)",
  "inst_page.path":
    "caminho da página: '' é a raiz institucional (kind='hub'); as demais carregam o próprio nome",
  "inst_section.path":
    "caminho da página dona da seção: '' são as seções da raiz institucional (kind='hub')",
  "kernel_atom.source_canonical_id":
    "o átomo aponta para a fonte canônica registrada; átomo de metamodelo interno não tem fonte externa (o registry cai no id do átomo, src/core/registry/source-registry.ts:159) e a coluna é opcional no dicionário (0038, required=false)",
  "nav_item.dest_hash": "o destino do item de menu é um entre: hash, slug, caminho, modelo ou id — uma forma por linha",
  "nav_item.dest_model": "o destino do item de menu é um entre: hash, slug, caminho, modelo ou id — uma forma por linha",
  "nav_item.dest_slug": "o destino do item de menu é um entre: hash, slug, caminho, modelo ou id — uma forma por linha",
  "nav_item.dest_to": "o destino do item de menu é um entre: hash, slug, caminho, modelo ou id — uma forma por linha",
  "nav_item.parent_id": "item de menu raiz não tem pai",
  "nav_item.tone": "tom visual é opcional: só o item em destaque o carrega",
  "schema_column.ref_entity": "a referência só existe quando a coluna é entidade",
  "schema_column.unit": "a unidade só existe para coluna mensurável",
  "schema_entity.links": "entidade sem ligação declarada a outra",
  "screen_dest.hash": "o destino da tela é um entre: hash, slug, caminho, modelo, lugar ou instrumento — uma forma por linha",
  "screen_dest.model_id": "o destino da tela é um entre: hash, slug, caminho, modelo, lugar ou instrumento — uma forma por linha",
  "screen_dest.page_to": "o destino da tela é um entre: hash, slug, caminho, modelo, lugar ou instrumento — uma forma por linha",
  "screen_dest.place_id": "o destino da tela é um entre: hash, slug, caminho, modelo, lugar ou instrumento — uma forma por linha",
  "screen_dest.tool_slug": "o destino da tela é um entre: hash, slug, caminho, modelo, lugar ou instrumento — uma forma por linha",
  "section_link.dest_hash":
    "o link aponta para um destino; a forma preenchida é uma das seis — ou o link é só texto, sem destino",
  "section_link.dest_id":
    "o link aponta para um destino; a forma preenchida é uma das seis — ou o link é só texto, sem destino",
  "section_link.dest_kind":
    "o link aponta para um destino; a forma preenchida é uma das seis — ou o link é só texto, sem destino",
  "section_link.dest_model":
    "o link aponta para um destino; a forma preenchida é uma das seis — ou o link é só texto, sem destino",
  "section_link.dest_slug":
    "o link aponta para um destino; a forma preenchida é uma das seis — ou o link é só texto, sem destino",
  "section_link.dest_to":
    "o link aponta para um destino; a forma preenchida é uma das seis — ou o link é só texto, sem destino",
  "specimen_line.text":
    "campo opcional do espécime: a extração percorre um conjunto fixo de campos (id, title, subtitle, description, attributes) e o item sem vídeo fica sem duração — as '' são gravadas de propósito em migrations/0032_public_files.sql",
  "work_order.block_reason":
    "o motivo do bloqueio só existe quando o portão está fechado (gate_open = false)",
};

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
export async function varrerPendencias(db, declaracoes = DECLARACOES_ESTRUTURAIS) {
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
    const chave = `${coluna.table_name}.${coluna.column_name}`;
    const razao = declaracoes[chave] ?? null;
    const alvo = COLUNAS_ALVO.some(
      ([t, c]) => t === coluna.table_name && c === coluna.column_name,
    );
    achados.push({
      tabela: coluna.table_name,
      coluna: coluna.column_name,
      pendentes: n,
      linhas,
      preenchidas,
      // Classificação por DESENHO declarado, não por estatística: o vazio é
      // estrutural só se alguém declarou e justificou. Sem declaração, o
      // vazio é pendência — e pendência sem dono é violação.
      classificacao: alvo
        ? "alvo"
        : razao
          ? "estrutura-declarada"
          : "PENDENCIA-SEM-DECLARACAO",
      razao,
      alvo,
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

export async function auditar(db, opcoes = {}) {
  const declaracoes = opcoes.declaracoes ?? DECLARACOES_ESTRUTURAIS;
  const pendencias = await varrerPendencias(db, declaracoes);
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
    } else if (!achado.razao) {
      violacoes.push({
        tipo: "pendencia-sem-declaracao",
        tabela: achado.tabela,
        coluna: achado.coluna,
        detalhe: `${achado.pendentes} linhas com "${achado.coluna}" vazio em "${achado.tabela}" e NINGUÉM declarou que esse vazio é do desenho. Declare com a razão, ou preencha com ${MARCADOR}.`,
      });
    }
  }
  // Declaração que não corresponde mais ao banco: a coluna sumiu, ou a
  // pendência foi resolvida. A lista não pode apodrecer em silêncio.
  for (const [chave, razao] of Object.entries(declaracoes)) {
    const [tabela, coluna] = chave.split(".");
    const achado = pendencias.find((p) => p.tabela === tabela && p.coluna === coluna);
    const alvo = COLUNAS_ALVO.some(([t, c]) => t === tabela && c === coluna);
    if (alvo) {
      // Contradição: a coluna recebe o marcador e ao mesmo tempo é declarada
      // como vazio do desenho. Uma das duas afirmações é mentira.
      violacoes.push({
        tipo: "declaracao-conflita",
        tabela,
        coluna,
        detalhe: `"${chave}" está ao mesmo tempo na lista de alvos (recebe ${MARCADOR}) e declarada como estrutural (${razao}). Escolha um dos dois.`,
      });
      continue;
    }
    if (!achado) {
      violacoes.push({
        tipo: "declaracao-obsoleta",
        tabela,
        coluna,
        detalhe: `"${chave}" está declarada como estrutural (${razao}) mas não há mais pendência nessa coluna — ou a coluna saiu do schema, ou a pendência foi resolvida. Atualize a lista.`,
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

  const estruturais = pendencias.filter((p) => p.classificacao === "estrutura-declarada");
  const semDeclaracao = pendencias.filter((p) => p.classificacao === "PENDENCIA-SEM-DECLARACAO");
  return { violacoes, pendencias, estados, caminhos, marcador, estruturais, semDeclaracao };
}

/**
 * O portão: audita e diz o código de saída. É a função que o `--check` da
 * linha de comando chama — o mesmo caminho, sem atalho.
 */
export async function portao(db) {
  const relatorio = await auditar(db);
  return { relatorio, codigo: relatorio.violacoes.length === 0 ? 0 : 1 };
}

/** Modos aceitos. `--check` é o padrão: o portão sempre roda. */
export const MODOS = ["--check", "--self-test", "--json"];

export function parseArgumentos(argv) {
  const modos = new Set();
  for (const argumento of argv) {
    if (!MODOS.includes(argumento)) {
      return { modos, erro: `modo desconhecido: ${argumento} (aceitos: ${MODOS.join(", ")})` };
    }
    modos.add(argumento);
  }
  return { modos, erro: undefined };
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
    linhas.push(`[derby] vazio declarado como desenho (${relatorio.estruturais.length} colunas, com a razão de cada uma):`);
    for (const p of relatorio.estruturais) {
      linhas.push(
        `  ${p.tabela}.${p.coluna}: ${p.pendentes} de ${p.linhas} linhas vazias — ${p.razao}`,
      );
    }
  }
  if (relatorio.semDeclaracao?.length) {
    linhas.push(`[derby] PENDÊNCIA SEM DECLARAÇÃO (${relatorio.semDeclaracao.length} colunas):`);
    for (const p of relatorio.semDeclaracao) {
      linhas.push(`  ${p.tabela}.${p.coluna}: ${p.pendentes} de ${p.linhas} linhas vazias`);
    }
  }
  for (const violacao of relatorio.violacoes) {
    linhas.push(`  VIOLAÇÃO ${violacao.tabela}.${violacao.coluna ?? ""}: ${violacao.detalhe}`);
  }
  return linhas.join("\n");
}

async function principal() {
  const argumentos = process.argv.slice(2);
  const { modos, erro } = parseArgumentos(argumentos);
  if (erro) {
    console.error(`[derby] ${erro}`);
    process.exit(2);
  }
  const selfTest = modos.has("--self-test");
  const json = modos.has("--json");

  const { db, migrations } = await abrirBanco();
  let relatorio = await auditar(db);

  if (selfTest) {
    console.log("[self-test] quebro QUATRO coisas de proposito:");
    await db.query("update source_tool set version = '' where slug = (select slug from source_tool limit 1)");
    await db.query("update content_text set body = '' where slug = (select slug from content_text limit 1)");
    await db.query("update content_text set title = '/caminho/errado' where slug = (select slug from content_text where locale = 'pt-BR' limit 1)");
    await db.query("update content_text set status = 'rascunho' where slug = (select slug from content_text where locale = 'pt-BR' limit 1)");
    // Uma coluna nova, com pendência, e SEM declaração: é a prova de que o
    // portão não aceita "vazio estrutural" por deduzão — tem que vir escrito.
    await db.query("alter table content_text add column coluna_do_self_test text");
    await db.query("update content_text set coluna_do_self_test = ''");
    relatorio = await auditar(db);
    console.log(formatar(relatorio));
    const acusou = relatorio.violacoes.some((v) => v.tipo === "pendencia-nao-preenchida");
    const acusouCaminho = relatorio.violacoes.some((v) => v.tipo === "valor-caminho");
    const acusouEstado = relatorio.violacoes.some((v) => v.tipo === "estado-retido");
    const acusouSemDeclaracao = relatorio.violacoes.some(
      (v) => v.tipo === "pendencia-sem-declaracao" && v.coluna === "coluna_do_self_test",
    );
    const ok = acusou && acusouCaminho && acusouEstado && acusouSemDeclaracao;
    console.log(
      ok
        ? "[self-test] ok: o portão falhou e nomeou a pendência, o caminho, o estado retido e a coluna sem declaração."
        : "[self-test] FALHA: o portão não acusou uma das quatro quebras.",
    );
    process.exit(ok ? 0 : 1);
  }

  console.log(formatar(relatorio));
  // O veredito do portão não pode depender de o artefato conseguir ser gravado.
  // Sem isso, uma cópia sem a pasta artifacts/ derruba um banco bom.
  try {
    await mkdir(new URL("../artifacts/", import.meta.url), { recursive: true });
    await writeFile(
      arquivoRelatorio,
      JSON.stringify({ migrations: migrations.length, ...relatorio }, null, 2),
    );
  } catch (erro) {
    console.error(`[derby] não consegui gravar o relatório (o veredito acima vale): ${erro.message}`);
  }
  if (json) console.log(JSON.stringify(relatorio, null, 2));
  process.exit(relatorio.violacoes.length === 0 ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await principal();
}
