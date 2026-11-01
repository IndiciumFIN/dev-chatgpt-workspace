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

test("o gate bloqueia cobertura parcial mesmo quando labels existentes são válidas", () => {
  const report={violacoes:[],contagens:{
    tabelasDoBanco:166,tabelasNoDicionario:99,linhasNoIndice:99,
    tabelasComLabel:99,tabelasForaDoDicionario:67
  }};
  assert.equal(indexAuditReleaseAllowed(report), false);
  const full={...report,contagens:{...report.contagens,tabelasDoBanco:99,tabelasForaDoDicionario:0}};
  assert.equal(indexAuditReleaseAllowed(full), true);
  assert.equal(indexAuditReleaseAllowed({...full,violacoes:[{tipo:"label-vazia"}]}),false);
  assert.equal(indexAuditReleaseAllowed({...full,contagens:{...full.contagens,linhasNoIndice:98}}),false);
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
});
