#!/usr/bin/env node
/** R83 deterministic read-only fork lineage verification.
 * Validates all five original queue Git blobs and every event occurrence.
 * proposedSeq is an evidence ledger index, NOT an authorized event replay.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export const SOURCES=Object.freeze([
 {branch:'main',filename:'main.json'},
 {branch:'fix/governed-activities-cli-20261026',filename:'governed.json'},
 {branch:'work/editorial-canonical-learning-20261026',filename:'editorial.json'},
 {branch:'idioma/consolidado-19',filename:'idioma.json'},
 {branch:'preview/central-comando-20261026',filename:'preview.json'}
]);
export const gitBlobSha=bytes=>createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
function stable(v){
 if(Array.isArray(v))return v.map(stable);
 if(v!==null&&typeof v==='object')return Object.fromEntries(Object.entries(v).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,x])=>[k,stable(x)]));
 return v;
}
export const fingerprint=v=>JSON.stringify(stable(v));
export function verify({dossier,arbitration,sources}){
 assert.equal(dossier?.recordId,'CE-PMO-FORK-RECONCILIATION-20261031','FORK_DOSSIER_CHANGED');
 assert.equal(arbitration?.recordId,'CE-PMO-R77-ARBITRATION-20261031','ARBITRATION_ID_CHANGED');
 assert.equal(dossier?.sourceQueues?.length,5,'FIVE_SOURCE_QUEUES_REQUIRED');
 assert.equal(arbitration?.source?.sourceBranches?.length,5,'ARBITRATION_SOURCE_COVERAGE');
 const meta=new Map(dossier.sourceQueues.map(x=>[x.branch,x]));
 const arb=new Map(arbitration.source.sourceBranches.map(x=>[x.branch,x]));
 assert.equal(meta.size,5,'DUPLICATE_SOURCE_BRANCH');
 assert.equal(arb.size,5,'DUPLICATE_ARBITRATION_BRANCH');
 const occurrenceByPayload=new Map(),sourceByBranch=new Map(),woRecords=new Map(),seqPayloads=new Map();
 for(const cfg of SOURCES){
  const {branch}=cfg;
  const raw=sources?.[branch];
  assert(raw && (typeof raw==='string'||Buffer.isBuffer(raw)),'SOURCE_MISSING:'+branch);
  const actual=gitBlobSha(Buffer.from(raw));
  const info=meta.get(branch), a=arb.get(branch);
  assert(info&&a,'SOURCE_NOT_IN_DOSSIER:'+branch);
  assert.equal(actual,info.sourceBlobSha,'SOURCE_BLOB_DRIFT:'+branch);
  assert.equal(actual,a.sourceBlobSha,'ARBITRATION_BLOB_DRIFT:'+branch);
  const q=JSON.parse(String(raw));
  assert.equal(q.registryId,'CE-PMO-001','INVALID_QUEUE_REGISTRY:'+branch);
  assert.equal(q.revision,info.revision,'SOURCE_REVISION_CHANGED:'+branch);
  assert.equal(q.revision,a.revision,'ARBITRATION_REVISION_CHANGED:'+branch);
  assert.equal(q.events.length,info.events,'SOURCE_EVENT_COUNT_CHANGED:'+branch);
  assert.equal(q.items.length,info.wos,'SOURCE_WO_COUNT_CHANGED:'+branch);
  assert.deepEqual(q.events.map(x=>x.seq),q.events.map((_,i)=>i+1),'SOURCE_SEQ_NOT_CONTIGUOUS:'+branch);
  sourceByBranch.set(branch,q);
  for(const event of q.events){
   const {seq,...payload}=event,key=fingerprint(payload);
   const arr=occurrenceByPayload.get(key)??[];
   arr.push(fingerprint({sourceBranch:branch,sourceBlobSha:actual,seq}));
   occurrenceByPayload.set(key,arr);
   const payloads=seqPayloads.get(seq)??new Set();payloads.add(key);seqPayloads.set(seq,payloads);
  }
  for(const item of q.items){
   const variants=woRecords.get(item.id)??new Map(),key=fingerprint(item),refs=variants.get(key)??[];
   refs.push(branch);variants.set(key,refs);woRecords.set(item.id,variants);
  }
 }
 const baseline=sourceByBranch.get('main');
 assert.equal(baseline.revision,18,'MAIN_BASELINE_CHANGED');
 assert.equal(baseline.items.length,10,'MAIN_WO_BASELINE_CHANGED');
 assert.equal(baseline.events.length,20,'MAIN_EVENT_BASELINE_CHANGED');
 assert.equal(dossier.eventLedger?.length,28,'LEDGER_INCOMPLETE');
 assert.equal(occurrenceByPayload.size,28,'EVENT_PAYLOAD_COVERAGE_DRIFT');
 assert.equal(woRecords.size,12,'WORK_ORDER_COVERAGE_DRIFT');
 const seen=new Set();
 for(const [index,entry] of dossier.eventLedger.entries()){
  assert.equal(entry.proposedSeq,index+1,'PROPOSED_INDEX_SEQUENCE_DRIFT');
  const key=fingerprint(entry.payload),src=occurrenceByPayload.get(key);
  assert(src,'UNKNOWN_LEDGER_EVENT:'+index);
  assert(!seen.has(key),'DUPLICATE_LEDGER_EVENT:'+index);
  seen.add(key);
  assert.deepEqual((entry.originalOccurrences??[]).map(fingerprint).sort(),src.slice().sort(),'EVENT_OCCURRENCE_DRIFT:'+index);
 }
 for(const e of baseline.events){
  const {seq,...payload}=e;
  assert.equal(fingerprint(dossier.eventLedger[seq-1].payload),fingerprint(payload),'MAIN_HISTORY_NOT_PRESERVED:'+seq);
 }
 const seqCollisions=[...seqPayloads].filter(([_,values])=>values.size>1).map(([n,values])=>({originalSeq:n,distinctPayloads:values.size})).sort((a,b)=>a.originalSeq-b.originalSeq);
 assert.deepEqual(seqCollisions,[{originalSeq:20,distinctPayloads:2},{originalSeq:21,distinctPayloads:2}],'SOURCE_SEQUENCE_COLLISION_CHANGED');
 assert.deepEqual(dossier.originalSeqCollisions,seqCollisions,'COLLISION_LEDGER_DRIFT');
 const candidateWos=[...woRecords.keys()].filter(x=>!baseline.items.some(w=>w.id===x)).sort();
 assert.deepEqual(candidateWos,['WO-CKO-ID-009','WO-CKO-LINK-010'],'UNAPPROVED_ADDITIONAL_WOS');
 assert.deepEqual(dossier.extraWorkOrders.slice().sort(),candidateWos,'CANDIDATE_WO_RECORD_DRIFT');
 const sourceVariants=[...woRecords].filter(([_,variants])=>variants.size>1);
 assert.equal(sourceVariants.length,7,'WO_VARIANT_COUNT_DRIFT');
 assert.equal(dossier.woVariants.length,7,'VARIANT_LEDGER_INCOMPLETE');
 const variants=new Map(dossier.woVariants.map(v=>[v.id,v]));
 assert.equal(variants.size,7,'DUPLICATE_VARIANT_ENTRY');
 for(const [id,versions] of sourceVariants){
  const d=variants.get(id);assert(d,'MISSING_VARIANT:'+id);
  assert.equal(d.variants.length,versions.size,'VARIANT_COUNT_MISMATCH:'+id);
  for(const item of d.variants){
   const key=fingerprint(item.record), actual=versions.get(key);
   assert(actual,'UNRECOGNIZED_WO_RECORD:'+id);
   assert(actual.includes(item.firstSource),'WRONG_VARIANT_ORIGIN:'+id);
   assert.equal(meta.get(item.firstSource).sourceBlobSha,item.sourceBlobSha,'VARIANT_SOURCE_SHA_DRIFT:'+id);
  }
 }
 const getStatuses=id=>[...woRecords.get(id).keys()].map(k=>JSON.parse(k).status).sort();
 assert.deepEqual(getStatuses('WO-ADM-001'),['IN_PROGRESS','PAUSED'],'ADM_STATE_CONFLICT_DRIFT');
 assert.deepEqual(getStatuses('WO-CKO-001'),['IN_PROGRESS','QUEUED'],'CKO_STATE_CONFLICT_DRIFT');
 assert.deepEqual(dossier.counts,{sourceBranches:5,baselineWos:10,distinctWos:12,baselineEvents:20,distinctEventPayloads:28,newEvents:8,originalSeqCollisions:2,distinctWOItemVariants:7,contestedStatuses:['WO-ADM-001','WO-CKO-001']},'FORK_SUMMARY_DRIFT');
 assert.equal(dossier.proposal?.revisionChoice,'NOT_ELECTED','UNAUTHORIZED_ELECTION');
 assert.equal(dossier.proposal?.kernelAdmission,'NOT_VERIFIED','UNAUTHORIZED_KERNEL');
 assert.equal(dossier.proposal?.officialQueueUnchanged,true,'OFFICIAL_QUEUE_NOT_PROTECTED');
 assert.equal(dossier.proposal?.proposedSequenceNumbersNonAuthoritative,true,'FALSE_CHRONOLOGY');
 assert.equal(dossier.proposal?.releaseGate,'HOLD_HUMAN','FALSE_RELEASE');
 assert.equal(arbitration.scope?.canonicalRevisionElected,false,'ARBITRATION_ELECTION_NOT_APPROVED');
 assert.equal(arbitration.eventArbitration?.authorizedReplay,false,'UNAUTHORIZED_EVENT_REPLAY');
 assert.equal(arbitration.eventArbitration?.proposedReplayIsChronology,false,'FALSE_EVENT_CHRONOLOGY');
 assert.equal(arbitration.controls?.eventsDeleted,false,'LOSS_OF_SOURCE_EVENTS');
 assert.equal(arbitration.controls?.newWOsAdmitted,false,'UNAUTHORIZED_WO_ADMISSION');
 assert.equal(arbitration.controls?.officialQueueChanged,false,'UNAUTHORIZED_OFFICIAL_QUEUE_WRITE');
 assert.equal(arbitration.controls?.releaseGate,'HOLD_HUMAN','ARBITRATION_RELEASE_BYPASS');
 assert.equal(arbitration.decisionsRequired?.length,4,'ARBITRATION_DECISIONS_INCOMPLETE');
 assert(arbitration.decisionsRequired.every(x=>x.state==='NOT_ELECTED'),'AUTHORITY_DECISION_FORGED');
 return {sourceBranches:5,sourceOccurrences:[...occurrenceByPayload.values()].reduce((n,arr)=>n+arr.length,0),uniqueEvents:28,exclusiveEvents:8,seqCollisions:[20,21],workOrders:12,woVariants:7,authority:'NOT_ELECTED',replay:'NOT_AUTHORIZED',releaseGate:'HOLD_HUMAN'};
}
export function verifyDecisionPacket({packet,dossier,arbitration}){
 assert.equal(packet?.recordId,'CE-R83-PMO-FORK-REVIEW-PACKET-20261031','DECISION_PACKET_ID_DRIFT');
 assert.equal(packet.recordType,'DETERMINISTIC_RECONCILIATION_CANDIDATE_ONLY','DECISION_PACKET_NOT_CANDIDATE');
 assert.equal(packet.reconstruction?.sourceEventOccurrences,112,'DECISION_OCCURRENCE_DRIFT');
 assert.equal(packet.reconstruction?.distinctEventPayloads,28,'DECISION_EVENT_COUNT_DRIFT');
 assert.equal(packet.reconstruction?.exclusiveEvents,8,'DECISION_EXCLUSIVE_COUNT_DRIFT');
 assert.deepEqual(packet.reconstruction?.collidingSequenceNumbers,[20,21],'DECISION_COLLISION_DRIFT');
 assert.equal(packet.reconstruction?.distinctWos,12,'DECISION_WO_DRIFT');
 assert.equal(packet.candidateNonReplayEvents?.length,8,'NON_REPLAY_EVENTS_INCOMPLETE');
 for(let i=0;i<8;i++){
  const row=packet.candidateNonReplayEvents[i],event=dossier.eventLedger[20+i];
  assert.equal(row.ledgerIndex,event.proposedSeq,'UNMATCHED_FORK_EVENT');
  assert.equal(row.workOrder,event.payload.workId,'FORK_EVENT_WO_MISMATCH');
  assert.equal(row.to,event.payload.to,'FORK_EVENT_STATUS_MISMATCH');
  assert.equal(row.eventDate,event.payload.date,'FORK_EVENT_DATE_MISMATCH');
  assert.deepEqual(row.originalOccurrences,event.originalOccurrences.map(x=>({
   sourceBranch:x.sourceBranch,sourceBlobSha:x.sourceBlobSha,originalSeq:x.seq
  })),'FORK_ORIGINAL_OCCURRENCE_MISMATCH');
  assert.equal(row.treatment,'SOURCE_EVIDENCE_ONLY_NOT_REPLAYED','UNAUTHORIZED_EVENT_REPLAY');
  assert.equal(row.replayAllowed,false,'UNAUTHORIZED_EVENT_REPLAY');
  assert.equal(row.authorization,'NOT_ADMITTED','UNAUTHORIZED_EVENT_ADMISSION');
 }
 const required=arbitration.decisionsRequired.map(x=>x.id).sort();
 assert.deepEqual(packet.decisionMatrix?.map(x=>x.id).sort(),required,'DECISION_MATRIX_INCOMPLETE');
 assert(packet.decisionMatrix.every(x=>x.status==='NOT_ELECTED'&&x.recommendation&&x.requires),'DECISION_FALSE_APPROVAL');
 assert.equal(packet.election?.chosenCanonicalRevision,null,'UNAUTHORIZED_CANONICAL_REVISION');
 assert.equal(packet.election?.kernelAdmission,'NOT_VERIFIED','UNAUTHORIZED_KERNEL_ADMISSION');
 assert.equal(packet.election?.eventReplay,'NOT_AUTHORIZED','UNAUTHORIZED_EVENT_REPLAY');
 assert.equal(packet.election?.proposedEventIndexIsChronology,false,'FALSE_EVENT_CHRONOLOGY');
 assert.equal(packet.election?.officialQueueModified,false,'UNAUTHORIZED_QUEUE_MUTATION');
 assert.equal(packet.election?.unresolvedDecisions,4,'FALSE_DECISION_COMPLETION');
 assert.equal(packet.policy?.noAutomaticReplay,true,'UNAUTHORIZED_REPLAY_POLICY');
 assert.equal(packet.deletedOriginalEvents,0,'EVENT_HISTORY_LOST');
 assert.equal(packet.admittedNewWos,0,'UNAUTHORIZED_WO_ADMISSION');
 assert.equal(packet.mainChanged,false,'UNAUTHORIZED_MAIN');
 assert.equal(packet.releaseGate,'HOLD_HUMAN','UNAUTHORIZED_RELEASE');
 return {forkOnlyEvents:8,decisionsAwaitingAuthority:4,kernel:'NOT_VERIFIED',replay:'NOT_AUTHORIZED'};
}
export function load(root){
 const src=Object.fromEntries(SOURCES.map(x=>[x.branch,readFileSync(join(root,x.filename))]));
 const path=resolve('.');
 return {
  sources:src,
  dossier:JSON.parse(readFileSync(join(path,'registers/governance/pmo-fork-reconciliation-20261031.v1.json'),'utf8')),
  arbitration:JSON.parse(readFileSync(join(path,'registers/governance/pmo-r77-arbitration-20261031.v1.json'),'utf8')),
  packet:JSON.parse(readFileSync(join(path,'registers/governance/r83-pmo-fork-review-packet-20261031.v1.json'),'utf8'))
 };
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert(process.argv[2],'usage: node scripts/verify-pmo-fork-lineage.mjs <source-directory>');
 const input=load(resolve(process.argv[2]));
 console.log('[R83-fork-lineage] PASS '+JSON.stringify(verify(input)));
 console.log('[R83-election-packet] PASS '+JSON.stringify(verifyDecisionPacket(input)));
}
