import { createFileRoute, notFound, redirect, retainSearchParams } from "@tanstack/react-router";
import { EditorialView } from "@/components/templates/editorial-view";
import { FormView } from "@/components/templates/form-view";
import { GuideView } from "@/components/templates/guide-view";
import { InstitutionalTemplate } from "@/components/templates/institutional-template";
import { LibraryView } from "@/components/templates/library-view";
import { NormView } from "@/components/templates/norm-view";
import { ReportView } from "@/components/templates/report-view";
import { SlideDeck } from "@/components/templates/slide-deck";
import { ArticlePage } from "@/components/article/article-page";
import { Shell } from "@/components/site/shell";
import { RelatedContent } from "@/components/site/related-content";
import { getTemplate, listTemplates, templateFamilies } from "@/lib/templates";
import { parseLocale } from "@/lib/translate";

export const Route = createFileRoute("/modelos/$id")({
  search: {
    middlewares: [retainSearchParams(["lang"])],
  },
  validateSearch: (search: Record<string, unknown>) => {
    const lang = parseLocale(search.lang);
    return lang ? { lang } : {};
  },
  loader: ({ params }) => {
    if (params.id === "folha") throw redirect({ to: "/ferramentas/$slug", params: { slug: "gotejamento" } });
    if (params.id === "guia") return { kind: "guia" as const };
    if (params.id === "biblioteca") return { kind: "biblioteca" as const };
    if (params.id === "norma") return { kind: "norma" as const };
    if (params.id === "formulario") return { kind: "formulario" as const };
    if (params.id === "laudo") return { kind: "laudo" as const };
    if (params.id === "institucional") return { kind: "institucional" as const };
    if (params.id === "slides") return { kind: "slides" as const };
    const template = getTemplate(params.id);
    if (!template) throw notFound();
    return { kind: "editorial" as const, template };
  },
  component: Modelo,
  head: ({ loaderData, params }) => ({
    meta: [
      { title: modeloTitle(loaderData, params.id) },
      { name: "robots", content: "noindex" },
    ],
  }),
});

/**
 * Cada rota /modelos/$id recebe o título da peça que ela carrega.
 * Peças editoriais usam o nome do template; as famílias usam o nome que
 * /modelos já publica em templateFamilies. Sem dado, o slug entra no título
 * em vez de repetir um literal.
 */
function modeloTitle(data: { kind: string; template?: { name: string } } | undefined, slug: string): string {
  if (data?.kind === "editorial" && data.template) return `${data.template.name} · Templates`;
  const family = data ? templateFamilies.find((item) => item.id === data.kind) : undefined;
  if (family) return `${family.name} · Templates`;
  return `Template ${slug} · Calculadoras de Enfermagem`;
}

function Modelo() {
  const data = Route.useLoaderData();
  if (data.kind === "guia") return <Shell><GuideView /></Shell>;
  if (data.kind === "biblioteca") return <Shell><LibraryView /></Shell>;
  if (data.kind === "norma") return <Shell><NormView /></Shell>;
  if (data.kind === "formulario") return <Shell><FormView /></Shell>;
  if (data.kind === "laudo") return <Shell><ReportView /></Shell>;
  if (data.kind === "institucional") return <Shell><InstitutionalTemplate /></Shell>;
  if (data.kind === "slides") return <Shell><SlideDeck /></Shell>;
  const templates = listTemplates();
  return (
    <Shell>
      <ArticlePage
        kind="editorial"
        crumbs={[{ label: "Início", to: "/" }, { label: "Templates", to: "/modelos" }, { label: data.template.name }]}
        eyebrow="Template"
        title={data.template.name}
        lead={data.template.description}
        related={
          <RelatedContent
            title="Outras peças"
            items={templates.filter((item) => item.id !== data.template.id).slice(0, 6).map((item) => ({
              to: "/modelos/$id" as const,
              params: { id: item.id },
              title: item.name,
              text: item.category,
            }))}
          />
        }
      >
        <EditorialView template={data.template} />
      </ArticlePage>
    </Shell>
  );
}
