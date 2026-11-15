import test from "node:test";
import assert from "node:assert/strict";
import {ARTICLE_PROOFS,checkCofen736ArticleOffsets} from "./lib/ncos-cofen736-article-offsets.mjs";
const a="a".repeat(64),b="b".repeat(64),h="c".repeat(64),c="d".repeat(64),d="e".repeat(64);
function fixture(){
 const copies=[0,1].map((i)=>({sourcePdfName:"doc"+i+".pdf",sourcePdfSha256:[a,b][i],
  originalJsonlSha256:[c,d][i],sourcePageTextSha256:h,
  originalArticleBodySha256:"e9a77fe8fc11764c0c988833a3350867428eb0b8c65aef759efd1a78df70bf29",
  bodyLengthCodepoints:8278,preambleLengthCodepoints:2283,articleCount:14,
  ckoSourceCandidateId:"SRC-COFEN-RES-736-2024",sourceEditionVerified:false,
  clinicalRightsApproved:false,sourceSnapshotCreated:false}));
 return {articles:{scope:"NCOS_CE_NONACCOUNTING",kind:"COFEN736_14_UNAPPROVED_ARTICLE_CHAR_OFFSETS",
  originalZipSha256:h,privateFullArticleProofSha256:h,
  status:"HOLD_HUMAN_COFEN_EDITION_LEGAL_ARTICLE_CLINICAL_RIGHTS",
  publicationAllowed:false,rightsApproved:false,articleLegalEffectReviewed:false,
  articleToCkoAutoLinked:false,allProtectedSourceTextExcludedFromGit:true,sourceInstances:copies,
  articleCandidates:ARTICLE_PROOFS.map(([n,start,end,sha,ss])=>({
   articleNumber:n,bodyStartCodepoint:start,bodyEndExclusiveCodepoint:end,articleExactSourceTextSha256:sha,
   sourceAtomSpans:ss.map(([blockNumber,chunkNumber,atomStartCodepoint,atomEndExclusiveCodepoint])=>({
    blockNumber,chunkNumber,atomStartCodepoint,atomEndExclusiveCodepoint})),
   articleToCkoNodeApproved:false,legallyValidated:false,clinicalClaimValidated:false,publishable:false})),
  totals:{sourceCopies:2,articleNumbers:14,articleOccurrencesAcrossTwoOriginalCopies:28,
   articleSpanReferencesPerCopy:18,totalSourceArticleSpanReferences:36,
   exactArticleBoundariesVerifiedAgainstOriginalPdfTextLayer:true,nonArticlePreambleCodepoints:2283,
   bodyCodepoints:8278,article4SourceAtomSpans:4,article7SourceAtomSpans:2,
   approvedCanonicalArticleNodes:0,clinicalClaimsApproved:0,dbWrites:0}},
  actBoundary:{originalPages:copies.map(x=>({originalPdfSha256:x.sourcePdfSha256,
   originalJsonlSha256:x.originalJsonlSha256,sourcePdfName:x.sourcePdfName,
   pageTextSha256:h}))},
  recovery:{originalArchive:{sha256:h},documents:copies.map(x=>({
   expectedPdfSha256:x.sourcePdfSha256,expectedJsonlSha256:x.originalJsonlSha256,
   bytesHashVerified:true,atomizedJsonlBytesVerified:true}))}};
}
test("14 exact article offsets and 36 span refs remain held",()=>{
 const r=checkCofen736ArticleOffsets(fixture());
 assert.equal(r.errors.length,0);assert.equal(r.counts.articleNumbers,14);
 assert.equal(r.releaseGate,"HOLD_HUMAN_LEGAL_EDITION_RIGHTS_CLINICAL");});
test("reject fabricated article 15",()=>{const x=fixture();x.articles.articleCandidates.push({...x.articles.articleCandidates[13],articleNumber:15});
 assert.ok(checkCofen736ArticleOffsets(x).errors.some(e=>e.code==="ARTICLE_1_TO_14_MISSING"));});
test("reject article 4 falsely compressed into one extraction atom",()=>{const x=fixture();x.articles.articleCandidates[3].sourceAtomSpans=[x.articles.articleCandidates[3].sourceAtomSpans[0]];
 assert.ok(checkCofen736ArticleOffsets(x).errors.some(e=>e.code==="ARTICLE_SPANS_UNDER_OR_OVERCOUNTED"));});
test("reject original article 14 text hash tampering",()=>{const x=fixture();x.articles.articleCandidates[13].articleExactSourceTextSha256="f".repeat(64);
 assert.ok(checkCofen736ArticleOffsets(x).errors.some(e=>e.code==="EXACT_ARTICLE_SOURCE_BYTE_OFFSET_DRIFT"));});
test("reject shift in original Unicode offset",()=>{const x=fixture();x.articles.articleCandidates[4].bodyStartCodepoint+=1;
 assert.ok(checkCofen736ArticleOffsets(x).errors.some(e=>e.code==="EXACT_ARTICLE_SOURCE_BYTE_OFFSET_DRIFT"));});
test("reject source PDF version identity drift",()=>{const x=fixture();x.articles.sourceInstances[0].sourcePdfSha256="f".repeat(64);
 assert.ok(checkCofen736ArticleOffsets(x).errors.some(e=>e.code==="ARTICLE_ORIGINAL_COPY_SOURCE_IDENTITY_OR_EDITION_DRIFT"));});
test("reject legal release without source edition signoff",()=>{const x=fixture();x.articles.articleLegalEffectReviewed=true;
 assert.ok(checkCofen736ArticleOffsets(x).errors.some(e=>e.code==="ARTICLE_RELEASE_GUARD_VIOLATED"));});
test("reject raw text fields in CKO proof",()=>{const x=fixture();x.articles.literal_text="NO LICENSE";
 assert.ok(checkCofen736ArticleOffsets(x).errors.some(e=>e.code==="RAW_SOURCE_LEGAL_TEXT_NOT_PERMITTED_IN_GIT"));});
