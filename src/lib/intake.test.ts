import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import type { Sql } from "./db.ts";
import { classifyPath, gravarLote, idDoLote, suggestFromHead, suggestionOf } from "./intake.ts";

test("a capa governada entra e o idioma irmão espera", () => {
  assert.equal(classifyPath("braden.html").verdict, "admitir");
  assert.equal(classifyPath("en/braden.html").verdict, "espera");
  assert.equal(classifyPath("en/braden.html").locale, "en");
  assert.equal(classifyPath("es/braden.html").module, "instrumento");
});

test("catálogo protegido, cache e mídia não viram conteúdo", () => {
  assert.equal(classifyPath("banco_nanda.json").verdict, "recusar");
  assert.equal(classifyPath("banco_nanda_en.json").module, "catalogo");
  assert.equal(classifyPath(".tradutor_cache/en/braden.html").verdict, "recusar");
  assert.equal(classifyPath("img/braden.webp").verdict, "recusar");
});

test("a sugestão tira título e descrição e não nasce de arquivo recusado", () => {
  const head = `<title>\nCalculadora da Escala de Braden\n</title><meta content="Calcule a Escala de Braden." name="description"/>`;
  assert.equal(suggestFromHead(head).title, "Calculadora da Escala de Braden");
  assert.equal(suggestFromHead(head).lead, "Calcule a Escala de Braden.");
  assert.equal(suggestionOf("banco_nanda.json", classifyPath("banco_nanda.json"), head), null);
  assert.equal(suggestionOf("en/braden.html", classifyPath("en/braden.html"), "<html></html>")?.title, "braden");
});

test("formulário e página ficam na fila", () => {
  assert.equal(classifyPath("formulario_escala_de_braden.html").module, "formulario");
  assert.equal(classifyPath("formulario_escala_de_braden.html").verdict, "espera");
  assert.equal(classifyPath("js/main.js").locale, "pt-BR");
});

/* ------------------------------------------------------------------ *
 * A gravação. Aqui o lote para de ser conversa e vira linha.
 * ------------------------------------------------------------------ */

async function bancoDeTeste() {
  const db = new PGlite();
  const base = new URL("../../migrations/", import.meta.url);
  const nomes = (await readdir(base)).filter((nome) => nome.endsWith(".sql")).sort();
  for (const nome of nomes) {
    await db.exec(await readFile(new URL(nome, base), "utf8"));
  }
  const sql = (async (strings: TemplateStringsArray, ...values: unknown[]) => {
    let text = strings[0];
    for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
    const result = await db.query(text, values);
    return result.rows;
  }) as Sql;
  sql.query = async <T = Record<string, unknown>>(text: string, params: unknown[] = []) =>
    (await db.query(text, params)).rows as T[];
  return { db, sql };
}

const caminhos = [
  "braden.html",
  "en/braden.html",
  "es/braden.html",
  "formulario_escala_de_braden.html",
  "banco_nanda.json",
  "img/braden.webp",
];

test("lote sem origem declarada não grava", async () => {
  const { db, sql } = await bancoDeTeste();
  await assert.rejects(
    () => gravarLote(sql, caminhos, { path: "", date: "2026-10-26" }),
    /origem/i,
  );
  await assert.rejects(
    () => gravarLote(sql, caminhos, { path: "homologado/apgar", date: "  " }),
    /origem/i,
  );
  const lotes = await db.query<{ n: number }>("select count(*)::int n from intake_batch");
  assert.equal(lotes.rows[0]?.n, 0, "sem origem, o banco continua vazio");
  await db.close();
});

test("o lote grava de verdade e o resumo conta por veredito, módulo e idioma", async () => {
  const { db, sql } = await bancoDeTeste();
  const origem = { path: "homologado/apgar", date: "2026-10-26" };
  const resumo = await gravarLote(sql, caminhos, origem);

  const lotes = await db.query<{ n: number }>("select count(*)::int n from intake_batch");
  const arquivos = await db.query<{ n: number }>("select count(*)::int n from intake_file");
  assert.equal(lotes.rows[0]?.n, 1, "a tabela intake_batch deixa de estar vazia");
  assert.equal(arquivos.rows[0]?.n, caminhos.length);

  const lote = await db.query<{ id: string; source: string; taken_at: unknown }>(
    "select id, source, taken_at from intake_batch",
  );
  assert.equal(lote.rows[0]?.source, origem.path);
  assert.equal(resumo.batchId, await idDoLote(origem));
  assert.equal(resumo.total, caminhos.length);
  assert.equal(resumo.porVerdict.admitir, 1);
  assert.equal(resumo.porVerdict.espera, 3);
  assert.equal(resumo.porVerdict.recusar, 2);
  assert.equal(resumo.porModulo.instrumento, 3);
  assert.equal(resumo.porModulo.formulario, 1);
  assert.equal(resumo.porModulo.catalogo, 1);
  assert.equal(resumo.porModulo.midia, 1);
  assert.equal(resumo.porIdioma["pt-BR"], 4);
  assert.equal(resumo.porIdioma.en, 1);
  assert.equal(resumo.porIdioma.es, 1);

  const linhas = await db.query<{ path: string; verdict: string; module: string; locale: string }>(
    "select path, verdict, module, locale from intake_file where batch_id = $1 order by path",
    [resumo.batchId],
  );
  assert.equal(linhas.rows.length, caminhos.length);
  assert.equal(linhas.rows.find((linha) => linha.path === "banco_nanda.json")?.verdict, "recusar");
  assert.equal(linhas.rows.find((linha) => linha.path === "braden.html")?.module, "instrumento");
  assert.equal(linhas.rows.find((linha) => linha.path === "en/braden.html")?.locale, "en");
  await db.close();
});

test("rodar duas vezes não duplica lote nem arquivo", async () => {
  const { db, sql } = await bancoDeTeste();
  const origem = { path: "homologado/apgar", date: "2026-10-26" };
  const primeiro = await gravarLote(sql, caminhos, origem);
  const segundo = await gravarLote(sql, caminhos, origem);

  assert.equal(segundo.batchId, primeiro.batchId, "a mesma origem no mesmo dia é o mesmo lote");
  assert.deepEqual(segundo.porVerdict, primeiro.porVerdict);
  assert.equal(segundo.total, primeiro.total);

  const lotes = await db.query<{ n: number }>("select count(*)::int n from intake_batch");
  const arquivos = await db.query<{ n: number }>("select count(*)::int n from intake_file");
  assert.equal(lotes.rows[0]?.n, 1, "um lote só");
  assert.equal(arquivos.rows[0]?.n, caminhos.length, "um arquivo por caminho, sem repetição");
  await db.close();
});
