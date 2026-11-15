import test from "node:test";
import assert from "node:assert/strict";
import {buildRecoveryDeltas} from "./lib/ncos-recovery-deltas.mjs";
function fixture(){
 const a="a".repeat(64),b="b".repeat(64);
 return {sourceInventory:{datasets:{
  normatives:[{normative_ref:"N1",official_uri:"https://official.example/doc",title:"Norm",authority:"Official"}],
  evidenceSources:[{source_id:"S1",official_uri:"https://official.example/doc",title:"Norm",publisher:"Official"}],
  snapshots:[{snapshot_id:"SN1",source_id:"S1",validation_status:"PENDING",content_sha256:a}],
  atomizations:[{source_pdf_sha256:a,atomized_jsonl_sha256:b}],
  claims:[{claim_id:"C1",subject_ref:"SUBJ",assertion_refs:[],evidence_refs:["S1"]}],
  assertions:[{assertion_id:"A1",subject_ref:"SUBJ"}],fragments:[],extractions:[]
 },matchingCandidates:[{normative_ref:"N1",source_id:"S1",identityApproved:false}]},
 recovery:{documents:[{sourceName:"A.pdf",driveFileId:"FILE1",expectedPdfSha256:a,expectedJsonlSha256:b,
   driveSourceStatus:"METADATA_READBACK_PRESENT",bytesHashVerified:false,atomizedJsonlBytesVerified:false,
   atomizedJsonlLocated:false,publicationAllowed:false,textAtomsReported:1}]},
 editorial:[{slug:"page",page:{modules:[{module_id:"m",provenance_ref:"../provenance/pages/page.json#/module_provenance/m"}]},
  provenance:{page_source:{source_file:"old.json"},module_provenance:{m:{source:{legacy_snapshot_ref:"old.json"},provenance:{class:"B"}}}}}]
 };
}
test("source recovery knows only metadata and never certifies bytes",()=>{
 const r=buildRecoveryDeltas(fixture());
 assert.equal(r.errors.length,0);assert.equal(r.totals.recoveredPdfMetadata,1);
 assert.equal(r.totals.originalPdfByteHashesVerified,0);
 assert.equal(r.totals.recoveredAndVerifiedJsonl,0);
 assert.equal(r.releaseGate,"HOLD_HUMAN_SOURCE_LINEAGE_AND_ATOMS");
});
test("same-subject assertion is candidate only, never a claim proof",()=>{
 const r=buildRecoveryDeltas(fixture());
 assert.deepEqual(r.claims[0].candidateAssertionsSameSubject,["A1"]);
 assert.equal(r.claims[0].autoLinked,false);
});
test("URI equality is not permission to promote identity",()=>{
 const r=buildRecoveryDeltas(fixture());
 assert.equal(r.links[0].autoMerged,false);assert.equal(r.links[0].approval,"HOLD_HUMAN");
});
test("drift in expected PDF or atomized hash fails structural integrity",()=>{
 const x=fixture();x.recovery.documents[0].expectedJsonlSha256="c".repeat(64);
 assert.ok(buildRecoveryDeltas(x).errors.some(y=>y.code==="PDF_ATOM_HASH_PAIR_MISMATCH"));
});
test("claim link missing from known catalog is rejected",()=>{
 const x=fixture();x.editorial[0].page.modules[0].claim_ids=["MISSING"];
 assert.ok(buildRecoveryDeltas(x).errors.some(y=>y.code==="EDITORIAL_EXPLICIT_CLAIM_UNKNOWN"));
});
test("duplicate PDF recovery mapping fails",()=>{
 const x=fixture();x.recovery.documents.push({...x.recovery.documents[0]});
 assert.ok(buildRecoveryDeltas(x).errors.some(y=>y.code==="DUPLICATE_DRIVE_ATOMIZATION_SOURCE"));
});
