import type { Severity } from './impact-engine.ts';

export type Row = Record<string, unknown>;
export type AttentionInput = {
  today: string; // AAAA-MM-DD
  queue: { id: string; title: string; status: string; priority: string; evidence: string[] }[];
  collections: { atoms: Row[]; apis: Row[]; sources: Row[]; reviews: Row[]; controls: Row[]; pages: Row[] };
  impact: { openCandidates: { key: string; asset: string; severity: Severity }[]; failedEvents: string[] };
  auditChainOk: boolean | null;
};
export type AttentionItem = { id: string; severity: Severity; title: string; detail: string; source: string; moduleId: string };

const RANK: Record<Severity, number> = { critica: 0, alta: 1, media: 2, baixa: 3 };
const s = (r: Row, k: string) => (r[k] === undefined || r[k] === null ? '' : String(r[k]));
const live = (rows: Row[]) => rows.filter(r => !r.archived);
const days = (from: string, to: string) => Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);

/** Deriva alertas APENAS de registros existentes. Sem SLAs inventados, sem leitura/adiamento. */
export function deriveAttention(i: AttentionInput): AttentionItem[] {
  const out: AttentionItem[] = [];
  const add = (x: AttentionItem) => out.push(x);
  for (const q of i.queue) {
    if (q.status === 'HOLD_HUMAN') add({ id: `pmo:${q.id}:hold`, severity: 'alta', title: `${q.id} aguarda decisão humana`, detail: q.title, source: 'registers/pmo/queue.v1.json', moduleId: 'pmo' });
    else if (q.priority === 'P0' && q.status !== 'DONE' && q.evidence.length === 0) add({ id: `pmo:${q.id}:noev`, severity: 'media', title: `${q.id} (P0) sem evidência anexada`, detail: 'Sem evidência não é PASS.', source: 'registers/pmo/queue.v1.json', moduleId: 'pmo' });
  }
  const pending = live(i.collections.atoms).filter(a => s(a, 'status') === 'pendente').length;
  if (pending) add({ id: 'atoms:pending', severity: 'media', title: `${pending} extração(ões) aguardando revisão`, detail: 'Átomos não revisados não podem ser usados.', source: 'coleção atoms', moduleId: 'atoms' });
  for (const a of live(i.collections.apis)) {
    const id = s(a, 'id'); const name = s(a, 'name');
    const exp = s(a, 'credentialExpiresAt');
    if (exp) { const d = days(i.today, exp); if (d < 0) add({ id: `api:${id}:cred`, severity: 'critica', title: `Credencial de ${name} expirada`, detail: `Expirou em ${exp}.`, source: `apis/${id}`, moduleId: 'apis' }); else if (d <= 30) add({ id: `api:${id}:cred`, severity: 'alta', title: `Credencial de ${name} expira em ${d} dia(s)`, detail: `Data: ${exp}.`, source: `apis/${id}`, moduleId: 'apis' }); }
    const q = Number(a.quotaMonthly); const u = Number(a.quotaUsed);
    if (q > 0 && u / q >= 0.8) add({ id: `api:${id}:quota`, severity: 'media', title: `${name}: consumo em ${Math.round((u / q) * 100)}% da cota`, detail: `${u} de ${q} chamadas.`, source: `apis/${id}`, moduleId: 'apis' });
    if (s(a, 'status') === 'quarentena') add({ id: `api:${id}:quar`, severity: 'baixa', title: `${name} em quarentena`, detail: 'Dados entram como candidatos até revisão humana.', source: `apis/${id}`, moduleId: 'apis' });
  }
  const revoked = new Set(live(i.collections.sources).filter(x => s(x, 'status') === 'revogada').map(x => s(x, 'id')));
  for (const x of live(i.collections.sources)) {
    const to = s(x, 'effectiveTo');
    if (s(x, 'status') === 'vigente' && to && to < i.today) add({ id: `src:${s(x, 'id')}:exp`, severity: 'alta', title: `Fonte ${s(x, 'title')} marcada vigente, mas a vigência terminou em ${to}`, detail: 'Atualizar a situação ou a vigência.', source: `sources/${s(x, 'id')}`, moduleId: 'sources' });
  }
  const reviewsOk = (slug: string) => live(i.collections.reviews).some(r => s(r, 'objectRef') === slug && ['aprovado', 'aprovado_com_ressalva'].includes(s(r, 'outcome')) && (!s(r, 'validUntil') || s(r, 'validUntil') >= i.today));
  for (const p of live(i.collections.pages)) {
    const slug = s(p, 'slug');
    const ids = s(p, 'sourceIds').split(',').map(x => x.trim()).filter(Boolean);
    const bad = ids.filter(x => revoked.has(x));
    if (bad.length) add({ id: `page:${slug}:revoked`, severity: 'critica', title: `Página ${slug} cita fonte revogada (${bad.join(', ')})`, detail: 'Revisar antes de qualquer nova publicação.', source: `pages/${s(p, 'id')}`, moduleId: 'pages' });
    if (s(p, 'status') === 'homologada' && !reviewsOk(slug)) add({ id: `page:${slug}:rev`, severity: 'alta', title: `Página ${slug} “homologada” sem revisão válida`, detail: 'Registre ou renove a revisão clínica/técnica.', source: `pages/${s(p, 'id')}`, moduleId: 'reviews' });
  }
  for (const r of live(i.collections.reviews)) if (['aprovado', 'aprovado_com_ressalva'].includes(s(r, 'outcome')) && s(r, 'validUntil') && s(r, 'validUntil') < i.today) add({ id: `rev:${s(r, 'id')}:exp`, severity: 'alta', title: `Revisão de ${s(r, 'objectRef')} vencida`, detail: `Validade: ${s(r, 'validUntil')}.`, source: `reviews/${s(r, 'id')}`, moduleId: 'reviews' });
  const gaps = live(i.collections.controls).filter(c => s(c, 'status') === 'lacuna').length;
  if (gaps) add({ id: 'ctl:gaps', severity: 'media', title: `${gaps} controle(s) com lacuna`, detail: 'Sem evidência ou implementação demonstrada.', source: 'coleção controls', moduleId: 'controls' });
  for (const c of i.impact.openCandidates) add({ id: `imp:${c.key}`, severity: c.severity, title: `Impacto sem decisão: ${c.asset}`, detail: 'Decisão humana pendente (impacta / não impacta / escalar).', source: 'motor de impacto (local)', moduleId: 'impact' });
  for (const e of i.impact.failedEvents) add({ id: `imp:fail:${e}`, severity: 'alta', title: `Evento de mudança ${e} falhou`, detail: 'Retome o processamento.', source: 'motor de impacto (local)', moduleId: 'impact' });
  if (i.auditChainOk === false) add({ id: 'audit:broken', severity: 'critica', title: 'Trilha de auditoria local não confere', detail: 'O encadeamento de hashes foi quebrado.', source: 'audit', moduleId: 'audit' });
  return out.sort((a, b) => RANK[a.severity] - RANK[b.severity] || a.id.localeCompare(b.id));
}
