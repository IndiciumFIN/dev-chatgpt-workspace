import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {classifyPath} from "./ce-w2-5-orphan-risk-screen.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
test("W2.5.2: all 11 P0 grook differences have pinned source/main blobs and remain OPEN",()=>{
 const r=read("registers/governance/ce-w2-5-grook-p0-first-wave-20261120.v1.json");
 const file=read(r.full_file_source_manifest);
 const candidate=file.sources.find(x=>x.source_sha===r.origin_commit_sha);
 assert.ok(candidate);
 assert.equal(r.origin_branch,"grook_10_26");
 assert.equal(r.origin_tree_sha,candidate.source_tree_sha);
 assert.deepEqual(candidate.branches,[r.origin_branch]);
 assert.equal(file.main_baseline_sha,r.main_baseline_sha);
 assert.equal(r.entire_delta_count,candidate.counts.D+candidate.counts.S+candidate.counts.T);
 assert.equal(r.entire_delta_count,47);
 const expected=candidate.rows.filter(x=>["D","S","T"].includes(x[1])&&classifyPath(x[0])[0]==="P0");
 assert.equal(expected.length,11);
 assert.equal(r.P0_count,11);
 assert.equal(r.queue.length,11);
 assert.deepEqual(r.queue.map(x=>x.path),expected.map(x=>x[0]));
 for(let i=0;i<expected.length;i++){
  const e=expected[i],q=r.queue[i];
  assert.equal(q.relation,e[1]);assert.equal(q.source_blob_sha,e[2]);assert.equal(q.baseline_blob_sha,e[3]);
  assert.equal(q.priority,"P0");assert.equal(q.rights_verification,"NOT_VERIFIED");assert.equal(q.security_gate,"HOLD_PENDING_PROOF");assert.equal(q.final_decision,null);
 }
 assert.equal(r.final_semantic_dispositions,0);
 assert.equal(r.closure_status,"OPEN");
 assert.equal(r.no_revisit,false);
 assert.equal(r.merge_authorized,false);
 assert.equal(r.delete_branch_authorized,false);
 assert.equal(r.remote_database_writes_authorized,false);
});
