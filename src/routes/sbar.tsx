import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/site/shell";
import { PageHero } from "@/components/site/page-hero";
import { SbarEditor } from "@/components/sbar/sbar-editor";

export const Route = createFileRoute("/sbar")({
  component: SbarPage,
  head: () => ({
    meta: [
      {
        title: "SBAR — Passagem de Plantão Estruturada · Calculadoras de Enfermagem",
      },
      {
        name: "description",
        content:
          "Gerador de passagem de plantão estruturada conforme protocolo SBAR (Situation, Background, Assessment, Recommendation). Inclui checklist crítico estilo WHO. Modelo de dados canônico conforme sbar_handoff.schema.json.",
      },
    ],
  }),
});

function SbarPage() {
  return (
    <Shell>
      <main id="conteudo" className="page-wide">
        <PageHero
          eyebrow="Comunicação clínica · Handoff"
          title="SBAR — Passagem de Plantão Estruturada"
          lead="Gerador de passagem de plantão conforme protocolo SBAR (Situation, Background, Assessment, Recommendation). Inclui checklist crítico estilo WHO, sinais vitais, avaliações de risco e critérios de escalation. Dados salvos localmente no seu navegador."
        />
        <section style={{ marginTop: "1.5rem" }}>
          <SbarEditor />
        </section>
      </main>
    </Shell>
  );
}
