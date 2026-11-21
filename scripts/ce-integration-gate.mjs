#!/usr/bin/env node
// CE integration gate: GitHub Actions evidence, never a clinical or deployment authorization.
import {readFileSync,writeFileSync,mkdirSync,appendFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const SHA=/^[0-9a-f]{40}$/i;
const ACTIONS_APP_ID=15368;
export const CHECK_POLICIES=Object.freeze([
 ['visual','.github/workflows/candidate-visual-validation.yml'],
 ['validate-curiosities','.github/workflows/curiosidades-mem-validation.yml'],
 ['mem-contracts','.github/workflows/curiosidades-mem.yml'],
 ['git-reconcile','.github/workflows/ce-live-branch-reconciliation.yml'],
 ['browser-p0-local-negative','.github/workflows/ce-live-branch-reconciliation.yml'],
 ['verify-candidate-regressions','.github/workflows/pmo-candidate-unit-regressions.yml']
]);
export function pullRequestPathGlobs(yaml) {
 if(typeof yaml!=='string')throw Error('INVALID_WORKFLOW_YAML');
 const lines=yaml.split(/\r?\n/);
 let pull=false,paths=false;const globs=[];
 for(const line of lines) {
  if(/^  pull_request:\s*$/.test(line)){pull=true;paths=false;continue;}
  if(!pull)continue;
  if(/^  [\w-]+:\s*$/.test(line)){if(paths)break;pull=false;continue;}
  if(/^    paths:\s*$/.test(line)){paths=true;continue;}
  if(!paths)continue;
  const m=line.match(/^      - ['"]?([^'"]+?)['"]?\s*$/);
  if(m){globs.push(m[1]);continue;}
  if(line.trim()&&!/^\s*#/.test(line))break;
 }
 if(globs.length===0)throw Error('WORKFLOW_PR_PATHS_NOT_VERIFIABLE');
 return globs;
}
export function matchesGlob(path,glob){
 if(!path||!glob) return false;
 let regex='^';
 for(let i=0;i<glob.length;i++){
  const ch=glob[i];
  if(ch==='*'&&glob[i+1]==='*'){regex+='.*';i++;continue;}
  if(ch==='*'){regex+='[^/]*';continue;}
  if(ch==='?'){regex+='[^/]';continue;}
  regex+=/[\\^$+?.()|[\]{}]/.test(ch)?'\\'+ch:ch;
 }
 return new RegExp(regex+'$').test(path);
}
export function requiredChecks(paths,workflowSources){
 if(!Array.isArray(paths)||paths.length===0)throw Error('NO_VERIFIED_CHANGE_PATHS');
 const checks=new Set(['verify']);
 for(const [name,file] of CHECK_POLICIES) {
  const globs=pullRequestPathGlobs(workflowSources[file]);
  if(paths.some(path=>globs.some(glob=>matchesGlob(path,glob))))checks.add(name);
 }
 return [...checks];
}
export function baselineWorkflowSources(candidateWorkflows,readBaseline){
 return Object.fromEntries(Object.entries(candidateWorkflows).map(([path,candidate])=>{
  const baseline=readBaseline(path);
  if(baseline!==null && typeof baseline!=='string')throw Error('UNTRUSTED_BASE_WORKFLOW');
  // A new workflow has no baseline file: require its candidate triggers, never discard them.
  return [path,baseline===null?candidate:baseline];
 }));
}
export function requiredAcrossBaselines(changedPaths,candidateWorkflows,baselineWorkflows){
 return [...new Set([...requiredChecks(changedPaths,candidateWorkflows),...requiredChecks(changedPaths,baselineWorkflows)])];
}
export function assessChecks({required,checkRuns,headSha}){
 if(!SHA.test(headSha))throw Error('UNVERIFIED_HEAD_SHA');
 if(!Array.isArray(required)||!required.includes('verify'))throw Error('MISSING_BASE_VERIFY_POLICY');
 if(!Array.isArray(checkRuns))throw Error('BAD_CHECK_RUNS');
 const tracked=new Set([...required,...CHECK_POLICIES.map(x=>x[0])]);
 const latest=new Map();
 for(const check of checkRuns) {
  if(!tracked.has(check.name)||check.head_sha!==headSha||check.app?.id!==ACTIONS_APP_ID)continue;
  if(!Number.isSafeInteger(check.id))throw Error('UNTRUSTED_CHECK_ID');
  const old=latest.get(check.name);
  if(!old||check.id>old.id)latest.set(check.name,check);
 }
 const names=new Set([...required,...latest.keys()]);
 const statuses=[...names].map(name=>{
  const check=latest.get(name),mandatory=required.includes(name);
  if(!check)return {name,mandatory,state:'MISSING'};
  const state=check.status!=='completed'?'PENDING':
    check.conclusion==='success'?'PASS':
    ['skipped','neutral'].includes(check.conclusion)?'NOT_APPROVED':'FAIL';
  return {name,mandatory,state};
 });
 const failed=statuses.filter(x=>x.state==='FAIL'||x.state==='NOT_APPROVED');
 const pending=statuses.filter(x=>x.state==='MISSING'||x.state==='PENDING');
 return {verdict:failed.length?'FAIL':pending.length?'PENDING':'PASS',
  statuses,counts:{pass:statuses.filter(x=>x.state==='PASS').length,failed:failed.length,pending:pending.length,total:statuses.length},
  clinical_approved:false,real_auth_approved:false,operational_db_approved:false,
  vercel_approved:false,semantic_approved:false,merge_authorized:false,release_authorized:false};
}
function changedPaths(baseSha,headSha){
 if(!SHA.test(baseSha)||!SHA.test(headSha))throw Error('BASE_OR_HEAD_SHA_INVALID');
 const stdout=execFileSync('git',['diff','--name-only','-z',baseSha,headSha],{cwd:ROOT,encoding:'utf8',maxBuffer:16*1024*1024});
 const paths=stdout.split('\0').filter(Boolean);
 if(paths.length===0)throw Error('EMPTY_COMMIT_DIFF');
 return paths;
}
function emit(result,runId){
 const output=resolve(ROOT,'audit-evidence/ce-integration-gate/verdict.json');
 mkdirSync(dirname(output),{recursive:true});
 const report={protocol:'CE.INTEGRATION.TECHNICAL.GATE.v1',
  source_head_sha:process.env.CE_PR_HEAD_SHA,run_id:runId, ...result};
 writeFileSync(output,JSON.stringify(report,null,2)+'\n');
 if(process.env.GITHUB_STEP_SUMMARY){
  const lines=['### CE — integration technical evidence (NOT clinical release)',
    '- PR head: '+report.source_head_sha,
    '- Checks passed: '+result.counts.pass+'/'+result.counts.total+'; failed: '+result.counts.failed+'; unresolved: '+result.counts.pending,
    '- Verdict: **'+result.verdict+'**; this is not platform completion.',
    '| Check | Required by changed paths | Status |','|---|---|---|',
    ...result.statuses.map(x=>'| '+x.name+' | '+(x.mandatory?'Yes':'Observed')+' | '+x.state+' |'),
    '- OAuth, operational DB, clinical rights, Vercel and semantic approval remain HOLD.',''];
  appendFileSync(process.env.GITHUB_STEP_SUMMARY,lines.join('\n'));
 }
 console.log('CE_INTEGRATION_GATE',JSON.stringify({head:report.source_head_sha,verdict:result.verdict,counts:result.counts,statuses:result.statuses}));
}
async function getCheckRuns(repo,headSha,token){
 const url='https://api.github.com/repos/'+repo+'/commits/'+headSha+'/check-runs?per_page=100';
 const response=await fetch(url,{headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw Error('GITHUB_CHECKS_READ_FAILED_'+response.status);
 const json=await response.json();
 if(!Array.isArray(json.check_runs)||json.total_count>100)throw Error('CHECK_RUNS_TRUNCATED_OR_INVALID');
 return json.check_runs;
}
async function main(){
 const repo=process.env.GITHUB_REPOSITORY,base=process.env.CE_PR_BASE_SHA,head=process.env.CE_PR_HEAD_SHA,token=process.env.GH_TOKEN;
 if(repo!=='IndiciumFIN/dev-chatgpt-workspace'||!token||!SHA.test(head)||!SHA.test(base))throw Error('UNTRUSTED_GATE_CONTEXT');
 const changed=changedPaths(base,head);
 const files=[...new Set(CHECK_POLICIES.map(x=>x[1]))];
 const sources=Object.fromEntries(files.map(p=>[p,readFileSync(resolve(ROOT,p),'utf8')]));
 // Union of base and proposed path policies: a PR cannot bypass checks by weakening triggers.
 const historical=baselineWorkflowSources(sources,(p)=>{
  const found=execFileSync('git',['ls-tree','-r','--name-only',base,'--',p],{cwd:ROOT,encoding:'utf8'}).trim();
  if(!found){console.log('CE_WORKFLOW_NEW_IN_CANDIDATE',p);return null;}
  if(found!==p)throw Error('BASE_WORKFLOW_PATH_AMBIGUOUS');
  return execFileSync('git',['show',base+':'+p],{cwd:ROOT,encoding:'utf8',maxBuffer:1024*1024});
 });
 const required=requiredAcrossBaselines(changed,sources,historical);
 console.log('CE_INTEGRATION_EXPECTED',JSON.stringify({head,count_changed_paths:changed.length,required}));
 for(let attempt=0;attempt<88;attempt++){
  const runs=await getCheckRuns(repo,head,token);
  const outcome=assessChecks({required,checkRuns:runs,headSha:head});
  if(outcome.verdict==='PASS'||outcome.verdict==='FAIL'){
   emit(outcome,process.env.GITHUB_RUN_ID||'');
   if(outcome.verdict==='FAIL')process.exitCode=1;
   return;
  }
  if(attempt%5===0)console.log('CE_INTEGRATION_PENDING',JSON.stringify({attempt,unresolved:outcome.statuses.filter(x=>x.state==='MISSING'||x.state==='PENDING').map(x=>x.name)}));
  if(attempt===87){emit({...outcome,verdict:'INCOMPLETE_TIMEOUT'},process.env.GITHUB_RUN_ID||'');process.exitCode=1;return;}
  await new Promise(resolve=>setTimeout(resolve,12000));
 }
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 main().catch(err=>{console.error('CE_INTEGRATION_GATE_ERROR',String(err.message||err));process.exitCode=1;});
}
