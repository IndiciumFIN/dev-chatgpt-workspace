import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import type { Sql } from "./db.ts";
import { admit, admitOrder, manifestStatus } from "./kernel-admit.ts";

const allow = { code: "publicar", active: true, effect: "allow" as const };

test("validador vazio não admite e o kernel não se aprova", () => {
  const empty = admit({
    workOrderId: "wo-1",
    policyCodes: ["publicar"],
    rules: [allow],
    validators: [],
    approverId: "admin-1",
  });
  assert.equal(empty.outcome, "reject");
  assert.equal(empty.reason, "validators-required");

  const self = admit({
    workOrderId: "wo-1",
    policyCodes: ["publicar"],
    rules: [allow],
    validators: [true],
    approverId: "kernel",
  });
  assert.equal(self.outcome, "hold");
  assert.deepEqual(manifestStatus(self, "kernel"), { status: "draft", approvedBy: null });

  const denied = admit({
    workOrderId: "wo-1",
    policyCodes: ["publicar"],
    rules: [{ code: "publicar", active: true, effect: "deny" }],
    validators: [true],
    approverId: "admin-1",
  });
  assert.equal(denied.reason, "policy-denied:publicar");

  const admitted = admit({
    workOrderId: "wo-1",
    policyCodes: ["publicar"],
    rules: [allow],
    validators: [true],
    approverId: "admin-1",
  });
  assert.equal(admitted.outcome, "admit");
  assert.deepEqual(manifestStatus(admitted, "admin-1"), { status: "approved", approvedBy: "admin-1" });
});

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

test("a admissão grava tabela e não aprova sem validador", async () => {
  const db = new PGlite();
  const base = new URL("../../migrations/", import.meta.url);
  for (const name of ["0006_governance.sql", "0008_canonical.sql", "0025_dictionary.sql", "0026_control_plane.sql", "0027_kernel_admission.sql"]) {
    await db.exec(await readFile(new URL(name, base), "utf8"));
  }
  const sql = asSql(db);
  await db.exec(`
    insert into kernel_order (id, title, approver_id) values
      ('wo-vazio', 'Sem validador', 'admin-1'),
      ('wo-ok', 'Completa', 'admin-1'),
      ('wo-nega', 'Regra negada', 'admin-1');
    insert into kernel_order_policy (order_id, package_id, rule_id) values
      ('wo-vazio', 'acesso', 'admin-publica-idioma'),
      ('wo-ok', 'acesso', 'admin-publica-idioma'),
      ('wo-nega', 'acesso', 'agente-nao-publica');
    insert into kernel_validator (order_id, id, passed, note) values
      ('wo-ok', 'forma', true, 'Conferido'),
      ('wo-nega', 'forma', true, 'Conferido');
  `);
  assert.equal((await admitOrder(sql, "wo-vazio")).reason, "validators-required");
  assert.equal((await admitOrder(sql, "wo-nega")).reason, "policy-denied:agente-nao-publica");
  assert.equal((await admitOrder(sql, "wo-ok")).outcome, "admit");
  const rows = await db.query<{ id: string; status: string; manifest: string; approved_by: string | null }>(`
    select o.id, o.status, m.status as manifest, m.approved_by
    from kernel_order o
    join kernel_manifest m on m.order_id = o.id
    order by o.id
  `);
  const byId = new Map(rows.rows.map((row) => [row.id, row]));
  assert.equal(byId.get("wo-vazio")?.status, "rejeitada");
  assert.equal(byId.get("wo-vazio")?.manifest, "rascunho");
  assert.equal(byId.get("wo-ok")?.status, "admitida");
  assert.equal(byId.get("wo-ok")?.manifest, "aprovado");
  assert.equal(byId.get("wo-ok")?.approved_by, "admin-1");
  assert.equal(byId.get("wo-nega")?.approved_by, null);
});

