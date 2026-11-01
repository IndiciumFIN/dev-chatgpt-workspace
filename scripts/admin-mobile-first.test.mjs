import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/** Structural regression tests. They do not replace browser/visual checks. */
const read = (path) => readFileSync(path, 'utf8');
const admin = read('src/components/admin/admin-console.tsx');
const adminCss = read('src/styles/admin-console.css');
const templates = read('src/components/admin/templates-panel.tsx');
const command = read('src/routes/central-comando.tsx');
const commandCss = read('src/styles/command-center.css');

test('admin mobile navigation exposes the same seven-group sidebar in a native focus-trapping dialog', () => {
  const tree = read('src/components/admin/admin-sidebar-tree.tsx');
  const layout = read('src/styles/admin-hierarchy.css');
  assert.match(admin, /aria-haspopup="dialog"/);
  assert.match(admin, /<dialog id="ce-admin-mobile-menu" ref=\{mobileDialogRef\}/);
  assert.match(admin, /idPrefix="desktop"/);
  assert.match(admin, /idPrefix="mobile"/);
  assert.match(admin, /showModal\(\)/);
  assert.match(admin, /aria-label="Acesso rápido da administração"/);
  assert.match(tree, /aria-current=\{isActive\?'page':undefined\}/);
  assert.match(tree, /to="\/central-comando"/);
  assert.match(tree, /adminGroups\.map\(/);
  assert.match(tree, /adminModules\.filter\(/);
  assert.match(tree, /aria-expanded=\{expanded\}/);
  assert.match(layout, /\.ce-admin-mobile-dialog::backdrop/);
});

test('mobile is the starting admin composition, desktop expands progressively', () => {
  assert.match(adminCss, /ADMIN RESPONSIVO v1\.1/);
  assert.match(adminCss, /\.ce-admin \.ce-admin-sidebar\{display:none\}/);
  assert.match(adminCss, /\.ce-admin \.ce-admin-layout\{display:block/);
  assert.match(adminCss, /@media\(min-width:960px\)/);
  assert.match(adminCss, /\.ce-admin \.ce-admin-layout\{display:grid/);
  assert.match(adminCss, /env\(safe-area-inset-bottom\)/);
});

test('templates and command catalog expose mobile card labels without dropping table semantics', () => {
  for(const name of ['Template','Contrato','Origem','Situação']) {
    assert.ok(templates.includes('data-label="'+name+'"'), 'Template table lost mobile label: '+name);
  }
  assert.match(admin, /<TemplatesPanel \/>/, 'Admin tab must render extracted canonical templates panel');
  for(const name of ['Domínio','Tabela','Fase','Estado']) {
    assert.ok(command.includes('data-label="'+name+'"'));
  }
  assert.match(adminCss, /content:attr\(data-label\)/);
  assert.match(commandCss, /content:attr\(data-label\)/);
  assert.match(commandCss, /@media\(min-width:680px\)/);
});

test('central command remains isolated in mobile view', () => {
  assert.match(commandCss, /\.cc-two-column\{display:grid;grid-template-columns:minmax\(0,1fr\)/);
  assert.match(commandCss, /\.cc-metric-grid\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(command, /const unavailableReason = 'Execução indisponível:/);
  assert.match(command, /disabled type="button" title=\{unavailableReason\}/);
  assert.doesNotMatch(command, /fetch\s*\(|supabase\.from\s*\(/);
});
