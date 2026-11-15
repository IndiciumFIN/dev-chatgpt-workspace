#!/usr/bin/env node
/**
 * NO RELEASE: clinical contract records published runtime tools AND held
 * candidateTools, but never creates source proof, license or clinical approval.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadToolContracts } from "./load-tool-contracts.mjs";
const gov=loadToolContracts();
const doc=JSON.parse(readFileSync("contracts/entities/clinical-tools.v1.json","utf8"));
assert.equal(doc.schemaVersion,1);
assert.ok(Array.isArray(doc.items));
const active=new Set(gov.tools.map(x=>x.slug));
const candidate=new Set(gov.candidateTools.map(x=>x.slug));
const all=[...active,...candidate];
assert.equal(new Set(all).size,all.length);
assert.deepEqual(new Set(doc.items.map(x=>x.slug)),new Set(all));
for(const tool of doc.items){
 const runtime=(gov.tools.concat(gov.candidateTools)).find(x=>x.slug===tool.slug);
 assert.ok(runtime,"No runtime metadata for "+tool.slug);
 assert.equal(tool.release_gate,"HOLD_HUMAN");
 assert.equal(tool.status,runtime.status??"CANDIDATE");
 assert.deepEqual(tool.source_ids,runtime.sourceIds??[]);
 if(candidate.has(tool.slug)){
   assert.equal(tool.publicacao,"candidata");
   assert.notEqual(tool.status,"EVIDENCE_BOUND");
 }
 if((runtime.sourceIds??[]).length===0) assert.notEqual(tool.status,"EVIDENCE_BOUND");
 assert.equal(Array.isArray(tool.evidence_refs)&&tool.evidence_refs.length,0);
 assert.equal(Array.isArray(tool.test_vector_refs)&&tool.test_vector_refs.length,0);
}
const zeroHash=(gov.fontes||[]).filter(x=>/^0{64}$/.test(x.integrity?.sha256||"")).length;
assert.ok(zeroHash>0,"Clinical rights review must not be replaced by fake verified hashes");
console.log("CE_CKO_CANDIDATE_BOUNDARY "+JSON.stringify({
  activeRuntimeTools:active.size,candidateTools:candidate.size,
  contractEntries:doc.items.length,sourceRecordsWithUnverifiedHash:zeroHash,
  autoClinicalApprovals:0,releaseEligible:false,decision:"HOLD_HUMAN"
}));
