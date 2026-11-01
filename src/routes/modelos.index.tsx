import { createFileRoute, Link, retainSearchParams } from "@tanstack/react-router";
import { Shell } from "@/components/site/shell";
import { ArticlePage } from "@/components/article/article-page";
import { useStored } from "@/lib/stored";
import { templateCatalog } from "@/lib/template-catalog";
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
  const { templates, families } = useStored();
  return (
    <Shell>
      <ArticlePage
        kind="secao"
        crumbs={[{ label: "Início", to: "/" }, { label: "Templates" }]}
        eyebrow="Pacote visual"
        title="Templates reutilizáveis"
        lead="Uma galeria só. Página, ferramenta e peça abrem o mesmo tipo de cartão. O texto é amostra. O conteúdo publicado fica na seção."
      >
        <ul className="related-grid">
          {families.filter((family) => family.id !== "editorial").map((family) => (
            <li key={family.id}>
              <Link
                to={family.id === "ferramenta" ? "/ferramentas/$slug" : "/modelos/$id"}
                params={family.id === "ferramenta" ? { slug: "braden" } : { id: family.id }}
                className="nav-card"
              >
                <h3>{family.name}</h3>
                <p>{family.text}</p>
              </Link>
            </li>
          ))}
          {templateCatalog.filter((row) => {
            const familyHref = families.some((family) => row.href === (family.id === "ferramenta" ? "/ferramentas/braden" : `/modelos/${family.id}`));
            const pieceHref = templates.some((template) => row.href === `/modelos/${template.id}`);
            return row.href.startsWith("/modelos/") && !familyHref && !pieceHref;
          }).map((row) => (
            <li key={row.id}>
              <a href={row.href} className="nav-card">
                <h3>{row.name}</h3>
                <p>{row.source}</p>
              </a>
            </li>
          ))}
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
