import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assess} from './verify-r86-pr-review-evidence.mjs';
const HEAD='8d3d5b67786e92e77a5cb5d2161297980363931b', BASE='6c62bb61791631681979b229ccfbb05f7f5ac411';
function data(){
 return {
 expectedHead:HEAD,
 pr:{
  number:26,user:{login:'IndiciumFIN'},state:'open',merged:false,draft:false,
  head:{sha:HEAD,ref:'plan/pmokernel-finalization-20261031',repo:{full_name:'IndiciumFIN/dev-chatgpt-workspace',owner:{login:'IndiciumFIN'}}},
  base:{sha:BASE,ref:'main',repo:{full_name:'IndiciumFIN/dev-chatgpt-workspace'}},
  requested_reviewers:[],changed_files:81,commits:195
 },
 main:{name:'main',protected:false,commit:{sha:BASE}},
 reviews:[]
 };
}
const rv=(id,login,state='APPROVED',sha=HEAD)=>({id,user:{login},state,commit_id:sha,submitted_at:'2026-10-31T20:26:01Z'});
test('R86: zero PR reviews means no checker, signed admission or release',()=>{
 const x=assess(data());
 assert.equal(x.reviewState,'NO_PR_REVIEWS');
 assert.equal(x.independentCurrentHeadGithubApprovalCandidates,0);
 assert.equal(x.corporateCheckerIdentityVerified,false);
 assert.equal(x.kernelAdmissionVerified,false);
 assert.equal(x.releaseGate,'HOLD_HUMAN');
});
test('R86: owner self-review must never count as independent',()=>{
 const x=data();x.reviews=[rv(1,'IndiciumFIN')];
 assert.equal(assess(x).independentCurrentHeadGithubApprovalCandidates,0);
});
test('R86: external GitHub approval is only candidate evidence and never signed Kernel',()=>{
 const x=data();x.reviews=[rv(1,'external-checker')];
 const got=assess(x);
 assert.equal(got.independentCurrentHeadGithubApprovalCandidates,1);
 assert.equal(got.corporateCheckerIdentityVerified,false);
 assert.equal(got.corporateApprovalSigned,false);
 assert.equal(got.kernelAdmissionVerified,false);
 assert.equal(got.releaseGate,'HOLD_HUMAN');
});
test('R86: older commits cannot count as current HEAD-reviewed',()=>{
 const x=data();x.reviews=[rv(1,'independent','APPROVED',BASE)];
 assert.equal(assess(x).independentCurrentHeadGithubApprovalCandidates,0);
 assert.equal(assess(x).independentAnyHeadGithubApprovalCandidates,1);
});
test('R86: latest reviewer state revokes prior approval signal',()=>{
 const x=data();x.reviews=[rv(1,'independent'),{...rv(2,'independent','CHANGES_REQUESTED'),submitted_at:'2026-10-31T21:00:00Z'}];
 const got=assess(x);
 assert.equal(got.independentCurrentHeadGithubApprovalCandidates,0);
 assert.equal(got.changesRequested,1);
});
test('R86: duplicate review ID or invalid state fails closed',()=>{
 const x=data();x.reviews=[rv(1,'reviewer'),rv(1,'another')];
 assert.throws(()=>assess(x),/DUPLICATE_REVIEW_ID/);
 const y=data();y.reviews=[rv(1,'reviewer','SECRETLY_APPROVED')];
 assert.throws(()=>assess(y),/INVALID_REVIEW_STATE/);
});
test('R86: ungrounded and incomplete GitHub approval fails closed',()=>{
 const x=data();x.reviews=[rv(1,'reviewer','APPROVED','not-a-sha')];
 assert.throws(()=>assess(x),/REVIEW_COMMIT_NOT_GROUNDED/);
 const y=data();y.reviews=[{...rv(1,'reviewer'),submitted_at:null}];
 assert.throws(()=>assess(y),/REVIEW_TIMESTAMP_MISSING/);
});
test('R86: PR head drift and foreign repository fail closed',()=>{
 const x=data();x.expectedHead=BASE;
 assert.throws(()=>assess(x),/PR_HEAD_DRIFT_FAIL_CLOSED/);
 const y=data();y.pr.head.repo.full_name='foreign/repo';
 assert.throws(()=>assess(y),/WRONG_HEAD_REPOSITORY/);
});
test('R86: merge rejected; draft remains HOLD with zero candidate approvals',()=>{
 const x=data();x.pr.merged=true;assert.throws(()=>assess(x),/UNAUTHORIZED_MERGE/);
 const y=data();y.pr.draft=true;y.reviews=[rv(2,'independent')];
 const result=assess(y);
 assert.equal(result.reviewState,'DRAFT_HOLD');
 assert.equal(result.independentCurrentHeadGithubApprovalCandidates,0);
 assert.equal(result.mergingAuthorized,false);
 assert.equal(result.releaseGate,'HOLD_HUMAN');
});
test('R86: review completeness and branch protection evidence are required',()=>{
 const x=data();x.reviews='not-a-list';assert.throws(()=>assess(x),/REVIEWS_NOT_AN_ARRAY/);
 const y=data();delete y.main.protected;assert.throws(()=>assess(y),/BRANCH_PROTECTION_UNKNOWN/);
 const z=data();delete z.pr.changed_files;assert.throws(()=>assess(z),/CHANGED_FILES_MISSING/);
});
