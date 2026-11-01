import { createFileRoute } from "@tanstack/react-router";
import { VilaPage } from "@/components/vila/vila-page";
export const Route = createFileRoute("/viladocuidado")({
  component: VilaPage,
  head: () => ({ meta: [{ title: "Vila do Cuidado | Piloto educativo" }, { name: "description", content: "Missões, histórias e emoções em uma experiência educativa candidata." }, { name: "robots", content: "noindex,nofollow" }] })
});
