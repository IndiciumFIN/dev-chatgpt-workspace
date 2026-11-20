/** Testa as formulações de consulta da chave primária no PGlite. */
import { readdir, readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const dir = new URL("../migrations/", import.meta.url);
const db = new PGlite();
for (const nome of (await readdir(dir)).filter((n) => n.endsWith(".sql")).sort()) {
  await db.exec(await readFile(new URL(nome, dir), "utf8"));
}

const variantes = {
  "A conkey + array_position": `
    select c.relname as name, a.attname as col, array_position(con.conkey, a.attnum) as pos
    from pg_constraint con
    join pg_class c on c.oid = con.conrelid
    join pg_namespace n on n.oid = c.relnamespace
    join pg_attribute a on a.attrelid = c.oid and a.attnum = any(con.conkey)
    where con.contype = 'p' and n.nspname = 'public'
    order by c.relname, pos`,
  "B lateral with ordinality": `
    select c.relname as name, a.attname as col
    from pg_constraint con
    join pg_class c on c.oid = con.conrelid
    join pg_namespace n on n.oid = c.relnamespace
    join lateral unnest(con.conkey) with ordinality as k(attnum, ord) on true
    join pg_attribute a on a.attrelid = c.oid and a.attnum = k.attnum
    where con.contype = 'p' and n.nspname = 'public'
    order by c.relname, k.ord`,
  "C array_agg lateral": `
    select c.relname as name, array_agg(a.attname order by k.ord) as cols
    from pg_constraint con
    join pg_class c on c.oid = con.conrelid
    join pg_namespace n on n.oid = c.relnamespace
    join lateral unnest(con.conkey) with ordinality as k(attnum, ord) on true
    join pg_attribute a on a.attrelid = c.oid and a.attnum = k.attnum
    where con.contype = 'p' and n.nspname = 'public'
    group by c.relname`,
};

for (const [nome, sql] of Object.entries(variantes)) {
  try {
    const q = await db.query(sql);
    console.log(nome, "-> ok, linhas:", q.rows.length, "| exemplo:", JSON.stringify(q.rows[0]));
  } catch (erro) {
    console.log(nome, "-> ERRO:", String(erro.message).slice(0, 120));
  }
}
await db.close();
