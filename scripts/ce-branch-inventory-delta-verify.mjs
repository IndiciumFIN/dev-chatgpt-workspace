#!/usr/bin/env node
/** Historical branch ledger delta validator. Never merges, deletes or seals. */
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {fileURLToPath,pathToFileURL} from "node:url";
import {resolve} from "node:path";
const base = new URL("../",import.meta.url);
const fromRoot = (file) => readFileSync(new URL(file,base));
const shaBlob = (bytes) => createHash("sha1").update("blob "+bytes.length+"\0").update(bytes).digest("hex");
const ok=(valid,msg)=>{if(!valid)throw Error("CE_LEDGER_DELTA_INVALID: "+msg);};
export function validateBranchDelta(snapshot,historical,historicalBlobSha) {
 const errors=[];
 const need=(valid,msg)=>{if(!valid)errors.push(msg);};
 need(snapshot?.protocol==="CE.BRANCH.INVENTORY.DELTA.v1","unknown protocol");
 need(snapshot?.kind==="NON_MUTATING_HISTORICAL_ADDENDUM","unsafe kind");
 need(snapshot?.baseline_historical_ledger_git_blob_sha===historicalBlobSha,"historical blob changed");
 need(historical?.counts?.all_branches===63&&historical?.counts?.ce_branches===48&&
      historical?.counts?.ce_sealed===0,"historical cohort changed");
 const c=snapshot?.cohort??{};
 need(c.historical===63&&c.current===69&&c.historical_unchanged_sha===61&&
      c.head_drift===2&&c.new_refs===6&&c.historical_ce===48&&c.new_ce===6&&
      c.ce_refs_observed===54&&c.other_domain_isolated===14&&c.canonical_main===1&&
      c.ce_sealed_historical===0&&c.new_refs_sealed===0&&c.semantic_closure_count===0,
      "census or closure mismatch");
 need(Array.isArray(snapshot?.new_refs)&&snapshot.new_refs.length===6&&
      Array.isArray(snapshot?.moved_refs)&&snapshot.moved_refs.length===2,
      "source/delta count mismatch");
 need(snapshot?.snapshot_status==="INVENTORIED_ONLY_PENDING_SEMANTIC_REVIEW",
      "snapshot pretends closure");
 need(/^[0-9a-f]{40}$/.test(snapshot?.snapshot_main_sha??"")&&
      /^[0-9a-f]{40}$/.test(snapshot?.snapshot_main_tree_sha??""),
      "main SHA/tree absent");
 const known=new Map((historical?.rows??[]).map(x=>[x.branch,x]));
 need(known.size===63,"duplicate historical branch");
 const seen=new Set();
 for(const row of [...(snapshot?.new_refs??[]),...(snapshot?.moved_refs??[])]){
   need(typeof row.branch==="string"&&!seen.has(row.branch),"invalid/duplicate delta branch");
   seen.add(row.branch);
   need(/^[0-9a-f]{40}$/.test(row.observed_head_sha??"")&&
        /^[0-9a-f]{40}$/.test(row.observed_tree_sha??""),"source HEAD/tree invalid");
   need(row.review_status==="PENDING_SEMANTIC_REVIEW"&&row.no_revisit===false&&
        row.independent_review_complete===false&&row.merge_authorized===false&&
        row.remote_db_write===false,"unauthorized release or closure claim");
   const old=known.get(row.branch);
   if(row.source_snapshot_kind==="NEW_UNLISTED_REF"){
      need(!old&&row.previous_sha===null&&row.scope==="CE_CKO_NCOS_REVIEW"&&
           row.closure_status==="OPEN","new ref incorrectly in historical ledger");
   } else if(row.source_snapshot_kind==="HEAD_DRIFT"){
      need(!!old&&old.source_commit_sha===row.previous_sha&&
           old.source_commit_sha!==row.observed_head_sha&&
           old.scope===row.scope&&row.closure_status==="UNCHANGED_HISTORICAL",
           "drift reference inconsistent with immutable ledger");
   } else need(false,"invalid provenance state");
   if(row.branch!=="main"){
     need(Array.isArray(row.related_prs)&&row.related_prs.length>0&&
       row.related_prs.every(p=>Number.isSafeInteger(p.number)&&p.number>0&&
       /^[0-9a-f]{40}$/.test(p.head_sha??"")&&
       ["open","closed"].includes(p.state)&&typeof p.merged==="boolean"&&
       typeof p.draft==="boolean"),"missing PR provenance");
   }
 }
 need(seen.size===8,"duplicate or missing delta refs");
 need((snapshot.new_refs??[]).every(x=>x.source_snapshot_kind==="NEW_UNLISTED_REF")&&
      (snapshot.moved_refs??[]).every(x=>x.source_snapshot_kind==="HEAD_DRIFT"),
      "wrong delta classification");
 need(snapshot.moved_refs.some(x=>x.branch==="main"&&
       x.observed_head_sha===snapshot.snapshot_main_sha&&
       x.observed_tree_sha===snapshot.snapshot_main_tree_sha),
       "main drift must match pinned snapshot");
 need(snapshot.excluded_operations?.includes("no merge")&&
      snapshot.excluded_operations?.includes("no Supabase write")&&
      snapshot.excluded_operations?.includes("no sealing"),
      "missing safety restrictions");
 return errors;
}
export function verifyCurrentSnapshot(){
 const oldBytes=fromRoot("registers/governance/ce-branch-completion-20261120.v1.json");
 const previous=JSON.parse(oldBytes),current=JSON.parse(fromRoot("registers/governance/ce-branch-inventory-delta-20261121.v1.json"));
 const issues=validateBranchDelta(current,previous,shaBlob(oldBytes));
 if(issues.length)throw Error("CE_LEDGER_DELTA_INVALID: "+issues.join("; "));
 return {protocol:current.protocol,verified:true,historical:63,current:69,new:6,drift:2,
    ce_refs:54,ce_sealed:0,snapshot_main_sha:current.snapshot_main_sha,
    remote_head_freshness:"NOT_PROVED_BY_STATIC_VALIDATION",semantic_review:"OPEN"};
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 try{console.log(JSON.stringify(verifyCurrentSnapshot()));}
 catch(error){console.error(String(error?.message??error));process.exitCode=1;}
}
