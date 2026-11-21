#!/usr/bin/env node
/** Independent of network: verify immutable W2.4 source evidence for the
 * audit-hardening full-delta/closure-readiness report. Never approves or SEALED. */
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {pathToFileURL} from "node:url";
import {classifyPath} from "./ce-w2-5-orphan-risk-screen.mjs";
const root=new URL("../",import.meta.url);
const READINESS="registers/governance/ce-w2-5-audit-hardening-closure-readiness-20261121.v1.json";
const INDEX="registers/governance/ce-w2-4-orphan-full-file-index-20261120.v1.json";
const fail=(ok,message)=>{if(!ok)throw Error("CE_BRANCH_CLOSURE_HOLD:"+message);};
const parse=p=>JSON.parse(readFileSync(new URL(p,root),"utf8"));
const gitBlob=bytes=>createHash("sha1").update("blob "+bytes.length+"\0").update(bytes).digest("hex");
const goodSha=x=>typeof x==="string"&&/^[0-9a-f]{40}$/.test(x);
const allRel=["E","C","D","S","T"];
export function validateBranchClosureReadiness(doc,index,sourceManifest){
 fail(doc?.protocol==="CE.BRANCH.FULL_DELTA.CLOSURE_READINESS.v1","invalid protocol");
 fail(doc?.branch==="audit-hardening-2026-10-24"&&
      doc.source_sha==="9c9ca4640dedf705fe1c3cccca474af4f8d1a422"&&
      doc.source_tree_sha==="203a2b8d00adf66914dd20a54c1a06b1ecba86f4","source SHA drift");
 fail(doc.main_historical_sha===index.full_file_main_sha&&
      doc.main_current_sha==="cdc707d5333fb7cc533999ac5dbdd4cebd4feb57","main SHA drift");
 const pinned=index.sources.find(s=>s.source_sha===doc.source_sha);
 fail(pinned&&pinned.source_tree_sha===doc.source_tree_sha&&
      pinned.manifest_path===doc.w2_4_manifest_path&&
      pinned.manifest_blob_sha===doc.w2_4_manifest_git_blob_sha,"W2.4 provenance conflict");
 const src=sourceManifest.sources.find(s=>s.source_sha===doc.source_sha);
 fail(src&&JSON.stringify(src.counts)===JSON.stringify(pinned.counts),"source manifest unavailable");
 fail(Array.isArray(doc.rows)&&doc.rows.length===421&&
      doc.columns?.length===13,"incorrect full delta dimensions");
 const expected=new Map(src.rows.filter(x=>["D","S","T"].includes(x[1])).map(x=>[x[0],x]));
 fail(expected.size===421,"W2.4 source delta changed");
 let counts={E:src.counts.E,C:src.counts.C,D:0,S:0,T:0},priorities={P0:0,P1:0,P2:0};
 let modeOnly=0,modeAndBytes=0,byteOnly=0,prelim=0;
 const seen=new Set();
 for(const row of doc.rows){
  fail(Array.isArray(row)&&row.length===13,"malformed per-object classification");
  const [path,rel,sha,mode,histSha,histMode,currentSha,currentMode,priority,area,action,status,decision]=row;
  fail(typeof path==="string"&&!seen.has(path)&&expected.has(path),"duplicate/missing source path");
  seen.add(path);
  const manifestRow=expected.get(path);
  fail(rel===manifestRow[1]&&sha===manifestRow[2]&&histSha===manifestRow[3],"forged historical evidence");
  fail(goodSha(sha)&&goodSha(histSha)&&goodSha(currentSha),"invalid Git blob SHA");
  fail(["100644","100755","120000","160000"].includes(mode)&&
       ["100644","100755","120000","160000"].includes(histMode)&&
       ["100644","100755","120000","160000"].includes(currentMode),"invalid mode");
  if(manifestRow[4]!==undefined)fail(mode===manifestRow[4],"source mode changed");
  const [risk,kind]=classifyPath(path);
  fail(priority===risk&&area===kind,"priority/path classification drift");
  fail(["D","S","T"].includes(rel),"unrecognized relation");
  counts[rel]++;priorities[priority]++;
  const sameBlob=sha===histSha,sameMode=mode===histMode;
  if(sameBlob&&!sameMode){modeOnly++;fail(action==="MODE_ONLY_KEEP_CANONICAL_PENDING_PROOF"&&rel==="T","mode-only drift mislabeled");}
  else if(!sameBlob&&!sameMode){modeAndBytes++;fail(action==="MODE_AND_CONTENT_SEMANTIC_REVIEW_REQUIRED"&&rel==="T","mixed drift mislabeled");}
  else if(!sameBlob&&sameMode){byteOnly++;fail(action==="CONTENT_SEMANTIC_REVIEW_REQUIRED"&&rel==="D","content drift mislabeled");}
  else fail(false,"exact match masquerading as delta");
  if(priority==="P0"){
   prelim++;
   fail(status==="STATIC_P0_HOLD_INDEPENDENT_REVIEW"&&typeof decision==="string"&&decision.length>2,"P0 approval or evidence missing");
  } else fail(status==="PENDING_SEMANTIC_REVIEW"&&decision===null,"non-P0 incorrectly admitted");
 }
 fail(seen.size===421&&[...expected.keys()].every(p=>seen.has(p)),"incomplete full delta");
 const countsExpected={E:1312,C:1409,D:134,S:0,T:287};
 fail(allRel.every(k=>counts[k]===countsExpected[k]&&doc.universe.relations[k]===counts[k]),"source delta counters drift");
 fail(doc.universe.source_files===1733&&doc.universe.source_matched_exact===1312&&
      doc.universe.historical_main_only_files===1409&&doc.universe.source_deltas===421&&
      doc.universe.content_byte_changes===139&&
      doc.universe.mode_only_changes===282&&doc.universe.mode_and_byte_changes===5,"universe counters drift");
 fail(modeOnly===282&&modeAndBytes===5&&byteOnly===134&&prelim===11&&
      priorities.P0===11&&priorities.P1===126&&priorities.P2===284,"risk/count mismatch");
 const cl=doc.closure;
 fail(cl&&cl.state==="OPEN_FULL_DELTA_INVENTORIED"&&cl.all_421_paths_structurally_classified===true&&
      cl.semantic_final_dispositions===0&&cl.semantic_review_complete===false&&
      cl.remaining_semantic_review===421&&cl.SEALED===false&&cl.no_revisit===false&&
      cl.main_integration_sha===null&&cl.ci_verified_main_sha===null&&
      cl.owner_approval_name==="Leivis Lima"&&cl.owner_approval_recorded===false&&
      cl.independent_reviewer===null&&cl.independent_review_recorded===false&&
      cl.supabase_cross_complete===false&&cl.drive_cross_complete===false&&
      cl.merge_authorized===false&&cl.source_branch_delete_authorized===false&&
      cl.remote_db_writes_authorized===false&&cl.production_release_authorized===false,
      "false closure, approval or production admission");
 return {protocol:doc.protocol,status:"PASS_STRUCTURAL_ONLY_NO_CLOSURE",
    source_files:1733,exact_files:1312,delta_files:421,canonical_only_files:1409,
    mode_only:modeOnly,mode_and_bytes:modeAndBytes,content_only:byteOnly,
    priority:priorities,semantic_final:0,independent_approval:false,SEALED:false};
}
export function loadBranchClosureReadiness(){
 const doc=parse(READINESS),index=parse(INDEX);
 const expected=index.sources.find(x=>x.source_sha===doc.source_sha);
 fail(expected&&doc.w2_4_manifest_path===expected.manifest_path,"unexpected W2.4 manifest");
 const bytes=readFileSync(new URL(expected.manifest_path,root));
 fail(gitBlob(bytes)===expected.manifest_blob_sha&&
      expected.manifest_blob_sha===doc.w2_4_manifest_git_blob_sha,"W2.4 manifest SHA mismatch");
 return validateBranchClosureReadiness(doc,index,JSON.parse(bytes.toString("utf8")));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try {console.log(JSON.stringify(loadBranchClosureReadiness()));}
 catch(error){console.error(String(error?.message??error));process.exitCode=2;}
}
