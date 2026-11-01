import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('o console isola a falha do módulo e não simula o seletor de papel da documentação', () => {
  const admin = readFileSync('src/components/admin/admin-console.tsx', 'utf8');
  const boundary = readFileSync('src/components/admin/admin-error-boundary.tsx', 'utf8');
  for (const name of ['PMO', 'Commander', 'Visão geral', 'content', 'Templates', 'Fontes', 'Publicação']) {
    assert.match(admin, new RegExp(`AdminErrorBoundary moduleName="${name}"`));
  }
  assert.match(admin, /resetKey=\{selectedModule\}/);
  assert.equal(admin.includes('ModuleBoundary'), false);
  assert.equal(admin.includes('super_admin'), false);
  assert.match(boundary, /role="alert"/);
  assert.match(boundary, /Nenhum dado foi salvo ou publicado/);
});
