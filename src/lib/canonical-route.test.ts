import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";

test("a tradução só aponta para uma origem que existe", async () => {
  const db = new PGlite();
  await db.exec(`
    create table site_route (
      path text primary key,
      locale text not null,
      status text not null
    );
    insert into site_route (path, locale, status) values
      ('/gotejamento.html', 'pt-BR', 'publicado'),
      ('/en/gotejamento.html', 'en', 'publicado'),
      ('/en/formulario_escala_de_bishop.html', 'en', 'publicado');
  `);
  const migration = await readFile(new URL("../../migrations/0019_canonical_route.sql", import.meta.url), "utf8");
  await db.exec(migration);
  await db.exec(migration);
  const rows = await db.query<{ path: string; canonical_path: string | null }>("select path, canonical_path from site_route order by path");
  const byPath = new Map(rows.rows.map((row) => [row.path, row.canonical_path]));
  assert.equal(byPath.get("/gotejamento.html"), "/gotejamento.html");
  assert.equal(byPath.get("/en/gotejamento.html"), "/gotejamento.html");
  assert.equal(byPath.get("/en/formulario_escala_de_bishop.html"), null);
});
