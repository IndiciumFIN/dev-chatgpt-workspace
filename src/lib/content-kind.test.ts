import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { classifySlug, formViewOf } from "./content-kind.ts";

test("institucional, instrumento e o resto não se misturam", () => {
  assert.equal(classifySlug("morse"), "instrumento");
  assert.equal(classifySlug("gotejamento"), "instrumento");
  assert.equal(formViewOf("formulario_bishop"), "bishop");
  assert.equal(formViewOf("formulario_escala_de_morse"), "morse");
  assert.equal(classifySlug("missao"), "institucional");
  assert.equal(classifySlug("termos"), "institucional");
  assert.equal(classifySlug("simulado-de-enfermagem"), "simulado");
  assert.equal(classifySlug("codigo_de_etica_enfermagem"), "norma");
  assert.equal(classifySlug("guia_rapido_desfibrilador"), "guia");
  assert.equal(classifySlug("biblioteca/calculo-de-gotejamento"), "biblioteca");
  assert.equal(classifySlug("5-hs-da-paradacardiorespiratoria"), "pagina");
  assert.equal(classifySlug("header"), "fora");
  assert.equal(classifySlug("conta/perfil"), "fora");
});

test("o formulário passa a ser vista e a missão continua página", async () => {
  const db = new PGlite();
  await db.exec(`
    create table site_route (
      path text primary key,
      locale text not null,
      kind text not null,
      title text not null,
      lead text not null,
      body text not null default '',
      canonical_path text
    );
    insert into site_route (path, locale, kind, title, lead, body, canonical_path) values
      ('/bishop.html', 'pt-BR', 'secao', 'Bishop', 'Escala', 'origem', '/bishop.html'),
      ('/formulario_bishop.html', 'pt-BR', 'guia', 'Ficha', 'Imprimir', 'ficha', '/formulario_bishop.html'),
      ('/missao.html', 'pt-BR', 'secao', 'Missão', 'Sobre', 'texto', '/missao.html'),
      ('/simulado-de-enfermagem.html', 'pt-BR', 'secao', 'Simulado', 'Treino', 'texto', '/simulado-de-enfermagem.html'),
      ('/header.html', 'pt-BR', 'secao', 'header', 'fragmento', 'x', '/header.html'),
      ('/en/missao.html', 'en', 'secao', 'Mission', 'About', 'draft', '/missao.html');
  `);
  const base = new URL("../../migrations/", import.meta.url);
  await db.exec(await readFile(new URL("0020_content_object.sql", base), "utf8"));
  await db.exec(await readFile(new URL("0021_content_kinds.sql", base), "utf8"));
  await db.exec(await readFile(new URL("0021_content_kinds.sql", base), "utf8"));
  const kinds = await db.query<{ slug: string; kind: string }>("select slug, kind from content_object order by slug");
  assert.deepEqual(
    kinds.rows.map((row) => `${row.slug}:${row.kind}`),
    ["bishop:instrumento", "missao:institucional", "simulado-de-enfermagem:simulado"],
  );
  const form = await db.query<{ slug: string; view: string }>("select slug, view from content_alias where path = '/formulario_bishop.html'");
  assert.equal(form.rows[0]?.slug, "bishop");
  assert.equal(form.rows[0]?.view, "formulario");
  const english = await db.query<{ status: string }>("select status from content_text where slug = 'missao' and locale = 'en'");
  assert.equal(english.rows[0]?.status, "rascunho");
});
