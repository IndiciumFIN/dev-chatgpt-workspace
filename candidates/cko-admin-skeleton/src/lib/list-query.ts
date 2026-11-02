/** Busca, filtros, ordenação e paginação para listas administrativas (puro, sem IO). */

export type SortDir = 'asc' | 'desc';
export type ListQuery<T> = {
  text: string;
  /** Campos pesquisados por texto/ID (comparação sem acento e sem caixa). */
  textFields: readonly (keyof T)[];
  /** Cada chave filtra por um dos valores listados (OR dentro da chave, AND entre chaves). */
  filters: Partial<Record<keyof T, readonly string[]>>;
  sort?: { key: keyof T; dir: SortDir };
  page: number;
  pageSize: number;
};
export type ListResult<T> = { rows: T[]; sourceTotal: number; filteredTotal: number; page: number; pageCount: number };

export const fold = (value: unknown): string =>
  String(value ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('pt-BR');

export function queryList<T extends Record<string, unknown>>(items: readonly T[], query: ListQuery<T>): ListResult<T> {
  const needle = fold(query.text).trim();
  const filtered = items.filter(item => {
    if (needle && !query.textFields.some(field => fold(item[field]).includes(needle))) return false;
    return (Object.entries(query.filters) as [keyof T, readonly string[] | undefined][])
      .every(([key, allowed]) => !allowed || allowed.length === 0 || allowed.includes(String(item[key])));
  });
  if (query.sort) {
    const { key, dir } = query.sort;
    const sign = dir === 'asc' ? 1 : -1;
    filtered.sort((a, b) => {
      const x = a[key]; const y = b[key];
      const cmp = typeof x === 'number' && typeof y === 'number' ? x - y : String(x ?? '').localeCompare(String(y ?? ''), 'pt-BR', { numeric: true });
      return cmp * sign;
    });
  }
  const pageSize = Math.max(1, Math.floor(query.pageSize));
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(Math.max(1, Math.floor(query.page) || 1), pageCount);
  return { rows: filtered.slice((page - 1) * pageSize, page * pageSize), sourceTotal: items.length, filteredTotal: filtered.length, page, pageCount };
}

/** Chips removíveis a partir do estado dos filtros (rótulo vem do chamador). */
export function activeChips<T>(query: Pick<ListQuery<T>, 'text' | 'filters'>, label: (key: keyof T, value: string) => string): { id: string; text: string; key: keyof T | '__text'; value: string }[] {
  const chips: { id: string; text: string; key: keyof T | '__text'; value: string }[] = [];
  if (query.text.trim()) chips.push({ id: '__text', text: `Busca: “${query.text.trim()}”`, key: '__text', value: query.text });
  for (const [key, values] of Object.entries(query.filters) as [keyof T, readonly string[] | undefined][]) {
    for (const value of values ?? []) chips.push({ id: `${String(key)}:${value}`, text: label(key, value), key, value });
  }
  return chips;
}
