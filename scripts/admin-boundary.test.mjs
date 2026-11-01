import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('o console isola a falha do módulo e não simula o seletor de papel da documentação', () => {
  const admin = readFileSync('src/components/admin/admin-console.tsx', 'utf8');
  const boundary = readFileSync('src/components/admin/module-boundary.tsx', 'utf8');
  assert.match(admin, /<ModuleBoundary resetKey=/);
  assert.match(admin, /<\/ModuleBoundary>/);
  assert.equal(admin.includes('super_admin'), false);
  assert.match(boundary, /role="alert"/);
  assert.match(boundary, /Nada foi aprovado/);
});
