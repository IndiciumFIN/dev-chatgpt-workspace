import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import type { Sql } from "./db.ts";
import { admit, admitOrder, manifestStatus, type AdmitInput } from "./kernel-admit.ts";
import { signAllowDecision } from "./policy-signature.ts";

const allow = { code: "publicar", active: true, effect: "allow" as const };
const testSecret = "kernel-admit-test-secret";

function signed(input: AdmitInput): AdmitInput {
  return {
    ...input,
    signatureKey: testSecret,
    policySignature: signAllowDecision(
      { workOrderId: input.workOrderId, policyCodes: input.policyCodes },
      testSecret,
    ),
  };
}

test("validador vazio não admite e o kernel não se aprova", () => {
  const empty = admit(
    signed({
      workOrderId: "wo-1",
      policyCodes: ["publicar"],
      rules: [allow],
      validators: [],
      approverId: "admin-1",
    }),
  );
  assert.equal(empty.outcome, "reject");
  assert.equal(empty.reason, "validators-required");

  const self = admit(
    signed({
      workOrderId: "wo-1",
      policyCodes: ["publicar"],
      rules: [allow],
      validators: [true],
      approverId: "kernel",
      bundle_signature_verified: true,
    }),
  );
  assert.equal(self.outcome, "hold");
  assert.equal(self.reason, "human-approval-required");
  assert.notEqual(self.outcome, "admit");
  assert.deepEqual(manifestStatus(self, "kernel"), { status: "draft", approvedBy: null });

  const denied = admit(
    signed({
      workOrderId: "wo-1",
      policyCodes: ["publicar"],
      rules: [{ code: "publicar", active: true, effect: "deny" }],
      validators: [true],
      approverId: "admin-1",
    }),
  );
  assert.equal(denied.reason, "policy-denied:publicar");

  const admitted = admit(
    signed({
      workOrderId: "wo-1",
      policyCodes: ["publicar"],
      rules: [allow],
      validators: [true],
      approverId: "admin-1",
      bundle_signature_verified: false,
    }),
  );
  assert.equal(admitted.outcome, "admit");
  assert.equal(admitted.reason, "policy-validator-and-human");
  assert.deepEqual(manifestStatus(admitted, "admin-1"), { status: "approved", approvedBy: "admin-1" });
});

test("booleano do chamador não verifica a assinatura; forja e payload adulterado rejeitam", () => {
  const base: AdmitInput = {
    workOrderId: "wo-1",
    policyCodes: ["publicar"],
    rules: [allow],
    validators: [true],
    approverId: "admin-1",
  };

  const forgedFlag = admit({ ...base, bundle_signature_verified: true });
  assert.equal(forgedFlag.outcome, "reject");
  assert.equal(forgedFlag.reason, "policy-signature-failed");

  const missing = admit({ ...base, signatureKey: testSecret, bundle_signature_verified: true });
  assert.equal(missing.outcome, "reject");
  assert.equal(missing.reason, "policy-signature-failed");

  const wrong = admit({
    ...base,
    signatureKey: testSecret,
    policySignature: "a".repeat(64),
    bundle_signature_verified: true,
  });
  assert.equal(wrong.outcome, "reject");
  assert.equal(wrong.reason, "policy-signature-failed");

  const tampered = admit({
    ...base,
    signatureKey: testSecret,
    policySignature: signAllowDecision({ workOrderId: "wo-2", policyCodes: ["publicar"] }, testSecret),
    bundle_signature_verified: true,
  });
  assert.equal(tampered.outcome, "reject");
  assert.equal(tampered.reason, "policy-signature-failed");

  const kernelUnsigned = admit({ ...base, approverId: "kernel", bundle_signature_verified: true });
  assert.equal(kernelUnsigned.outcome, "reject");
  assert.equal(kernelUnsigned.reason, "policy-signature-failed");
  assert.notEqual(kernelUnsigned.outcome, "admit");
});

test("assinatura válida admite só com política, validador e pessoa", () => {
  const valid = admit(
    signed({
      workOrderId: "wo-9",
      policyCodes: ["arquivo", "publicar"],
      rules: [
        { code: "publicar", active: true, effect: "allow" },
        { code: "arquivo", active: true, effect: "allow" },
      ],
      validators: [true, true],
      approverId: "admin-9",
    }),
  );
  assert.equal(valid.outcome, "admit");
  assert.equal(valid.reason, "policy-validator-and-human");

  const held = admit(
    signed({
      workOrderId: "wo-9",
      policyCodes: ["arquivo", "publicar"],
      rules: [
        { code: "publicar", active: true, effect: "allow" },
        { code: "arquivo", active: true, effect: "allow" },
      ],
      validators: [true, true],
      approverId: "kernel",
    }),
  );
  assert.equal(held.outcome, "hold");
  assert.equal(held.reason, "human-approval-required");
});

function asSql(db: PGlite): Sql {
  const sql = (async (strings: TemplateStringsArray, ...values: unknown[]) => {
    let text = strings[0];
    for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
    const result = await db.query(text, values);
    return result.rows;
  }) as Sql;
  sql.query = async <T = Record<string, unknown>>(text: string, params: unknown[] = []) =>
    (await db.query(text, params)).rows as T[];
  return sql;
}

function proofFor(workOrderId: string, policyCodes: string[], policySignature?: string) {
  return {
    signatureKey: testSecret,
    policySignature:
      policySignature ??
      signAllowDecision({ workOrderId, policyCodes }, testSecret),
  };
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
      ('wo-nega', 'Regra negada', 'admin-1'),
      ('wo-forja', 'Assinatura forjada', 'admin-1');
    insert into kernel_order_policy (order_id, package_id, rule_id) values
      ('wo-vazio', 'acesso', 'admin-publica-idioma'),
      ('wo-ok', 'acesso', 'admin-publica-idioma'),
      ('wo-nega', 'acesso', 'agente-nao-publica'),
      ('wo-forja', 'acesso', 'admin-publica-idioma');
    insert into kernel_validator (order_id, id, passed, note) values
      ('wo-ok', 'forma', true, 'Conferido'),
      ('wo-nega', 'forma', true, 'Conferido'),
      ('wo-forja', 'forma', true, 'Conferido');
  `);
  assert.equal(
    (await admitOrder(sql, "wo-vazio", proofFor("wo-vazio", ["admin-publica-idioma"]))).reason,
    "validators-required",
  );
  assert.equal(
    (await admitOrder(sql, "wo-nega", proofFor("wo-nega", ["agente-nao-publica"]))).reason,
    "policy-denied:agente-nao-publica",
  );
  assert.equal(
    (
      await admitOrder(sql, "wo-forja", {
        ...proofFor("wo-forja", ["admin-publica-idioma"], "deadbeef"),
        bundle_signature_verified: true,
      })
    ).reason,
    "policy-signature-failed",
  );
  assert.equal((await admitOrder(sql, "wo-ok", proofFor("wo-ok", ["admin-publica-idioma"]))).outcome, "admit");
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
  assert.equal(byId.get("wo-forja")?.status, "rejeitada");
  assert.equal(byId.get("wo-forja")?.manifest, "rascunho");
  assert.equal(byId.get("wo-forja")?.approved_by, null);
});
