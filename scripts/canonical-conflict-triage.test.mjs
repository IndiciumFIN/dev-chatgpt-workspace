import {test} from 'node:test';
import assert from 'node:assert/strict';
import {triageCanonicalConflict,buildCanonicalTriage} from './lib/canonical-conflict-triage.mjs';

const collision=path=>({path,sources:[{branch:'a',blob:'a'.repeat(40)},{branch:'b',blob:'b'.repeat(40)}]});
test('semantic duplicates are never authorization or owner selection',()=>{
 const r=triageCanonicalConflict('registers/i18n/incoming/de/contracts/interface__enter.json',{equivalent:true});
 assert.equal(r.preliminaryDisposition,'SEMANTIC_EQUIVALENT_NOT_ADMITTED');
 assert.equal(r.proposedWo,'WO-DS-001');
 assert.equal(r.decision,'NOT_APPROVED');
 assert.equal(r.releaseGate,'HOLD_HUMAN');
 assert.equal(r.candidateSource,null);
});
test('dependency, PMO and Kernel changes are P0 and mapped only as candidates',()=>{
 assert.equal(triageCanonicalConflict('package-lock.json').proposedWo,'WO-SEC-001');
 assert.equal(triageCanonicalConflict('src/core/governance/kernel.ts').proposedWo,'WO-GOV-TRANS-001');
 assert.equal(triageCanonicalConflict('registers/pmo/queue.v1.json').proposedWo,'WO-PMO-001');
 for(const path of ['package-lock.json','src/core/governance/kernel.ts','registers/pmo/queue.v1.json']){
  const r=triageCanonicalConflict(path);
  assert.equal(r.priority,'P0');
  assert.equal(r.releaseGate,'HOLD_HUMAN');
 }
});
test('header and login have tested, but non-authoritative, selected source candidates',()=>{
 for(const path of ['src/components/site/shell.tsx','src/routes/login.tsx']){
  const r=triageCanonicalConflict(path);
  assert.equal(r.candidateSource.sourceBranch,'fix/governed-activities-cli-20261026');
  assert.match(r.candidateSource.evidence,/actions\/runs\/41227928335/);
  assert.equal(r.decision,'NOT_APPROVED');
 }
});
test('unmapped paths fail open only in search, never in authorization',()=>{
 const r=triageCanonicalConflict('unknown/copy.bin');
 assert.equal(r.mappingStatus,'WO_MAPPING_REQUIRED');
 assert.equal(r.proposedWo,null);
 assert.equal(r.releaseGate,'HOLD_HUMAN');
});
test('full triage accounts for every collision, including semantic equivalence',()=>{
 const c=[collision('package.json'),collision('src/components/site/shell.tsx'),collision('registers/i18n/incoming/de/contracts/interface__enter.json')];
 c[1].sources[0].branch='fix/governed-activities-cli-20261026'; // real verified candidate must appear in lineage
 const r=buildCanonicalTriage(c,{equivalent:[{path:c[2].path}]});
 assert.deepEqual({total:r.counts.total,semantic:r.counts.semanticEquivalent,review:r.counts.needingReview},
  {total:3,semantic:1,review:2});
 assert.equal(r.counts.formallyApproved,0);
 assert.ok(r.items.every(x=>x.releaseGate==='HOLD_HUMAN'));
});
test('unknown, duplicate or missing semantic evidence cannot silently pass',()=>{
 const c=[collision('package.json')];
 assert.throws(()=>buildCanonicalTriage(c,{equivalent:[{path:'not-present'}]}),/UNKNOWN_SEMANTIC_PATH/);
 assert.throws(()=>buildCanonicalTriage([c[0],c[0]],{equivalent:[]}),/DUPLICATE_PATH/);
 assert.throws(()=>buildCanonicalTriage(c,null),/MISSING_EVIDENCE/);
});

test('all 28 initially unmapped paths have explicit candidate WO owners, never formal admission',()=>{
 const paths=[
 '.gitignore','it-book/docs/normalizacao.md',
 'registers/canonical/route-contracts.v1.json','registers/canonical/surface-contracts.v2.json',
 'scripts/admin-ux-e2e.mjs','scripts/alias-hook.mjs','scripts/brand-check.test.mjs',
 'scripts/check-auth-invariant.test.mjs','scripts/grok-pwa-plugin.test.mjs',
 'scripts/grok-pwa-shared.mjs','scripts/migration-plan.test.mjs',
 'scripts/test-admin-console.mjs','scripts/with-app-env.test.mjs',
 'scripts/write-atomic.test.mjs','src/core/compliance/validators.ts',
 'src/core/registry/source-registry.ts','src/lib/app-data/client.server.ts',
 'src/lib/chrome.tsx','src/lib/dictionary.test.ts','src/lib/intake.test.ts',
 'src/lib/intake.ts','src/lib/it-controls.test.ts',
 'src/lib/kernel-admit.test.ts','src/lib/kernel-admit.ts',
 'src/lib/policy-decision.ts','src/lib/source.functions.ts',
 'src/lib/stored.functions.ts','src/routeTree.gen.ts'
 ];
 assert.equal(paths.length,28);
 for(const path of paths){
  const candidate=triageCanonicalConflict(path);
  assert.match(candidate.proposedWo??'',/^WO-/,'owner missing: '+path);
  assert.equal(candidate.mappingStatus,'CANDIDATE_WO_MAPPING');
  assert.equal(candidate.decision,'NOT_APPROVED');
  assert.equal(candidate.releaseGate,'HOLD_HUMAN');
 }
});

test('source suggestions must exist in actual collision lineages, never be invented',()=>{
 const shell='src/components/site/shell.tsx';
 const c=[{path:shell,sources:[{branch:'other-branch',blob:'a'.repeat(40)},{branch:'older-branch',blob:'b'.repeat(40)}]}];
 assert.throws(()=>buildCanonicalTriage(c,{equivalent:[]}),/CANDIDATE_SOURCE_NOT_IN_CONFLICT/);
});
test('missing or non-Git blob source cannot become an approved conflict',()=>{
 const c=[{path:'package.json',sources:[{branch:'A',blob:'not-a-blob'},{branch:'B',blob:'b'.repeat(40)}]}];
 assert.throws(()=>buildCanonicalTriage(c,{equivalent:[]}),/INVALID_BLOB_LINEAGE/);
});

test('R77: header Entrar regression is an admin WO candidate, not admission',()=>{
 const r=triageCanonicalConflict('scripts/header-entry.test.mjs');
 assert.equal(r.proposedWo,'WO-ADM-001');
 assert.equal(r.priority,'P1');
 assert.equal(r.mappingStatus,'CANDIDATE_WO_MAPPING');
 assert.equal(r.decision,'NOT_APPROVED');
 assert.equal(r.kernelAdmission,'NOT_VERIFIED');
 assert.equal(r.releaseGate,'HOLD_HUMAN');
});


test('real Git deletion stays in lineage as D + null without authorizing removal',()=>{
 const x={
  path:'docs/PLAN-TASKS-PMOKERNEL-v0.1.0.json',
  sources:[
   {branch:'revert-26-plan/pmokernel-finalization-20261031',blob:null,status:'D'},
   {branch:'plan/pmokernel-finalization-20261031',blob:'a'.repeat(40),status:'M'}
  ]
 };
 const out=buildCanonicalTriage([x],{equivalent:[]});
 assert.equal(out.items.length,1);
 assert.deepEqual(out.items[0].sources,x.sources);
 assert.equal(out.items[0].decision,'NOT_APPROVED');
 assert.equal(out.items[0].kernelAdmission,'NOT_VERIFIED');
 assert.equal(out.items[0].releaseGate,'HOLD_HUMAN');
 assert.equal(out.counts.formallyApproved,0);
});

test('null blob is never accepted outside D, and D with fabricated hash fails closed',()=>{
 const base=collision('docs/PLAN-TASKS-PMOKERNEL-v0.1.0.json');
 const invalid=[
  {branch:'valid-branch',blob:null,status:'M'},
  {branch:'valid-branch',blob:'a'.repeat(40),status:'D'},
  {branch:'valid-branch',blob:undefined,status:'D'},
  {branch:'',blob:null,status:'D'},
  {branch:'valid-branch',blob:'invalid',status:'A'},
  {branch:42,blob:'a'.repeat(40),status:'A'}
 ];
 for(const source of invalid) {
  const c={...base,sources:[source,base.sources[1]]};
  assert.throws(()=>buildCanonicalTriage([c],{equivalent:[]}),/INVALID_BLOB_LINEAGE/);
 }
});

test('Wave 8: 22 observed unassigned paths get existing WO CANDIDATES, never authorization',()=>{
  const paths=[
  [
    "docs/evidence/ce-comparacao-2026-10-31/PLANO-EQUIPA-CE-COMPARACAO.yaml",
    "WO-PMO-001"
  ],
  [
    "docs/PLAN-PMOKERNEL-FINALIZATION-v0.1.0.md",
    "WO-PMO-001"
  ],
  [
    "docs/PLAN-TASKS-PMOKERNEL-v0.1.0.json",
    "WO-PMO-001"
  ],
  [
    "scripts/admin-mobile-first.test.mjs",
    "WO-DS-001"
  ],
  [
    "scripts/canonical-conflict-triage.test.mjs",
    "WO-PMO-001"
  ],
  [
    "scripts/cko-canonical-pilot.test.mjs",
    "WO-CKO-001"
  ],
  [
    "scripts/cko-db-first-evidence.test.mjs",
    "WO-CKO-001"
  ],
  [
    "scripts/cko-db-first-replay.test.mjs",
    "WO-CKO-001"
  ],
  [
    "scripts/cko-governance-pilot.test.mjs",
    "WO-GOV-TRANS-001"
  ],
  [
    "scripts/governance-continuity.test.mjs",
    "WO-GOV-TRANS-001"
  ],
  [
    "scripts/lib/canonical-conflict-triage.mjs",
    "WO-PMO-001"
  ],
  [
    "scripts/test-commander-read-model.mjs",
    "WO-ADM-001"
  ],
  [
    "scripts/test-curiosidades-source-alternatives.mjs",
    "WO-CKO-001"
  ],
  [
    "scripts/test-locale-registry.mjs",
    "WO-DS-001"
  ],
  [
    "src/components/article/curiosity-page.tsx",
    "WO-CKO-001"
  ],
  [
    "src/components/career/career-hub.tsx",
    "WO-ADM-001"
  ],
  [
    "src/components/templates/curiosity-view.tsx",
    "WO-CKO-001"
  ],
  [
    "src/components/vila/vila-source-home.tsx",
    "WO-ADM-001"
  ],
  [
    "src/lib/commander/read-model.ts",
    "WO-ADM-001"
  ],
  [
    "src/lib/contract-index.generated.ts",
    "WO-CKO-001"
  ],
  [
    "src/lib/header-i18n.ts",
    "WO-DS-001"
  ],
  [
    "src/lib/locale-registry.ts",
    "WO-DS-001"
  ]
];
  assert.equal(paths.length,22);
  for(const [path,expectedWo] of paths) {
    const r=triageCanonicalConflict(path);
    assert.equal(r.proposedWo,expectedWo,'missing candidate for '+path);
    assert.equal(r.mappingStatus,'CANDIDATE_WO_MAPPING');
    assert.equal(r.decision,'NOT_APPROVED');
    assert.equal(r.kernelAdmission,'NOT_VERIFIED');
    assert.equal(r.releaseGate,'HOLD_HUMAN');
  }
  assert.equal(triageCanonicalConflict('unseen/2026-11-01/unknown.dat').mappingStatus,'WO_MAPPING_REQUIRED');
});
