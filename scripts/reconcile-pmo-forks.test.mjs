import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reconcilePmoForks,PMO_SOURCE_ORDER} from './lib/reconcile-pmo-forks.mjs';
const sha=(c)=>c.repeat(40);
const baseEvent=(seq,id,to,reason)=>({seq,workId:id,to,date:'2026-10-26',reason});
const baseline=()=>({schemaVersion:1,registryId:'CE-PMO-001',readOnly:true,revision:18,items:[
 {id:'WO-ADM-001',status:'IN_PROGRESS',title:'Administração'},
 {id:'WO-HOM-001',status:'HOLD_HUMAN',title:'Homologação'},
],events:[baseEvent(1,'WO-ADM-001','IN_PROGRESS','Started'),baseEvent(2,'WO-HOM-001','HOLD_HUMAN','No permission')]});
function sources(){
 const x=PMO_SOURCE_ORDER.map((ref,i)=>({ref,commit:sha('abcdef'[i]),queue:structuredClone(baseline())}));
 x[2].queue.items[0].status='PAUSED';
 x[2].queue.events.push(baseEvent(3,'WO-ADM-001','PAUSED','Editorial paused'));
 x[3].queue.events.push(baseEvent(3,'WO-ADM-001','IN_PROGRESS','Different event with same seq'));
 x[3].queue.items.push({id:'WO-CKO-009',status:'QUEUED',title:'New'});
 x[4].queue.items.push({id:'WO-CKO-009',status:'QUEUED',title:'New'});
 x[4].queue.events.push(baseEvent(3,'WO-CKO-009','QUEUED','Item discovered'));
 return x;
}
test('branch order and precise commit SHA are required',()=>{
 const x=sources();x.reverse();
 assert.throws(()=>reconcilePmoForks(x),/PMO_SOURCES_INCOMPLETE_OR_UNORDERED/);
 x.reverse();x[0].commit='notsha';
 assert.throws(()=>reconcilePmoForks(x),/PMO_COMMIT_INVALID/);
});
test('fork seq collision does not drop any unique event and never executes',()=>{
 const r=reconcilePmoForks(sources());
 assert.equal(r.counts.sourceCount,5);
 assert.equal(r.counts.baselineEvents,2);
 assert.equal(r.counts.candidateDistinctEvents,5);
 assert.equal(r.counts.replayOnlyEvents,3);
 assert.equal(r.counts.originalSeqCollisionCount,1);
 assert.equal(r.eventLedger[0].proposedSeq,1);
 assert.deepEqual(r.eventLedger.map(x=>x.proposedSeq),[1,2,3,4,5]);
 assert.ok(r.eventLedger.every(x=>x.authoritative===false&&x.status==='UNAPPROVED_REPLAY_CANDIDATE'));
 assert.equal(r.releaseGate,'HOLD_HUMAN');
});
test('WO status conflict and extra WO are flagged, never silently chosen',()=>{
 const r=reconcilePmoForks(sources());
 assert.deepEqual(r.additionalWos,['WO-CKO-009']);
 const adm=r.itemVariants.find(x=>x.id==='WO-ADM-001');
 assert.deepEqual(adm.statusVariants.sort(),['IN_PROGRESS','PAUSED']);
 assert.equal(adm.contested,true);
 assert.equal(adm.resolution,'NOT_ELECTED');
 assert.equal(r.ownerDecision,'NOT_ELECTED');
});
test('duplicated event payload across sources is grouped with full provenance',()=>{
 const r=reconcilePmoForks(sources());
 assert.equal(r.eventLedger[0].originalOrigins.length,5);
 assert.equal(r.eventLedger[0].originalSeqs.length,1);
 assert.equal(r.counts.commonPrefixEvents,2);
});
test('invalid duplicate or nonmonotonic event sequences fail closed',()=>{
 const x=sources();x[3].queue.events.push(baseEvent(3,'WO-ADM-001','PAUSED','Bad repeat'));
 assert.throws(()=>reconcilePmoForks(x),/PMO_EVENT_SEQ_INVALID/);
});
test('WO event references and status cannot be fabricated to get a green check',()=>{
 const x=sources();x[1].queue.events[1].workId='WO-UNKNOWN';
 assert.throws(()=>reconcilePmoForks(x),/PMO_EVENT_INVALID_REF/);
});
test('read-only queue contract is mandatory',()=>{
 const x=sources();x[0].queue.readOnly=false;
 assert.throws(()=>reconcilePmoForks(x),/PMO_CONTRACT_INVALID/);
});

test('R77: arbitration record is bound to an unchanged Git blob and preserves all PMO conflicts', async () => {
 const {readFileSync} = await import('node:fs');
 const {createHash} = await import('node:crypto');
 const src = readFileSync(new URL('../registers/governance/pmo-fork-reconciliation-20261031.v1.json', import.meta.url));
 const record = JSON.parse(readFileSync(new URL('../registers/governance/pmo-r77-arbitration-20261031.v1.json', import.meta.url),'utf8'));
 const pmo = JSON.parse(src.toString('utf8'));
 const blobSha = createHash('sha1').update('blob '+src.length+String.fromCharCode(0)).update(src).digest('hex');
 assert.equal(record.source.blobSha, blobSha, 'versioned decision must bind to actual immutable source blob');
 assert.deepEqual(record.scope.originalSeqCollisions, [20,21]);
 assert.equal(record.scope.distinctEvents,pmo.counts.distinctEventPayloads);
 assert.equal(record.scope.distinctEvents,pmo.eventLedger.length);
 assert.deepEqual(record.scope.statusConflictWOs, pmo.counts.contestedStatuses);
 assert.deepEqual(record.scope.additionalCandidateWOs,pmo.extraWorkOrders);
 assert.equal(record.scope.variantWOs,pmo.woVariants.length);
 assert.deepEqual(record.scope.originalSeqCollisions,pmo.originalSeqCollisions.map(e=>e.originalSeq));
});

test('R77: scoped arbitration is not a canonical election or Kernel release', async () => {
 const {readFileSync} = await import('node:fs');
 const d=JSON.parse(readFileSync(new URL('../registers/governance/pmo-r77-arbitration-20261031.v1.json', import.meta.url),'utf8'));
 assert.equal(d.scope.canonicalRevisionElected,false);
 assert.equal(d.requiresSpecificCanonicalDecision,true);
 assert.equal(d.ownerOperationalAuthorizationPreviouslyRecorded,true);
 assert.equal(d.controls.mainChanged,false);
 assert.equal(d.controls.officialQueueChanged,false);
 assert.equal(d.controls.eventsDeleted,false);
 assert.equal(d.controls.newWOsAdmitted,false);
 assert.equal(d.controls.promotionAllowed,false);
 assert.equal(d.controls.releaseGate,'HOLD_HUMAN');
 assert.equal(d.controls.kernelAdmission,'NOT_VERIFIED');
 assert.deepEqual(d.decisionCandidates.map(x=>x.workOrder),['WO-ADM-001','WO-CKO-001']);
 assert.ok(d.decisionCandidates.every(x=>!x.releaseAuthority&&x.proposedTreatment.startsWith('KEEP_MAIN_STATUS_PENDING_')));
 assert.ok(d.decisionsRequired.every(x=>x.state==='NOT_ELECTED'));
});
