#!/usr/bin/env node
/** R78 evidence register guard; non-authoritative and strictly read-only. */
import {readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
export function validate(r,plan) {
 const fail=(code)=>{throw Error(code);};
 if(r?.schemaVersion!=='1.0.0'||r?.recordType!=='READ_ONLY_DIAGNOSTIC_AND_CANDIDATE_CORRECTIONS')fail('R78_SCHEMA_INVALID');
 if(!Array.isArray(plan?.tasks))fail('TASK_PLAN_DRIFT');
 const expansion=plan.r79CandidateMapping;
 const extra=expansion?.candidateTasksAdded??0;
 const expected=r?.baseline?.taskPlanCount+extra;
 if(!Number.isSafeInteger(extra)||extra<0||plan.tasks.length!==expected)fail('TASK_PLAN_DRIFT');
 if(extra){
  if(expansion.state!=='CANDIDATE_ONLY'||expansion.currentTasks!==expected||expansion.baselineTasks!==r.baseline.taskPlanCount||expansion.sourceRegistryBlobSha!==r.baseline.sourceIntake.blobSha||expansion.queueBlobSha?.length!==40||expansion.canonicalQueueMutated!==false||expansion.kernelAdmission!=='NOT_VERIFIED'||expansion.releaseGate!=='HOLD_HUMAN')fail('R79_CANDIDATE_UNVERIFIED');
  const proposed=plan.tasks.filter(t=>/^TASK-PLAN-0(?:5[9]|[6-8][0-9])$/.test(t.id));
  if(proposed.length!==extra||new Set(proposed.map(t=>t.id)).size!==extra||proposed.some(t=>t.status!=='PROPOSTO'||t.authorization?.mappingType!=='DOMAIN_WO_CANDIDATE'||t.authorization?.approval!=='NOT_APPROVED'||t.authorization?.kernelAdmission!=='NOT_VERIFIED'||t.authorization?.releaseGate!=='HOLD_HUMAN'))fail('R79_FALSE_CANDIDATE_AUTHORITY');
 }
 const taskIds=new Set(plan.tasks.map(t=>t.id));
 const validWos=new Set(['WO-PMO-001','WO-SEC-001','WO-GOV-TRANS-001','WO-CKO-001','WO-HOM-001']);
 if(!Array.isArray(r?.gaps)||r.gaps.length!==4)fail('GAP_COUNT_INCOMPLETE');
 if(r.gaps.map(g=>g.id).join(',')!=='GAP-01,GAP-02,GAP-03,GAP-04')fail('GAP_ORDER_INVALID');
 for(const gap of r.gaps){
  if(!gap.state.startsWith('OPEN_'))fail('FALSE_GAP_CLOSURE:'+gap.id);
  if(!validWos.has(gap.workOrder))fail('UNVERIFIED_WO:'+gap.id);
  if(!Array.isArray(gap.tasks)||!gap.tasks.length||gap.tasks.some(id=>!taskIds.has(id)))fail('TASK_NOT_FOUND:'+gap.id);
  if(!Array.isArray(gap.blocks)||!gap.blocks.length)fail('UNRECORDED_BLOCKER:'+gap.id);
  if(typeof gap.next!=='string'||gap.next.length<30)fail('MISSING_NEXT_ACTION:'+gap.id);
 }
 if(r.gaps[0].evidence.pendingTotal!==32||r.gaps[0].evidence.sourceWoUnreconciled!==31)fail('PENDING_SOURCE_DRIFT');
 if(r.gaps[0].evidence.kernelAdmissionsVerified!==0)fail('FALSE_KERNEL_ADMISSION');
 if(r.gaps[2].evidence.github.collisionPaths!==118||r.gaps[2].evidence.github.formalApprovals!==0)fail('FALSE_GITHUB_PROMOTION');
 if(r.gaps[3].evidence.oauth.rotation!=='NOT_DONE')fail('FALSE_SECRET_ROTATION');
 if(r.authority.kernelAdmission!=='NOT_VERIFIED'||r.authority.canonicalPmoRevision!=='NOT_ELECTED'||r.authority.releaseGate!=='HOLD_HUMAN'||r.authority.mainChangedByR78!==false||r.authority.noDatabaseWrites!==true)fail('FALSE_RELEASE_AUTHORITY');
 if(r.invariants.productionPromotionAllowed!==false||r.invariants.canonicalWosAdmitted!==0)fail('UNAUTHORIZED_PRODUCTION');
 return {gaps:r.gaps.length,tasks:plan.tasks.length,releaseGate:r.authority.releaseGate};
}
const filename=process.argv[1]?resolve(process.argv[1]):'';
if(filename===fileURLToPath(import.meta.url)) {
 const root=resolve(process.argv[2]??'.');
 const r=JSON.parse(readFileSync(join(root,'registers/governance/r78-gap-wo-execution-20261031.v1.json'),'utf8'));
 const plan=JSON.parse(readFileSync(join(root,'docs/PLAN-TASKS-PMOKERNEL-v0.1.0.json'),'utf8'));
 console.log('[check-r78] PASS '+JSON.stringify(validate(r,plan)));
}
