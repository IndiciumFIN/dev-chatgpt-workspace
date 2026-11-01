import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";

test("o dicionário nomeia cada tabela e a coluna estrutural", async () => {
  const db = new PGlite();
  const base = new URL("../../migrations/", import.meta.url);
  const names = (await readdir(base)).filter((name) => name.endsWith(".sql")).sort();
  for (const name of names) {
    await db.exec(await readFile(new URL(name, base), "utf8"));
  }
  const tables = new Set<string>();
  const dropped = new Set<string>();
  for (const name of names) {
    const sql = await readFile(new URL(name, base), "utf8");
    for (const match of sql.matchAll(/create table if not exists "?(\w+)"?/gi)) tables.add(match[1]);
    for (const match of sql.matchAll(/drop table if exists "?(\w+)"?/gi)) dropped.add(match[1]);
  }
  const entities = await db.query<{ name: string }>("select name from schema_entity");
  assert.deepEqual(
    entities.rows.map((row) => row.name).sort(),
    [...tables].filter((name) => !dropped.has(name)).sort(),
  );
  const objectColumns = await db.query<{ name: string }>("select name from schema_column where entity = 'content_object' order by name");
  assert.deepEqual(objectColumns.rows.map((row) => row.name), ["kind", "origin_path", "slug", "tool_slug"]);
  const term = await db.query("select code from schema_term where domain = 'content_status' and code = 'publicado'");
  assert.equal(term.rows.length, 1);
  const spec = await db.query("select status from data_specification where entity = 'content_text' and characteristic = 'status'");
  assert.equal((spec.rows[0] as { status: string }).status, "rascunho");
  const orderColumns = await db.query<{ name: string }>("select name from schema_column where entity = 'kernel_order' order by name");
  assert.deepEqual(orderColumns.rows.map((row) => row.name), [
    "approver_id",
    "execution_requested",
    "id",
    "owner_id",
    "reason",
    "status",
    "title",
  ]);
  const link = await db.query<{ cardinality: string }>(
    "select cardinality from schema_relation where from_entity = 'kernel_order' and to_entity = 'kernel_order_policy'",
  );
  assert.equal(link.rows[0]?.cardinality, "1:N");
  const rule = await db.query("select status from business_rule where id = 'br-politica-obrigatoria'");
  assert.equal((rule.rows[0] as { status: string }).status, "rascunho");
});
