import test from "node:test";
import assert from "node:assert/strict";
import {checkRecoveredOriginalArchive} from "./lib/ncos-original-archive-attestation.mjs";
function fixture(){
 const a="a".repeat(64),b="b".repeat(64),zip="c".repeat(64);
 const doc={sourceName:"test.pdf",driveFileId:"D1",atomizedJsonlName:"test.jsonl",
  expectedPdfSha256:a,actualPdfSha256:a,
  expectedJsonlSha256:b,actualJsonlSha256:b,
  atomizedJsonlArchiveMember:"atomic_docs/test.jsonl",atomizedJsonlArchiveSha256:zip,
  atomizedJsonlBytesVerified:true,atomizedJsonlLocated:true,
  publicationAllowed:false,clinicalSignoff:"PENDING"};
 const attest={
  scope:"NCOS_CE_NONACCOUNTING",noClinicalApproval:true,noDbMutation:true,
  sourceLibraryArchive:{sha256:zip,libraryFileId:"file_001abc",verifiedJsonlEntries:17},
  verification:{verifiedPdfSha256Count:17,verifiedJsonlSha256Count:17,
   originalJsonlCount:17,originalPdfCount:17,totalPdfPagesWithExactTextLayerReconstruction:1192,
   verifiedTextAtoms:25508,verifiedVisualHashReferences:887,parsedAtomicJsonLines:26395,
   jsonParsingErrors:0,sourceTextPageMismatchCount:0,sourceVisualImageMismatchPages:0,
   clinicalSemanticSignoffs:0,rightsApprovals:0,publicationAuthorized:false,fulltextCommittedToGitHub:false},
  filenamesAndHashes:[{originalSourcePdf:"test.pdf",originalPdfSha256:a,
   restoredJsonlZipMember:"atomic_docs/test.jsonl",restoredJsonlSha256:b,
   literalAtoms:25508,visualReferences:887,clinicalStatus:"PENDING",publicationStatus:"BLOCKED"}]
 };
 return {attestation:attest,recovery:{documents:[doc],originalArchive:{sha256:zip},
   totals:{jsonlArtifactHashesVerified:17,atomRecordsVerified:26395,sourcePdfPagesVerified:1192}},
  sourceInventory:{datasets:{atomizations:[{source_pdf_sha256:a,atomized_jsonl_sha256:b}]}}};
}
test("immutable archive linkage survives, but publication stays blocked",()=>{
 const r=checkRecoveredOriginalArchive(fixture());
 assert.equal(r.errors.length,1); // fixture intentionally represents one of the 17
 assert.ok(r.errors.some(e=>e.code==="RESTORED_ENTRY_COUNT_DRIFT"));
 assert.equal(r.releaseGate,"HOLD_HUMAN_CLINICAL_RIGHTS_AND_VISUAL");
});
test("changed exact JSONL sha fails source binding",()=>{
 const x=fixture();x.recovery.documents[0].actualJsonlSha256="0".repeat(64);
 assert.ok(checkRecoveredOriginalArchive(x).errors.some(e=>e.code==="RECOVERED_ATOM_SOURCE_CHAIN_MISMATCH"));
});
test("changed archive SHA fails source binding",()=>{
 const x=fixture();x.recovery.documents[0].atomizedJsonlArchiveSha256="0".repeat(64);
 assert.ok(checkRecoveredOriginalArchive(x).errors.some(e=>e.code==="RECOVERED_ATOM_SOURCE_CHAIN_MISMATCH"));
});
test("publication approval without clinical and rights sign-off fails",()=>{
 const x=fixture();x.recovery.documents[0].publicationAllowed=true;
 assert.ok(checkRecoveredOriginalArchive(x).errors.some(e=>e.code==="UNAUTHORIZED_ATOM_RELEASE"));
});
test("corrupted cardinality fails even when individual hashes are correct",()=>{
 const x=fixture();x.attestation.verification.verifiedTextAtoms=1;
 assert.ok(checkRecoveredOriginalArchive(x).errors.some(e=>e.code==="RECOVERY_ATTESTATION_COUNTS_OR_RELEASE_CHANGED"));
});
