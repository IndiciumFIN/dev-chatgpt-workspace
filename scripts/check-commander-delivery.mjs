#!/usr/bin/env node
/** Deterministic handoff receipt validation. Reads data, never executes or imports code. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
const sha=x=>createHash('sha256').update(x).digest('hex');
const args=process.argv.slice(2);
const opt=n=>{const i=args.indexOf(n);return i<0?undefined:args[i+1]};
const dir=opt('--package'),report=opt('--report');
if(!dir||!report){console.error('Usage: node scripts/check-commander-delivery.mjs --package <directory> --report <new-report.json>');process.exit(2)}
const read=(p)=>readFileSync(p);
let errors=[],id=null;
try{
 const root=resolve(dir), taskRaw=read(join(root,'task.json')),manifest=JSON.parse(read(join(root,'manifest.json'),'utf8')),task=JSON.parse(taskRaw);
 id=task?.workOrder?.id||null;
 const qRaw=read('registers/pmo/queue.v1.json'),lRaw=read('registers/commander/lanes.v1.json');
 const queue=JSON.parse(qRaw),lanes=JSON.parse(lRaw);
 const check=(ok,code)=>{if(!ok)errors.push(code)};
 check(manifest.file==='task.json'&&manifest.workOrderId===id,'MANIFEST_ID');
 check(manifest.sha256===sha(taskRaw)&&manifest.bytes===taskRaw.length,'PAYLOAD_HASH');
 check(manifest.sourceHashes?.pmo===sha(qRaw)&&manifest.sourceHashes?.lanes===sha(lRaw),'STALE_SOURCE_HASH');
 check(task.mode==='READ_ONLY_HANDOFF'&&task.source==='registers/pmo/queue.v1.json','BAD_HANDOFF_MODE');
 check(queue.readOnly===true&&queue.canonicalSource===task.source,'BAD_AUTHORITY');
 check(lanes.governance?.dispatchImplemented===false&&lanes.governance?.remoteWritesAllowed===false,'DISPATCH_POLICY');
 check(task.restrictions?.mayRunRemote===false&&task.restrictions?.mayWriteRepository===false&&task.restrictions?.mayWriteDatabase===false&&task.restrictions?.mayPublish===false,'FORBIDDEN_PERMISSION');
 const wo=queue.items.find(w=>w.id===id);
 check(Boolean(wo),'UNKNOWN_WO');
 if(wo){for(const field of ['id','title','status','order','priority','criteria','dependencies','next','updatedOn'])check(JSON.stringify(task.workOrder?.[field])===JSON.stringify(wo[field]),'WO_DRIFT_'+field)}
 const expected=lanes.lanes.filter(l=>l.workOrderId===id);
 check(Array.isArray(task.lanes)&&task.lanes.length===expected.length,'LANE_CARDINALITY');
 for(const lane of (Array.isArray(task.lanes)?task.lanes:[])){
  const original=expected.find(e=>e.id===lane.id);
  check(!!original&&lane.dispatched===false,'INVALID_LANE');
  if(original)for(const field of ['role','workOrderId','expectedArtifact','acceptance','sourceCommit'])check(JSON.stringify(lane[field])===JSON.stringify(original[field]),'LANE_DRIFT_'+field);
 }
 check(JSON.stringify(task.requiredOutputs)===JSON.stringify(lanes.governance.requiredOutputs),'OUTPUT_CONTRACT_DRIFT');
}catch(e){errors.push('INVALID_INPUT_'+(e?.code||'FORMAT'))}
const result={schemaVersion:'1.0.0',workOrderId:id,status:errors.length?'REJECTED':'CANDIDATE_VERIFIED',admission:'NOT_VERIFIED',execution:'FORBIDDEN',imported:false,errors:[...new Set(errors)].sort()};
writeFileSync(report,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(result));
if(errors.length)process.exitCode=1;
