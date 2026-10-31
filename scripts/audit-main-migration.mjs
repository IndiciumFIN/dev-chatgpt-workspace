#!/usr/bin/env node
/** Read-only, reproducible canonical-main candidate inventory. No Git writes, merge, or deploy. */
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { validateMigrationManifest, parseTree, parseNameStatus, classifyCandidateRisk, detectMainMigrationCollisions } from './lib/main-migration-core.mjs';

const manifestPath='registers/governance/main-migration-scope.v1.json';
const reportPath=process.argv.includes('--output')
  ? process.argv[process.argv.indexOf('--output')+1]
  : 'audit-evidence/main-migration/runtime-report.json';
const strict=process.argv.includes('--require-promotable');
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
const mainRef='refs/remotes/origin/main';
const mainSha=rev(mainRef);
const mainFiles=tree(mainRef);
const groups=[];
const failures=[];
for(const src of manifest.branches){
  const ref='refs/remotes/origin/'+src.name;
  let branchSha;
  try{branchSha=rev(ref);}catch {failures.push({branch:src.name,code:'SOURCE_BRANCH_NOT_FETCHED'});continue;}
  const branchFiles=tree(ref);
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
  if(currentStatus!==src.status)failures.push({branch:src.name,code:'DRIFTED_BRANCH_STATUS',previous:src.status,current:currentStatus});
  groups.push({
    branch:src.name,sha:branchSha,category:src.category,
    ahead,behind,baseSha:mergeBase,status:currentStatus,
    filesTotal:branchFiles.size,
    changedPaths:paths.length,
    alreadyIdenticalInMain:paths.filter(x=>x.alreadyInMain).length,
    pendingPaths:paths.filter(x=>!x.alreadyInMain).length,
    paths,
  });
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
  scopeId:manifest.recordId,
  main:{sha:mainSha,expected:manifest.main.observedSha,changedSinceSnapshot:mainSha!==manifest.main.observedSha},
  summary:{
    branchesExpected:manifest.branches.length,branchesInspected:groups.length,sourceFailures:failures.length,
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
if(failures.some(x=>x.code==='SOURCE_BRANCH_NOT_FETCHED'))process.exit(1);
