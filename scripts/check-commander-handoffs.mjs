#!/usr/bin/env node
/** Deterministic, read-only: validates candidate lanes against the canonical PMO and existing agent schema. */
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export function checkCommanderHandoffs(data,pmo,schema){
 const issues=[],add=(cond,msg)=>{if(!cond)issues.push(msg)};
 if(!data || typeof data!=='object')return ['Invalid handoff data'];
 add(data.documentType==='COMMANDER_HANDOFF_CANDIDATE','Noncandidate handoff document');
 add(data.authority?.pmo==='registers/pmo/queue.v1.json','PMO authority mismatch');
 add(data.governance?.dispatchImplemented===false&&data.governance?.externalAgentsInvoked===false,'Remote dispatch is not implemented');
 add(data.governance?.remoteWritesAllowed===false&&data.governance?.mergeAllowed===false&&data.governance?.publicationAllowed===false,'Remote writes/merge/publication forbidden');
 add(['delivery-manifest.json','findings.json','validation.json','handoff.md'].every(f=>data.governance?.requiredOutputs?.includes(f)),'Missing required output');
 add(Array.isArray(data.lanes)&&data.lanes.length>0,'No lanes');
 const roles=new Set(schema?.properties?.maker_checker_auditor_role?.enum||[]);
 const types=new Set(schema?.properties?.agent_type?.enum||[]);
 const woIds=new Set(pmo?.items?.map(w=>w.id)||[]);
 const ids=new Set(),issuesUsed=new Set(),dirs=new Set();
 for(const lane of data.lanes||[]){
  add(typeof lane.id==='string'&&!ids.has(lane.id),'Duplicate agent id '+lane.id);ids.add(lane.id);
  add(roles.has(lane.role),'Noncanonical role '+lane.id);
  add(types.has(lane.agentType),'Noncanonical agent type '+lane.id);
  add(woIds.has(lane.workOrderId),'Unknown WO '+lane.id);
  add(typeof lane.issueUrl==='string'&&/^https:\/\/github\.com\/IndiciumFIN\/dev-chatgpt-workspace\/issues\/[0-9]+$/.test(lane.issueUrl)&&!issuesUsed.has(lane.issueUrl),'Bad/duplicate issue '+lane.id);issuesUsed.add(lane.issueUrl);
  add(lane.status==='CANDIDATE'&&lane.dispatched===false,'Agent falsely dispatched '+lane.id);
  add(typeof lane.sourceCommit==='string'&&/^[a-f0-9]{40}$/.test(lane.sourceCommit),'Invalid source commit '+lane.id);
  add(typeof lane.outputDir==='string'&&lane.outputDir.startsWith('docs/governance/commander/deliveries/')&&!dirs.has(lane.outputDir),'Bad/duplicate output directory '+lane.id);dirs.add(lane.outputDir);
  add(Array.isArray(lane.allowlist)&&lane.allowlist.every(v=>['read_repo','prepare_docs','prepare_candidate_json','report_findings'].includes(v)),'Forbidden tool '+lane.id);
  add(Array.isArray(lane.disallowed)&&['write_main','write_database','publish','deploy','approve_own_output'].every(v=>lane.disallowed.includes(v)),'Missing safety denylist '+lane.id);
  add(Array.isArray(lane.acceptance)&&lane.acceptance.length>=2,'Missing acceptance '+lane.id);
 }
 return issues;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const d=JSON.parse(readFileSync('registers/commander/lanes.v1.json','utf8'));
 const p=JSON.parse(readFileSync('registers/pmo/queue.v1.json','utf8'));
 const s=JSON.parse(readFileSync('contracts/cko-schemas/agent.schema.json','utf8'));
 const errors=checkCommanderHandoffs(d,p,s);
 if(errors.length){console.error('FAIL COMMANDER HANDOFF: '+errors.join(' | '));process.exitCode=1}
 else console.log('PASS COMMANDER HANDOFF: '+d.lanes.length+' lanes; linked canonical WOs; no remote dispatch/write');
}
