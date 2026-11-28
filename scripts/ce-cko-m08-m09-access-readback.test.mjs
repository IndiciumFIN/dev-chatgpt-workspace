import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const read=p=>readFileSync(new URL("../"+p,import.meta.url));
const d=JSON.parse(read("registers/governance/ce-cko-m08-m09-access-readback-20261128.v1.json"));
test("M08/M09 access successor records verified restriction without rewriting historical audit or granting release",()=>{
 const bytes=read(d.predecessor.path);
 assert.equal(createHash("sha1").update("blob "+bytes.length+"\0").update(bytes).digest("hex"),d.predecessor.git_blob_sha);
 const old=JSON.parse(bytes);
 assert.equal(old.access.post_attempt_readback,"ANYONE_READER_STILL_PRESENT_BOTH");
 assert.equal(d.operation.actor,"USER_MANUAL_UI");
 assert.equal(d.operation.connector_mutation,false);
 assert.equal(d.result,"PUBLIC_LINK_REMOVAL_VERIFIED_2_OF_2");
 assert.deepEqual(d.packages.map(x=>x.module),["M08","M09"]);
 for(const p of d.packages){
  assert.equal(p.bytes,old.packages.find(x=>x.module===p.module).bytes);
  assert.equal(p.shared,false);
  assert.equal(p.public_link,false);
  assert.deepEqual(p.permission_types_roles,["user:owner"]);
  assert.equal(p.administrative_access,true);
 }
 for(const k of ["independent_custody_verified","rights_clearance","clinical_release","kernel_admission","source_ref_deletion","db_write"])assert.equal(d.remaining[k],false);
 assert.equal(d.remaining.unresolved_curriculum_pairs,old.referential_audit.unresolved_pairs);
});
