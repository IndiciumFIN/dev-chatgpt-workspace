import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {loadActionQueue,buildActionQueue,requireClosed} from "./ce-w2-5-action-queue.mjs";
const parse=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const ix="registers/governance/ce-w2-4-orphan-full-file-index-20261120.v1.json";
const rs="registers/governance/ce-w2-5-orphan-risk-screen-results-20261120.v1.json";
test("W2.5 creates an evidenced, nonempty P0 queue from the six pinned manifests",()=>{
 const report=loadActionQueue(25);
 assert.equal(report.state,"OPEN_NO_ADMISSION");
 assert.deepEqual(report.source_counts,{branches:23,unique_commits:22});
 assert.equal(report.source_occurrences.E,36591);
 assert.equal(report.source_occurrences.C,25317);
 assert.equal(report.source_occurrences.D+report.source_occurrences.S+report.source_occurrences.T,30551);
 assert.deepEqual(report.priority_occurrences,{P0:842,P1:4522,P2:25187});
 assert.equal(report.distinct_review_objects,15374);
 assert.equal(report.shared_review_objects,9273);
 assert.equal(report.first_wave_p0_occurrences,52);
 assert.equal(report.first_wave.length,4);
 assert.equal(report.queue.length,25);
 assert.ok(report.queue.every(x=>x.priority==="P0"&&x.status==="PENDING_SEMANTIC_REVIEW"&&
   /^[0-9a-f]{40}$/.test(x.source_blob_sha)&&x.source_shas.length>0&&x.branches.length>0));
 assert.equal(report.completed_semantic_reviews,0);
 assert.equal(report.branches_sealed,0);
 assert.equal(report.merge_authorized,false);
 assert.throws(()=>requireClosed(report),/cannot declare completion/);
});
test("refuse fabricated completion or an empty priority universe",()=>{
 const index=parse(ix),screen=parse(rs);
 assert.throws(()=>buildActionQueue(index,{...screen,semantic_final_dispositions:1},()=>{throw Error("unexpected batch read");}),
   /incorrectly claimed approved/);
 assert.throws(()=>buildActionQueue(index,{...screen,counts:{...screen.counts,orphan_branches:0}},()=>{throw Error("unexpected batch read");}),
   /census mismatch/);
 assert.throws(()=>buildActionQueue(index,{...screen,first_review_wave:[]},()=>{throw Error("unexpected batch read");}),
   /first-wave not evidenced/);
});
