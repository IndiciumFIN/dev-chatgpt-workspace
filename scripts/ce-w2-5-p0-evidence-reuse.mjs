#!/usr/bin/env node
/**
 * W2.5: reuse PRELIMINARY static P0 findings by exact source blob identity.
 * Every input is pinned by W2.4 Git blob, with zero automatic admission.
 * This never replaces source review, independent approval or clinical release.
 */
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolve} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";
import {classifyPath} from "./ce-w2-5-orphan-risk-screen.mjs";
import {loadActionQueue} from "./ce-w2-5-action-queue.mjs";

const root=new URL("../",import.meta.url);
const sourcePaths=[
 "registers/governance/ce-w2-5-p0-firstwave-review-20261121.v1.json",
 "registers/governance/ce-w2-5-p0-secondwave-review-20261121.v1.json",
 "registers/governance/ce-w2-5-p0-thirdwave-review-20261121.v1.json",
 "registers/governance/ce-w2-5-p0-fourthwave-review-20261121.v1.json",
 "registers/governance/ce-w2-5-p0-fifthwave-review-20261121.v1.json",
 "registers/governance/ce-w2-5-p0-sixthwave-review-20261121.v1.json",
 "registers/governance/ce-w2-5-p0-seventhwave-review-20261121.v1.json",
 "registers/governance/ce-w2-5-p0-eighthwave-review-20261121.v1.json"
];
const proof=(condition,reason)=>{if(!condition)throw Error("CE_P0_REUSE_HOLD:"+reason);};
const read=p=>JSON.parse(readFileSync(new URL(p,root),"utf8"));
const shaBlob=bytes=>createHash("sha1").update("blob "+bytes.length+"\0").update(bytes).digest("hex");
const objectKey=(path,blob,mode="")=>JSON.stringify([path,blob,mode]);
export const sameCanonicalBaseline=(recorded,observed)=>(recorded??null)===(observed??null);

export function normalizeReviewEvidence(documents){
 proof(Array.isArray(documents)&&documents.length===8,"eight wave reviews are required");
 const [first,second,third,fourth,fifth,sixth,seventh,eighth]=documents;
 proof(first?.protocol==="CE.CROSS.W2.5.P0.FIRST_WAVE_STATIC_REVIEW.v1"&&
       second?.protocol==="CE.CROSS.W2.5.P0.SECOND_WAVE_STATIC_REVIEW.v1"&&
       third?.protocol==="CE.CROSS.W2.5.P0.THIRD_WAVE_STATIC_REVIEW.v1"&&
       fourth?.protocol==="CE.CROSS.W2.5.P0.FOURTH_WAVE_STATIC_REVIEW.v1"&&
       fifth?.protocol==="CE.CROSS.W2.5.P0.FIFTH_WAVE_STATIC_REVIEW.v1"&&
       sixth?.protocol==="CE.CROSS.W2.5.P0.SIXTH_WAVE_STATIC_REVIEW.v1"&&
       seventh?.protocol==="CE.CROSS.W2.5.P0.SEVENTH_WAVE_STATIC_REVIEW.v1"&&
       eighth?.protocol==="CE.CROSS.W2.5.P0.EIGHTH_WAVE_STATIC_REVIEW.v1","unexpected review protocol");
 const referenceShas=new Set();
 const canonical=new Map(),registrations=new Map();
 for(const doc of documents){
  proof(/^[0-9a-f]{40}$/.test(doc.source_commit_sha??""),"missing immutable source SHA");
  proof(!referenceShas.has(doc.source_commit_sha),"repeat source commit");
  referenceShas.add(doc.source_commit_sha);
  proof(doc.independent_review_complete===false&&
        (doc.semantic_final_dispositions??doc.final_semantic_dispositions)===0 &&
        doc.branch_sealed===false &&
        (doc.merge_authorized??doc.release_authorized)===false,
        "an input document claims closure or admission");
  proof(Array.isArray(doc.records),"review records unavailable");
  for(const entry of doc.records){
   const key=objectKey(entry.path,entry.source_blob_sha);
   proof(/^[0-9a-f]{40}$/.test(entry.source_blob_sha??"")&&
       typeof entry.path==="string"&&entry.path.length>0,"invalid source evidence");
   proof((entry.status??entry.approval_status)==="HOLD_INDEPENDENT_REVIEW" &&
       entry.final_semantic_disposition!==true &&
       typeof entry.provisional_decision==="string","review falsely claims closure");
   const prev=canonical.get(key);
   const baseline=entry.historical_main_blob_sha??entry.canonical_blob_sha??null;
   if(prev){
     proof(prev.provisional_decision===entry.provisional_decision,"contradictory P0 finding for same Git blob");
     proof(prev.baseline===baseline,"mismatched canonical snapshot for reviewed object");
   } else canonical.set(key,{path:entry.path,sha:entry.source_blob_sha,mode:"",
        baseline,provisional_decision:entry.provisional_decision});
   const reg=JSON.stringify([doc.source_commit_sha,entry.path,entry.source_blob_sha]);
   proof(!registrations.has(reg),"same source review entered twice");
   registrations.set(reg,false);
  }
 }
 proof(first.records.length===11&&second.records.length===13&&third.records.length===13&&
       fourth.records.length===15&&fifth.records.length===20&&sixth.records.length===10&&seventh.records.length===10&&eighth.records.length===11,"unexpected wave widths");
 proof(canonical.size===33&&registrations.size===103,"object/provenance dedup regression");
 return {canonical,registrations};
}

export function projectEvidenceReuse(){
 const baseline=loadActionQueue(1); // verifies 6 manifests and index SHA, priority totals, 15,374 objects
 const index=read("registers/governance/ce-w2-4-orphan-full-file-index-20261120.v1.json");
 const docs=sourcePaths.map(read);
 const {canonical,registrations}=normalizeReviewEvidence(docs);
 proof(index.counts?.branches===23&&index.counts?.distinct_source_sha===22&&
       index.batches?.length===6,"changed W2.4 universe");
 const sourceIndex=new Map(index.sources.map(s=>[s.source_sha,s]));
 const matchedObjects=new Set(),matchedSources=new Map();
 let totalP0=0,matchedP0=0,quarantinedDifferentBaseline=0,sourceOnlyMissingCanonical=0,canonicalConflict=0;
 const distinctP0=new Set(),observedSources=new Set();
 for(const batch of index.batches){
  const bytes=readFileSync(new URL(batch.path,root));
  proof(shaBlob(bytes)===batch.git_blob_sha,"manifest SHA mismatch "+batch.path);
  const data=JSON.parse(bytes.toString("utf8"));
  proof(data.protocol==="CE.CROSS.W2.4"&&data.sources.length===batch.unique_sources,
       "unexpected manifest structure");
  for(const src of data.sources){
   const expected=sourceIndex.get(src.source_sha);
   proof(expected&&expected.manifest_path===batch.path&&
      JSON.stringify(expected.branches)===JSON.stringify(src.branches)&&
      !observedSources.has(src.source_sha),"source provenance/alias changed");
   observedSources.add(src.source_sha);
   let srcHits=0;
   for(const row of src.rows){
    const [path,rel,sha,baselineBlob]=row;
    if(!["D","S","T"].includes(rel))continue;
    if(classifyPath(path)[0]!=="P0")continue;
    const key=objectKey(path,sha,rel==="T"?row[4]??"":"");
    totalP0++;distinctP0.add(key);
    const reviewed=canonical.get(key);
    if(!reviewed)continue;
    // Confirm provenance of exact path+blob independent of canonical baseline.
    // A different canonical baseline is a separate review case, not a free pass.
    const origin=JSON.stringify([src.source_sha,path,sha]);
    if(registrations.has(origin))registrations.set(origin,true);
    if(!sameCanonicalBaseline(reviewed.baseline,baselineBlob)){
      // Same source payload against a different canonical file is NOT equivalent
      // evidence. Keep this occurrence for explicit comparative review.
      quarantinedDifferentBaseline++;
      if(rel==="S"&&reviewed.baseline===null&&baselineBlob==="")sourceOnlyMissingCanonical++;
      else canonicalConflict++;
      continue;
    }
    matchedObjects.add(key);matchedP0++;srcHits++;
   }
   if(srcHits>0)matchedSources.set(src.source_sha,{branches:src.branches,occurrences:srcHits});
  }
 }
 proof(totalP0===842&&distinctP0.size===359,"P0 universe/unique objects changed");
 proof(matchedObjects.size>0&&matchedObjects.size<=canonical.size,"no projectable evidence found in pinned W2.4");
 proof([...registrations.values()].every(Boolean),"direct review was not found in its original manifest");
 proof(observedSources.size===22,"missing source in W2.4");
 const branchNames=new Set([...matchedSources.values()].flatMap(s=>s.branches));
 const result={
  protocol:"CE.CROSS.W2.5.P0.EVIDENCE_REUSE.v1",
  state:"PRELIMINARY_STATIC_ONLY_NO_ADMISSION",
  source_manifest_batches:6,source_commits:22,source_branches:23,
  total_p0_occurrences:totalP0,total_p0_unique_objects:distinctP0.size,
  reviewed_p0_unique_objects:canonical.size,
  projectable_p0_unique_objects:matchedObjects.size,
  unprojected_baseline_hold_objects:canonical.size-matchedObjects.size,
  reviewed_p0_occurrences:matchedP0,
  same_content_different_baseline_hold_occurrences:quarantinedDifferentBaseline,
  source_only_without_canonical_baseline_occurrences:sourceOnlyMissingCanonical,
  canonical_baseline_conflict_occurrences:canonicalConflict,
  source_only_review_objects_without_canonical_baseline:[...canonical.values()].filter(x=>x.baseline===null).length,
  direct_review_registrations:registrations.size,
  sources_with_exact_content_matches:matchedSources.size,
  branches_with_exact_content_matches:branchNames.size,
  unique_p0_preliminary_progress_percent:Number((canonical.size/distinctP0.size*100).toFixed(2)),
  unique_p0_projectable_percent:Number((matchedObjects.size/distinctP0.size*100).toFixed(2)),
  remaining_p0_unique_objects:distinctP0.size-canonical.size,
  independent_approvals:0,final_semantic_dispositions:0,
  branch_closures:0,source_writes:0,remote_db_writes:0,
  published_clinical_content:0,merge_authorized:false,
  review_scope:"EXACT_PATH_GIT_BLOB_SHA_ONLY",
  per_source:[...matchedSources].map(([sha,x])=>({
     source_sha:sha,branches:x.branches,matched_p0_occurrences:x.occurrences
  })).sort((a,b)=>a.source_sha.localeCompare(b.source_sha))
 };
 proof(result.reviewed_p0_occurrences>=1&&
       result.reviewed_p0_occurrences+result.same_content_different_baseline_hold_occurrences>=52,
       "no reusable matches or missing source registrations");
 return result;
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 try{
  proof(process.argv.length===2,"read-only script takes no arguments");
  console.log(JSON.stringify(projectEvidenceReuse()));
 } catch(e){console.error(String(e?.message||e));process.exitCode=2;}
}
