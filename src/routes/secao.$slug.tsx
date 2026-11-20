import { createFileRoute, notFound, redirect, retainSearchParams } from "@tanstack/react-router";
import { SectionPage } from "@/components/site/section-page";
import { Shell } from "@/components/site/shell";
import { getSection } from "@/lib/sections";
import { parseLocale } from "@/lib/translate";
import { languageLinks, sectionJsonLd } from "@/lib/seo";
import type { Locale } from "@/lib/chrome";

type SectionSearch = { q?: string; lang?: Locale };

export const Route = createFileRoute("/secao/$slug")({
  search: {
    middlewares: [retainSearchParams(["lang"])],
  },
  validateSearch: (search: Record<string, unknown>): SectionSearch => {
    const lang = parseLocale(search.lang);
    return {
      q: typeof search.q === "string" ? search.q : undefined,
      ...(lang ? { lang } : {}),
    };
  },
  loader: ({ params }) => {
    if (params.slug === "sobre") {
      throw redirect({ to: "/secao/$slug", params: { slug: "missao-visao-valores" } });
    }
    const section = getSection(params.slug);
    if (!section) throw notFound();
    return { slug: section.slug, title: section.title, lead: section.lead };
  },
  head: ({ loaderData, params, match }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} · Calculadoras de Enfermagem` : "Seção" },
      { name: "description", content: loaderData?.lead ?? "" },
    ],
    links: languageLinks(`/secao/${params.slug}`, (match.search as { lang?: unknown }).lang),
    scripts: loaderData ? [{ type: "application/ld+json", children: sectionJsonLd({ slug: params.slug, title: loaderData.title, lead: loaderData.lead }) }] : [],
  }),
  component: SectionRoute,
});

function SectionRoute() {
  const { slug } = Route.useLoaderData();
  const { q } = Route.useSearch();
  const section = getSection(slug);
  if (!section) return null;
  return (
    <Shell>
      <SectionPage section={section} query={q} />
    </Shell>
  );
}
