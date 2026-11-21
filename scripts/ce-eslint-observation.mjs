#!/usr/bin/env node
/** V6-A04: safe, read-only ESLint baseline; never upgrades errors to "lint PASS".
 * Output excludes paths, message text, snippets and environment contents.
 */
import {spawnSync} from "node:child_process";
import {pathToFileURL} from "node:url";
const requireValid=(ok,reason)=>{if(!ok)throw Error("CE_LINT_BASELINE_INVALID:"+reason)};
export function summarizeEslintReport(reports,exitStatus){
 requireValid(Array.isArray(reports)&&reports.every(x=>x&&typeof x==="object"&&
  Array.isArray(x.messages)&&Number.isSafeInteger(x.errorCount)&&
  Number.isSafeInteger(x.warningCount)),"ESLint JSON result unavailable");
 const errors=reports.reduce((s,r)=>s+r.errorCount,0);
 const warnings=reports.reduce((s,r)=>s+r.warningCount,0);
 const fatal=reports.reduce((s,r)=>s+(r.fatalErrorCount||0),0);
 requireValid((exitStatus===0&&errors===0)||(exitStatus===1&&errors>0),
   "ESLint exit status inconsistent with result");
 const rules={};
 for(const r of reports)for(const m of r.messages){
  const key=m.ruleId||"parser-or-config";
  rules[key]=(rules[key]||0)+1;
 }
 const topRules=Object.entries(rules).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))
  .slice(0,10).map(([rule,count])=>({rule,count}));
 return{protocol:"CE.V6.ESLINT_BASELINE.v1",
  state:errors===0?"PASS_LINT_ZERO_ERRORS":"HOLD_LINT_ERRORS",
  files_reported:reports.length,errors,warnings,fatal_errors:fatal,
  top_rules_only:topRules,paths_exported:false,source_snippets_exported:false,
  scan_complete:true,all_issues_fixed:errors===0&&warnings===0,
  production_release_authorized:false};
}
export function runEslintObservation(){
 const cli=new URL("../node_modules/eslint/bin/eslint.js",import.meta.url);
 const r=spawnSync(process.execPath,[cli.pathname,".","--format","json"],{
  cwd:new URL("../",import.meta.url).pathname,encoding:"utf8",maxBuffer:70*1024*1024,
  env:{...process.env,CI:"true"}});
 requireValid(!r.error&&r.status!==null&&[0,1].includes(r.status),
   "ESLint CLI failed to execute or configuration error");
 let report;
 try{report=JSON.parse(r.stdout)}catch{throw Error("CE_LINT_BASELINE_INVALID:non-JSON report (details suppressed)")}
 return summarizeEslintReport(report,r.status);
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
 try{console.log(JSON.stringify(runEslintObservation()));}
 catch(e){console.error(String(e?.message||e));process.exitCode=2;}
}
