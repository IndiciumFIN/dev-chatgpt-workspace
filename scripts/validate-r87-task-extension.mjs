import {validateR89Reconciliation} from './validate-r89-task-reconciliation.mjs';
/** R87 source-scoped, non-authoritative verification of concurrent task intake.
 * Preserves the original 37+31 source mapping. No duplicate scope is admitted.
 */
export const HISTORIC_TASKS=68;
export const EXTENDED_TASK_IDS=Object.freeze(Array.from({length:24},(_,i)=>'TASK-PLAN-'+String(i+90).padStart(3,'0')));
export const DUPLICATE_PAIRS=Object.freeze([[94,108],[95,109],[96,110],[97,111],[98,112],[99,113]]);
const origin=['516a33b74b486494e80cbe429b1821b92ed315a6','c64b6e029776d92b64966b4184bfb227d12db2d9','c36967de651fe3196cc78b6430801ac6a67c803b'];
function bad(code){throw Error(code);}
export function checkR87Extension(plan,canonicalWoIds){
 const d=plan?.r87ScopedTaskExpansion;
 if(!d)return 0;
 if(d.recordType!=='CONCURRENT_AUDIT_TASKS_CANDIDATE_INTAKE'||d.state!=='CANDIDATE_ONLY_NOT_ADMITTED'||d.canonicalBaselineCount!==37||d.r79DomainCandidateCount!==31||d.extensionCount!==24||d.planTotal!==92||plan.tasks.length!==(plan.r89ScopedTaskReconciliation?112:92))bad('R87_POPULATION_DRIFT');
 if(JSON.stringify(d.sourceCommits)!==JSON.stringify(origin))bad('R87_PROVENANCE_DRIFT');
 if(d.approval!=='NOT_APPROVED'||d.kernelAdmission!=='NOT_VERIFIED'||d.authorizedWoStatusChanges!==false||d.originalR79MappingMutated!==false||d.formalTaskStatusPromotionAllowed!==false||d.releaseGate!=='HOLD_HUMAN')bad('R87_UNAUTHORIZED_PROMOTION');
 if(JSON.stringify(d.unadmittedWoIds)!==JSON.stringify(['WO-DS-001']))bad('R87_UNADMITTED_WO_DRIFT');
 const expect=EXTENDED_TASK_IDS;
 if(plan.tasks.slice(HISTORIC_TASKS,HISTORIC_TASKS+24).map(t=>t.id).join(',')!==expect.join(',')||d.tasks?.map(t=>t.id).join(',')!==expect.join(','))bad('R87_TASK_ID_SEQUENCE_DRIFT');
 if(!Array.isArray(d.duplicatedScopeCandidates)||d.duplicatedScopeCandidates.length!==6)bad('R87_DUPLICATE_SCOPE_LEDGER_INCOMPLETE');
 for(let i=0;i<6;i++){
  const p=d.duplicatedScopeCandidates[i],[a,b]=DUPLICATE_PAIRS[i],fmt=n=>'TASK-PLAN-'+String(n).padStart(3,'0');
  if(p.earlier!==fmt(a)||p.later!==fmt(b)||p.state!=='DUPLICATE_SCOPE_CANDIDATE_REQUIRES_HUMAN_RECONCILIATION')bad('R87_DUPLICATE_SCOPE_DRIFT');
 }
 for(let i=0;i<24;i++){
  const t=plan.tasks[HISTORIC_TASKS+i],p=d.tasks[i];
  const am=plan.r89ScopedTaskReconciliation?.amendments?.find(v=>v.id===t.id)?.changes;
  const oldStatus=am?.status??p.status;
  if(!['PROPOSTO','BLOCKED'].includes(t.status) && !(t.id==='TASK-PLAN-092'&&t.status==='DELIVERED_PENDING_GATE'))bad('R87_FALSE_TASK_COMPLETION:'+t.id);
  if(t.status!==oldStatus)bad('R87_FALSE_TASK_COMPLETION:'+t.id);
  if(t.title!==(am?.title??p.title)||t.wo!==p.wo||t.acceptance!==(am?.acceptance??p.acceptance)||JSON.stringify(t.deps??[])!==JSON.stringify(p.deps)||JSON.stringify(t.artifacts??[])!==JSON.stringify(p.artifacts))bad('R87_TASK_EVIDENCE_DRIFT:'+t.id);
  const isDs=t.wo==='WO-DS-001';
  if(isDs&&!['TASK-PLAN-102','TASK-PLAN-105'].includes(t.id))bad('R87_DS_WO_SCOPE_DRIFT');
  if(!canonicalWoIds.has(t.wo))bad('R87_UNKNOWN_TASK_WO:'+t.id);
  if(t.authorization?.approval==='APPROVED'||t.authorization?.kernelAdmission==='ADMITTED'||t.authorization?.releaseGate==='PASS')bad('R87_FALSE_WO_ADMISSION:'+t.id);
 }
 const dsRefs=plan.tasks.slice(HISTORIC_TASKS,HISTORIC_TASKS+24).filter(t=>t.wo==='WO-DS-001');
 if(dsRefs.length!==2||dsRefs.some(t=>!['TASK-PLAN-102','TASK-PLAN-105'].includes(t.id)))bad('R87_DS_WO_REFERENCE_DRIFT');
 // WO-DS-001 is an existing queue ID; its Kernel admission remains unverified.
 if(!canonicalWoIds.has('WO-DS-001'))bad('R87_DS_QUEUE_SOURCE_MISSING');
 if(plan.r89ScopedTaskReconciliation && validateR89Reconciliation(plan,canonicalWoIds)!==20)bad('R89_EXTENSION_INCOMPLETE');
 return 24;
}
