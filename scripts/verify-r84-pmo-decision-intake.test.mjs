import {test} from 'node:test';
import assert from 'node:assert/strict';
import {load,verify} from './verify-r84-pmo-decision-intake.mjs';
const clone=()=>structuredClone(load());
test('R84 draft: all four decisions are pending with no implicit election',()=>{
 const x=verify(clone());
 assert.equal(x.decisionsAwaitingSpecificOwnerApproval,4);
 assert.equal(x.authenticatedOwnerDecisions,0);
 assert.equal(x.kernelAdmissions,0);
 assert.equal(x.releaseGate,'HOLD_HUMAN');
});
test('R84 source blob substitution must be rejected',()=>{
 const x=clone();x.blobs.r83='a'.repeat(40);
 assert.throws(()=>verify(x),/R84_R83_BLOB_DRIFT/);
 const y=clone();y.packet.source.mainBaselineQueueBlobSha='0'.repeat(40);
 assert.throws(()=>verify(y),/R84_BASELINE_BLOB_DRIFT/);
});
test('R84 generic prior chat approval is NOT election authority',()=>{
 const x=clone();x.packet.decisionFlow.ownerApprovalFromOct31='APPROVED_FULL_RELEASE';
 assert.throws(()=>verify(x),/R84_GENERIC_APPROVAL_MISUSED/);
 const y=clone();y.priorApproval.approvalProvenance.attestationLevel='CRYPTOGRAPHICALLY_SIGNED';
 assert.throws(()=>verify(y),/R84_FALSE_OLD_SIGNATURE/);
});
test('R84 cannot claim approval by changing JSON-only fields',()=>{
 const x=clone();x.packet.decisions[0].reviewState='APPROVED';
 assert.throws(()=>verify(x),/R84_FALSE_APPROVAL/);
 const y=clone();y.packet.decisions[1].makerAttestation={name:'any'};
 assert.throws(()=>verify(y),/R84_UNVERIFIED_DECISION/);
 const z=clone();z.packet.decisions[1].selection='KEEP_LOCAL_COMMANDER_SCOPED';
 assert.throws(()=>verify(z),/R84_UNVERIFIED_DECISION/);
});
test('R84 actor, reviewer and signed Kernel must remain unverified',()=>{
 const x=clone();x.packet.decisionFlow.identityCheck='PASS';
 assert.throws(()=>verify(x),/R84_FALSE_IDENTITY/);
 const y=clone();y.packet.governance.kernelAuthority='ADMITTED';
 assert.throws(()=>verify(y),/R84_KERNEL_FORGED/);
});
test('R84 cannot auto-elect, replay or publish',()=>{
 const x=clone();x.packet.decisionFlow.mayAutoElectRevision=true;
 assert.throws(()=>verify(x),/R84_AUTO_AUTHORITY/);
 const y=clone();y.packet.blocked.authorizedEventReplays=8;
 assert.throws(()=>verify(y),/R84_FALSE_COMPLETION/);
 const z=clone();z.packet.governance.releaseGate='APPROVED';
 assert.throws(()=>verify(z),/R84_RELEASE_BYPASS/);
});
test('R84 exact four option sets bound to each decision',()=>{
 const x=clone();x.packet.decisions[0].options[0].code='ACCEPT_ALL';
 assert.throws(()=>verify(x),/R84_OPTION_SET_DRIFT/);
 const y=clone();y.packet.decisions.pop();
 assert.throws(()=>verify(y),/R84_FOUR_DECISIONS_REQUIRED/);
});
test('R84 no clinical or extra WO admission based on review',()=>{
 const x=clone();x.packet.blocked.additionalWosAdmitted=2;
 assert.throws(()=>verify(x),/R84_FALSE_COMPLETION/);
 const y=clone();y.packet.governance.homologation='PASS';
 assert.throws(()=>verify(y),/R84_HOMOLOGATION_BYPASS/);
});
test('R84 review must retain segregated owner-checker-Kernel steps',()=>{
 const x=clone();x.packet.decisionFlow.sequence.splice(1,1);
 assert.throws(()=>verify(x),/R84_BAD_AUTHORITY_ORDER/);
});
