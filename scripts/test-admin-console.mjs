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
const review = read('src/components/admin/governed-review-panel.tsx');
const pmo = read('src/components/admin/pmo-panel.tsx');
const decisionContract = read('src/lib/governance/decision-draft.ts');
const handoffs = JSON.parse(read('registers/commander/lanes.v1.json'));

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
  ['Commander displays candidate agent issue links from the canonical PMO', commander.includes("../../../registers/pmo/queue.v1.json") && commander.includes("../../../registers/commander/lanes.v1.json") && commander.includes('commander-handoff-inbox') && handoffs.governance.dispatchImplemented === false && handoffs.lanes.every(lane => lane.dispatched === false)],
  ['Commander validates real PMO and lanes before rendering', /validateCommanderReadModel\(queue, handoffs\)/.test(commander) && /if \(modelIssues\.length\)/.test(commander) && /Commander indisponível/.test(commander)],
  ['Commander displays dependency and evidence provenance from canonical PMO', /item\?\.dependencies\?\.length/.test(commander) && /item\?\.evidence\?\.length/.test(commander) && /lane\.sourceCommit\.slice/.test(commander) && /item\?\.next/.test(commander)],
  ['Commander derives unresolved dependencies solely from the canonical queue', /item\?\.dependencies\.filter\(id => queue\.items\.find/.test(commander) && /status !== 'DONE'/.test(commander) && /Prontidão por dependências:/.test(commander)],
  ['Commander derives admission and dispatch labels from canonical governance', /handoffs\.governance\.kernelAdmission/.test(commander) && /lane\.dispatched/.test(commander) && /handoffs\.governance\.dispatchImplemented/.test(commander)],
  ['Commander displays pre-Task governance from canonical contracts', /commander-upstream-chain/.test(commander) && /taskContract\.required\.filter/.test(commander) && /queue\.canonicalSource/.test(commander) && /Um registro de fila não equivale a WO admitida/.test(commander)],
  ['Commander can inspect real PMO activities without mutation', /selectedWorkOrderId/.test(commander) && /queue\.items\.map\(item => <option/.test(commander) && /commander-wo-readiness/.test(commander) && /BLOQUEADA ATÉ ADMISSÃO FORMAL/.test(commander)],
  ['Commander has no simulated remote agent calls', !/\b(fetch|axios)\s*\(/.test(commander) && /não despachado/.test(commander)],
  ['PMO displays governed review inside canonical administration', pmo.includes("import { GovernedReviewPanel }") && /<GovernedReviewPanel\s*\/>/.test(pmo) && /pmo-governed-review/.test(review)],
  ['review draft has explicit local edit and copy actions', review.includes('Editar minuta') && review.includes('Copiar minuta para revisão') && review.includes('setResult(null)')],
  ['recorded owner approval is visible without another approval request', /Plano de continuidade: aprovação já registrada/.test(review) && /APPROVAL_RECORD_URL/.test(review) && /Admissão Kernel pendente/.test(review)],
  ['decision options prepare drafts but never persist, sign or promote', ['REVIEW', 'REQUEST_CHANGES', 'APPROVE_WITH_RESERVATIONS', 'APPROVE'].every(k => decisionContract.includes(k)) && /NOT_SUBMITTED/.test(decisionContract) && /promotionAllowed: false/.test(decisionContract) && !review.includes('fetch(') && !review.includes('axios(') && !review.includes('localStorage') && !review.includes('setItem(')],
  ['Commander drafts remain in page memory and are not sent externally', /setDraft\(/.test(commander) && /não é enviado|não são acionados/i.test(commander) && !/\b(fetch|axios)\s*\(/.test(commander)],
];
let failed = 0;
for (const [name, pass] of assertions) { console.log(`${pass ? 'PASS' : 'FAIL'} ADMIN: ${name}`); if (!pass) failed++; }
assert.equal(failed, 0, `${failed} admin contracts failed`);
console.log(`ADMIN console: ${assertions.length} static invariants PASS; browser/a11y not implied.`);
