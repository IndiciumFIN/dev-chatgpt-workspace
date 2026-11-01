#!/usr/bin/env node
/** Read-only provenance verification of three MEM registry blobs. No materialization.
 * Exact blobs must be copied only by the external Kernel-admitted executor.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
const run = (a,opts={}) => execFileSync('git',a,{encoding:'utf8',...opts}).trim();
const origin='4131831be71246d3c6e6ac61498310a9adb575a0';
const overlay='081c61ac6c6ea674934d1cad3c310e96476fc9a1';
const branchName='integration/structural-overlay-20261101';
const files=[
  {path:'registers/curiosidades/mem-content-inventory.v1.json',blob:'8b33445b921f502d65ba68776ca97988f3a90623'},
  {path:'registers/curiosidades/mem-source-alternatives.v1.json',blob:'2f265df4b3e74bd5978023f7a7eb2dc2bb5a642f'},
  {path:'registers/curiosidades/mem-missing-sources.v1.json',blob:'5168d4e2cab52b41adbe83038ea4f7e7d7b0ffc5'},
];
if(process.argv.includes('--apply')) throw Error('KERNEL_ADMISSION_UNVERIFIED:MATERIALIZATION_DENIED');
const branch=run(['branch','--show-current']);
if(branch!==branchName)throw Error(`ISOLATED_BRANCH_REQUIRED:${branchName}`);
run(['merge-base','--is-ancestor',overlay,'HEAD']);
if(!process.argv.includes('--no-fetch')){
  run(['fetch','--no-tags','origin','feat/curiosidades-mem-87-20261026']);
  if(run(['rev-parse','FETCH_HEAD'])!==origin)throw Error('SOURCE_BRANCH_MOVED');
}
if(run(['rev-parse',`${origin}^{commit}`])!==origin)throw Error('SOURCE_SHA_MISMATCH');
const results=[];
for(const f of files){
  const buf=execFileSync('git',['show',`${origin}:${f.path}`]);
  const sha=run(['hash-object','--stdin'],{input:buf});
  if(sha!==f.blob)throw Error('PINNED_BLOB_DRIFT:'+f.path);
  const data=JSON.parse(buf.toString('utf8'));
  if(f.path.includes('mem-content-inventory')){
    if(data.sourceCount!==87||data.items?.length!==87||
      data.items.some(x=>!['NEEDS_REVIEW','BLOCKED_SOURCE'].includes(x.content_status)))
      throw Error('MEM_INVENTORY_HOLD_DRIFT');
  }
  if(f.path.includes('mem-source-alternatives')){
    if(data.counts?.total!==48||data.counts?.withCandidates!==46||
      data.counts?.stillWithoutDefensibleCandidate!==2||data.items?.length!==48||
      data.items.some(x=>x.claimLevel!=='NOT_VALIDATED'||x.rights!=='NOT_ASSESSED'))
      throw Error('MEM_ALTERNATIVES_HOLD_DRIFT');
  }
  const state=existsSync(f.path)?(readFileSync(f.path).equals(buf)?'IDENTICAL':'CONFLICT'):'MISSING';
  results.push({...f,state,bytes:buf.length,gate:'HOLD_HUMAN'});
}
console.log(JSON.stringify({mode:'READ_ONLY',head:run(['rev-parse','HEAD']),origin,
  approval:'NOT_VERIFIED',publication:'HOLD_HUMAN',files:results},null,2));
if(results.some(x=>x.state==='CONFLICT'))process.exitCode=2;
