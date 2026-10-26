import { createFileRoute, Link, retainSearchParams } from "@tanstack/react-router";
import { Shell } from "@/components/site/shell";
import { ArticlePage } from "@/components/article/article-page";
import { useStored } from "@/lib/stored";
import { tools } from "@/lib/tools/catalog";
import { parseLocale } from "@/lib/translate";

type PackSearch = { q?: string; lang?: "pt-BR" | "en" | "es" | "fr" };

export const Route = createFileRoute("/pacote")({
  search: {
    middlewares: [retainSearchParams(["lang"])],
  },
  validateSearch: (search: Record<string, unknown>): PackSearch => {
    const lang = parseLocale(search.lang);
    return {
      q: typeof search.q === "string" ? search.q : undefined,
      ...(lang ? { lang } : {}),
    };
  },
  component: Pacote,
  head: () => ({
    meta: [
      { title: "Pacote de templates · Calculadoras de Enfermagem" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function Pacote() {
  const { phases } = useStored();
  const { q } = Route.useSearch();
  return (
    <Shell>
      <ArticlePage
        kind="secao"
        crumbs={[{ label: "Início", to: "/" }, { label: "Pacote" }]}
        eyebrow="Mapa do pacote"
        title="Pacote de templates"
        lead={`O menu principal segue o site homologado. Esta página guarda só o inventário do template clínico.${q ? ` Busca registrada: “${q}”.` : ""}`}
      >
        <ul className="related-grid" style={{ marginBottom: 20 }}>
          {tools.map((tool) => (
            <li key={tool.slug}>
              <Link to="/ferramentas/$slug" params={{ slug: tool.slug }} className="nav-card">
                <h3>{tool.title}</h3>
                <p>{tool.kind === "escala" ? "Escala" : "Calculadora"} · {tool.category}</p>
              </Link>
            </li>
          ))}
        </ul>
        <div className="phase-list" style={{ marginBottom: 20 }}>
          {phases.map((phase) => (
            <div key={phase.id} className="phase-row">
              <b>
                {phase.id} · {phase.name}
              </b>
              <span>
                {phase.status}. {phase.detail}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link to="/" className="btn-navy">
            Voltar à home
          </Link>
          <Link to="/modelos" className="btn-ghost">
            Abrir os templates
          </Link>
        </div>
      </ArticlePage>
    </Shell>
  );
}
