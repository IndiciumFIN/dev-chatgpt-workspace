import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {checkR87Extension} from './validate-r87-task-extension.mjs';
const base=JSON.parse(readFileSync('docs/PLAN-TASKS-PMOKERNEL-v0.1.0.json','utf8'));
const queue=JSON.parse(readFileSync('registers/pmo/queue.v1.json','utf8'));
const wos=new Set(queue.items.map(x=>x.id));
const clone=()=>structuredClone(base);
test('R87: 24 registered candidate tasks verified while preserving 68 historical records',()=>{
 assert.equal(checkR87Extension(clone(),wos),24);
 assert.equal(base.tasks.length,112);
 assert.equal(base.tasks.filter(x=>x.id.startsWith('TASK-PLAN-1')).length,34);
});
test('R87: duplicated scope is reported for review, not auto-closed',()=>{
 const d=clone();
 assert.equal(d.r87ScopedTaskExpansion.duplicatedScopeCandidates.length,6);
 d.r87ScopedTaskExpansion.duplicatedScopeCandidates[0].state='RESOLVED';
 assert.throws(()=>checkR87Extension(d,wos),/R87_DUPLICATE_SCOPE_DRIFT/);
});
test('R87: cannot mark tasks DONE or admit Kernel by changing local JSON',()=>{
 const a=clone();a.tasks.find(x=>x.id==='TASK-PLAN-090').status='DONE';
 assert.throws(()=>checkR87Extension(a,wos),/R87_FALSE_TASK_COMPLETION/);
 const b=clone();b.r87ScopedTaskExpansion.kernelAdmission='ADMITTED';
 assert.throws(()=>checkR87Extension(b,wos),/R87_UNAUTHORIZED_PROMOTION/);
});
test('R87: source commit drift fails closed',()=>{
 const d=clone();d.r87ScopedTaskExpansion.sourceCommits[1]='f'.repeat(40);
 assert.throws(()=>checkR87Extension(d,wos),/R87_PROVENANCE_DRIFT/);
});
test('R87: missing or fifth undocumented task cannot pass',()=>{
 const a=clone();a.tasks.pop();
 assert.throws(()=>checkR87Extension(a,wos),/R87_POPULATION_DRIFT/);
 const b=clone();b.tasks.push({...b.tasks.at(-1),id:'TASK-PLAN-114'});
 assert.throws(()=>checkR87Extension(b,wos),/R87_POPULATION_DRIFT/);
});
test('R87: task metadata must be identical to source-scoped intake',()=>{
 const d=clone();d.tasks.find(x=>x.id==='TASK-PLAN-092').title='Fake approval';
 assert.throws(()=>checkR87Extension(d,wos),/R87_TASK_EVIDENCE_DRIFT/);
});
test('R87: WO-DS-001 exists in original queue but no new Kernel admission inferred',()=>{
 assert(wos.has('WO-DS-001'));
 const d=clone();d.tasks.find(x=>x.id==='TASK-PLAN-102').wo='WO-FAKE-001';
 assert.throws(()=>checkR87Extension(d,wos),/R87_TASK_EVIDENCE_DRIFT|R87_UNKNOWN_TASK_WO/);
});
