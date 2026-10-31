import {test} from 'node:test';
import assert from 'node:assert/strict';
import {load,verify} from './verify-pmo-fork-lineage.mjs';

const sourceDir=process.env.PMO_FORK_SOURCE_DIR;
assert(sourceDir,'PMO_FORK_SOURCE_DIR required for R83 source-based regressions');
const data=()=>load(sourceDir);
function clone(){
 const d=data();
 return {
  dossier:structuredClone(d.dossier),
  arbitration:structuredClone(d.arbitration),
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
