import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const state=JSON.parse(readFileSync(new URL("../registers/governance/ce-g02-main-oauth-readiness-20261120.v1.json",import.meta.url),"utf8"));
const doc=readFileSync(new URL("../docs/governance/CE_G02_MAIN_OAUTH_EXECUTION_20261120.md",import.meta.url),"utf8");
test("G02 registro exige prova positiva antes de qualquer GO",()=>{
 const e=state.evidence;
 if(state.release_eligible){
  assert.equal(e.github_branch_protected,true);
  assert.equal(e.active_ruleset_enforcement_verified,true);
  assert.equal(e.historical_secret_revocation_verified,true);
  assert.equal(e.oauth_live_e2e_verified,true);
  assert.equal(e.independent_security_review_verified,true);
  assert.equal(state.controls.G02_RELEASE,"GO");
 }
 assert.equal(state.secret_values_recorded,false);
 assert.ok(["GO","NO_GO"].includes(state.controls.G02_RELEASE));
});
test("G02 instructions preserve the direct-main versus PR incompatibility",()=>{
 assert.match(doc,/PR obrigatório exige ao menos uma branch de origem/);
 assert.match(doc,/G02_SERVER_ENFORCEMENT/);
 assert.match(doc,/OAUTH_REVOKED/);
 assert.equal(state.instructions_path,"docs/governance/CE_G02_MAIN_OAUTH_EXECUTION_20261120.md");
});
