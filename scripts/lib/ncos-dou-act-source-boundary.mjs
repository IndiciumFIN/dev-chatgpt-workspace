/** Pinned issuer/act segmentation; CI validates metadata and never reads private source text. */
export function checkDouActSourceBoundaries({proof,recovery,gazette,crosswalk}){
 const errors=[],holds=[];const fail=(code,id)=>errors.push({code,id});
 const sha=s=>typeof s==="string"&&/^[a-f0-9]{64}$/.test(s);
 const P=proof||{},t=P.totals||{},groups=P.boundaries||[],original=P.originalPages||[];
 if(P.scope!=="NCOS_CE_NONACCOUNTING"||P.kind!=="COFEN736_MIXED_GAZETTE_PER_ATOM_BOUNDARY_PROOFS"||
    P.originalZipSha256!==recovery.originalArchive?.sha256||
    P.sourcePageTextSha256!==gazette.editionMetadata?.sourceSnapshotSha256||
    !sha(P.privateFullActAtomSegmentationSha256)||P.publicationAllowed!==false||
    P.databaseMutations!==0||P.mergeMainAllowed!==false||
    P.licenseRightsStatus!=="HOLD_HUMAN"||P.clinicalReviewStatus!=="HOLD_HUMAN"||
    P.officialLegalVigencyReviewStatus!=="HOLD_HUMAN"||
    P.issuerProof?.exactOfficialExternalBytesMatched!==false||
    P.issuerProof?.articleLevelGranularityNotVerified!==true)
   fail("DOU_MIXED_ISSUER_PROOF_OR_RELEASE_BROKEN","root");
 const expected=[
  ["DOU_COMMON_HEADER",1,3,3,null],
  ["COFEN_RES_736_2024_ACT_CANDIDATE",4,10,13,"SRC-COFEN-RES-736-2024"],
  ["COFFITO_RES_584_2023_OUT_OF_SCOPE",11,16,9,null],
  ["COFFITO_RES_585_2023_OUT_OF_SCOPE",17,19,4,null]
 ];
 if(groups.length!==4)fail("EXPECTED_FOUR_ACT_SOURCE_GROUPS","boundaries");
 for(let i=0;i<expected.length;i++){
  const b=groups[i]||{},e=expected[i];
  if(b.actZone!==e[0]||b.firstBlock!==e[1]||b.lastBlock!==e[2]||
     b.originalTextAtomCountPerSource!==e[3]||b.candidateExistingCkoSourceId!==e[4]||
     !sha(b.sharedTextAndBBoxDigest)||b.eligibleForClinicalPublication!==false||
     b.verifiedByOriginalSignedJsonlSha256!==true||b.approved!==false)
    fail("DOU_BOUNDARY_GROUP_OR_AUTHORITY_DRIFT",e[0]);
 }
 const registry=new Map((recovery.documents||[]).map(d=>[d.expectedPdfSha256,d]));
 const known=new Map((crosswalk.rows||[]).map(d=>[d.sourcePdfSha256,d]));
 const q=new Map((gazette.duplicateLiteralPageGroup||[]).map(d=>[d.sourcePdfSha256,d]));
 const sourceShas=new Set(),idShas=new Set();
 if(original.length!==2)fail("ORIGINAL_PDF_COPIES_MISSING","pages");
 for(const doc of original){
  sourceShas.add(doc.originalPdfSha256);
  const source=registry.get(doc.originalPdfSha256),candidate=known.get(doc.originalPdfSha256),page=q.get(doc.originalPdfSha256);
  if(!source||!candidate||!page||source.sourceName!==doc.sourcePdfName||
     source.expectedJsonlSha256!==doc.originalJsonlSha256||
     source.driveFileId!==doc.originalSourceDriveId||
     doc.originalJsonlMember!=="atomic_docs/"+source.atomizedJsonlName||
     source.bytesHashVerified!==true||source.atomizedJsonlBytesVerified!==true||
     page.jsonlSha256!==doc.originalJsonlSha256||
     candidate.possibleExistingCkoSourceId!=="SRC-COFEN-RES-736-2024"||
     candidate.candidateApproved!==false||candidate.addedToCko!==false)
    fail("ORIGINAL_SIGNED_SOURCE_OR_CKO_GAP_LINK_DRIFT",doc.sourcePdfName);
  if(doc.pageTextSha256!==P.sourcePageTextSha256||
     !sha(doc.canonicalPagePositionDigest)||doc.originalTextAtomCount!==29||
     doc.approved!==false||doc.clinicalSignoff!==false||doc.mayPublish!==false)
    fail("PAGE_IDENTITY_OR_APPROVAL_MISMATCH",doc.sourcePdfName);
  const atomIds=doc.boundaryAtomIdDigests||{};
  for(const [zone] of expected){
   if(!sha(atomIds[zone])||idShas.has(atomIds[zone]))fail("ORIGINAL_ATOM_ID_GROUP_COLLISION",zone);
   idShas.add(atomIds[zone]);
  }
  if(Object.keys(atomIds).length!==4)fail("ORIGINAL_ATOM_GROUP_CARDINALITY","groups");
  holds.push({code:"DOU_ACT_ATOM_BOUNDARY_HUMAN_REVIEW",sourcePdfSha256:doc.originalPdfSha256});
 }
 if(sourceShas.size!==2||idShas.size!==8||
    original[0]?.canonicalPagePositionDigest!==original[1]?.canonicalPagePositionDigest||
    P.rightColumnCofenBlockNumbers?.join(",")!=="8,9,10")
    fail("SAME_TEXT_DISTINCT_SOURCE_OR_RIGHT_COLUMN_PROOF_DRIFT","pages");
 if(t.sourceCopies!==2||t.originalJsonlsWithExactHistoricalSha!==2||
    t.originalTextPositions!==29||t.originalTextAtomOccurrences!==58||
    t.genericGazetteTextAtoms!==6||t.cofen736CandidateTextAtoms!==26||
    t.coffito584TextAtomsBlocked!==18||t.coffito585TextAtomsBlocked!==8||
    t.outOfScopeIssuerTextAtomsBlocked!==26||t.rightColumnCofenTextAtoms!==6||
    t.cofenOfficialCkoSourceCandidates!==1||t.approvedClinicalClaims!==0||
    t.ckoSnapshotsCreated!==0||t.rawFulltextCopiedToGitHub!==0)
    fail("PER_ACT_COUNTS_OR_PROVENANCE_DRIFT","totals");
 if(/"(literal_text|search_index_text|content_text|fragment_text)"\s*:/.test(JSON.stringify(P)))
    fail("PROTECTED_SOURCE_FULLTEXT_IN_METADATA","metadata");
 return {totals:{originalPdfCopies:sourceShas.size,sourceAtomOccurrences:58,
  genericGazetteHeaders:6,cofenActCandidates:26,coffitoActOccurrencesBlocked:26,
  rightColumnCofenOccurrences:6,newCkoSourceIds:0,structuralErrors:errors.length,holds:holds.length},
  errors,holds,releaseGate:"HOLD_HUMAN_ISSUER_ACT_LAW_AND_RIGHTS_REVIEW"};
}
