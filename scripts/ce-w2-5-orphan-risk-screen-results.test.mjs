import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {screenOrphanRisk} from "./ce-w2-5-orphan-risk-screen.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
test("W2.5.1 confirmed GitHub Actions counts match all 6 manifests and closure remains OPEN",()=>{
 const expected=read("registers/governance/ce-w2-5-orphan-risk-screen-results-20261120.v1.json");
 const report=screenOrphanRisk();
 const counts=expected.counts;
 assert.equal(expected.protocol,"CE.CROSS.W2.5.RESULTS.v1");
 assert.equal(report.original_baseline_sha,expected.baseline_main_sha);
 assert.equal(report.inventory_index_git_blob_sha,expected.index_blob_sha);
 assert.equal(report.counted_branches,counts.orphan_branches);
 assert.equal(report.counted_unique_sources,counts.distinct_source_sha);
 assert.equal(report.all_file_rows,counts.file_path_occurrences);
 assert.equal(report.exact_blob_occurrences,counts.exact_git_blob_occurrences);
 assert.equal(report.canonical_only_occurrences,counts.canonical_only_occurrences);
 assert.equal(report.needs_semantic_review_occurrences,counts.nonidentical_origin_occurrences);
 assert.equal(report.unique_path_blob_review_objects,counts.distinct_review_objects_by_path_blob_mode);
 assert.equal(report.reused_path_blob_review_objects,counts.repeated_review_objects_count);
 assert.deepEqual(report.priority_totals,{P0:counts.P0_occurrences,P1:counts.P1_occurrences,P2:counts.P2_occurrences});
 assert.equal(expected.first_review_wave.length,4);
 for(let i=0;i<4;i++){
  const a=report.quick_start[i],b=expected.first_review_wave[i];
  assert.equal(a.source_sha,b.source_sha);
  assert.equal(a.needs_review,b.delta);
  assert.equal(a.priorities.P0,b.p0);
 }
 assert.equal(expected.first_wave_content_spot_checks.length,8);
 assert.equal(new Set(expected.first_wave_content_spot_checks.map(x=>x.path)).size,8);
 assert.equal(expected.semantic_final_dispositions,0);
 assert.equal(expected.authorization_to_merge,false);
 assert.equal(expected.remote_db_write,false);
 assert.equal(expected.independent_review_complete,false);
 assert.equal(expected.closure_status,"OPEN");
 assert.equal(expected.no_revisit,false);
});
