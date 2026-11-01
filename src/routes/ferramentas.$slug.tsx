import { createFileRoute, notFound } from "@tanstack/react-router";
import { ClinicalToolPage } from "@/components/tools/clinical-tool";
import { Shell } from "@/components/site/shell";
import { languageLinks, toolJsonLd } from "@/lib/seo";
import { readTool } from "@/lib/source.functions";

export const Route = createFileRoute("/ferramentas/$slug")({
  loader: async ({ params }) => {
    const loaded = await readTool({ data: params.slug }).catch(() => null);
    if (!loaded || !loaded.published) throw notFound();
    return { tool: loaded.tool };
  },
  head: ({ loaderData, params, match }) => ({
    meta: [
      { title: loaderData ? `${loaderData.tool.title} · Calculadoras de Enfermagem` : "Ferramenta" },
      { name: "description", content: loaderData?.tool.lead ?? "" },
    ],
    links: languageLinks(`/ferramentas/${params.slug}`, (match.search as { lang?: unknown }).lang),
    scripts: loaderData ? [{ type: "application/ld+json", children: toolJsonLd(loaderData.tool) }] : [],
  }),
  component: ToolRoute,
});

function ToolRoute() {
  const { tool } = Route.useLoaderData();
  return (
    <Shell>
      <ClinicalToolPage key={tool.slug} tool={tool} />
    </Shell>
  );
}
