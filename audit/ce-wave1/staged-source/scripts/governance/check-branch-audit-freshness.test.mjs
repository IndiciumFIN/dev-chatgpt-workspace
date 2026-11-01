import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateFreshness} from './check-branch-audit-freshness.mjs';
const sha='a'.repeat(40), base='b'.repeat(40);
const branch='integration/structural-overlay-20261101';
const src={candidate:{branch,commit:sha},baseline:{commit:base}};
const triage={candidate:{branch,commit:sha},baseline:{commit:base},
  counts:{total:1,formallyApproved:0},releaseGate:'HOLD_HUMAN',
  items:[{decision:'NOT_APPROVED',kernelAdmission:'NOT_VERIFIED'}]};
const good={src,triage,actualHead:sha,sourceBranch:branch,targetSha:sha,
  sourceRepo:'IndiciumFIN/dev-chatgpt-workspace',
  expectedRepo:'IndiciumFIN/dev-chatgpt-workspace',mainHead:base,
  sourceRefHead:sha};
test('detached PR head with explicit trusted context is valid HOLD (not approval)',()=>{
 assert.deepEqual(validateFreshness(good),{verdict:'CURRENT_HOLD_AUDIT',head:sha,
   conflicts:1,authorization:'NOT_GRANTED'});
});
for(const [name,override] of [
 ['source drift',{sourceRefHead:'c'.repeat(40)}],
 ['checkout merge sha',{actualHead:'c'.repeat(40)}],
 ['stale candidate',{src:{...src,candidate:{branch,commit:'c'.repeat(40)}}}],
 ['baseline drift',{mainHead:'c'.repeat(40)}],
 ['spoofed source repo',{sourceRepo:'untrusted/fork'}],
 ['changed source branch',{sourceBranch:'main'}],
 ['false approval',{triage:{...triage,counts:{total:1,formallyApproved:1}}}],
 ['incomplete triage',{triage:{...triage,items:[]}}],
 ['fake kernel',{triage:{...triage,items:[{decision:'NOT_APPROVED',kernelAdmission:'ADMITTED'}]}}],
 ]) test('fail-closed: '+name,()=>assert.throws(()=>validateFreshness({...good,...override})));
