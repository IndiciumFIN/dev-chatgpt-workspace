import { createFileRoute } from '@tanstack/react-router';
import { LocalWorkbenchPage } from '@/components/local/local-workbench-page';
export const Route = createFileRoute('/oficina-local')({ component: LocalWorkbenchPage, head: () => ({ meta: [{ title: 'Oficina local' }, { name: 'robots', content: 'noindex, nofollow' }] }) });
