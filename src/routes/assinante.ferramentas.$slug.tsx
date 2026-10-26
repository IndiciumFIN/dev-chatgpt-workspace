import { createFileRoute, notFound } from "@tanstack/react-router";
import { AreaFrame, AreaGuard } from "@/components/site/areas";
import { ClinicalToolPage } from "@/components/tools/clinical-tool";
import { readTool } from "@/lib/source.functions";
import { getTool } from "@/lib/tools/catalog";

export const Route = createFileRoute("/assinante/ferramentas/$slug")({
  loader: async ({ params }) => {
    const loaded = await readTool({ data: params.slug }).catch(() => null);
    if (!loaded) {
      const base = getTool(params.slug);
      if (!base) throw notFound();
      return { tool: base };
    }
    if (!loaded.published) throw notFound();
    return { tool: loaded.tool };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.tool.title} · Área do assinante` : "Ferramenta" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AssinanteTool,
});

function AssinanteTool() {
  const { tool } = Route.useLoaderData();
  return (
    <AreaGuard allow="member">
      <AreaFrame role="assinante">
        <ClinicalToolPage key={tool.slug} tool={tool} area="assinante" />
      </AreaFrame>
    </AreaGuard>
  );
}
