// Estado de cobertura face ao plano canónico (PR #21).
// Cada módulo/objeto do plano tem uma linha: ou existe, ou está declarado em falta.
// O gate reprova se um item do plano não estiver declarado aqui — nada pode desaparecer em silêncio.
export type ModuleStatus = 'PRESENT' | 'MISSING_PENDING_WAVE';

export type ModuleEntry = {
  readonly id: string;
  readonly canonicalPath: string;
  readonly priority: 'P0' | 'P1' | 'P2';
  readonly wave: string;
  readonly status: ModuleStatus;
  readonly localPath: string | null;
};

export const CANONICAL_MODULES: readonly ModuleEntry[] = [
  { id: 'capabilities', canonicalPath: 'src/core/experience/capabilities.ts', priority: 'P0', wave: 'Wave 1', status: 'MISSING_PENDING_WAVE', localPath: null },
  { id: 'resolver', canonicalPath: 'src/core/experience/resolver.ts', priority: 'P0', wave: 'Wave 2', status: 'PRESENT', localPath: 'src/core/experience/resolver.ts' },
  { id: 'state', canonicalPath: 'src/core/experience/state.ts', priority: 'P0', wave: 'Wave 3', status: 'PRESENT', localPath: 'src/core/experience/state.ts' },
  { id: 'action-bar', canonicalPath: 'src/components/experience/action-bar.tsx', priority: 'P0', wave: 'Wave 4', status: 'MISSING_PENDING_WAVE', localPath: null },
  { id: 'preview', canonicalPath: 'src/core/experience/preview.ts', priority: 'P0', wave: 'Wave 5', status: 'MISSING_PENDING_WAVE', localPath: null },
  { id: 'settings', canonicalPath: 'src/core/experience/settings.ts', priority: 'P0', wave: 'Wave 6', status: 'MISSING_PENDING_WAVE', localPath: null },
  { id: 'help', canonicalPath: 'src/core/experience/help.ts', priority: 'P0', wave: 'Wave 5', status: 'MISSING_PENDING_WAVE', localPath: null },
  { id: 'output', canonicalPath: 'src/core/experience/output.ts', priority: 'P0', wave: 'Wave 7', status: 'MISSING_PENDING_WAVE', localPath: null },
  { id: 'views', canonicalPath: 'src/core/experience/views.ts', priority: 'P1', wave: 'Wave 8', status: 'MISSING_PENDING_WAVE', localPath: null },
  { id: 'events', canonicalPath: 'src/core/experience/events.ts', priority: 'P1', wave: 'Wave 11', status: 'MISSING_PENDING_WAVE', localPath: null },
];

export const CANONICAL_OBJECT_TYPES: readonly string[] = [
  'Article','Guide','LibraryEntity','ClinicalTool','Course','Trail','JobOpportunity','Competition',
  'Residency','Question','Simulation','ResearchProject','Norm','CareerRole','Organization','MediaAsset',
];

/** Tipos de objeto com schema próprio no esqueleto local. */
export const OBJECT_TYPES_WITH_SCHEMA: readonly string[] = ['Article','LibraryEntity','ClinicalTool'];
