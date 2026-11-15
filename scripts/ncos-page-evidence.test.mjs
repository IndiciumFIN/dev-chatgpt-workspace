import test from "node:test";
import assert from "node:assert/strict";
import {verifyPageEvidence} from "./lib/ncos-page-evidence.mjs";
const a="a".repeat(64),b="b".repeat(64),c="c".repeat(64);
function fixture(){
 return {recovery:{originalArchive:{sha256:c},totals:{sourcePdfPagesVerified:2,textAtomsReported:4,visualAtomsReported:1},
 documents:[{expectedPdfSha256:a,expectedJsonlSha256:b,pageCount:2,textAtomsReported:4,visualReferencesReported:1,
 bytesHashVerified:true,atomizedJsonlBytesVerified:true}]},
 attestation:{scope:"NCOS_CE_NONACCOUNTING",kind:"PAGE_LINEAGE_NONCONTENT_ATTESTATION",
 sourceArchiveSha256:c,fullPrivatePageLedgerSha256:c,privateAuditSha256:c,generatorSha256:c,
 governance:{noRawTextIncluded:true,noRawImageIncluded:true,noSqlWrites:true,noNewCkoIdentifiers:true,releaseEligible:false},
 counts:{documents:1,pages:2,pagesWithOriginalTextLayerSha256:2,pagesWithoutTextLayerSha256:0,textAtoms:4,
 visualReferences:1,atomRecordIds:5,verifiedOriginalJsonlFiles:1,validatedCkoIdentities:0,rightsApprovals:0,clinicalApprovals:0},
 documents:[{sourcePdfSha256:a,originalJsonlSha256:b,pageMetadataRootSha256:c,pageCount:2,textAtoms:4,visualReferences:1,
 candidateCkoSourceId:null,candidateCkoSnapshotId:null,rightsApproved:false,clinicalApproved:false,publicationApproved:false}]}}
}
test("verified hashes do not automatically admit CKO sources",()=>{
 const r=verifyPageEvidence(fixture());assert.equal(r.errors.length,0);
 assert.equal(r.counts.verifiedSourceRoots,1);assert.equal(r.counts.holds,1);
});
test("tampered page root rejected",()=>{const x=fixture();x.attestation.documents[0].pageMetadataRootSha256="bad";
 assert.ok(verifyPageEvidence(x).errors.some(e=>e.code==="UNBACKED_PAGE_LINEAGE_ROOT"));});
test("unknown source hash rejected",()=>{const x=fixture();x.attestation.documents[0].sourcePdfSha256="0".repeat(64);
 assert.ok(verifyPageEvidence(x).errors.some(e=>e.code==="UNBACKED_PAGE_LINEAGE_ROOT"));});
test("unapproved source ID promotion rejected",()=>{const x=fixture();x.attestation.documents[0].candidateCkoSourceId="MADE-UP";
 assert.ok(verifyPageEvidence(x).errors.some(e=>e.code==="PAGE_LINEAGE_PREMATURE_AUTHORITY"));});
test("lost document/page reconciled count rejected",()=>{const x=fixture();x.attestation.counts.pages=1;
 assert.ok(verifyPageEvidence(x).errors.some(e=>e.code==="PAGE_ATTESTATION_TOTALS_DRIFT"));});
test("raw text inclusion prohibited by policy",()=>{const x=fixture();x.attestation.governance.noRawTextIncluded=false;
 assert.ok(verifyPageEvidence(x).errors.some(e=>e.code==="UNAUTHORIZED_PAGE_LINEAGE_SCOPE_OR_ARCHIVE_DRIFT"));});
