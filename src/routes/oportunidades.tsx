import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/site/shell";
import { PageHero } from "@/components/site/page-hero";
export const Route = createFileRoute("/oportunidades")({
  head: () => ({ meta: [
    { title: "Oportunidades · Calculadoras de Enfermagem" },
    { name: "robots", content: "index, follow" },
  ] }),
  component: () => <Shell><PageHero title="Oportunidades" /></Shell>,
});
