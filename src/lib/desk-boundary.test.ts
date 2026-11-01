import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";

const governed = ["apgar", "braden", "gotejamento", "imc", "morse"];

async function migrated() {
  const db = new PGlite();
  const names = (await readdir(new URL("../../migrations/", import.meta.url)))
    .filter((name) => name.endsWith(".sql"))
    .sort();
  for (const name of names) {
    await db.exec(await readFile(new URL(`../../migrations/${name}`, import.meta.url), "utf8"));
  }
  return db;
}

test("o que está publicado nesta mesa tem corpo e cálculo só nas cinco ferramentas", async () => {
  const db = await migrated();
  const empty = await db.query<{ n: number }>("select count(*)::int as n from content_text where status = 'publicado' and btrim(body) = ''");
  assert.equal(empty.rows[0].n, 0);

  const foreign = await db.query<{ n: unknown }>(
    "select count(*)::int as n from content_text where status = 'publicado' and locale <> 'pt-BR'",
  );
  assert.equal(Number(foreign.rows[0].n) > 3, true);

  const broken = await db.query<{ n: number }>("select count(*)::int as n from content_text where status = 'publicado' and slug like '%/'");
  assert.equal(broken.rows[0].n, 0);

  const open = await db.query<{ slug: string }>(
    "select slug from source_tool where published order by slug",
  );
  assert.deepEqual(open.rows.map((row) => row.slug), governed);

  const catalog = await readFile(new URL("./tools/catalog.ts", import.meta.url), "utf8");
  const menu = catalog.slice(catalog.indexOf("export const tools"), catalog.indexOf("export const candidateTools"));
  assert.match(menu, /\[braden, morse, apgar, gotejamento, imc\]/);
  assert.equal(menu.includes("aldrete"), false);

  const foreignOnAir = await db.query<{ n: number }>(
    `select count(*)::int as n
     from content_alias as alias
     join content_text as copy on copy.slug = alias.slug and copy.locale = alias.locale and copy.view = alias.view
     where copy.status = 'publicado' and alias.locale <> 'pt-BR'`,
  );
  assert.equal(Number(foreignOnAir.rows[0].n) > 3, true);
});
