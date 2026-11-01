import { createFileRoute } from '@tanstack/react-router';
import { Shell } from "@/components/site/shell";
import { PageHero } from '@/components/page-hero';

export const Route = createFileRoute('/kids/')({
  component: KidsIndex,
  head: () => ({ meta: [
    { title: 'Vila do Cuidado · Calculadoras de Enfermagem' },
    { name: 'robots', content: 'noindex, nofollow' },
  ] }),
});

function KidsIndex() {
  return (
    <Shell>
      <main id="conteudo" className="page-wide">
        <PageHero
          title="Vila do Cuidado"
          eyebrow="Comunidade · narrativas de cuidado"
          lead="Plataforma de histórias, narrativas de cuidado e comunidade para profissionais e pacientes."
        />
        <section className="ce-admin-panel">
          <h2>Status: CANDIDATE</h2>
          <p>Plataforma em desenvolvimento. Conteúdo aguardando curadoria humana.</p>
        </section>
      </main>
    </Shell>
  );
}
