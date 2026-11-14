export function checkSeparateCorpora({index,pdfs}) {
 const errors=[],holds=[];const fail=(code,id)=>errors.push({code,id});
 if(index.scope!=="NCOS_CE_NONACCOUNTING"||!index.guardrails?.noDoubleCountWithPdfLiteralCorpus||
    !index.guardrails?.noAssumedPdfTextExtraction||!index.guardrails?.noSourceAuthorityFromDataAtom||
    !index.guardrails?.noDatabaseMutation||index.exclusions?.accountingIncluded!==0)
   fail("SCOPE_BOUNDARY_CHANGED","root");
 const seen=new Set(),phases=new Map();let total=0;
 for(const row of index.topics||[]){
   if(seen.has(row.topic))fail("DUPLICATE_TOPIC",row.topic);
   seen.add(row.topic);
   if(!Number.isInteger(row.reportedAtomCount)||row.reportedAtomCount<0||![1,2].includes(row.phase))
     fail("INVALID_TOPIC",row.topic);
   total+=row.reportedAtomCount;phases.set(row.phase,(phases.get(row.phase)||0)+row.reportedAtomCount);
   if(row.actualAtomFileHashVerified!==false||row.topicManifestVerified!==false||
      row.rightsForAllRecordsVerified!==false||row.clinicallyApproved!==false||row.publishingAllowed!==false)
     fail("UNVERIFIED_TOPIC_WAS_APPROVED",row.topic);
   if(row.topic==="protocolos_enfermagem"&&row.interpretation!=="PROTOCOL_PDF_INDEX_RECORDS_NOT_FULL_PDF_TEXT_EXTRACTION")
     fail("PROTOCOL_INDEX_MISREPRESENTED_AS_PDF_TEXT",row.topic);
   if(["sepse","sinais_vitais"].includes(row.topic)&&row.interpretation!=="CONTAINS_MARKED_MANUAL_TRANSCRIPTIONS_AND_OTHER_DATA")
     fail("MANUAL_TRANSCRIPTION_PROVENANCE_LOST",row.topic);
   holds.push({code:"TOPIC_MANIFEST_BYTES_UNVERIFIED",topic:row.topic});
 }
 const stats=index.counts||{};
 if(total!==stats.atomRecordsReported||phases.get(1)!==stats.phase1Reported||
    phases.get(2)!==stats.phase2Reported||seen.size!==stats.themes)
   fail("DOCUMENTARY_CORPUS_COUNTS_MISMATCH","counts");
 if(stats.sourcePdfLiteralAtomCorpusRecordsReportedSeparate!==pdfs.totals?.textAtomsReported)
   fail("PDF_LITERAL_CORPUS_COUNT_DRIFT","counts");
 const bySha=new Map(pdfs.documents.map(x=>[x.expectedPdfSha256,x]));
 for(const item of index.documentedExplicitCrosswalkCandidates||[]){
   const pdf=bySha.get(item.sourcePdfSha256);
   if(!pdf||pdf.actualPdfSha256!==item.sourcePdfSha256||pdf.bytesHashVerified!==true)
     fail("CROSSWALK_PDF_SOURCE_HASH_MISSING",item.originalAtomId);
   if(!item.originalAtomId?.startsWith("protocolos_enfermagem:protocolo:")||
      item.atomizedIndexRecordHashVerified!==false||item.canonicalIdentityAutoMerged!==false||item.approved!==false)
     fail("CROSSWALK_AUTO_CANONIZATION",item.originalAtomId);
   holds.push({code:"CROSSWALK_ATOM_FILE_UNVERIFIED",atom:item.originalAtomId});
 }
 if(stats.exactCrossCorpusAtomsAdmitted!==0||stats.topicsWithHashVerified!==0||index.releaseEligible!==false)
   fail("UNAUTHORIZED_CROSS_CORPUS_ADMISSION","root");
 return {stats:{dataAtomsReported:total,pdfTextAtomsReported:pdfs.totals?.textAtomsReported,
  topics:seen.size,phase1:phases.get(1)||0,phase2:phases.get(2)||0,
  verifiedTopicManifests:0,approvedLinks:0,errors:errors.length,holds:holds.length},
  errors,holds,releaseGate:"HOLD_HUMAN_DATA_CORPUS_ORIGINAL_MANIFESTS"};
}