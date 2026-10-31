/**
 * Canonical, pure and read-only query engine for administrative lists.
 * NEVER changes governance state, never persists search inputs, never promotes a WO.
 */
export type ListFilter = 'all' | 'active' | 'holds';
export type ListSort = 'order' | 'priority' | 'title';
export type QueryOptions = { search: string; filter: ListFilter; sort: ListSort; page: number; pageSize: number };
export type PmoListItem = {
  id: string; title: string; order: number; status: string; priority: string;
  owner: string; criteria: string; next: string;
};
export type ListResult<T> = {
  items: T[]; total: number; page: number; pageSize: number; pages: number;
  start: number; end: number; query: string;
};
const collator = new Intl.Collator('pt-BR', {numeric:true, sensitivity:'base'});
const normal = (text: string): string => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
const prio = (s: string): number => {
  const m = /^P([0-9]+)$/.exec(s.toUpperCase());
  return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
};
export function queryPmo<T extends PmoListItem>(source: readonly T[], options: QueryOptions): ListResult<T> {
  if (!['all','active','holds'].includes(options.filter)) throw new Error('INVALID_PMO_FILTER');
  if (!['order','priority','title'].includes(options.sort)) throw new Error('INVALID_PMO_SORT');
  if (!Number.isSafeInteger(options.page) || options.page < 1) throw new Error('INVALID_PMO_PAGE');
  if (![5,10,20,50].includes(options.pageSize)) throw new Error('INVALID_PMO_PAGE_SIZE');
  if (!Array.isArray(source)) throw new Error('INVALID_PMO_SOURCE');
  if (new Set(source.map(item => item.id)).size !== source.length) throw new Error('DUPLICATE_PMO_ID');
  const term = normal(options.search);
  if (term.length > 150) throw new Error('PMO_QUERY_TOO_LONG');
  const allowed = options.filter === 'all' ? null
    : options.filter === 'active' ? new Set(['IN_PROGRESS','QUEUED'])
    : new Set(['PAUSED','HOLD_HUMAN']);
  const rows = source.filter(item => {
    if (allowed && !allowed.has(item.status)) return false;
    if (!term) return true;
    return normal([item.id,item.title,item.priority,item.owner,item.status,item.criteria,item.next].join(' ')).includes(term);
  });
  rows.sort((a,b) => {
    if (options.sort === 'priority') {
      const p = prio(a.priority)-prio(b.priority);
      if (p !== 0) return p;
    } else if (options.sort === 'title') {
      const t = collator.compare(a.title,b.title);
      if (t !== 0) return t;
    }
    return a.order-b.order || collator.compare(a.id,b.id);
  });
  const total = rows.length, pages = Math.max(1,Math.ceil(total/options.pageSize));
  const page = Math.min(options.page,pages);
  const startIndex = (page-1)*options.pageSize;
  const visible = rows.slice(startIndex,startIndex+options.pageSize);
  return {items:visible,total,page,pageSize:options.pageSize,pages,start:total?startIndex+1:0,end:total?startIndex+visible.length:0,query:term};
}
