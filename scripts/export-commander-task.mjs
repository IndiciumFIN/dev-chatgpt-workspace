#!/usr/bin/env node
/** Reproducible, metadata-only Commander task handoff. No network or execution. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
const sha=x=>createHash('sha256').update(x).digest('hex');
const args=process.argv.slice(2),option=n=>{const i=args.indexOf(n);return i>=0?args[i+1]:undefined};
const id=option('--wo'),dest=option('--out');
if(!/^WO-[A-Z0-9-]+$/.test(id||'')||!dest){console.error('Usage: node scripts/export-commander-task.mjs --wo WO-XXX --out ./artifacts/commander');process.exit(2)}
const queue=JSON.parse(readFileSync('registers/pmo/queue.v1.json','utf8'));
const lanes=JSON.parse(readFileSync('registers/commander/lanes.v1.json','utf8'));
if(queue.canonicalSource!=='registers/pmo/queue.v1.json'||queue.readOnly!==true||lanes.governance?.remoteWritesAllowed!==false||lanes.governance?.dispatchImplemented!==false)throw Error('AUTHORITY_OR_DISPATCH_DENIED');
const item=queue.items.find(x=>x.id===id);if(!item)throw Error('WO_NOT_FOUND');
const approved=['id','title','status','order','priority','criteria','dependencies','next','updatedOn'];
const metadata=Object.fromEntries(approved.filter(k=>Object.hasOwn(item,k)).map(k=>[k,item[k]]));
const assigned=lanes.lanes.filter(l=>l.workOrderId===id).map(l=>({id:l.id,role:l.role,workOrderId:l.workOrderId,dispatched:l.dispatched,expectedArtifact:l.expectedArtifact,acceptance:l.acceptance,sourceCommit:l.sourceCommit}));
if(assigned.some(l=>l.dispatched!==false))throw Error('LANE_DISPATCHED');
const payload={schemaVersion:'1.0.0',mode:'READ_ONLY_HANDOFF',source:'registers/pmo/queue.v1.json',workOrder:metadata,lanes:assigned,restrictions:{mayRunRemote:false,mayWriteRepository:false,mayWriteDatabase:false,mayPublish:false},requiredOutputs:lanes.governance.requiredOutputs};
const body=JSON.stringify(payload,null,2)+'\n';
const manifest={schemaVersion:'1.0.0',workOrderId:id,file:'task.json',sha256:sha(body),bytes:Buffer.byteLength(body),sourceHashes:{pmo:sha(readFileSync('registers/pmo/queue.v1.json')),lanes:sha(readFileSync('registers/commander/lanes.v1.json'))}};
const root=resolve(dest),fs=await import('node:fs');
if(fs.existsSync(root)&&fs.readdirSync(root).length)throw Error('OUTPUT_NOT_EMPTY');
mkdirSync(root,{recursive:true});
writeFileSync(join(root,'task.json'),body,{flag:'wx'});
writeFileSync(join(root,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:'CREATED',workOrderId:id,output:root,sha256:manifest.sha256}));
