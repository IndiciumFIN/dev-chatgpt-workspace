import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClinicalToolPage } from "@/components/tools/clinical-tool";
import { tools } from "@/lib/tools/catalog";
import { localTool } from "@/lib/local-canonical";
import { Shell } from "@/components/site/shell";
import { languageLinks, toolJsonLd } from "@/lib/seo";
export const Route = createFileRoute("/ferramentas/$slug")({
  loader: ({ params }) => {
    const tool = tools.find(item => item.slug === params.slug);
    if (!tool) throw notFound();
    return { slug: tool.slug };
  },
  head: ({ loaderData, params, match }) => {
    const tool = tools.find(item => item.slug === params.slug);
    return { meta: [{ title: tool ? `${tool.title} · Calculadoras de Enfermagem` : "Ferramenta" },
      { name: "description", content: tool?.lead ?? "" }],
      links: languageLinks(`/ferramentas/${params.slug}`, (match.search as { lang?: unknown }).lang),
      scripts: tool ? [{ type: "application/ld+json", children: toolJsonLd(tool) }] : [] };
  },
  component: ToolRoute,
});
function ToolRoute() {
  const { slug } = Route.useLoaderData();
  const [state, setState] = useState<{ ready: boolean; tool: ReturnType<typeof localTool>; error: boolean }>({ ready: false, tool: undefined, error: false });
  useEffect(() => {
    function refresh() {
      try { setState({ ready: true, tool: localTool(slug), error: false }); }
      catch { setState({ ready: true, tool: undefined, error: true }); }
    }
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("cde-publication-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("cde-publication-updated", refresh);
    };
  }, [slug]);
  const content = !state.ready ? <p role="status">Carregando publicação local…</p>
    : state.error ? <p role="alert">Registro local inválido. Revise a oficina administrativa.</p>
    : !state.tool ? <p role="status">Ferramenta não publicada nesta base local.</p>
    : <ClinicalToolPage key={state.tool.slug} tool={state.tool} />;
  return <Shell>{content}</Shell>;
}
