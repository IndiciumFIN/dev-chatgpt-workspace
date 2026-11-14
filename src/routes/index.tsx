import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/site/home-page";
import { Shell } from "@/components/site/shell";
import { languageLinks, websiteJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/")({
  component: Home,
  head: ({ match }) => ({
    meta: [
      { title: "Calculadoras de Enfermagem, Simulados e Escalas Clínicas" },
      {
        name: "description",
        content:
          "Plataforma clínica com escalas, protocolos e calculadoras de enfermagem. Design system institucional em reconstrução.",
      },
    ],
    links: languageLinks("/", (match.search as { lang?: unknown }).lang),
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
