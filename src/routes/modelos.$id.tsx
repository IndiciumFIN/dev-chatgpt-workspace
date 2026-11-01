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
import { readEditorial } from "@/lib/stored.functions";
import { unflatten, useStored } from "@/lib/stored";
import { lorem, loremData } from "@/lib/lorem";
import { ContractView } from "@/components/templates/contract-view";
import { recoveredTemplate } from "@/components/templates/recovered-templates";
import { catalogById } from "@/lib/template-catalog";
import { parseLocale } from "@/lib/translate";

export const Route = createFileRoute("/modelos/$id")({
  search: {
    middlewares: [retainSearchParams(["lang"])],
  },
  validateSearch: (search: Record<string, unknown>) => {
    const lang = parseLocale(search.lang);
    return lang ? { lang } : {};
  },
  loader: async ({ params }) => {
    if (params.id === "folha") throw redirect({ to: "/ferramentas/$slug", params: { slug: "gotejamento" } });
    if (params.id === "guia") return { kind: "guia" as const };
    if (params.id === "biblioteca") return { kind: "biblioteca" as const };
    if (params.id === "norma") return { kind: "norma" as const };
    if (params.id === "formulario") return { kind: "formulario" as const };
    if (params.id === "laudo") return { kind: "laudo" as const };
    if (params.id === "institucional") return { kind: "institucional" as const };
    if (params.id === "slides") return { kind: "slides" as const };
    const contract = catalogById(params.id);
    if (contract && contract.href === `/modelos/${params.id}`) return { kind: "contrato" as const, row: contract };
    const template = await readEditorial({ data: params.id });
    if (!template) throw notFound();
    return { kind: "editorial" as const, template };
  },
  component: Modelo,
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.kind === "editorial" ? `${loaderData.template.name} · Templates` : "Template · Calculadoras de Enfermagem" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function Modelo() {
  const data = Route.useLoaderData();
  const templates = useStored().templates;
  if (data.kind === "guia") return <Shell><GuideView /></Shell>;
  if (data.kind === "biblioteca") return <Shell><LibraryView /></Shell>;
  if (data.kind === "norma") return <Shell><NormView /></Shell>;
  if (data.kind === "formulario") return <Shell><FormView /></Shell>;
  if (data.kind === "laudo") return <Shell><ReportView /></Shell>;
  if (data.kind === "institucional") return <Shell><InstitutionalTemplate /></Shell>;
  if (data.kind === "slides") return <Shell><SlideDeck /></Shell>;
  if (data.kind === "contrato") {
    const Recovered = recoveredTemplate(data.row.id);
    return <Shell>{Recovered ? <Recovered /> : <ContractView row={data.row} />}</Shell>;
  }
  return (
    <Shell>
      <ArticlePage
        kind="editorial"
        crumbs={[{ label: "Início", to: "/" }, { label: "Templates", to: "/modelos" }, { label: data.template.name }]}
        eyebrow="Amostra visual"
        title={data.template.id}
        lead={lorem(data.template.description)}
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
        <EditorialView template={{ ...data.template, name: data.template.id, category: lorem(data.template.category), description: lorem(data.template.description), data: loremData(unflatten(data.template.lines.map((line) => ({ key: line.path, text: line.text })))) as Record<string, unknown> }} />
      </ArticlePage>
    </Shell>
  );
}
