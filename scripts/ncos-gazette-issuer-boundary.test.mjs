import test from "node:test";
import assert from "node:assert/strict";
import {guardGazetteIssuerBoundary} from "./lib/ncos-gazette-issuer-boundary.mjs";
const a="a".repeat(64),b="b".repeat(64),c="c".repeat(64),t="d".repeat(64),j="e".repeat(64),k="f".repeat(64);
function fixture(){
 const files=[["dou_2024-01-23_s1_p74.pdf",a,j],["Resolucao_Cofen_no_736_2024_Processo_de_Enfermagem.pdf",b,k]];
 return {quarantine:{scope:"NCOS_CE_NONACCOUNTING",kind:"CROSS_ISSUER_OFFICIAL_GAZETTE_PAGE_QUARANTINE",
 status:"HOLD_HUMAN_SOURCE_DOCUMENT_SEGMENTATION",publicationAllowed:false,sourceIdsWritten:0,dbWrites:0,
 editionMetadata:{sourceSnapshotSha256:t},identicalBlockTextsAndBboxesBetweenDistinctBinaryFiles:true,
 issuerBoundaryObserved:{sourceIsWholeGazettePageNotPureNursingAct:true,cofen736ActPresent:true,
 cofenRelatedAtomsIndependentlyQualified:0,blockedSourceTextAtomOccurrences:58,
 otherIssuer:"CONSELHO FEDERAL DE FISIOTERAPIA E TERAPIA OCUPACIONAL"},
 reviewRules:{noAutomaticFullGazettePageAdmission:true,forbidCrossIssuerBlockPromotion:true,
 noAccountingOrUnrelatedIssuerContentAllowed:true,doNotTreatIdenticalPageTextAsIdenticalSourceBinary:true,
 requireExplicitActLevelAndIssuerLevelReview:true},
 duplicateLiteralPageGroup:files.map(([pdfName,sourcePdfSha256,jsonlSha256])=>({
  pdfName,sourcePdfSha256,jsonlSha256,originalTextAtoms:29,pageCount:1,textLayerSha256:t})),
 alternativeOriginalCofenSei:{pdfSha256:c,sourcePages:4,
 linkToSameExistingCkoSourceCandidate:"SRC-COFEN-RES-736-2024",
 sourceTextIdenticalToGazettePage:false,editionRevalidationPending:true}},
 recovery:{documents:[...files.map(([sourceName,expectedPdfSha256,expectedJsonlSha256])=>({
  sourceName,expectedPdfSha256,expectedJsonlSha256,atomizedJsonlBytesVerified:true,bytesHashVerified:true})),
  {expectedPdfSha256:c}]},
 crosswalk:{rows:files.map(([,sourcePdfSha256])=>({
  sourcePdfSha256,possibleExistingCkoSourceId:"SRC-COFEN-RES-736-2024",
  candidateApproved:false,addedToCko:false}))}}
}
test("same text layer different PDFs remains quarantined",()=>{const r=guardGazetteIssuerBoundary(fixture());
 assert.equal(r.errors.length,0);assert.equal(r.counts.blockedLiteralAtomOccurrences,58);});
test("cannot promote a whole mixed DOU page",()=>{const x=fixture();x.quarantine.reviewRules.noAutomaticFullGazettePageAdmission=false;
 assert.ok(guardGazetteIssuerBoundary(x).errors.some(e=>e.code==="CROSS_ISSUER_GAZETTE_RELEASE_POLICY_CHANGED"));});
test("cannot erase unrelated issuer from source",()=>{const x=fixture();x.quarantine.issuerBoundaryObserved.otherIssuer="COFEN";
 assert.ok(guardGazetteIssuerBoundary(x).errors.some(e=>e.code==="GAZETTE_MULTI_ISSUER_SCOPE_LOST"));});
test("file-level hashes must remain two distinct originals",()=>{const x=fixture();x.quarantine.duplicateLiteralPageGroup[1].sourcePdfSha256=a;
 assert.ok(guardGazetteIssuerBoundary(x).errors.some(e=>e.code==="DISTINCT_PDF_BINARY_MANIFESTATION_LOST"));});
test("unreviewed page cannot inherit a CKO source automatically",()=>{const x=fixture();x.crosswalk.rows[0].candidateApproved=true;
 assert.ok(guardGazetteIssuerBoundary(x).errors.some(e=>e.code==="MISSING_HOLD_FOR_EXISTING_COFEN_CKO_SOURCE"));});
test("PDF text-layer digest must stay pinned",()=>{const x=fixture();x.quarantine.duplicateLiteralPageGroup[0].textLayerSha256="0".repeat(64);
 assert.ok(guardGazetteIssuerBoundary(x).errors.some(e=>e.code==="UNVERIFIED_DUPLICATED_GAZETTE_PAGE"));});
