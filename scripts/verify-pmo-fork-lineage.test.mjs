import {test} from 'node:test';
import assert from 'node:assert/strict';
import {load,verify,verifyDecisionPacket} from './verify-pmo-fork-lineage.mjs';

const sourceDir=process.env.PMO_FORK_SOURCE_DIR;
if (!sourceDir) {
 test('R83: source checkouts NOT_RUN in generic npm test; dedicated CI must execute',t=>t.skip('Requires five GitHub branch checkouts in PMO candidate workflow'));
} else {
const data=()=>load(sourceDir);
function clone(){
 const d=data();
 return {
  dossier:structuredClone(d.dossier),
  arbitration:structuredClone(d.arbitration),
  packet:structuredClone(d.packet),
  sources:Object.fromEntries(Object.entries(d.sources).map(([k,v])=>[k,Buffer.from(v)]))
 };
}
test('R83: independently reconstruct all five fork queue snapshots and all 28 events',()=>{
 const result=verify(clone());
 assert.equal(result.sourceOccurrences,112);
 assert.equal(result.uniqueEvents,28);
 assert.deepEqual(result.seqCollisions,[20,21]);
 assert.equal(result.authority,'NOT_ELECTED');
});
test('R83: changed original queue bytes are rejected even when JSON shape is valid',()=>{
 const d=clone(),b='preview/central-comando-20261026';
 const j=JSON.parse(String(d.sources[b]));
 j.events[0].reason+=' tampered';
 d.sources[b]=Buffer.from(JSON.stringify(j));
 assert.throws(()=>verify(d),/SOURCE_BLOB_DRIFT/);
});
test('R83: duplicate or dropped event ledger entry fails closed',()=>{
 const d=clone();d.dossier.eventLedger[20]=structuredClone(d.dossier.eventLedger[19]);
 assert.throws(()=>verify(d),/PROPOSED_INDEX_SEQUENCE_DRIFT|DUPLICATE_LEDGER_EVENT|EVENT_OCCURRENCE_DRIFT/);
 const e=clone();e.dossier.eventLedger.pop();
 assert.throws(()=>verify(e),/LEDGER_INCOMPLETE/);
});
test('R83: original occurrence sequence is part of evidence',()=>{
 const d=clone();d.dossier.eventLedger[21].originalOccurrences[0].seq=21;
 assert.throws(()=>verify(d),/EVENT_OCCURRENCE_DRIFT/);
});
test('R83: two collisions cannot be silently renamed away',()=>{
 const d=clone();d.dossier.originalSeqCollisions=[{originalSeq:20,distinctPayloads:2}];
 assert.throws(()=>verify(d),/COLLISION_LEDGER_DRIFT/);
});
test('R83: candidate WOs cannot be silently admitted or removed',()=>{
 const d=clone();d.dossier.extraWorkOrders=['WO-CKO-ID-009'];
 assert.throws(()=>verify(d),/CANDIDATE_WO_RECORD_DRIFT/);
 const e=clone();e.arbitration.controls.newWOsAdmitted=true;
 assert.throws(()=>verify(e),/UNAUTHORIZED_WO_ADMISSION/);
});
test('R83: canonical election and replay must be separately authorized',()=>{
 const d=clone();d.dossier.proposal.revisionChoice='main';
 assert.throws(()=>verify(d),/UNAUTHORIZED_ELECTION/);
 const e=clone();e.arbitration.eventArbitration.authorizedReplay=true;
 assert.throws(()=>verify(e),/UNAUTHORIZED_EVENT_REPLAY/);
});
test('R83: last event ordering is not approved chronology',()=>{
 const d=clone();d.dossier.proposal.proposedSequenceNumbersNonAuthoritative=false;
 assert.throws(()=>verify(d),/FALSE_CHRONOLOGY/);
});
test('R83: cannot silently promote contested WO-CKO state',()=>{
 const d=clone();d.dossier.woVariants.find(x=>x.id==='WO-CKO-001').variants[0].record.status='DONE';
 assert.throws(()=>verify(d),/UNRECOGNIZED_WO_RECORD/);
});

test('R83 packet: all eight events retain source without replay or admission',()=>{
 const d=clone();
 const result=verifyDecisionPacket(d);
 assert.equal(result.forkOnlyEvents,8);
 assert.equal(result.decisionsAwaitingAuthority,4);
 assert.equal(result.replay,'NOT_AUTHORIZED');
});
test('R83 packet: missing original occurrence or forged event status is blocked',()=>{
 const d=clone();d.packet.candidateNonReplayEvents[0].originalOccurrences.pop();
 assert.throws(()=>verifyDecisionPacket(d),/FORK_ORIGINAL_OCCURRENCE_MISMATCH/);
 const e=clone();e.packet.candidateNonReplayEvents[4].to='DONE';
 assert.throws(()=>verifyDecisionPacket(e),/FORK_EVENT_STATUS_MISMATCH/);
});
test('R83 packet: owner election cannot be asserted by changing a JSON field',()=>{
 const d=clone();d.packet.election.chosenCanonicalRevision=23;
 assert.throws(()=>verifyDecisionPacket(d),/UNAUTHORIZED_CANONICAL_REVISION/);
 const e=clone();e.packet.decisionMatrix[0].status='APPROVED';
 assert.throws(()=>verifyDecisionPacket(e),/DECISION_FALSE_APPROVAL/);
});
test('R83 packet: signed Kernel claim and release bypass rejected',()=>{
 const d=clone();d.packet.election.kernelAdmission='ADMITTED';
 assert.throws(()=>verifyDecisionPacket(d),/UNAUTHORIZED_KERNEL_ADMISSION/);
 const e=clone();e.packet.releaseGate='PASS';
 assert.throws(()=>verifyDecisionPacket(e),/UNAUTHORIZED_RELEASE/);
});

}
