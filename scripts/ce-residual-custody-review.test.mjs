import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const read=p=>readFileSync(new URL("../"+p,import.meta.url));
const d=JSON.parse(read("registers/governance/ce-residual-custody-review-20261128.v1.json"));
const orig=read(d.original_register);
const old=JSON.parse(orig);
test("residual custody: exact 26 source identities, no historical ledger rewrite",()=>{
 assert.equal(createHash("sha1").update("blob "+orig.length+"\0").update(orig).digest("hex"),d.original_register_blob);
 assert.equal(d.records.length,26);
 assert.equal(new Set(d.records.map(x=>x.source_ref+"\0"+x.source_path)).size,26);
 for(const x of old.entries){
  const y=d.records.find(z=>z.source_ref===x.source_ref&&z.source_path===x.source_path);
  assert.ok(y);
  for(const k of ["source_commit_sha","source_git_blob_sha","source_mode"]) assert.equal(y[k],x[k]);
  assert.equal(y.category,x.blocker);
  assert.equal(y.integrity,"MATCH_AT_LIVE_REF");
  assert.equal(y.custody,"HOLD_SOURCE_REF_RETAIN");
  assert.equal(y.release_authorized,false);
  assert.equal(y.raw_copy_authorized,false);
 }
 assert.deepEqual(d.counts,{FACTUAL_AND_RIGHTS_REVIEW:2,RIGHTS_PER_INSTRUMENT:1,CUSTODY_ACCESS_REVIEW:10,CURRICULUM_PROVENANCE:9,PRIVATE_PACKAGE_POINTER_REVIEW:4});
 assert.equal(d.sources.length,3);
 assert.ok(d.sources.every(x=>x.protected===false&&d.records.filter(r=>r.source_ref===x.ref).every(r=>r.source_commit_sha===x.head)));
 assert.equal(d.review.independent_custody_verified,0);
 assert.equal(d.review.raw_copies_created,0);
 assert.ok(Object.values(d.controls).every(x=>x===true));
});
