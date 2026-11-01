import { createFileRoute, Link, retainSearchParams } from "@tanstack/react-router";
import { Shell } from "@/components/site/shell";
import { ArticlePage } from "@/components/article/article-page";
import { listTemplates, templateFamilies } from "@/lib/templates";
import { parseLocale } from "@/lib/translate";

export const Route = createFileRoute("/modelos/")({
  search: {
    middlewares: [retainSearchParams(["lang"])],
  },
  validateSearch: (search: Record<string, unknown>) => {
    const lang = parseLocale(search.lang);
    return lang ? { lang } : {};
  },
  component: Modelos,
  head: () => ({
    meta: [
      { title: "Templates · Calculadoras de Enfermagem" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function Modelos() {
  const templates = listTemplates();
  return (
    <Shell>
      <ArticlePage
        kind="secao"
        crumbs={[{ label: "Início", to: "/" }, { label: "Templates" }]}
        eyebrow="Pacote visual"
        title="Templates reutilizáveis"
        lead="Famílias no mesmo azul-marinho do site. Formulário, laudo e página institucional entram aqui. A ferramenta publicada continua em Calculadoras e Escalas."
      >
        <ul className="related-grid">
          {templateFamilies.map((family) => (
            <li key={family.id}>
              <Link
                to={family.id === "ferramenta" ? "/ferramentas/$slug" : "/modelos/$id"}
                params={family.id === "ferramenta" ? { slug: "braden" } : { id: family.id === "editorial" ? "TPL-001" : family.id }}
                className="nav-card"
              >
                <h3>{family.name}</h3>
                <p>{family.text}</p>
              </Link>
            </li>
          ))}
        </ul>
        <h2>Peças editoriais</h2>
        <ul className="related-grid">
          {templates.map((template) => (
            <li key={template.id}>
              <Link to="/modelos/$id" params={{ id: template.id }} className="nav-card">
                <h3>{template.name}</h3>
                <p>{template.id} · {template.category}</p>
              </Link>
            </li>
          ))}
        </ul>
      </ArticlePage>
    </Shell>
  );
}
