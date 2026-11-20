#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import { queryList, activeChips, fold } from '../src/lib/list-query.ts';

const rows = [
  { id: 'WO-SEC-001', title: 'Segurança e dependências', status: 'IN_PROGRESS', order: 3 },
  { id: 'WO-ADM-001', title: 'Administração local — Commander', status: 'PAUSED', order: 0 },
  { id: 'WO-DS-001', title: 'Design System', status: 'HOLD_HUMAN', order: 5 },
  { id: 'WO-PMO-001', title: 'Painel PMO', status: 'DONE', order: 1 },
];
const base = { text: '', textFields: ['id', 'title'], filters: {}, page: 1, pageSize: 2 };

test('busca ignora acento e caixa, e acha por ID', () => {
  assert.equal(fold('Segurança'), 'seguranca');
  assert.deepEqual(queryList(rows, { ...base, text: 'SEGURANCA' }).rows.map(r => r.id), ['WO-SEC-001']);
  assert.deepEqual(queryList(rows, { ...base, text: 'wo-pmo' }).rows.map(r => r.id), ['WO-PMO-001']);
});
test('filtros: OR dentro da chave, AND entre chaves', () => {
  const r = queryList(rows, { ...base, pageSize: 10, filters: { status: ['PAUSED', 'DONE'] } });
  assert.equal(r.filteredTotal, 2);
  assert.equal(queryList(rows, { ...base, pageSize: 10, text: 'pmo', filters: { status: ['PAUSED'] } }).filteredTotal, 0);
});
test('ordenação numérica e textual', () => {
  assert.deepEqual(queryList(rows, { ...base, pageSize: 10, sort: { key: 'order', dir: 'desc' } }).rows.map(r => r.order), [5, 3, 1, 0]);
  assert.equal(queryList(rows, { ...base, pageSize: 10, sort: { key: 'id', dir: 'asc' } }).rows[0].id, 'WO-ADM-001');
});
test('paginação limita a página e informa denominador da fonte', () => {
  const r = queryList(rows, { ...base, page: 99 });
  assert.equal(r.page, 2); assert.equal(r.pageCount, 2); assert.equal(r.sourceTotal, 4); assert.equal(r.rows.length, 2);
});
test('não muta a entrada e lista vazia mantém 1 página', () => {
  const copy = JSON.stringify(rows);
  queryList(rows, { ...base, sort: { key: 'order', dir: 'asc' } });
  assert.equal(JSON.stringify(rows), copy);
  const empty = queryList(rows, { ...base, text: 'zzz' });
  assert.deepEqual([empty.filteredTotal, empty.pageCount, empty.page], [0, 1, 1]);
});
test('chips removíveis refletem busca e filtros', () => {
  const chips = activeChips({ text: 'abc', filters: { status: ['DONE'] } }, (k, v) => `${String(k)}: ${v}`);
  assert.deepEqual(chips.map(c => c.id), ['__text', 'status:DONE']);
});
