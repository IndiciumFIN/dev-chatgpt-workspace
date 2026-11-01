import assert from "node:assert/strict";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { assertLocalePublish, publishLocaleStatement } from "./locale-publish.ts";

test("publicar um idioma não publica outro nem texto sem endereço", async () => {
  assert.throws(() => assertLocalePublish("../missao", "en"), /Objeto inválido/);
  assert.throws(() => assertLocalePublish("missao", "pt-BR"), /Idioma inválido/);
  const db = new PGlite();
  await db.exec(`
    create table content_object (slug text primary key, kind text not null);
    create table content_text (
      slug text not null,
      locale text not null,
      view text not null,
      title text not null,
      status text not null,
      primary key (slug, locale, view)
    );
    create table content_alias (
      path text primary key,
      slug text not null,
      locale text not null,
      view text not null
    );
    insert into content_object (slug, kind) values ('missao', 'institucional');
    insert into content_text (slug, locale, view, title, status) values
      ('missao', 'pt-BR', 'leitura', 'Missão', 'publicado'),
      ('missao', 'en', 'leitura', 'Mission', 'rascunho'),
      ('missao', 'es', 'leitura', 'Misión', 'rascunho');
    insert into content_alias (path, slug, locale, view) values
      ('/missao.html', 'missao', 'pt-BR', 'leitura'),
      ('/en/missao.html', 'missao', 'en', 'leitura');
  `);
  const published = await db.query(publishLocaleStatement, ["missao", "en"]);
  assert.equal(published.rows.length, 1);
  const again = await db.query(publishLocaleStatement, ["missao", "en"]);
  assert.equal(again.rows.length, 0);
  const spanish = await db.query(publishLocaleStatement, ["missao", "es"]);
  assert.equal(spanish.rows.length, 0);
  const rows = await db.query<{ locale: string; status: string }>("select locale, status from content_text order by locale");
  assert.deepEqual(
    rows.rows.map((row) => `${row.locale}:${row.status}`),
    ["en:publicado", "es:rascunho", "pt-BR:publicado"],
  );
});
