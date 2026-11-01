import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";

test("o dicionário nomeia cada tabela e a coluna estrutural", async () => {
  const db = new PGlite();
  const base = new URL("../../migrations/", import.meta.url);
  // A base real: todas as migrations, em ordem. A lista fixa que existia
  // aqui saiu de sincronia com o schema (a 0038 criou duas tabelas que a
  // lista não aplicava) — e o dicionário passou a mentir sem ninguém
  // perceber. A ordem é a do disco, não uma lista mantida à mão.
  for (const name of (await readdir(base)).filter((n) => n.endsWith(".sql")).sort()) {
    await db.exec(await readFile(new URL(name, base), "utf8"));
  }
  const names = (await readdir(base)).filter((name) => name.endsWith(".sql"));
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
  const spec = await db.query<{status:string;approved_by:string|null;approved_at:string|null}>(
    "select status, approved_by, approved_at from data_specification where entity = 'content_text' and characteristic = 'status'"
  );
  assert.equal(spec.rows.length, 1, "Data specification must exist");
  // Technical migration actors do not grant clinical or governance approval.
  if (spec.rows[0].status === "aprovado") {
    assert.ok(spec.rows[0].approved_by && spec.rows[0].approved_by !== "derby-normalizacao");
    assert.ok(spec.rows[0].approved_at);
  } else {
    assert.ok(["rascunho", "candidato"].includes(spec.rows[0].status));
    assert.equal(spec.rows[0].approved_by, null);
  }
  const orderColumns = await db.query<{ name: string }>("select name from schema_column where entity = 'kernel_order' order by name");
  // O pedido de admissão ganhou dono, origem e hash na 0038; o critério de
  // aceite saiu para a tabela filha na 0043. A lista é a do schema de hoje.
  assert.deepEqual(orderColumns.rows.map((row) => row.name), [
    "approver_id",
    "hash",
    "id",
    "owner_id",
    "reason",
    "source_ref",
    "status",
    "title",
  ]);
  const link = await db.query<{ cardinality: string }>(
    "select cardinality from schema_relation where from_entity = 'kernel_order' and to_entity = 'kernel_order_policy'",
  );
  assert.equal(link.rows[0]?.cardinality, "1:N");
  const rule = await db.query<{status:string;approved_by:string|null;approved_at:string|null}>(
    "select status, approved_by, approved_at from business_rule where id = 'br-politica-obrigatoria'"
  );
  assert.equal(rule.rows.length, 1, "Policy rule must exist");
  if (rule.rows[0].status === "aprovado") {
    assert.ok(rule.rows[0].approved_by && rule.rows[0].approved_by !== "derby-normalizacao");
    assert.ok(rule.rows[0].approved_at);
  } else {
    assert.ok(["rascunho", "candidato"].includes(rule.rows[0].status));
    assert.equal(rule.rows[0].approved_by, null);
  }
});
