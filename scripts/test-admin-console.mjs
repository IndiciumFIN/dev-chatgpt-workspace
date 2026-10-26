#!/usr/bin/env node
/** Contract checks for the single canonical administrative console (no network / no mocks). */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
const read = path => readFileSync(path, 'utf8');
const ui = read('src/components/admin/admin-console.tsx');
const shared = read('src/components/local/local-workbench-page.tsx');
const store = read('src/lib/local-publication-register.ts');
const style = read('src/styles/admin-console.css');
const moduleRegistry = read('src/lib/admin-module-registry.ts');
const sidebar = read('src/components/admin/admin-sidebar-tree.tsx');
const moduleCodes = [...moduleRegistry.matchAll(/\{id:'(M\d\d)',group:'(G\d\d)',title:/g)].map(x => x[1]);
const groupCodes = [...moduleRegistry.matchAll(/\{id:'(G\d\d)',title:/g)].map(x => x[1]);
const moduleRefs = [...moduleRegistry.matchAll(/(?:receives|sends):\[([^\]]*)\]/g)].flatMap(x=>[...x[1].matchAll(/'M\d\d'/g)].map(y=>y[0].slice(1,-1)));
const assertions = [
  ['admin and oficina reuse a single component', /export \{ AdminConsole as LocalWorkbenchPage \}/.test(shared)],
  ['canonical tool data not copied into admin', /import \{ tools \} from '@\/lib\/tools\/catalog'/.test(ui) && !/const tools\s*=\s*\[/.test(ui)],
  ['templates derive from canonical registry', /templateCatalogo/.test(ui) && /templateContracts/.test(ui)],
  ['all pre-existing local surfaces stay accessible', ['overview','content','templates','sources','publication','pmo','governance'].every(tab => ui.includes(`tab === '${tab}'`))],
  ['draft and published shown distinctly', /setPreviewVersion\('published'\)/.test(ui) && /previewVersion === 'draft' \? model : published/.test(ui)],
  ['save and publish remain explicit independent actions', /saveLocalDraft\(model, revision\)/.test(ui) && /publishLocalDraft\(revision\)/.test(ui)],
  ['publish requires saved draft', /if \(dirty\) throw/.test(ui) && /disabled=\{dirty\}/.test(ui)],
  ['publication requires explicit acknowledgement', /if \(!confirmation\) throw/.test(ui) && /setConfirmation\(e.target.checked\)/.test(ui)],
  ['optimistic revision check still blocks conflicts', /current.revision !== expectedRevision/.test(store)],
  ['local browser storage is the only editor persistence', !/\b(fetch|axios|supabase|getSql|getPglite)\s*\(/.test(ui)],
  ['real end-user routes provided only for published local projection', /previewVersion === 'published' && <Link/.test(ui)],
  ['canonical design tokens reused', /var\(--color-navy\)/.test(style) && /var\(--color-line\)/.test(style) && !/--color-navy\s*:/.test(style)],
  ['browser and accessible feedback present', /role="status" aria-live="polite"/.test(ui) && /aria-invalid=/.test(ui)],
  ['seven unique macro groups defined', groupCodes.length === 7 && new Set(groupCodes).size === 7],
  ['twenty-one operational modules registered', moduleCodes.length === 21 && new Set(moduleCodes).size === 22],
  ['all module relationships resolve to known IDs', moduleRefs.length > 0 && moduleRefs.every(id => moduleCodes.includes(id))],
  ['seven macro groups and 21 modules are nested in one sidebar', /AdminSidebarTree selectedId=\{selectedModule\}/.test(ui) && /adminGroups\.map\(/.test(sidebar) && /adminModules\.filter\(/.test(sidebar) && !/fetch\s*\(/.test(sidebar)],
  ['module boundaries disclosed; unavailable actions are not executors', /não concedem permissão de escrita/.test(read('src/components/admin/admin-module-workspace.tsx')) && /AdminModuleWorkspace key=\{selectedModule\}/.test(ui)],
];
let failed = 0;
for (const [name, pass] of assertions) { console.log(`${pass ? 'PASS' : 'FAIL'} ADMIN: ${name}`); if (!pass) failed++; }
assert.equal(failed, 0, `${failed} admin contracts failed`);
console.log(`ADMIN console: ${assertions.length} static invariants PASS; browser/a11y not implied.`);

execFileSync(process.execPath, ['scripts/check-admin-form-contracts.mjs'], { stdio: 'inherit' });
