import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {validateBranchDelta,verifyCurrentSnapshot} from "./ce-branch-inventory-delta-verify.mjs";
const parent = new URL("../",import.meta.url);
const bytes=readFileSync(new URL("registers/governance/ce-branch-completion-20261120.v1.json",parent));
const old=JSON.parse(bytes);
const sha=createHash("sha1").update("blob "+bytes.length+"\0").update(bytes).digest("hex");
const json=JSON.parse(readFileSync(new URL("registers/governance/ce-branch-inventory-delta-20261121.v1.json",parent)));
test("CE branch delta: immutable 63 baseline + six new refs + two moved HEADs",()=>{
 assert.deepEqual(validateBranchDelta(json,old,sha),[]);
 assert.deepEqual({new:json.new_refs.length,moved:json.moved_refs.length,ce:json.cohort.ce_refs_observed},{new:6,moved:2,ce:54});
 assert.equal(verifyCurrentSnapshot().verified,true);
});
test("CE branch delta fails closed on silent sealing, missing ref, tampered SHA, forged remote proof",()=>{
 for(const [label,edit] of [
  ["SEALED",x=>{x.new_refs[0].closure_status="SEALED";}],
  ["review",x=>{x.new_refs[0].independent_review_complete=true;}],
  ["missing",x=>{x.new_refs.pop();}],
  ["sha",x=>{x.new_refs[0].observed_tree_sha="bad";}],
  ["original",x=>{x.moved_refs[0].previous_sha="bad";}],
  ["main",x=>{x.snapshot_main_sha="0".repeat(40);}]
 ]){
  const x=structuredClone(json); edit(x);
  assert.notDeepEqual(validateBranchDelta(x,old,sha),[],label);
 }
 assert.notDeepEqual(validateBranchDelta(json,old,"0".repeat(40)),[]);
});
