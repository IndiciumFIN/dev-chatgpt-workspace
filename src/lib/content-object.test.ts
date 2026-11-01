import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";

test("o endereço traduzido não publica sem o objeto", async () => {
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
      ('/morse.html', 'pt-BR', 'secao', 'Morse', 'Escala', 'origem', '/morse.html'),
      ('/en/morse.html', 'en', 'secao', 'Morse', 'Scale', 'translation', '/morse.html'),
      ('/formulario_morse.html', 'pt-BR', 'guia', 'Ficha', 'Imprimir', 'ficha', '/formulario_morse.html'),
      ('/formulario_bishop.html', 'pt-BR', 'guia', 'Bishop', 'Ficha', 'ficha', '/formulario_bishop.html'),
      ('/en/formulario_escala_de_bishop.html', 'en', 'guia', 'Bishop', 'Form', 'form', null),
      ('/conta/perfil.html', 'pt-BR', 'secao', 'Perfil', 'Conta', 'conta', '/conta/perfil.html'),
      ('/en/index.html', 'en', 'secao', 'Home', 'Home', 'home', null);
  `);
  const migration = await readFile(new URL("../../migrations/0020_content_object.sql", import.meta.url), "utf8");
  await db.exec(migration);
  await db.exec(migration);
  const objects = await db.query<{ slug: string; kind: string }>("select slug, kind from content_object order by slug");
  assert.deepEqual(objects.rows.map((row) => row.slug), ["formulario_bishop", "morse"]);
  assert.equal(objects.rows.find((row) => row.slug === "morse")?.kind, "instrumento");
  const published = await db.query<{ slug: string; locale: string; view: string }>(
    "select slug, locale, view from content_text where status = 'publicado' order by slug, view",
  );
  assert.deepEqual(
    published.rows.map((row) => `${row.slug}:${row.locale}:${row.view}`),
    ["formulario_bishop:pt-BR:formulario", "morse:pt-BR:calculadora", "morse:pt-BR:formulario"],
  );
  const english = await db.query("select status from content_text where slug = 'morse' and locale = 'en'");
  assert.equal((english.rows[0] as { status: string }).status, "rascunho");
  const form = await db.query<{ slug: string }>("select slug from content_alias where path = '/en/formulario_escala_de_bishop.html'");
  assert.equal(form.rows[0]?.slug, "formulario_bishop");
  const account = await db.query("select path from content_alias where path = '/conta/perfil.html'");
  assert.equal(account.rows.length, 0);
  const openEnglish = await db.query(
    "select a.path from content_alias a join content_text t on t.slug = a.slug and t.locale = a.locale and t.view = a.view where a.path = '/en/morse.html' and t.status = 'publicado'",
  );
  assert.equal(openEnglish.rows.length, 0);
});
