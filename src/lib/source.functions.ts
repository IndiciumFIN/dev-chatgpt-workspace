import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { approveItemTx, approveSpecificationTx, saveGovernanceDraftTx } from "@/lib/governance";
import { decide } from "@/lib/policy-decision";
import { assertProductionAuth } from "@/lib/publish-guard";
import { assembleTool, hasStoredSheet, type ToolSheet } from "@/lib/tools/bridge";
import { getTool, tools } from "@/lib/tools/catalog";
import { restoreCopyTx, saveSheetTx } from "@/lib/tools/write-sheet";

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

async function seed(sql: Awaited<ReturnType<typeof sqlClient>>) {
  const count = await sql<{ n: number }>`select count(*)::int as n from source_tool`;
  if (Number(count[0]?.n ?? 0) > 0) return;
  for (const tool of tools) {
    await sql`
      insert into source_tool (slug, kind, title, lead, published)
      values (${tool.slug}, ${tool.kind}, ${tool.title}, ${tool.lead}, true)
    `;
  }
}

async function requireAdmin(sql: Awaited<ReturnType<typeof sqlClient>>, userId: string) {
  const rows = await sql<{ role: string }>`select role from member where user_id = ${userId}`;
  if (rows[0]?.role !== "admin") throw new Error("Somente o administrador altera a fonte.");
}

async function loadSheet(sql: Awaited<ReturnType<typeof sqlClient>>, slug: string): Promise<ToolSheet | null> {
  const covers = await sql<{ slug: string; kind: string; title: string; lead: string; category: string | null; nanda_mode: string | null; band_from: string | null; evidence: string | null; version: string | null; published: unknown }>`
    select slug, kind, title, lead, category, nanda_mode, band_from, evidence, version, published
    from source_tool where slug = ${slug}
  `;
  const cover = covers[0];
  if (!cover) return null;
  const criteria = await sql<{ id: string; label: string; help: string; position: number }>`select id, label, help, position from tool_criterion where tool_slug = ${slug}`;
  const choices = await sql<{ criterion_id: string; value: unknown; label: string; position: number }>`select criterion_id, value, label, position from tool_choice where tool_slug = ${slug}`;
  const fields = await sql<{ id: string; label: string; unit: string; min_value: unknown; max_value: unknown; step: unknown; position: number }>`select id, label, unit, min_value, max_value, step, position from tool_field where tool_slug = ${slug}`;
  const selects = await sql<{ id: string; label: string; position: number }>`select id, label, position from tool_select where tool_slug = ${slug}`;
  const selectOptions = await sql<{ select_id: string; value: unknown; label: string; position: number }>`select select_id, value, label, position from tool_select_option where tool_slug = ${slug}`;
  const metas = await sql<{ id: string; label: string; position: number }>`select id, label, position from tool_meta where tool_slug = ${slug}`;
  const metaOptions = await sql<{ meta_id: string; value: string; label: string; position: number }>`select meta_id, value, label, position from tool_meta_option where tool_slug = ${slug}`;
  const outputs = await sql<{ id: string; label: string; unit: string; digits: unknown; position: number }>`select id, label, unit, digits, position from tool_output where tool_slug = ${slug}`;
  const bands = await sql<{ min_score: unknown; max_score: unknown; label: string; tone: string; note: string }>`select min_score, max_score, label, tone, note from tool_band where tool_slug = ${slug}`;
  const nanda = await sql<{ min_score: unknown; label: string }>`select min_score, label from tool_band_nanda where tool_slug = ${slug}`;
  const references = await sql<{ citation: string; position: number }>`select citation, position from tool_reference where tool_slug = ${slug}`;
  const steps = await sql<{ body: string; position: number }>`select body, position from tool_step where tool_slug = ${slug}`;
  const faqs = await sql<{ question: string; answer: string; position: number }>`select question, answer, position from tool_faq where tool_slug = ${slug}`;
  const related = await sql<{ related_slug: string; position: number }>`select related_slug, position from tool_related where tool_slug = ${slug}`;
  const specific = await sql<{ body: string; position: number }>`select body, position from tool_specific where tool_slug = ${slug}`;
  return {
    cover: {
      slug: cover.slug,
      kind: cover.kind,
      title: cover.title,
      lead: cover.lead,
      category: cover.category,
      nandaMode: cover.nanda_mode,
      bandFrom: cover.band_from,
      evidence: cover.evidence,
      version: cover.version,
    },
    criteria,
    choices: choices.map((row) => ({ criterionId: row.criterion_id, value: row.value, label: row.label, position: row.position })),
    fields: fields.map((row) => ({ id: row.id, label: row.label, unit: row.unit, min: row.min_value, max: row.max_value, step: row.step, position: row.position })),
    selects,
    selectOptions: selectOptions.map((row) => ({ selectId: row.select_id, value: row.value, label: row.label, position: row.position })),
    metas,
    metaOptions: metaOptions.map((row) => ({ metaId: row.meta_id, value: row.value, label: row.label, position: row.position })),
    outputs,
    bands: bands.map((row) => ({ min: row.min_score, max: row.max_score, label: row.label, tone: row.tone, note: row.note })),
    nanda: nanda.map((row) => ({ min: row.min_score, label: row.label })),
    references,
    steps,
    faqs,
    related: related.map((row) => ({ slug: row.related_slug, position: row.position })),
    specific,
    published: cover.published,
  } as ToolSheet & { published: unknown };
}

export const readCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await sqlClient();
  await seed(sql);
  const rows = await sql<{ slug: string; kind: string; title: string; lead: string; published: unknown }>`
    select slug, kind, title, lead, published from source_tool order by title
  `;
  return rows.map((row) => ({ ...row, published: asBool(row.published) })) satisfies SourceTool[];
});

export const readTool = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => {
    if (!/^[a-z0-9-]{1,80}$/.test(slug)) throw new Error("Ferramenta fora da fonte.");
    return slug;
  })
  .handler(async ({ data: slug }) => {
    const sql = await sqlClient();
    const sheet = await loadSheet(sql, slug);
    if (!sheet) throw new Error("Ferramenta fora da fonte.");
    const fallback = getTool(slug);
    const assembled = assembleTool(sheet, fallback);
    if (!assembled) throw new Error("Ferramenta fora da fonte.");
    const published = asBool((sheet as ToolSheet & { published: unknown }).published);
    if (!hasStoredSheet(sheet) && fallback) {
      return { published, tool: { ...fallback, title: sheet.cover.title, lead: sheet.cover.lead } };
    }
    return { published, tool: assembled };
  });

export const ensureRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await sqlClient();
    await seed(sql);
    await sql`
      insert into member (user_id, role)
      select ${context.userId},
        case when exists (select 1 from member where role = 'admin') then 'subscriber' else 'admin' end
      where not exists (select 1 from member where user_id = ${context.userId})
    `;
    const rows = await sql<{ role: SourceRole }>`select role from member where user_id = ${context.userId}`;
    return { role: rows[0]?.role === "admin" ? "admin" : "subscriber" } as const;
  });

export const adminDesk = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await sqlClient();
    await seed(sql);
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
    return { slug: input.slug, title, lead, published: input.published === true };
  })
  .handler(async ({ context, data }) => {
    assertProductionAuth();
    const { withSqlTransaction } = await import("@/lib/db");
    await withSqlTransaction(async (sql) => {
      await requireAdmin(sql, context.userId);
      await decide(sql, { action: "gravar_ficha", role: "admin", actorId: context.userId });
      const gate = await sql<{ enabled: unknown }>`select enabled from process where id = ${"publicar_ferramenta"}`;
      if (!asBool(gate[0]?.enabled)) throw new Error("O processo publicar_ferramenta está desligado.");
      await sql`
        update source_tool
        set title = ${data.title}, lead = ${data.lead}, published = ${data.published}, updated_by = ${context.userId}, updated_at = now()
        where slug = ${data.slug}
      `;
      await sql`
        insert into audit_event (id, actor_id, action, entity, entity_id)
        values (${crypto.randomUUID()}, ${context.userId}, ${"salvar_capa"}, ${"source_tool"}, ${data.slug})
      `;
    });
    return { ok: true };
  });

export const saveClinicalSheet = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input: { slug: string; title: string; lead: string; published: boolean }) => {
    const title = input.title.trim();
    const lead = input.lead.trim();
    if (!known.has(input.slug) || title.length < 3 || title.length > 80 || lead.length < 10 || lead.length > 400) {
      throw new Error("Título ou texto fora do limite.");
    }
    return { slug: input.slug, title, lead, published: input.published === true };
  })
  .handler(async ({ context, data }) => {
    const base = getTool(data.slug);
    if (!base) throw new Error("Ferramenta fora da fonte.");
    const sql = await sqlClient();
    await requireAdmin(sql, context.userId);
    await decide(sql, { action: "gravar_ficha", role: "admin", actorId: context.userId });
    const { withSqlTransaction } = await import("@/lib/db");
    await withSqlTransaction((tx) => saveSheetTx(tx, { ...base, title: data.title, lead: data.lead }, data.published, context.userId));
    return { ok: true as const };
  });

export const setMemberRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input: { userId: string; role: SourceRole }) => {
    if (!input.userId || (input.role !== "admin" && input.role !== "subscriber")) {
      throw new Error("Papel inválido.");
    }
    return input;
  })
  .handler(async ({ context, data }) => {
    const sql = await sqlClient();
    await requireAdmin(sql, context.userId);
    await decide(sql, { action: "mudar_papel", role: "admin", actorId: context.userId });
    if (data.userId === context.userId && data.role !== "admin") {
      const admins = await sql<{ n: number }>`select count(*)::int as n from member where role = 'admin'`;
      if (Number(admins[0]?.n ?? 0) < 2) throw new Error("A fonte precisa de pelo menos um administrador.");
    }
    await sql`update member set role = ${data.role} where user_id = ${data.userId}`;
    await sql`
      insert into audit_event (id, actor_id, action, entity, entity_id)
      values (${crypto.randomUUID()}, ${context.userId}, ${"mudar_papel"}, ${"member"}, ${data.userId})
    `;
    return { ok: true };
  });

export const readGovernance = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await sqlClient();
    await requireAdmin(sql, context.userId);
    const policy = await sql<{ owner_user_id: string | null; accepted_at: string | null }>`
      select owner_user_id, accepted_at::text as accepted_at from policy_ack where id = ${"vigente"}
    `;
    const events = await sql<{ id: string; actor_id: string; action: string; entity: string; entity_id: string; at: string }>`
      select id, actor_id, action, entity, entity_id, at::text as at from audit_event order by at desc limit 20
    `;
    const items = await sql<{ id: string; kind: string; title: string; body: string; status: string; approved_by: string | null; approved_at: string | null }>`
      select id, kind, title, body, status, approved_by, approved_at::text as approved_at
      from governance_item
      order by kind, title
    `;
    for (const item of items) {
      if (item.status === "aprovado") await approveItemTx(sql, item.id, context.userId);
    }
    const specifications = await sql<{ id: string; entity: string; characteristic: string; definition: string; syntax: string; required: unknown; source: string; status: string; approved_by: string | null }>`
      select id, entity, characteristic, definition, syntax, required, source, status, approved_by
      from data_specification
      order by entity, characteristic
    `;
    const versions = await sql<{ item_id: string; version: number; title: string; body: string; approved_by: string | null; approved_at: string | null; reason: string }>`
      select item_id, version, title, body, approved_by, approved_at::text as approved_at, reason
      from document_version
      order by item_id, version
    `;
    const gap = await sql<{ n: number }>`
      select case
        when (select count(*) from content_object) = 0 then 1
        when (
          select count(*)
          from content_text as copy
          where copy.status = 'publicado'
            and not exists (
              select 1 from content_alias as alias
              where alias.slug = copy.slug and alias.locale = copy.locale and alias.view = copy.view
            )
        ) > 0 then 1
        else 0
      end as n
    `;
    return {
      ownerUserId: policy[0]?.owner_user_id ?? null,
      acceptedAt: policy[0]?.accepted_at ?? null,
      events,
      items,
      versions,
      specifications: specifications.map((row) => ({ ...row, required: row.required === true || row.required === "t" || row.required === "true" })),
      canonical: (gap[0]?.n ?? 1) === 0,
    };
  });

export const saveGovernanceDraft = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input: { id: string; kind: string; title: string; body: string }) => {
    if (!input || typeof input.id !== "string" || typeof input.kind !== "string" || typeof input.title !== "string" || typeof input.body !== "string") {
      throw new Error("Rascunho inválido.");
    }
    return input;
  })
  .handler(async ({ context, data }) => {
    const sql = await sqlClient();
    await requireAdmin(sql, context.userId);
    await decide(sql, { action: "gravar_governanca", role: "admin", actorId: context.userId });
    const { withSqlTransaction } = await import("@/lib/db");
    return withSqlTransaction((tx) => saveGovernanceDraftTx(tx, { ...data, actorId: context.userId }));
  });

export const assumePolicy = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await sqlClient();
    await requireAdmin(sql, context.userId);
    await decide(sql, { action: "assumir_politica", role: "admin", actorId: context.userId });
    await sql`
      update policy_ack
      set owner_user_id = ${context.userId}, accepted_at = now()
      where id = ${"vigente"}
    `;
    await sql`
      insert into audit_event (id, actor_id, action, entity, entity_id)
      values (${crypto.randomUUID()}, ${context.userId}, ${"assumir_politica"}, ${"policy_ack"}, ${"vigente"})
    `;
    return { ok: true as const };
  });

export const approveGovernanceItem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input: { id: string }) => {
    if (typeof input?.id !== "string" || !/^[a-z0-9-]{1,80}$/.test(input.id)) throw new Error("Item inválido.");
    return { id: input.id };
  })
  .handler(async ({ context, data }) => {
    const sql = await sqlClient();
    await requireAdmin(sql, context.userId);
    await decide(sql, { action: "aprovar_governanca", role: "admin", actorId: context.userId });
    const { withSqlTransaction } = await import("@/lib/db");
    await withSqlTransaction((tx) => approveItemTx(tx, data.id, context.userId));
    return { ok: true as const };
  });

export const approveSpecification = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input: { id: string }) => {
    if (typeof input?.id !== "string" || !/^[a-z0-9-]{1,80}$/.test(input.id)) throw new Error("Característica inválida.");
    return { id: input.id };
  })
  .handler(async ({ context, data }) => {
    const sql = await sqlClient();
    await requireAdmin(sql, context.userId);
    await decide(sql, { action: "aprovar_governanca", role: "admin", actorId: context.userId });
    const { withSqlTransaction } = await import("@/lib/db");
    await withSqlTransaction((tx) => approveSpecificationTx(tx, data.id, context.userId));
    return { ok: true as const };
  });

export const exportContent = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await sqlClient();
    await requireAdmin(sql, context.userId);
    const [processRows, settings, toolRows] = await Promise.all([
      sql<{ id: string; enabled: unknown }>`select id, enabled from process order by id`,
      sql<{ process_id: string; key: string; value: string }>`select process_id, key, value from process_setting order by process_id, key`,
      sql<{ slug: string; title: string; lead: string; published: unknown }>`select slug, title, lead, published from source_tool order by slug`,
    ]);
    return {
      exportedAt: new Date().toISOString(),
      process: processRows.map((row) => ({ id: row.id, enabled: asBool(row.enabled) })),
      settings,
      tools: toolRows.map((row) => ({ slug: row.slug, title: row.title, lead: row.lead, published: asBool(row.published) })),
    };
  });

export const restoreContent = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input: { process?: { id: string; enabled: boolean }[]; tools?: { slug: string; title: string; lead: string; published: boolean }[] }) => {
    if (!Array.isArray(input?.process) || !Array.isArray(input?.tools)) throw new Error("Cópia inválida.");
    return { process: input.process, tools: input.tools };
  })
  .handler(async ({ context, data }) => {
    const sql = await sqlClient();
    await requireAdmin(sql, context.userId);
    await decide(sql, { action: "restaurar_conteudo", role: "admin", actorId: context.userId });
    const { withSqlTransaction } = await import("@/lib/db");
    const allowed = new Set(["publicar_ferramenta", "assinatura", "comunidade"]);
    await withSqlTransaction(async (tx) => {
      await restoreCopyTx(tx, { process: data.process.filter((row) => allowed.has(row.id)), tools: data.tools }, context.userId);
    });
    return { ok: true as const };
  });

export const listMedia = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await sqlClient();
    await requireAdmin(sql, context.userId);
    const rows = await sql<{ path: string }>`select path from media_asset order by path`;
    return rows.map((row) => row.path);
  });
