import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = path => readFileSync(path, 'utf8');
const store = read('src/lib/local-publication-register.ts');
const ui = read('src/components/admin/admin-console.tsx');
const canonical = read('src/lib/local-canonical.ts');
const checks = [
  ['draft and published are independent slots', /draft: LocalWorkbench; published: LocalWorkbench/.test(store)],
  ['legacy cannot automatically promote', /legacy === null \? initialWorkbench\(\) : validateWorkbench/.test(store) && /published: initialWorkbench\(\)/.test(store)],
  ['save does not write published', /published: action === 'PUBLISHED'/.test(store)],
  ['publishing is explicit action', /publishLocalDraft\(revision\)/.test(ui)],
  ['unsaved edits block publishing', /disabled=\{dirty\}/.test(ui)],
  ['public projection reads published slot', /readLocalPublished\(\)\.tools/.test(canonical)],
  ['events have revision linkage', /previousRevision: current.revision/.test(store)],
  ['change signal emitted', /dispatchEvent\(new Event\('cde-publication-updated'\)\)/.test(store)],
  ['remote db not referenced by register', !/(?:getSql|getPglite|fetch\()/.test(store)],
];
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) process.exitCode = 1; }
