import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assess} from './audit-pending-lineage.mjs';

const sample=()=>({
 queue:{items:[{id:'WO-PMO-001'},{id:'WO-SEC-001'}]},
 intake:{
  simulados:[{id:'P0-01',title:'Simulado',wo:'UNRECONCILED'}],
  openIssues:[{id:'GH-28',title:'OAuth',wo:'WO-SEC-001'}],
  coverageGaps:[{id:'GAP-01',status:'OPEN'}]
 },
 plan:{tasks:[
  {id:'TASK-PLAN-013',wo:'WO-PMO-001',status:'PROPOSTO',covers:['P0-01','GH-28']},
  {id:'TASK-PLAN-057',wo:'WO-SEC-001',status:'BLOCKED',covers:['GH-28']}
 ]}
});
test('R78: generic task coverage does not certify source WO or Kernel admission',()=>{
 const r=assess(sample());
 assert.equal(r.counts.total,2);
 assert.equal(r.counts.taskCovered,2);
 assert.equal(r.counts.sourceWoUnreconciled,1);
 assert.equal(r.counts.domainCandidateUnmapped,1);
 assert.equal(r.counts.kernelAdmitted,0);
 assert.equal(r.releaseGate,'HOLD_HUMAN');
 const orphan=r.records.find(x=>x.id==='P0-01');
 assert.deepEqual(orphan.candidateDomainWos,[]);
 assert.ok(orphan.missingEvidence.includes('SOURCE_WO_UNRECONCILED'));
 assert.ok(orphan.missingEvidence.includes('KERNEL_ADMISSION_NOT_VERIFIED'));
 const issue=r.records.find(x=>x.id==='GH-28');
 assert.deepEqual(issue.candidateDomainWos,['WO-SEC-001']);
 assert.ok(issue.missingEvidence.includes('KERNEL_ADMISSION_NOT_VERIFIED'));
});
test('R78: missing input collections do not count as zero pending',()=>{
 const bad=sample(); delete bad.intake.openIssues;
 assert.throws(()=>assess(bad),/INTAKE_INVALID/);
});
test('R78: duplicated pending identifiers are rejected',()=>{
 const bad=sample(); bad.intake.openIssues.push({...bad.intake.openIssues[0]});
 assert.throws(()=>assess(bad),/DUPLICATE_OR_EMPTY_PENDING_ID/);
});
test('R78: task pointing to non-existent WO is rejected',()=>{
 const bad=sample(); bad.plan.tasks[0].wo='WO-NONEXISTENT';
 assert.throws(()=>assess(bad),/TASK_WO_NOT_PRESENT/);
});
test('R78: cancelled and superseded tasks do not cover pending records',()=>{
 const bad=sample(); bad.plan.tasks.forEach(t=>t.status='CANCELLED');
 const r=assess(bad);
 assert.equal(r.counts.taskCovered,0);
 assert.equal(r.counts.kernelAdmitted,0);
});
test('R78: issue GH and ISSUE aliases have equivalent task coverage, not authority',()=>{
 const bad=sample();bad.plan.tasks[1].covers=['ISSUE-28'];
 const r=assess(bad);
 const issue=r.records.find(x=>x.id==='GH-28');
 assert.deepEqual(issue.candidateDomainWos,['WO-SEC-001']);
 assert.equal(issue.authorityStatus,'HOLD_HUMAN');
});
