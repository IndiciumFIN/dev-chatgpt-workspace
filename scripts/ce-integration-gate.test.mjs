import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {requiredChecks,requiredAcrossBaselines,baselineWorkflowSources,pullRequestPathGlobs,matchesGlob,assessChecks,CHECK_POLICIES} from './ce-integration-gate.mjs';
const paths=Object.fromEntries([...new Set(CHECK_POLICIES.map(x=>x[1]))].map(p=>[p,existsSync(p)?readFileSync(p,'utf8'):null]));
const reconciliationWorkflow='on:\n  pull_request:\n    paths:\n      - "scripts/ce-global-scorecard.mjs"\n';
const sha='a'.repeat(40),one=(name,conclusion='success',id=1,app=15368)=>({id,name,status:'completed',conclusion,head_sha:sha,app:{id:app}});
test('all conditional workflows derive triggers from their real YAML, no duplicated path ledger',()=>{
 for(const [,file] of CHECK_POLICIES){if(paths[file]===null)continue;const globs=pullRequestPathGlobs(paths[file]);assert.ok(globs.length>0);}
 assert.equal(matchesGlob('src/routes/blog.$slug.tsx','src/routes/blog.*.tsx'),true);
 assert.equal(matchesGlob('src/a/b.ts','src/**'),true);
 assert.equal(matchesGlob('docs/notes.md','src/**'),false);
});
test('normal PR always requires verify and never requires conditional checks for docs-only',()=>{
 assert.deepEqual(requiredChecks(['docs/notes.md'],paths),['verify']);
 assert.ok(requiredChecks(['src/routes/blog.$slug.tsx'],paths).includes('validate-curiosities'));
 assert.ok(requiredChecks(['src/routes/blog.$slug.tsx'],paths).includes('visual'));
 assert.ok(requiredChecks(['src/lib/content/curiosidades/pages/a.json'],paths).includes('mem-contracts'));
 const mock={...paths,['.github/workflows/ce-live-branch-reconciliation.yml']:reconciliationWorkflow};
 assert.ok(requiredChecks(['scripts/ce-global-scorecard.mjs'],mock).includes('git-reconcile'));
 assert.ok(requiredChecks(['scripts/ce-global-scorecard.mjs'],mock).includes('browser-p0-local-negative'));
 assert.ok(requiredChecks(['package.json'],paths).includes('verify-candidate-regressions'));
});
test('untriggered checks are not fabricated; observed failing checks still block',()=>{
 const v=assessChecks({required:['verify'],checkRuns:[one('verify')],headSha:sha});
 assert.equal(v.verdict,'PASS');assert.equal(v.clinical_approved,false);assert.equal(v.merge_authorized,false);
 const observed=assessChecks({required:['verify'],checkRuns:[one('verify'),one('visual','failure',2)],headSha:sha});
 assert.equal(observed.verdict,'FAIL');
});
test('missing/unfinished/skipped critical checks always fail closed',()=>{
 assert.equal(assessChecks({required:['verify','visual'],checkRuns:[one('verify')],headSha:sha}).verdict,'PENDING');
 assert.equal(assessChecks({required:['verify'],checkRuns:[one('verify','skipped')],headSha:sha}).verdict,'FAIL');
 assert.equal(assessChecks({required:['verify'],checkRuns:[{...one('verify'),status:'in_progress',conclusion:null}],headSha:sha}).verdict,'PENDING');
});
test('reject forged integration, stale SHA, and duplicate old PASS before newer FAIL',()=>{
 const wrong=assessChecks({required:['verify'],checkRuns:[one('verify','success',1,99999)],headSha:sha});
 assert.equal(wrong.verdict,'PENDING');
 const stale=assessChecks({required:['verify'],checkRuns:[{...one('verify'),head_sha:'b'.repeat(40)}],headSha:sha});
 assert.equal(stale.verdict,'PENDING');
 const latest=assessChecks({required:['verify'],checkRuns:[one('verify','success',1),one('verify','failure',2)],headSha:sha});
 assert.equal(latest.verdict,'FAIL');
});
test('unknown SHA or missing verified diff is not accepted',()=>{
 assert.throws(()=>assessChecks({required:['verify'],checkRuns:[],headSha:'bad'}),/UNVERIFIED_HEAD_SHA/);
 assert.throws(()=>requiredChecks([],paths),/NO_VERIFIED_CHANGE_PATHS/);
});

test('proposed YAML cannot remove an existing mandatory workflow path trigger',()=>{
 const file='.github/workflows/curiosidades-mem-validation.yml';
 const candidate={...paths,[file]:paths[file].replace("      - 'src/lib/route-registry.ts'",'')};
 const retained=requiredAcrossBaselines(['src/lib/route-registry.ts'],candidate,paths);
 assert.ok(retained.includes('validate-curiosities'));
});

test('new workflow absent from historical main still retains candidate checks',()=>{
 const candidate={'new-workflow.yml':'on:\n  pull_request:\n    paths:\n      - "src/**"\n'};
 const out=baselineWorkflowSources(candidate,()=>null);
 assert.equal(out['new-workflow.yml'],candidate['new-workflow.yml']);
});
test('existing historical workflow is not replaced by looser candidate path triggers',()=>{
 const out=baselineWorkflowSources({'w.yml':'candidate'},()=> 'historical');
 assert.equal(out['w.yml'],'historical');
 assert.throws(()=>baselineWorkflowSources({'w.yml':'candidate'},()=>undefined),/UNTRUSTED_BASE_WORKFLOW/);
});

test('missing optional workflow is not required in isolated gate-only PR',()=>{
 const file='.github/workflows/ce-live-branch-reconciliation.yml';
 const absent={...paths,[file]:null};
 const required=requiredChecks(['scripts/ce-global-scorecard.mjs'],absent);
 assert.equal(required.includes('git-reconcile'),false);
 assert.equal(required.includes('browser-p0-local-negative'),false);
 assert.ok(required.includes('verify'));
});
test('workflow added in candidate or inherited from base remains required when relevant',()=>{
 const file='.github/workflows/ce-live-branch-reconciliation.yml';
 const candidate={...paths,[file]:reconciliationWorkflow};
 const historical={...paths,[file]:null};
 const required=requiredAcrossBaselines(['scripts/ce-global-scorecard.mjs'],candidate,historical);
 assert.ok(required.includes('git-reconcile'));
 const existingBase=requiredAcrossBaselines(['scripts/ce-global-scorecard.mjs'],historical,candidate);
 assert.ok(existingBase.includes('browser-p0-local-negative'));
});
test('invalid workflow representation fails closed',()=>{
 const file='.github/workflows/ce-live-branch-reconciliation.yml';
 assert.throws(()=>baselineWorkflowSources({[file]:undefined},()=>null),/UNTRUSTED_CANDIDATE_WORKFLOW/);
});
