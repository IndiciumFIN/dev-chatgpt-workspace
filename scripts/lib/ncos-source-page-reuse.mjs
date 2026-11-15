/** Read-only exact page-source reuse relationships; NEVER a clinical/publishing merge. */
export function guardSourcePageReuse({reuse,recovery,gazette}) {
 const errors=[],holds=[];const fail=(code,id)=>errors.push({code,id});
 const sha=v=>typeof v==="string"&&/^[0-9a-f]{64}$/.test(v);
 const r=reuse||{},g=r.guardrails||{},c=r.matchedComponent||{},t=r.totals||{};
 if(r.scope!=="NCOS_CE_NONACCOUNTING"||r.kind!=="EXACT_SOURCE_PAGE_REUSE_CANDIDATES_NOT_UNIQUE_KNOWLEDGE"||
    r.originalArchiveSha256!==recovery.originalArchive?.sha256||
    !sha(r.fullPrivatePageLedgerSha256)||!sha(r.localIndependentReuseReportSha256)||
    !g.noContentCopied||!g.sourceOriginalsImmutable||!g.notUniqueClinicalKnowledgeCount||
    !g.independentDocEditionAndAuthorityRequired||!g.cannotConcludeCommercialReuseFromOpenAccess||
    !g.clinicalAndRightsReviewMandatory||!g.noDbWrites||r.releaseEligible!==false)
   fail("UNAUTHORIZED_SOURCE_REUSE_POLICY","root");
 const orig=new Map((recovery.documents||[]).map(x=>[x.expectedPdfSha256,x]));
 const comp=orig.get(c.compositePdfSha256),stand=orig.get(c.standalonePdfSha256);
 if(!comp||!stand||comp.sourceName!==c.compositeName||stand.sourceName!==c.standaloneName||
    c.compositePdfSha256===c.standalonePdfSha256||c.noOriginalFileDeleted!==true||
    c.sourceCanonicalId!==null||c.sourceSnapshotId!==null)
   fail("INVALID_COMPOSITE_STANDALONE_ORIGIN","source");
 const expectedSections=[["PORTARIA_2095_2013_AND_EXPLANATORY_MATERIAL",1,2],
  ["ANEXO_03_PROTOCOLO_CIRURGIA_SEGURA",3,14],
  ["ANEXO_02_PREVENCAO_ULCERA_PRESSAO",15,35]];
 for(let i=0;i<expectedSections.length;i++){
  const x=c.compositeSections?.[i],e=expectedSections[i];
  if(!x||x.label!==e[0]||x.startPage!==e[1]||x.endPage!==e[2]||x.authorityAdmission!==false)
   fail("COMPOSITE_ANNEX_BOUNDARY_MISMATCH",e[0]);
 }
 let text=0,visual=0;const pages=new Set(),seenHashes=new Set();
 for(const x of c.matchingPages||[]){
  if(x.compositePage1Based!==x.standalonePage1Based+2||
      x.compositePage1Based<3||x.compositePage1Based>14||
      !sha(x.sourcePageTextSha256)||!Number.isInteger(x.literalBlockCount)||
      x.literalBlockCount<0||!Number.isInteger(x.visualReferences)||x.visualReferences<0||
      x.identicalBlockContentBboxesAndImageSha256!==true||
      x.approvedReuse!==false||x.publicationAllowed!==false)
   fail("INVALID_EXACT_SUBDOCUMENT_PAGE_PAIR",x.standalonePage1Based);
  if(pages.has(x.compositePage1Based)||seenHashes.has(x.sourcePageTextSha256))
   fail("DUPLICATE_COMPOSITE_PAGE_OR_TEXT_SHA",x.compositePage1Based);
  pages.add(x.compositePage1Based);seenHashes.add(x.sourcePageTextSha256);
  text+=x.literalBlockCount;visual+=x.visualReferences;
 }
 if(pages.size!==12||text!==304||visual!==1||
    c.matchingPages?.length!==12||comp.pageCount!==35||stand.pageCount!==12)
   fail("SUBDOCUMENT_PAGE_COUNT_OR_SOURCE_CHUNK_DRIFT","composite");
 const other=r.otherReuseGroups||[];
 const dou=other.find(x=>x.type==="CROSS_PDF_IDENTICAL_DOU_TEXT_MIXED_ISSUERS");
 const news=other.find(x=>x.type==="INTRA_PDF_REPEATED_REPORT_COVER");
 const gu=gazette?.duplicateLiteralPageGroup||[];
 if(!dou||other.length!==2||!gu.some(x=>x.sourcePdfSha256===dou.sourcePdfSha256A)||
    !gu.some(x=>x.sourcePdfSha256===dou.sourcePdfSha256B)||
    dou.sourcePageTextSha256!==gazette.editionMetadata?.sourceSnapshotSha256||
    dou.repeatedLiteralBlocks!==29||dou.wholePageNormativeAdmission!==false)
   fail("MIXED_GAZETTE_PAGE_REUSED_WITHOUT_ISSUER_BOUNDARY","dou");
 if(!news||!orig.has(news.sourcePdfSha256)||news.pages1Based?.join(",")!=="1,2"||
    news.repeatedLiteralBlocks!==2||news.wholePageNormativeAdmission!==false)
   fail("INTERNAL_NEWS2_REPEAT_INVALID","news");
 if(t.identicalPageTextGroups!==14||t.externalSourceIdenticalPageGroups!==13||
    t.internalSourceIdenticalPageGroups!==1||
    t.compositeSurgerySharedPages!==12||t.compositeSurgerySharedTextBlocks!==text||
    t.compositeSurgerySharedImageRefs!==visual||t.douSharedTextBlocks!==29||
    t.newsletterInternalRepeatTextBlocks!==2||
    t.potentiallyRepeatedCrossSourceTextBlockOccurrences!==text+29||
    t.potentiallyRepeatedCrossSourceImageReferences!==visual||
    t.safeToDeleteOriginalFiles!==0||t.automaticallySharedCkoIds!==0||
    t.approvedEditorialReuseCases!==0)
   fail("UNAPPROVED_REUSE_AGGREGATE_OR_COUNT_DRIFT","counts");
 if(r.rightsMetadataCandidate?.licenseAppliedToExactRecoveredPdfBytes!==false||
    r.rightsMetadataCandidate?.publicationRightsNotInferred!==true||
    r.rightsMetadataCandidate?.additionalRightsReviewRequired!==true)
   fail("EXTERNAL_LICENSE_CANDIDATE_WAS_AUTO_APPROVED","rights");
 holds.push({code:"SURGICAL_PROTOCOL_DERIVATIVE_LICENSE_AND_CLINICAL_REVIEW"});
 holds.push({code:"MIXED_ISSUER_GAZETTE_PER_ATOM_REVIEW"});
 return {totals:{sharedSurgeryPages:pages.size,sourceTextOccurrencesPotentiallyReusable:text+29,
     repeatedVisualRefs:visual,originalPdfInstancesPreserved:4,errors:errors.length,holds:holds.length},
   errors,holds,releaseGate:"HOLD_HUMAN_LICENSE_CLINICAL_AND_SOURCE_COMPONENT_VALIDATION"};
}