#!/usr/bin/env node
/** Read-only, reproducible canonical-main candidate inventory. No Git writes, merge, or deploy. */
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { validateMigrationManifest, parseTree, parseNameStatus, classifyCandidateRisk, detectMainMigrationCollisions, historicalMigrationSources, currentMigrationScope } from './lib/main-migration-core.mjs';

const manifestPath='registers/governance/main-migration-scope.v1.json';
const reportPath=process.argv.includes('--output')
  ? process.argv[process.argv.indexOf('--output')+1]
  : 'audit-evidence/main-migration/runtime-report.json';
const strict=process.argv.includes('--require-promotable');
const current=process.argv.includes('--current-ce-cohort');
const cohortPath='registers/governance/ce-branch-live-cohort-20261121.v1.json';
if(!reportPath || reportPath.startsWith('-'))throw Error('INVALID_REPORT_PATH');
const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
const contractErrors=validateMigrationManifest(manifest);
if(contractErrors.length){console.error('[main-migration] INVALID_SCOPE '+contractErrors.join(','));process.exit(2);}
function git(...args){
  return execFileSync('git',args,{encoding:'utf8',maxBuffer:40*1024*1024,stdio:['ignore','pipe','pipe']}).trimEnd();
}
function rawGit(...args){
  return execFileSync('git',args,{encoding:'utf8',maxBuffer:40*1024*1024,stdio:['ignore','pipe','pipe']});
}
function tree(ref){
  return parseTree(rawGit('ls-tree','-r','-z',ref));
}
function rev(ref){return git('rev-parse','--verify',ref);}
function remoteBranchRefs(){
  const refs=new Map();
  for(const line of git('for-each-ref','--format=%(refname:short) %(objectname)','refs/remotes/origin').split('\n')) {
    if(!line) continue;
    const m=/^origin\/([^ ]+) ([a-f0-9]{40,64})$/.exec(line);
    if(!m) throw Error('INVALID_REMOTE_REF:'+line);
    if(m[1]==='HEAD') continue;
    if(refs.has(m[1])) throw Error('DUPLICATE_REMOTE_REF:'+m[1]);
    refs.set(m[1],m[2]);
  }
  return refs;
}
const mainRef='refs/remotes/origin/main';
const sourceRefsBefore=remoteBranchRefs();
const currentScope=current?currentMigrationScope(JSON.parse(readFileSync(cohortPath,'utf8')),manifest):null;
const declared=currentScope?.branches??manifest.branches;
const baselineMain=currentScope?.mainSha??manifest.main.observedSha;
const scopedHeads=current?new Map([...sourceRefsBefore].filter(([name])=>!name.startsWith('wutrib/'))):sourceRefsBefore;
const snapshotDrift=[];
const mainSha=rev(mainRef);
// Reuse the canonical Python verifier. Never infer retirement from a missing ref.
const retiredRows=JSON.parse(execFileSync('python3',['-c',
  'import json,runpy; from pathlib import Path; p=Path("registers/governance/ce-branch-live-cohort-20261121.v1.json"); d=json.loads(p.read_text()); runpy.run_path("scripts/ce-branch-closure.py")["validate_retirement"](d,Path(".")); print(json.dumps([[r["branch"],r["source_sha"]] for r in d["technical_retirement"]["rows"] if r["state"]=="RETIRED_TECHNICAL"]))'
],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));
const verifiedRetired=new Map(retiredRows);
for(const [name,sha] of verifiedRetired){
  if(rev(sha+'^{commit}')!==sha)throw Error('RETIRED_SHA_UNAVAILABLE:'+name);
  git('merge-base','--is-ancestor',sha,mainSha);
}
const {retired,population,activeCount,historicalObserved:observedNames}=historicalMigrationSources(declared,scopedHeads,verifiedRetired);
const mainFiles=tree(mainRef);
const groups=[];
const failures=[];
for(const name of population.untracked) failures.push({branch:name,code:'UNTRACKED_REMOTE_BRANCH'});
for(const name of population.missing) failures.push({branch:name,code:'MANIFEST_BRANCH_MISSING_FROM_REMOTE'});
if(population.duplicates) failures.push({code:'DUPLICATE_BRANCH_POPULATION'});
if(mainSha!==baselineMain) (current?snapshotDrift:failures).push({code:'MAIN_SHA_DRIFT',previous:baselineMain,current:mainSha});
const sourceEntries=[...declared,...population.untracked.map(name=>({name,category:'UNCLASSIFIED_HOLD',status:null}))];
for(const src of sourceEntries){
  const ref=retired.get(src.name)??('refs/remotes/origin/'+src.name);
  let branchSha;
  try{branchSha=rev(ref);}catch {failures.push({branch:src.name,code:'SOURCE_BRANCH_NOT_FETCHED'});continue;}
  if(current&&src.observedSha&&branchSha!==src.observedSha) snapshotDrift.push({branch:src.name,code:'SOURCE_SHA_DRIFT',previous:src.observedSha,current:branchSha});
  const branchFiles=tree(branchSha);
  let mergeBase=null;
  try{mergeBase=git('merge-base',mainRef,ref);}catch { /* unrelated history is explicitly permitted for audit only */ }
  let records=[];
  let ahead=null, behind=null;
  if(mergeBase){
    ahead=Number(git('rev-list','--count',mainRef+'..'+ref));
    behind=Number(git('rev-list','--count',ref+'..'+mainRef));
    records=parseNameStatus(rawGit('diff','--name-status','-z',mergeBase,ref));
  }else{
    // No common ancestor: inventory every nonidentical path. Never force-merge.
    records=[...branchFiles.keys()].filter(path=>mainFiles.get(path)!==branchFiles.get(path)).map(path=>({path,status:'A'}));
  }
  const paths=records.map(record=>{
    const blob=branchFiles.get(record.path) ?? null;
    const current=mainFiles.get(record.path) ?? null;
    const alreadyInMain=blob===current;
    return {...record,blob,alreadyInMain,risk:classifyCandidateRisk(record.path)};
  });
  const currentStatus=!mergeBase?'no_common_ancestor':ahead===0?'behind':behind===0?'ahead':'diverged';
  if(src.status && currentStatus!==src.status)failures.push({branch:src.name,code:'DRIFTED_BRANCH_STATUS',previous:src.status,current:currentStatus});
  groups.push({
    branch:src.name,sha:branchSha,category:src.category,sourceRefKind:retired.has(src.name)?'RETIRED_PINNED_SHA':'LIVE_REMOTE_REF',
    ahead,behind,baseSha:mergeBase,status:currentStatus,
    filesTotal:branchFiles.size,
    changedPaths:paths.length,
    alreadyIdenticalInMain:paths.filter(x=>x.alreadyInMain).length,
    pendingPaths:paths.filter(x=>!x.alreadyInMain).length,
    paths,
  });
}
const sourceRefsAfter=remoteBranchRefs();
for(const [name,sha] of sourceRefsBefore) {
  if(sourceRefsAfter.get(name)!==sha) failures.push({branch:name,code:'BRANCH_MOVED_OR_REMOVED_DURING_AUDIT',previous:sha,current:sourceRefsAfter.get(name)??null});
}
for(const [name,sha] of sourceRefsAfter) {
  if(!sourceRefsBefore.has(name)) failures.push({branch:name,code:'BRANCH_CREATED_DURING_AUDIT',current:sha});
}
const {collisions,duplicates,distinctPaths}=detectMainMigrationCollisions(groups);
const riskTotals={};
let totalPendingPaths=0, totalIdentical=0;
for(const g of groups)for(const x of g.paths) {
  if(x.alreadyInMain)totalIdentical++;
  else {totalPendingPaths++;riskTotals[x.risk]=(riskTotals[x.risk]??0)+1;}
}
const report={
  schemaVersion:'1.0.0',
  reportType:'READ_ONLY_CANDIDATE_NOT_RELEASE',
  repository:manifest.repository,
  scopeId:current?'CE.BRANCH.COHORT.v1':manifest.recordId,
  auditMode:current?'CURRENT_CE_COHORT_READ_ONLY':'HISTORICAL_STRICT',
  snapshotDrift,
  excludedWutrib:current?[...sourceRefsBefore.keys()].filter(name=>name.startsWith('wutrib/')).sort():[],
  main:{sha:mainSha,expected:baselineMain,changedSinceSnapshot:mainSha!==baselineMain},
  branchPopulation:population,
  remoteBranchHeads:Object.fromEntries(sourceRefsBefore),
  retiredHistoricalSources:Object.fromEntries(retired),
  summary:{
    branchesExpected:declared.length,branchesObserved:observedNames.length,branchesInspected:groups.length,
    activeRemoteBranchesObserved:activeCount,retiredHistoricalSourcesObserved:retired.size,
    sourceCoverageComplete:population.complete && groups.length===observedNames.length && failures.length===0,
    sourceFailures:failures.length,
    totalSourceChangePaths:totalPendingPaths+totalIdentical,
    sourcePathsAlreadyIdenticalInMain:totalIdentical,
    pendingSourcePaths:totalPendingPaths,
    distinctPendingPaths:distinctPaths,
    collisionPaths:collisions.length,duplicatePaths:duplicates.length,
    riskTotals,
    unresolvedFormalGaps:manifest.knownBlockers.filter(x=>x.status==='OPEN').length,
  },
  branches:groups,
  collisions,duplicates,failures,
  limitations:[
    'Git blob equality only: identical content does not prove clinical, editorial or legal validity',
    'A changed path is not a verified deployed route, normalized knowledge atom or complete Drive/Supabase source',
    'PR approvals, Kernel admission, ownership, RLS, licenses and review remain separate release gates',
    'Branches without common ancestor are read-only candidates, never merge targets',
    'No changes made to main, production Supabase, protected policies or source branches',
  ],
  releaseGate:'HOLD_HUMAN',
  migrationComplete:false,
};
mkdirSync(dirname(reportPath),{recursive:true});
writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
console.log('[main-migration] '+JSON.stringify(report.summary));
console.log('[main-migration] report='+reportPath);
console.log('[main-migration] collisions='+collisions.length+' missing/drift='+failures.length+' gate=HOLD_HUMAN');
if(strict)process.exit(2);
if(failures.length){console.error('[main-migration] FAIL_CLOSED '+JSON.stringify(failures));process.exit(1);}
