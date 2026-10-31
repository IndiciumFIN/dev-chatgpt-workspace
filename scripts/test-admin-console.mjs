#!/usr/bin/env node
/** Contract checks for the single canonical administrative console (no network / no mocks). */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = path => readFileSync(path, 'utf8');
const ui = read('src/components/admin/admin-console.tsx');
const shared = read('src/components/local/local-workbench-page.tsx');
const store = read('src/lib/local-publication-register.ts');
const style = read('src/styles/admin-console.css');
const commander = read('src/components/admin/commander-panel.tsx');
const pmo = read('src/components/admin/pmo-panel.tsx');
const pmoReview = read('src/components/admin/pmo-review-intake.tsx');
const assertions = [
  ['admin and oficina reuse a single component', /export \{ AdminConsole as LocalWorkbenchPage \}/.test(shared)],
  ['canonical tool data not copied into admin', /import \{ tools \} from '@\/lib\/tools\/catalog'/.test(ui) && !/const tools\s*=\s*\[/.test(ui)],
  ['templates derive from canonical registry', /templateCatalogo/.test(ui) && /templateContracts/.test(ui)],
  ['all administrative tabs reachable', ['overview','pmo','commander','content','templates','sources','publication'].every(tab => ui.includes(`id: '${tab}'`))],
  ['draft and published shown distinctly', /setPreviewVersion\('published'\)/.test(ui) && /previewVersion === 'draft' \? model : published/.test(ui)],
  ['save and publish remain explicit independent actions', /saveLocalDraft\(model, revision\)/.test(ui) && /publishLocalDraft\(revision\)/.test(ui)],
  ['publish requires saved draft', /if \(dirty\) throw/.test(ui) && /disabled=\{dirty\}/.test(ui)],
  ['publication requires explicit acknowledgement', /if \(!confirmation\) throw/.test(ui) && /setConfirmation\(e.target.checked\)/.test(ui)],
  ['optimistic revision check still blocks conflicts', /current.revision !== expectedRevision/.test(store)],
  ['local browser storage is the only editor persistence', !/\b(fetch|axios|supabase|getSql|getPglite)\s*\(/.test(ui)],
  ['real end-user routes provided only for published local projection', /previewVersion === 'published' && <Link/.test(ui)],
  ['canonical design tokens reused', /var\(--color-navy\)/.test(style) && /var\(--color-line\)/.test(style) && !/--color-navy\s*:/.test(style)],
  ['browser and accessible feedback present', /role="status" aria-live="polite"/.test(ui) && /aria-invalid=/.test(ui)],
  ['R84 four-decision intake is reachable in canonical PMO panel', /<PmoReviewIntake\s*\/>/.test(pmo) && /r84-pmo-owner-decision-intake-20261031\.v1\.json/.test(pmoReview)],
  ['R84 review options and rationale are labeled accessibly', /htmlFor=\{item\.id \+ '-choice'\}/.test(pmoReview) && /htmlFor=\{item\.id \+ '-justification'\}/.test(pmoReview) && /role="status" aria-live="polite"/.test(pmoReview)],
  ['R84 proposals stay local and unsigned, never direct approval', /NON_BINDING_LOCAL_REVIEW_DRAFT/.test(pmoReview) && /kernelAdmission: 'NOT_VERIFIED'/.test(pmoReview) && /canonicalRevisionElected: false/.test(pmoReview) && !/\b(fetch|axios|supabase)\s*\(/.test(pmoReview)],
  ['Commander drafts remain in page memory and are not sent externally', /setDraft\(/.test(commander) && /não é enviado|não são acionados/i.test(commander) && !/\b(fetch|axios)\s*\(/.test(commander)],
];
let failed = 0;
for (const [name, pass] of assertions) { console.log(`${pass ? 'PASS' : 'FAIL'} ADMIN: ${name}`); if (!pass) failed++; }
assert.equal(failed, 0, `${failed} admin contracts failed`);
console.log(`ADMIN console: ${assertions.length} static invariants PASS; browser/a11y not implied.`);
