import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const base=new URL("../",import.meta.url);
const policies=JSON.parse(readFileSync(new URL("registers/governance/ce-kernel-policies-intake-20261120.v1.json",base)));
const sources=JSON.parse(readFileSync(new URL("registers/governance/ce-source-contracts-intake-20261120.v1.json",base)));
const names=new Set(sources.records.map(x=>x.sourcePath));
const sha=(b)=>createHash("sha1").update(Buffer.from("blob "+b.length+"\0")).update(b).digest("hex");
test("20 historic Kernel policies copied byte-exact with immutable source provenance",()=>{
 assert.equal(policies.records.length,20);assert.equal(policies.counts.policies,20);
 assert.equal(new Set(policies.records.map(x=>x.sourcePath)).size,20);
 for(const r of policies.records){
  assert.equal(r.admitted,false);assert.equal(r.state,"CANDIDATE_ONLY");
  assert.match(r.sourcePath,/^contracts\/policies\/KERNEL-POLICY-\d{3}\.json$/);
  const b=readFileSync(new URL(r.targetPath,base));
  assert.equal(r.targetPath,"intake/legacy-ce/"+r.sourcePath);
  assert.equal(b.length,r.bytes,r.sourcePath);
  assert.equal(sha(b),r.sourceBlobSha,r.sourcePath);
  const j=JSON.parse(b.toString("utf8"));
  assert.equal(j.id,r.sourcePath.split("/").pop().replace(".json",""));
  assert.equal(j.schema,"CE-KERNEL-POLICY-1.0.0");
  assert.equal(j.fail_closed,true,j.id);
  assert.ok(names.has(j.source_contract),"missing linked source contract for "+j.id);
 }
});
test("no historic Kernel policy is executable or approved as current clinical evidence",()=>{
 assert.equal(policies.status,"HOLD_HUMAN");
 assert.equal(policies.execution,"DISABLED");
 assert.equal(policies.counts.admitted,0);
 assert.equal(sources.execution,"DISABLED");
});
