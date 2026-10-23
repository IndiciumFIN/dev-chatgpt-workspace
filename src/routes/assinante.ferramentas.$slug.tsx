import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClinicalToolPage } from "@/components/tools/clinical-tool";
import { tools } from "@/lib/tools/catalog";
import { localTool } from "@/lib/local-canonical";
import { AreaFrame } from "@/components/site/areas";
export const Route = createFileRoute("/assinante/ferramentas/$slug")({
  loader: ({ params }) => {
    const tool = tools.find(item => item.slug === params.slug);
    if (!tool) throw notFound();
    return { slug: tool.slug };
  },
  head: () => ({ meta: [{ title: "Ferramenta · Área do assinante" }, { name: "robots", content: "noindex" }] }),
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
    : <ClinicalToolPage key={state.tool.slug} tool={state.tool} area="assinante" />;
  return <AreaFrame role="assinante">{content}</AreaFrame>;
}
