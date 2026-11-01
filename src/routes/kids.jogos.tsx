import { createFileRoute } from '@tanstack/react-router';
import { Shell } from "@/components/site/shell";
import { PageHero } from '@/components/page-hero';

export const Route = createFileRoute('/kids/jogos')({
  component: () => (
    <Shell>
      <main id="conteudo" className="page-wide">
        <PageHero title="Jogos" eyebrow="Vila do Cuidado · educational" lead="Jogos educacionais da Vila do Cuidado." />
        <section className="ce-admin-panel"><h2>Status: CANDIDATE</h2><p>Conteúdo em desenvolvimento.</p></section>
      </main>
    </Shell>
  ),
  head: () => ({ meta: [{ title: 'Jogos · Vila do Cuidado' }, { name: 'robots', content: 'noindex, nofollow' }] }),
});
