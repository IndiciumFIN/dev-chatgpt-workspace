import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { canonicalComponents, canonicalTemplates, digitalSchemas, mapping } from '../src/data/canonical-ds.ts';

test('inventário canônico: 37 componentes, 21 templates, 14 schemas, sem duplicatas', () => {
  assert.equal(canonicalComponents.length, 37); assert.equal(new Set(canonicalComponents).size, 37);
  assert.equal(canonicalTemplates.length, 21); assert.equal(new Set(canonicalTemplates).size, 21);
  assert.equal(digitalSchemas.length, 14);
});
test('mapeamento só referencia componentes canônicos e não duplica', () => {
  const ids = mapping.map(m => m.canonical);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.every(i => canonicalComponents.includes(i)));
  assert.equal(ids.length, 37);
});
test('apenas o hero é marcado oficial e nenhum binding é inventado', () => {
  assert.deepEqual(mapping.filter(m => m.coverage === 'oficial').map(m => m.canonical), ['component.hero']);
  assert.ok(!/binding\s*:\s*\[/.test(readFileSync(new URL('../src/data/canonical-ds.ts', import.meta.url), 'utf8')));
});
test('PageHero mantém markup oficial', () => {
  const s = readFileSync(new URL('../src/ds/PageHero.tsx', import.meta.url), 'utf8');
  for (const t of ['inst-hero', 'inst-eyebrow', 'inst-lead', 'aria-labelledby']) assert.ok(s.includes(t), t);
});
