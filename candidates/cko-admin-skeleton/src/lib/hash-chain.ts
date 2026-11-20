/** Trilha de auditoria local com hash encadeado (SHA-256). Detecta adulteração do histórico;
 *  NÃO é auditoria imutável de servidor nem prova de autoria (não há identidade neste ambiente). */
export type AuditEntry = { seq: number; at: string; actor: string; action: string; objectRef: string; summary: string; prevHash: string; hash: string };
export const GENESIS = '0'.repeat(64);
export const LOCAL_ACTOR = 'operador-local (não autenticado)';

export async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}
const payload = (e: Omit<AuditEntry, 'hash'>) => JSON.stringify([e.seq, e.at, e.actor, e.action, e.objectRef, e.summary, e.prevHash]);

export async function appendEntry(chain: readonly AuditEntry[], input: { action: string; objectRef: string; summary: string; actor?: string; at?: string }): Promise<AuditEntry[]> {
  const prev = chain[chain.length - 1];
  const base = { seq: chain.length + 1, at: input.at ?? new Date().toISOString(), actor: input.actor ?? LOCAL_ACTOR, action: input.action, objectRef: input.objectRef, summary: input.summary.slice(0, 300), prevHash: prev ? prev.hash : GENESIS };
  return [...chain, { ...base, hash: await sha256Hex(payload(base)) }];
}

export async function verifyChain(chain: readonly AuditEntry[]): Promise<{ ok: boolean; checked: number; brokenAt?: number; reason?: string }> {
  let prevHash = GENESIS;
  for (let i = 0; i < chain.length; i += 1) {
    const e = chain[i];
    if (e.seq !== i + 1) return { ok: false, checked: i, brokenAt: e.seq, reason: 'Sequência fora de ordem ou com lacuna.' };
    if (e.prevHash !== prevHash) return { ok: false, checked: i, brokenAt: e.seq, reason: 'Elo anterior não confere.' };
    const { hash, ...rest } = e;
    if (hash !== await sha256Hex(payload(rest))) return { ok: false, checked: i, brokenAt: e.seq, reason: 'Conteúdo alterado após o registro.' };
    prevHash = hash;
  }
  return { ok: true, checked: chain.length };
}
