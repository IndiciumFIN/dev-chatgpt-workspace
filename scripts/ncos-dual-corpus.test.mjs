import test from "node:test";
import assert from "node:assert/strict";
import {checkSeparateCorpora} from "./lib/ncos-dual-corpus.mjs";
const sha="a".repeat(64);
function fixture(){
 const row=(topic,phase,reportedAtomCount,interpretation)=>({topic,phase,reportedAtomCount,interpretation,
 actualAtomFileHashVerified:false,topicManifestVerified:false,rightsForAllRecordsVerified:false,
 clinicallyApproved:false,publishingAllowed:false});
 return {index:{scope:"NCOS_CE_NONACCOUNTING",releaseEligible:false,exclusions:{accountingIncluded:0},
 guardrails:{noDoubleCountWithPdfLiteralCorpus:true,noAssumedPdfTextExtraction:true,
 noSourceAuthorityFromDataAtom:true,noDatabaseMutation:true},
 counts:{atomRecordsReported:9,phase1Reported:4,phase2Reported:5,themes:3,
 sourcePdfLiteralAtomCorpusRecordsReportedSeparate:25,exactCrossCorpusAtomsAdmitted:0,topicsWithHashVerified:0},
 topics:[row("cid10",1,4,"SOURCE_DATA_ATOMS_NOT_VERIFIED_IN_THIS_INVENTORY"),
 row("protocolos_enfermagem",2,3,"PROTOCOL_PDF_INDEX_RECORDS_NOT_FULL_PDF_TEXT_EXTRACTION"),
 row("sepse",2,2,"CONTAINS_MARKED_MANUAL_TRANSCRIPTIONS_AND_OTHER_DATA")],
 documentedExplicitCrosswalkCandidates:[{sourcePdfSha256:sha,
 originalAtomId:"protocolos_enfermagem:protocolo:resolucao-cofen-no-736-2024-processo-de-enfermagem",
 atomizedIndexRecordHashVerified:false,canonicalIdentityAutoMerged:false,approved:false}]},
 pdfs:{totals:{textAtomsReported:25},documents:[{expectedPdfSha256:sha,actualPdfSha256:sha,bytesHashVerified:true}]}
 };
}
test("independent corpus totals stay separate, HOLD preserved",()=>{
 const r=checkSeparateCorpora(fixture());
 assert.equal(r.errors.length,0);assert.equal(r.stats.dataAtomsReported,9);
 assert.equal(r.stats.pdfTextAtomsReported,25);assert.equal(r.stats.approvedLinks,0);
});
test("protocol index cannot become PDF literal text",()=>{
 const x=fixture();x.index.topics[1].interpretation="PDF_TEXT";
 assert.ok(checkSeparateCorpora(x).errors.some(y=>y.code==="PROTOCOL_INDEX_MISREPRESENTED_AS_PDF_TEXT"));
});
test("manual score provenance cannot silently disappear",()=>{
 const x=fixture();x.index.topics[2].interpretation="AUTO_EXTRACTED";
 assert.ok(checkSeparateCorpora(x).errors.some(y=>y.code==="MANUAL_TRANSCRIPTION_PROVENANCE_LOST"));
});
test("mixing reported counts fails",()=>{
 const x=fixture();x.index.counts.atomRecordsReported+=25;
 assert.ok(checkSeparateCorpora(x).errors.some(y=>y.code==="DOCUMENTARY_CORPUS_COUNTS_MISMATCH"));
});
test("a source hash match is not atom approval",()=>{
 const x=fixture();x.index.documentedExplicitCrosswalkCandidates[0].approved=true;
 assert.ok(checkSeparateCorpora(x).errors.some(y=>y.code==="CROSSWALK_AUTO_CANONIZATION"));
});
test("a mismatched PDF hash prevents crosswalk",()=>{
 const x=fixture();x.pdfs.documents[0].actualPdfSha256="0".repeat(64);
 assert.ok(checkSeparateCorpora(x).errors.some(y=>y.code==="CROSSWALK_PDF_SOURCE_HASH_MISSING"));
});