import {parseAdminContent} from './admin-content-schema';
import { tools } from '@/lib/tools/catalog';

export type LocalToolPublication = { slug: string; title: string; lead: string; published: boolean };
export type LocalWorkbench = { schemaVersion: 1; updatedAt: string; tools: LocalToolPublication[] };
const KEY = 'cde-backup-public:workbench:v1';

export function initialWorkbench(): LocalWorkbench {
  return {
    schemaVersion: 1,
    updatedAt: '',
    // Decisão do dono do produto (2026-10-22): o backup público abre com as
// calculadoras visíveis. A semente nasce publicada, então uma instalação nova
// já mostra os cinco instrumentos em /ferramentas/$slug.
// A separação draft/published continua intacta: publicar ainda exige a ação
// explícita 'PUBLISHED' (ver local-publication-register.ts), e o gate
// scripts/check-local-publication.mjs continua valendo.
tools: tools.map(({ slug, title, lead }) => ({ slug, title, lead, published: true })),
  };
}

export function validateWorkbench(input: unknown): LocalWorkbench {
  if (!input || typeof input !== 'object') throw new Error('Documento inválido.');
  const raw = input as Record<string, unknown>;
  if (raw.schemaVersion !== 1 || !Array.isArray(raw.tools)) throw new Error('Versão ou catálogo inválido.');
  const defaults = initialWorkbench();
  if (raw.tools.length !== defaults.tools.length) throw new Error('Quantidade de instrumentos incompatível.');
  const seen = new Set<string>();
  const validated = raw.tools.map((value) => {
    const item = parseAdminContent(value);
    if (seen.has(item.slug) || !defaults.tools.some(({slug}) => slug === item.slug)) throw new Error('Slug duplicado ou desconhecido.');
    seen.add(item.slug);
    return item;
  });
  if (seen.size !== defaults.tools.length) throw new Error('Catálogo incompleto.');
  return { schemaVersion: 1, updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : '', tools: validated };
}

export function readWorkbench(): LocalWorkbench {
  if (typeof window === 'undefined') return initialWorkbench();
  const value = window.localStorage.getItem(KEY);
  if (!value) return initialWorkbench();
  return validateWorkbench(JSON.parse(value) as unknown);
}

export function writeWorkbench(value: LocalWorkbench): LocalWorkbench {
  if (typeof window === 'undefined') throw new Error('A oficina exige um navegador.');
  const validated = validateWorkbench(value);
  validated.updatedAt = new Date().toISOString();
  window.localStorage.setItem(KEY, JSON.stringify(validated));
  return validated;
}

export function exportWorkbench(value: LocalWorkbench) {
  const blob = new Blob([JSON.stringify(validateWorkbench(value), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'cde-local-publication-v1.json';
  link.click();
  URL.revokeObjectURL(url);
}
