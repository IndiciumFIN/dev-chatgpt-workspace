import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/site/shell";
import { PageHero } from "@/components/site/page-hero";
export const Route = createFileRoute("/bolsas")({
  head: () => ({ meta: [
    { title: "Bolsas · Calculadoras de Enfermagem" },
    { name: "robots", content: "index, follow" },
  ] }),
  component: () => <Shell><PageHero title="Bolsas" /></Shell>,
});
