#!/usr/bin/env node
/** V6-A01/G00 immutable nine public repository branch/tag census verification.
 * Metadata only. This code intentionally NEVER claims secrets/history scanned.
 */
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {pathToFileURL} from "node:url";
const root=new URL("../",import.meta.url);
const indexPath="registers/governance/ce-g00-nine-repositories-ref-index-20261121.v1.json";
const must=(ok,m)=>{if(!ok)throw Error("CE_G00_REF_HOLD:"+m)};
const blobSHA=b=>createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex");
const read=p=>readFileSync(new URL(p,root));
const isSHA=x=>typeof x==="string"&&/^[0-9a-f]{40}$/.test(x);
const names=[
"IndiciumFIN/dev-chatgpt-workspace","IndiciumFIN/calculadorasdeenfermagem",
"IndiciumFIN/blue-ember-fjord-prairie","IndiciumFIN/raven-beam-lion-lagoon",
"IndiciumFIN/leaf-lilac-bamboo-craft","IndiciumFIN/pearl-rapid-fern-jolly",
"IndiciumFIN/star-monarch-lilac-zippy","IndiciumFIN/indicium360","IndiciumFIN/indiciumfin"];
export function verifyG00RefCensus(index,loadedBatches){
 must(index?.protocol==="CE.G00.REF_CENSUS_INDEX.v1"&&index.date==="2026-11-21","invalid index");
 must(index.repository==="IndiciumFIN/dev-chatgpt-workspace"&&index.scope_repositories===9&&
      index.scope_branches===157&&index.scope_tags===0&&
      index.fully_enumerated_accessible_branches_and_tags===true,
      "scope spoofed");
 for(const flag of ["all_history_commits_scanned","secrets_scanned","pii_scanned",
 "edge_functions_assessed","git_LFS_and_artifacts_scanned","secret_rotation_verified",
 "external_production_authorized","gate_G00_closed"]){
  must(index[flag]===false,"forged completion of "+flag);
 }
 must(index.scanner_report_private===null,"unverified scanner report");
 must(Array.isArray(index.batches)&&index.batches.length===3&&Array.isArray(loadedBatches)&&
      loadedBatches.length===3,"missing batch");
 let totalBranches=0,totalTags=0,all=[],batchStats=[];
 for(let i=0;i<3;i++){
  const item=index.batches[i],loaded=loadedBatches[i],data=loaded?.data;
  must(item.batch===i+1&&item.path===
    `registers/governance/ce-g00-ref-census-batch-0${i+1}-20261121.v1.json`&&
    isSHA(item.git_blob_sha)&&loaded.sha===item.git_blob_sha,
    "source batch SHA/path mismatch");
  must(data?.protocol==="CE.G00.PUBLIC_REFS_BATCH.v1"&&data.batch===i+1&&
    data.date==="2026-11-21"&&data.repo_count===3&&
    data.history_scanned===false&&data.secret_values_read===false&&
    data.secret_scan_executed===false&&data.records?.length===3,
    "source batch falsely claims scanning or mismatch");
  let b=0,t=0;
  for(const r of data.records){
   must(names.includes(r.repository)&&r.visibility==="public"&&
     r.pagination_complete===true&&typeof r.default_branch==="string"&&isSHA(r.default_sha),
     "repository identification or pagination missing");
   must(Array.isArray(r.refs)&&r.refs.length===r.branch_count+r.tag_count&&
     Number.isInteger(r.branch_count)&&r.branch_count>0&&
     Number.isInteger(r.tag_count)&&r.tag_count>=0,"ref count invalid");
   must(r.refs.every(f=>/^(refs\/heads\/|refs\/tags\/)/.test(f.ref)&&isSHA(f.sha)&&
       ["commit","tag"].includes(f.type)),"unverifiable ref entry");
   must(new Set(r.refs.map(f=>f.ref)).size===r.refs.length,"duplicate ref");
   must(r.refs.filter(f=>f.ref.startsWith("refs/heads/")).length===r.branch_count&&
     r.refs.filter(f=>f.ref.startsWith("refs/tags/")).length===r.tag_count,"ref class count mismatch");
   must(r.refs.some(f=>f.ref===`refs/heads/${r.default_branch}`&&f.sha===r.default_sha),"default SHA falsified");
   must(r.pages?.heads>=1&&r.pages.tags>=1,"unpaged refs");
   b+=r.branch_count;t+=r.tag_count;all.push(r.repository);
  }
  must(item.repo_count===3&&item.branch_count===b&&item.tag_count===t,"batch count forged");
  totalBranches+=b;totalTags+=t;batchStats.push({batch:i+1,branches:b,tags:t,sha:item.git_blob_sha});
 }
 must(all.length===9&&new Set(all).size===9&&names.every(x=>all.includes(x))&&
       index.repository_names.length===9&&
       names.every(x=>index.repository_names.includes(x))&&
       totalBranches===157&&totalTags===0,"nine-repo census incomplete");
 return{protocol:index.protocol,state:"PASS_REF_METADATA_ONLY_G00_OPEN",repositories:9,
  branches:totalBranches,tags:totalTags,full_history_scanned:false,
  secrets_scanned:false,release_allowed:false,batches:batchStats};
}
export function runG00RefCensus(){
 const idx=JSON.parse(read(indexPath).toString("utf8"));
 const loads=idx.batches.map(b=>{
  must(typeof b.path==="string"&&/^registers\/governance\/ce-g00-ref-census-batch-0[123]-20261121\.v1\.json$/.test(b.path),"unsafe path");
  const raw=read(b.path);
  return{sha:blobSHA(raw),data:JSON.parse(raw.toString("utf8"))};
 });
 return verifyG00RefCensus(idx,loads);
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
 try{console.log(JSON.stringify(runG00RefCensus()));}
 catch(e){console.error(String(e?.message??e));process.exitCode=2;}
}
