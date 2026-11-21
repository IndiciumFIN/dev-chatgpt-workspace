import test from "node:test";
import assert from "node:assert/strict";
import {matchesPinnedTextBlob} from "./ce-w2-5-git-text-sha.mjs";
import {readFileSync} from "node:fs";
import {loadActionQueue} from "./ce-w2-5-action-queue.mjs";
const fromRoot=(p)=>readFileSync(new URL("../"+p,import.meta.url));
const register=JSON.parse(fromRoot("registers/governance/ce-w2-5-p0-firstwave-review-20261121.v1.json"));
test("eleven P0 first-wave code pairs are anchored to W2.4 immutable source blobs",()=>{
 const queue=loadActionQueue(100);
 assert.equal(register.protocol,"CE.CROSS.W2.5.P0.FIRST_WAVE_STATIC_REVIEW.v1");
 assert.equal(register.records.length,11);
 assert.equal(register.technically_inspected_source_blob_pairs,11);
 assert.equal(register.first_wave_total_p0_occurrences,11);
 assert.equal(register.semantic_final_dispositions,0);
 assert.equal(register.independent_review_complete,false);
 assert.equal(register.release_authorized,false);
 assert.equal(register.remote_db_write,false);
 assert.equal(register.branch_sealed,false);
 for(const x of register.records){
  const match=queue.queue.find(y=>y.path===x.path&&y.source_blob_sha===x.source_blob_sha&&
   y.source_shas.includes(register.source_commit_sha)&&y.branches.includes(register.source_branch));
  assert.ok(match,"missing W2.4 manifest/blob source: "+x.path);
  assert.equal(match.priority,"P0");
  assert.equal(match.baseline_main_blob_sha,x.canonical_blob_sha);
  assert.ok(matchesPinnedTextBlob(fromRoot(x.path),x.canonical_blob_sha),
   "canonical content changed beyond CRLF/LF, re-review: "+x.path);
  assert.equal(x.approval_status,"HOLD_INDEPENDENT_REVIEW");
  assert.match(x.provisional_decision,/^PRESERVE_/);
  assert.ok(x.required_next_evidence.length>35);
 }
});
test("canonical P0 safety invariants not silently reversed by historical imports",()=>{
 const migrate=fromRoot("scripts/migrate.mjs").toString("utf8");
 assert.match(migrate,/CE_DB_MIGRATION_APPROVED\s*===\s*"true"/);
 assert.match(migrate,/process\.argv\[2\]\s*===\s*"--approved"/);
 assert.match(migrate,/process\.env\.GITHUB_ACTIONS\s*===\s*"true"/);
 assert.ok(migrate.indexOf("CE_DB_MIGRATION_APPROVED") < migrate.indexOf("new pg.Pool"));
 const client=fromRoot("src/lib/auth/client.ts").toString("utf8");
 assert.match(client,/authEnabled\s*=\s*import\.meta\.env\.VITE_AUTH_ENABLED\s*===\s*"true"/);
 assert.doesNotMatch(client,/genericOAuthClient\(/);
 const gate=fromRoot("src/lib/auth/gate-identity.test.ts").toString("utf8");
 assert.match(gate,/before\(\(\) => \{ process\.env\.VITE_AUTH_ENABLED\s*=\s*"true"/);
 assert.match(gate,/after\(\(\) => \{/);
 const popup=fromRoot("src/lib/auth/popup.server.ts").toString("utf8");
 assert.match(popup,/auth\.api\.signInSocial\(/);
 assert.match(popup,/disableRedirect:\s*true/);
 const preview=fromRoot("src/lib/auth/preview.ts").toString("utf8");
 assert.match(preview,/PREVIEW_CLIENT_SECRET\s*=\s*process\.env\.GROK_PREVIEW_CLIENT_SECRET/);
 const authServer=fromRoot("src/lib/auth/server.ts").toString("utf8");
 assert.match(authServer,/authDisabled\s*=\s*env\("VITE_AUTH_ENABLED"\)\s*!==\s*"true"/);
 const verify=fromRoot("src/lib/auth/verify.server.ts").toString("utf8");
 assert.match(verify,/devFallbackAllowed/);
 assert.match(verify,/process\.env\.NODE_ENV\s*===\s*"development"/);
 assert.match(verify,/!process\.env\.VERCEL/);
 assert.match(verify,/!databaseConfigured/);
 const kernel=fromRoot("src/lib/kernel-admit.ts").toString("utf8");
 assert.match(kernel,/LEGACY_UNTRUSTED_VALIDATOR_IDS/);
 assert.match(kernel,/validatorIds/);
 assert.match(kernel,/ok\s*!==\s*true/);
 assert.match(kernel,/select id, passed from kernel_validator/);
 const kernelTest=fromRoot("src/lib/kernel-admit.test.ts").toString("utf8");
 assert.match(kernelTest,/LEGACY_UNTRUSTED_VALIDATOR_IDS\.length, 9/);
 const migration=fromRoot("scripts/migration-plan.test.mjs").toString("utf8");
 assert.match(migration,/expectedRootSql/);
 assert.match(migration,/existing root migrations must stay visible/);
});
test("P0 findings are provisional, not sealed decisions",()=>{
 const fake=structuredClone(register);
 fake.records[0].approval_status="APPROVED";
 assert.notEqual(fake.records[0].approval_status,"HOLD_INDEPENDENT_REVIEW");
 assert.ok(register.records.every(x=>x.approval_status==="HOLD_INDEPENDENT_REVIEW"));
});
