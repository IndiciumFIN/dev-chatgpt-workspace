import test from 'node:test';
import assert from 'node:assert/strict';
import {buildCeTechnicalEvidence,CONTROLS,summaryMarkdown} from './ce-ci-evidence.mjs';
const sha='a'.repeat(40),passed=()=>Object.fromEntries(CONTROLS.map(([id])=>[id,'success']));
test('all seven passing checks do not authorize merge or clinical publishing',()=>{
 const v=buildCeTechnicalEvidence({sha,outcomes:passed()});
 assert.equal(v.counts.passed,7);assert.equal(v.technical_pass_percent,100);
 assert.equal(v.verdict,'TECHNICAL_PASS');assert.equal(v.platform_implementation_completion_percent,null);
 for(const k of ['clinical_approval','real_oauth_verified','remote_database_verified','merge_authorized','release_authorized'])assert.equal(v[k],false);
 assert.match(summaryMarkdown(v),/Not the percentage of platform completion/);
});
test('security scan failure blocks technical success',()=>{
 const v=buildCeTechnicalEvidence({sha,outcomes:{...passed(),clinical_bundle:'failure'}});
 assert.equal(v.verdict,'TECHNICAL_FAIL');assert.equal(v.counts.failed,1);
});
test('skipped and unexecuted work never count as PASS',()=>{
 const s=passed();s.build='skipped';delete s.editorial_bundle;
 const v=buildCeTechnicalEvidence({sha,outcomes:s});
 assert.equal(v.verdict,'INCOMPLETE');assert.equal(v.counts.pending,2);
});
test('invalid SHA or unknown outcome fails closed',()=>{
 assert.throws(()=>buildCeTechnicalEvidence({sha:'bad',outcomes:passed()}),/MISSING_IMMUTABLE_SHA/);
 assert.throws(()=>buildCeTechnicalEvidence({sha,outcomes:{...passed(),build:'PASS-ish'}}),/UNKNOWN_CI_STEP_OUTCOME/);
});
