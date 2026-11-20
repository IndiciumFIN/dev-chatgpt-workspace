#!/usr/bin/env node
/**
 * Teste do portão da recuperação da fonte.
 *
 * O portão afirma que o texto no banco é o texto da fonte, caractere a
 * caractere. Essa afirmação só vale se o portão ACUSAR quando o texto
 * diverge — e é exatamente aí que portão de texto mente: um gate que só
 * confere "não está vazio" passa com texto inventado.
 *
 * Cada teste quebra uma coisa de propósito e exige a acusação. Um banco
 * PGlite em memória por arquivo: mutação que morre com a instância, e o
 * banco de verdade nunca é tocado.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { abrirBanco, MARCADOR } from "./preencher-derby.mjs";
import { auditar } from "./auditar-fonte.mjs";

const MAPA = new URL("../mappings/recuperacao-fonte.json", import.meta.url);

let db;
let mapa;
let caminhoRecuperado;
let posicaoRecuperada;
let textoRecuperado;

before(async () => {
  ({ db } = await abrirBanco());
  mapa = JSON.parse(await readFile(MAPA, "utf8"));
  // Uma correspondência real do mapa: uma seção que foi recuperada da fonte.
  const primeira = mapa.correspondencias[0];
  caminhoRecuperado = primeira.path;
  posicaoRecuperada = primeira.position;
  const linha = await db.query(
    "select body from inst_section where path = $1 and position = $2",
    [caminhoRecuperado, posicaoRecuperada],
  );
  textoRecuperado = linha.rows[0]?.body ?? "";
});

after(async () => {
  if (db) await db.close();
});

test("o portão passa no estado real: o texto publicado é o da fonte", async () => {
  const relatorio = await auditar(db);
  assert.equal(
    relatorio.violacoes.length,
    0,
    `violações inesperadas:\n${JSON.stringify(relatorio.violacoes, null, 2)}`,
  );
  assert.ok(relatorio.recuperadas > 0, "nenhuma correspondência declarada");
  assert.ok(relatorio.secoesComTexto > 0, "nenhuma seção com texto");
});

test("texto divergente da fonte é acusado, com o tamanho dos dois lados", async () => {
  await db.query(
    `update inst_section set body = 'texto inventado pelo teste' where path = $1 and position = $2`,
    [caminhoRecuperado, posicaoRecuperada],
  );
  const relatorio = await auditar(db);
  await db.query(
    `update inst_section set body = $3 where path = $1 and position = $2`,
    [caminhoRecuperado, posicaoRecuperada, textoRecuperado],
  );
  const violacao = relatorio.violacoes.find((v) => v.tipo === "texto-divergente-da-fonte");
  assert.ok(violacao, "o portão aceitou um texto que não é o da fonte");
  assert.match(violacao.detalhe, /caracteres/, "a violação não diz quanto o banco tem e quanto a fonte tem");
});

test("gancho do autor remanescente é acusado", async () => {
  await db.query(
    `update inst_section set body = 'SUPORTE FINANCEIRO: PENDENTE' where path = $1 and position = $2`,
    [caminhoRecuperado, posicaoRecuperada],
  );
  const relatorio = await auditar(db);
  await db.query(
    `update inst_section set body = $3 where path = $1 and position = $2`,
    [caminhoRecuperado, posicaoRecuperada, textoRecuperado],
  );
  assert.ok(
    relatorio.violacoes.some((v) => v.tipo === "gancho-pendente-sobrou"),
    "o portão deixou passar o gancho 'PENDENTE'",
  );
});

test("pendência sem nome é aguda: fica com o marcador e ninguém nomeia o achado", async () => {
  // Uma seção que NÃO é achado nomeado vira pendência: o portão tem que
  // exigir que alguém a nomeie.
  const nomeados = new Set(mapa.pendenciasSemCorrespondencia.map((p) => `${p.path}#${p.position}`));
  const correspondidas = new Set(mapa.correspondencias.map((c) => `${c.path}#${c.position}`));
  const alvo = await db.query(
    `select path, position, body from inst_section
     where body <> $1 order by path, position`,
    [MARCADOR],
  );
  const linha = alvo.rows.find(
    (r) => !nomeados.has(`${r.path}#${r.position}`) && !correspondidas.has(`${r.path}#${r.position}`),
  );
  if (!linha) return; // tudo nomeado: nada a provar aqui
  await db.query(
    `update inst_section set body = $3 where path = $1 and position = $2`,
    [linha.path, linha.position, MARCADOR],
  );
  const relatorio = await auditar(db);
  await db.query(
    `update inst_section set body = $3 where path = $1 and position = $2`,
    [linha.path, linha.position, linha.body],
  );
  assert.ok(
    relatorio.violacoes.some((v) => v.tipo === "pendencia-sem-nome"),
    "o portão aceitou uma pendência que ninguém nomeou",
  );
});

test("achado obsoleto é acusado: o achado continua na tabela mas a pendência sumiu", async () => {
  const achado = mapa.pendenciasSemCorrespondencia[0];
  if (!achado) return;
  const linha = await db.query(
    "select body from inst_section where path = $1 and position = $2",
    [achado.path, achado.position],
  );
  const original = linha.rows[0]?.body ?? MARCADOR;
  await db.query(
    `update inst_section set body = $3 where path = $1 and position = $2`,
    [achado.path, achado.position, "texto que substitui a pendência"],
  );
  const relatorio = await auditar(db);
  await db.query(
    `update inst_section set body = $3 where path = $1 and position = $2`,
    [achado.path, achado.position, original],
  );
  assert.ok(
    relatorio.violacoes.some((v) => v.tipo === "achado-obsoleto"),
    "o portão aceitou um achado obsoleto",
  );
});
