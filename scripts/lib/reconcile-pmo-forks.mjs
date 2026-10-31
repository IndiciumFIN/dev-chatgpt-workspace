/** Read-only reconciliation of forked PMO event streams, never an admission. */
import {createHash} from 'node:crypto';
export const PMO_SOURCE_ORDER=[
  'main',
  'fix/governed-activities-cli-20261026',
  'work/editorial-canonical-learning-20261026',
  'idioma/consolidado-19',
  'preview/central-comando-20261026'
];
function stable(value){
  if(Array.isArray(value))return value.map(stable);
  if(value && typeof value==='object') return Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])]));
  return value;
}
const digest=obj=>createHash('sha256').update(JSON.stringify(stable(obj))).digest('hex');
function semanticEvent(e) {
  const {seq,...payload}=e;
  return payload;
}
export function reconcilePmoForks(sources){
  if(!Array.isArray(sources)||sources.length!==PMO_SOURCE_ORDER.length||
     sources.some((entry,i)=>entry.ref!==PMO_SOURCE_ORDER[i]))throw Error('PMO_SOURCES_INCOMPLETE_OR_UNORDERED');
  for(const source of sources){
    const q=source.queue;
    if(!q||q.schemaVersion!==1||q.registryId!=='CE-PMO-001'||q.readOnly!==true||
       !Array.isArray(q.items)||!Array.isArray(q.events))throw Error('PMO_CONTRACT_INVALID:'+source.ref);
    if(!/^[a-f0-9]{40}$/.test(source.commit))throw Error('PMO_COMMIT_INVALID:'+source.ref);
    const seqs=q.events.map(e=>e.seq);
    if(seqs.some((n,i)=>!Number.isInteger(n)||n<=0||(i>0&&n<=seqs[i-1])))throw Error('PMO_EVENT_SEQ_INVALID:'+source.ref);
    const woIds=new Set(q.items.map(w=>w.id));
    if(woIds.size!==q.items.length)throw Error('DUPLICATE_WO_ID:'+source.ref);
    if(q.events.some(e=>!woIds.has(e.workId)||!e.reason||!e.to))throw Error('PMO_EVENT_INVALID_REF:'+source.ref);
  }
  const original=sources[0].queue;
  const baselineIds=original.events.map(e=>digest(semanticEvent(e)));
  const byEvent=new Map();
  const duplicateSeq=new Map();
  for(const source of sources) {
    for(const event of source.queue.events){
      const id=digest(semanticEvent(event));
      const before=byEvent.get(id);
      if(before)before.origins.push({ref:source.ref,commit:source.commit,seq:event.seq});
      else byEvent.set(id,{eventId:'pmo-event:'+id,event,digest:id,origins:[{ref:source.ref,commit:source.commit,seq:event.seq}]});
      const existing=duplicateSeq.get(event.seq)??new Map();
      const present=existing.get(id)??[];
      present.push(source.ref);
      existing.set(id,present);
      duplicateSeq.set(event.seq,existing);
    }
  }
  const divergentSeq=[...duplicateSeq].filter(([_,k])=>k.size>1)
    .map(([seq,k])=>({originalSeq:seq,candidateDigests:[...k].map(([digest,refs])=>({digest,sources:refs}))}));
  const baseEvents=baselineIds.map(id=>byEvent.get(id));
  const extras=[...byEvent.values()].filter(e=>!baselineIds.includes(e.digest));
  const ordered=[...baseEvents,...extras];
  const eventLedger=ordered.map((entry,index)=>({
    proposedSeq:index+1,
    eventId:entry.eventId,
    originalSeqs:[...new Set(entry.origins.map(x=>x.seq))],
    originalOrigins:entry.origins,
    workId:entry.event.workId,to:entry.event.to,date:entry.event.date,reason:entry.event.reason,
    status:'UNAPPROVED_REPLAY_CANDIDATE',
    // Proposed new sequence is not an immutable Kernel event; approval required.
    authoritative:false
  }));
  const itemVariants=new Map();
  for(const source of sources){
    for(const item of source.queue.items){
      const existing=itemVariants.get(item.id)??new Map();
      const identity=digest(item);
      const rec=existing.get(identity)??{itemSha256:identity,status:item.status,title:item.title,origins:[]};
      rec.origins.push({ref:source.ref,commit:source.commit});
      existing.set(identity,rec);
      itemVariants.set(item.id,existing);
    }
  }
  const woCandidates=[...itemVariants].map(([id,variants])=>({
    id,variantCount:variants.size,variants:[...variants.values()],
    statusVariants:[...new Set([...variants.values()].map(v=>v.status))],
    contested:variants.size>1,
    resolution:'NOT_ELECTED'
  })).sort((a,b)=>a.id.localeCompare(b.id));
  const baseItemIds=new Set(original.items.map(x=>x.id));
  const additionalWos=woCandidates.filter(x=>!baseItemIds.has(x.id)).map(x=>x.id);
  const conflicts=woCandidates.filter(x=>x.contested);
  const exactPrefixLen=Math.min(...sources.map(s=>{
    const sourceDigests=s.queue.events.map(e=>digest(semanticEvent(e)));
    let i=0;
    while(i<sourceDigests.length&&i<baselineIds.length&&sourceDigests[i]===baselineIds[i])i++;
    return i;
  }));
  const result={
    schemaVersion:'1.0.0',
    proposalOnly:true,
    releaseGate:'HOLD_HUMAN',
    ownerDecision:'NOT_ELECTED',
    kernelAdmission:'NOT_VERIFIED',
    sources:sources.map(s=>({branch:s.ref,commit:s.commit,revision:s.queue.revision,items:s.queue.items.length,events:s.queue.events.length})),
    counts:{
      sourceCount:sources.length,
      baselineWos:original.items.length,
      candidateDistinctWos:woCandidates.length,
      newWosFromForks:additionalWos.length,
      baselineEvents:original.events.length,
      candidateDistinctEvents:eventLedger.length,
      replayOnlyEvents:extras.length,
      commonPrefixEvents:exactPrefixLen,
      originalSeqCollisionCount:divergentSeq.length,
      itemVariantConflicts:conflicts.length,
      statusContestedWos:woCandidates.filter(w=>w.statusVariants.length>1).length
    },
    additionalWos,divergentSeq,itemVariants:woCandidates,
    eventLedger,
    constraints:[
      'This sidecar is a candidate event-ledger, not an update of registers/pmo/queue.v1.json.',
      'Proposed sequence numbers are not canonical until an owner/kernel-authorized decision.',
      'No event is dropped because its original seq conflicts with another fork.',
      'WO field differences and status conflicts are not resolved by revision number.',
      'No new WO admission, no main merge and no production transition.'
    ]
  };
  if(result.counts.candidateDistinctEvents!==new Set(eventLedger.map(x=>x.eventId)).size)throw Error('EVENT_DEDUP_CORRUPTED');
  return result;
}
