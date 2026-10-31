#!/usr/bin/env node
/** R85 integrity gate: a chat instruction is evidence of assent, NEVER a signature.
 * The authoritative R84 unsigned intake and five original queue sources are unchanged.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
export const gitBlobSha=(b)=>{const bytes=Buffer.from(b);return createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');};
export const expectedCodes=Object.freeze([
 'KEEP_REV18_PENDING_KERNEL','KEEP_LOCAL_COMMANDER_SCOPED','KEEP_CKO_QUEUED','HOLD_EXTRA_WOS'
]);
const PINNED={
 intake:'registers/governance/r84-pmo-owner-decision-intake-20261031.v1.json',
 arbitration:'registers/governance/r83-pmo-fork-review-packet-20261031.v1.json',
 priorApproval:'registers/governance/approval-pmokernel-audit-20261031.v1.json',
 currentQueue:'registers/pmo/queue.v1.json'
};
export function validate({assent,intake,arbitration,priorApproval,currentQueue,pinnedBytes}){
 assert.equal(assent?.recordId,'CE-R85-PMO-CONVERSATION-OWNER-ASSENT-20261031','ASSENT_ID_DRIFT');
 assert.equal(assent.recordType,'USER_CONVERSATION_ASSENT_RECORDED_NOT_VERIFIED_SIGNED_OWNER_DECISION','FALSE_SIGNATURE_TYPE');
 assert.equal(assent.repository,'IndiciumFIN/dev-chatgpt-workspace','ASSENT_REPO_DRIFT');
 assert.equal(assent.timePrecision,'DATE_ONLY','INVENTED_MESSAGE_TIMESTAMP');
 assert.equal(assent.branch,'plan/pmokernel-finalization-20261031','ASSENT_SCOPE_DRIFT');
 const origin=assent.decisionSource;
 assert.equal(origin?.source,'User response in current ChatGPT conversation immediately after R84 summary','ASSENT_SOURCE_DRIFT');
 assert.equal(origin?.verbatim,'aprovado','ASSENT_QUOTE_DRIFT');
 assert.equal(origin?.sourceMessageId,null,'INVENTED_MESSAGE_ID');
 assert.equal(origin?.interpretationScope,'RECOMMENDATIONS_AND_CONTINUED_CANDIDATE_IMPLEMENTATION_ONLY','UNAUTHORIZED_SCOPE');
 assert.equal(origin?.identityVerification,'NOT_PERFORMED','FALSE_IDENTITY');
 assert.equal(origin?.independentAttestation,'NOT_VERIFIED','FALSE_CHECKER');
 assert.equal(origin?.cryptographicSignature,'NOT_PRESENT','FALSE_SIGNATURE');
 assert.equal(origin?.replayProtection,'NOT_PROVIDED','FALSE_REPLAY_PROTECTION');
 for(const [key,path] of Object.entries(PINNED)){
   const p=assent.sourcePins?.[key];
   assert.equal(p?.path,path,'SOURCE_PATH_DRIFT:'+key);
   assert(pinnedBytes?.[key] && Buffer.isBuffer(pinnedBytes[key]),'SOURCE_BYTES_REQUIRED:'+key);
   assert.equal(p.sha,gitBlobSha(pinnedBytes[key]),'SOURCE_BLOB_DRIFT:'+key);
 }
 assert.equal(intake?.recordId,'CE-R84-PMO-OWNER-DECISION-INTAKE-20261031','INTAKE_WRONG');
 assert.equal(intake?.recordType,'UNSIGNED_REVIEW_INTAKE_NO_AUTHORITY','INTAKE_AUTHORITY_FORGED');
 assert.equal(arbitration?.recordId,'CE-R83-PMO-FORK-REVIEW-PACKET-20261031','ARBITRATION_WRONG');
 assert.equal(arbitration.election?.chosenCanonicalRevision,null,'UNAUTHORIZED_ELECTION');
 assert.equal(priorApproval?.decision,'APPROVED_FOR_PERSISTENCE_AND_CONTINUED_VERIFICATION','OLD_APPROVAL_SCOPE_DRIFT');
 assert.equal(priorApproval.approvalProvenance?.identityVerification,'NOT_PERFORMED','OLD_APPROVAL_FALSE_AUTH');
 assert.equal(currentQueue?.revision,18,'QUEUE_REVISION_DRIFT');
 assert.equal(currentQueue?.items?.length,10,'QUEUE_WO_DRIFT');
 assert.equal(currentQueue?.events?.length,20,'QUEUE_EVENTS_DRIFT');
 assert.equal(assent.choices?.length,4,'DECISION_COUNT_DRIFT');
 assert.equal(intake.decisions?.length,4,'INTAKE_DECISION_COUNT_DRIFT');
 const seen=new Set();
 for(let i=0;i<4;i++){
  const source=intake.decisions[i],a=assent.choices[i],code=expectedCodes[i];
  assert.equal(source?.recommendedCode,code,'R84_RECOMMENDATION_CHANGED');
  assert.equal(source?.reviewState,'PENDING_OWNER_SPECIFIC_DECISION','R84_UNVERIFIED_ADMISSION');
  assert.equal(source?.selection,null,'R84_MUTATED_SELECTION');
  assert.equal(a?.decisionId,source.id,'DECISION_ID_DRIFT');
  assert(!seen.has(a.decisionId),'DUPLICATE_DECISION');
  seen.add(a.decisionId);
  assert.equal(a.selectedCode,code,'UNSUPPORTED_OWNER_CHOICE:'+a.decisionId);
  assert.equal(a.selectedLabel,source.options.find(o=>o.code===code)?.label,'LABEL_DRIFT');
  assert.equal(a.sourceObservation,source.sourceObservation,'SOURCE_OBSERVATION_DRIFT');
  assert.equal(a.status,'DECLARED_BY_CONVERSATION_PENDING_VERIFICATION','FALSE_FORMAL_DECISION');
  assert.equal(a.makerIdentityVerified,false,'FAKE_MAKER_AUTH');
  assert.equal(a.checkerDecision,'NOT_PERFORMED','FAKE_CHECKER');
  assert.equal(a.kernelAdmission,'NOT_VERIFIED','FAKE_KERNEL');
  assert.equal(a.approverSignature,null,'FAKE_SIGNATURE');
  assert.equal(a.authorityToApply,false,'UNAUTHORIZED_EFFECT');
 }
 const o=assent.outcome;
 assert.equal(o?.ownerRecommendationsRecorded,4,'ASSENT_COUNT_DRIFT');
 for(const k of ['ownerAuthenticatedDecisions','independentCheckerApprovals','kernelAdmissionsVerified','eventsReplayed'])assert.equal(o[k],0,'FALSE_COMPLETION:'+k);
 for(const k of ['canonicalRevisionElected','sourceQueueMutated','mainChanged','mergesAuthorized','deploysAuthorized','clinicalReleaseAuthorized'])assert.equal(o[k],false,'UNAUTHORIZED_ACTION:'+k);
 assert.deepEqual(o.provisionalReference,{branch:'main',revision:18,status:'REFERENCE_ONLY_NOT_ELECTED'},'ELECTION_DISGUISED');
 assert.deepEqual(o.commander,{wo:'WO-ADM-001',scope:'LOCAL_ONLY_NO_NETWORK_OR_DB_CHANGE',newPermission:false},'COMMANDER_SCOPE_BYPASS');
 assert.deepEqual(o.cko,{wo:'WO-CKO-001',statusBaseline:'QUEUED',pilotEvidence:'ISOLATED_READ_ONLY_NOT_CLINICAL_ADMISSION'},'CKO_CLINICAL_APPROVAL');
 assert.deepEqual(o.additionalWos,{ids:['WO-CKO-ID-009','WO-CKO-LINK-010'],status:'CANDIDATE_ONLY',admittedCount:0},'NEW_WOS_ADMITTED');
 assert.equal(o.releaseGate,'HOLD_HUMAN','RELEASE_BYPASS');
 assert.deepEqual(assent.nextMandatoryGates,['VERIFY_OWNER_IDENTITY_AND_SCOPED_AUTHORITY','INDEPENDENT_CHECKER_REVIEW','VALIDATE_POLICY_APPLICABILITY_AND_MANIFEST','VERIFY_KERNEL_SIGNED_ADMISSION','AUTHORIZE_AND_RECORD_NONDESTRUCTIVE_EVENT_TRANSITIONS'],'INVALID_GATE_ORDER');
 return {conversationRecommendationsRecorded:4,authenticatedDecisions:0,checkerApprovals:0,kernelAdmissions:0,canonicalElection:false,releaseGate:'HOLD_HUMAN'};
}
export function load(root=resolve('.')){
 const pinnedBytes=Object.fromEntries(Object.entries(PINNED).map(([k,path])=>[k,readFileSync(join(root,path))]));
 const parsed=k=>JSON.parse(String(pinnedBytes[k]));
 return {
   pinnedBytes,
   assent:JSON.parse(readFileSync(join(root,'registers/governance/r85-pmo-conversation-owner-assent-20261031.v1.json'),'utf8')),
   intake:parsed('intake'),arbitration:parsed('arbitration'),
   priorApproval:parsed('priorApproval'),currentQueue:parsed('currentQueue')
 };
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 console.log('[R85-owner-assent] PASS '+JSON.stringify(validate(load())));
}
