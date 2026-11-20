import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=(path)=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const original=read("registers/governance/ce-w2-4-orphan-full-file-batch-02-20261120.v1.json");
const prior=read("registers/governance/ce-w2-6-1-route-component-p0-content-review-20261120.v1.json");
const review=read("registers/governance/ce-w2-6-2-route-component-remaining-content-review-20261120.v1.json");
test("W2.6.2: all immutable historical deltas have one content-review trace",()=>{
 const src=original.sources.find((row)=>row.source_sha===review.source_commit_sha);
 assert.ok(src,"pinned source missing");
 const deltas=src.rows.filter((row)=>["D","S","T"].includes(row[1]));
 const p0=new Map(prior.queue.map((row)=>[row.path,row]));
 const rest=new Map(review.rows.map((row)=>[row.path,row]));
 assert.equal(deltas.length,56);assert.equal(p0.size,13);assert.equal(rest.size,43);
 for(const [path] of p0) assert.ok(!rest.has(path),"duplicate review "+path);
 for(const [path,relation,source,baseline] of deltas){
  const entry=p0.get(path)||rest.get(path);
  assert.ok(entry,"unreviewed origin delta "+path);
  assert.equal(entry.source_blob_sha,source,path+": source SHA");
  assert.equal(entry.baseline_main_blob_sha||null,baseline||null,path+": baseline SHA");
  if(rest.has(path)){ assert.equal(entry.original_relation,relation);assert.equal(entry.content_pair_compared,true);assert.ok(entry.observed_content_difference);assert.ok(entry.required_proof);assert.equal(entry.final_semantic_decision,null);assert.equal(entry.merge_eligible,false); }
 }
 assert.equal(review.counts.combined_content_compared,deltas.length);
 assert.equal(review.counts.current_same_as_prior_baseline+review.counts.current_evolved+review.counts.source_only_absent_current,43);
 assert.equal(review.counts.source_mode_executable_changed,4);
});
test("W2.6.2 never implies branch seal, clinical release or authorization",()=>{
 assert.equal(review.closure_status,"OPEN");
 assert.equal(review.no_revisit,false);
 assert.equal(review.independent_review_complete,false);
 assert.equal(review.publication_authorized,false);
 assert.equal(review.remote_db_write_authorized,false);
 assert.equal(review.delete_authorized,false);
 assert.equal(review.merge_authorized,false);
 assert.equal(review.counts.branches_sealed,0);
 assert.equal(review.counts.final_semantic_decisions,0);
});
