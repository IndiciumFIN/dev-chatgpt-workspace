import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,rmSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
const run=(script,args)=>spawnSync(process.execPath,[script,...args],{encoding:'utf8',timeout:10000});
const scenario=(mutate)=>{const root=mkdtempSync(join(tmpdir(),'ce-receipt-'));try{
 const pkg=join(root,'pkg'),report=join(root,'receipt.json');
 const exp=run('scripts/export-commander-task.mjs',['--wo','WO-ADM-001','--out',pkg]);assert.equal(exp.status,0,exp.stderr);
 mutate?.(pkg);
 const result=run('scripts/check-commander-delivery.mjs',['--package',pkg,'--report',report]);
 return {status:result.status,receipt:JSON.parse(readFileSync(report,'utf8'))};
 }finally{rmSync(root,{recursive:true,force:true})}};
test('valid handoff produces only quarantined candidate receipt',()=>{const x=scenario();assert.equal(x.status,0);assert.equal(x.receipt.status,'CANDIDATE_VERIFIED');assert.equal(x.receipt.execution,'FORBIDDEN');assert.equal(x.receipt.imported,false)});
test('tampered task bytes rejected',()=>{const x=scenario(p=>writeFileSync(join(p,'task.json'),readFileSync(join(p,'task.json'),'utf8')+' '));assert.equal(x.status,1);assert.ok(x.receipt.errors.includes('PAYLOAD_HASH'))});
test('tampered manifest rejected',()=>{const x=scenario(p=>{const f=join(p,'manifest.json'),m=JSON.parse(readFileSync(f));m.sourceHashes.pmo='0';writeFileSync(f,JSON.stringify(m))});assert.equal(x.status,1);assert.ok(x.receipt.errors.includes('STALE_SOURCE_HASH'))});
test('wrong WO rejected',()=>{const x=scenario(p=>{const f=join(p,'task.json'),m=JSON.parse(readFileSync(f));m.workOrder.id='WO-FAKE';writeFileSync(f,JSON.stringify(m))});assert.equal(x.status,1);assert.ok(x.receipt.errors.includes('UNKNOWN_WO'))});
test('attempted remote permission rejected',()=>{const x=scenario(p=>{const f=join(p,'task.json'),m=JSON.parse(readFileSync(f));m.restrictions.mayRunRemote=true;writeFileSync(f,JSON.stringify(m))});assert.equal(x.status,1);assert.ok(x.receipt.errors.includes('FORBIDDEN_PERMISSION'))});
