import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import type { Sql } from "./db.ts";
import { decide } from "./policy-decision.ts";

function asSql(db: PGlite): Sql {
  const sql = (async (strings: TemplateStringsArray, ...values: unknown[]) => {
    let text = strings[0];
    for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
    const result = await db.query(text, values);
    return result.rows;
  }) as Sql;
  sql.query = async <T = Record<string, unknown>>(text: string, params: unknown[] = []) => (await db.query(text, params)).rows as T[];
  return sql;
}

test("sem regra a decisão é negação, e agente não publica", async () => {
  const db = new PGlite();
  const base = new URL("../../migrations/", import.meta.url);
  for (const name of ["0006_governance.sql", "0008_canonical.sql", "0025_dictionary.sql", "0026_control_plane.sql"]) {
    await db.exec(await readFile(new URL(name, base), "utf8"));
  }
  const sql = asSql(db);
  await assert.rejects(() => decide(sql, { action: "publicar_idioma", role: "agente", actorId: "agent-ui" }), /nega/);
  const allowed = await decide(sql, { action: "publicar_idioma", role: "admin", actorId: "admin-1" });
  assert.equal(allowed.effect, "allow");
  await assert.rejects(() => decide(sql, { action: "apagar_banco", role: "admin", actorId: "admin-1" }), /nega/);
  const decisions = await db.query<{ effect: string }>("select effect from policy_decision order by at");
  assert.deepEqual(decisions.rows.map((row) => row.effect), ["deny", "allow", "deny"]);
  const writing = await db.query("select count(*)::int as n from agent where may_write = true or may_publish = true");
  assert.equal((writing.rows[0] as { n: number }).n, 0);
  const atom = await db.query("select status from kernel_atom");
  assert.equal(atom.rows.every((row) => (row as { status: string }).status === "candidato"), true);
});
