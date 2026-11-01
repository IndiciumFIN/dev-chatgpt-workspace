import { createServerFn } from "@tanstack/react-start";
import type { TemplateKind } from "@/lib/template-contract";
import { editionOf } from "@/lib/page-links";

const templateKind: Record<string, TemplateKind> = {
  instrumento: "ferramenta",
  biblioteca: "biblioteca",
  guia: "guia",
  editorial: "editorial",
  norma: "norma",
  institucional: "secao",
  pagina: "secao",
};

export type PublishedContent = {
  path: string;
  locale: string;
  kind: TemplateKind;
  title: string;
  lead: string;
  body: string;
  status: "publicado";
  canonical_path: string;
  slug: string;
  view: string;
  editions: { code: string; label: string; path: string }[];
};

function assertPath(path: string) {
  if (typeof path !== "string" || !path.startsWith("/") || path.includes("..") || path.length > 240) {
    throw new Error("Rota inválida.");
  }
  return path;
}

export const readPublishedContent = createServerFn({ method: "GET" })
  .inputValidator(assertPath)
  .handler(async ({ data }): Promise<PublishedContent | null> => {
    const { withReader } = await import("@/lib/db");
    return withReader(async (sql) => {
      const rows = await sql.query<{
        path: string;
        locale: string;
        kind: string;
        title: string;
        lead: string;
        body: string;
        origin_path: string;
        slug: string;
        view: string;
      }>(
        `select a.path, a.locale, o.kind, t.title, t.lead, t.body, o.origin_path, o.slug, a.view
         from content_alias a
         join content_object o on o.slug = a.slug
         join content_text t on t.slug = a.slug and t.locale = a.locale and t.view = a.view
         where a.path = $1 and t.status = 'publicado'`,
        [data],
      );
      const row = rows[0];
      if (!row) return null;
      const editions = await sql.query<{ path: string }>(
        `select a.path
         from content_alias a
         join content_text t on t.slug = a.slug and t.locale = a.locale and t.view = a.view
         where a.slug = $1 and a.view = $2 and t.status = 'publicado'
         order by a.locale`,
        [row.slug, row.view],
      );
      const kind = row.view === "formulario"
        ? "guia"
        : row.view === "calculadora"
          ? "ferramenta"
          : row.kind === "simulado"
            ? "secao"
            : templateKind[row.kind] ?? "secao";
      return {
        path: row.path,
        locale: row.locale,
        kind,
        title: row.title,
        lead: row.lead,
        body: row.body,
        status: "publicado" as const,
        canonical_path: row.origin_path,
        slug: row.slug,
        view: row.view,
        editions: editions.map((item) => editionOf(item.path)),
      };
    });
  });
