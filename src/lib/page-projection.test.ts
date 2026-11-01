import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";

test("página, peça e bloco projetam o texto publicado em português", async () => {
  const db = new PGlite();
  await db.exec(`
    create table piece (
      id text primary key,
      kind text not null,
      title text not null,
      body text not null default '',
      published boolean not null default false
    );
    create table page (
      slug text primary key,
      kind text not null constraint page_kind_check check (kind in (
        'secao', 'artigo', 'guia', 'biblioteca', 'norma',
        'institucional', 'editorial', 'formulario', 'laudo'
      )),
      title text not null,
      lead text not null default '',
      published boolean not null default false,
      piece_id text references piece (id) on delete set null,
      updated_by text,
      updated_at timestamptz not null default now()
    );
    create table block (
      page_slug text not null references page (slug) on delete cascade,
      position integer not null check (position > 0),
      title text not null,
      body text not null,
      primary key (page_slug, position)
    );
    create table content_object (
      slug text primary key,
      kind text not null
    );
    create table content_text (
      slug text not null references content_object (slug),
      locale text not null,
      view text not null,
      title text not null,
      lead text not null,
      body text not null default '',
      status text not null,
      primary key (slug, locale, view)
    );
    insert into content_object (slug, kind) values
      ('bishop', 'instrumento'),
      ('missao', 'institucional'),
      ('english-only', 'pagina');
    insert into content_text (slug, locale, view, title, lead, body, status) values
      ('bishop', 'pt-BR', 'calculadora', 'Bishop', 'Colo', 'texto bishop', 'publicado'),
      ('missao', 'pt-BR', 'leitura', 'Missão', 'Sobre', 'texto missao', 'publicado'),
      ('english-only', 'en', 'leitura', 'English only', 'Draft', 'nao publicar', 'rascunho');
  `);
  const sql = await readFile(new URL("../../migrations/0024_page_from_object.sql", import.meta.url), "utf8");
  await db.exec(sql);
  await db.exec(sql);

  const pages = await db.query<{ slug: string; kind: string }>("select slug, kind from page order by slug");
  assert.equal(pages.rows.length, 2);
  assert.equal(pages.rows.find((row) => row.slug === "bishop")?.kind, "instrumento");
  assert.equal(pages.rows.find((row) => row.slug === "missao")?.kind, "institucional");

  const blocks = await db.query<{ page_slug: string }>("select page_slug from block order by page_slug");
  assert.equal(blocks.rows.filter((row) => row.page_slug === "bishop").length, 1);
  assert.equal(blocks.rows.filter((row) => row.page_slug === "missao").length, 1);

  const english = await db.query<{ slug: string }>("select slug from page where slug = 'english-only'");
  assert.equal(english.rows.length, 0);
});
