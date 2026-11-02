import { createFileRoute, notFound, retainSearchParams } from "@tanstack/react-router";
import { Shell } from "@/components/site/shell";
import { LibraryObject } from "@/components/templates/library-canonical";
import { languageLinks } from "@/lib/seo";
import { assetById, getLibrary, titleOf } from "@/lib/bibliotecas";
import { parseLocale } from "@/lib/translate";
import type { Locale } from "@/lib/chrome";

/**
 * Pagina de um item visual do acervo. Ver a nota de `noindex` em
 * `bibliotecas.index.tsx`.
 */
export const Route = createFileRoute("/bibliotecas/$slug/$object")({
  search: { middlewares: [retainSearchParams(["lang"])] },
  validateSearch: (search: Record<string, unknown>): { lang?: Locale } => {
    const lang = parseLocale(search.lang);
    return { ...(lang ? { lang } : {}) };
  },
  loader: ({ params }) => {
    const lib = getLibrary(params.slug);
    if (!lib || lib.slug === "acervo-a-classificar") throw notFound();
    const isCurated = lib.slug === "anatomia" && params.object === "coracao-humano";
    const asset = isCurated ? undefined : assetById(lib.category, params.object);
    if (!asset && !isCurated) throw notFound();
    const caption = asset ? titleOf(asset) : "";
    return {
      slug: lib.slug,
      title: isCurated ? "Coração Humano" : caption,
      lead: `Prancha visual do acervo ${lib.short}. Materiais ilustrativos para estudo, sem descrição clinica homologada.`,
    };
  },
  head: ({ loaderData, match }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} · Calculadoras de Enfermagem` : "Item do acervo" },
      { name: "description", content: loaderData?.lead ?? "" },
      { name: "robots", content: "noindex" },
    ],
    links: languageLinks(
      `/bibliotecas/${match.params.slug}/${match.params.object}`,
      (match.search as { lang?: unknown }).lang,
    ),
    scripts: loaderData
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ImageObject",
              name: loaderData.title,
              description: loaderData.lead,
              inLanguage: "pt-BR",
              isPartOf: { "@type": "WebSite", name: "Calculadoras de Enfermagem", url: "https://calculadorasdeenfermagem.com.br" },
            }),
          },
        ]
      : [],
  }),
  component: BibliotecaObjectRoute,
});

function BibliotecaObjectRoute() {
  const { slug, object } = Route.useParams();
  return (
    <Shell>
      <LibraryObject slug={slug} object={object} />
    </Shell>
  );
}
