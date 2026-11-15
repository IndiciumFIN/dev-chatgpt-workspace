import test from "node:test";
import assert from "node:assert/strict";
import {checkCkoSnapshotAdmissionCandidates} from "./lib/ncos-cko-snapshot-admission.mjs";
const a="a".repeat(64),b="b".repeat(64),zip="c".repeat(64);
function fixture(){
 return {recovery:{originalArchive:{sha256:zip},documents:[{sourceName:"cofen.pdf",expectedPdfSha256:a,
  expectedJsonlSha256:b,atomizedJsonlArchiveMember:"atomic_docs/cofen.jsonl",
  bytesHashVerified:true,atomizedJsonlBytesVerified:true}]},
 crosswalk:{scope:"NCOS_CE_NONACCOUNTING",releaseEligible:false,noDbMutation:true,
  reviewPolicies:{noNewCkoIdsFromFilename:true,noDuplicateOfficialRegulatorySource:true,
   ckoAdmissionRequiresHumanDecision:true,historicalSourceIdNotAutomaticallyEqualToCkoSourceId:true},
  sourceEvidence:{originalArchive:{sha256:zip},ckoLookupExactMatchingSnapshotCount:0},
  rows:[{sourcePdfName:"cofen.pdf",sourcePdfSha256:a,originalAtomizedJsonlSha256:b,
   originalZipMember:"atomic_docs/cofen.jsonl",originalJsonlBytesVerified:true,
   registeredCkoSnapshotWithExactPdfHash:false,addedToCko:false,candidateApproved:false,
   sourceIdentityAutoCreated:false,possibleExistingCkoSourceId:"SRC-COFEN-RES-736-2024",
   possibleIdentityBasis:"SAME_REGULATORY_INSTRUMENT_TITLE_ONLY_NOT_SAME_EDITION_OR_SNAPSHOT",
   historicalDocumentMatch:{historicalEvidenceAtomCount:45,semanticClaimApproved:false}}],
  stats:{pdfSourcesRecovered:1,originalJsonlsVerified:1,exactCkoPdfSnapshotMatches:0,
   pdfMissingExactCkoSnapshot:1,crossmatchesInHistoricalSqlite:1,
   historicalEvidenceAtomsForCrossmatches:45,candidateExistingCkoSourceRefs:1,
   approvedAliases:0,newCkoSourcesCreated:0,archivedOriginalJsonlsRewritten:0}}
 };
}
test("same-title CKO source remains an unapproved candidate",()=>{
 const r=checkCkoSnapshotAdmissionCandidates(fixture());
 assert.equal(r.errors.length,0);assert.equal(r.totals.existingSourceCandidates,1);
 assert.equal(r.releaseGate,"HOLD_HUMAN_SOURCE_IDENTITY_EDITION_AND_CKO_SNAPSHOT");
});
test("cannot mark source identity as approved by metadata only",()=>{
 const x=fixture();x.crosswalk.rows[0].candidateApproved=true;
 assert.ok(checkCkoSnapshotAdmissionCandidates(x).errors.some(e=>e.code==="UNAPPROVED_SNAPSHOT_OR_IDENTITY_PROMOTION"));
});
test("cannot equate earlier evidence atoms with qualified CKO claims",()=>{
 const x=fixture();x.crosswalk.rows[0].historicalDocumentMatch.semanticClaimApproved=true;
 assert.ok(checkCkoSnapshotAdmissionCandidates(x).errors.some(e=>e.code==="HISTORICAL_EVIDENCE_ATOMS_AUTO_PROMOTED"));
});
test("untrusted source id inferred from similar title is rejected",()=>{
 const x=fixture();x.crosswalk.rows[0].possibleExistingCkoSourceId="NEW-FROM-FILENAME";
 assert.ok(checkCkoSnapshotAdmissionCandidates(x).errors.some(e=>e.code==="UNSUPPORTED_EXISTING_SOURCE_CANDIDATE"));
});
test("exact original ZIP member and SHA required",()=>{
 const x=fixture();x.crosswalk.rows[0].originalAtomizedJsonlSha256="0".repeat(64);
 assert.ok(checkCkoSnapshotAdmissionCandidates(x).errors.some(e=>e.code==="STAGED_SOURCE_LINK_WITHOUT_VERIFIED_BYTES"));
});
test("historical evidence corpus cardinality cannot be inflated",()=>{
 const x=fixture();x.crosswalk.stats.historicalEvidenceAtomsForCrossmatches+=1;
 assert.ok(checkCkoSnapshotAdmissionCandidates(x).errors.some(e=>e.code==="CROSSWALK_COUNTS_OR_NOTHING_APPROVED_DRIFT"));
});
