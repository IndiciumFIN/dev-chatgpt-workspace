import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {loadActionQueue} from "./ce-w2-5-action-queue.mjs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url));
const fourth=JSON.parse(read("registers/governance/ce-w2-5-p0-fourthwave-review-20261121.v1.json"));
const earlier=fourth.prior_review_paths.map(path=>JSON.parse(read(path)));
const key=x=>x.path+"|"+x.source_blob_sha;
const gitSha=bytes=>createHash("sha1").update("blob "+bytes.length+"\0").update(bytes).digest("hex");
test("fourth P0 wave: all fifteen source rows anchored to Git-pinned W2.4 objects",()=>{
 const q=loadActionQueue(150);
 assert.deepEqual(fourth.inventoried_relations,{E:2839,C:229,D:70,S:0,T:4});
 assert.equal(fourth.nonidentical_source_files,74);
 assert.equal(fourth.p0_occurrences,15);
 assert.equal(fourth.records.length,15);
 const old=new Map(earlier.flatMap(x=>x.records).map(x=>[key(x),x]));
 const seen=new Set([...old.keys()]);
 let reused=0;
 for(const row of fourth.records){
   const matched=q.queue.find(x=>x.path===row.path&&x.source_blob_sha===row.source_blob_sha&&
      x.source_shas.includes(fourth.source_commit_sha));
   assert.ok(matched,"unanchored W2.4 file: "+row.path);
   assert.equal(matched.priority,"P0");
   assert.equal(matched.baseline_main_blob_sha,row.historical_main_blob_sha);
   assert.equal(row.exact_reuse_from_prior,old.has(key(row)));
   assert.equal(row.status,"HOLD_INDEPENDENT_REVIEW");
   assert.equal(row.final_semantic_disposition,false);
   if(row.exact_reuse_from_prior)reused++;
   seen.add(key(row));
 }
 assert.equal(reused,12);
 assert.equal(seen.size,19);
 assert.equal(fourth.four_wave_prelim_unique_p0,19);
 assert.equal(fourth.total_unique_p0_in_w2_5,359);
 assert.equal(fourth.four_wave_prelim_pct,5.29);
 assert.equal(fourth.independent_review_complete,false);
 assert.equal(fourth.merge_authorized,false);
 assert.equal(fourth.final_semantic_dispositions,0);
});
test("new fourth-wave workflows cannot regress SSR Nitro checks or Git provenance",()=>{
 const newItems=fourth.records.filter(x=>!x.exact_reuse_from_prior);
 assert.equal(newItems.length,3);
 const verify=read(".github/workflows/verify-bibliotecas.yml").toString();
 assert.match(verify,/check-grok-workspace-intake/);
 assert.match(verify,/ce-legacy-reconcile/);
 assert.match(verify,/opa"\s+test\s+--fail-on-empty/);
 for(const item of newItems){
   const canonical=read(item.path).toString();
   if(item.path!==".github/workflows/verify-bibliotecas.yml"){
     assert.equal(gitSha(Buffer.from(canonical)),item.comparison_main_blob_sha);
     assert.match(canonical,/nitro\.json/);
     assert.match(canonical,/__server\.func/);
   }
   assert.equal(item.status,"HOLD_INDEPENDENT_REVIEW");
   assert.match(item.provisional_decision,/^PRESERVE_/);
 }
 assert.equal(fourth.release_eligible,false);
});
