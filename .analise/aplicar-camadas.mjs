/**
 * Aplica a camada e a finalidade das 67 entradas nos dois lugares onde elas vivem:
 * src/lib/banco/indice.ts (o índice em código) e migrations/0036_indice_do_banco.sql
 * (as linhas do dicionário). Um lugar só mudado é o dicionário mentindo.
 */
import { readFile, writeFile } from "node:fs/promises";

/** Tabela → camada. A camada vem do domínio que o repo já nomeia nos produtos. */
const CAMADA = {
  // camada canônica: as 8 canonical_* e as duas de operação de arquivo.
  canonical_asset: "canonica",
  canonical_auto_review: "canonica",
  canonical_conflict: "canonica",
  canonical_conflict_source: "canonica",
  canonical_divergence: "canonica",
  canonical_migration_gap: "canonica",
  canonical_migration_recovered: "canonica",
  canonical_suggestion: "canonica",
  historia_nao_mesclada: "canonica",
  blob_conflict: "canonica",
  // camada de participação social.
  participation_process_candidate: "participacao",
  participation_statement_candidate: "participacao",
  participation_proposal_candidate: "participacao",
  participation_contribution_candidate: "participacao",
  participation_reaction_candidate: "participacao",
  participation_consensus_vote_candidate: "participacao",
  participation_outcome_candidate: "participacao",
  // camada de pesquisa.
  research_project_candidate: "pesquisa",
  research_instrument_candidate: "pesquisa",
  research_risk_candidate: "pesquisa",
  research_skill_need_candidate: "pesquisa",
  // as três que atravessam domínios ficam na camada que já existia.
  kernel_coluna_citada: "processo",
  mudanca_producao: "processo",
  review_item: "conteudo",
};

/** Finalidade corrigida: só o que o DDL sustenta. */
const PURPOSE = {
  canonical_asset:
    "Arquivo da camada canônica, com o tamanho, a impressão digital e o estado da revisão.",
  canonical_divergence:
    "Divergência entre camadas, com o código e o detalhe. O DDL não declara chave primária e o código se repete.",
  career_capability_governance_candidate:
    "Regras de uso de uma capacidade: identidade, consentimento, moderação, reporte, bloqueio, auditoria, retenção e idade.",
  career_ingestion_run_candidate:
    "Passagem de ingestão de uma fonte, com o que entrou, o que foi aceito, recusado e deduplicado.",
  career_module_candidate:
    "Módulo de carreira, com a classe de objeto e o público a que se destina.",
  career_projection_candidate: "Projeção de carreira, com a rota em que ela aparece.",
  career_source_candidate:
    "Fonte de carreira, com a autoridade, o direito de uso e a impressão digital do documento.",
  career_source_fragment_candidate:
    "Fragmento de uma fonte, com o localizador e a impressão digital do fragmento.",
  review_item:
    "Texto na fila de revisão, com o idioma de origem e a situação da revisão clínica.",
};

/** Chave primária corrigida: a que o DDL declara, ou a ausência declarada. */
const PRIMARY_KEY = {
  canonical_divergence: "sem chave primária",
};

// ── 1. src/lib/banco/indice.ts ────────────────────────────────────────────────
const caminhoIndice = new URL("../src/lib/banco/indice.ts", import.meta.url);
let indice = await readFile(caminhoIndice, "utf8");
const entradas = [...indice.matchAll(/  \{\n    name: "([a-z0-9_]+)",[\s\S]*?\n  \},?\n/g)];
let trocadasIndice = 0;
for (const achado of entradas) {
  const nome = achado[1];
  const camada = CAMADA[nome];
  const purpose = PURPOSE[nome];
  const primaryKey = PRIMARY_KEY[nome];
  if (!camada && !purpose && !primaryKey) continue;
  let bloco = achado[0];
  if (camada) bloco = bloco.replace(/    camada: "[^"]*",/, `    camada: "${camada}",`);
  if (purpose) bloco = bloco.replace(/    purpose: "[^"]*",/, `    purpose: "${purpose}",`);
  if (primaryKey) bloco = bloco.replace(/    primaryKey: "[^"]*",/, `    primaryKey: "${primaryKey}",`);
  indice = indice.replace(achado[0], bloco);
  trocadasIndice += 1;
}
await writeFile(caminhoIndice, indice);
console.log("indice.ts: entradas corrigidas:", trocadasIndice);

// ── 2. migrations/0036_indice_do_banco.sql ───────────────────────────────────
const caminhoSql = new URL("../migrations/0036_indice_do_banco.sql", import.meta.url);
let sql = await readFile(caminhoSql, "utf8");
const linhas = [...sql.matchAll(/^ {2}\('([a-z0-9_]+)', '([a-z]+)', '([^']*)', '([^']*)', '([^']*)', '([^']*)'\),?$/gm)];
let trocadasSql = 0;
for (const achado of linhas) {
  const nome = achado[1];
  const camada = CAMADA[nome];
  const purpose = PURPOSE[nome];
  const primaryKey = PRIMARY_KEY[nome];
  if (!camada && !purpose && !primaryKey) continue;
  const nova = `  ('${nome}', '${camada ?? achado[2]}', '${primaryKey ?? achado[3]}', '${
    purpose ?? achado[4]
  }', '${achado[5]}', '${achado[6]}'),`;
  sql = sql.replace(achado[0], nova);
  trocadasSql += 1;
}
await writeFile(caminhoSql, sql);
console.log("0036: linhas corrigidas:", trocadasSql);
