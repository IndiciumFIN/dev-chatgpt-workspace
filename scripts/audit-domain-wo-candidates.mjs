#!/usr/bin/env node
/** R79: deterministic, fail-closed, read-only proof of 31 proposed domain WO links.
 * A proposed task is NOT a verified source WO, FIND, validator or Kernel admission.
 */
import {readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
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
 guard(register.baseline.sourceBlobSha===sourceSha && register.baseline.queueBlobSha===queueSha && register.baseline.taskPlanBlobSha===planSha,'SOURCE_BLOB_DRIFT');
 guard(plan.r79CandidateMapping?.sourceRegistryBlobSha===sourceSha && plan.r79CandidateMapping?.queueBlobSha===queueSha,'PLAN_SOURCE_DRIFT');
 guard(plan.r79CandidateMapping?.baselineTasks===register.coverage.oldPlanTasks,'BASELINE_TASK_DRIFT');
 guard(plan.tasks.length===register.coverage.currentPlanTasks && plan.tasks.length===register.coverage.oldPlanTasks+unresolved.length,'PLAN_COUNT_DRIFT');
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
