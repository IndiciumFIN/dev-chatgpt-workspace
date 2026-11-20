import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('a documentação do console não recupera os módulos inventados', () => {
  const doc = readFileSync('docs/console-administrativo.md', 'utf8');
  for (const id of ['M01', 'M12', 'M19', 'M22']) assert.match(doc, new RegExp(id));
  assert.match(doc, /Esse console não existe/);
  assert.match(doc, /Não há painel de agentes/);
  assert.equal(doc.includes('🟢'), false);
  assert.equal(doc.includes('super_admin'), false);
  assert.equal(doc.includes('AgentsPanel'), false);
  assert.match(doc, /Não publica em GitHub, Vercel nem Supabase/);
  assert.match(doc, /não é homologação clínica/);
});
