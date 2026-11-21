import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {matchesPinnedTextBlob} from "./ce-w2-5-git-text-sha.mjs";
import {loadActionQueue} from "./ce-w2-5-action-queue.mjs";
const file=p=>readFileSync(new URL("../"+p,import.meta.url));
const data=JSON.parse(file("registers/governance/ce-w2-5-p0-secondwave-review-20261121.v1.json"));
const first=JSON.parse(file(data.first_wave_path));
test("second W2.5 P0 wave has 13 grounded SHA pairs with exactly nine safe evidence reuses",()=>{
 const q=loadActionQueue(100);
 assert.equal(data.protocol,"CE.CROSS.W2.5.P0.SECOND_WAVE_STATIC_REVIEW.v1");
 assert.equal(data.second_wave_file_delta,56);
 assert.equal(data.second_wave_p0_occurrences,13);
 assert.equal(data.records.length,13);
 assert.equal(data.second_wave_exactly_reused_p0,9);
 assert.equal(data.second_wave_new_p0_objects,4);
 assert.equal(data.combined_first_two_waves_distinct_p0_objects,15);
 assert.equal(data.total_distinct_p0_objects_w2_5,359);
 assert.equal(data.combined_prelim_review_progress_pct,4.18);
 assert.deepEqual(data.inventoried_relations,{E:2879,C:210,D:49,S:3,T:4});
 const firstItems=new Set(first.records.map(x=>x.path+"|"+x.source_blob_sha));
 const unique=new Set();
 for(const x of data.records){
  const key=x.path+"|"+x.source_blob_sha;
  assert.ok(!unique.has(key));unique.add(key);
  assert.equal(x.exact_reuse_from_first_wave,firstItems.has(key));
  assert.equal(x.status,"HOLD_INDEPENDENT_REVIEW");
  assert.equal(x.final_semantic_disposition,false);
  assert.match(x.provisional_decision,/^(PRESERVE_|HOLD_)/);
  const match=q.queue.find(t=>t.path===x.path&&t.source_blob_sha===x.source_blob_sha&&
      t.source_shas.includes(data.source_commit_sha));
  assert.ok(match,"not in pinned W2.4 manifests: "+x.path);
  assert.equal(match.priority,"P0");
  assert.equal(match.baseline_main_blob_sha,x.historical_main_blob_sha);
  if(x.relationship==="S")assert.equal(x.historical_main_blob_sha,null);
  else if(x.path!==".github/workflows/verify-bibliotecas.yml"&&x.path!==".github/workflows/admin-ux-e2e.yml")
    assert.ok(matchesPinnedTextBlob(file(x.path),x.comparison_main_blob_sha),"canonical code changed beyond CRLF/LF: "+x.path);
 }
 assert.equal([...unique].filter(x=>firstItems.has(x)).length,9);
 assert.equal(new Set([...firstItems,...unique]).size,15);
});
test("new historical CI workflow must not be adopted before both dependencies exist",()=>{
 const x=data.records.find(x=>x.path===".github/workflows/ce-route-component-contract-freshness.yml");
 assert.ok(x&&x.relationship==="S"&&!x.comparison_main_blob_sha);
 assert.equal(x.provisional_decision,"HOLD_SOURCE_ONLY_WORKFLOW_MISSING_DEPENDENCIES");
 assert.equal(data.source_only_workflow_not_admitted,true);
 assert.equal(existsSync(new URL("../.github/workflows/ce-route-component-contract-freshness.yml",import.meta.url)),false);
 assert.equal(existsSync(new URL("../scripts/check-route-component-contract-freshness.mjs",import.meta.url)),false);
 assert.equal(existsSync(new URL("../scripts/audit-clinical-contract-drift.mjs",import.meta.url)),false);
});
test("do not replace expanded canonical admin and governance CI or auth gate",()=>{
 const admin=file(".github/workflows/admin-ux-e2e.yml").toString();
 assert.match(admin,/CE_ADMIN_E2E_FIXTURE/);
 assert.match(admin,/ce-area-access-policy/);
 const verify=file(".github/workflows/verify-bibliotecas.yml").toString();
 assert.match(verify,/check-grok-workspace-intake/);
 assert.match(verify,/ce-legacy-reconcile/);
 assert.match(verify,/opa"\s+test\s+--fail-on-empty/);
 const auth=file("src/lib/auth/client.ts").toString();
 assert.match(auth,/authEnabled\s*=\s*import\.meta\.env\.VITE_AUTH_ENABLED\s*===\s*"true"/);
 assert.equal(data.independent_review_complete,false);
 assert.equal(data.final_semantic_dispositions,0);
 assert.equal(data.merge_authorized,false);
 assert.equal(data.credential_rotation_verified,false);
});
