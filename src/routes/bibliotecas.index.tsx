import { createFileRoute, notFound, retainSearchParams } from "@tanstack/react-router";
import { parseLocale } from "@/lib/translate";
import type { Locale } from "@/lib/chrome";

type LibrarySearch = { lang?: Locale };
import { Shell } from "@/components/site/shell";
import { LibrariesIndex } from "@/components/templates/library-canonical";
import { languageLinks } from "@/lib/seo";
import { libraryDefinitions } from "@/lib/bibliotecas";

/**
 * Indice das bibliotecas visuais.
 *
 * `noindex`: o acervo visual entra em cena com o pacote de auditoria
 * deterministica v0.3, cujo status e `PROTOTIPO_LOCAL_SEM_ADMISSAO_KERNEL`,
 * `promotion: BLOQUEADA` e `human_approval: PENDENTE`. As imagens sao
 * ilustrativas e a identificacao/terminologia/application clinicas exigem
 * verificacao de fonte antes de publicacao assistencial. Publicar no indice
 * seria indexar conteudo ainda nao admitido — e o proprio pacote do
 * acervo pede o opposite.
 *
 * A rota fica ALCANCABIL (da para navegar e revisar) sem ser INDEXAVEL.
 * Para promover, e uma linha: remover o `robots` e acrescentar a rota ao
 * `publicPaths()` — que a passa a entrar no sitemap gerado.
 */
export const Route = createFileRoute("/bibliotecas/")({
  search: { middlewares: [retainSearchParams(["lang"])] },
  validateSearch: (search: Record<string, unknown>): LibrarySearch => {
    const lang = parseLocale(search.lang);
    return { ...(lang ? { lang } : {}) };
  },
  loader: () => {
    const publical = libraryDefinitions.filter((l) => l.slug !== "acervo-a-classificar");
    return { total: publical.length };
  },
  head: ({ match }) => ({
    meta: [
      { title: "Bibliotecas visuais · Calculadoras de Enfermagem" },
      {
        name: "description",
        content:
          "Acervo visual de enfermagem organizado por biblioteca: anatomia, seringas e agulhas, feridas e curativos, luvas e EPI, nutricao, processo de enfermagem, antissepsia, dispositivos medicos e educacao.",
      },
      { name: "robots", content: "noindex" },
    ],
    links: languageLinks("/bibliotecas", (match.search as { lang?: unknown }).lang),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Bibliotecas visuais",
          inLanguage: "pt-BR",
          isPartOf: { "@type": "WebSite", name: "Calculadoras de Enfermagem", url: "https://calculadorasdeenfermagem.com.br" },
        }),
      },
    ],
  }),
  component: () => (
    <Shell>
      <LibrariesIndex />
    </Shell>
  ),
  notFoundComponent: () => {
    throw notFound();
  },
});
