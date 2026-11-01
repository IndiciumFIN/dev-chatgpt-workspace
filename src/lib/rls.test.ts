import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";

test("o papel leitor não vê rascunho", async () => {
  const db = new PGlite();
  const base = new URL("../../migrations/", import.meta.url);
  const names = (await readdir(base)).filter((name) => name.endsWith(".sql")).sort();
  for (const name of names) await db.exec(await readFile(new URL(name, base), "utf8"));

  await db.exec(`
    insert into content_object (slug, kind, origin_path)
    values ('rls-prova', 'pagina', '/rls-prova');
    insert into content_text (slug, locale, view, title, lead, body, status) values
      ('rls-prova', 'pt-BR', 'leitura', 'Publicado', 'Aberto', '', 'publicado'),
      ('rls-prova', 'pt-BR', 'calculadora', 'Rascunho', 'Fechado', '', 'rascunho');
  `);

  await db.exec("set role leitor");
  const visible = await db.query<{ view: string }>("select view from content_text where slug = 'rls-prova' order by view");
  assert.deepEqual(visible.rows.map((row) => row.view), ["leitura"]);

  await assert.rejects(
    db.exec(
      "insert into content_text (slug, locale, view, title, lead, status) values ('rls-prova', 'pt-BR', 'formulario', 'X', 'Y', 'publicado')",
    ),
  );
  await db.exec("reset role");

  const owner = await db.query<{ view: string }>("select view from content_text where slug = 'rls-prova' order by view");
  assert.deepEqual(owner.rows.map((row) => row.view), ["calculadora", "leitura"]);
});
