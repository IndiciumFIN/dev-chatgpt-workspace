#!/usr/bin/env node
/** Evidence of GitHub Actions step outcomes only. Not clinical or release authorization. */
import { writeFileSync, mkdirSync, appendFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
export const CONTROLS=Object.freeze([
 ['dep_audit','High+ dependency audit'],['typecheck','TypeScript typecheck'],
 ['test_suite','Unit and negative regressions'],['build','Nitro SSR build'],
 ['editorial_bundle','Public editorial bundle isolation'],
 ['clinical_bundle','Candidate clinical bundle isolation'],
 ['static_output','Required Nitro server and static assets']
]);
const valid=new Set(['success','failure','skipped','cancelled','timed_out','action_required','pending']);
export function buildCeTechnicalEvidence({sha,testedSha=sha,runId='',outcomes={}}){
 if(typeof sha!=='string'||!/^[a-f0-9]{40}$/i.test(sha))throw Error('MISSING_IMMUTABLE_SHA');
 if(typeof testedSha!=='string'||!/^[a-f0-9]{40}$/i.test(testedSha))throw Error('MISSING_TESTED_SHA');
 const checks=CONTROLS.map(([id,label])=>{
  const outcome=outcomes[id]||'pending';
  if(!valid.has(outcome))throw Error('UNKNOWN_CI_STEP_OUTCOME_'+id);
  return {id,label,outcome};
 });
 const passed=checks.filter(x=>x.outcome==='success').length;
 const failed=checks.filter(x=>['failure','cancelled','timed_out','action_required'].includes(x.outcome)).length;
 const pending=checks.length-passed-failed;
 return {
  protocol:'CE.CI.TECHNICAL.EVIDENCE.v1',
  scope:'VERIFY_WORKFLOW_STEP_OUTCOMES_ONLY',sha:sha.toLowerCase(),tested_merge_sha:testedSha.toLowerCase(),run_id:String(runId),
  checks,counts:{passed,failed,pending,total:checks.length},
  technical_pass_percent:Number((passed*100/checks.length).toFixed(1)),
  verdict:failed?'TECHNICAL_FAIL':pending?'INCOMPLETE':'TECHNICAL_PASS',
  platform_implementation_completion_percent:null,
  clinical_approval:false,real_oauth_verified:false,remote_database_verified:false,
  semantic_approvals_verified:false,branches_sealed:false,release_authorized:false,merge_authorized:false,
  limitations:['Other workflows require separate verdicts.','Passing CI does not grant clinical approval.']
 };
}
export function summaryMarkdown(s){
 if(s.protocol!=='CE.CI.TECHNICAL.EVIDENCE.v1')throw Error('UNKNOWN_SCORECARD_PROTOCOL');
 return [
  '### CE/NCOS — automated read-only technical checkpoint',
  '- PR source HEAD: '+s.sha+'; checkout tested: '+s.tested_merge_sha+'; run: '+s.run_id,
  '- **'+s.counts.passed+'/'+s.counts.total+' checks passed ('+s.technical_pass_percent+'%)**; failed='+s.counts.failed+'; pending/skipped='+s.counts.pending+'.',
  '- Verdict: **'+s.verdict+'**. Not the percentage of platform completion.',
  '| Check | Outcome |','|---|---|',
  ...s.checks.map(x=>'| '+x.label+' | '+x.outcome.toUpperCase()+' |'),
  '- Clinical review, real OAuth, operational DB, Vercel production and semantic approvals remain HOLD.',
  '- No automated merger, publication, DB change, credential action or branch closure.',''
 ].join('\n');
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const outcomes=Object.fromEntries(CONTROLS.map(([id])=>[id,process.env['CE_STEP_'+id.toUpperCase()]]));
 const result=buildCeTechnicalEvidence({sha:process.env.CE_PR_HEAD_SHA||process.env.GITHUB_SHA||'',testedSha:process.env.GITHUB_SHA||'',runId:process.env.GITHUB_RUN_ID||'',outcomes});
 const p=resolve('audit-evidence/ce-ci-automated/technical-readiness.json');
 mkdirSync(dirname(p),{recursive:true});writeFileSync(p,JSON.stringify(result,null,2)+'\n');
 if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,summaryMarkdown(result)+'\n');
 console.log('CE_CI_TECHNICAL_SCORECARD',JSON.stringify({sha:result.sha,counts:result.counts,verdict:result.verdict}));
}
