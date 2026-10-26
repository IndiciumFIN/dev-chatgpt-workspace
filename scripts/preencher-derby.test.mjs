/**
 * Portão do DERBY — prova de que o portão sabe falhar.
 *
 * A regra do teste: cada caso quebra UMA coisa de propósito e exige que o
 * portão acuse, nomeando a coluna. Portão que passa em tudo não é garantia.
 *
 * E a regra do contrato: a lista de colunas e estados que o portão exige é a
 * mesma que a migration preenche. Se alguém trocar uma sem a outra, o teste
 * acusa. Contrato escrito à mão mente; contrato amarrado ao código não.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import {
  abrirBanco,
  auditar,
  COLUNAS_ALVO,
  ESTADOS_ALVO,
  COLUNAS_CAMINHO,
  MARCADOR,
  RESPONSAVEL,
} from "./preencher-derby.mjs";

const rodar = promisify(execFile);
const caminhoPortao = new URL("./preencher-derby.mjs", import.meta.url).pathname;
const caminhoMigration = new URL("../migrations/0037_preencher_derby.sql", import.meta.url);

let db;

before(async () => {
  const aberto = await abrirBanco();
  db = aberto.db;
});

after(async () => {
  await db?.close();
});

/** Quebra uma coisa, mede, e desfaz explicitamente. Sem depender de rollback. */
async function comQuebrado(quebra, desfaz, medicao) {
  await quebra();
  try {
    return await medicao();
  } finally {
    await desfaz();
  }
}

test("no estado bom, o portão não acusa nada", async () => {
  const relatorio = await auditar(db);
  assert.deepEqual(
    relatorio.violacoes,
    [],
    `violações no estado bom: ${JSON.stringify(relatorio.violacoes, null, 2)}`,
  );
});

test("a lista do portão é a mesma que a migration preenche", async () => {
  const migration = [
    await readFile(caminhoMigration, "utf8"),
    await readFile(new URL("../migrations/0041_passa_de_aprovacao.sql", import.meta.url), "utf8"),
  ].join("\n");
  // Um comando conta quando a tabela e a coluna aparecem no MESMO comando.
  const comandos = migration.split(";").map((comando) => comando.toLowerCase());
  const falaSobre = (tabela, coluna) =>
    comandos.some(
      (comando) =>
        comando.includes(tabela.toLowerCase()) && comando.includes(coluna.toLowerCase()),
    );
  for (const [tabela, coluna] of COLUNAS_ALVO) {
    assert.ok(
      falaSobre(tabela, coluna),
      `o portão exige ${tabela}.${coluna} e nenhuma migration preenche`,
    );
  }
  for (const [tabela, coluna, valor] of ESTADOS_ALVO) {
    assert.ok(
      falaSobre(tabela, coluna),
      `o portão exige o estado de ${tabela}.${coluna} e nenhuma migration mexe nele`,
    );
    assert.ok(
      comandos.some(
        (comando) =>
          comando.includes(tabela.toLowerCase()) &&
          comando.includes(coluna.toLowerCase()) &&
          comando.includes(valor.toLowerCase()),
      ),
      `o portão exige que ${tabela}.${coluna} saia de "${valor}" e nenhuma migration menciona esse estado`,
    );
  }
  for (const [tabela, coluna] of COLUNAS_CAMINHO) {
    assert.ok(
      falaSobre(tabela, coluna),
      `o portão exige ${tabela}.${coluna} e nenhuma migration mexe nela`,
    );
  }
});

test("campo pendente sem DERBY: o portão acusa e nomeia a coluna", async () => {
  let violacoes = [];
  await comQuebrado(
    () => db.query("update source_tool set version = '' where slug = 'braden'"),
    () => db.query("update source_tool set version = $1 where slug = 'braden'", [MARCADOR]),
    async () => {
      violacoes = (await auditar(db)).violacoes;
    },
  );
  const achado = violacoes.find((v) => v.tabela === "source_tool" && v.coluna === "version");
  assert.ok(achado, `o portão não acusou source_tool.version: ${JSON.stringify(violacoes)}`);
  assert.equal(achado.tipo, "pendencia-nao-preenchida");
});

test("estado retido: o portão acusa e nomeia a tabela", async () => {
  let violacoes = [];
  await comQuebrado(
    () => db.query("update content_text set status = 'rascunho' where slug = 'missao' and locale = 'pt-BR'"),
    () => db.query("update content_text set status = 'publicado' where slug = 'missao' and locale = 'pt-BR'"),
    async () => {
      violacoes = (await auditar(db)).violacoes;
    },
  );
  const achado = violacoes.find((v) => v.tipo === "estado-retido" && v.tabela === "content_text");
  assert.ok(achado, `o portão não acusou o rascunho: ${JSON.stringify(violacoes)}`);
});

test("marcador apagado: o portão acusa a coluna sem dono", async () => {
  let violacoes = [];
  await comQuebrado(
    () => db.query("update kernel_atom set admitted_by = null where id = (select id from kernel_atom limit 1)"),
    () => db.query("update kernel_atom set admitted_by = $1 where id = (select id from kernel_atom limit 1)", [RESPONSAVEL]),
    async () => {
      violacoes = (await auditar(db)).violacoes;
    },
  );
  const achado = violacoes.find((v) => v.tabela === "kernel_atom" && v.coluna === "admitted_by");
  assert.ok(achado, `o portão não acusou o marcador apagado: ${JSON.stringify(violacoes)}`);
});

test("título que é caminho: o portão acusa", async () => {
  let violacoes = [];
  await comQuebrado(
    () => db.query("update content_text set title = '/caminho/errado' where slug = 'missao' and locale = 'pt-BR'"),
    () => db.query("update content_text set title = $1 where slug = 'missao' and locale = 'pt-BR'", [MARCADOR]),
    async () => {
      violacoes = (await auditar(db)).violacoes;
    },
  );
  const achado = violacoes.find((v) => v.tipo === "valor-caminho" && v.tabela === "content_text");
  assert.ok(achado, `o portão não acusou o caminho: ${JSON.stringify(violacoes)}`);
});

test("nada fica retido: nenhuma linha fica em rascunho nem candidata", async () => {
  const relatorio = await auditar(db);
  assert.deepEqual(relatorio.estados, [], `estados retidos: ${JSON.stringify(relatorio.estados)}`);
});

test("o marcador DERBY é o que está no campo, não um valor inventado", async () => {
  const contagem = await db.query(
    `select
       (select count(*)::int from source_tool where version = $1) as version,
       (select count(*)::int from source_tool where evidence = $1) as evidence,
       (select count(*)::int from source_tool where band_from = $1) as band_from`,
    [MARCADOR],
  );
  const linha = contagem.rows[0];
  assert.equal(linha.version, 82, "todo instrumento tem versão declarada");
  assert.equal(linha.evidence, 82, "todo instrumento tem evidência declarada");
  assert.equal(linha.band_from, 82, "todo instrumento tem a faixa declarada");
});

test("o idioma tem nome: o rótulo nunca é o próprio código", async () => {
  const ecoados = await db.query("select id, label from locale where label = id");
  assert.deepEqual(ecoados.rows, [], `idioma com rótulo-eco: ${JSON.stringify(ecoados.rows)}`);
  const nomes = await db.query("select count(*)::int as n from locale where label is not null and btrim(label) <> ''");
  assert.equal(nomes.rows[0].n, 31, "todo idioma tem nome");
});

test("o --self-test falha e nomeia a coluna que quebrou", async () => {
  const resultado = await rodar("node", [caminhoPortao, "--self-test"], {
    cwd: new URL("..", import.meta.url).pathname,
  }).catch((erro) => erro);
  const saida = `${resultado.stdout ?? ""}${resultado.stderr ?? ""}`;
  assert.match(saida, /self-test.*ok/i, `o self-test não se provou:\n${saida}`);
  assert.match(saida, /version/, `o self-test não nomeou a coluna quebrada:\n${saida}`);
});
