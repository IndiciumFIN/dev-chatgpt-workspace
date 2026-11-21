import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {requiredChecks,requiredAcrossBaselines,pullRequestPathGlobs,matchesGlob,assessChecks,CHECK_POLICIES} from './ce-integration-gate.mjs';
const paths=Object.fromEntries([...new Set(CHECK_POLICIES.map(x=>x[1]))].map(p=>[p,readFileSync(p,'utf8')]));
const sha='a'.repeat(40),one=(name,conclusion='success',id=1,app=15368)=>({id,name,status:'completed',conclusion,head_sha:sha,app:{id:app}});
test('all conditional workflows derive triggers from their real YAML, no duplicated path ledger',()=>{
 for(const [,file] of CHECK_POLICIES){const globs=pullRequestPathGlobs(paths[file]);assert.ok(globs.length>0);}
 assert.equal(matchesGlob('src/routes/blog.$slug.tsx','src/routes/blog.*.tsx'),true);
 assert.equal(matchesGlob('src/a/b.ts','src/**'),true);
 assert.equal(matchesGlob('docs/notes.md','src/**'),false);
});
test('normal PR always requires verify and never requires conditional checks for docs-only',()=>{
 assert.deepEqual(requiredChecks(['docs/notes.md'],paths),['verify']);
 assert.ok(requiredChecks(['src/routes/blog.$slug.tsx'],paths).includes('validate-curiosities'));
 assert.ok(requiredChecks(['src/routes/blog.$slug.tsx'],paths).includes('visual'));
 assert.ok(requiredChecks(['src/lib/content/curiosidades/pages/a.json'],paths).includes('mem-contracts'));
 assert.ok(requiredChecks(['scripts/ce-global-scorecard.mjs'],paths).includes('git-reconcile'));
 assert.ok(requiredChecks(['scripts/ce-global-scorecard.mjs'],paths).includes('browser-p0-local-negative'));
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
