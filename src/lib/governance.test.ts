import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { approveItemTx } from "./governance.ts";

function tagged(query: (text: string, params: unknown[]) => Promise<unknown[]>) {
  return async <T>(strings: TemplateStringsArray, ...values: unknown[]) => {
    let text = strings[0];
    for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
    return query(text, values) as Promise<T[]>;
  };
}

test("o item nasce em rascunho e a aprovação grava quem clicou uma vez", async () => {
  const db = new PGlite();
  for (const name of ["0002_source.sql", "0004_metamodel.sql", "0005_controls.sql", "0006_governance.sql", "0008_canonical.sql"]) {
    await db.exec(await readFile(new URL(`../../migrations/${name}`, import.meta.url), "utf8"));
  }
  const sql = tagged(async (text, params) => (await db.query(text, params)).rows);
  const before = await db.query("select status, approved_by from governance_item where id = 'politica-seguranca'");
  assert.equal((before.rows[0] as { status: string }).status, "rascunho");
  assert.equal((before.rows[0] as { approved_by: string | null }).approved_by, null);
  await approveItemTx(sql, "politica-seguranca", "pessoa-1");
  await approveItemTx(sql, "politica-seguranca", "pessoa-2");
  const after = await db.query("select status, approved_by from governance_item where id = 'politica-seguranca'");
  const trail = await db.query("select actor_id from audit_event where action = 'aprovar'");
  assert.equal((after.rows[0] as { status: string }).status, "aprovado");
  assert.equal((after.rows[0] as { approved_by: string }).approved_by, "pessoa-1");
  assert.equal(trail.rows.length, 1);
  const versions = await db.query("select version, approved_by from document_version where item_id = 'politica-seguranca'");
  assert.equal(versions.rows.length, 1);
  assert.equal((versions.rows[0] as { approved_by: string }).approved_by, "pessoa-1");
  const policies = await db.exec(await readFile(new URL("../../migrations/0007_policies.sql", import.meta.url), "utf8"));
  void policies;
  const drafted = await db.query("select count(*)::int as n from governance_item where kind = 'politica' and status = 'rascunho'");
  const text = await readFile(new URL("../../migrations/0007_policies.sql", import.meta.url), "utf8");
  assert.equal((drafted.rows[0] as { n: number }).n >= 7, true);
  assert.equal(/em conformidade/i.test(text), false);
  assert.match(text, /não emite certificado/i);
});
