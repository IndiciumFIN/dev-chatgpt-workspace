import type { DependencyEdge, NodeKind, NodeRef } from '../lib/impact-engine.ts';

const ORDER: NodeKind[] = ['normativo', 'dispositivo', 'atomo_normativo', 'atomo_editorial', 'formula', 'template', 'composicao', 'pagina', 'publicacao'];
const key = (n: NodeRef) => `${n.kind}:${n.id}@${n.version}`;

/** Grafo em camadas (SVG). Há sempre uma alternativa textual (lista de arestas) logo abaixo. */
export function GraphView({ edges, highlight = new Set<string>() }: { edges: readonly DependencyEdge[]; highlight?: Set<string> }) {
  const nodes = new Map<string, NodeRef>();
  edges.forEach(e => { nodes.set(key(e.source), e.source); nodes.set(key(e.dependent), e.dependent); });
  const kinds = ORDER.filter(k => [...nodes.values()].some(n => n.kind === k));
  const pos = new Map<string, { x: number; y: number }>();
  kinds.forEach((k, ci) => [...nodes.values()].filter(n => n.kind === k).forEach((n, ri) => pos.set(key(n), { x: 20 + ci * 170, y: 34 + ri * 52 })));
  const rows = Math.max(1, ...kinds.map(k => [...nodes.values()].filter(n => n.kind === k).length));
  const w = 20 + kinds.length * 170; const h = 40 + rows * 52;
  if (!edges.length) return <div className="empty"><strong>Grafo vazio.</strong><span>Cadastre dependências ou carregue os dados sintéticos.</span></div>;
  return <>
    <div className="graph"><svg role="img" aria-label={`Grafo de dependências com ${nodes.size} nós e ${edges.length} arestas`} width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {kinds.map((k, ci) => <text key={k} x={20 + ci * 170} y={16} style={{ fontWeight: 800 }}>{k.replace('_', ' ').toUpperCase()}</text>)}
      {edges.map((e, i) => { const a = pos.get(key(e.source)); const b = pos.get(key(e.dependent)); return a && b ? <line key={i} className={e.status === 'sugerida' ? 'sug' : ''} x1={a.x + 140} y1={a.y + 14} x2={b.x} y2={b.y + 14} /> : null; })}
      {[...nodes.values()].map(n => { const p = pos.get(key(n)); return p ? <g key={key(n)} className={highlight.has(key(n)) ? 'hit' : ''}><rect x={p.x} y={p.y} width={140} height={28} rx={6} /><text x={p.x + 8} y={p.y + 18}>{(n.id.length > 16 ? n.id.slice(0, 15) + '…' : n.id) + '@' + n.version}</text></g> : null; })}
    </svg></div>
    <details><summary>Alternativa textual ({edges.length} relações)</summary><ul>{edges.map((e, i) => <li key={i}>{key(e.source)} → {key(e.dependent)} ({e.relation}{e.locale ? `, ${e.locale}` : ''}{e.status === 'sugerida' ? ', SUGERIDA (não propaga)' : ''})</li>)}</ul></details>
  </>;
}

/** Diff simples campo a campo entre dois objetos (valores convertidos para texto). */
export function FieldDiff({ before, after, fields }: { before: Record<string, unknown> | undefined; after: Record<string, unknown> | undefined; fields: string[] }) {
  const changed = fields.filter(f => String(before?.[f] ?? '') !== String(after?.[f] ?? ''));
  if (!changed.length) return <p className="note">Sem diferenças nos campos comparados.</p>;
  return <>{changed.map(f => <div key={f} style={{ marginBottom: 10 }}><strong style={{ fontSize: '.8rem' }}>{f}</strong><div className="diff"><pre className="del" aria-label="Antes">{String(before?.[f] ?? '(ausente)')}</pre><pre className="add" aria-label="Depois">{String(after?.[f] ?? '(removido)')}</pre></div></div>)}</>;
}
