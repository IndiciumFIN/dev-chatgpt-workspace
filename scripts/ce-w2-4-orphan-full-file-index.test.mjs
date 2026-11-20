import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const read=p=>readFileSync(new URL("../"+p,import.meta.url));
const blob=b=>createHash("sha1").update(`blob ${b.length}\0`).update(b).digest("hex");
test("W2.4: all 23 orphan branches have exhaustive file manifests, 22 unique source SHAs, and no false SEALED",()=>{
 const index=JSON.parse(read("registers/governance/ce-w2-4-orphan-full-file-index-20261120.v1.json"));
 const w2=JSON.parse(read(index.original_w2_manifest));
 assert.equal(index.original_w2_blob_sha,blob(read(index.original_w2_manifest)));
 assert.equal(index.counts.branches,23);
 assert.equal(index.counts.distinct_source_sha,22);
 assert.equal(index.counts.full_file_inventoried,23);
 assert.equal(index.counts.semantic_finally_triaged,0);
 assert.equal(index.counts.branches_sealed,0);
 assert.equal(index.no_revisit,false);
 assert.equal(index.independent_verification,false);
 assert.equal(index.supabase_cross_complete,false);
 assert.equal(index.drive_cross_complete,false);
 assert.equal(index.merge_authorized,false);
 assert.equal(w2.rows.length,23);
 assert.equal(index.original_w2_baseline_sha,w2.baseline_main_sha);
 assert.equal(index.batches.length,6);
 const branch=new Map(),sha=new Map(),totals={E:0,D:0,S:0,C:0,T:0,conflict_paths:0,source_file_occurrences:0,union_path_occurrences:0};
 for(const b of index.batches){
  const raw=read(b.path);
  assert.equal(blob(raw),b.git_blob_sha);
  const data=JSON.parse(raw);
  assert.equal(data.protocol,"CE.CROSS.W2.4");
  assert.equal(data.main_baseline_sha,index.full_file_main_sha);
  assert.equal(data.main_tree_sha,index.full_file_main_tree_sha);
  assert.equal(data.source_orphan_manifest_git_sha,index.original_w2_blob_sha);
  assert.equal(data.semantic_review_complete,false);
  assert.equal(data.closure_status,"OPEN");
  assert.equal(data.no_revisit,false);
  assert.equal(data.merge_authorized,false);
  assert.equal(data.sources.length,b.unique_sources);
  assert.deepEqual(data.sources.flatMap(s=>s.branches),b.branches);
  for(const s of data.sources){
   assert.ok(!sha.has(s.source_sha));
   sha.set(s.source_sha,s);
   assert.equal(s.recursive_truncated,false);
   assert.equal(s.rows.length,s.union_non_tree);
   assert.equal(s.source_non_tree,s.counts.E+s.counts.D+s.counts.S+s.counts.T);
   assert.equal(s.main_non_tree,s.counts.E+s.counts.D+s.counts.C+s.counts.T);
   for(const k of ["E","D","S","C","T"])totals[k]+=s.counts[k];
   totals.conflict_paths+=s.tree_file_conflicts.length;
   totals.source_file_occurrences+=s.source_non_tree;
   totals.union_path_occurrences+=s.union_non_tree;
   for(const name of s.branches){assert.ok(!branch.has(name));branch.set(name,s.source_sha);}
  }
 }
 assert.equal(branch.size,23);
 assert.equal(sha.size,22);
 for(const r of w2.rows)assert.equal(branch.get(r.branch),r.source_sha);
 assert.deepEqual(index.aggregate_occurrences_for_distinct_sha,totals);
 assert.equal(index.sources.length,22);
 for(const r of index.sources){
  const s=sha.get(r.source_sha);assert.ok(s);
  assert.deepEqual(r.branches,s.branches);
  assert.equal(r.source_tree_sha,s.source_tree_sha);
  assert.equal(r.nonidentical_origin_items,s.counts.D+s.counts.S+s.counts.T);
  assert.equal(r.semantic_disposition,"OPEN_UNREVIEWED");
 }
 assert.deepEqual(index.aliases.map(a=>a.branches),[["archivamento","planning"]]);
});
