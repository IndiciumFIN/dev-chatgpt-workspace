import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import type { Sql } from "./db.ts";
import { admit, admitOrder, aprovarManifesto, manifestStatus } from "./kernel-admit.ts";

const allow = { code: "publicar", active: true, effect: "allow" as const };

/** Banco de teste: todas as migrations, na ordem. */
async function bancoDeTeste() {
  const db = new PGlite();
  const base = new URL("../../migrations/", import.meta.url);
  const nomes = (await readdir(base)).filter((nome) => nome.endsWith(".sql")).sort();
  for (const nome of nomes) {
    await db.exec(await readFile(new URL(nome, base), "utf8"));
  }
  return db;
}

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

test("validador vazio não admite e o kernel não se aprova", async () => {
  const empty = await admit({
    workOrderId: "wo-1",
    policyCodes: ["publicar"],
    rules: [allow],
    validators: [],
    approverId: "admin-1",
  });
  assert.equal(empty.outcome, "reject");
  assert.equal(empty.reason, "validators-required");

  const self = await admit({
    workOrderId: "wo-1",
    policyCodes: ["publicar"],
    rules: [allow],
    validators: [true],
    approverId: "kernel",
  });
  assert.equal(self.outcome, "hold");
  assert.equal(self.reason, "independent-approval-required");
  assert.deepEqual(manifestStatus(self, "kernel"), { status: "draft", approvedBy: null });

  const denied = await admit({
    workOrderId: "wo-1",
    policyCodes: ["publicar"],
    rules: [{ code: "publicar", active: true, effect: "deny" }],
    validators: [true],
    approverId: "admin-1",
  });
  assert.equal(denied.reason, "policy-denied:publicar");

  const admitted = await admit({
    workOrderId: "wo-1",
    policyCodes: ["publicar"],
    rules: [allow],
    validators: [true],
    approverId: "admin-1",
  });
  assert.equal(admitted.outcome, "admit");
  assert.deepEqual(manifestStatus(admitted, "admin-1"), { status: "approved", approvedBy: "admin-1" });
});

test("a admissão grava tabela, decide pelo kernel e não aprova sem validador", async () => {
  const db = await bancoDeTeste();
  const sql = asSql(db);
  await db.exec(`
    insert into kernel_order (id, title, approver_id, owner_id, source_ref, hash, acceptance_criteria) values
      ('wo-vazio', 'Sem validador', 'admin-1', 'dono-1', 'source://x', repeat('a', 64), array['tem-atestado']),
      ('wo-sem-manifesto', 'Sem manifesto', 'admin-1', 'dono-1', 'source://x', repeat('a', 64), array['tem-atestado']),
      ('wo-nega', 'Regra negada', 'admin-1', 'dono-1', 'source://x', repeat('a', 64), array['tem-atestado']),
      ('wo-ok', 'Completa', 'revisor-1', 'dono-1', 'source://x', repeat('a', 64), array['tem-atestado']);
    insert into kernel_order_policy (order_id, package_id, rule_id) values
      ('wo-vazio', 'acesso', 'admin-publica-idioma'),
      ('wo-sem-manifesto', 'acesso', 'admin-publica-idioma'),
      ('wo-nega', 'acesso', 'agente-nao-publica'),
      ('wo-ok', 'acesso', 'admin-publica-idioma');
    insert into kernel_validator (order_id, id, passed, note) values
      ('wo-nega', 'forma', true, 'Conferido'),
      ('wo-ok', 'forma', true, 'Conferido');
  `);

  // Sem manifesto: o kernel segura e diz por quê.
  const semManifesto = await admitOrder(sql, "wo-sem-manifesto");
  assert.equal(semManifesto.outcome, "hold");
  assert.equal(semManifesto.reason, "manifest-required");

  // Regra que nega: o kernel recusa e nomeia a regra.
  const negada = await admitOrder(sql, "wo-nega");
  assert.equal(negada.outcome, "reject");
  assert.equal(negada.reason, "policy-denied:agente-nao-publica");

  // Pedido sem validador: o kernel recusa.
  const semValidador = await admitOrder(sql, "wo-vazio");
  assert.equal(semValidador.outcome, "hold");
  assert.equal(semValidador.reason, "manifest-required");

  // A cadeia completa: ordem → manifesto → aprovação humana → decisão.
  const aprovacao = await aprovarManifesto(sql, { orderId: "wo-ok", approverId: "revisor-1" });
  assert.equal(aprovacao.ok, true, `a aprovação falhou: ${aprovacao.motivo}`);

  const admitida = await admitOrder(sql, "wo-ok");
  assert.equal(admitida.outcome, "admit");
  assert.equal(admitida.reason, "independent-approval-policy-and-validators-passed");

  const rows = await db.query<{
    id: string;
    status: string;
    reason: string;
    manifest: string;
    approved_by: string | null;
    manifest_hash: string | null;
    approved_at: unknown;
  }>(`
    select o.id, o.status, o.reason, m.status as manifest, m.approved_by,
           m.hash as manifest_hash, m.approved_at
    from kernel_order o
    left join kernel_manifest m on m.order_id = o.id
    order by o.id
  `);
  const byId = new Map(rows.rows.map((row) => [row.id, row]));
  assert.equal(byId.get("wo-vazio")?.status, "em_espera");
  assert.equal(byId.get("wo-vazio")?.manifest, "rascunho");
  assert.equal(byId.get("wo-vazio")?.approved_by, null);
  assert.equal(byId.get("wo-sem-manifesto")?.status, "em_espera");
  assert.equal(byId.get("wo-nega")?.status, "rejeitada");
  assert.equal(byId.get("wo-nega")?.approved_by, null);
  assert.equal(byId.get("wo-ok")?.status, "admitida");
  assert.equal(byId.get("wo-ok")?.manifest, "aprovado");
  assert.equal(byId.get("wo-ok")?.approved_by, "revisor-1");
  assert.equal(byId.get("wo-ok")?.manifest_hash, "a".repeat(64));
  assert.ok(byId.get("wo-ok")?.approved_at, "o manifesto aprovado tem data de aprovação");

  // A decisão fica registrada: policy_decision com regra, e a trilha de auditoria.
  const decisoes = await db.query<{ id: string; rule_id: string | null; effect: string; action: string }>(
    "select id, rule_id, effect, action from policy_decision where action = 'admitir_ordem' order by id",
  );
  assert.equal(decisoes.rows.length, 4, "as quatro decisões avaliadas ficam registradas");
  const permitir = decisoes.rows.find((linha) => linha.effect === "allow");
  assert.ok(permitir, "a admissão tem uma decisão allow");
  assert.equal(permitir?.rule_id, "admin-publica-idioma");

  const trilha = await db.query<{ id: string }>(
    "select id from audit_event where action = 'decidir_admissao' and entity_id = 'wo-ok'",
  );
  assert.equal(trilha.rows.length, 1, "a decisão tem trilha de auditoria");

  await db.close();
});

test("o dono do pedido não aprova o próprio pedido", async () => {
  const db = await bancoDeTeste();
  const sql = asSql(db);
  await db.exec(`
    insert into kernel_order (id, title, approver_id, owner_id, source_ref, hash, acceptance_criteria)
    values ('wo-proprio', 'Do próprio dono', 'revisor-1', 'dono-1', 'source://x', repeat('a', 64), array['tem-atestado']);
    insert into kernel_order_policy (order_id, package_id, rule_id)
    values ('wo-proprio', 'acesso', 'admin-publica-idioma');
    insert into kernel_validator (order_id, id, passed, note)
    values ('wo-proprio', 'forma', true, 'Conferido');
  `);
  const peloDono = await aprovarManifesto(sql, { orderId: "wo-proprio", approverId: "dono-1" });
  assert.equal(peloDono.ok, false);
  assert.match(peloDono.motivo, /independente/);

  const peloKernel = await aprovarManifesto(sql, { orderId: "wo-proprio", approverId: "kernel" });
  assert.equal(peloKernel.ok, false);
  assert.match(peloKernel.motivo, /kernel/);

  await db.close();
});
