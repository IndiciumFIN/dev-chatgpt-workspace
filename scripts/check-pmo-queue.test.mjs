import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';

const SCRIPT=resolve('scripts/check-pmo-queue.mjs');
const QUEUE=JSON.parse(readFileSync('registers/pmo/queue.v1.json','utf8'));
const ui=readFileSync('src/components/admin/admin-console.tsx','utf8');
const panel=readFileSync('src/components/admin/pmo-panel.tsx','utf8');
const commander=readFileSync('src/components/admin/commander-panel.tsx','utf8');
function run(queue,cmd=commander){
 const root=mkdtempSync(join(tmpdir(),'pmo-authority-'));
 try {
  for(const [p,data] of [
   ['registers/pmo/queue.v1.json',JSON.stringify(queue)],
   ['src/components/admin/admin-console.tsx',ui],
   ['src/components/admin/pmo-panel.tsx',panel],
   ['src/components/admin/commander-panel.tsx',cmd]
  ]){const file=join(root,p);mkdirSync(dirname(file),{recursive:true});writeFileSync(file,data);}
  const result=spawnSync(process.execPath,[SCRIPT],{cwd:root,encoding:'utf8',timeout:10000});
  return {code:result.status,output:(result.stdout??'')+(result.stderr??'')};
 }finally{rmSync(root,{recursive:true,force:true});}
}
function clone(){return structuredClone(QUEUE);}
test('R82: real rev18 queue allows only owner-evidenced local Commander work',()=>{
 const r=run(clone());assert.equal(r.code,0,r.output);assert.match(r.output,/PASS PMO:/);
});
test('R82: historical PAUSED is allowed when event history agrees',()=>{
 const q=clone();
 assert.equal(q.items[0].status,'IN_PROGRESS');
 const event=q.events.at(-1);
 assert.equal(event.workId,'WO-ADM-001');
 q.events.pop();q.items[0].status='PAUSED';
 const r=run(q);assert.equal(r.code,0,r.output);
});
test('R82: owner authority statement is required',()=>{
 const q=clone();q.events.at(-1).reason='This change is proposed in the repository without owner authority';
 const r=run(q);assert.notEqual(r.code,0);assert.match(r.output,/Owner-approved local scope is missing/);
});
test('R82: local-only Commander cannot grow remote execution path',()=>{
 const r=run(clone(),commander+"\nfetch('/external-service');\n");
 assert.notEqual(r.code,0);assert.match(r.output,/Commander exceeded local-only scope/);
});
test('R82: HOLDer WO cannot be promoted by status rewrite',()=>{
 const q=clone();q.items.find(x=>x.id==='WO-HOM-001').status='DONE';
 const r=run(q);assert.notEqual(r.code,0);assert.doesNotMatch(r.output,/PASS PMO:/);
});
test('R82: status must match immutable last event',()=>{
 const q=clone();q.items[0].status='PAUSED';
 const r=run(q);assert.notEqual(r.code,0);assert.match(r.output,/Estado diverge do último evento/);
});
test('R82: dependencies cannot be cyclic',()=>{
 const q=clone();
 const pmo=q.items.find(x=>x.id==='WO-PMO-001');
 const sec=q.items.find(x=>x.id==='WO-SEC-001');
 pmo.dependencies=[sec.id];
 const r=run(q);assert.notEqual(r.code,0);assert.doesNotMatch(r.output,/PASS PMO:/);
});
