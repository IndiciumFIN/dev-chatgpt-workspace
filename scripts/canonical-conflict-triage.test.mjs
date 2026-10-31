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
