/**
 * Onde vivem as tabelas `cko_*`: o dicionário e o portão descrevem o schema
 * `public`. Este script conta as tabelas por schema, para a afirmação do
 * entregável ter um comando atrás.
 */
import { readdir, readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const dir = new URL("../migrations/", import.meta.url);
const db = new PGlite();
for (const nome of (await readdir(dir)).filter((n) => n.endsWith(".sql")).sort()) {
  await db.exec(await readFile(new URL(nome, dir), "utf8"));
}
const porSchema = await db.query(
  `select n.nspname as schema, count(*)::int as tabelas
   from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where c.relkind = 'r' group by n.nspname order by n.nspname`,
);
console.log("tabelas por schema:");
for (const linha of porSchema.rows) console.log(`  ${linha.schema}: ${linha.tabelas}`);
const cko = await db.query(
  `select n.nspname as schema, c.relname as tabela
   from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where c.relkind = 'r' and n.nspname <> 'public' order by n.nspname, c.relname`,
);
console.log("tabelas fora do schema public:", cko.rows.length);
for (const linha of cko.rows.slice(0, 12)) console.log(`  ${linha.schema}.${linha.tabela}`);
await db.close();
