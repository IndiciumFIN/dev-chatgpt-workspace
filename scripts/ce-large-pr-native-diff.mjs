#!/usr/bin/env node
/** Exhaustive native Git diff for historical large PRs truncated by REST API. */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync,readFileSync,writeFileSync } from 'node:fs';
import { dirname,resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function parseNameStatus(data) {
 if (!Buffer.isBuffer(data)) throw new TypeError('raw Git output required');
 if (!data.length) return [];
 if (data[data.length-1] !== 0) throw Error('UNTERMINATED_NATIVE_DIFF');
 const pieces=data.toString('utf8').split('\0');pieces.pop();
 if (pieces.length%2!==0) throw Error('DIFF_STATUS_PATH_PAIR_MISSING');
 const out=[];
 for(let i=0;i<pieces.length;i+=2){
  const [status,path]=[pieces[i],pieces[i+1]];
  if(!/^(A|M|D|T|U)$/.test(status)||!path||path.includes('\ufffd')) throw Error('INVALID_DIFF_STATUS_OR_PATH');
  out.push({status,path});
 }
 if(new Set(out.map(x=>x.path)).size!==out.length) throw Error('DUPLICATE_NATIVE_DIFF_PATH');
 return out;
}

export function analyzeLargePR({row,currentMainSha,observedSha,mergeBaseSha,files}) {
 if (row.scan_status !== 'PR_FILES_INCOMPLETE_API_LIMIT' || !row.pr_number) throw Error('NOT_A_LARGE_PR');
 if (!Array.isArray(files)) throw Error('MISSING_FILE_SET');
 const count=files.length, match=count===row.expected_pr_changes;
 const result={pr_number:row.pr_number,source_branch:row.branch,pinned_source_sha:row.source_commit_sha,
  observed_source_sha:observedSha,current_main_sha:currentMainSha,merge_base_sha:mergeBaseSha,
  original_rest_count:row.observed_files,original_expected_changed_files:row.expected_pr_changes,
  native_git_diff_count:count,counts_match_original_api:match,heads_fresh:observedSha===row.source_commit_sha,
  method:'GIT_DIFF_MERGE_BASE_TO_PINNED_HEAD_NO_RENAMES',
  status: match&&observedSha===row.source_commit_sha?'FULL_NATIVE_DIFF_CANDIDATE_NEEDS_REVIEW':'HOLD_COUNT_OR_HEAD_DRIFT',
  git_api_changed_files_completeness_not_overwritten:true,semantic_approval:false,auto_merge:false,
  records:files};
 result.diff_sha256=createHash('sha256').update(JSON.stringify(files)).digest('hex');
 return result;
}
const direct=process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(direct){
 const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
 const ledger=JSON.parse(readFileSync(resolve(root,'registers/governance/ce-branch-completion-20261120.v1.json'),'utf8'));
 const cli=process.argv.indexOf('--output'),output=resolve(root,cli===-1?'audit-evidence/ce-live-reconciliation/large-pr-native-diff.json':process.argv[cli+1]);
 const git=(args,opts={})=>execFileSync('git',args,{cwd:root,maxBuffer:128*1024*1024,...opts});
 const currentMainSha=git(['rev-parse','refs/remotes/origin/main'],{encoding:'utf8'}).trim();
 const rows=ledger.rows.filter(x=>x.scan_status==='PR_FILES_INCOMPLETE_API_LIMIT'&&x.scope==='CE_CKO_NCOS_REVIEW');
 const audits=[];
 for(const row of rows){
  try {
   git(['cat-file','-e',row.source_commit_sha+'^{commit}']);
   const observedSha=git(['rev-parse','refs/remotes/origin/'+row.branch],{encoding:'utf8'}).trim();
   const mergeBaseSha=git(['merge-base',currentMainSha,row.source_commit_sha],{encoding:'utf8'}).trim();
   if(!/^[0-9a-f]{40}$/.test(mergeBaseSha))throw Error('BAD_MERGE_BASE_SHA');
   const bytes=git(['diff','--name-status','-z','--no-renames',mergeBaseSha,row.source_commit_sha]);
   const report=analyzeLargePR({row,currentMainSha,observedSha,mergeBaseSha,files:parseNameStatus(bytes)});
   audits.push(report);
   console.log('LARGE_PR_NATIVE_DIFF',JSON.stringify({pr:report.pr_number,total:report.native_git_diff_count,expected:report.original_expected_changed_files,match:report.counts_match_original_api,status:report.status}));
  }catch(error){
   audits.push({pr_number:row.pr_number,source_branch:row.branch,status:'HOLD_DIFF_UNAVAILABLE',error_code:'NATIVE_DIFF_OR_SOURCE_REF_UNAVAILABLE',auto_merge:false});
   console.log('HOLD: unable to complete native PR diff for #'+row.pr_number);
  }
 }
 const result={protocol:'CE.CROSS.GIANT_PR_GIT_DIFF.v1',canonical_main_sha:currentMainSha,expected_large_prs:rows.length,processed_prs:audits.length,
  fully_recorded_candidate_diffs:audits.filter(x=>x.status==='FULL_NATIVE_DIFF_CANDIDATE_NEEDS_REVIEW').length,
  source_kind:'public Git history only',release_eligible:false,auto_merge:false,read_only:true,
  rest_pr_changed_files_flags_unchanged:true,prs:audits};
 mkdirSync(dirname(output),{recursive:true});writeFileSync(output,JSON.stringify(result,null,2)+'\n');
 console.log('LARGE_PR_DIFF_TOTALS',JSON.stringify({total:result.processed_prs,candidates:result.fully_recorded_candidate_diffs}));
 if(result.processed_prs!==rows.length||audits.some(x=>x.status==='HOLD_DIFF_UNAVAILABLE'))process.exitCode=2;
}
