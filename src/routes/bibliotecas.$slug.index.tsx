import { createFileRoute, retainSearchParams } from "@tanstack/react-router";
import { Shell } from "@/components/site/shell";
import { LibraryHub } from "@/components/templates/library-canonical";
import { getLibrary } from "@/lib/bibliotecas";
import { languageLinks } from "@/lib/seo";
import { parseLocale } from "@/lib/translate";
import type { Locale } from "@/lib/chrome";

/**
 * Hub de uma biblioteca (filho indice de `/bibliotecas/$slug`).
 *
 * `noindex`: o acervo visual entra em cena com o pacote de auditoria
 * deterministica v0.3, cujo status e `PROTOTIPO_LOCAL_SEM_ADMISSAO_KERNEL`,
 * `promotion: BLOQUEADA` e `human_approval: PENDENTE`. As imagens sao
 * ilustrativas e identificacao/terminologia/aplicacoes clinicas exigem
 * verificacao de fonte antes de publicacao assistencial.
 *
 * A rota fica ALCANCABIL sem ser INDEXAVEL. Para promover: remover o `robots`
 * e acrescentar a rota ao `publicPaths()` — que a passa a entrar no sitemap.
 */
export const Route = createFileRoute("/bibliotecas/$slug/")({
  search: { middlewares: [retainSearchParams(["lang"])] },
  validateSearch: (search: Record<string, unknown>): { lang?: Locale } => {
    const lang = parseLocale(search.lang);
    return { ...(lang ? { lang } : {}) };
  },
  // O `head` usa o loader PROPRIO da rota; o do pai nao alcanca o filho.
  // Por isso o hub tem o seu — mesma validacao, dados os mesmos.
  loader: ({ params }) => {
    const lib = getLibrary(params.slug);
    if (!lib) throw new Error("biblioteca desconhecida");
    return { slug: lib.slug, title: lib.title, lead: lib.subtitle };
  },
  head: ({ loaderData, match }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} · Calculadoras de Enfermagem` : "Biblioteca" },
      { name: "description", content: loaderData?.lead ?? "" },
      { name: "robots", content: "noindex" },
    ],
    links: languageLinks(`/bibliotecas/${match.params.slug}`, (match.search as { lang?: unknown }).lang),
    scripts: loaderData
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: loaderData.title,
              description: loaderData.lead,
              inLanguage: "pt-BR",
              isPartOf: { "@type": "WebSite", name: "Calculadoras de Enfermagem", url: "https://calculadorasdeenfermagem.com.br" },
            }),
          },
        ]
      : [],
  }),
  component: BibliotecasSlugIndexRoute,
});

function BibliotecasSlugIndexRoute() {
  const { slug } = Route.useParams();
  return (
    <Shell>
      <LibraryHub slug={slug} />
    </Shell>
  );
}
