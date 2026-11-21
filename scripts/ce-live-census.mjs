#!/usr/bin/env node
/** CE live ref census. Public GitHub metadata only; never writes to GitHub or DB. */
import {readFileSync,writeFileSync,appendFileSync} from "node:fs";
import {join,resolve} from "node:path";
import {pathToFileURL} from "node:url";
const REPO="IndiciumFIN/dev-chatgpt-workspace",SHA=/^[0-9a-f]{40}$/;
function must(x,s){if(!x)throw Error("CE_LIVE_CENSUS_HOLD:"+s);}
function same(a,b){return JSON.stringify({main:a.main.sha,branches:a.branches.map(x=>[x.name,x.sha]).sort(),prs:a.open_pull_requests.map(x=>[x.number,x.head_sha,x.head_branch,x.base_branch,x.draft]).sort((x,y)=>x[0]-y[0])})===JSON.stringify({main:b.main.sha,branches:b.branches.map(x=>[x.name,x.sha]).sort(),prs:b.open_pull_requests.map(x=>[x.number,x.head_sha,x.head_branch,x.base_branch,x.draft]).sort((x,y)=>x[0]-y[0])});}
export function validateCensus(s){
 must(s?.protocol==="CE.LIVE.GITHUB_CENSUS.v1"&&s.scope===REPO&&s.stable_two_pass===true,"protocol/repository");
 must(s.complete_pages?.branches===true&&s.complete_pages?.open_pull_requests===true,"pagination");
 must(SHA.test(s.main?.sha)&&SHA.test(s.main?.tree_sha)&&s.main?.protected===true,"main SHA/tree/protection");
 must(Number.isFinite(Date.parse(s.snapshot_at)),"timestamp");
 must(Array.isArray(s.branches)&&Array.isArray(s.open_pull_requests),"collections");
 must(new Set(s.branches.map(x=>x.name)).size===s.branches.length&&new Set(s.open_pull_requests.map(x=>x.number)).size===s.open_pull_requests.length,"duplicates");
 must(s.branches.every(x=>typeof x.name==="string"&&SHA.test(x.sha)),"branch sha");
 must(s.open_pull_requests.every(x=>Number.isSafeInteger(x.number)&&x.number>0&&SHA.test(x.head_sha)&&typeof x.head_branch==="string"&&typeof x.base_branch==="string"&&typeof x.draft==="boolean"),"PR sha");
 const m=new Map(s.branches.map(x=>[x.name,x.sha]));must(m.get("main")===s.main.sha,"main head mismatch");
 for(const p of s.open_pull_requests)if(p.head_repo===REPO)must(m.get(p.head_branch)===p.head_sha,"stale PR HEAD #"+p.number);
 const c=s.counts;
 must(c?.branches===s.branches.length&&c?.open_prs===s.open_pull_requests.length,"counts");
 must(c.main===1&&c.ce_cko_ncos+c.wutrib_isolated+c.main===c.branches,"domain totals");
 must(c.open_prs_draft===s.open_pull_requests.filter(x=>x.draft).length,"draft totals");
 const f=s.technical_gates;
 must(f?.semantic_reconciliation_complete===false&&f?.branches_sealed===0&&f?.release_authorized===false&&f?.remote_database_writes===false&&f?.secret_history_scan_complete===false&&f?.production_deployment_authorized===false,"false SEALED/release");
 return {valid:true,branches:c.branches,open_prs:c.open_prs};
}
export function compareTwoPasses(a,b){must(same(a,b),"concurrent remote HEAD or PR movement");return true;}
export function deriveDiff(a,b){
 validateCensus(a);validateCensus(b);
 const am=new Map(a.branches.map(x=>[x.name,x.sha])),bm=new Map(b.branches.map(x=>[x.name,x.sha]));
 const ap=new Map(a.open_pull_requests.map(x=>[x.number,x])),bp=new Map(b.open_pull_requests.map(x=>[x.number,x]));
 const added=b.branches.filter(x=>!am.has(x.name)),removed=a.branches.filter(x=>!bm.has(x.name));
 const moved=b.branches.filter(x=>am.has(x.name)&&am.get(x.name)!==x.sha).map(x=>({name:x.name,previous_sha:am.get(x.name),current_sha:x.sha}));
 const opened=b.open_pull_requests.filter(x=>!ap.has(x.number)),closed=a.open_pull_requests.filter(x=>!bp.has(x.number));
 const changed=b.open_pull_requests.filter(x=>ap.has(x.number)&&(ap.get(x.number).head_sha!==x.head_sha||ap.get(x.number).base_branch!==x.base_branch||ap.get(x.number).draft!==x.draft));
 const n=added.length+removed.length+moved.length+opened.length+closed.length+changed.length;
 return {state:n?"DRIFT_OBSERVED_REVIEW_REQUIRED":"NO_DRIFT_AT_CAPTURE",drift_events:n,new_branches:added,removed_branches:removed,moved_branches:moved,new_open_prs:opened,prs_no_longer_open:closed,updated_open_prs:changed};
}
async function gh(token,route){
 const url="https://api.github.com/repos/"+REPO+route;
 const x=await fetch(url,{headers:{Accept:"application/vnd.github+json",Authorization:"Bearer "+token,"X-GitHub-Api-Version":"2022-11-28"},signal:AbortSignal.timeout(30000)});
 must(x.ok,"GitHub HTTP "+x.status+" on "+route.split("?")[0]);return x.json();
}
async function pages(token,route){
 const rows=[];let complete=false;
 for(let p=1;p<=25;p++){const batch=await gh(token,route+(route.includes("?")?"&":"?")+"per_page=100&page="+p);must(Array.isArray(batch),"non-array page");rows.push(...batch);if(batch.length<100){complete=true;break;}}
 must(complete,"truncated pages "+route);return rows;
}
async function capture(token){
 const [main,branches,prs]=await Promise.all([gh(token,"/branches/main"),pages(token,"/branches"),pages(token,"/pulls?state=open")]);
 const list=branches.map(x=>({name:x.name,sha:x.commit.sha,scope:x.name==="main"?"MAIN":x.name.startsWith("wutrib/")?"WU_TRIB_ISOLATED":"CE_CKO_NCOS_REVIEW"})).sort((x,y)=>x.name.localeCompare(y.name));
 const open=prs.map(x=>({number:x.number,head_branch:x.head.ref,head_sha:x.head.sha,head_repo:x.head.repo?.full_name||null,base_branch:x.base.ref,draft:x.draft})).sort((x,y)=>x.number-y.number);
 const out={protocol:"CE.LIVE.GITHUB_CENSUS.v1",scope:REPO,snapshot_at:new Date().toISOString(),source:"GITHUB_REST_TWO_PASS_PAGINATED",stable_two_pass:true,complete_pages:{branches:true,open_pull_requests:true},main:{name:"main",sha:main.commit.sha,tree_sha:main.commit?.commit?.tree?.sha,protected:main.protected},counts:{branches:list.length,ce_cko_ncos:list.filter(x=>x.scope==="CE_CKO_NCOS_REVIEW").length,wutrib_isolated:list.filter(x=>x.scope==="WU_TRIB_ISOLATED").length,main:1,open_prs:open.length,open_prs_draft:open.filter(x=>x.draft).length},branches:list,open_pull_requests:open,technical_gates:{semantic_reconciliation_complete:false,branches_sealed:0,release_authorized:false,remote_database_writes:false,secret_history_scan_complete:false,production_deployment_authorized:false}};
 validateCensus(out);return out;
}
export async function run(){
 const token=process.env.GH_TOKEN;must(process.env.GITHUB_REPOSITORY===REPO&&token,"repo/token missing");
 const pinned=JSON.parse(readFileSync(new URL("../registers/governance/ce-github-live-census-20261121.v1.json",import.meta.url),"utf8"));validateCensus(pinned);
 const a=await capture(token),b=await capture(token);compareTwoPasses(a,b);
 const diff=deriveDiff(pinned,b);
 const report={protocol:"CE.LIVE.CENSUS.RUN.v1",captured_at:b.snapshot_at,repository:REPO,stable_two_pass:true,baseline:{sha:pinned.main.sha,branches:pinned.counts.branches,prs:pinned.counts.open_prs},live:{sha:b.main.sha,branches:b.counts.branches,prs:b.counts.open_prs},...diff,closure_authorized:false,release_authorized:false,secret_scan_performed:false,disclaimer:"Public ref metadata only; no semantic, security, clinical, database or production clearance"};
 const output=join(process.env.RUNNER_TEMP||"/tmp","ce-live-census-report.json");writeFileSync(output,JSON.stringify(report,null,2)+"\n");
 if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,"## CE live GitHub census\nBaseline: "+report.baseline.sha+"\n\nLive: "+report.live.sha+"\n\nBranches "+report.live.branches+", open PRs "+report.live.prs+": "+diff.state+". No merge, release or SEALED.\n");
 console.log(JSON.stringify({state:report.state,drift_events:report.drift_events,branches:report.live.branches,open_prs:report.live.prs,report_path:output}));return report;
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)run().catch(e=>{console.error(String(e?.message||e));process.exitCode=2;});
