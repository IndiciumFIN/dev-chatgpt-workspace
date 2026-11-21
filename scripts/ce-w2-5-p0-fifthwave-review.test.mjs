import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {classifyPath} from "./ce-w2-5-orphan-risk-screen.mjs";
import {loadActionQueue} from "./ce-w2-5-action-queue.mjs";
import {projectEvidenceReuse} from "./ce-w2-5-p0-evidence-reuse.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const ix=read("registers/governance/ce-w2-4-orphan-full-file-index-20261120.v1.json");
const fifth=read("registers/governance/ce-w2-5-p0-fifthwave-review-20261121.v1.json");
const earlier=fifth.prior_review_paths.map(read);
const key=x=>JSON.stringify([x.path,x.source_blob_sha]);
test("fifth P0 wave: twenty exact source rows and eight new source-only HOLDs",()=>{
 loadActionQueue(100); // always verify all six pinned immutable manifests first
 const source=read(ix.sources.find(x=>x.source_sha===fifth.source_commit_sha).manifest_path)
   .sources.find(x=>x.source_sha===fifth.source_commit_sha);
 assert.ok(source);
 assert.deepEqual(fifth.inventoried_relations,{E:2857,C:229,D:52,S:164,T:4});
 assert.equal(fifth.nonidentical_source_files,220);
 assert.equal(fifth.p0_occurrences,20);
 assert.equal(fifth.records.length,20);
 const p0=source.rows.filter(x=>["D","S","T"].includes(x[1])&&classifyPath(x[0])[0]==="P0");
 assert.equal(p0.length,20);
 const older=new Map(earlier.flatMap(z=>z.records).map(x=>[key(x),x]));
 const unique=new Set();
 for(const rec of fifth.records){
  const origin=p0.find(row=>row[0]===rec.path&&row[2]===rec.source_blob_sha);
  assert.ok(origin,"unanchored Git source blob: "+rec.path);
  assert.equal(rec.relationship,origin[1]);
  assert.equal(rec.historical_main_blob_sha,origin[3]||null);
  assert.equal(rec.priority,"P0");
  assert.equal(rec.exact_reuse_from_prior,older.has(key(rec)));
  if(rec.exact_reuse_from_prior)assert.equal(rec.provisional_decision,older.get(key(rec)).provisional_decision);
  else {
   assert.equal(rec.relationship,"S");
   assert.equal(rec.historical_main_blob_sha,null);
   assert.equal(rec.comparison_main_blob_sha,null);
   assert.match(rec.provisional_decision,/^HOLD_/);
   assert.equal(existsSync(new URL("../"+rec.path,import.meta.url)),false);
  }
  assert.equal(rec.status,"HOLD_INDEPENDENT_REVIEW");
  assert.equal(rec.final_semantic_disposition,false);
  assert.ok(rec.required_next_evidence.length>45);
  assert.ok(!unique.has(key(rec)),"duplicate P0 record");unique.add(key(rec));
 }
 assert.equal(fifth.exact_reuses,12);
 assert.equal(fifth.new_distinct_review_objects,8);
 assert.equal(fifth.fifth_wave_prelim_unique_p0,27);
 assert.equal(fifth.fifth_wave_prelim_pct,7.52);
 assert.equal(fifth.managed_auth_admission,false);
 assert.equal(fifth.live_auth_column_policy_grant_parity_proven,false);
 assert.equal(fifth.independent_review_complete,false);
 assert.equal(fifth.branch_sealed,false);
 assert.equal(fifth.merge_authorized,false);
 assert.equal(fifth.remote_db_write,false);
});
test("fifth wave does not approve managed Supabase auth or historical Git-pushing workflows",()=>{
 const novel=fifth.records.filter(x=>!x.exact_reuse_from_prior);
 assert.equal(novel.length,8);
 assert.equal(novel.filter(x=>x.path.startsWith(".github/workflows/")).length,6);
 assert.equal(novel.filter(x=>x.path.endsWith("/schemas/auth.json")).length,2);
 assert.equal(fifth.live_auth_table_names_checked_read_only,27);
 assert.equal(fifth.history_auth_table_names,27);
 const projected=projectEvidenceReuse();
 assert.equal(projected.reviewed_p0_unique_objects,31);
 assert.equal(projected.projectable_p0_unique_objects,21);
 assert.equal(projected.source_only_review_objects_without_canonical_baseline,10);
 assert.equal(projected.independent_approvals,0);
 assert.equal(projected.branch_closures,0);
});
