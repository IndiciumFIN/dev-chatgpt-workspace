import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {classifyPath} from "./ce-w2-5-orphan-risk-screen.mjs";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
test("W2.6.1 13 P0 route/component candidate deltas pinned, safely reusing 9 Grook exact blob comparisons",()=>{
 const r=load("registers/governance/ce-w2-6-1-route-component-p0-content-review-20261120.v1.json"),m=load(r.source_manifest),p=load(r.prior_content_review);
 const origin=m.sources.find(x=>x.source_sha===r.source_sha);
 assert.ok(origin);assert.equal(origin.source_tree_sha,r.source_tree_sha);
 assert.equal(r.protocol,"CE.CROSS.W2.6.1.ROUTE_COMPONENT_P0.v1");
 assert.equal(r.source_branch,"fix/ce-route-component-contract-freshness-20261114");
 const delta=origin.rows.filter(x=>["D","S","T"].includes(x[1]));
 const expected=delta.filter(x=>classifyPath(x[0])[0]==="P0");
 assert.equal(delta.length,56);
 assert.equal(expected.length,13);
 assert.deepEqual(r.queue.map(x=>x.path),expected.map(x=>x[0]));
 for(let i=0;i<expected.length;i++){
  const item=r.queue[i],row=expected[i];
  assert.equal(item.relation,row[1]);
  assert.equal(item.source_blob_sha,row[2]||null);
  assert.equal(item.baseline_main_blob_sha,row[3]||null);
  assert.ok(item.observed_difference.length>20);
  assert.ok(item.required_proof.length>15);
  assert.equal(item.finalized_semantic_decision,null);
  assert.equal(item.independent_review,false);
  assert.equal(item.merge_eligible,false);
 }
 const reused=r.queue.filter(x=>x.evidence_mode==="REUSED_IDENTICAL_GROOK_SOURCE_MAIN_BLOB_PAIR");
 assert.equal(reused.length,9);
 for(const item of reused){
  const prior=p.records.find(x=>x.path===item.path);
  assert.ok(prior);
  assert.equal(prior.source_blob_sha,item.source_blob_sha);
  assert.equal(prior.baseline_main_blob_sha,item.baseline_main_blob_sha);
 }
 assert.equal(r.counts.new_pair_content_inspections,4);
 assert.equal(r.counts.remaining_non_p0_content_deltas,43);
 assert.equal(r.counts.semantic_final_approved,0);
 assert.equal(r.counts.source_branches_sealed,0);
 assert.equal(r.closure_status,"OPEN");
 assert.equal(r.merge_authorized,false);
 assert.equal(r.delete_authorized,false);
 assert.equal(r.remote_db_write_authorized,false);
});
