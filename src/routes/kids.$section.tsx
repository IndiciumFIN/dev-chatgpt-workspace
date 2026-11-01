import { createFileRoute } from '@tanstack/react-router';
import { Shell } from "@/components/site/shell";
import { PageHero } from '@/components/page-hero';

export const Route = createFileRoute('/kids/$section')({
  component: KidsSection,
  head: () => ({ meta: [
    { title: 'Vila do Cuidado — Seção · Calculadoras de Enfermagem' },
    { name: 'robots', content: 'noindex, nofollow' },
  ] }),
});

function KidsSection() {
  return (
    <Shell>
      <main id="conteudo" className="page-wide">
        <PageHero
          title="Vila do Cuidado"
          eyebrow="Comunidade · seção"
          lead="Seção de conteúdo da Vila do Cuidado."
        />
      </main>
    </Shell>
  );
}
