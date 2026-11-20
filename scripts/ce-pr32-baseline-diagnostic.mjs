#!/usr/bin/env node
/** Audit PR #32's 486-file discrepancy by holding the PR HEAD fixed while
 * varying the comparison baseline (historic PR base vs live main).
 * Public Git metadata only. Never merges, checks out source, or reads content.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseNameStatus } from './ce-large-pr-native-diff.mjs';
import { parseGitLsTree } from './lib/ce-live-branch-reconcile-core.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const git=(args,opts={})=>execFileSync('git',args,{cwd:root,maxBuffer:128*1024*1024,...opts});
const HASH40=/^[0-9a-f]{40}$/;

export function compareFileSets(historical,current) {
  const old=new Map(historical.map(x=>[x.path,x.status]));
  const now=new Map(current.map(x=>[x.path,x.status]));
  if(old.size!==historical.length||now.size!==current.length) throw Error('DUPLICATE_PATH_IN_DIFF');
  const historicalOnly=[...old.keys()].filter(x=>!now.has(x)).sort();
  const currentOnly=[...now.keys()].filter(x=>!old.has(x)).sort();
  const changedStatus=[...old.keys()].filter(x=>now.has(x)&&now.get(x)!==old.get(x)).sort().map(path=>({path,historic:old.get(path),current:now.get(path)}));
  if(historical.length-current.length!==historicalOnly.length-currentOnly.length) throw Error('SET_DIFFERENCE_NOT_CONSERVED');
  return {historicalOnly,currentOnly,changedStatus,
    historicalOnlyCount:historicalOnly.length,currentOnlyCount:currentOnly.length,changedStatusCount:changedStatus.length};
}

export function decidePR32({expected,oldCount,newCount,oldOnly,newOnly,oldMergeBase,currentMergeBase,headFresh}) {
  if (!headFresh) return 'HOLD_HEAD_DRIFT';
  if (oldCount===expected && oldCount-newCount===oldOnly-newOnly && oldMergeBase!==currentMergeBase)
    return 'BASELINE_DRIFT_EXPLAINS_REST_COUNT_GAP_NOT_MISSING_FILES';
  if(oldCount===expected && oldMergeBase===currentMergeBase && oldCount===newCount)
    return 'SAME_BASE_NO_GAP';
  return 'HOLD_UNEXPLAINED_COMPARISON_MISMATCH';
}

const direct=process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url);
if (direct) {
 const ledger=JSON.parse(readFileSync(resolve(root,'registers/governance/ce-branch-completion-20261120.v1.json'),'utf8'));
 const row=ledger.rows.find(x=>x.pr_number===32&&x.scope==='CE_CKO_NCOS_REVIEW');
 if(!row||row.scan_status!=='PR_FILES_INCOMPLETE_API_LIMIT')throw Error('NO_PINNED_PR32_LEDGER');
 const historicBase='e9f7fe66075ebe5d7346072dc3a1b4934678c6de'; // GitHub PR #32 base SHA as observed 20 Nov 2026
 const liveMain=git(['rev-parse','refs/remotes/origin/main'],{encoding:'utf8'}).trim();
 const liveHead=git(['rev-parse','refs/remotes/origin/'+row.branch],{encoding:'utf8'}).trim();
 for(const sha of [historicBase,liveMain,liveHead,row.source_commit_sha]) {
  if(!HASH40.test(sha))throw Error('INVALID_INPUT_SHA');
  git(['cat-file','-e',sha+'^{commit}']);
 }
 const oldMB=git(['merge-base',historicBase,row.source_commit_sha],{encoding:'utf8'}).trim();
 const nowMB=git(['merge-base',liveMain,row.source_commit_sha],{encoding:'utf8'}).trim();
 const old=parseNameStatus(git(['diff','--name-status','-z','--no-renames',oldMB,row.source_commit_sha]));
 const now=parseNameStatus(git(['diff','--name-status','-z','--no-renames',nowMB,row.source_commit_sha]));
 const compare=compareFileSets(old,now);
 const sourceTree=parseGitLsTree(git(['ls-tree','-rz',row.source_commit_sha]));
 const mainTree=parseGitLsTree(git(['ls-tree','-rz',liveMain]));
 const main_presence={EXACT:0,PRESENT_DIFFERENT:0,SOURCE_ONLY:0,MAIN_ONLY:0,ABSENT_IN_BOTH:0};
 const needs_review=[];
 for(const path of compare.historicalOnly){
  const a=sourceTree.get(path),b=mainTree.get(path);
  let relation;
  if(a&&b&&a.sha===b.sha&&a.mode===b.mode&&a.type===b.type)relation='EXACT';
  else if(a&&b)relation='PRESENT_DIFFERENT';
  else if(a)relation='SOURCE_ONLY';
  else if(b)relation='MAIN_ONLY';
  else relation='ABSENT_IN_BOTH';
  main_presence[relation]++;
  if(relation!=='EXACT')needs_review.push({path,relation,source_git_blob_sha:a?.sha??null,main_git_blob_sha:b?.sha??null,source_mode:a?.mode??null,main_mode:b?.mode??null});
 }
 if(Object.values(main_presence).reduce((a,b)=>a+b,0)!==compare.historicalOnlyCount)throw Error('HISTORICAL_ONLY_CROSSCHECK_LOST_ROWS');
 const sameHead=liveHead===row.source_commit_sha;
 const decision=decidePR32({expected:row.expected_pr_changes,oldCount:old.length,newCount:now.length,oldOnly:compare.historicalOnlyCount,newOnly:compare.currentOnlyCount,oldMergeBase:oldMB,currentMergeBase:nowMB,headFresh:sameHead});
 const details=Object.fromEntries(Object.entries(compare).filter(([k])=>['historicalOnly','currentOnly','changedStatus'].includes(k)));
 const report={
   protocol:'CE.CROSS.PR32.BASELINE_DIAGNOSTIC.v1',
   source:'Git-only, read-only, no file bytes',
   pr_number:32,original_rest_api_expected:row.expected_pr_changes,
   head_pinned:row.source_commit_sha,head_observed:liveHead,head_fresh:sameHead,
   historic_pr_base_sha:historicBase,historic_merge_base:oldMB,
   live_main_sha:liveMain,live_merge_base:nowMB,
   old_diff_count:old.length,new_diff_count:now.length,
   count_gap_old_minus_new:old.length-now.length,
   rest_expected_minus_current:row.expected_pr_changes-now.length,
   comparison:{historicalOnlyCount:compare.historicalOnlyCount,currentOnlyCount:compare.currentOnlyCount,changedStatusCount:compare.changedStatusCount},
   historical_only_vs_current_main_presence:main_presence,
   historical_only_review_required:needs_review,
   historical_diff_sha256:createHash('sha256').update(JSON.stringify(old)).digest('hex'),
   current_diff_sha256:createHash('sha256').update(JSON.stringify(now)).digest('hex'),
   decision,
   // Explicit file-level review evidence. Paths refer to an already-public Git repository.
   differences:details,
   no_missing_file_claim:true,semantic_review_complete:false,merge_authorized:false,
   remote_write:false,release_eligible:false,source_branch_sealed:false
 };
 const canonical=JSON.stringify(report);
 report.sha256=createHash('sha256').update(canonical).digest('hex');
 const i=process.argv.indexOf('--output');
 const output=resolve(root,i<0?'audit-evidence/ce-live-reconciliation/pr32-baseline-diagnostic.json':process.argv[i+1]);
 mkdirSync(dirname(output),{recursive:true});
 writeFileSync(output,JSON.stringify(report,null,2)+'\n');
 console.log('PR32_BASELINE_DIAGNOSTIC',JSON.stringify({
  decision,oldBase:historicBase,oldMergeBase:oldMB,newBase:liveMain,newMergeBase:nowMB,
  expected:row.expected_pr_changes,old:old.length,current:now.length,
  historicalOnly:compare.historicalOnlyCount,currentOnly:compare.currentOnlyCount,
  currentMainPresence:main_presence,
  changedStatus:compare.changedStatusCount,sha256:report.sha256
 }));
 if(decision.startsWith('HOLD_'))process.exitCode=2;
}
