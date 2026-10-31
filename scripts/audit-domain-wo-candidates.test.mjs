import {test} from 'node:test';
import assert from 'node:assert/strict';
import {verify} from './audit-domain-wo-candidates.mjs';
const SHA_A='a'.repeat(40), SHA_B='b'.repeat(40), SHA_C='c'.repeat(40);
function fixture(){
 const evidence='https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/18';
 return {
  sourceSha:SHA_A,queueSha:SHA_B,planSha:SHA_C,
  intake:{openIssues:[{id:'GH-18',title:'Provenance de agentes',wo:'UNRECONCILED'},{id:'GH-28',title:'OAuth',wo:'WO-SEC-001'}],simulados:[]},
  queue:{items:[{id:'WO-SEC-001'}]},
  plan:{
   r79CandidateMapping:{sourceRegistryBlobSha:SHA_A,queueBlobSha:SHA_B,baselineTasks:1},
   tasks:[
    {id:'TASK-PLAN-057',wo:'WO-SEC-001',status:'BLOCKED',covers:['GH-28']},
    {id:'TASK-PLAN-059',wo:'WO-SEC-001',status:'PROPOSTO',covers:['GH-18'],deps:['TASK-PLAN-057'],artifacts:[evidence],origin:{sourceId:'GH-18',sourceTitle:'Provenance de agentes',sourceType:'issue',sourceBlobSha:SHA_A},
     authorization:{mappingType:'DOMAIN_WO_CANDIDATE',approval:'NOT_APPROVED',kernelAdmission:'NOT_VERIFIED',releaseGate:'HOLD_HUMAN'}}
   ]
  },
  register:{
   recordType:'CANDIDATE_DOMAIN_WO_ASSIGNMENTS_NOT_ADMISSION',
   baseline:{sourceBlobSha:SHA_A,queueBlobSha:SHA_B,taskPlanBlobSha:SHA_C},
   coverage:{sourcePendingTotal:2,sourceUnreconciled:1,alreadySourceWoMapped:1,oldPlanTasks:1,newProposedTasks:1,currentPlanTasks:2},
   candidates:[{sourceId:'GH-18',sourceType:'issue',sourceTitle:'Provenance de agentes',sourceStatus:'UNRECONCILED',proposedWo:'WO-SEC-001',proposedTask:'TASK-PLAN-059',sourceBlobSha:SHA_A,dependsOn:['TASK-PLAN-057'],lineageStatus:'CANDIDATE_MATCH_BY_SCOPED_TECHNICAL_REVIEW',evidenceUrl:evidence,authorization:'NOT_APPROVED'}],
   preserved:{sourceIntakeModified:false,officialPmoQueueModified:false,allItemsRequireFindPolicyValidatorAndKernel:true},
   controls:{formalWorkOrdersAdmitted:0,kernelAdmission:'NOT_VERIFIED',canonicalQueueElection:'NOT_ELECTED',releaseGate:'HOLD_HUMAN',mainChanged:false}
  }
 };
}
test('R79 candidate coverage cannot become release authority',()=>{
 const x=verify(fixture());assert.deepEqual(x,{sourceTotal:2,unresolvedSourceWos:1,domainCandidates:1,unmappedDomainCandidates:0,formalAdmittedWos:0,releaseGate:'HOLD_HUMAN'});
});
test('R79 source blob and domain WO origin tampering fail closed',()=>{
 const a=fixture();a.sourceSha='f'.repeat(40);assert.throws(()=>verify(a),/SOURCE_BLOB_DRIFT/);
 const b=fixture();b.plan.tasks[1].wo='WO-NOT-AUTHORIZED';assert.throws(()=>verify(b),/UNKNOWN_TASK_WO/);
});
test('R79 missing or duplicated task associations never satisfy completeness',()=>{
 const a=fixture();a.register.candidates=[];assert.throws(()=>verify(a),/MAPPING_INCOMPLETE/);
 const b=fixture();b.intake.openIssues[0].id='GH-99';assert.throws(()=>verify(b),/UNKNOWN_SOURCE_OR_TASK|SOURCE_SCOPE_DRIFT|MAPPING_INCOMPLETE/);
});
test('R79 unauthorized promotion and missing dependencies are vetoed',()=>{
 const a=fixture();a.plan.tasks[1].authorization.approval='APPROVED';assert.throws(()=>verify(a),/FALSE_AUTHORITY/);
 const b=fixture();b.plan.tasks[1].deps=['TASK-PLAN-999'];assert.throws(()=>verify(b),/DEPENDENCY_MISSING/);
 const c=fixture();c.register.controls.kernelAdmission='APPROVED';assert.throws(()=>verify(c),/FALSE_KERNEL_OR_RELEASE/);
});
test('R79 proposed source name must match actual candidate record',()=>{
 const a=fixture();a.intake.openIssues[0].title='Other issue';assert.throws(()=>verify(a),/SOURCE_SCOPE_DRIFT/);
});
