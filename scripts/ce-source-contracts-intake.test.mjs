import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const registry=JSON.parse(readFileSync(new URL("../registers/governance/ce-source-contracts-intake-20261120.v1.json",import.meta.url)));
const root=new URL("../",import.meta.url);
const sha=(bytes)=>createHash("sha1").update(Buffer.from("blob "+bytes.length+"\0")).update(bytes).digest("hex");
test("20 source metadata contracts are byte-exact and not duplicated",()=>{
 assert.equal(registry.counts.contracts,20);assert.equal(registry.records.length,20);
 const slugs=new Set();
 for(const record of registry.records){
  assert.equal(record.admitted,false);assert.equal(record.state,"CANDIDATE_ONLY");
  assert.match(record.sourcePath,/^contracts\/fontes\/[a-z0-9_]+\.json$/);
  assert.equal(record.targetPath,"intake/legacy-ce/"+record.sourcePath);
  const bytes=readFileSync(new URL(record.targetPath,root));
  assert.equal(sha(bytes),record.sourceBlobSha,record.sourcePath);
  assert.equal(bytes.length,record.bytes,record.sourcePath);
  const doc=JSON.parse(bytes.toString("utf8"));
  assert.equal(doc.source_contract,record.sourcePath);
  assert.equal(doc.schema,"CE-FONTE-CONTRATO-1.0.0");
  assert.equal(doc.kernel_policy_required,true);
  assert.ok(!slugs.has(doc.fonte_slug),"duplicate source slug "+doc.fonte_slug);
  slugs.add(doc.fonte_slug);
 }
});
test("legacy source contracts are quarantined from active normative ingestion",()=>{
 assert.equal(registry.execution,"DISABLED");
 assert.equal(registry.license,"HOLD_HUMAN");
 assert.equal(registry.counts.admitted,0);
 assert.equal(registry.counts.pendingPolicyLicensing,20);
 assert.ok(registry.records.every(x=>x.state==="CANDIDATE_ONLY"));
});
