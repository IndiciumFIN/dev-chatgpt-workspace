import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {verifyG00RefCensus,runG00RefCensus} from "./ce-g00-ref-census-verify.mjs";
const root=new URL("../",import.meta.url);
const index=JSON.parse(readFileSync(new URL("registers/governance/ce-g00-nine-repositories-ref-index-20261121.v1.json",root),"utf8"));
const raw=index.batches.map(x=>readFileSync(new URL(x.path,root)));
const src=raw.map(x=>({sha:createHash("sha1").update("blob "+x.length+"\0").update(x).digest("hex"),data:JSON.parse(x.toString("utf8"))}));
test("G00: 9/9 public repos, 157 pinned refs, no unsupported secret scan claim",()=>{
 const r=runG00RefCensus();
 assert.equal(r.state,"PASS_REF_METADATA_ONLY_G00_OPEN");
 assert.equal(r.repositories,9);
 assert.equal(r.branches,157);
 assert.equal(r.tags,0);
 assert.equal(r.full_history_scanned,false);
 assert.equal(r.secrets_scanned,false);
 assert.equal(r.release_allowed,false);
});
test("G00: reject forged historical scan, rotation, and PII coverage",()=>{
 for(const key of ["all_history_commits_scanned","secrets_scanned","pii_scanned","edge_functions_assessed",
   "git_LFS_and_artifacts_scanned","secret_rotation_verified","gate_G00_closed","external_production_authorized"]){
  const forged=structuredClone(index);forged[key]=true;
  assert.throws(()=>verifyG00RefCensus(forged,src),/forged completion/);
 }
});
test("G00: reject missing repo, forged ref, duplicate refs and source manifest SHA",()=>{
 const docs=structuredClone(src);
 docs[0].data.records.pop();
 assert.throws(()=>verifyG00RefCensus(index,docs),/source batch/);
 const changed=structuredClone(src);
 changed[0].data.records[0].refs[0].sha="not-a-git-oid";
 assert.throws(()=>verifyG00RefCensus(index,changed),/unverifiable ref/);
 const replay=structuredClone(src);
 replay[1].data.records[0].repository=replay[0].data.records[0].repository;
 assert.throws(()=>verifyG00RefCensus(index,replay),/nine-repo census/);
 const sha=structuredClone(src);sha[2].sha="0".repeat(40);
 assert.throws(()=>verifyG00RefCensus(index,sha),/source batch SHA/);
});
