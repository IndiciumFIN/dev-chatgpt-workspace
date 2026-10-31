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
test('R78: persisted gap-WO dossier validates against 37 live tasks',()=>{
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
