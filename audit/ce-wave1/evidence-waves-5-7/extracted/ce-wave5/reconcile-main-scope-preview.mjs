#!/usr/bin/env node
/**
 * ONE-OFF REVIEW PROPOSAL for the EXISTING canonical main-migration register.
 * Makes NO GitHub writes, commits, merges, deploys, SQL calls or approvals.
 * Requires a complete local checkout and an external pinned HEAD snapshot.
 * Writes proposals only to a directory outside the checkout.
 */
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,realpathSync,existsSync} from 'node:fs';
import {resolve,relative,sep,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

export const SHA40=/^[a-f0-9]{40}$/;
export const VALID_STATUS=new Set(['ahead','behind','diverged','no_common_ancestor']);
const CANONICAL='registers/governance/main-migration-scope.v1.json';
const ORIGINAL_BLOB='04358511cdc2fe3ef08fa7007c8b7b88c47fdbb4';
const ADDED_CATEGORIES={
 'audit/ce-wave1-evidence-20261101':'audit',
 'revert-26-plan/pmokernel-finalization-20261031':'planning',
 'integration/structural-overlay-20261101':'integration',
};
const EXPECTED_REPO='IndiciumFIN/dev-chatgpt-workspace';
function fail(s){throw Error('HOLD_'+s)}
function git(root,...args){return execFileSync('git',['-C',root,...args],{encoding:'utf8',maxBuffer:100*1024*1024,timeout:60000}).trimEnd()}
function gitRaw(root,...args){return execFileSync('git',['-C',root,...args],{maxBuffer:100*1024*1024,timeout:60000})}
function relOutside(root,path){const r=relative(root,path);return r==='..'||r.startsWith('..'+sep)}
function countNullNames(raw){if(!raw.length)return 0;return raw.toString('utf8').split('\0').filter(Boolean).length}
export function classify(ahead,behind,hasAncestor){
 if(!hasAncestor)return 'no_common_ancestor';
 if(!Number.isSafeInteger(ahead)||!Number.isSafeInteger(behind)||ahead<0||behind<0)fail('INVALID_COMMIT_COUNTS');
 if(ahead===0&&behind===0)fail('SOURCE_IDENTICAL_TO_MAIN');
 if(ahead===0)return 'behind';
 if(behind===0)return 'ahead';
 return 'diverged';
}
export function propose(original,headMap,metrics){
 if(original?.recordId!=='CE-MAIN-CANONICAL-MIGRATION-SCOPE-20261031'|| original.releaseGate!=='HOLD_HUMAN'||original.repository!==EXPECTED_REPO)fail('CANONICAL_CONTRACT');
 if(!Array.isArray(original.branches)||original.branches.length!==original.sourceBranchesCount)fail('MALFORMED_ORIGINAL');
 const keys=Object.keys(headMap).sort();
 if(keys.length!==27||!SHA40.test(headMap.main))fail('EXPECTED_27_REFS');
 const expectedBranches=keys.filter(x=>x!=='main');
 if(new Set(original.branches.map(b=>b.name)).size!==original.branches.length)fail('DUPLICATE_ORIGINAL_BRANCH');
 const old=new Map(original.branches.map(b=>[b.name,b]));
 if([...old.keys()].some(x=>!expectedBranches.includes(x)))fail('ORIGINAL_BRANCH_REMOVED');
 const unknownAdditions=expectedBranches.filter(x=>!old.has(x)&&!(x in ADDED_CATEGORIES));
 if(unknownAdditions.length)fail('UNCLASSIFIED_ADDITIONS:'+unknownAdditions.join(','));
 if(Object.keys(ADDED_CATEGORIES).some(x=>!expectedBranches.includes(x)))fail('EXPECTED_BRANCH_MISSING');
 const counts={ahead:0,behind:0,diverged:0,no_common_ancestor:0};
 const updated=[]; const changes=[];
 for(const name of expectedBranches){
  const state=metrics[name];
  if(!state||!VALID_STATUS.has(state.status)||state.sha!==headMap[name])fail('UNTRUSTED_BRANCH_METRICS:'+name);
  const prior=old.get(name);
  const base=prior?structuredClone(prior):{
   name,category:ADDED_CATEGORIES[name],pr:name==='integration/structural-overlay-20261101'?'30':null,
   gate:'HOLD_HUMAN',source:'Verified local git, Wave 5 (candidate only)',limitations:'Not approved; reconciling all branches before application'
  };
  if(!base.category)fail('MISSING_CATEGORY:'+name);
  const priorState=prior?.status??null;
  base.status=state.status;
  base.ahead=state.ahead;
  base.behind=state.behind;
  base.changedFiles=state.changedFiles;
  // Preserve all original fields (category, PR, gate, provenance, limitations), and never infer approval.
  updated.push(base);
  counts[state.status]++;
  if(!prior||priorState!==state.status||prior.changedFiles!==state.changedFiles||prior.ahead!==state.ahead||prior.behind!==state.behind){
    changes.push({branch:name,added:!prior,previousStatus:priorState,status:state.status,previousChangedFiles:prior?.changedFiles??null,newChangedFiles:state.changedFiles});
  }
 }
 const manifest={...structuredClone(original),date:'2026-11-01',main:{...original.main,observedSha:headMap.main},sourceBranchesCount:26,classificationCounts:counts,branches:updated};
 if(manifest.branches.length!==26||updated.some(b=>b.gate!=='HOLD_HUMAN'&&b.gate!=='RECONCILE_ONLY'))fail('UNAUTHORIZED_GATE_CHANGE');
 if(manifest.releaseGate!=='HOLD_HUMAN'||manifest.knownBlockers?.some(b=>b.status!=='OPEN'&&b.status!=='CANDIDATE'))fail('EXISTING_HOLDS_MUTATED');
 const report={schemaVersion:1,type:'PREVIEW_ONLY_CANONICAL_SCOPE_RECONCILIATION',state:'HOLD_HUMAN',writesAuthorized:false,repository:EXPECTED_REPO,originalBlobSha:ORIGINAL_BLOB,baselineMain:original.main.observedSha,observedMain:headMap.main,branchCount:keys.length,sourceBranches:26,classificationCounts:counts,changedRecords:changes,unresolved:['Kernel admission', 'FIND/TASK/WO governance', 'content and cross-branch semantic collisions', 'protection of main', 'release approvals'],sourceHeads:headMap};
 return {manifest,report};
}
export function collect(root,pinned){
 if(!pinned||pinned.repository!==EXPECTED_REPO||!pinned.refs||Object.keys(pinned.refs).length!==27)fail('PINNED_HEADS_REQUIRED');
 const expected=pinned.refs;
 const remote={};
 const lines=git(root,'for-each-ref','--format=%(refname:short) %(objectname)','refs/remotes/origin').split('\n');
 for(const line of lines){if(!line)continue;const match=/^origin\/(.+) ([a-f0-9]{40})$/.exec(line);if(!match)fail('INVALID_REMOTE_REF');if(match[1]==='HEAD')continue;if(remote[match[1]])fail('DUPLICATE_REMOTE_REF');remote[match[1]]=match[2]}
 if(JSON.stringify(Object.keys(remote).sort())!==JSON.stringify(Object.keys(expected).sort()))fail('REF_POPULATION_DRIFT');
 for(const b of Object.keys(expected))if(!SHA40.test(expected[b])||remote[b]!==expected[b])fail('REF_SHA_DRIFT:'+b);
 const main='refs/remotes/origin/main';
 const originalBytes=gitRaw(root,'show',main+':'+CANONICAL);
 const originalSha=createHash('sha1').update(Buffer.from(`blob ${originalBytes.length}\0`)).update(originalBytes).digest('hex');
 if(originalSha!==ORIGINAL_BLOB)fail('CANONICAL_SOURCE_BLOB_DRIFT');
 const original=JSON.parse(originalBytes.toString('utf8'));
 const metrics={};
 for(const name of Object.keys(remote).filter(n=>n!=='main').sort()){
  const branch='refs/remotes/origin/'+name;
  let base=null;try{base=git(root,'merge-base',main,branch)}catch{ /* unrelated */ }
  if(!base){metrics[name]={sha:remote[name],status:'no_common_ancestor',ahead:null,behind:null,changedFiles:null};continue;}
  const ahead=Number(git(root,'rev-list','--count',main+'..'+branch));
  const behind=Number(git(root,'rev-list','--count',branch+'..'+main));
  const count=countNullNames(gitRaw(root,'diff','--name-only','-z',base,branch));
  metrics[name]={sha:remote[name],status:classify(ahead,behind,true),ahead,behind,changedFiles:count};
 }
 const remoteAfter={};
 for(const line of git(root,'for-each-ref','--format=%(refname:short) %(objectname)','refs/remotes/origin').split('\n')){
  if(!line)continue;const m=/^origin\/(.+) ([a-f0-9]{40})$/.exec(line);if(!m)fail('INVALID_REMOTE_REF_AFTER');if(m[1]!=='HEAD')remoteAfter[m[1]]=m[2];
 }
 if(JSON.stringify(remoteAfter)!==JSON.stringify(remote)){
  // Compare sorted records instead (git output order is stable but do not assume order).
  const a=Object.keys(remote).sort().map(k=>k+':'+remote[k]);const b=Object.keys(remoteAfter).sort().map(k=>k+':'+remoteAfter[k]);
  if(JSON.stringify(a)!==JSON.stringify(b))fail('REF_MOVED_DURING_AUDIT');
 }
 return propose(original,remote,metrics);
}
function main(){
 const args=process.argv.slice(2);
 if(args.includes('--apply')||args.includes('--commit')||args.includes('--push')||args.includes('--merge'))fail('NO_EXECUTION_PATH');
 if(args.length!==3)fail('USAGE_node_reconcile-main-scope-preview.mjs_REPO_ROOT_PINNED_HEADS_JSON_OUT_DIR');
 const root=realpathSync(resolve(args[0]));const heads=JSON.parse(readFileSync(resolve(args[1]),'utf8'));
 const dest=resolve(args[2]);
 if(!relOutside(root,dest))fail('OUTPUT_INSIDE_WORKTREE');
 if(git(root,'status','--porcelain'))fail('DIRTY_CHECKOUT');
 const headBefore=git(root,'rev-parse','HEAD');
 const {manifest,report}=collect(root,heads);
 if(git(root,'rev-parse','HEAD')!==headBefore||git(root,'status','--porcelain'))fail('WORKTREE_CHANGED_DURING_READONLY_AUDIT');
 if(existsSync(dest))fail('OUTPUT_DESTINATION_ALREADY_EXISTS');
 mkdirSync(dest,{recursive:true});
 writeFileSync(join(dest,'main-migration-scope.v1.candidate.json'),JSON.stringify(manifest,null,2)+'\n');
 writeFileSync(join(dest,'reconciliation-wave5.readonly-report.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({result:'PROPOSAL_ONLY_NO_EXECUTION',output:dest,sourceBranches:26,counts:report.classificationCounts,changed:report.changedRecords.length,releaseGate:'HOLD_HUMAN'},null,2));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))try{main()}catch(e){console.error(String(e.message));process.exitCode=2}
