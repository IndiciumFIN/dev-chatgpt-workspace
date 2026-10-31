#!/usr/bin/env node
/**
 * R86 live GitHub PR review evidence, read-only. An approved GitHub review is
 * NEVER a corporate Checker attestation or signed Kernel admission.
 * HTTP failures, truncated review collections and HEAD drift fail closed.
 */
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const REPO='IndiciumFIN/dev-chatgpt-workspace';
const PR_NUMBER=26;
const HEAD_SHA=/^[0-9a-f]{40}$/;
function owner(v){return String(v??'').trim().toLowerCase();}
export function assess({pr,reviews,main,expectedHead}){
 assert.equal(pr?.number,PR_NUMBER,'WRONG_PULL_REQUEST');
 assert.equal(pr?.base?.repo?.full_name,REPO,'WRONG_BASE_REPOSITORY');
 assert.equal(pr?.head?.repo?.full_name,REPO,'WRONG_HEAD_REPOSITORY');
 assert.equal(pr?.base?.ref,'main','WRONG_BASE_BRANCH');
 assert.equal(pr?.head?.ref,'plan/pmokernel-finalization-20261031','WRONG_CANDIDATE_BRANCH');
 assert.equal(pr?.state,'open','PR_NO_LONGER_OPEN_RECHECK_AUTHORITY');
 assert.equal(pr?.merged,false,'UNAUTHORIZED_MERGE');
 assert.equal(typeof pr?.draft,'boolean','PR_DRAFT_STATUS_UNKNOWN');
 assert(HEAD_SHA.test(pr?.head?.sha??''),'HEAD_SHA_INVALID');
 assert(HEAD_SHA.test(expectedHead??''),'EXPECTED_SHA_INVALID');
 assert.equal(pr.head.sha,expectedHead,'PR_HEAD_DRIFT_FAIL_CLOSED');
 assert.equal(pr.base.sha,main?.commit?.sha,'PR_BASE_MAIN_DRIFT');
 assert.equal(main?.name,'main','WRONG_MAIN_BRANCH');
 const author=owner(pr?.user?.login);
 assert(author,'PR_AUTHOR_MISSING');
 assert.equal(owner(pr?.head?.repo?.owner?.login),'indiciumfin','HEAD_OWNER_DRIFT');
 assert(Array.isArray(reviews),'REVIEWS_NOT_AN_ARRAY');
 assert(reviews.length<2000,'REVIEW_POPULATION_UNBOUNDED');
 const ids=new Set(),latest=new Map();
 for(const r of reviews){
  assert(Number.isSafeInteger(r?.id) && r.id>0,'INVALID_REVIEW_ID');
  assert(!ids.has(r.id),'DUPLICATE_REVIEW_ID');ids.add(r.id);
  const login=owner(r?.user?.login);
  assert(login,'REVIEWER_IDENTITY_MISSING');
  assert(['APPROVED','COMMENTED','CHANGES_REQUESTED','DISMISSED','PENDING'].includes(r.state),'INVALID_REVIEW_STATE');
  assert(HEAD_SHA.test(r.commit_id??''),'REVIEW_COMMIT_NOT_GROUNDED');
  if(r.state!=='PENDING'){
    assert(typeof r.submitted_at==='string'&&!Number.isNaN(Date.parse(r.submitted_at)),'REVIEW_TIMESTAMP_MISSING');
    const prior=latest.get(login);
    if(!prior || Date.parse(r.submitted_at)>Date.parse(prior.submitted_at) ||
      (Date.parse(r.submitted_at)===Date.parse(prior.submitted_at)&&r.id>prior.id))latest.set(login,r);
  }
 }
 const submitted=[...latest.values()];
 const independentCurrentHead=submitted.filter(r=>owner(r.user.login)!==author && r.commit_id===expectedHead && r.state==='APPROVED');
 const independentAnyHead=submitted.filter(r=>owner(r.user.login)!==author && r.state==='APPROVED');
 const changesRequested=submitted.filter(r=>r.state==='CHANGES_REQUESTED');
 const requested=(pr.requested_reviewers??[]);
 assert(Array.isArray(requested),'INVALID_REVIEWER_REQUESTS');
 assert(requested.every(x=>owner(x.login)),'REQUESTED_REVIEWER_INVALID');
 assert(Number.isInteger(pr.changed_files)&&pr.changed_files>=0,'CHANGED_FILES_MISSING');
 assert(Number.isInteger(pr.commits)&&pr.commits>=1,'COMMIT_COUNT_MISSING');
 assert(typeof main.protected==='boolean','BRANCH_PROTECTION_UNKNOWN');
 // An independent GitHub login is NOT evidence of authorized corporate reviewer,
 // identity signature, or Kernel admission. No output can auto-enable release.
 return {
  source:'GITHUB_LIVE_READ_ONLY',repository:REPO,pullRequest:26,headSha:expectedHead,baseSha:main.commit.sha,
  reviewState:pr.draft?'DRAFT_HOLD':reviews.length===0?'NO_PR_REVIEWS':'PR_REVIEWS_REQUIRE_AUTHORIZED_HUMAN_INSPECTION',
  draft:pr.draft,
  observedReviewRecords:reviews.length,reviewerRequests:requested.length,
  independentCurrentHeadGithubApprovalCandidates:pr.draft?0:independentCurrentHead.length,
  independentAnyHeadGithubApprovalCandidates:independentAnyHead.length,
  changesRequested:changesRequested.length,
  changedFiles:pr.changed_files,commits:pr.commits,mainProtected:main.protected,
  corporateCheckerIdentityVerified:false,corporateApprovalSigned:false,kernelAdmissionVerified:false,
  canonicalQueueElected:false,mergingAuthorized:false,releaseGate:'HOLD_HUMAN'
 };
}
async function getPage(url,token){
 assert(url.startsWith('https://api.github.com/repos/'+REPO+'/'),'FOREIGN_API_REQUEST');
 const response=await fetch(url,{headers:{Authorization:'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28',Accept:'application/vnd.github+json'},redirect:'error',signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('GITHUB_READ_FAILED:'+response.status);
 return {data:await response.json(),link:response.headers.get('link')??''};
}
export async function loadLive({token,expectedHead}){
 assert(typeof token==='string'&&token.trim().length>10,'GITHUB_READ_TOKEN_REQUIRED');
 assert(HEAD_SHA.test(expectedHead??''),'EXPECTED_SHA_INVALID');
 const url='https://api.github.com/repos/'+REPO;
 const [prRes,mainRes]=await Promise.all([getPage(url+'/pulls/'+PR_NUMBER,token),getPage(url+'/branches/main',token)]);
 let reviews=[],next=url+'/pulls/'+PR_NUMBER+'/reviews?per_page=100';
 for(let page=0;next && page<20;page++){
   const result=await getPage(next,token);
   assert(Array.isArray(result.data),'GITHUB_REVIEWS_INVALID');
   reviews.push(...result.data);
   const candidate=result.link.split(',').map(x=>x.trim()).find(x=>/rel="next"/.test(x));
   if(candidate){
     const match=candidate.match(/^<([^>]+)>;/);
     assert(match&&match[1].startsWith(url+'/pulls/'+PR_NUMBER+'/reviews?'),'UNTRUSTED_REVIEW_PAGINATION');
     next=match[1];
   }else next=null;
 }
 assert(next===null,'REVIEW_PAGINATION_INCOMPLETE');
 return assess({pr:prRes.data,reviews,main:mainRes.data,expectedHead});
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const result=await loadLive({token:process.env.GITHUB_TOKEN,expectedHead:process.env.R86_EXPECTED_HEAD_SHA});
  console.log('[R86-live-review] EVIDENCE_VALIDATED '+JSON.stringify(result));
  if(process.env.GITHUB_STEP_SUMMARY){
    const {appendFileSync}=await import('node:fs');
    appendFileSync(process.env.GITHUB_STEP_SUMMARY,
      '\n### R86: GitHub review evidence (not release)\n\n'+
      '- HEAD: \`'+result.headSha+'\`\n'+
      '- PR reviews: '+result.observedReviewRecords+'; requested: '+result.reviewerRequests+
      '; independent current-head GitHub review candidates: '+result.independentCurrentHeadGithubApprovalCandidates+'\n'+
      '- Changed files: '+result.changedFiles+'; commits: '+result.commits+
      '; main protected: '+result.mainProtected+'\n'+
      '- Corporate Checker: **NOT_VERIFIED**; Kernel admission: **NOT_VERIFIED**; release: **HOLD_HUMAN**\n');
  }
 }catch(e){console.error('[R86-live-review] FAIL_CLOSED '+String(e?.message??e));process.exitCode=1;}
}
