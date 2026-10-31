import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateR89Reconciliation} from './validate-r89-task-reconciliation.mjs';
import {checkR87Extension} from './validate-r87-task-extension.mjs';
const plan=JSON.parse(readFileSync('docs/PLAN-TASKS-PMOKERNEL-v0.1.0.json','utf8'));
const queue=JSON.parse(readFileSync('registers/pmo/queue.v1.json','utf8'));
const wos=new Set(queue.items.map(t=>t.id));
const cp=()=>structuredClone(plan);
test('R89: 112 tasks = 37 historical + 31 R79 + 24 R87 + 20 R89',()=>{
 assert.equal(plan.tasks.length,112);
 assert.equal(validateR89Reconciliation(cp(),wos),20);
 assert.equal(checkR87Extension(cp(),wos),24);
});
test('R89: one extra or removed task fails before release',()=>{
 const a=cp();a.tasks.push({...a.tasks.at(-1),id:'TASK-PLAN-134'});
 assert.throws(()=>validateR89Reconciliation(a,wos),/R89_POPULATION_DRIFT/);
 const b=cp();b.tasks.pop();assert.throws(()=>validateR89Reconciliation(b,wos),/R89_POPULATION_DRIFT/);
});
test('R89: task 132 remains BLOCKED and cannot silently become DONE',()=>{
 const x=cp(),t=x.tasks.find(t=>t.id==='TASK-PLAN-132');
 assert.equal(t.status,'BLOCKED');t.status='DONE';
 assert.throws(()=>validateR89Reconciliation(x,wos),/R89_NEW_TASK_DRIFT/);
});
test('R89: false Kernel admission and approval rejected',()=>{
 const a=cp();a.r89ScopedTaskReconciliation.authority.kernelAdmission='ADMITTED';
 assert.throws(()=>validateR89Reconciliation(a,wos),/R89_UNAUTHORIZED_PROMOTION/);
 const b=cp();b.tasks.find(x=>x.id==='TASK-PLAN-120').authorization={approval:'APPROVED'};
 assert.throws(()=>validateR89Reconciliation(b,wos),/R89_NEW_TASK_FALSE_ADMISSION/);
});
test('R89: R87 task 092 may be delivered only pending gate, never DONE',()=>{
 const a=cp();assert.equal(a.tasks.find(x=>x.id==='TASK-PLAN-092').status,'DELIVERED_PENDING_GATE');
 a.tasks.find(x=>x.id==='TASK-PLAN-092').status='DONE';
 assert.throws(()=>checkR87Extension(a,wos),/R87_FALSE_TASK_COMPLETION/);
});
test('R89: task 113 amended scope pinned but not admitted',()=>{
 const a=cp();assert.equal(a.tasks.find(x=>x.id==='TASK-PLAN-113').status,'PROPOSTO');
 a.r89ScopedTaskReconciliation.amendments.find(x=>x.id==='TASK-PLAN-113').changes.status='DONE';
 assert.throws(()=>validateR89Reconciliation(a,wos),/R89_HISTORIC_SCOPE_DRIFT|R89_FALSE_COMPLETION|R89_UNREGISTERED_AMENDMENT/);
});
test('R89: changing amendment allow-list or event provenance fails',()=>{
 const a=cp();a.r89ScopedTaskReconciliation.amendments[0].changes.status='DONE';
 assert.throws(()=>validateR89Reconciliation(a,wos),/R89_UNREGISTERED_AMENDMENT/);
 const b=cp();b.r89ScopedTaskReconciliation.sourcePlanBlobSha='f'.repeat(40);
 assert.throws(()=>validateR89Reconciliation(b,wos),/R89_SOURCE_UNVERIFIED/);
});
test('R89: unknown WO, duplicated scope resolution without checker, and plan release rejected',()=>{
 const a=cp();a.tasks.find(x=>x.id==='TASK-PLAN-120').wo='WO-IMAGINARY';
 assert.throws(()=>validateR89Reconciliation(a,wos),/R89_NEW_TASK_DRIFT/);
 const b=cp();b.r89ScopedTaskReconciliation.pendingDuplicateScopes=[];
 assert.throws(()=>validateR89Reconciliation(b,wos),/R89_DUPLICATE_SCOPE_ERASURE/);
 const c=cp();c.releaseGate='PASS';
 assert.throws(()=>validateR89Reconciliation(c,wos),/R89_UNAUTHORIZED_PROMOTION/);
});
test('R89: no new task can be silently reprioritized or removed from source',()=>{
 const x=cp();x.r89ScopedTaskReconciliation.additionalTasks[0].title='unverified';
 assert.throws(()=>validateR89Reconciliation(x,wos),/R89_NEW_TASK_DRIFT/);
});
