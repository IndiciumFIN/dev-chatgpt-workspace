import { initialWorkbench, validateWorkbench, type LocalWorkbench } from './local-workbench-store';

const REGISTER_KEY = 'cde-backup-public:publication-register:v2';
const LEGACY_KEY = 'cde-backup-public:workbench:v1';
export type PublicationEvent = { id: string; action: 'DRAFT_SAVED' | 'PUBLISHED'; revision: number; at: string; previousRevision: number };
export type PublicationRegister = { schemaVersion: 2; revision: number; draft: LocalWorkbench; published: LocalWorkbench; events: PublicationEvent[] };
function storage(): Storage { if (typeof window === 'undefined') throw new Error('Registro disponível somente no navegador.'); return window.localStorage; }
function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
function validateRegister(value: unknown): PublicationRegister {
  if (!value || typeof value !== 'object') throw new Error('Register inválido.');
  const raw = value as Record<string, unknown>;
  if (raw.schemaVersion !== 2 || !Number.isSafeInteger(raw.revision) || (raw.revision as number) < 0 || !Array.isArray(raw.events)) throw new Error('Register incompatível.');
  if (raw.events.length > 500) throw new Error('Limite do histórico excedido. Exporte antes de continuar.');
  const events: PublicationEvent[] = raw.events.map((entry) => {
    if (!entry || typeof entry !== 'object') throw new Error('Evento inválido.');
    const e = entry as Record<string, unknown>;
    if (typeof e.id !== 'string' || !/^[a-zA-Z0-9-]{1,100}$/.test(e.id) || (e.action !== 'DRAFT_SAVED' && e.action !== 'PUBLISHED') ||
      typeof e.at !== 'string' || !Number.isSafeInteger(e.revision) || !Number.isSafeInteger(e.previousRevision)) throw new Error('Evento malformado.');
    return e as PublicationEvent;
  });
  // Tampering, gaps and out-of-order events fail closed instead of appearing audited.
  if (events.length !== (raw.revision as number)) throw new Error('Histórico de revisões incompleto ou adulterado.');
  for (let index = 0; index < events.length; index += 1) {
    const e = events[index];
    if (e.revision !== index + 1 || e.previousRevision !== index || !Number.isFinite(Date.parse(e.at))) {
      throw new Error('Sequência de eventos inválida.');
    }
  }
  if (new Set(events.map((e) => e.id)).size !== events.length) throw new Error('Identificadores de evento duplicados.');
  return { schemaVersion: 2, revision: raw.revision as number, draft: validateWorkbench(raw.draft), published: validateWorkbench(raw.published), events };
}
export function readPublicationRegister(): PublicationRegister {
  if (typeof window === 'undefined') return { schemaVersion: 2, revision: 0, draft: initialWorkbench(), published: initialWorkbench(), events: [] };
  const current = storage().getItem(REGISTER_KEY);
  if (current !== null) return validateRegister(JSON.parse(current) as unknown);
  // Legacy v1 is unapproved input: migrate as draft only, NEVER as a publication.
  const legacy = storage().getItem(LEGACY_KEY);
  return { schemaVersion: 2, revision: 0, draft: legacy === null ? initialWorkbench() : validateWorkbench(JSON.parse(legacy) as unknown), published: initialWorkbench(), events: [] };
}
function persist(register: PublicationRegister): PublicationRegister {
  const validated = validateRegister(register);
  storage().setItem(REGISTER_KEY, JSON.stringify(validated));
  window.dispatchEvent(new Event('cde-publication-updated'));
  return validated;
}
function transition(action: PublicationEvent['action'], expectedRevision: number, draft?: LocalWorkbench): PublicationRegister {
  const current = readPublicationRegister();
  if (!Number.isSafeInteger(expectedRevision) || current.revision !== expectedRevision) {
    throw new Error('Conflito de revisão: outra aba alterou o registro. Recarregue antes de salvar ou publicar.');
  }
  const now = new Date().toISOString();
  const nextRevision = current.revision + 1;
  const next = { ...current, revision: nextRevision, draft: draft ? validateWorkbench(draft) : current.draft,
    published: action === 'PUBLISHED' ? clone(validateWorkbench(current.draft)) : current.published,
    events: [...current.events, { id: crypto.randomUUID(), action, revision: nextRevision, previousRevision: current.revision, at: now }] };
  if (next.events.length > 500) throw new Error('Limite do histórico atingido. Exporte o registro.');
  return persist(next as PublicationRegister);
}
export function saveLocalDraft(draft: LocalWorkbench, expectedRevision: number): PublicationRegister { return transition('DRAFT_SAVED', expectedRevision, draft); }
export function publishLocalDraft(expectedRevision: number): PublicationRegister { return transition('PUBLISHED', expectedRevision); }
export function readLocalPublished(): LocalWorkbench { return readPublicationRegister().published; }
export function exportPublicationRegister(): void {
  const blob = new Blob([JSON.stringify(readPublicationRegister(), null, 2)], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = href; link.download = 'cde-publication-register-v2.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}
