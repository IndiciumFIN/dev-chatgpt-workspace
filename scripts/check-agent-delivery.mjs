#!/usr/bin/env node
/** Validate an AI delivery packet without executing, installing or admitting it. */
import {readFileSync,writeFileSync,lstatSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
const hash=b=>createHash('sha256').update(b).digest('hex');
const args=process.argv.slice(2),get=n=>{const i=args.indexOf(n);return i<0?undefined:args[i+1]};
const root=get('--package'),output=get('--report');
if(!root||!output){console.error('Usage: node scripts/check-agent-delivery.mjs --package DIR --report NEW_FILE');process.exit(2)}
const required=['delivery-manifest.json','findings.json','validation.json','handoff.md'];
const problems=[],check=(x,msg)=>{if(!x)problems.push(msg)};
let manifest,workOrderId=null;
try{
 const folder=resolve(root);
 check(lstatSync(folder).isDirectory(),'NOT_DIRECTORY');
 const entries=readdirSync(folder);
 for(const f of required)check(entries.includes(f),'MISSING_'+f);
 check(entries.every(f=>required.includes(f)),'UNDECLARED_FILE');
 for(const f of entries)check(lstatSync(join(folder,f)).isFile()&&!lstatSync(join(folder,f)).isSymbolicLink(),'NON_REGULAR_FILE');
 if(problems.length===0){
  const bytes=Object.fromEntries(required.map(f=>[f,readFileSync(join(folder,f))]));
  check(Object.values(bytes).every(b=>b.length>0&&b.length<=1024*1024),'INVALID_FILE_SIZE');
  manifest=JSON.parse(bytes['delivery-manifest.json']);
  const findings=JSON.parse(bytes['findings.json']);
  const validation=JSON.parse(bytes['validation.json']);
  const handoff=bytes['handoff.md'].toString('utf8');
  workOrderId=manifest.workOrderId;
  check(manifest.schemaVersion==='1.0.0'&&/^WO-[A-Z0-9-]+$/.test(workOrderId||''),'INVALID_MANIFEST');
  check(manifest.status==='CANDIDATE'&&manifest.admission==='NOT_VERIFIED','UNAUTHORIZED_STATUS');
  check(Array.isArray(manifest.files)&&manifest.files.length===3,'MANIFEST_FILES');
  const allowed=['findings.json','validation.json','handoff.md'];
  const seen=new Set();
  for(const item of manifest.files||[]){
   check(allowed.includes(item.path)&&!seen.has(item.path),'INVALID_FILE_PATH');seen.add(item.path);
   if(bytes[item.path])check(item.sha256===hash(bytes[item.path])&&item.bytes===bytes[item.path].length,'HASH_MISMATCH_'+item.path);
  }
  check(allowed.every(f=>seen.has(f)),'INCOMPLETE_MANIFEST');
  const queue=JSON.parse(readFileSync('registers/pmo/queue.v1.json','utf8'));
  check(queue.readOnly===true&&queue.canonicalSource==='registers/pmo/queue.v1.json','PMO_AUTHORITY');
  check(queue.items.some(w=>w.id===workOrderId),'UNKNOWN_WO');
  check(isRecord(findings)&&Array.isArray(findings.findings),'INVALID_FINDINGS');
  check(isRecord(validation)&&validation.workOrderId===workOrderId&&validation.status==='CANDIDATE'&&validation.admission==='NOT_VERIFIED','INVALID_VALIDATION');
  check(handoff.trim().length>20&&!/<script\b/i.test(handoff),'INVALID_HANDOFF');
 }
}catch(e){problems.push('INVALID_PACKET_'+(e?.code||'FORMAT'))}
const receipt={schemaVersion:'1.0.0',workOrderId,status:problems.length?'REJECTED':'QUARANTINED',admission:'NOT_VERIFIED',executed:false,imported:false,errors:[...new Set(problems)].sort()};
writeFileSync(output,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(receipt));
if(problems.length)process.exitCode=1;
function isRecord(x){return x!==null&&typeof x==='object'&&!Array.isArray(x)}
