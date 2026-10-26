type Tx = <T>(strings: TemplateStringsArray, ...values: unknown[]) => Promise<T[]>;

export type CommandMode = "consulta" | "preparacao" | "execucao";
export type RunControl = "pausar" | "retomar" | "cancelar" | "concluir";

type Order = { id: string; status: string; gate_open: unknown; block_reason: string | null };

function open(value: unknown) {
  return value === true || value === "t" || value === "true" || value === 1;
}

function secret(body: string) {
  return /api[_-]?key|bearer\s+|senha\s*[:=]|password\s*[:=]/i.test(body);
}

async function orderOf(sql: Tx, id: string | null) {
  if (!id) return null;
  const rows = await sql<Order>`select id, status, gate_open, block_reason from work_order where id = ${id}`;
  return rows[0] ?? null;
}

async function addEvent(sql: Tx, runId: string, type: string, detail: string, actorId: string) {
  const rows = await sql<{ n: number }>`select coalesce(max(seq), 0)::int as n from cmd_event where run_id = ${runId}`;
  const seq = Number(rows[0]?.n ?? 0) + 1;
  await sql`
    insert into cmd_event (id, run_id, seq, event_type, detail, actor_id)
    values (${crypto.randomUUID()}, ${runId}, ${seq}, ${type}, ${detail}, ${actorId})
  `;
  return seq;
}

export async function submitCommandTx(
  sql: Tx,
  input: { workOrderId: string | null; mode: CommandMode; body: string; actorId: string; idempotencyKey: string },
) {
  const body = input.body.trim();
  if (!body) throw new Error("Escreva o pedido.");
  if (!/^[a-zA-Z0-9-]{8,80}$/.test(input.idempotencyKey)) throw new Error("Chave de pedido inválida.");
  const correlationId = crypto.randomUUID();
  const commandId = crypto.randomUUID();
  const stored = secret(body) ? "[removido]" : body.slice(0, 2000);
  if (secret(body)) {
    await sql`
      insert into cmd_command (id, work_order_id, mode, body, actor_id, correlation_id, status, reason)
      values (${commandId}, ${input.workOrderId}, ${input.mode}, ${stored}, ${input.actorId}, ${correlationId}, ${"recusado"}, ${"O pedido parece conter segredo. O texto não foi guardado."})
    `;
    return { status: "recusado" as const, correlationId, runId: null as string | null, reason: "O pedido parece conter segredo. O texto não foi guardado." };
  }
  if (input.mode !== "execucao") {
    const reason = input.mode === "consulta"
      ? "Consulta aceita. Não alterou ordem, não chamou modelo e não gravou paciente."
      : "Preparação aceita nesta mesa. Não virou artefato nem pedido de execução.";
    await sql`
      insert into cmd_command (id, work_order_id, mode, body, actor_id, correlation_id, status, reason)
      values (${commandId}, ${input.workOrderId}, ${input.mode}, ${stored}, ${input.actorId}, ${correlationId}, ${"aceito"}, ${reason})
    `;
    return { status: "aceito" as const, correlationId, runId: null, reason };
  }
  const order = await orderOf(sql, input.workOrderId);
  const same = await sql<{ id: string; status: string }>`select id, status from cmd_run where idempotency_key = ${input.idempotencyKey}`;
  if (same[0]) return { status: "aceito" as const, correlationId, runId: same[0].id, reason: "Pedido já registrado. A corrida anterior foi reaproveitada." };
  if (order) {
    const active = await sql<{ id: string }>`select id from cmd_run where work_order_id = ${order.id} and status in (${"em_curso"}, ${"pausada"})`;
    if (active[0]) throw new Error("Já existe corrida ativa nesta ordem.");
  }
  if (!order || order.status !== "pronta" || !open(order.gate_open)) {
    const reason = order?.block_reason || "Execução recusada. A ordem não está pronta ou o portão está fechado.";
    await sql`
      insert into cmd_command (id, work_order_id, mode, body, actor_id, correlation_id, status, reason)
      values (${commandId}, ${input.workOrderId}, ${"execucao"}, ${stored}, ${input.actorId}, ${correlationId}, ${"recusado"}, ${reason})
    `;
    return { status: "recusado" as const, correlationId, runId: null, reason };
  }
  const attemptRow = await sql<{ n: number }>`select coalesce(max(attempt), 0)::int as n from cmd_run where work_order_id = ${order.id}`;
  const attempt = Number(attemptRow[0]?.n ?? 0) + 1;
  const runId = crypto.randomUUID();
  await sql`
    insert into cmd_command (id, work_order_id, mode, body, actor_id, correlation_id, status, reason)
    values (${commandId}, ${order.id}, ${"execucao"}, ${stored}, ${input.actorId}, ${correlationId}, ${"aceito"}, ${"Execução aceita. A corrida ficou gravada."})
  `;
  await sql`
    insert into cmd_run (id, work_order_id, command_id, attempt, status, idempotency_key, actor_id)
    values (${runId}, ${order.id}, ${commandId}, ${attempt}, ${"em_curso"}, ${input.idempotencyKey}, ${input.actorId})
  `;
  await sql`update work_order set status = ${"em_curso"} where id = ${order.id}`;
  await addEvent(sql, runId, "iniciada", "Corrida gravada. Nenhuma etapa foi inventada.", input.actorId);
  return { status: "aceito" as const, correlationId, runId, reason: "Execução aceita. A corrida ficou gravada." };
}

export async function controlRunTx(sql: Tx, input: { runId: string; action: RunControl; actorId: string }) {
  const runs = await sql<{ id: string; work_order_id: string; status: string }>`
    select id, work_order_id, status from cmd_run where id = ${input.runId}
  `;
  const run = runs[0];
  if (!run) throw new Error("Corrida fora da mesa.");
  const order = await orderOf(sql, run.work_order_id);
  if (!order) throw new Error("Ordem fora da mesa.");
  if (input.action === "pausar") {
    if (run.status !== "em_curso") throw new Error("Só é possível pausar uma corrida em curso.");
    await sql`update cmd_run set status = ${"pausada"} where id = ${run.id} and status = ${"em_curso"}`;
    await addEvent(sql, run.id, "pausada", "Pausa gravada. Os eventos anteriores permanecem.", input.actorId);
    return { status: "pausada" as const };
  }
  if (input.action === "retomar") {
    if (run.status !== "pausada" || !open(order.gate_open)) throw new Error("Retomar exige corrida pausada e portão aberto.");
    await sql`update cmd_run set status = ${"em_curso"} where id = ${run.id} and status = ${"pausada"}`;
    await addEvent(sql, run.id, "retomada", "Corrida retomada sem nova tentativa.", input.actorId);
    return { status: "em_curso" as const };
  }
  if (input.action === "cancelar") {
    if (run.status !== "em_curso" && run.status !== "pausada") throw new Error("Só é possível cancelar uma corrida ativa.");
    await sql`update cmd_run set status = ${"cancelada"} where id = ${run.id} and status in (${"em_curso"}, ${"pausada"})`;
    await sql`update work_order set status = ${open(order.gate_open) ? "pronta" : "bloqueada"} where id = ${order.id}`;
    await addEvent(sql, run.id, "cancelada", "Cancelada. A tentativa não foi apagada.", input.actorId);
    return { status: "cancelada" as const };
  }
  if (run.status !== "em_curso") throw new Error("Só é possível concluir uma corrida em curso.");
  await sql`update cmd_run set status = ${"concluida"} where id = ${run.id} and status = ${"em_curso"}`;
  await sql`update work_order set status = ${"pronta"} where id = ${order.id} and gate_open = true`;
  await addEvent(sql, run.id, "concluida", "Leitura registrada. Nenhum conteúdo foi publicado.", input.actorId);
  return { status: "concluida" as const };
}

export async function replayEventsTx(sql: Tx, runId: string, after: number) {
  return sql<{ seq: number; event_type: string; detail: string }>`
    select seq, event_type, detail from cmd_event
    where run_id = ${runId} and seq > ${after}
    order by seq
  `;
}
