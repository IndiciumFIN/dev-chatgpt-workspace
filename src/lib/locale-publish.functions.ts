import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { assertLocalePublish, publishLocaleStatement } from "@/lib/locale-publish";
import { decide } from "@/lib/policy-decision";

export type LocaleDraft = {
  slug: string;
  locale: string;
  kind: string;
  title: string;
  views: number;
  path: string;
};

async function requireAdmin(userId: string) {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<{ role: string }>`select role from member where user_id = ${userId}`;
  if (rows[0]?.role !== "admin") throw new Error("Só o administrador publica um idioma.");
  return sql;
}

export const listLocaleDrafts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator((input: { locale?: string; search?: string }) => {
    const locale = input.locale ?? "";
    const search = (input.search ?? "").trim().toLowerCase();
    if (locale !== "" && !/^[a-z]{2}$/.test(locale)) throw new Error("Idioma inválido.");
    if (search.length > 80) throw new Error("Busca longa demais.");
    return { locale, search };
  })
  .handler(async ({ context, data }) => {
    const sql = await requireAdmin(context.userId);
    const counts = await sql.query<{ locale: string; objects: number }>(
      `select locale, count(distinct slug)::int as objects
       from content_text
       where status = 'rascunho' and locale <> 'pt-BR'
       group by locale
       order by locale`,
    );
    const rows = await sql.query<LocaleDraft>(
      `select t.slug, t.locale, o.kind, min(t.title) as title, count(*)::int as views, min(a.path) as path
       from content_text t
       join content_object o on o.slug = t.slug
       join content_alias a on a.slug = t.slug and a.locale = t.locale and a.view = t.view
       where t.status = 'rascunho'
         and t.locale <> 'pt-BR'
         and ($1 = '' or t.locale = $1)
         and ($2 = '' or lower(t.slug) like '%' || $2 || '%' or lower(t.title) like '%' || $2 || '%')
       group by t.slug, t.locale, o.kind
       order by t.locale, t.slug
       limit 40`,
      [data.locale, data.search],
    );
    return { counts, rows };
  });

export const publishObjectLocale = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input: { slug: string; locale: string }) => assertLocalePublish(input.slug, input.locale))
  .handler(async ({ context, data }) => {
    const sql = await requireAdmin(context.userId);
    await decide(sql, { action: "publicar_idioma", role: "admin", actorId: context.userId });
    const updated = await sql.query<{ slug: string }>(publishLocaleStatement, [data.slug, data.locale]);
    if (updated.length === 0) throw new Error("Não há rascunho desse idioma com endereço.");
    await sql`
      insert into audit_event (id, actor_id, action, entity, entity_id)
      values (${crypto.randomUUID()}, ${context.userId}, ${"publicar_idioma"}, ${"content_text"}, ${`${data.slug}:${data.locale}`})
    `;
    return { published: updated.length };
  });
