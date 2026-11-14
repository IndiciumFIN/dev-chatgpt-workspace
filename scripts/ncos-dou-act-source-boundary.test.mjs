import test from "node:test";
import assert from "node:assert/strict";
import {checkDouActSourceBoundaries} from "./lib/ncos-dou-act-source-boundary.mjs";
const a="a".repeat(64),b="b".repeat(64),c="c".repeat(64),d="d".repeat(64),h="e".repeat(64);
function fixture(){
 const zones=[["DOU_COMMON_HEADER",1,3,3,null],["COFEN_RES_736_2024_ACT_CANDIDATE",4,10,13,"SRC-COFEN-RES-736-2024"],
 ["COFFITO_RES_584_2023_OUT_OF_SCOPE",11,16,9,null],["COFFITO_RES_585_2023_OUT_OF_SCOPE",17,19,4,null]];
 const pages=[0,1].map(i=>({
  sourcePdfName:"doc"+i+".pdf",originalPdfSha256:[a,b][i],
  originalJsonlSha256:[c,d][i],originalJsonlMember:"atomic_docs/doc"+i+".jsonl",
  originalSourceDriveId:"drive"+i,pageTextSha256:h,
  canonicalPagePositionDigest:h,originalTextAtomCount:29,
  boundaryAtomIdDigests:Object.fromEntries(zones.map((z,j)=>[z[0],(i*4+j+1).toString(16).repeat(64)])),
  approved:false,clinicalSignoff:false,mayPublish:false
 }));
 return {
 proof:{scope:"NCOS_CE_NONACCOUNTING",kind:"COFEN736_MIXED_GAZETTE_PER_ATOM_BOUNDARY_PROOFS",
  originalZipSha256:h,sourcePageTextSha256:h,privateFullActAtomSegmentationSha256:h,
  publicationAllowed:false,databaseMutations:0,mergeMainAllowed:false,
  licenseRightsStatus:"HOLD_HUMAN",clinicalReviewStatus:"HOLD_HUMAN",officialLegalVigencyReviewStatus:"HOLD_HUMAN",
  issuerProof:{exactOfficialExternalBytesMatched:false,articleLevelGranularityNotVerified:true},
  boundaries:zones.map(z=>({actZone:z[0],firstBlock:z[1],lastBlock:z[2],originalTextAtomCountPerSource:z[3],
   candidateExistingCkoSourceId:z[4],sharedTextAndBBoxDigest:h,
   eligibleForClinicalPublication:false,verifiedByOriginalSignedJsonlSha256:true,approved:false})),
  originalPages:pages,rightColumnCofenBlockNumbers:[8,9,10],
  totals:{sourceCopies:2,originalJsonlsWithExactHistoricalSha:2,originalTextPositions:29,originalTextAtomOccurrences:58,
   genericGazetteTextAtoms:6,cofen736CandidateTextAtoms:26,coffito584TextAtomsBlocked:18,
   coffito585TextAtomsBlocked:8,outOfScopeIssuerTextAtomsBlocked:26,rightColumnCofenTextAtoms:6,
   cofenOfficialCkoSourceCandidates:1,approvedClinicalClaims:0,ckoSnapshotsCreated:0,rawFulltextCopiedToGitHub:0}},
 recovery:{originalArchive:{sha256:h},documents:pages.map(p=>({
  expectedPdfSha256:p.originalPdfSha256,sourceName:p.sourcePdfName,expectedJsonlSha256:p.originalJsonlSha256,
  atomizedJsonlName:p.originalJsonlMember.slice(12),driveFileId:p.originalSourceDriveId,
  bytesHashVerified:true,atomizedJsonlBytesVerified:true}))},
 gazette:{editionMetadata:{sourceSnapshotSha256:h},duplicateLiteralPageGroup:pages.map(p=>({
  sourcePdfSha256:p.originalPdfSha256,jsonlSha256:p.originalJsonlSha256}))},
 crosswalk:{rows:pages.map(p=>({sourcePdfSha256:p.originalPdfSha256,
  possibleExistingCkoSourceId:"SRC-COFEN-RES-736-2024",candidateApproved:false,addedToCko:false}))}
 };
}
test("source groups HOLD, exclude COFFITO and preserve original binary copies",()=>{
 const r=checkDouActSourceBoundaries(fixture());
 assert.equal(r.errors.length,0);assert.equal(r.totals.coffitoActOccurrencesBlocked,26);
 assert.equal(r.releaseGate,"HOLD_HUMAN_ISSUER_ACT_LAW_AND_RIGHTS_REVIEW");
});
test("reject unapproved publication",()=>{const x=fixture();x.proof.publicationAllowed=true;
 assert.ok(checkDouActSourceBoundaries(x).errors.some(e=>e.code==="DOU_MIXED_ISSUER_PROOF_OR_RELEASE_BROKEN"));});
test("reject COFFITO to COFEN authority promotion",()=>{const x=fixture();x.proof.boundaries[2].candidateExistingCkoSourceId="SRC-COFEN-RES-736-2024";
 assert.ok(checkDouActSourceBoundaries(x).errors.some(e=>e.code==="DOU_BOUNDARY_GROUP_OR_AUTHORITY_DRIFT"));});
test("reject right column losing Cofen tail",()=>{const x=fixture();x.proof.rightColumnCofenBlockNumbers=[8,9];
 assert.ok(checkDouActSourceBoundaries(x).errors.some(e=>e.code==="SAME_TEXT_DISTINCT_SOURCE_OR_RIGHT_COLUMN_PROOF_DRIFT"));});
test("reject collision between original atom-id digests",()=>{const x=fixture();x.proof.originalPages[1].boundaryAtomIdDigests.DOU_COMMON_HEADER=x.proof.originalPages[0].boundaryAtomIdDigests.DOU_COMMON_HEADER;
 assert.ok(checkDouActSourceBoundaries(x).errors.some(e=>e.code==="ORIGINAL_ATOM_ID_GROUP_COLLISION"));});
test("reject source PDF identity collision",()=>{const x=fixture();x.proof.originalPages[1].originalPdfSha256=x.proof.originalPages[0].originalPdfSha256;
 assert.ok(checkDouActSourceBoundaries(x).errors.some(e=>e.code==="SAME_TEXT_DISTINCT_SOURCE_OR_RIGHT_COLUMN_PROOF_DRIFT"));});
test("reject lost original JSONL hash",()=>{const x=fixture();x.proof.originalPages[1].originalJsonlSha256="0".repeat(64);
 assert.ok(checkDouActSourceBoundaries(x).errors.some(e=>e.code==="ORIGINAL_SIGNED_SOURCE_OR_CKO_GAP_LINK_DRIFT"));});
test("reject external byte edition marked verified prematurely",()=>{const x=fixture();x.proof.issuerProof.exactOfficialExternalBytesMatched=true;
 assert.ok(checkDouActSourceBoundaries(x).errors.some(e=>e.code==="DOU_MIXED_ISSUER_PROOF_OR_RELEASE_BROKEN"));});
test("reject raw copyrighted content in CI data",()=>{const x=fixture();x.proof.literal_text="DO_NOT_ADD";
 assert.ok(checkDouActSourceBoundaries(x).errors.some(e=>e.code==="PROTECTED_SOURCE_FULLTEXT_IN_METADATA"));});
