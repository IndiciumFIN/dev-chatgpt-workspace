#!/usr/bin/env node
/**
 * R78: independently compare 32 pending-source declarations with task coverage.
 * Advisory only: a task covers an identifier; it does not prove FIND/policy/validator/Kernel.
 * No GitHub/DB writes or externally fetched source contents.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { createHash } from 'node:crypto';

const args=process.argv.slice(2);
const flag=(name,otherwise)=>{const at=args.indexOf(name);return at<0?otherwise:args[at+1];};
const root=resolve(flag('--root','.'));
const out=flag('--output',null);
const paths={
  queue:'registers/pmo/queue.v1.json',
  intake:'registers/pmo/cross-source-pending-intake.v1.json',
  plan:'docs/PLAN-TASKS-PMOKERNEL-v0.1.0.json'
};
function load(rel) { const body=readFileSync(join(root,rel));return {json:JSON.parse(body.toString('utf8')),sha256:createHash('sha256').update(body).digest('hex')}; }
function valid(yes,code){ if(!yes)throw Error(code); }
export function assess({queue,intake,plan}){
 valid(Array.isArray(queue?.items)&&queue.items.length>0,'QUEUE_INVALID');
 valid(Array.isArray(intake?.simulados)&&Array.isArray(intake?.openIssues)&&Array.isArray(intake?.coverageGaps),'INTAKE_INVALID');
 valid(Array.isArray(plan?.tasks)&&plan.tasks.length>0,'TASKS_INVALID');
 const ids=new Set(queue.items.map(w=>w.id));
 valid(ids.size===queue.items.length,'DUPLICATE_WO_ID');
 const taskIds=new Set(plan.tasks.map(t=>t.id));
 valid(taskIds.size===plan.tasks.length,'DUPLICATE_TASK_ID');
 valid(plan.tasks.every(t=>ids.has(t.wo)),'TASK_WO_NOT_PRESENT');
 const tasks=plan.tasks.filter(t=>!['SUPERSEDED','CANCELLED'].includes(t.status));
 const items=[
   ...intake.simulados.map(x=>({...x,group:'simulados'})),
   ...intake.openIssues.map(x=>({...x,group:'issue'})),
 ];
 const recordIds=new Set();
 const rows=items.map(item=>{
   const id=String(item.id??'');
   const key=item.group+':'+id;
   valid(id.length>0&&!recordIds.has(key),'DUPLICATE_OR_EMPTY_PENDING_ID');
   recordIds.add(key);
   const num=item.group==='issue'?(item.number??id.replace(/^(?:GH|ISSUE)-/,'')):null;
   const aliases=new Set([id,item.group+':'+id,...(num?[String('GH-'+num),String('ISSUE-'+num)]:[])]);
   const matching=tasks.filter(t=>Array.isArray(t.covers)&&t.covers.some(c=>aliases.has(c)));
   const candidateWos=[...new Set(matching.filter(t=>t.id!=='TASK-PLAN-013').map(t=>t.wo))].sort();
   const sourceWo=typeof item.wo==='string'?item.wo:'UNRECONCILED';
   const sourceWoVerified=ids.has(sourceWo);
   const missing=[];
   if(!sourceWoVerified)missing.push('SOURCE_WO_UNRECONCILED');
   if(!matching.length)missing.push('TASK_COVERAGE_MISSING');
   if(!candidateWos.length&&!sourceWoVerified)missing.push('DOMAIN_WO_CANDIDATE_MISSING');
   // Neither the candidate intake nor this task registry has per-item signed
   // evidence sufficient to certify policy, validators, findings or admission.
   missing.push('FIND_BINDING_NOT_VERIFIED','POLICY_BINDING_NOT_VERIFIED','VALIDATOR_BINDING_NOT_VERIFIED','KERNEL_ADMISSION_NOT_VERIFIED');
   return {key,id,group:item.group,sourceWo,sourceWoVerified,
     taskIds:matching.map(t=>t.id).sort(),candidateDomainWos:candidateWos,
     taskCovered:matching.length>0,authorityStatus:'HOLD_HUMAN',
     missingEvidence:missing};
 });
 const counts={
   total:rows.length,simulados:intake.simulados.length,issues:intake.openIssues.length,
   taskCovered:rows.filter(r=>r.taskCovered).length,
   sourceWoUnreconciled:rows.filter(r=>!r.sourceWoVerified).length,
   domainCandidateUnmapped:rows.filter(r=>r.candidateDomainWos.length===0&&!r.sourceWoVerified).length,
   kernelAdmitted:0,unresolvedAuthority:rows.filter(r=>r.authorityStatus==='HOLD_HUMAN').length,
   openGaps:intake.coverageGaps.filter(g=>g.status==='OPEN').length
 };
 return {schemaVersion:'1.0.0',recordType:'ADVISORY_SOURCE_LINEAGE_AUDIT',candidateOnly:true,
  counts,records:rows,releaseGate:'HOLD_HUMAN',mainUpdated:false,approvedMappings:0,
  evidenceSemantics:'TASK_COVERAGE_DOES_NOT_PROVE_FIND_POLICY_VALIDATOR_OR_KERNEL',
  sourceWos:queue.items.map(x=>x.id)};
}
function main(){
 const sources=Object.fromEntries(Object.entries(paths).map(([key,path])=>[key,load(path)]));
 const result=assess({queue:sources.queue.json,intake:sources.intake.json,plan:sources.plan.json});
 result.sourceHashes=Object.fromEntries(Object.entries(sources).map(([key,val])=>[key,val.sha256]));
 if(result.counts.total!==result.counts.simulados+result.counts.issues)throw Error('INCOMPLETE_PENDING_RECORDS');
 if(result.counts.taskCovered!==result.counts.total)throw Error('COVERAGE_MISSING');
 if(result.counts.kernelAdmitted!==0||result.releaseGate!=='HOLD_HUMAN')throw Error('FALSE_ADMISSION');
 if(out){const dest=resolve(out);mkdirSync(dirname(dest),{recursive:true});writeFileSync(dest,JSON.stringify(result,null,2)+'\n');}
 console.log('[pending-lineage] '+JSON.stringify(result.counts));
 console.log('[pending-lineage] task coverage != authority; release HOLD_HUMAN');
}
if(process.argv[1] && import.meta.url.endsWith(process.argv[1].replaceAll('\\','/')))main();
