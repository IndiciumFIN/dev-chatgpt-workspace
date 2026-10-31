#!/usr/bin/env node
/**
 * Candidate activity planner for the existing canonical PMO.
 * NO file mutations, shell execution, release approval, network or DB writes.
 * Decisions are derived from the versioned register, never inferred from an LLM.
 */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const DEFAULT_PMO='registers/pmo/queue.v1.json';
const STATUSES=new Set(['PAUSED','IN_PROGRESS','QUEUED','HOLD_HUMAN','DONE','BLOCKED']);
const PRIORITIES=new Set(['P0','P1','P2']);
const SHA=x=>createHash('sha256').update(x).digest('hex');
const isRecord=x=>!!x && typeof x==='object' && !Array.isArray(x);

export function validatePmo(q){
  const issues=[];
  if(!isRecord(q)||!Array.isArray(q.items)||!Array.isArray(q.events))return ['Invalid canonical PMO registry'];
  if(q.readOnly!==true)issues.push('PMO readOnly invariant violated');
  if(q.canonicalSource!==DEFAULT_PMO)issues.push('Unexpected PMO authority');
  const ids=new Set();
  for(const [n,item] of q.items.entries()){
    if(!item||typeof item.id!=='string'||ids.has(item.id))issues.push('Missing or duplicate WO at index '+n);
    ids.add(item?.id);
    if(item.order!==n)issues.push('Unordered WO '+item.id);
    if(!STATUSES.has(item.status))issues.push('Unknown state '+item.id);
    if(!PRIORITIES.has(item.priority))issues.push('Unknown priority '+item.id);
    if(!Array.isArray(item.dependencies)||!Array.isArray(item.evidence))issues.push('Missing dependencies/evidence '+item.id);
  }
  const last=new Map();
  for(const [i,event] of q.events.entries()){
    if(event.seq!==i+1||!ids.has(event.workId)||!STATUSES.has(event.to))issues.push('Invalid PMO event '+(i+1));
    last.set(event.workId,event.to);
  }
  for(const item of q.items){
    if(Array.isArray(item.dependencies))for(const dep of item.dependencies)if(!ids.has(dep)||dep===item.id)issues.push('Invalid dependency '+item.id+':'+dep);
    if(last.has(item.id)&&last.get(item.id)!==item.status)issues.push('Current state differs from event history '+item.id);
    if(item.status==='DONE'&&(!Array.isArray(item.evidence)||item.evidence.length===0))issues.push('DONE without evidence '+item.id);
    if(item.status==='DONE'&&Array.isArray(item.dependencies)&&item.dependencies.some(dep=>q.items.find(other=>other.id===dep)?.status!=='DONE'))issues.push('DONE with unfinished dependency '+item.id);
  }
  // The read-only planner must never silently turn an unapproved release into a candidate.
  const homologation=q.items.find(item=>item.id==='WO-HOM-001');
  if(homologation&&homologation.status!=='HOLD_HUMAN')issues.push('Release HOLD bypassed');
  // Graph integrity: reject cycles, even when all references are valid.
  const visiting=new Set(),visited=new Set();
  const byId=new Map(q.items.map(i=>[i.id,i]));
  function visit(id){
    if(visiting.has(id)){issues.push('Dependency cycle involving '+id);return;}
    if(visited.has(id))return;
    visiting.add(id);
    for(const dep of byId.get(id)?.dependencies||[])if(byId.has(dep))visit(dep);
    visiting.delete(id);visited.add(id);
  }
  for(const id of ids)if(typeof id==='string')visit(id);
  return [...new Set(issues)];
}

export function buildActivityView(q,sourceHash){
  const errs=validatePmo(q);if(errs.length)throw Error('PMO validation failed: '+errs.join(' | '));
  const byId=new Map(q.items.map(i=>[i.id,i]));
  const activities=q.items.map(item=>{
    const unmet=item.dependencies.filter(id=>byId.get(id).status!=='DONE');
    const disposition=item.status==='DONE'?'CLOSED':item.status==='HOLD_HUMAN'?'HOLD_HUMAN':item.status==='BLOCKED'?'BLOCKED':item.status==='PAUSED'?'PAUSED':item.status==='IN_PROGRESS'?'ACTIVE_WITH_SCOPE_LIMITS':unmet.length?'WAITING_DEPENDENCIES':'CANDIDATE_FOR_PREFLIGHT';
    return {id:item.id,order:item.order,priority:item.priority,status:item.status,disposition,
      dependencies:item.dependencies,unmetDependencies:unmet,hasEvidence:item.evidence.length>0,
      owner:item.owner,title:item.title,criteria:item.criteria,next:item.next,
      policy:'WO + validated policy + validator + independent approval required before mutations',
      grantedActions:['read','prepare_candidate','validate_candidate'],
      deniedActions:['write_to_main','modify_database','publish','execute_without_admission']};
  });
  const counts={};for(const a of activities)counts[a.disposition]=(counts[a.disposition]||0)+1;
  return {schemaVersion:'1.0.0',kind:'CE_GOVERNED_ACTIVITIES_CANDIDATE',source:DEFAULT_PMO,
    sourceSha256:sourceHash,registerRevision:q.revision,release:'HOLD_HUMAN',remoteWriteAuthorized:false,
    deploymentAuthorized:false,activities,counts};
}

function compactProposal(a,view){
  if(!a)throw Error('Unknown WO');
  return {schemaVersion:'1.0.0',kind:'ACTIVITY_PROPOSAL_ONLY',sourceSha256:view.sourceSha256,
    workOrderId:a.id,priority:a.priority,owner:a.owner,disposition:a.disposition,
    goal:a.title,acceptance:a.criteria,unmetDependencies:a.unmetDependencies,
    requiredChain:['FIND','policy','validator','WO','OPA','Kernel admission','isolated execution','tests','independent audit'],
    candidateTasks:[
      {step:'inspect',mode:'READ_ONLY',output:'grounded inventory with hashes'},
      {step:'prepare',mode:'LOCAL_CANDIDATE',output:'patch/schema/test proposal, without applying it'},
      {step:'validate',mode:'READ_ONLY',output:'PASS/FAIL/HOLD with exact evidence and SHA'}
    ],executionAllowed:false,publishAllowed:false};
}

export function safeDeepSeekRequest(a){
  // Only non-sensitive, constrained metadata. No prompts, source text, rights-managed content or patient data.
  return {work_order_id:a.id,priority:a.priority,disposition:a.disposition,
    pending_dependency_count:a.unmetDependencies.length,
    task:'Suggest generic verification microtasks in JSON for a software governance workflow; no code execution.'};
}

export function parseCli(args){
  const allowed=new Set(['scan','plan','validate','report','assist']);
  const command=args[0]||'report';if(!allowed.has(command))throw Error('Unknown command. Use scan|plan|validate|report|assist');
  const ids=args.filter(a=>a.startsWith('--wo=')).map(a=>a.slice(5));
  if(ids.length>1)throw Error('Only one WO at a time');
  const options=new Set(args.slice(1));
  const recognized=a=>a==='--send'||a==='--confirm-public-metadata'||a.startsWith('--wo=');
  const unknown=args.slice(1).filter(a=>!recognized(a));if(unknown.length)throw Error('Unknown option: '+unknown.join(','));
  return {command,wo:ids[0]??null,send:options.has('--send'),confirmed:options.has('--confirm-public-metadata')};
}

export async function run(args,{read=readFileSync,env=process.env,transport=fetch}={}){
  const {command,wo,send,confirmed}=parseCli(args);
  const content=read(DEFAULT_PMO,'utf8');
  const q=JSON.parse(content);const issues=validatePmo(q);
  if(command==='validate')return {ok:issues.length===0,issues,revision:q.revision,sourceSha256:SHA(content)};
  if(issues.length)throw Error('Invalid PMO: '+issues.join(' | '));
  const view=buildActivityView(q,SHA(content));
  const a=wo?view.activities.find(x=>x.id===wo):null;
  if(wo&&!a)throw Error('Unknown WO '+wo);
  if(command==='scan')return {sourceSha256:view.sourceSha256,counts:view.counts,activities:view.activities.map(x=>({id:x.id,status:x.status,disposition:x.disposition,unmetDependencies:x.unmetDependencies}))};
  if(command==='report')return view;
  if(command==='plan'){
    if(!a)throw Error('plan requires --wo=WO-...');
    return compactProposal(a,view);
  }
  if(command==='assist'){
    if(!a)throw Error('assist requires --wo=WO-...');
    const request=safeDeepSeekRequest(a);
    if(!send)return {status:'PREVIEW_ONLY',request,apiCall:false,notice:'Only an explicit --send --confirm-public-metadata can transfer metadata to DeepSeek.'};
    if(!confirmed)throw Error('Explicit --confirm-public-metadata required for third-party transfer');
    if(!env.DEEPSEEK_API_KEY)throw Error('DEEPSEEK_API_KEY is not set; no call performed');
    if(!/^[A-Za-z0-9_-]{1,80}$/.test(a.id))throw Error('Invalid WO identifier');
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),20000);
    try{
      const response=await transport('https://api.deepseek.com/chat/completions',{
        method:'POST',signal:controller.signal,headers:{Authorization:'Bearer '+env.DEEPSEEK_API_KEY,'Content-Type':'application/json'},
        body:JSON.stringify({model:'deepseek-flash',stream:false,max_tokens:800,response_format:{type:'json_object'},
          messages:[{role:'system',content:'Return JSON only: {"microtasks":[{"description":"...","verification":"..."}]}. Suggest at most 3 read-only governance checks. You have no tools or write authority. Never declare approval.'},
            {role:'user',content:JSON.stringify(request)}]})});
      if(!response.ok)throw Error('DeepSeek HTTP '+response.status);
      const data=await response.json();
      if(data.choices?.[0]?.finish_reason!=='stop')throw Error('Incomplete provider response');
      const parsed=JSON.parse(data.choices[0]?.message?.content??'null');
      if(!isRecord(parsed)||!Array.isArray(parsed.microtasks)||parsed.microtasks.length>3||parsed.microtasks.some(t=>!isRecord(t)||typeof t.description!=='string'||typeof t.verification!=='string'))throw Error('Invalid candidate JSON from provider');
      return {status:'UNTRUSTED_CANDIDATE_ONLY',workOrderId:a.id,provider:'DeepSeek',
        microtasks:parsed.microtasks.map(t=>({description:t.description.slice(0,500),verification:t.verification.slice(0,500),executionAllowed:false})),
        remoteWrites:0,approved:false,sourceSha256:view.sourceSha256};
    }finally{clearTimeout(timer)}
  }
  throw Error('Unhandled command');
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{const data=await run(process.argv.slice(2));console.log(JSON.stringify(data,null,2));if(data?.ok===false)process.exitCode=1}
  catch(error){console.error('FAIL GOV ACTIVITIES:',error.message);process.exitCode=1}
}