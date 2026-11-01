import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { assertAdminRole, assertProductionAuth } from "@/lib/publish-guard";
import { controlRunTx, replayEventsTx, submitCommandTx, type CommandMode, type RunControl } from "@/lib/command";

async function adminSql(userId: string) {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<{ role: string }>`select role from member where user_id = ${userId}`;
  assertAdminRole(rows[0]?.role);
  return sql;
}

function asBool(value: unknown) {
  return value === true || value === "t" || value === "true" || value === 1;
}

function stamp(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  return String(value ?? "");
}

export const readCommandDesk = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator((input: { project?: string; environment?: string; days?: number }) => {
    const project = input?.project ?? "";
    const environment = input?.environment ?? "";
    const days = input?.days ?? 0;
    if (!/^[a-z0-9-]{0,40}$/.test(project) || !/^[a-z0-9-]{0,40}$/.test(environment)) throw new Error("Filtro inválido.");
    if (days !== 0 && days !== 7 && days !== 30) throw new Error("Período inválido.");
    return { project, environment, days };
  })
  .handler(async ({ context, data }) => {
    const sql = await adminSql(context.userId);
    const since = data.days === 0 ? 0 : Date.now() - data.days * 86_400_000;
    const orders = (await sql<{
      id: string; project: string; environment: string; title: string; status: string; gate_open: unknown; block_reason: string | null; created_at: unknown;
    }>`select id, project, environment, title, status, gate_open, block_reason, created_at from work_order order by created_at`)
      .filter((row) => (data.project === "" || row.project === data.project) && (data.environment === "" || row.environment === data.environment) && (since === 0 || new Date(stamp(row.created_at)).getTime() >= since))
      .map((row) => ({
        id: row.id,
        project: row.project,
        environment: row.environment,
        title: row.title,
        status: row.status,
        gateOpen: asBool(row.gate_open),
        blockReason: row.block_reason,
        createdAt: stamp(row.created_at),
      }));
    const ids = orders.map((order) => order.id);
    const runs = ids.length
      ? (await sql<{ id: string; work_order_id: string; attempt: number; status: string; created_at: unknown }>`select id, work_order_id, attempt, status, created_at from cmd_run order by created_at`)
          .filter((row) => ids.includes(row.work_order_id))
          .map((row) => ({ id: row.id, workOrderId: row.work_order_id, attempt: Number(row.attempt), status: row.status, createdAt: stamp(row.created_at) }))
      : [];
    const commands = ids.length
      ? (await sql<{ id: string; work_order_id: string | null; mode: string; status: string; reason: string; correlation_id: string; created_at: unknown }>`select id, work_order_id, mode, status, reason, correlation_id, created_at from cmd_command order by created_at desc`)
          .filter((row) => row.work_order_id !== null && ids.includes(row.work_order_id))
          .map((row) => ({ id: row.id, workOrderId: row.work_order_id, mode: row.mode, status: row.status, reason: row.reason, correlationId: row.correlation_id, createdAt: stamp(row.created_at) }))
      : [];
    const runIds = new Set(runs.map((run) => run.id));
    const events = runIds.size
      ? (await sql<{ id: string; run_id: string; seq: number; event_type: string; detail: string }>`select id, run_id, seq, event_type, detail from cmd_event order by seq`)
          .filter((row) => runIds.has(row.run_id))
          .map((row) => ({ id: row.id, runId: row.run_id, seq: Number(row.seq), eventType: row.event_type, detail: row.detail }))
      : [];
    return { orders, runs, commands, events, readAt: new Date().toISOString() };
  });

export const submitCommand = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input: { workOrderId: string | null; mode: CommandMode; body: string; idempotencyKey: string }) => {
    if (input?.workOrderId !== null && (typeof input?.workOrderId !== "string" || !/^[a-z0-9-]{1,80}$/.test(input.workOrderId))) throw new Error("Ordem inválida.");
    if (!["consulta", "preparacao", "execucao"].includes(input?.mode)) throw new Error("Modo inválido.");
    if (typeof input?.body !== "string" || typeof input?.idempotencyKey !== "string") throw new Error("Pedido inválido.");
    return input;
  })
  .handler(async ({ context, data }) => {
    assertProductionAuth();
    await adminSql(context.userId);
    const { withSqlTransaction } = await import("@/lib/db");
    return withSqlTransaction((sql) => submitCommandTx(sql, { ...data, actorId: context.userId }));
  });

export const controlRun = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input: { runId: string; action: RunControl }) => {
    if (typeof input?.runId !== "string" || !/^[a-zA-Z0-9-]{8,80}$/.test(input.runId)) throw new Error("Corrida inválida.");
    if (!["pausar", "retomar", "cancelar", "concluir"].includes(input?.action)) throw new Error("Ação inválida.");
    return input;
  })
  .handler(async ({ context, data }) => {
    assertProductionAuth();
    await adminSql(context.userId);
    const { withSqlTransaction } = await import("@/lib/db");
    return withSqlTransaction((sql) => controlRunTx(sql, { ...data, actorId: context.userId }));
  });

export const replayCommand = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator((input: { runId: string; after: number }) => {
    if (typeof input?.runId !== "string" || !/^[a-zA-Z0-9-]{8,80}$/.test(input.runId)) throw new Error("Corrida inválida.");
    if (!Number.isInteger(input?.after) || input.after < 0) throw new Error("Sequência inválida.");
    return input;
  })
  .handler(async ({ context, data }) => {
    const sql = await adminSql(context.userId);
    const { withSqlTransaction } = await import("@/lib/db");
    const events = await withSqlTransaction((tx) => replayEventsTx(tx, data.runId, data.after));
    void sql;
    return { events, readAt: new Date().toISOString() };
  });
