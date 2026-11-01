import { createFileRoute } from '@tanstack/react-router';
import { LocalWorkbenchPage } from '@/components/local/local-workbench-page';

/** Local-only administrator for this isolated public-backup baseline. */
export const Route = createFileRoute('/admin')({
  component: LocalWorkbenchPage,
  head: () => ({ meta: [{ title: 'Administração local · Calculadoras de Enfermagem' }, { name: 'robots', content: 'noindex, nofollow' }] }),
});
