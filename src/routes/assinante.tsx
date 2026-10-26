import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AreaFrame, AreaGuard } from "@/components/site/areas";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { CommunityBoard } from "@/components/site/community";
import { PageHero } from "@/components/site/page-hero";
import { readCatalog, type SourceTool } from "@/lib/source.functions";

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
    <AreaGuard allow="member">
      <AreaFrame role="assinante">
        <AssinanteHome />
      </AreaFrame>
    </AreaGuard>
  );
}

function AssinanteHome() {
  const [rows, setRows] = useState<SourceTool[] | null>(null);
  useEffect(() => {
    readCatalog().then(setRows).catch(() => setRows([]));
  }, []);
  const published = (rows ?? []).filter((row) => row.published);
  return (
    <article className="page-wide">
      <Breadcrumb items={[{ label: "Site público", to: "/" }, { label: "Área do assinante" }]} />
      <PageHero eyebrow="Assinante" title="O que a fonte publicou" lead="Esta tela não é o site público. Ela só abre o que o administrador deixou publicado. O cálculo em si continua o mesmo." />
      {rows === null ? <p className="tool-help">Lendo a fonte…</p> : null}
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
