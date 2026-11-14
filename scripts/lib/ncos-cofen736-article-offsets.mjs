/** Immutable Unicode offsets from the two original DOU manifestations; CI has no raw PDFs. */
export const ARTICLE_PROOFS=[
[1,2283,2446,"62d8d777c0af8258c8b4b9d4674a9e5c3953540631974c867021b6ea376c8f2f",[[7,3,93,256]]],
[2,2446,2914,"6058a87f83e7eebb4d42c4a156031dd605f4ee61f081e599758fdebec4a7158f",[[7,3,256,724]]],
[3,2914,3174,"1c5e69a84f4bab45f61cadd81200642cfab1b0d675fa0dc374ab3cd8c6d93c98",[[7,3,724,984]]],
[4,3174,6060,"ac731faeea59812aa5c5f81a4249fb0c974a9285a3614bcbc120a825b655eb1e",[[7,3,984,1128],[7,4,0,1106],[7,5,0,1130],[7,6,0,506]]],
[5,6060,6172,"44fc5c545be3d1b33c3dc2ea9f8c460bdac0e3e0706178fa63efb452abd54f0b",[[7,6,506,618]]],
[6,6172,6418,"2154b64012b64c7a36c453734d413a8e3de69d9a18af61aafad119cbcb75dea5",[[7,6,618,864]]],
[7,6418,6780,"91bd2c318f36dcbb5a8d771368f0d680fa7ad671a13033eecd8790a2a792d72e",[[7,6,864,1103],[7,7,0,123]]],
[8,6780,7141,"6d6714d4ce7310332cd313445ebeebe2446f5f9d54ba9d8007b115ce632ca60e",[[7,7,123,484]]],
[9,7141,7321,"5864bff3bdb2778c5123821fe00894571966f34cceafdc818b99b919b4dfd9e2",[[7,7,484,664]]],
[10,7321,7575,"f9e5bb7404583e3f62650923c987004585ef9273f94377f8eefda0456b4e4f67",[[8,1,0,254]]],
[11,7575,7844,"308a21dd65e1ca2b335add7f41a9c7e3648e3d515a2bab9c9da65786bcedcf24",[[8,1,254,523]]],
[12,7844,8050,"98077144926a341bc1651b62b0561bb2048d90267200ace77cacd6776b5675a9",[[8,1,523,729]]],
[13,8050,8129,"25670766144a44083c226f0573894b0694203fd3fb27492120b5435c00555926",[[8,1,729,808]]],
[14,8129,8278,"e3db51a6604cd5be08f478980cc3e45cebee5d8ea6a8b502b893c79724396abf",[[8,1,808,957]]]];
export function checkCofen736ArticleOffsets({articles,actBoundary,recovery}){
 const errors=[],holds=[];const fail=(code,id)=>errors.push({code,id});
 const a=articles||{},t=a.totals||{};
 if(a.scope!=="NCOS_CE_NONACCOUNTING"||a.kind!=="COFEN736_14_UNAPPROVED_ARTICLE_CHAR_OFFSETS"||
    a.originalZipSha256!==recovery.originalArchive?.sha256||
    !/^[a-f0-9]{64}$/.test(a.privateFullArticleProofSha256||"")||
    a.status!=="HOLD_HUMAN_COFEN_EDITION_LEGAL_ARTICLE_CLINICAL_RIGHTS"||
    a.publicationAllowed!==false||a.rightsApproved!==false||
    a.articleLegalEffectReviewed!==false||a.articleToCkoAutoLinked!==false||
    a.allProtectedSourceTextExcludedFromGit!==true)
   fail("ARTICLE_RELEASE_GUARD_VIOLATED","root");
 const original=new Map((actBoundary.originalPages||[]).map(x=>[x.originalPdfSha256,x]));
 const registry=new Map((recovery.documents||[]).map(x=>[x.expectedPdfSha256,x]));
 const seenSources=new Set(),sourceBodies=new Set();
 for(const s of a.sourceInstances||[]){
  const d=registry.get(s.sourcePdfSha256),act=original.get(s.sourcePdfSha256);
  seenSources.add(s.sourcePdfSha256);
  if(!d||!act||d.expectedJsonlSha256!==s.originalJsonlSha256||
     act.originalJsonlSha256!==s.originalJsonlSha256||
     d.bytesHashVerified!==true||d.atomizedJsonlBytesVerified!==true||
     act.sourcePdfName!==s.sourcePdfName||s.sourcePageTextSha256!==act.pageTextSha256||
     s.ckoSourceCandidateId!=="SRC-COFEN-RES-736-2024"||
     s.sourceEditionVerified!==false||s.clinicalRightsApproved!==false||
     s.sourceSnapshotCreated!==false||
     s.articleCount!==14||s.preambleLengthCodepoints!==2283||s.bodyLengthCodepoints!==8278||
     s.originalArticleBodySha256!=="e9a77fe8fc11764c0c988833a3350867428eb0b8c65aef759efd1a78df70bf29")
    fail("ARTICLE_ORIGINAL_COPY_SOURCE_IDENTITY_OR_EDITION_DRIFT",s.sourcePdfName);
  sourceBodies.add(s.originalArticleBodySha256);
 }
 if(seenSources.size!==2||sourceBodies.size!==1||(a.sourceInstances||[]).length!==2)
  fail("TWO_PDF_ARTICLE_MANIFESTATIONS_DRIFT","sources");
 let spans=0;const rows=a.articleCandidates||[];
 if(rows.length!==14)fail("ARTICLE_1_TO_14_MISSING","articles");
 for(let i=0;i<ARTICLE_PROOFS.length;i++){
  const expected=ARTICLE_PROOFS[i],x=rows[i]||{};
  if(x.articleNumber!==expected[0]||
     x.bodyStartCodepoint!==expected[1]||x.bodyEndExclusiveCodepoint!==expected[2]||
     x.articleExactSourceTextSha256!==expected[3]||
     x.articleToCkoNodeApproved!==false||x.legallyValidated!==false||
     x.clinicalClaimValidated!==false||x.publishable!==false)
    fail("EXACT_ARTICLE_SOURCE_BYTE_OFFSET_DRIFT",expected[0]);
  const ss=x.sourceAtomSpans||[];
  spans+=ss.length;
  if(ss.length!==expected[4].length)fail("ARTICLE_SPANS_UNDER_OR_OVERCOUNTED",expected[0]);
  for(let j=0;j<expected[4].length;j++){
   const y=ss[j]||{},e=expected[4][j];
   if(y.blockNumber!==e[0]||y.chunkNumber!==e[1]||
      y.atomStartCodepoint!==e[2]||y.atomEndExclusiveCodepoint!==e[3])
     fail("ARTICLE_ATOM_CHARACTER_OFFSET_OR_CHUNK_CHANGED",expected[0]);
  }
  holds.push({code:"ARTICLE_LEGAL_EDITION_CLAIM_APPROVAL_NOT_CONFIRMED",articleNumber:expected[0]});
 }
 if(t.sourceCopies!==2||t.articleNumbers!==14||t.articleOccurrencesAcrossTwoOriginalCopies!==28||
    t.articleSpanReferencesPerCopy!==18||t.totalSourceArticleSpanReferences!==36||
    t.exactArticleBoundariesVerifiedAgainstOriginalPdfTextLayer!==true||
    t.nonArticlePreambleCodepoints!==2283||t.bodyCodepoints!==8278||
    t.article4SourceAtomSpans!==4||t.article7SourceAtomSpans!==2||
    t.approvedCanonicalArticleNodes!==0||t.clinicalClaimsApproved!==0||t.dbWrites!==0||
    spans!==18)
   fail("ARTICLE_SOURCE_TOTALS_OR_APPROVALS_DRIFT","counts");
 if(/"(literal_text|search_index_text|content_text|fragment_text)"\s*:/.test(JSON.stringify(a)))
   fail("RAW_SOURCE_LEGAL_TEXT_NOT_PERMITTED_IN_GIT","metadata");
 return {counts:{articleNumbers:rows.length,originalSourcePdfCopies:seenSources.size,
   articleOccurrences:28,articleAtomSpanReferences:36,approvedCkoNodes:0,
   structuralErrors:errors.length,holds:holds.length},errors,holds,
   releaseGate:"HOLD_HUMAN_LEGAL_EDITION_RIGHTS_CLINICAL"};
}
