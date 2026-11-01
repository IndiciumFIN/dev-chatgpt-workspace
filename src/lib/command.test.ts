import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { controlRunTx, replayEventsTx, submitCommandTx } from "./command.ts";

function tagged(query: (text: string, params: unknown[]) => Promise<unknown[]>) {
  return async <T>(strings: TemplateStringsArray, ...values: unknown[]) => {
    let text = strings[0];
    for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
    return query(text, values) as Promise<T[]>;
  };
}

async function db() {
  const pg = new PGlite();
  await pg.exec(await readFile(new URL("../../migrations/0011_command.sql", import.meta.url), "utf8"));
  const sql = tagged(async (text, params) => (await pg.query(text, params)).rows);
  return { pg, sql };
}

test("consulta não abre corrida e execução fechada fica recusada", async () => {
  const { pg, sql } = await db();
  const consult = await submitCommandTx(sql, { workOrderId: "wo-leitura", mode: "consulta", body: "Quantas ordens há?", actorId: "pessoa", idempotencyKey: "consulta01" });
  assert.equal(consult.status, "aceito");
  assert.equal(consult.runId, null);
  const runs = await pg.query("select id from cmd_run");
  assert.equal(runs.rows.length, 0);
  const denied = await submitCommandTx(sql, { workOrderId: "wo-publicacao", mode: "execucao", body: "Publicar", actorId: "pessoa", idempotencyKey: "publicar1" });
  assert.equal(denied.status, "recusado");
  assert.equal(denied.runId, null);
  const order = await pg.query("select status from work_order where id = 'wo-publicacao'");
  assert.equal((order.rows[0] as { status: string }).status, "homologada");
});

test("execução pronta grava uma corrida e a mesma chave não duplica", async () => {
  const { pg, sql } = await db();
  const first = await submitCommandTx(sql, { workOrderId: "wo-leitura", mode: "execucao", body: "Ler a mesa", actorId: "pessoa", idempotencyKey: "leitura01" });
  const second = await submitCommandTx(sql, { workOrderId: "wo-leitura", mode: "execucao", body: "Ler de novo", actorId: "pessoa", idempotencyKey: "leitura01" });
  assert.equal(first.runId, second.runId);
  const runs = await pg.query("select status from cmd_run");
  assert.equal(runs.rows.length, 1);
  await assert.rejects(() => submitCommandTx(sql, { workOrderId: "wo-leitura", mode: "execucao", body: "Outra", actorId: "pessoa", idempotencyKey: "leitura02" }), /ativa/);
});

test("pausar, cancelar e retomar preservam a sequência", async () => {
  const { pg, sql } = await db();
  const started = await submitCommandTx(sql, { workOrderId: "wo-leitura", mode: "execucao", body: "Ler", actorId: "pessoa", idempotencyKey: "leitura03" });
  await controlRunTx(sql, { runId: started.runId!, action: "pausar", actorId: "pessoa" });
  await controlRunTx(sql, { runId: started.runId!, action: "cancelar", actorId: "pessoa" });
  const events = await replayEventsTx(sql, started.runId!, 1);
  assert.equal(events.map((event) => event.seq).join(","), "2,3");
  const kept = await pg.query("select count(*)::int as n from cmd_event where run_id = $1", [started.runId]);
  assert.equal((kept.rows[0] as { n: number }).n, 3);
  const order = await pg.query("select status from work_order where id = 'wo-leitura'");
  assert.equal((order.rows[0] as { status: string }).status, "pronta");
});
