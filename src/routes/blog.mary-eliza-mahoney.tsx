import { createFileRoute, retainSearchParams } from "@tanstack/react-router";
import { Shell } from "@/components/site/shell";
import { BiographyView } from "@/components/templates/biography-view";
import { languageLinks } from "@/lib/seo";
import { parseLocale } from "@/lib/translate";

const description = "Biografia de Mary Eliza Mahoney (1845–1926), pioneira da enfermagem afro-americana, com fotografia histórica e linha do tempo documentada.";

export const Route = createFileRoute("/blog/mary-eliza-mahoney")({
  search: {
    middlewares: [retainSearchParams(["lang"])],
  },
  validateSearch: (search: Record<string, unknown>) => {
    const lang = parseLocale(search.lang);
    return lang ? { lang } : {};
  },
  head: ({ match }) => ({
    meta: [
      { title: "Mary Eliza Mahoney: biografia e linha do tempo · Calculadoras de Enfermagem" },
      { name: "description", content: description },
      { property: "og:type", content: "article" },
    ],
    links: languageLinks("/blog/mary-eliza-mahoney", (match.search as { lang?: unknown }).lang),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Mary Eliza Mahoney: biografia e linha do tempo",
          description,
          inLanguage: "pt-BR",
          dateModified: "2026-10-10",
          about: { "@type": "Person", name: "Mary Eliza Mahoney", birthDate: "1845", deathDate: "1926-01-04" },
        }),
      },
    ],
  }),
  component: () => (
    <Shell>
      <BiographyView />
    </Shell>
  ),
});
