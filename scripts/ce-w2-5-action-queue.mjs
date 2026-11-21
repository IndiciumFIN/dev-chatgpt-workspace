#!/usr/bin/env node
/**
 * W2.5 actionable P0 queue from immutable Git blob manifests.
 * Read only: never marks a review, admission, merge, clinical release or SEALED.
 */
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolve,sep} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";
import {classifyPath} from "./ce-w2-5-orphan-risk-screen.mjs";

const root = fileURLToPath(new URL("../",import.meta.url));
const ix = "registers/governance/ce-w2-4-orphan-full-file-index-20261120.v1.json";
const rs = "registers/governance/ce-w2-5-orphan-risk-screen-results-20261120.v1.json";
const must=(ok,message)=>{if(!ok)throw Error("W2_5_QUEUE_INVALID: "+message);};
function readPinned(path) {
  must(typeof path==="string"&&path.startsWith("registers/governance/")&&!path.includes("..")&&!path.includes("\\"),
    "unsafe manifest path");
  const resolved=resolve(root,path);
  must(resolved.startsWith(resolve(root)+sep),"manifest escapes repository");
  const bytes=readFileSync(resolved);
  return {data:JSON.parse(bytes.toString("utf8")),
    sha:createHash("sha1").update("blob "+bytes.length+"\0").update(bytes).digest("hex")};
}
const int=(v)=>Number.isSafeInteger(v)&&v>=0;

export function buildActionQueue(index,screen,loadBatch,{limit=25}={}) {
  must(index?.protocol==="CE.CROSS.W2.4"&&screen?.protocol==="CE.CROSS.W2.5.RESULTS.v1","invalid source protocols");
  must(int(limit)&&limit>0&&limit<=100,"invalid queue limit");
  must(index.counts?.branches===23&&index.counts?.distinct_source_sha===22&&
    index.counts?.full_file_inventoried===23&&index.counts?.branches_sealed===0,"W2.4 census mismatch");
  must(screen.counts?.orphan_branches===23&&screen.counts?.distinct_source_sha===22,"W2.5 census mismatch");
  must(index.no_revisit===false&&screen.no_revisit===false&&index.merge_authorized===false&&
    screen.authorization_to_merge===false&&screen.remote_db_write===false&&
    screen.independent_review_complete===false&&screen.closure_status==="OPEN"&&
    screen.semantic_final_dispositions===0&&index.counts.semantic_finally_triaged===0&&
    index.supabase_cross_complete===false&&index.drive_cross_complete===false,
    "unreviewed sources incorrectly claimed approved");
  must(Array.isArray(index.batches)&&index.batches.length===6&&Array.isArray(index.sources)&&
    index.sources.length===22,"batch/source universe mismatch");
  must(Array.isArray(screen.first_review_wave)&&screen.first_review_wave.length===4,"first-wave not evidenced");
  const bySha=new Map(index.sources.map(s=>[s.source_sha,s]));
  must(bySha.size===22,"duplicate source SHA");
  const first=new Map();
  for(const [rank,w] of screen.first_review_wave.entries()){
    const s=bySha.get(w.source_sha);
    must(s&&s.branches.includes(w.branch)&&s.nonidentical_origin_items===w.delta&&
      int(w.p0)&&w.p0>0,"first-wave source/delta mismatch");
    must(!first.has(w.source_sha),"first-wave SHA repeated");
    first.set(w.source_sha,{...w,rank});
  }
  const relations={E:0,C:0,D:0,S:0,T:0},risk={P0:0,P1:0,P2:0},objects=new Map();
  const sourceRisk=new Map(),observed=new Set();
  for(const batch of index.batches) {
    const loaded=loadBatch(batch.path);
    must(loaded?.sha===batch.git_blob_sha,"batch Git blob hash mismatch: "+batch.path);
    must(loaded.data?.protocol&&Array.isArray(loaded.data.sources)&&
      loaded.data.sources.length===batch.unique_sources,"batch manifest structure mismatch");
    for(const source of loaded.data.sources) {
      const expected=bySha.get(source.source_sha);
      must(expected&&expected.manifest_path===batch.path&&
        JSON.stringify(expected.branches)===JSON.stringify(source.branches)&&
        !observed.has(source.source_sha),"source provenance/alias mismatch");
      observed.add(source.source_sha);
      must(Array.isArray(source.rows),"source rows missing");
      const count={P0:0,P1:0,P2:0};
      for(const item of source.rows){
        must(Array.isArray(item)&&item.length>=4&&typeof item[0]==="string"&&
          ["E","C","D","S","T"].includes(item[1]),"invalid manifest row");
        const [path,relation,blobSha,mainBlobSha]=item;
        relations[relation]++;
        if(relation==="E"||relation==="C")continue;
        must(/^[0-9a-f]{40}$/.test(blobSha),"unverifiable source blob for "+path);
        const [priority,area]=classifyPath(path);
        risk[priority]++;count[priority]++;
        const key=JSON.stringify([path,blobSha,relation==="T"?item[4]:""]);
        const previous=objects.get(key);
        if(previous){previous.occurrences++;previous.branches.push(...source.branches);previous.source_shas.push(source.source_sha);}
        else objects.set(key,{path,source_blob_sha:blobSha,baseline_main_blob_sha:mainBlobSha||null,
          source_mode:relation==="T"?item[4]:null,priority,area,occurrences:1,
          branches:[...source.branches],source_shas:[source.source_sha]});
      }
      const exp=source.counts;
      must(exp&&["E","C","D","S","T"].every(k=>int(exp[k])),"source counts missing");
      sourceRisk.set(source.source_sha,count);
    }
  }
  must(observed.size===22,"missing source");
  const agg=index.aggregate_occurrences_for_distinct_sha;
  must(["E","C","D","S","T"].every(k=>relations[k]===agg[k]),"manifest/index occurrence mismatch");
  must(risk.P0===screen.counts.P0_occurrences&&risk.P1===screen.counts.P1_occurrences&&
    risk.P2===screen.counts.P2_occurrences,"W2.5 priority totals mismatch");
  must(objects.size===screen.counts.distinct_review_objects_by_path_blob_mode,
    "deduplication universe mismatch");
  const repeated=[...objects.values()].filter(x=>x.occurrences>1).length;
  must(repeated===screen.counts.repeated_review_objects_count,"shared object count mismatch");
  for(const [sha,w] of first) must(sourceRisk.get(sha)?.P0===w.p0,"first-wave P0 count mismatch");
  const firstWaveP0=[...first.values()].reduce((sum,w)=>sum+w.p0,0);
  const rankOf=x=>Math.min(...x.source_shas.map(sha=>first.get(sha)?.rank??99));
  const allP0=[...objects.values()].filter(x=>x.priority==="P0").sort((a,b)=>
    rankOf(a)-rankOf(b)||a.path.localeCompare(b.path)||a.source_blob_sha.localeCompare(b.source_blob_sha));
  const sample=allP0.slice(0,limit).map(x=>({...x,branches:[...new Set(x.branches)].sort(),
    source_shas:[...new Set(x.source_shas)].sort(),status:"PENDING_SEMANTIC_REVIEW"}));
  must(allP0.length>0&&sample.length>0,"nonempty risk inventory yielded empty queue");
  return {protocol:"CE.CROSS.W2.5.ACTION_QUEUE.v1",state:"OPEN_NO_ADMISSION",
    source_baseline:index.full_file_main_sha,source_counts:{branches:23,unique_commits:22},
    source_occurrences:relations,priority_occurrences:risk,
    distinct_review_objects:objects.size,shared_review_objects:repeated,
    p0_unique_objects:allP0.length,first_wave_p0_occurrences:firstWaveP0,
    first_wave:screen.first_review_wave,queue_limit:limit,queue:sample,
    completed_semantic_reviews:0,branches_sealed:0,merge_authorized:false,
    supabase_cross_complete:false,drive_cross_complete:false};
}
export function loadActionQueue(limit=25) {
  const index=readPinned(ix),screen=readPinned(rs);
  must(index.sha===screen.data.index_blob_sha,"W2.4 immutable index changed");
  return buildActionQueue(index.data,screen.data,readPinned,{limit});
}
export function requireClosed(result) {
  must(result.completed_semantic_reviews===result.distinct_review_objects&&
    result.branches_sealed===result.source_counts.branches&&
    result.supabase_cross_complete&&result.drive_cross_complete,
    "cannot declare completion with unresolved object/branch/source cross");
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
  try{
    const arg=process.argv.find(s=>s.startsWith("--limit="));
    const limit=arg?Number(arg.slice(8)):25;
    must(process.argv.slice(2).every(s=>s==="--require-closed"||s.startsWith("--limit=")),
      "unsupported option");
    const result=loadActionQueue(limit);
    console.log(JSON.stringify(result));
    if(process.argv.includes("--require-closed"))requireClosed(result);
  }catch(error){console.error(String(error?.message||error));process.exitCode=2;}
}
