import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {classifyPath} from "./ce-w2-5-orphan-risk-screen.mjs";
import {loadActionQueue} from "./ce-w2-5-action-queue.mjs";
import {normalizeReviewEvidence,projectEvidenceReuse} from "./ce-w2-5-p0-evidence-reuse.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const ix=read("registers/governance/ce-w2-4-orphan-full-file-index-20261120.v1.json");
const wave=read("registers/governance/ce-w2-5-p0-sixthwave-review-20261121.v1.json");
test("sixth W2.5 P0 wave: exact Git evidence, six reused and four distinct new HOLD",()=>{
 loadActionQueue(100);
 const ptr=ix.sources.find(x=>x.source_sha===wave.source_commit_sha);
 assert.ok(ptr&&ptr.branches.includes(wave.source_branch));
 assert.equal(ptr.manifest_path,wave.source_manifest_path);
 assert.equal(ix.batches.find(x=>x.path===ptr.manifest_path).git_blob_sha,wave.source_manifest_blob_sha);
 const src=read(ptr.manifest_path).sources.find(x=>x.source_sha===wave.source_commit_sha);
 assert.ok(src);
 assert.deepEqual(wave.inventoried_relations,{E:1934,C:810,D:105,S:0,T:293});
 assert.equal(wave.nonidentical_source_files,398);
 const p0=src.rows.filter(r=>["D","S","T"].includes(r[1])&&classifyPath(r[0])[0]==="P0");
 assert.equal(p0.length,10);
 assert.equal(wave.p0_occurrences,10);
 assert.equal(wave.records.length,10);
 const older=new Map(wave.prior_review_paths.flatMap(p=>read(p).records).map(x=>[JSON.stringify([x.path,x.source_blob_sha]),x]));
 const seen=new Set();
 for(const v of wave.records){
  const r=p0.find(r=>r[0]===v.path&&r[2]===v.source_blob_sha);
  assert.ok(r,"missing original Git evidence "+v.path);
  assert.equal(v.relationship,r[1]);
  assert.equal(v.historical_main_blob_sha,r[3]||null);
  if(r[4]!==undefined)assert.equal(v.source_mode,r[4]);
  else assert.match(v.source_mode,/^100(644|755)$/);
  const key=JSON.stringify([v.path,v.source_blob_sha]);
  assert.ok(!seen.has(key));seen.add(key);
  assert.equal(v.exact_reuse_from_prior,older.has(key));
  if(older.has(key))assert.equal(v.provisional_decision,older.get(key).provisional_decision);
  else {
   assert.equal(v.relationship,"D");
   assert.match(v.provisional_decision,/^HOLD_/);
   assert.ok(v.comparison_main_blob_sha);
  }
  assert.equal(v.status,"HOLD_INDEPENDENT_REVIEW");
  assert.equal(v.final_semantic_disposition,false);
  assert.ok(v.required_next_evidence.length>60);
 }
 assert.equal(wave.exact_reuses,6);
 assert.equal(wave.new_distinct_review_objects,4);
 assert.equal(wave.sixth_wave_prelim_unique_p0,31);
 assert.equal(wave.sixth_wave_prelim_pct,8.64);
 for(const field of ["independent_review_complete","branch_sealed","merge_authorized","remote_db_write","production_deploy_authorized","release_eligible"])assert.equal(wave[field],false);
});
test("sixth wave keeps auth/migrations on HOLD and rejects false approvals",()=>{
 const novel=wave.records.filter(x=>!x.exact_reuse_from_prior);
 assert.deepEqual(novel.map(x=>x.path).sort(),["scripts/migrate.mjs","src/lib/auth/client.ts","src/lib/auth/preview.ts","src/lib/auth/server.ts"]);
 assert.ok(novel.every(x=>x.provisional_decision.startsWith("HOLD_")));
 const r=projectEvidenceReuse();
 assert.equal(r.reviewed_p0_unique_objects,32);
 assert.equal(r.projectable_p0_unique_objects,22);
 assert.equal(r.source_only_review_objects_without_canonical_baseline,10);
 assert.equal(r.remaining_p0_unique_objects,327);
 assert.equal(r.independent_approvals,0);
 assert.equal(r.branch_closures,0);
 const docs=[...wave.prior_review_paths.map(read),wave];
 const forged=structuredClone(docs);
 forged[5].records[0].status="APPROVED";
 assert.throws(()=>normalizeReviewEvidence(forged),/claims closure/);
});
