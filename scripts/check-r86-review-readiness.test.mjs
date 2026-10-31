import {test} from 'node:test';
import assert from 'node:assert/strict';
import {load,verify} from './check-r86-review-readiness.mjs';
const clone=()=>structuredClone(load());
test('R86: four checklists grounded, no corporate review or Kernel release',()=>{
 const v=verify(load());
 assert.equal(v.decisionsPendingChecker,4);
 assert.equal(v.corporateReview,'NOT_PERFORMED');
 assert.equal(v.releaseGate,'HOLD_HUMAN');
});
test('R86: alteration in source Git blob blocks review readiness',()=>{
 const d=clone();d.assentBytes=Buffer.from('fake');
 assert.throws(()=>verify(d),/R86_ASSENT_SOURCE_TAMPERED/);
});
test('R86: a historical observation is not live review evidence',()=>{
 const d=clone();d.packet.observation.snapshotKind='LIVE_VERIFIED';
 assert.throws(()=>verify(d),/R86_FALSE_LIVE_CLAIM/);
});
test('R86: no self-declared checker approval or forged signed Kernel',()=>{
 const d=clone();d.packet.decisionReviews[0].checkerState='APPROVED';
 assert.throws(()=>verify(d),/R86_FAKE_CHECKER/);
 const e=clone();e.packet.governance.kernelSignedAdmission='SIGNED';
 assert.throws(()=>verify(e),/R86_FALSE_KERNEL_SIGNATURE/);
});
test('R86: no fake merge, branch protection or reviewer count',()=>{
 const d=clone();d.packet.observation.merged=true;
 assert.throws(()=>verify(d),/R86_FALSE_MERGE/);
 const e=clone();e.packet.observation.mainProtectedAtObservation=true;
 assert.throws(()=>verify(e),/R86_FALSE_PROTECTED/);
 const f=clone();f.packet.observation.submittedReviewRecordsAtObservation=1;
 assert.throws(()=>verify(f),/R86_FALSE_REVIEW_COUNT/);
});
test('R86: all four decision reviews and required checks must exist',()=>{
 const d=clone();d.packet.decisionReviews.pop();
 assert.throws(()=>verify(d),/R86_DECISION_SET_DRIFT/);
 const e=clone();e.packet.decisionReviews[2].independentCheckerMustValidate=[];
 assert.throws(()=>verify(e),/R86_INCOMPLETE_CHECKLIST/);
});
test('R86: review readiness never confers merge, DB, clinical or task authority',()=>{
 const d=clone();d.packet.governance.canMerge=true;assert.throws(()=>verify(d),/R86_UNAUTHORIZED_ACTION/);
 const e=clone();e.packet.governance.clinicalRelease=true;assert.throws(()=>verify(e),/R86_UNAUTHORIZED_ACTION/);
 const f=clone();f.packet.governance.releaseGate='APPROVED';assert.throws(()=>verify(f),/R86_RELEASE_BYPASS/);
});
