/** Fail-closed check for DOU pages containing more than one issuing authority. */
export function guardGazetteIssuerBoundary({quarantine,recovery,crosswalk}) {
 const errors=[],holds=[];
 const fail=(code,record)=>errors.push({code,record});
 const sha=v=>typeof v==="string"&&/^[a-f0-9]{64}$/.test(v);
 const q=quarantine||{},r=q.reviewRules||{},b=q.issuerBoundaryObserved||{};
 if(q.scope!=="NCOS_CE_NONACCOUNTING"||q.kind!=="CROSS_ISSUER_OFFICIAL_GAZETTE_PAGE_QUARANTINE"||
    q.status!=="HOLD_HUMAN_SOURCE_DOCUMENT_SEGMENTATION"||q.publicationAllowed!==false||
    q.sourceIdsWritten!==0||q.dbWrites!==0||
    !r.noAutomaticFullGazettePageAdmission||!r.forbidCrossIssuerBlockPromotion||
    !r.noAccountingOrUnrelatedIssuerContentAllowed||!r.doNotTreatIdenticalPageTextAsIdenticalSourceBinary||
    !r.requireExplicitActLevelAndIssuerLevelReview)
  fail("CROSS_ISSUER_GAZETTE_RELEASE_POLICY_CHANGED","root");
 if(b.sourceIsWholeGazettePageNotPureNursingAct!==true||b.cofen736ActPresent!==true||
    b.cofenRelatedAtomsIndependentlyQualified!==0||b.blockedSourceTextAtomOccurrences!==58||
    !b.otherIssuer?.includes("FISIOTERAPIA"))
  fail("GAZETTE_MULTI_ISSUER_SCOPE_LOST","root");
 const all=new Map((recovery.documents||[]).map(x=>[x.expectedPdfSha256,x]));
 const docs=q.duplicateLiteralPageGroup||[];
 const uniquePdf=new Set(docs.map(x=>x.sourcePdfSha256));
 const uniqueJsonl=new Set(docs.map(x=>x.jsonlSha256));
 if(docs.length!==2||uniquePdf.size!==2||uniqueJsonl.size!==2||
    q.identicalBlockTextsAndBboxesBetweenDistinctBinaryFiles!==true)
  fail("DISTINCT_PDF_BINARY_MANIFESTATION_LOST","duplicate-group");
 const matchingCrosswalk=new Map((crosswalk.rows||[]).map(x=>[x.sourcePdfSha256,x]));
 for(const d of docs){
  const original=all.get(d.sourcePdfSha256),link=matchingCrosswalk.get(d.sourcePdfSha256);
  if(!original||original.sourceName!==d.pdfName||original.expectedJsonlSha256!==d.jsonlSha256||
     original.atomizedJsonlBytesVerified!==true||original.bytesHashVerified!==true||
     d.originalTextAtoms!==29||d.pageCount!==1||!sha(d.textLayerSha256)||
     d.textLayerSha256!==q.editionMetadata?.sourceSnapshotSha256)
     fail("UNVERIFIED_DUPLICATED_GAZETTE_PAGE",d.pdfName);
  if(!link||link.possibleExistingCkoSourceId!=="SRC-COFEN-RES-736-2024"||
     link.candidateApproved!==false||link.addedToCko!==false)
     fail("MISSING_HOLD_FOR_EXISTING_COFEN_CKO_SOURCE",d.pdfName);
  holds.push({code:"GAZETTE_ISSUER_BOUNDARY_SEMANTIC_SEGMENTATION",sourcePdfSha256:d.sourcePdfSha256});
 }
 const sei=q.alternativeOriginalCofenSei;
 if(!sei||!all.has(sei.pdfSha256)||sei.sourcePages!==4||
    sei.linkToSameExistingCkoSourceCandidate!=="SRC-COFEN-RES-736-2024"||
    sei.sourceTextIdenticalToGazettePage!==false||sei.editionRevalidationPending!==true)
  fail("COFEN_SEI_EDITION_RELATION_UNSUPPORTED","sei");
 return {counts:{originalBinarySources:docs.length,identicalTextLayerGroups:1,
  coexistingIssuerActs:3,blockedLiteralAtomOccurrences:b.blockedSourceTextAtomOccurrences,
  approvedCkoSnapshotLinks:0,errors:errors.length,holds:holds.length},errors,holds,
  releaseGate:"HOLD_HUMAN_ISSUER_SEGMENTATION_AND_DOCUMENT_EDITION"};
}