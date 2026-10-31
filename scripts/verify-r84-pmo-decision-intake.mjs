#!/usr/bin/env node
/**
 * R84 fail-closed governance draft intake. This is NOT a signature verifier.
 * Decisions and submissions require independently verified owner, checker and
 * Kernel authority. No JSON field alone can change corporate approval state.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
export const gitBlobSha=bytes=>createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
const expectedCodes={
 'R77-PMO-001':['KEEP_REV18_PENDING_KERNEL','PROPOSE_ANOTHER_BASELINE','DEFER_AND_REVIEW'],
 'R77-PMO-002':['KEEP_LOCAL_COMMANDER_SCOPED','REQUEST_ADM_REVIEW','DEFER_AND_REVIEW'],
 'R77-PMO-003':['KEEP_CKO_QUEUED','REQUEST_CKO_PILOT_REVIEW','DEFER_AND_REVIEW'],
 'R77-PMO-004':['HOLD_EXTRA_WOS','REQUEST_EACH_WO_ADMISSION','DEFER_AND_REVIEW']
};
const pending='PENDING_OWNER_SPECIFIC_DECISION';
const isHex=s=>typeof s==='string'&&/^[a-f0-9]{40}$/.test(s);

export function verify({packet,r83,r77,priorApproval,baselineQueue,blobs}){
 assert.equal(packet?.recordId,'CE-R84-PMO-OWNER-DECISION-INTAKE-20261031','R84_ID');
 assert.equal(packet.recordType,'UNSIGNED_REVIEW_INTAKE_NO_AUTHORITY','R84_INVALID_AUTHORITY');
 assert.equal(packet.schemaVersion,'1.0.0','R84_SCHEMA');
 assert.equal(packet.repository,'IndiciumFIN/dev-chatgpt-workspace','R84_REPOSITORY');
 assert.equal(packet.source?.r83Path,'registers/governance/r83-pmo-fork-review-packet-20261031.v1.json','R84_R83_PATH');
 assert.equal(packet.source?.r77Path,'registers/governance/pmo-r77-arbitration-20261031.v1.json','R84_R77_PATH');
 assert.equal(packet.source?.priorApprovalPath,'registers/governance/approval-pmokernel-audit-20261031.v1.json','R84_APPROVAL_PATH');
 assert.equal(packet.source?.forkSnapshotPath,'registers/governance/pmo-fork-reconciliation-20261031.v1.json','R84_FORK_PATH');
 assert(isHex(packet.source.r83BlobSha)&&isHex(packet.source.r77BlobSha)&&isHex(packet.source.priorApprovalBlobSha),'R84_INVALID_SOURCE_SHA');
 assert.equal(packet.source.r83BlobSha,blobs.r83,'R84_R83_BLOB_DRIFT');
 assert.equal(packet.source.r77BlobSha,blobs.r77,'R84_R77_BLOB_DRIFT');
 assert.equal(packet.source.priorApprovalBlobSha,blobs.priorApproval,'R84_APPROVAL_BLOB_DRIFT');
 assert.equal(r83?.recordId,'CE-R83-PMO-FORK-REVIEW-PACKET-20261031','R84_BAD_R83');
 assert.equal(r77?.recordId,'CE-PMO-R77-ARBITRATION-20261031','R84_BAD_R77');
 assert.equal(priorApproval?.decision,'APPROVED_FOR_PERSISTENCE_AND_CONTINUED_VERIFICATION','R84_OLD_APPROVAL_NOT_SCOPE');
 assert.equal(priorApproval.approvalProvenance?.attestationLevel,'CONVERSATION_DECLARATION_NOT_CRYPTOGRAPHIC_SIGNED','R84_FALSE_OLD_SIGNATURE');
 assert.equal(priorApproval.approvalProvenance?.identityVerification,'NOT_PERFORMED','R84_FALSE_OLD_IDENTITY');
 assert.equal(baselineQueue?.revision,18,'R84_MAIN_REVISION_DRIFT');
 assert.equal(baselineQueue?.registryId,'CE-PMO-001','R84_MAIN_QUEUE_ID');
 assert.equal(packet.source.mainBaselineQueueBlobSha,blobs.baselineQueue,'R84_BASELINE_BLOB_DRIFT');
 assert.equal(r83.input.sourceBranches.find(x=>x.branch==='main')?.blobSha,blobs.baselineQueue,'R84_R83_BASELINE_DRIFT');
 assert.equal(r83.election?.chosenCanonicalRevision,null,'R84_R83_HAS_ELECTION');
 assert.equal(r77.scope?.canonicalRevisionElected,false,'R84_R77_HAS_ELECTION');
 const seq=packet.decisionFlow?.sequence;
 assert.deepEqual(seq,['OWNER_EXPLICIT_PER_ITEM_DECISION','INDEPENDENT_CHECKER_REVIEW','VALIDATE_APPLICABLE_POLICY_AND_MANIFEST','VERIFY_SIGNED_KERNEL_ADMISSION','PRESERVE_AND_APPLY_AUTHORIZED_EVENT_TRANSITIONS'],'R84_BAD_AUTHORITY_ORDER');
 const flow=packet.decisionFlow;
 assert.equal(flow.ownerApprovalFromOct31,'APPROVED_FOR_PERSISTENCE_AND_CONTINUED_VERIFICATION_ONLY','R84_GENERIC_APPROVAL_MISUSED');
 assert.equal(flow.identityCheck,'NOT_PERFORMED','R84_FALSE_IDENTITY');
 assert.equal(flow.cryptographicSignatures,'NOT_VERIFIED','R84_FALSE_SIGNATURE');
 for(const k of ['mayAutoElectRevision','mayAutoAdmitWo','mayAutoMergeOrDeploy'])assert.equal(flow[k],false,'R84_AUTO_AUTHORITY_'+k);
 assert.equal(flow.sourceQueueReadOnly,true,'R84_SOURCE_QUEUE_MUTATION');
 assert.equal(flow.requiresNewAuthorizedDecision,true,'R84_OLD_APPROVAL_SUBSTITUTED');
 for(const v of Object.values(flow.signatureRequirements??{}))assert(typeof v==='string'&&v.length>15,'R84_SIGNED_EVIDENCE_CONTRACT_MISSING');
 assert.equal(packet.decisions?.length,4,'R84_FOUR_DECISIONS_REQUIRED');
 const ids=new Set();
 for(let index=0;index<4;index++){
  const row=packet.decisions[index],reference=r83.decisionMatrix[index],arbitration=r77.decisionsRequired[index];
  assert(row && row.id===reference?.id&&row.id===arbitration?.id,'R84_DECISION_ORDER_DRIFT');
  assert(!ids.has(row.id),'R84_DUPLICATE_DECISION');ids.add(row.id);
  assert.equal(row.subject,reference.item,'R84_SUBJECT_DRIFT:'+row.id);
  assert.equal(row.sourceObservation,reference.observed,'R84_EVIDENCE_DRIFT:'+row.id);
  assert.deepEqual(row.options?.map(o=>o.code),expectedCodes[row.id],'R84_OPTION_SET_DRIFT:'+row.id);
  assert.equal(row.recommendedCode,expectedCodes[row.id][0],'R84_RECOMMENDATION_DRIFT:'+row.id);
  for(const opt of row.options)assert(typeof opt.label==='string'&&opt.label.length>8&&typeof opt.effect==='string'&&opt.effect.length>30,'R84_OPTION_MEANING_MISSING');
  assert.equal(row.reviewState,pending,'R84_FALSE_APPROVAL:'+row.id);
  for(const name of ['selection','justification','makerAttestation','independentCheckerAttestation','kernelAdmissibility','approvalSignature','approvalTimestamp'])assert.equal(row[name],null,'R84_UNVERIFIED_DECISION:'+row.id+':'+name);
  assert.equal(row.statusEffectsAllowed,false,'R84_UNAUTHORIZED_EFFECT:'+row.id);
  assert(Array.isArray(row.evidencePaths)&&row.evidencePaths.length>=2,'R84_EVIDENCE_MISSING:'+row.id);
 }
 const blocked=packet.blocked;
 for(const field of ['canonicalRevision','canonicalBranch'])assert.equal(blocked?.[field],null,'R84_FALSE_CANONICAL');
 for(const field of ['ownerDecisionsRecorded','checkerDecisionsVerified','kernelAdmissionsVerified','authorizedEventReplays','additionalWosAdmitted','sourceWosReconciled'])assert.equal(blocked?.[field],0,'R84_FALSE_COMPLETION:'+field);
 assert.equal(packet.governance?.kernelAuthority,'NOT_VERIFIED','R84_KERNEL_FORGED');
 assert.equal(packet.governance?.policyApplicability,'NOT_VALIDATED','R84_POLICY_FORGED');
 assert.equal(packet.governance?.releaseGate,'HOLD_HUMAN','R84_RELEASE_BYPASS');
 assert.equal(packet.governance?.homologation,'HOLD_HUMAN','R84_HOMOLOGATION_BYPASS');
 assert.equal(packet.governance?.mainModified,false,'R84_MAIN_UNAUTHORIZED');
 assert.equal(packet.governance?.sourceQueueModified,false,'R84_SOURCE_UNAUTHORIZED');
 return {decisionsAwaitingSpecificOwnerApproval:4,authenticatedOwnerDecisions:0,checkerReviews:0,kernelAdmissions:0,baselineRevision:18,releaseGate:'HOLD_HUMAN'};
}
export function load(root=resolve('.')){
 const read=p=>readFileSync(join(root,p));
 const blob=p=>gitBlobSha(read(p));
 const paths={
  r83:'registers/governance/r83-pmo-fork-review-packet-20261031.v1.json',
  r77:'registers/governance/pmo-r77-arbitration-20261031.v1.json',
  priorApproval:'registers/governance/approval-pmokernel-audit-20261031.v1.json',
  baselineQueue:'registers/pmo/queue.v1.json'
 };
 const json=p=>JSON.parse(read(p));
 return {packet:json('registers/governance/r84-pmo-owner-decision-intake-20261031.v1.json'),
  r83:json(paths.r83),r77:json(paths.r77),priorApproval:json(paths.priorApproval),
  baselineQueue:json(paths.baselineQueue),
  blobs:Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,blob(p)]))};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 console.log('[R84-decision-intake] PASS '+JSON.stringify(verify(load())));
}
