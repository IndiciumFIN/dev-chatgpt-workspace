import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {loadActionQueue} from "./ce-w2-5-action-queue.mjs";
const load=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const f=load("registers/governance/ce-w2-5-p0-firstwave-review-20261121.v1.json");
const s=load("registers/governance/ce-w2-5-p0-secondwave-review-20261121.v1.json");
const t=load("registers/governance/ce-w2-5-p0-thirdwave-review-20261121.v1.json");
test("third W2.5 P0 wave contains 13 Git-pinned source objects and reuses exactly 12",()=>{
 const q=loadActionQueue(100);
 assert.equal(t.protocol,"CE.CROSS.W2.5.P0.THIRD_WAVE_STATIC_REVIEW.v1");
 assert.deepEqual(t.inventoried_relations,{E:2878,C:210,D:50,S:3,T:4});
 assert.equal(t.nonidentical_source_files,57);
 assert.equal(t.records.length,13);
 assert.equal(t.prior_reused_exact,12);
 assert.equal(t.new_distinct_review_objects,1);
 const previous=new Map([...f.records,...s.records].map(x=>[x.path+"|"+x.source_blob_sha,x]));
 const reviewed=new Set([...previous.keys()]);
 for(const row of t.records){
  const key=row.path+"|"+row.source_blob_sha;
  assert.equal(row.exact_reuse_from_prior,previous.has(key));
  assert.equal(row.status,"HOLD_INDEPENDENT_REVIEW");
  assert.equal(row.final_semantic_disposition,false);
  const manifest=q.queue.find(x=>x.path===row.path&&x.source_blob_sha===row.source_blob_sha&&
    x.source_shas.includes(t.source_commit_sha));
  assert.ok(manifest,"missing Git-pinned source object: "+row.path);
  assert.equal(manifest.priority,"P0");
  assert.equal(manifest.baseline_main_blob_sha,row.historical_main_blob_sha);
  reviewed.add(key);
 }
 assert.equal(reviewed.size,16);
 assert.equal(t.three_wave_prelim_unique_p0,16);
 assert.equal(t.total_unique_p0_in_w2_5,359);
 assert.equal(t.three_wave_prelim_pct,4.46);
 assert.equal(t.independent_review_complete,false);
 assert.equal(t.final_semantic_dispositions,0);
 assert.equal(t.merge_authorized,false);
 assert.equal(t.branch_sealed,false);
});
test("temporary generator workflow absent from main: no raw base64 manifest export",()=>{
 const row=t.records.find(x=>x.path===".github/workflows/_temporary-generated-contracts.yml");
 assert.ok(row);
 assert.equal(row.relation,"S");
 assert.equal(row.source_blob_sha,"efbd2c3866c719ba99c45a5c90cf5a0bbf8b2b38");
 assert.equal(row.historical_main_blob_sha,null);
 assert.equal(row.comparison_main_blob_sha,null);
 assert.equal(row.provisional_decision,"HOLD_TEMPORARY_WORKFLOW_EXCESSIVE_LOG_EXPORT");
 assert.equal(t.source_only_workflow_not_admitted,true);
 assert.equal(t.workflow_log_export_review_required,true);
 assert.equal(existsSync(new URL("../"+row.path,import.meta.url)),false);
});
