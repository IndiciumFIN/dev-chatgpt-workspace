import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";

test("instrumento sem fórmula tem capa e não abre como cálculo", async () => {
  const db = new PGlite();
  await db.exec(`
    create table locale (id text primary key, label text not null, source boolean not null default false);
    insert into locale (id, label, source) values ('pt-BR', 'Português', true);
    create table source_tool (
      slug text primary key,
      kind text not null,
      title text not null,
      lead text not null,
      published boolean not null default true
    );
    create table tool_text (
      slug text not null references source_tool (slug),
      locale text not null references locale (id),
      title text not null,
      lead text not null,
      primary key (slug, locale)
    );
    create table content_object (
      slug text primary key,
      kind text not null,
      origin_path text not null unique
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
    insert into content_object (slug, kind, origin_path) values
      ('bishop', 'instrumento', '/bishop.html'),
      ('morse', 'instrumento', '/morse.html'),
      ('missao', 'institucional', '/missao.html');
    insert into content_text (slug, locale, view, title, lead, body, status) values
      ('bishop', 'pt-BR', 'calculadora', 'Bishop', 'Colo', 'texto', 'publicado'),
      ('morse', 'pt-BR', 'calculadora', 'Morse', 'Queda', 'texto', 'publicado'),
      ('missao', 'pt-BR', 'leitura', 'Missão', 'Sobre', 'texto', 'publicado');
  `);
  const sql = await readFile(new URL("../../migrations/0022_instrument_cover.sql", import.meta.url), "utf8");
  await db.exec(sql);
  await db.exec(sql);
  const covers = await db.query<{ slug: string; kind: string; published: boolean }>(
    "select slug, kind, published from source_tool order by slug",
  );
  assert.deepEqual(
    covers.rows.map((row) => `${row.slug}:${row.kind}:${row.published}`),
    ["bishop:escala:false", "morse:escala:true"],
  );
  const link = await db.query<{ slug: string; tool_slug: string | null }>(
    "select slug, tool_slug from content_object order by slug",
  );
  assert.equal(link.rows.find((row) => row.slug === "bishop")?.tool_slug, "bishop");
  assert.equal(link.rows.find((row) => row.slug === "missao")?.tool_slug, null);
  const text = await db.query("select slug from tool_text where locale = 'pt-BR' order by slug");
  assert.deepEqual(text.rows.map((row) => (row as { slug: string }).slug), ["bishop", "morse"]);
});
