import { readdir, readFile, writeFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const dir = new URL("../migrations/", import.meta.url);
const names = (await readdir(dir)).filter((name) => name.endsWith(".sql")).sort();
const db = new PGlite();
for (const name of names) {
  await db.exec(await readFile(new URL(name, dir), "utf8"));
}
for (const name of names) {
  await db.exec(await readFile(new URL(name, dir), "utf8"));
}

const constraints = await db.query(
  "select conname from pg_constraint where contype = 'f' order by conname",
);
const orphans = await db.query(`
  select 'nav sem destino' as check_id, count(*)::int as n from nav_item where dest_kind is not null and dest_id is null
  union all select 'item sem destino', count(*)::int from section_link where dest_kind is not null and dest_id is null
  union all select 'card com destino vazio', count(*)::int from catalog_item where (slug is not null or section is not null) and dest_id is null
  union all select 'secao sem lugar', count(*)::int from section_page where not exists (select 1 from content_place where section_slug = section_page.slug)
  union all select 'institucional sem lugar', count(*)::int from inst_page where path <> '' and not exists (select 1 from content_place where inst_path = inst_page.path)
  union all select 'objeto sem lugar', count(*)::int from content_object where not exists (select 1 from content_place where object_slug = content_object.slug)
  union all select 'rotulo sem idioma', count(*)::int from chrome_label where not exists (select 1 from locale where locale.id = chrome_label.locale)
  union all select 'texto sem idioma', count(*)::int from content_text where not exists (select 1 from locale where locale.id = content_text.locale)
  union all select 'conta sem capa', count(*)::int from tool_formula where not exists (select 1 from source_tool where source_tool.slug = tool_formula.tool_slug)
`);
const counts = await db.query(`
  select
    (select count(*)::int from content_place) as places,
    (select count(*)::int from screen_dest) as dests,
    (select count(*)::int from locale) as locales,
    (select count(*)::int from schema_relation) as relations
`);
const report = {
  constraints: constraints.rows.map((row) => row.conname),
  orphans: orphans.rows,
  counts: counts.rows[0],
};
await writeFile(new URL("../artifacts/db-audit.json", import.meta.url), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.counts));
console.log(report.orphans.filter((row) => row.n !== 0));
