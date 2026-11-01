import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AreaFrame } from "@/components/site/areas";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { CommunityBoard } from "@/components/site/community";
import { PageHero } from "@/components/site/page-hero";
import { localPublishedTools } from "@/lib/local-canonical";
import type { LocalToolPublication } from "@/lib/local-workbench-store";

export const Route = createFileRoute("/assinante")({
  component: AssinantePage,
  head: () => ({
    meta: [
      { title: "Área do assinante · Calculadoras de Enfermagem" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AssinantePage() {
  return (
    <AreaFrame role="assinante"><AssinanteHome /></AreaFrame>
  );
}

function AssinanteHome() {
  const [rows, setRows] = useState<LocalToolPublication[] | null>(null);
  useEffect(() => {
    try { setRows(localPublishedTools()); } catch { setRows([]); }
    function refresh() { try { setRows(localPublishedTools()); } catch { setRows([]); } }
    window.addEventListener("storage", refresh);
    window.addEventListener("cde-publication-updated", refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener("cde-publication-updated", refresh); };
  }, []);
  const published = (rows ?? []).filter((row) => row.published);
  return (
    <article className="page-wide">
      <Breadcrumb items={[{ label: "Site público", to: "/" }, { label: "Área do assinante" }]} />
      <PageHero eyebrow="Assinante" title="O que a fonte publicou" lead="Esta tela não é o site público. Ela só abre o que o administrador deixou publicado. O cálculo em si continua o mesmo." />
      {rows === null ? <p className="tool-help">Lendo a base local…</p> : null}
      <ul className="related-grid">
        {published.map((tool) => (
          <li key={tool.slug}>
            <Link to="/assinante/ferramentas/$slug" params={{ slug: tool.slug }} className="nav-card catalog-card">
              <h3>
                {tool.title} <span className="live-pill">Publicado</span>
              </h3>
              <p>{tool.lead}</p>
            </Link>
          </li>
        ))}
      </ul>
      {rows && published.length === 0 ? <p className="tool-help">Nada publicado na fonte.</p> : null}
      <CommunityBoard />
    </article>
  );
}
