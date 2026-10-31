#!/usr/bin/env node
/** R86 static evidence integrity; a PASS is not checker review or Kernel admission. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const blobSha=b=>{const bytes=Buffer.from(b);return createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');};
const IDS=['R77-PMO-001','R77-PMO-002','R77-PMO-003','R77-PMO-004'];
export function verify({packet,assent,assentBytes}){
 assert.equal(packet?.recordId,'CE-R86-INDEPENDENT-REVIEW-READINESS-20261031','R86_ID_DRIFT');
 assert.equal(packet.recordType,'READ_ONLY_TECHNICAL_CHECKER_PREPARATION_NOT_INDEPENDENT_REVIEW','R86_FAKE_REVIEW');
 assert.equal(packet.repository,'IndiciumFIN/dev-chatgpt-workspace','R86_REPO_DRIFT');
 assert.equal(assent?.recordId,'CE-R85-PMO-CONVERSATION-OWNER-ASSENT-20261031','R86_WRONG_ASSENT');
 assert.equal(packet.source?.r85Path,'registers/governance/r85-pmo-conversation-owner-assent-20261031.v1.json','R86_SOURCE_DRIFT');
 assert.equal(packet.source?.r85GitBlobSha,blobSha(assentBytes),'R86_ASSENT_SOURCE_TAMPERED');
 assert.equal(packet.observation?.snapshotKind,'POINT_IN_TIME_READ_ONLY_NEEDS_LIVE_RECHECK','R86_FALSE_LIVE_CLAIM');
 assert.equal(packet.observation?.pullRequest,26,'R86_WRONG_PR');
 assert(/^[a-f0-9]{40}$/.test(packet.observation.headShaAtObservation??''),'R86_HEAD_UNGROUNDED');
 assert(/^[a-f0-9]{40}$/.test(packet.observation.baseShaAtObservation??''),'R86_BASE_UNGROUNDED');
 assert.equal(packet.observation?.open,true,'R86_PR_NOT_OPEN');
 assert.equal(packet.observation?.merged,false,'R86_FALSE_MERGE');
 assert.equal(packet.observation?.submittedReviewRecordsAtObservation,0,'R86_FALSE_REVIEW_COUNT');
 assert.equal(packet.observation?.reviewRequestsAtObservation,0,'R86_FALSE_REQUEST_COUNT');
 assert.equal(packet.observation?.mainProtectedAtObservation,false,'R86_FALSE_PROTECTED');
 assert(Number.isInteger(packet.observation?.changedFilesAtObservation),'R86_CHANGED_FILES_UNVERIFIED');
 assert(Number.isInteger(packet.observation?.commitsAtObservation),'R86_COMMITS_UNVERIFIED');
 const v=packet.technicalValidator;
 assert.equal(v?.path,'scripts/verify-r86-pr-review-evidence.mjs','R86_LIVE_VALIDATOR_MISSING');
 assert.equal(v?.tests,'scripts/verify-r86-pr-review-evidence.test.mjs','R86_TESTS_MISSING');
 assert.equal(v?.testCases,10,'R86_TEST_COUNT');
 assert.equal(v?.headDriftPolicy,'FAIL_CLOSED','R86_HEAD_DRIFT_ALLOWED');
 assert.equal(v?.reviewPopulationPolicy,'ALL_PAGES_OR_FAIL_CLOSED','R86_PARTIAL_REVIEW_ALLOWED');
 assert(v?.meaningOfPassingCheck?.includes('does not certify approval'),'R86_FALSE_APPROVAL');
 assert.deepEqual(packet.decisionReviews?.map(x=>x.id),IDS,'R86_DECISION_SET_DRIFT');
 assert.deepEqual(assent.choices?.map(x=>x.decisionId),IDS,'R86_ASSENT_SET_DRIFT');
 for(const row of packet.decisionReviews){
  assert.equal(row.checkerState,'NOT_REVIEWED','R86_FAKE_CHECKER:'+row.id);
  assert.equal(row.ownerIdentity,'NOT_AUTHENTICATED','R86_FAKE_OWNER:'+row.id);
  assert.equal(row.kernelDecision,'NOT_VERIFIED','R86_FAKE_KERNEL:'+row.id);
  assert.equal(row.release,false,'R86_FAKE_RELEASE:'+row.id);
  assert(row.machineEvidence?.length>=2&&row.independentCheckerMustValidate?.length>=3,'R86_INCOMPLETE_CHECKLIST:'+row.id);
 }
 const g=packet.governance;
 assert.equal(g?.conversationRecommendationsRecorded,4,'R86_ASSENT_DRIFT');
 assert.equal(g?.formalOwnerIdentityVerified,false,'R86_FALSE_OWNER_ID');
 assert.equal(g?.independentCorporateChecker,'NOT_PERFORMED','R86_FALSE_CORPORATE_CHECKER');
 assert.equal(g?.corporateCheckerAttestation,'NOT_PRESENT','R86_FALSE_CHECKER_SIGNATURE');
 assert.equal(g?.kernelSignedAdmission,'NOT_VERIFIED','R86_FALSE_KERNEL_SIGNATURE');
 assert.equal(g?.canonicalRevisionElected,false,'R86_FALSE_ELECTION');
 assert.equal(g?.additionalWosAdmitted,0,'R86_UNAUTHORIZED_WO_ADMISSION');
 assert.equal(g?.eventsReplayed,0,'R86_UNAUTHORIZED_REPLAY');
 for(const field of ['canExecute','canMerge','canDeploy','clinicalRelease'])assert.equal(g[field],false,'R86_UNAUTHORIZED_ACTION:'+field);
 assert.equal(g?.releaseGate,'HOLD_HUMAN','R86_RELEASE_BYPASS');
 assert(packet.next?.length>=5,'R86_MISSING_REVIEW_GATE_STEPS');
 return {evidenceIntegrity:'PASS',decisionsPendingChecker:4,corporateReview:'NOT_PERFORMED',kernel:'NOT_VERIFIED',releaseGate:'HOLD_HUMAN'};
}
export function load(root=resolve('.')){
 const p=root+'/registers/governance/r85-pmo-conversation-owner-assent-20261031.v1.json';
 const assentBytes=readFileSync(p);
 return {packet:JSON.parse(readFileSync(root+'/registers/governance/r86-independent-review-readiness-20261031.v1.json','utf8')),assent:JSON.parse(String(assentBytes)),assentBytes};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 console.log('[R86-review-readiness] EVIDENCE_VALIDATED '+JSON.stringify(verify(load())));
}
