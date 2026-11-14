/**
 * Portão do índice do banco — prova de que o portão sabe falhar.
 *
 * A regra do teste: cada caso quebra UMA coisa de propósito e exige que o
 * portão acuse, nomeando a tabela. Portão que passa em tudo não é garantia.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { abrirBanco, auditar, nomesDoIndice, indexAuditReleaseAllowed } from "./audit-indice-banco.mjs";

const rodar = promisify(execFile);
const caminhoPortao = new URL("./audit-indice-banco.mjs", import.meta.url).pathname;

let db;
let nomesIndice;

before(async () => {
  const aberto = await abrirBanco();
  db = aberto.db;
  nomesIndice = await nomesDoIndice();
});

after(async () => {
  await db?.close();
});

/** Quebra uma coisa, mede, e desfaz. Sem depender de rollback do PGlite. */
async function comQuebrado(quebra, medicao) {
  await quebra();
  try {
    await medicao();
  } finally {
    await db.query("update schema_entity set label = purpose where name = 'user'");
  }
}

/** Troca a label de uma tabela, mede, e devolve a label original. */
async function comLabelAlterada(tabela, valor, medicao) {
  const original = await db.query("select label from schema_entity where name = $1", [tabela]);
  const rotulo = original.rows[0]?.label;
  await db.query("update schema_entity set label = $2 where name = $1", [tabela, valor]);
  try {
    await medicao();
  } finally {
    await db.query("update schema_entity set label = $2 where name = $1", [tabela, rotulo]);
  }
}

/** Troca um campo do dicionário, mede, e devolve o valor original. */
async function comCampoAlterado(tabela, campo, valor, medicao) {
  const original = await db.query(`select ${campo} as valor from schema_entity where name = $1`, [tabela]);
  const guardado = original.rows[0]?.valor;
  await db.query(`update schema_entity set ${campo} = $2 where name = $1`, [tabela, valor]);
  try {
    await medicao();
  } finally {
    await db.query(`update schema_entity set ${campo} = $2 where name = $1`, [tabela, guardado]);
  }
}

/**
 * As 67 tabelas que nasceram fora do dicionário e foram fechadas por este
 * entregável. A lista vem do dump medido do schema (.analise/tabelas.json):
 * 43 career, 8 canonical, 7 participation, 4 research e 5 de operação.
 */
const TABELAS_RECENTES = [
  "career_application_candidate",
  "career_atomic_fact_candidate",
  "career_authority_binding_candidate",
  "career_capability_governance_candidate",
  "career_claim_candidate",
  "career_content_claim_binding_candidate",
  "career_credential_candidate",
  "career_document_template_candidate",
  "career_editorial_block_candidate",
  "career_editorial_candidate",
  "career_editorial_document_candidate",
  "career_evidence_bundle_candidate",
  "career_ingestion_run_candidate",
  "career_interview_scenario_candidate",
  "career_jurisdiction_requirement_candidate",
  "career_learning_resource_candidate",
  "career_learning_resource_type_candidate",
  "career_market_observation_candidate",
  "career_market_signal_candidate",
  "career_milestone_candidate",
  "career_module_candidate",
  "career_network_capability_candidate",
  "career_opportunity_candidate",
  "career_opportunity_type_candidate",
  "career_path_candidate",
  "career_path_step_candidate",
  "career_profile_candidate",
  "career_profile_credential_candidate",
  "career_profile_skill_candidate",
  "career_projection_candidate",
  "career_projection_contract_candidate",
  "career_projection_item_candidate",
  "career_publication_candidate",
  "career_reflection_question_candidate",
  "career_release_gate_candidate",
  "career_review_item_candidate",
  "career_role_candidate",
  "career_role_skill_candidate",
  "career_skill_candidate",
  "career_source_candidate",
  "career_source_fragment_candidate",
  "career_worklife_capability_candidate",
  "career_youth_activity_candidate",
  "canonical_asset",
  "canonical_auto_review",
  "canonical_conflict",
  "canonical_conflict_source",
  "canonical_divergence",
  "canonical_migration_gap",
  "canonical_migration_recovered",
  "canonical_suggestion",
  "participation_process_candidate",
  "participation_statement_candidate",
  "participation_proposal_candidate",
  "participation_contribution_candidate",
  "participation_reaction_candidate",
  "participation_consensus_vote_candidate",
  "participation_outcome_candidate",
  "research_project_candidate",
  "research_instrument_candidate",
  "research_risk_candidate",
  "research_skill_need_candidate",
  "historia_nao_mesclada",
  "mudanca_producao",
  "kernel_coluna_citada",
  "review_item",
  "blob_conflict",
];

/** O portão tem que barrar qualquer divergência, mesmo com as labels válidas. */
test("o gate bloqueia cobertura parcial mesmo quando labels existentes são válidas", () => {
  const report = {
    violacoes: [],
    contagens: {
      tabelasDoBanco: 166,
      tabelasNoDicionario: 166,
      linhasNoIndice: 166,
      tabelasComLabel: 166,
      tabelasForaDoDicionario: 0,
    },
  };
  assert.equal(indexAuditReleaseAllowed(report), true);
  // Qualquer divergência barra: falta uma tabela no dicionário, sobra uma no índice,
  // ou a cobertura parcial volta (as 67 que este entregável fechou).
  const parcial = {
    ...report,
    contagens: { ...report.contagens, tabelasNoDicionario: 99, tabelasForaDoDicionario: 67 },
  };
  assert.equal(indexAuditReleaseAllowed(parcial), false);
  const semIndice = { ...report, contagens: { ...report.contagens, linhasNoIndice: 165 } };
  assert.equal(indexAuditReleaseAllowed(semIndice), false);
  const semTabela = { ...report, contagens: { ...report.contagens, tabelasDoBanco: 165 } };
  assert.equal(indexAuditReleaseAllowed(semTabela), false);
  assert.equal(indexAuditReleaseAllowed({ ...report, violacoes: [{ tipo: "label-vazia" }] }), false);
});

test("o banco tem toda tabela do dicionário com nome de uso", async () => {
  const relatorio = await auditar(db, nomesIndice);
  assert.deepEqual(
    relatorio.violacoes,
    [],
    `violações no estado bom: ${JSON.stringify(relatorio.violacoes, null, 2)}`,
  );
  assert.equal(
    relatorio.contagens.tabelasDoBanco,
    relatorio.contagens.tabelasNoDicionario,
    "o dicionário tem que cobrir todas as tabelas do banco",
  );
  assert.equal(
    relatorio.contagens.linhasNoIndice,
    relatorio.contagens.tabelasNoDicionario,
    "o índice em código tem que ter uma linha por tabela do dicionário",
  );
  assert.equal(
    relatorio.contagens.tabelasComLabel,
    relatorio.contagens.tabelasNoDicionario,
    "toda tabela do dicionário tem label",
  );
});

test("sem label, o portão acusa e nomeia a tabela", async () => {
  let violacoes = [];
  await comLabelAlterada("tool_band", "", async () => {
    violacoes = (await auditar(db, nomesIndice)).violacoes;
  });
  const achado = violacoes.find((v) => v.tabela === "tool_band");
  assert.ok(achado, `o portão não acusou tool_band: ${JSON.stringify(violacoes)}`);
  assert.equal(achado.tipo, "label-vazia");
});

test("label igual ao nome técnico é violação", async () => {
  let violacoes = [];
  await comLabelAlterada("nav_item", "nav_item", async () => {
    violacoes = (await auditar(db, nomesIndice)).violacoes;
  });
  const achado = violacoes.find((v) => v.tabela === "nav_item");
  assert.ok(achado, `o portão não acusou nav_item: ${JSON.stringify(violacoes)}`);
  assert.equal(achado.tipo, "label-eco");
});

test("label gritada é violação", async () => {
  let violacoes = [];
  await comLabelAlterada("content_object", "OBJETOS DE CONTEUDO", async () => {
    violacoes = (await auditar(db, nomesIndice)).violacoes;
  });
  assert.ok(
    violacoes.some((v) => v.tabela === "content_object" && v.tipo === "label-gritada"),
    `o portão não acusou o grito: ${JSON.stringify(violacoes)}`,
  );
});

test("duas tabelas com a mesma label é violação", async () => {
  let violacoes = [];
  await comLabelAlterada("chrome_label", "Itens do menu", async () => {
    violacoes = (await auditar(db, nomesIndice)).violacoes;
  });
  assert.ok(
    violacoes.some((v) => v.tipo === "label-duplicada"),
    `o portão não acusou a duplicata: ${JSON.stringify(violacoes)}`,
  );
});

test("tabela do dicionário sem linha no índice é violação", async () => {
  const semAEntrada = nomesIndice.filter((nome) => nome !== "nav_item");
  const relatorio = await auditar(db, semAEntrada);
  assert.ok(
    relatorio.violacoes.some((v) => v.tipo === "indice-sem-tabela" && v.tabela === "nav_item"),
    `o portão não acusou a tabela fora do índice: ${JSON.stringify(relatorio.violacoes)}`,
  );
});

test("linha do índice sem tabela no dicionário é violação", async () => {
  const comFantasma = [...nomesIndice, "tabela_que_nao_existe"];
  const relatorio = await auditar(db, comFantasma);
  assert.ok(
    relatorio.violacoes.some((v) => v.tipo === "indice-tabela-inexistente"),
    `o portão não acusou a tabela fantasma: ${JSON.stringify(relatorio.violacoes)}`,
  );
});

test("o --self-test falha e nomeia a tabela que quebrou", async () => {
  const resultado = await rodar("node", [caminhoPortao, "--self-test"], {
    cwd: new URL("..", import.meta.url).pathname,
  }).catch((erro) => erro);
  const saida = `${resultado.stdout ?? ""}${resultado.stderr ?? ""}`;
  assert.match(saida, /self-test.*ok/i, `o self-test não se provou:\n${saida}`);
  assert.match(saida, /user/, `o self-test não nomeou a tabela quebrada:\n${saida}`);
  assert.match(saida, /canonical_asset/, `o self-test não exercitou a finalidade:\n${saida}`);
  assert.match(saida, /canonical_divergence/, `o self-test não exercitou a chave:\n${saida}`);
});

test("finalidade vazia é violação", async () => {
  let violacoes = [];
  await comCampoAlterado("canonical_asset", "purpose", "", async () => {
    violacoes = (await auditar(db, nomesIndice)).violacoes;
  });
  const achado = violacoes.find((v) => v.tabela === "canonical_asset");
  assert.ok(achado, `o portão não acusou a finalidade vazia: ${JSON.stringify(violacoes)}`);
  assert.equal(achado.tipo, "finalidade-vazia");
});

test("chave primária que o DDL não declara é violação", async () => {
  let violacoes = [];
  await comCampoAlterado("canonical_divergence", "primary_key", "code", async () => {
    violacoes = (await auditar(db, nomesIndice)).violacoes;
  });
  const achado = violacoes.find((v) => v.tabela === "canonical_divergence");
  assert.ok(achado, `o portão não acusou a chave inventada: ${JSON.stringify(violacoes)}`);
  assert.equal(achado.tipo, "chave-primaria-inventada");
});

test("chave primária diferente da do DDL é violação", async () => {
  let violacoes = [];
  await comCampoAlterado("tool_band", "primary_key", "id", async () => {
    violacoes = (await auditar(db, nomesIndice)).violacoes;
  });
  const achado = violacoes.find((v) => v.tabela === "tool_band");
  assert.ok(achado, `o portão não acusou a chave divergente: ${JSON.stringify(violacoes)}`);
  assert.equal(achado.tipo, "chave-primaria-divergente");
});

test("as 67 tabelas novas estão no dicionário, com nome de uso e finalidade", async () => {
  assert.equal(TABELAS_RECENTES.length, 67);
  const entidades = await db.query(
    "select name, label, purpose, primary_key from schema_entity where name = any($1)",
    [TABELAS_RECENTES],
  );
  const porNome = new Map(entidades.rows.map((linha) => [linha.name, linha]));
  for (const nome of TABELAS_RECENTES) {
    const entidade = porNome.get(nome);
    assert.ok(entidade, `a tabela "${nome}" não está no dicionário`);
    assert.ok(String(entidade.label ?? "").trim(), `a tabela "${nome}" está sem nome de uso`);
    assert.notEqual(entidade.label, nome, `a tabela "${nome}" tem o nome técnico como nome de uso`);
    assert.ok(String(entidade.purpose ?? "").trim(), `a tabela "${nome}" está sem finalidade`);
    assert.ok(
      nomesIndice.includes(nome),
      `a tabela "${nome}" não tem linha em src/lib/banco/indice.ts`,
    );
  }
  const relatorio = await auditar(db, nomesIndice);
  assert.deepEqual(relatorio.violacoes, [], "as 67 não podem deixar violação para trás");
  assert.equal(relatorio.contagens.tabelasForaDoDicionario, 0);
});
