import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/site/home-page";
import { Shell } from "@/components/site/shell";
import { readPublishedContent } from "@/lib/content-object.functions";
import { languageLinks, websiteJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/")({
  loader: () => readPublishedContent({ data: "/" }),
  component: Home,
  head: ({ loaderData, match }) => ({
    meta: [
      { title: loaderData?.title ?? "Calculadoras de Enfermagem, Simulados e Escalas Clínicas" },
      {
        name: "description",
        content: loaderData?.lead || "Plataforma clínica com escalas, protocolos e calculadoras de enfermagem. Design system institucional em reconstrução.",
      },
    ],
    links: languageLinks("/", (match.search as { lang?: unknown }).lang, loaderData?.editions.map((item) => item.code) ?? ["pt-BR"]),
    scripts: [{ type: "application/ld+json", children: websiteJsonLd() }],
  }),
});

function Home() {
  return (
    <Shell>
      <HomePage />
    </Shell>
  );
}
