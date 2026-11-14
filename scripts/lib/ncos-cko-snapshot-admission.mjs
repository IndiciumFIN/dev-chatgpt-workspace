/**
 * Metadata-only checks for historical source recovery -> existing CKO identity.
 * SHA matches mean byte identity, never clinical or normative source admission.
 */
export function checkCkoSnapshotAdmissionCandidates({crosswalk,recovery}){
 const errors=[],holds=[];
 const fail=(code,id)=>errors.push({code,id});
 const hold=(code,id)=>holds.push({code,id});
 const policy=crosswalk.reviewPolicies||{};
 if(crosswalk.scope!=="NCOS_CE_NONACCOUNTING"||
    crosswalk.releaseEligible!==false||crosswalk.noDbMutation!==true||
    !policy.noNewCkoIdsFromFilename||!policy.noDuplicateOfficialRegulatorySource||
    !policy.ckoAdmissionRequiresHumanDecision||
    !policy.historicalSourceIdNotAutomaticallyEqualToCkoSourceId)
  fail("CANONICAL_SOURCE_POLICY_VIOLATED","root");
 const original=new Map(recovery.documents.map(x=>[x.expectedPdfSha256,x]));
 const seen=new Set(),members=new Set();let hist=0,histAtoms=0,candidates=0,verified=0;
 for(const row of crosswalk.rows||[]){
  const sha=row.sourcePdfSha256;
  if(seen.has(sha)||members.has(row.originalZipMember))
   fail("DUPLICATE_SOURCE_DIGEST_OR_ATOM_ARCHIVE_MEMBER",row.sourcePdfName);
  seen.add(sha);members.add(row.originalZipMember);
  const r=original.get(sha);
  if(!r||!r.bytesHashVerified||!r.atomizedJsonlBytesVerified||
     r.sourceName!==row.sourcePdfName||
     r.expectedJsonlSha256!==row.originalAtomizedJsonlSha256||
     r.atomizedJsonlArchiveMember!==row.originalZipMember||
     row.originalJsonlBytesVerified!==true)
   fail("STAGED_SOURCE_LINK_WITHOUT_VERIFIED_BYTES",row.sourcePdfName);
  else verified++;
  if(row.registeredCkoSnapshotWithExactPdfHash!==false||
    row.addedToCko!==false||row.candidateApproved!==false||
    row.sourceIdentityAutoCreated!==false)
   fail("UNAPPROVED_SNAPSHOT_OR_IDENTITY_PROMOTION",row.sourcePdfName);
  if(row.possibleExistingCkoSourceId!==null){
   candidates++;
   if(row.possibleExistingCkoSourceId!=="SRC-COFEN-RES-736-2024"||
      !["SAME_REGULATORY_INSTRUMENT_TITLE_ONLY_NOT_SAME_EDITION_OR_SNAPSHOT",
        "OFFICIAL_GAZETTE_CONTAINS_COFEN_736_AND_OTHER_ISSUERS"].includes(row.possibleIdentityBasis)||
      (row.possibleIdentityBasis==="OFFICIAL_GAZETTE_CONTAINS_COFEN_736_AND_OTHER_ISSUERS" &&
       (row.sourcePdfName!=="dou_2024-01-23_s1_p74.pdf"||
        row.pageIssuerBoundary!=="MIXED_COFEN_AND_COFFITO_HOLD_PER_ATOM_SEGMENTATION")) )
    fail("UNSUPPORTED_EXISTING_SOURCE_CANDIDATE",row.sourcePdfName);
  }
  if(row.historicalDocumentMatch){
   hist++;histAtoms+=row.historicalDocumentMatch.historicalEvidenceAtomCount;
   if(row.historicalDocumentMatch.semanticClaimApproved!==false)
    fail("HISTORICAL_EVIDENCE_ATOMS_AUTO_PROMOTED",row.sourcePdfName);
  }
  hold("CKO_SNAPSHOT_SOURCE_VERSION_REVIEW",row.sourcePdfName);
 }
 const s=crosswalk.stats||{};
 if(seen.size!==original.size||seen.size!==s.pdfSourcesRecovered||
    verified!==s.originalJsonlsVerified||
    hist!==s.crossmatchesInHistoricalSqlite||
    histAtoms!==s.historicalEvidenceAtomsForCrossmatches||
    candidates!==s.candidateExistingCkoSourceRefs||
    s.exactCkoPdfSnapshotMatches!==0||
    s.pdfMissingExactCkoSnapshot!==seen.size||
    s.approvedAliases!==0||s.newCkoSourcesCreated!==0||
    s.archivedOriginalJsonlsRewritten!==0)
   fail("CROSSWALK_COUNTS_OR_NOTHING_APPROVED_DRIFT","root");
 if(crosswalk.sourceEvidence?.originalArchive?.sha256!==recovery.originalArchive?.sha256||
    crosswalk.sourceEvidence?.ckoLookupExactMatchingSnapshotCount!==0)
   fail("SOURCE_ARCHIVE_OR_EXACT_SNAPSHOT_QUERY_MISMATCH","root");
 return {totals:{recoveredPdfCount:seen.size,originalJsonlVerified:verified,
   exactCkoSnapshotMatches:0,historicalSourceDocumentMatches:hist,
   historicalEvidenceAtomsNotPromoted:histAtoms,existingSourceCandidates: candidates,
   newCkoSourcesCreated:0,structuralErrors:errors.length,holds:holds.length},
  errors,holds,releaseGate:"HOLD_HUMAN_SOURCE_IDENTITY_EDITION_AND_CKO_SNAPSHOT"};
}