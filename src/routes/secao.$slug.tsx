import { createFileRoute, notFound, redirect, retainSearchParams } from "@tanstack/react-router";
import { SectionPage } from "@/components/site/section-page";
import { Shell } from "@/components/site/shell";
import { readLiveSection } from "@/lib/stored.functions";
import { parseLocale } from "@/lib/translate";
import { languageLinks } from "@/lib/seo";

type SectionSearch = { q?: string; lang?: "pt-BR" | "en" | "es" | "fr" };

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
  loader: async ({ params }) => {
    if (params.slug === "sobre") {
      throw redirect({ to: "/secao/$slug", params: { slug: "missao-visao-valores" } });
    }
    const live = await readLiveSection({ data: params.slug });
    if (!live) throw notFound();
    return live;
  },
  head: ({ loaderData, params, match }) => ({
    meta: [
      { title: loaderData ? `${loaderData.section.title} · Calculadoras de Enfermagem` : "Seção" },
      { name: "description", content: loaderData?.section.lead ?? "" },
    ],
    links: languageLinks(`/secao/${params.slug}`, (match.search as { lang?: unknown }).lang),
  }),
  component: SectionRoute,
});

function SectionRoute() {
  const { section, framed, trail, related } = Route.useLoaderData();
  const { q } = Route.useSearch();
  return (
    <Shell>
      <SectionPage section={section} query={q} framed={framed} trail={trail} related={related} />
    </Shell>
  );
}
