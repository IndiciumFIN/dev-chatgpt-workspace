import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { tools } from "@/lib/tools/catalog";

export type SourceRole = "admin" | "subscriber";

export type SourceTool = {
  slug: string;
  kind: string;
  title: string;
  lead: string;
  published: boolean;
};

export type SourcePerson = {
  userId: string;
  role: SourceRole;
  name: string;
  email: string;
};

const known = new Set(tools.map((tool) => tool.slug));

function asBool(value: unknown) {
  return value === true || value === "t" || value === "true" || value === 1;
}

async function sqlClient() {
  const { getSql } = await import("@/lib/db");
  return getSql();
}

async function requireAdmin(sql: Awaited<ReturnType<typeof sqlClient>>, userId: string) {
  const rows = await sql<{ role: string }>`select role from member where user_id = ${userId}`;
  if (rows[0]?.role !== "admin") throw new Error("Somente o administrador altera a fonte.");
}

export const readCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await sqlClient();
  const rows = await sql<{ slug: string; kind: string; title: string; lead: string; published: unknown }>`
    select slug, kind, title, lead, published from source_tool where published = true order by title
  `;
  return rows.map((row) => ({ ...row, published: asBool(row.published) })) satisfies SourceTool[];
});

export const ensureRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await sqlClient();
    // Authentication does not imply authorization. The first visitor cannot become an admin.
    // Provision initial admin only through a separately approved, audited server-side WO.
    await sql`
      insert into member (user_id, role)
      values (${context.userId}, 'subscriber')
      on conflict (user_id) do nothing
    `;
    const rows = await sql<{ role: SourceRole }>`select role from member where user_id = ${context.userId}`;
    return { role: rows[0]?.role === "admin" ? "admin" : "subscriber" } as const;
  });

export const adminDesk = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await sqlClient();
    await requireAdmin(sql, context.userId);
    const catalog = await sql<{ slug: string; kind: string; title: string; lead: string; published: unknown }>`
      select slug, kind, title, lead, published from source_tool order by title
    `;
    const people = await sql<{ user_id: string; role: SourceRole; name: string | null; email: string | null }>`
      select m.user_id, m.role, u.name, u.email
      from member m
      left join "user" u on u.id = m.user_id
      order by u.name
    `;
    return {
      tools: catalog.map((row) => ({ ...row, published: asBool(row.published) })) satisfies SourceTool[],
      people: people.map((person) => ({
        userId: person.user_id,
        role: person.role === "admin" ? "admin" : "subscriber",
        name: person.name ?? "Sem nome",
        email: person.email ?? "",
      })) satisfies SourcePerson[],
    };
  });

export const saveTool = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input: { slug: string; title: string; lead: string; published: boolean }) => {
    const title = input.title.trim();
    const lead = input.lead.trim();
    if (!known.has(input.slug) || title.length < 3 || title.length > 80 || lead.length < 10 || lead.length > 400) {
      throw new Error("Título ou texto fora do limite.");
    }
    // Published state is not authorized by a role check or the client form.
    if (input.published === true) throw new Error("Publicação exige decisão verificada do Kernel.");
    return { slug: input.slug, title, lead, published: input.published === true };
  })
  .handler(async ({ context, data }) => {
    const sql = await sqlClient();
    await requireAdmin(sql, context.userId);
    await sql`
      update source_tool
      set title = ${data.title}, lead = ${data.lead}, published = ${data.published}, updated_at = now()
      where slug = ${data.slug}
    `;
    return { ok: true };
  });

export const setMemberRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input: { userId: string; role: SourceRole }) => {
    if (!input.userId || (input.role !== "admin" && input.role !== "subscriber")) {
      throw new Error("Papel inválido.");
    }
    // Manual admin elevation is forbidden without independent maker-checker authorization.
    if (input.role === "admin") throw new Error("Elevação administrativa requer WO e Kernel.");
    return input;
  })
  .handler(async ({ context, data }) => {
    const sql = await sqlClient();
    await requireAdmin(sql, context.userId);
    if (data.userId === context.userId && data.role !== "admin") {
      const admins = await sql<{ n: number }>`select count(*)::int as n from member where role = 'admin'`;
      if (Number(admins[0]?.n ?? 0) < 2) throw new Error("A fonte precisa de pelo menos um administrador.");
    }
    await sql`update member set role = ${data.role} where user_id = ${data.userId}`;
    return { ok: true };
  });

export const listMedia = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await sqlClient();
    await requireAdmin(sql, context.userId);
    const { readdir } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const root = fileURLToPath(new URL("../../public", import.meta.url));
    const files: string[] = [];
    async function walk(dir: string) {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith(".") || entry.name === "__grok") continue;
        const full = join(dir, entry.name);
        if (entry.isDirectory()) await walk(full);
        else if (/\.(webp|svg|png|jpe?g|pdf)$/i.test(entry.name)) files.push(full);
      }
    }
    await walk(root);
    return files.map((file) => `/${file.slice(root.length).replaceAll("\\", "/").replace(/^\//, "")}`).sort();
  });
