import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { decide } from "@/lib/policy-decision";
import { assertProductionAuth } from "@/lib/publish-guard";

const modules = new Set(["M02", "M13", "M14", "M15", "M18", "M20", "M21", "M22"]);
const orderStatus = new Set(["homologada", "pronta", "em_curso", "concluida", "bloqueada", "cancelada"]);

export type OpsRow = {
  id: string;
  moduleId: string;
  kind: string;
  title: string;
  status: string;
  detail: string;
};

export type OrderRow = {
  id: string;
  project: string;
  environment: string;
  title: string;
  status: string;
  gateOpen: boolean;
  blockReason: string;
};

function asBool(value: unknown) {
  return value === true || value === "t" || value === "true" || value === 1;
}

async function adminSql(userId: string) {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<{ role: string }>`select role from member where user_id = ${userId}`;
  if (rows[0]?.role !== "admin") throw new Error("Só o administrador grava esta mesa.");
  return sql;
}

export const readOps = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator((input: { moduleId: string }) => {
    if (!modules.has(input.moduleId)) throw new Error("Módulo fora do registro.");
    return { moduleId: input.moduleId };
  })
  .handler(async ({ context, data }) => {
    const sql = await adminSql(context.userId);
    const rows = await sql<{ id: string; module_id: string; kind: string; title: string; status: string; detail: string }>`
      select id, module_id, kind, title, status, detail from ops_record where module_id = ${data.moduleId} order by title
    `;
    return rows.map((row) => ({
      id: row.id,
      moduleId: row.module_id,
      kind: row.kind,
      title: row.title,
      status: row.status,
      detail: row.detail,
    })) satisfies OpsRow[];
  });

export const saveOps = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input: { id: string; moduleId: string; kind: string; title: string; status: string; detail: string; kinds: string[]; statuses: string[] }) => {
    const title = input.title.trim();
    const detail = input.detail.trim();
    if (!modules.has(input.moduleId)) throw new Error("Módulo fora do registro.");
    if (!input.kinds.includes(input.kind) || !input.statuses.includes(input.status)) throw new Error("Tipo ou estado fora deste módulo.");
    if (title.length < 3 || title.length > 120 || detail.length > 2000) throw new Error("Título ou nota fora do limite.");
    return { id: input.id, moduleId: input.moduleId, kind: input.kind, title, status: input.status, detail };
  })
  .handler(async ({ context, data }) => {
    assertProductionAuth();
    const { withSqlTransaction } = await import("@/lib/db");
    const id = data.id || crypto.randomUUID();
    await withSqlTransaction(async (sql) => {
      const role = await sql<{ role: string }>`select role from member where user_id = ${context.userId}`;
      if (role[0]?.role !== "admin") throw new Error("Só o administrador grava esta mesa.");
      await decide(sql, { action: "gravar_registro", role: "admin", actorId: context.userId });
      await sql`
        insert into ops_record (id, module_id, kind, title, status, detail, updated_at)
        values (${id}, ${data.moduleId}, ${data.kind}, ${data.title}, ${data.status}, ${data.detail}, now())
        on conflict (id) do update
        set kind = excluded.kind, title = excluded.title, status = excluded.status, detail = excluded.detail, updated_at = now()
        where ops_record.module_id = ${data.moduleId}
      `;
      await sql`
        insert into audit_event (id, actor_id, action, entity, entity_id)
        values (${crypto.randomUUID()}, ${context.userId}, ${"gravar_registro"}, ${"ops_record"}, ${id})
      `;
    });
    return { id };
  });

export const removeOps = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input: { id: string; moduleId: string }) => {
    if (!modules.has(input.moduleId) || !input.id) throw new Error("Registro fora da mesa.");
    return input;
  })
  .handler(async ({ context, data }) => {
    assertProductionAuth();
    const { withSqlTransaction } = await import("@/lib/db");
    await withSqlTransaction(async (sql) => {
      const role = await sql<{ role: string }>`select role from member where user_id = ${context.userId}`;
      if (role[0]?.role !== "admin") throw new Error("Só o administrador grava esta mesa.");
      await decide(sql, { action: "gravar_registro", role: "admin", actorId: context.userId });
      await sql`delete from ops_record where id = ${data.id} and module_id = ${data.moduleId}`;
      await sql`
        insert into audit_event (id, actor_id, action, entity, entity_id)
        values (${crypto.randomUUID()}, ${context.userId}, ${"excluir_registro"}, ${"ops_record"}, ${data.id})
      `;
    });
    return { ok: true as const };
  });

export const readFormulas = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await adminSql(context.userId);
    return sql<{ tool_slug: string; method: string; statement: string }>`
      select tool_slug, method, statement from tool_formula order by tool_slug
    `;
  });

export const saveOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input: OrderRow) => {
    const title = input.title.trim();
    const project = input.project.trim();
    const environment = input.environment.trim();
    const blockReason = input.blockReason.trim();
    if (!/^[a-z0-9-]{1,40}$/.test(project) || !/^[a-z0-9-]{1,40}$/.test(environment)) throw new Error("Projeto ou ambiente fora do padrão.");
    if (!orderStatus.has(input.status) || title.length < 3 || title.length > 120 || blockReason.length > 400) throw new Error("Ordem fora do limite.");
    return { id: input.id, project, environment, title, status: input.status, gateOpen: input.gateOpen === true, blockReason };
  })
  .handler(async ({ context, data }) => {
    assertProductionAuth();
    const { withSqlTransaction } = await import("@/lib/db");
    const id = data.id || `wo-${crypto.randomUUID().slice(0, 8)}`;
    await withSqlTransaction(async (sql) => {
      const role = await sql<{ role: string }>`select role from member where user_id = ${context.userId}`;
      if (role[0]?.role !== "admin") throw new Error("Só o administrador grava esta mesa.");
      await decide(sql, { action: "gravar_ordem", role: "admin", actorId: context.userId });
      await sql`
        insert into work_order (id, project, environment, title, status, gate_open, block_reason)
        values (${id}, ${data.project}, ${data.environment}, ${data.title}, ${data.status}, ${data.gateOpen}, ${data.blockReason || null})
        on conflict (id) do update
        set project = excluded.project, environment = excluded.environment, title = excluded.title,
            status = excluded.status, gate_open = excluded.gate_open, block_reason = excluded.block_reason
      `;
      await sql`
        insert into audit_event (id, actor_id, action, entity, entity_id)
        values (${crypto.randomUUID()}, ${context.userId}, ${"gravar_ordem"}, ${"work_order"}, ${id})
      `;
    });
    return { id };
  });

export const readOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await adminSql(context.userId);
    const rows = await sql<{ id: string; project: string; environment: string; title: string; status: string; gate_open: unknown; block_reason: string | null }>`
      select id, project, environment, title, status, gate_open, block_reason from work_order order by title
    `;
    return rows.map((row) => ({
      id: row.id,
      project: row.project,
      environment: row.environment,
      title: row.title,
      status: row.status,
      gateOpen: asBool(row.gate_open),
      blockReason: row.block_reason ?? "",
    })) satisfies OrderRow[];
  });
