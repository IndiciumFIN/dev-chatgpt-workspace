#!/usr/bin/env node
/** R79: deterministic, fail-closed, read-only proof of 31 proposed domain WO links.
 * A proposed task is NOT a verified source WO, FIND, validator or Kernel admission.
 */
import {readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {checkR87Extension} from './validate-r87-task-extension.mjs';
function guard(ok,code){if(!ok)throw Error(code);}
export function gitBlobSha(raw){
 return createHash('sha1').update(Buffer.from('blob '+raw.length+'\0')).update(raw).digest('hex');
}
export function verify({intake,queue,plan,register,sourceSha,queueSha,planSha}){
 guard(Array.isArray(intake?.openIssues)&&Array.isArray(intake?.simulados),'INTAKE_INVALID');
 guard(Array.isArray(queue?.items)&&queue.items.length>0,'QUEUE_INVALID');
 guard(Array.isArray(plan?.tasks)&&plan.tasks.length>0,'PLAN_INVALID');
 guard(register?.recordType==='CANDIDATE_DOMAIN_WO_ASSIGNMENTS_NOT_ADMISSION','RECORD_INVALID');
 const woIds=new Set(queue.items.map(x=>x.id));
 const taskIds=new Set(plan.tasks.map(x=>x.id));
 guard(woIds.size===queue.items.length&&taskIds.size===plan.tasks.length,'DUPLICATE_INPUT_ID');
 guard(plan.tasks.every(t=>woIds.has(t.wo)),'UNKNOWN_TASK_WO');
 const sources=[...intake.openIssues.map(x=>({...x,sourceType:'issue'})),...intake.simulados.map(x=>({...x,sourceType:'simulados'}))];
 const sourceIds=new Set(sources.map(x=>x.id));
 guard(sourceIds.size===sources.length,'DUPLICATE_SOURCE_ID');
 const unresolved=sources.filter(x=>x.wo==='UNRECONCILED');
 const mapped=sources.filter(x=>x.wo!=='UNRECONCILED');
 const candidates=plan.tasks.filter(t=>t.authorization?.mappingType==='DOMAIN_WO_CANDIDATE');
 const links=register.candidates;
 guard(Array.isArray(links)&&links.length===unresolved.length&&candidates.length===unresolved.length,'MAPPING_INCOMPLETE');
 guard(new Set(links.map(x=>x.sourceId)).size===links.length,'DUPLICATE_MAPPED_SOURCE');
 guard(new Set(links.map(x=>x.proposedTask)).size===links.length,'DUPLICATE_MAPPED_TASK');
 // R79's initial plan blob is historical evidence, not a perpetual lock on
 // the entire planning document. Subsequent scoped task updates change its Git
 // blob while the 31 row-level mappings remain independently validated below.
 guard(register.baseline.sourceBlobSha===sourceSha && register.baseline.queueBlobSha===queueSha,'SOURCE_BLOB_DRIFT');
 guard(/^[a-f0-9]{40}$/.test(register.baseline.taskPlanBlobSha) && /^[a-f0-9]{40}$/.test(planSha),'INVALID_PLAN_BLOB_SHA');
 guard(plan.r79CandidateMapping?.sourceRegistryBlobSha===sourceSha && plan.r79CandidateMapping?.queueBlobSha===queueSha,'PLAN_SOURCE_DRIFT');
 guard(plan.r79CandidateMapping?.baselineTasks===register.coverage.oldPlanTasks,'BASELINE_TASK_DRIFT');
 // Historical R79 mapping covers exactly the initial 37+31 tasks.
 // Later specialist tasks may exist only through their separately guarded
 // provenance register; never redefine the original 31 candidate coverage.
 const historic=register.coverage.currentPlanTasks,addon=plan.r86SupplementalTaskIntake,scoped=plan.r87ScopedTaskExpansion;
 const additional=scoped ? scoped.extensionCount+(plan.r89ScopedTaskReconciliation?.additionalTaskCount??0) : addon?.additionalAuditTaskCount??0;
 guard(historic===register.coverage.oldPlanTasks+unresolved.length && Number.isSafeInteger(additional) && additional>=0 && plan.tasks.length===historic+additional,'PLAN_COUNT_DRIFT');
 if(scoped){
  guard(checkR87Extension(plan,woIds)===24,'R87_EXTENSION_INCOMPLETE');
 }else if(additional){
  const ids=['TASK-PLAN-090','TASK-PLAN-091','TASK-PLAN-092','TASK-PLAN-093'];
  guard(additional===4 && addon.state==='CANDIDATE_ONLY_NOT_KERNEL_ADMITTED' && addon.originalBaselineTasks===register.coverage.oldPlanTasks && addon.r79SourceCandidateTasks===unresolved.length && addon.resultingTaskCount===historic+additional && addon.sourceCommit==='d5ca82bf99499878a4b4c034078f9edd7089d9bf' && addon.approval==='NOT_APPROVED' && addon.kernelAdmission==='NOT_VERIFIED' && addon.releaseGate==='HOLD_HUMAN' && addon.authorizedWoStatusChanges===false && addon.additionalWosAdmitted===0,'UNVERIFIED_ADDITIONAL_AUDIT_TASKS');
  guard(Array.isArray(addon.tasks) && addon.tasks.length===4 && addon.tasks.map(t=>t.id).join(',')===ids.join(',') && plan.tasks.slice(historic).map(t=>t.id).join(',')===ids.join(','),'ADDITIONAL_TASK_IDS_DRIFT');
  for(const row of addon.tasks){
   const t=plan.tasks.find(v=>v.id===row.id);
   guard(t && t.status==='PROPOSTO' && row.status==='PROPOSTO' && t.wo===row.wo && woIds.has(row.wo) && t.title===row.title && JSON.stringify(t.artifacts)===JSON.stringify(row.artifacts) && t.artifacts?.length>0 && t.authorization?.approval!=='APPROVED' && t.authorization?.kernelAdmission!=='ADMITTED','ADDITIONAL_TASK_SCOPE_DRIFT:'+row.id);
  }
 }
 guard(register.coverage.sourcePendingTotal===sources.length && register.coverage.sourceUnreconciled===unresolved.length && register.coverage.alreadySourceWoMapped===mapped.length && register.coverage.newProposedTasks===unresolved.length,'COVERAGE_COUNT_DRIFT');
 guard(mapped.every(x=>woIds.has(x.wo)),'PREEXISTING_SOURCE_WO_INVALID');
 const sourceMap=new Map(unresolved.map(x=>[x.id,x]));
 const candidateMap=new Map(candidates.map(t=>[t.id,t]));
 for(const row of links){
  const src=sourceMap.get(row.sourceId), task=candidateMap.get(row.proposedTask);
  guard(!!src&&!!task,'UNKNOWN_SOURCE_OR_TASK:'+row.sourceId);
  guard(row.sourceType===src.sourceType && row.sourceTitle===src.title && row.sourceStatus==='UNRECONCILED','SOURCE_SCOPE_DRIFT:'+row.sourceId);
  guard(row.proposedWo===task.wo && woIds.has(row.proposedWo) && task.origin?.sourceId===row.sourceId && task.origin?.sourceTitle===src.title && task.origin?.sourceType===src.sourceType,'WO_OR_TITLE_MISMATCH:'+row.sourceId);
  guard(task.origin?.sourceBlobSha===sourceSha && row.sourceBlobSha===sourceSha,'SOURCE_LINEAGE_MISSING:'+row.sourceId);
  guard(task.covers?.length===1 && task.covers[0]===row.sourceId && task.status==='PROPOSTO','TASK_COVERAGE_NOT_SCOPED:'+row.sourceId);
  guard(Array.isArray(task.deps) && task.deps.length>0 && task.deps.every(id=>taskIds.has(id)) && row.dependsOn?.join('|')===task.deps.join('|'),'DEPENDENCY_MISSING:'+row.sourceId);
  guard(task.authorization?.approval==='NOT_APPROVED' && task.authorization?.kernelAdmission==='NOT_VERIFIED' && task.authorization?.releaseGate==='HOLD_HUMAN','FALSE_AUTHORITY:'+row.sourceId);
  guard(row.authorization==='NOT_APPROVED' && row.lineageStatus==='CANDIDATE_MATCH_BY_SCOPED_TECHNICAL_REVIEW','FALSE_MAPPING_APPROVAL:'+row.sourceId);
  guard(typeof row.evidenceUrl==='string' && row.evidenceUrl===task.artifacts?.[0] && /^https:\/\/github\.com\/IndiciumFIN\/dev-chatgpt-workspace\/(?:issues\/[0-9]+|pull\/[0-9]+)$/.test(row.evidenceUrl),'UNVERIFIED_ARTIFACT:'+row.sourceId);
 }
 guard(register.preserved.sourceIntakeModified===false&&register.preserved.officialPmoQueueModified===false&&register.preserved.allItemsRequireFindPolicyValidatorAndKernel===true,'FALSE_SOURCE_RECONCILIATION');
 guard(register.controls?.formalWorkOrdersAdmitted===0&&register.controls?.kernelAdmission==='NOT_VERIFIED'&&register.controls?.canonicalQueueElection==='NOT_ELECTED'&&register.controls?.releaseGate==='HOLD_HUMAN'&&register.controls?.mainChanged===false,'FALSE_KERNEL_OR_RELEASE');
 const domainCoverage=new Set(links.map(x=>x.sourceId));
 guard([...sourceMap.keys()].every(id=>domainCoverage.has(id)),'MISSING_DOMAIN_MAPPING');
 return {sourceTotal:sources.length,unresolvedSourceWos:unresolved.length,domainCandidates:candidates.length,unmappedDomainCandidates:unresolved.length-domainCoverage.size,formalAdmittedWos:0,releaseGate:'HOLD_HUMAN'};
}
export function load(root){
 const read=path=>{const raw=readFileSync(join(root,path));return {data:JSON.parse(raw.toString('utf8')),sha:gitBlobSha(raw)};};
 const source=read('registers/pmo/cross-source-pending-intake.v1.json');
 const queue=read('registers/pmo/queue.v1.json');
 const plan=read('docs/PLAN-TASKS-PMOKERNEL-v0.1.0.json');
 const register=read('registers/governance/r79-domain-wo-mapping-20261031.v1.json');
 return {intake:source.data,queue:queue.data,plan:plan.data,register:register.data,sourceSha:source.sha,queueSha:queue.sha,planSha:plan.sha};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root=resolve(process.argv[2]??'.');
 const result=verify(load(root));
 console.log('[R79-domain-wo] PASS '+JSON.stringify(result));
 console.log('[R79-domain-wo] candidate map only, no signed Kernel admission or release');
}
