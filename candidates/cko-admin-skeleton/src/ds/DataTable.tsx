import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { activeChips, fold, queryList, type SortDir } from '../lib/list-query.ts';
import { EmptyState, StatusBadge, SyntheticTag } from './ui.tsx';

export type Column<T> = { key: string; label: string; render?: (row: T) => React.ReactNode };
type Props<T extends Record<string, unknown>> = {
  id: string; rows: T[]; columns: Column<T>[]; searchFields: string[]; statusKey?: string; pageSize?: number;
  sourceLabel: string; emptyHint: string; onOpen?: (row: T) => void; defaultSort?: { key: string; dir: SortDir };
};

/** Lista governada: busca texto/ID, filtros visíveis, chips removíveis, ordenação, paginação, contagem com fonte e estados. */
export function DataTable<T extends Record<string, unknown>>({ id, rows, columns, searchFields, statusKey, pageSize = 8, sourceLabel, emptyHint, onOpen, defaultSort }: Props<T>) {
  const [text, setText] = useState(''); const [statuses, setStatuses] = useState<string[]>([]); const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState(defaultSort?.key ?? columns[0].key); const [dir, setDir] = useState<SortDir>(defaultSort?.dir ?? 'asc');
  const [showArchived, setShowArchived] = useState(false);
  const base = useMemo(() => rows.filter(r => showArchived || !r.archived), [rows, showArchived]);
  const present = useMemo(() => Array.from(new Set(base.map(r => String(r[statusKey ?? ''] ?? '')).filter(Boolean))), [base, statusKey]);
  const query = { text, textFields: searchFields as (keyof T)[], filters: (statusKey ? { [statusKey]: statuses } : {}) as Partial<Record<keyof T, string[]>>, sort: { key: sortKey as keyof T, dir }, page, pageSize };
  const res = queryList<T>(base, query);
  const chips = activeChips<T>(query, (_k, v) => `Situação: ${v.replaceAll('_', ' ')}`);
  const toggle = (v: string) => { setStatuses(c => (c.includes(v) ? c.filter(x => x !== v) : [...c, v])); setPage(1); };
  return <div data-testid={`list-${id}`}>
    <form className="listbar" role="search" aria-label="Buscar e filtrar" onSubmit={e => e.preventDefault()}>
      <div className="field"><label htmlFor={`${id}-q`}>Buscar por texto ou ID</label><div style={{ position: 'relative' }}><Search size={16} aria-hidden="true" style={{ position: 'absolute', left: 10, top: 14, color: 'var(--color-muted)' }} /><input id={`${id}-q`} type="search" style={{ paddingLeft: 32 }} value={text} autoComplete="off" onChange={e => { setText(e.target.value); setPage(1); }} /></div></div>
      {statusKey && present.length > 0 && <fieldset className="checks"><legend>Situação</legend>{present.map(v => <label key={v}><input type="checkbox" checked={statuses.includes(v)} onChange={() => toggle(v)} />{v.replaceAll('_', ' ')}</label>)}</fieldset>}
      <div className="field" style={{ maxWidth: 190 }}><label htmlFor={`${id}-s`}>Ordenar por</label><select id={`${id}-s`} value={sortKey} onChange={e => { setSortKey(e.target.value); setPage(1); }}>{columns.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}</select></div>
      <div className="field" style={{ maxWidth: 140 }}><label htmlFor={`${id}-d`}>Sentido</label><select id={`${id}-d`} value={dir} onChange={e => setDir(e.target.value as SortDir)}><option value="asc">Crescente</option><option value="desc">Decrescente</option></select></div>
      <label className="row" style={{ minHeight: 44 }}><input type="checkbox" checked={showArchived} onChange={e => { setShowArchived(e.target.checked); setPage(1); }} />Mostrar arquivados</label>
    </form>
    {chips.length > 0 && <ul className="chips" aria-label="Filtros ativos">{chips.map(c => <li key={c.id}><button type="button" className="chip" aria-label={`Remover filtro ${c.text}`} onClick={() => { if (c.key === '__text') setText(''); else toggle(c.value); setPage(1); }}>{c.text}<X size={13} aria-hidden="true" /></button></li>)}
      <li><button type="button" className="chip" onClick={() => { setText(''); setStatuses([]); setPage(1); }}>Limpar tudo</button></li></ul>}
    <p className="count" role="status" aria-live="polite" data-testid={`count-${id}`}>{res.filteredTotal} de {res.sourceTotal} registros · fonte: {sourceLabel}</p>
    {res.filteredTotal === 0 ? <EmptyState title={res.sourceTotal === 0 ? 'Nada cadastrado ainda.' : 'Nenhum registro corresponde aos filtros.'}>{res.sourceTotal === 0 ? emptyHint : 'Ajuste a busca ou use “Limpar tudo”.'}</EmptyState> :
      <div className="tablewrap"><table><thead><tr>{columns.map(c => <th key={c.key} scope="col" aria-sort={c.key === sortKey ? (dir === 'asc' ? 'ascending' : 'descending') : undefined}>{c.label}</th>)}</tr></thead>
        <tbody>{res.rows.map(r => <tr key={String(r.id)} className={`${onOpen ? 'rowlink' : ''}${r.archived ? ' archived' : ''}`} onClick={() => onOpen?.(r)}>
          {columns.map((c, i) => <td key={c.key}>{c.render ? c.render(r) : c.key === statusKey ? <StatusBadge value={String(r[c.key] ?? '')} /> : String(r[c.key] ?? '—')}
            {i === 0 && onOpen && <button type="button" className="sr" onClick={e => { e.stopPropagation(); onOpen(r); }}>Abrir {String(r.id)}</button>}
            {i === 0 && Boolean(r.synthetic) && <> <SyntheticTag /></>}{i === 0 && Boolean(r.archived) && <> <span className="tag">arquivado</span></>}</td>)}</tr>)}</tbody></table></div>}
    {res.pageCount > 1 && <nav className="pager" aria-label="Paginação"><button type="button" className="btn" disabled={res.page <= 1} onClick={() => setPage(res.page - 1)}><ChevronLeft size={16} aria-hidden="true" />Anterior</button><span>Página {res.page} de {res.pageCount}</span><button type="button" className="btn" disabled={res.page >= res.pageCount} onClick={() => setPage(res.page + 1)}>Próxima<ChevronRight size={16} aria-hidden="true" /></button></nav>}
  </div>;
}
export { fold };
