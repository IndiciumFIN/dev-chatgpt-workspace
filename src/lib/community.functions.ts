import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export type PlanStatus = "pedido" | "ativo" | "recusado";

export type CommunityPost = {
  id: string;
  body: string;
  hidden: boolean;
  createdAt: string;
  author: string;
};

function asBool(value: unknown) {
  return value === true || value === "t" || value === "true" || value === 1;
}

async function sqlClient() {
  const { getSql } = await import("@/lib/db");
  return getSql();
}

async function roleOf(sql: Awaited<ReturnType<typeof sqlClient>>, userId: string) {
  const rows = await sql<{ role: string }>`select role from member where user_id = ${userId}`;
  return rows[0]?.role === "admin" ? "admin" : "subscriber";
}

async function statusOf(sql: Awaited<ReturnType<typeof sqlClient>>, userId: string): Promise<PlanStatus | null> {
  const rows = await sql<{ status: string }>`select status from subscription where user_id = ${userId}`;
  const status = rows[0]?.status;
  if (status === "pedido" || status === "ativo" || status === "recusado") return status;
  return null;
}

export const myPlan = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await sqlClient();
    const role = await roleOf(sql, context.userId);
    const status = await statusOf(sql, context.userId);
    return { role, status, community: role === "admin" || status === "ativo" };
  });

export const requestPlan = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await sqlClient();
    const current = await statusOf(sql, context.userId);
    if (current === "ativo") return { status: "ativo" as const };
    await sql`
      insert into subscription (user_id, status)
      values (${context.userId}, 'pedido')
      on conflict (user_id) do update set status = 'pedido', updated_at = now()
    `;
    return { status: "pedido" as const };
  });

export const planQueue = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await sqlClient();
    if ((await roleOf(sql, context.userId)) !== "admin") throw new Error("Somente o administrador libera a assinatura.");
    const rows = await sql<{ user_id: string; status: PlanStatus; name: string | null; email: string | null }>`
      select s.user_id, s.status, u.name, u.email
      from subscription s
      left join "user" u on u.id = s.user_id
      order by s.updated_at desc
    `;
    return rows.map((row) => ({
      userId: row.user_id,
      status: row.status,
      name: row.name ?? "Sem nome",
      email: row.email ?? "",
    }));
  });

export const decidePlan = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { userId: string; status: "ativo" | "recusado" }) => {
    if (!input.userId || (input.status !== "ativo" && input.status !== "recusado")) {
      throw new Error("Decisão inválida.");
    }
    return input;
  })
  .handler(async ({ context, data }) => {
    const sql = await sqlClient();
    if ((await roleOf(sql, context.userId)) !== "admin") throw new Error("Somente o administrador libera a assinatura.");
    await sql`
      update subscription set status = ${data.status}, updated_at = now() where user_id = ${data.userId}
    `;
    return { ok: true };
  });

export const communityBoard = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await sqlClient();
    const role = await roleOf(sql, context.userId);
    const status = await statusOf(sql, context.userId);
    const admin = role === "admin";
    if (!admin && status !== "ativo") return { locked: true, posts: [] as CommunityPost[] };
    const rows = admin
      ? await sql<{ id: string; body: string; hidden: unknown; created_at: string; name: string | null }>`
          select p.id, p.body, p.hidden, p.created_at::text as created_at, u.name
          from community_post p
          left join "user" u on u.id = p.user_id
          order by p.created_at desc
          limit 40
        `
      : await sql<{ id: string; body: string; hidden: unknown; created_at: string; name: string | null }>`
          select p.id, p.body, p.hidden, p.created_at::text as created_at, u.name
          from community_post p
          left join "user" u on u.id = p.user_id
          where p.hidden = false
          order by p.created_at desc
          limit 40
        `;
    return {
      locked: false,
      posts: rows.map((row) => ({
        id: row.id,
        body: row.body,
        hidden: asBool(row.hidden),
        createdAt: row.created_at,
        author: row.name ?? "Conta",
      })),
    };
  });

export const publishPost = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { body: string }) => {
    const body = input.body.trim();
    if (body.length < 8 || body.length > 500) throw new Error("O recado precisa ter entre 8 e 500 caracteres.");
    return { body };
  })
  .handler(async ({ context, data }) => {
    const sql = await sqlClient();
    const role = await roleOf(sql, context.userId);
    const status = await statusOf(sql, context.userId);
    if (role !== "admin" && status !== "ativo") throw new Error("A comunidade abre com a assinatura ativa.");
    const id = crypto.randomUUID();
    await sql`
      insert into community_post (id, user_id, body) values (${id}, ${context.userId}, ${data.body})
    `;
    return { id };
  });

export const hidePost = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; hidden: boolean }) => {
    if (!input.id) throw new Error("Recado inválido.");
    return { id: input.id, hidden: input.hidden === true };
  })
  .handler(async ({ context, data }) => {
    const sql = await sqlClient();
    if ((await roleOf(sql, context.userId)) !== "admin") throw new Error("Somente o administrador modera a comunidade.");
    await sql`update community_post set hidden = ${data.hidden} where id = ${data.id}`;
    return { ok: true };
  });
