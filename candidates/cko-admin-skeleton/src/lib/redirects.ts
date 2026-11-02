type R = Record<string, unknown>;
/** Bloqueia origem duplicada e ciclos (A→B→…→A) ao salvar um redirecionamento. */
export function redirectIssue(rows: R[], cand: { from: string; to: string }, editingId?: string): string | null {
  const live = rows.filter(r => !r.archived && r.id !== editingId);
  if (live.some(r => r.from === cand.from)) return 'Já existe redirecionamento para esta origem.';
  const map = new Map(live.map(r => [String(r.from), String(r.to)]));
  map.set(cand.from, cand.to);
  const seen = new Set<string>([cand.from]);
  let cur = cand.to;
  for (let i = 0; i < 50; i += 1) {
    if (seen.has(cur)) return 'O redirecionamento cria um ciclo.';
    const next = map.get(cur);
    if (!next) return null;
    seen.add(cur); cur = next;
  }
  return 'Cadeia de redirecionamentos longa demais.';
}
