/** Gates de pré-publicação (projeção local). Puro e determinístico. */
export type Row = Record<string, unknown>;
export type GateInput = { today: string; pages: Row[]; seo: Row[]; reviews: Row[]; sources: Row[]; reftests: Row[] };
export type PageGate = { slug: string; blockers: string[]; warnings: string[] };
export type GateReport = { perPage: PageGate[]; global: string[]; blocked: boolean; mdGate: 'fechado' };

const s = (r: Row, k: string) => (r[k] === undefined || r[k] === null ? '' : String(r[k]));
const live = (rows: Row[]) => rows.filter(r => !r.archived);

export function evaluateGates(i: GateInput): GateReport {
  const seo = live(i.seo); const sources = live(i.sources); const reviews = live(i.reviews);
  const perPage: PageGate[] = live(i.pages).filter(p => p.include === true).map(p => {
    const slug = s(p, 'slug'); const blockers: string[] = []; const warnings: string[] = [];
    const ids = s(p, 'sourceIds').split(',').map(x => x.trim()).filter(Boolean);
    if (!ids.length) blockers.push('Sem fonte declarada.');
    for (const id of ids) {
      const src = sources.find(x => s(x, 'id') === id);
      if (!src) blockers.push(`Fonte ${id} não cadastrada.`);
      else if (s(src, 'status') === 'revogada') blockers.push(`Fonte ${id} revogada.`);
      else if (s(src, 'status') === 'candidata' && s(p, 'status') === 'homologada') blockers.push(`Fonte ${id} ainda candidata; página não pode ser homologada.`);
      else if (s(src, 'effectiveTo') && s(src, 'effectiveTo') < i.today) warnings.push(`Vigência da fonte ${id} terminou em ${s(src, 'effectiveTo')}.`);
    }
    const meta = seo.find(x => s(x, 'route') === `/ferramentas/${slug}`);
    if (!meta) blockers.push(`Sem metadados SEO para /ferramentas/${slug}.`);
    else if (s(p, 'status') === 'candidata' && meta.noindex !== true) blockers.push('Candidata deve estar noindex.');
    const valid = reviews.some(r => s(r, 'objectRef') === slug && ['aprovado', 'aprovado_com_ressalva'].includes(s(r, 'outcome')) && (!s(r, 'validUntil') || s(r, 'validUntil') >= i.today));
    if (!valid) (s(p, 'status') === 'homologada' ? blockers : warnings).push('Sem revisão clínica/técnica válida.');
    return { slug, blockers, warnings };
  });
  const global: string[] = [];
  if (live(i.reftests).some(t => s(t, 'lastResult') === 'falhou')) global.push('Há teste(s) de referência falhando.');
  return { perPage, global, blocked: global.length > 0 || perPage.some(p => p.blockers.length > 0), mdGate: 'fechado' };
}

export type Snapshot = { rev: number; at: string; label: string; pages: Row[]; hash: string; prevHash: string };
export type PageDiff = { slug: string; kind: 'novo' | 'alterado' | 'removido'; before?: Row; after?: Row };
export const DIFF_FIELDS = ['title', 'lead', 'template', 'sourceIds', 'status'];
export function diffSnapshots(prev: Row[] | undefined, next: Row[]): PageDiff[] {
  const a = new Map((prev ?? []).map(p => [s(p, 'slug'), p])); const b = new Map(next.map(p => [s(p, 'slug'), p]));
  const out: PageDiff[] = [];
  for (const [slug, p] of b) { const o = a.get(slug); if (!o) out.push({ slug, kind: 'novo', after: p }); else if (DIFF_FIELDS.some(f => s(o, f) !== s(p, f))) out.push({ slug, kind: 'alterado', before: o, after: p }); }
  for (const [slug, p] of a) if (!b.has(slug)) out.push({ slug, kind: 'removido', before: p });
  return out;
}
