import { createFileRoute, notFound, retainSearchParams } from "@tanstack/react-router";
import { Shell } from "@/components/site/shell";
import { BiographyView } from "@/components/templates/biography-view";
import { readPublishedContent } from "@/lib/content-object.functions";
import { languageLinks } from "@/lib/seo";
import { parseLocale } from "@/lib/translate";

export const Route = createFileRoute("/blog/mary-eliza-mahoney")({
  search: {
    middlewares: [retainSearchParams(["lang"])],
  },
  validateSearch: (search: Record<string, unknown>) => {
    const lang = parseLocale(search.lang);
    return lang ? { lang } : {};
  },
  loader: async () => {
    const row = await readPublishedContent({ data: "/blog/mary-eliza-mahoney" });
    if (!row) throw notFound();
    return row;
  },
  head: ({ loaderData, match }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Mary Eliza Mahoney"} · Calculadoras de Enfermagem` },
      { name: "description", content: loaderData?.lead ?? "" },
      { property: "og:type", content: "article" },
    ],
    links: languageLinks("/blog/mary-eliza-mahoney", (match.search as { lang?: unknown }).lang),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: loaderData?.title,
          description: loaderData?.lead,
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
