import test from "node:test";
import assert from "node:assert/strict";
import {guardSourcePageReuse} from "./lib/ncos-source-page-reuse.mjs";
const a="a".repeat(64),b="b".repeat(64),c="c".repeat(64),d="d".repeat(64);
function fixture(){
return {recovery:{originalArchive:{sha256:d},documents:[
 {expectedPdfSha256:a,sourceName:"composite.pdf",pageCount:35},
 {expectedPdfSha256:b,sourceName:"standalone.pdf",pageCount:12},
 {expectedPdfSha256:c,sourceName:"NEWS2.pdf",pageCount:77}]},
 gazette:{editionMetadata:{sourceSnapshotSha256:d},duplicateLiteralPageGroup:[
 {sourcePdfSha256:"e".repeat(64)},{sourcePdfSha256:"f".repeat(64)}]},
 reuse:{scope:"NCOS_CE_NONACCOUNTING",kind:"EXACT_SOURCE_PAGE_REUSE_CANDIDATES_NOT_UNIQUE_KNOWLEDGE",
 originalArchiveSha256:d,fullPrivatePageLedgerSha256:d,localIndependentReuseReportSha256:d,
 guardrails:{noContentCopied:true,sourceOriginalsImmutable:true,notUniqueClinicalKnowledgeCount:true,
 independentDocEditionAndAuthorityRequired:true,cannotConcludeCommercialReuseFromOpenAccess:true,
 clinicalAndRightsReviewMandatory:true,noDbWrites:true},releaseEligible:false,
 matchedComponent:{compositePdfSha256:a,standalonePdfSha256:b,compositeName:"composite.pdf",
 standaloneName:"standalone.pdf",noOriginalFileDeleted:true,sourceCanonicalId:null,sourceSnapshotId:null,
 compositeSections:[["PORTARIA_2095_2013_AND_EXPLANATORY_MATERIAL",1,2],
 ["ANEXO_03_PROTOCOLO_CIRURGIA_SEGURA",3,14],
 ["ANEXO_02_PREVENCAO_ULCERA_PRESSAO",15,35]].map(([label,startPage,endPage])=>({
 label,startPage,endPage,authorityAdmission:false})),
 matchingPages:Array.from({length:12},(_,i)=>({compositePage1Based:i+3,standalonePage1Based:i+1,
 sourcePageTextSha256:(i+1).toString(16).padStart(64,"0"),
 literalBlockCount:i===0?293:1,visualReferences:i===4?1:0,
 identicalBlockContentBboxesAndImageSha256:true,approvedReuse:false,publicationAllowed:false}))},
 otherReuseGroups:[{type:"CROSS_PDF_IDENTICAL_DOU_TEXT_MIXED_ISSUERS",
 sourcePdfSha256A:"e".repeat(64),sourcePdfSha256B:"f".repeat(64),
 sourcePageTextSha256:d,repeatedLiteralBlocks:29,wholePageNormativeAdmission:false},
 {type:"INTRA_PDF_REPEATED_REPORT_COVER",sourcePdfSha256:c,pages1Based:[1,2],
 repeatedLiteralBlocks:2,wholePageNormativeAdmission:false}],
 rightsMetadataCandidate:{licenseAppliedToExactRecoveredPdfBytes:false,publicationRightsNotInferred:true,
 additionalRightsReviewRequired:true},
 totals:{identicalPageTextGroups:14,externalSourceIdenticalPageGroups:13,internalSourceIdenticalPageGroups:1,
 compositeSurgerySharedPages:12,compositeSurgerySharedTextBlocks:304,compositeSurgerySharedImageRefs:1,
 douSharedTextBlocks:29,newsletterInternalRepeatTextBlocks:2,
 potentiallyRepeatedCrossSourceTextBlockOccurrences:333,potentiallyRepeatedCrossSourceImageReferences:1,
 safeToDeleteOriginalFiles:0,automaticallySharedCkoIds:0,approvedEditorialReuseCases:0}}
}}
test("source page reuse is deterministic and held",()=>{const r=guardSourcePageReuse(fixture());
 assert.equal(r.errors.length,0);assert.equal(r.totals.sharedSurgeryPages,12);});
test("cannot auto admit unreviewed clinical reuse",()=>{const x=fixture();x.reuse.matchedComponent.matchingPages[0].approvedReuse=true;
 assert.ok(guardSourcePageReuse(x).errors.some(y=>y.code==="INVALID_EXACT_SUBDOCUMENT_PAGE_PAIR"));});
test("cannot alter annex boundary",()=>{const x=fixture();x.reuse.matchedComponent.compositeSections[1].endPage=35;
 assert.ok(guardSourcePageReuse(x).errors.some(y=>y.code==="COMPOSITE_ANNEX_BOUNDARY_MISMATCH"));});
test("cannot erase publication restrictions",()=>{const x=fixture();x.reuse.rightsMetadataCandidate.licenseAppliedToExactRecoveredPdfBytes=true;
 assert.ok(guardSourcePageReuse(x).errors.some(y=>y.code==="EXTERNAL_LICENSE_CANDIDATE_WAS_AUTO_APPROVED"));});
test("cannot merge original PDF binary identity",()=>{const x=fixture();x.reuse.matchedComponent.standalonePdfSha256=a;
 assert.ok(guardSourcePageReuse(x).errors.some(y=>y.code==="INVALID_COMPOSITE_STANDALONE_ORIGIN"));});
test("cannot double-count original PDF sections as 304 validated unique facts",()=>{
 const x=fixture();x.reuse.totals.potentiallyRepeatedCrossSourceTextBlockOccurrences=304;
 assert.ok(guardSourcePageReuse(x).errors.some(y=>y.code==="UNAPPROVED_REUSE_AGGREGATE_OR_COUNT_DRIFT"));});
