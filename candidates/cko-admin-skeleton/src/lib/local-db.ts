import { useSyncExternalStore } from 'react';
import { appendEntry, type AuditEntry } from './hash-chain.ts';

/** Persistência exclusivamente local (localStorage), com fallback em memória. Sem rede.
 *  Não guardar PHI, credenciais, tokens ou identificadores de pacientes. */
const PREFIX = 'cko-admin:v1:';
const cache = new Map<string, unknown>();
const listeners = new Set<() => void>();
export const corruptKeys = new Set<string>();
let memoryOnly = false;
const memory = new Map<string, string>();

function store(): Storage | null { try { return typeof window === 'undefined' ? null : window.localStorage; } catch { return null; } }
export const storageMode = () => (store() && !memoryOnly ? 'localStorage' : 'memória (não persiste)');

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = store()?.getItem(PREFIX + key) ?? memory.get(key) ?? null;
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch { corruptKeys.add(key); return fallback; }
}
export function writeJSON(key: string, value: unknown): boolean {
  const text = JSON.stringify(value);
  try { store()?.setItem(PREFIX + key, text); memory.delete(key); return true; }
  catch { memoryOnly = true; memory.set(key, text); return false; }
}
export function getKey<T>(key: string, fallback: T): T {
  if (!cache.has(key)) cache.set(key, readJSON(key, fallback));
  return cache.get(key) as T;
}
export function setKey<T>(key: string, value: T): void { cache.set(key, value); writeJSON(key, value); listeners.forEach(l => l()); }
export function useKey<T>(key: string, fallback: T): [T, (next: T | ((prev: T) => T)) => void] {
  const value = useSyncExternalStore(cb => { listeners.add(cb); return () => { listeners.delete(cb); }; }, () => getKey(key, fallback));
  return [value, next => setKey(key, typeof next === 'function' ? (next as (p: T) => T)(getKey(key, fallback)) : next)];
}
export function resetCacheForTests() { cache.clear(); memory.clear(); corruptKeys.clear(); }

// ---- Auditoria encadeada (fila serial para não perder elos) ----
const EMPTY_AUDIT: AuditEntry[] = [];
let queue: Promise<unknown> = Promise.resolve();
export function logAudit(action: string, objectRef: string, summary: string): Promise<void> {
  queue = queue.then(async () => setKey('audit', await appendEntry(getKey<AuditEntry[]>('audit', EMPTY_AUDIT), { action, objectRef, summary }))).catch(() => undefined);
  return queue as Promise<void>;
}
export const useAudit = () => useKey<AuditEntry[]>('audit', EMPTY_AUDIT)[0];

// ---- Coleções arquiváveis (nada é apagado: arquiva-se; versões e evidências permanecem) ----
export type Row = { id: string; archived?: boolean; synthetic?: boolean; updatedAt?: string; [k: string]: unknown };
const EMPTY_ROWS: Row[] = [];
export function nextId(prefix: string, rows: readonly Row[]): string {
  const max = rows.reduce((m, r) => { const n = Number(String(r.id).split('-').pop()); return Number.isFinite(n) && n > m ? n : m; }, 0);
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
}
export function useCollection<T extends Row>(name: string, prefix: string) {
  const [rows, setRows] = useKey<Row[]>(`col:${name}`, EMPTY_ROWS);
  return {
    rows: rows as T[],
    save(value: Partial<T> & Record<string, unknown>, id?: string): string {
      const now = new Date().toISOString();
      const rid = id ?? nextId(prefix, rows);
      setRows(prev => id ? prev.map(r => r.id === id ? { ...r, ...value, id, updatedAt: now } : r) : [...prev, { ...value, id: rid, updatedAt: now }]);
      void logAudit(id ? 'ATUALIZAR' : 'CRIAR', `${name}/${rid}`, `${id ? 'Atualizado' : 'Criado'} registro em ${name}.`);
      return rid;
    },
    setArchived(id: string, archived: boolean) {
      setRows(prev => prev.map(r => r.id === id ? { ...r, archived, updatedAt: new Date().toISOString() } : r));
      void logAudit(archived ? 'ARQUIVAR' : 'RESTAURAR', `${name}/${id}`, `${archived ? 'Arquivado' : 'Restaurado'} em ${name}.`);
    },
  };
}

// ---- Backup / restauração ----
export const BACKUP_KEY_PATTERN = /^(col:[a-z]+|impact:[a-z]+|audit|publication:snapshots|playbooks:progress|site:locales|settings)$/;
export function exportAllKeys(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const st = store();
  if (st) for (let i = 0; i < st.length; i += 1) { const k = st.key(i); if (k?.startsWith(PREFIX)) { const short = k.slice(PREFIX.length); if (BACKUP_KEY_PATTERN.test(short)) out[short] = readJSON(short, null); } }
  for (const [k, v] of cache) if (BACKUP_KEY_PATTERN.test(k)) out[k] = v;
  return out;
}
export function clearAllKeys(): void {
  const st = store();
  if (st) for (const k of Object.keys(exportAllKeys())) st.removeItem(PREFIX + k);
  cache.clear(); memory.clear(); listeners.forEach(l => l());
}
