import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validate} from './check-r78-gap-register.mjs';
const current=()=>{
 const base='registers/governance/r78-gap-wo-execution-20261031.v1.json';
 return {
  report:JSON.parse(readFileSync(base,'utf8')),
  plan:JSON.parse(readFileSync('docs/PLAN-TASKS-PMOKERNEL-v0.1.0.json','utf8'))
 };
};
test('R78: historical 37 plus 31 R79 candidates and 24 concurrently sourced R87 proposals',()=>{
 const {report,plan}=current();
 const v=validate(report,plan);
 assert.equal(v.gaps,4);
 assert.equal(v.tasks,plan.tasks.length);
 assert.equal(v.releaseGate,'HOLD_HUMAN');
});
test('R78: never mark an unresolved gap DONE without signed authority',()=>{
 const {report,plan}=current();report.gaps[0].state='DONE';
 assert.throws(()=>validate(report,plan),/FALSE_GAP_CLOSURE/);
});
test('R78: unknown tasks and missing blockers cannot pass',()=>{
 const {report,plan}=current();report.gaps[1].tasks=['UNKNOWN'];
 assert.throws(()=>validate(report,plan),/TASK_NOT_FOUND/);
 const second=current();second.report.gaps[3].blocks=[];
 assert.throws(()=>validate(second.report,second.plan),/UNRECORDED_BLOCKER/);
});
test('R78: no artificial closure for security, Kernel or main',()=>{
 const {report,plan}=current();report.gaps[3].evidence.oauth.rotation='DONE';
 assert.throws(()=>validate(report,plan),/FALSE_SECRET_ROTATION/);
 const second=current();second.report.authority.mainChangedByR78=true;
 assert.throws(()=>validate(second.report,second.plan),/FALSE_RELEASE_AUTHORITY/);
});
test('R78: missing or changed gap count fails closed',()=>{
 const {report,plan}=current();report.gaps.pop();
 assert.throws(()=>validate(report,plan),/GAP_COUNT_INCOMPLETE/);
});

test('R86: unregistered fifth specialist task cannot bypass R78 register',()=>{
 const {report,plan}=current();plan.tasks.push({...plan.tasks.at(-1),id:'TASK-PLAN-094'});
 assert.throws(()=>validate(report,plan),/TASK_PLAN_DRIFT/);
});
test('R86: no silent specialist completion or unverified Kernel admission',()=>{
 const a=current();a.plan.tasks.find(t=>t.id==='TASK-PLAN-090').status='DONE';
 assert.throws(()=>validate(a.report,a.plan),/R87_FALSE_TASK_COMPLETION/);
 const b=current();b.plan.r87ScopedTaskExpansion.kernelAdmission='ADMITTED';
 assert.throws(()=>validate(b.report,b.plan),/R87_UNAUTHORIZED_PROMOTION/);
});
test('R86: unpinned specialist source or task title cannot pass',()=>{
 const a=current();a.plan.r87ScopedTaskExpansion.sourceCommits[0]='0'.repeat(40);
 assert.throws(()=>validate(a.report,a.plan),/R87_PROVENANCE_DRIFT/);
 const b=current();b.plan.r87ScopedTaskExpansion.tasks[2].title='unreviewed changed scope';
 assert.throws(()=>validate(b.report,b.plan),/R87_TASK_EVIDENCE_DRIFT/);
});
test('R86: cannot bypass unchanged R79 31-domain source mapping',()=>{
 const a=current();a.plan.r79CandidateMapping.candidateTasksAdded=30;
 assert.throws(()=>validate(a.report,a.plan),/TASK_PLAN_DRIFT|R79_CANDIDATE_UNVERIFIED/);
 const b=current();b.plan.tasks.find(t=>t.id==='TASK-PLAN-059').authorization.kernelAdmission='ADMITTED';
 assert.throws(()=>validate(b.report,b.plan),/R79_FALSE_CANDIDATE_AUTHORITY/);
});
