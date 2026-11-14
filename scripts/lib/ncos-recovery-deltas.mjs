/** Only metadata and explicit foreign keys. No guessed claim text or authority. */
export function buildRecoveryDeltas({sourceInventory,recovery,editorial}) {
 const errors=[],holds=[];
 const fail=(code,id,detail)=>errors.push({code,id,detail});
 const hold=(code,id,detail)=>holds.push({code,id,detail});
 const d=sourceInventory.datasets;
 const atomHashIndex=new Map(d.atomizations.map(x=>[x.atomized_jsonl_sha256,x]));
 const names=new Set(), ids=new Set();
 const documents=recovery.documents.map(x=>{
   if(names.has(x.sourceName)||ids.has(x.driveFileId))fail("DUPLICATE_DRIVE_ATOMIZATION_SOURCE",x.sourceName,x.driveFileId);
   names.add(x.sourceName);ids.add(x.driveFileId);
   const record=atomHashIndex.get(x.expectedJsonlSha256);
   if(!record||record.source_pdf_sha256!==x.expectedPdfSha256)
     fail("PDF_ATOM_HASH_PAIR_MISMATCH",x.sourceName,"Expected original and atomized hashes must refer to one Supabase record");
   if(x.driveSourceStatus!=="METADATA_READBACK_PRESENT")hold("ORIGINAL_PDF_METADATA_NOT_VERIFIED",x.sourceName,"Revalidate connected Drive file");
   if(x.bytesHashVerified!==true)hold("ORIGINAL_PDF_BYTES_UNVERIFIED",x.sourceName,"Need actual bytes + SHA256");
   if(x.atomizedJsonlBytesVerified!==true)hold("ATOM_JSONL_BYTES_NOT_VERIFIED",x.sourceName,"Recover original JSONL, do not recreate by guessing");
   if(x.atomizedJsonlBytesVerified===true&&(
     x.actualJsonlSha256!==x.expectedJsonlSha256||
     x.atomizedJsonlArchiveSha256!==recovery.originalArchive?.sha256||
     x.atomizedJsonlArchiveMember!=="atomic_docs/"+x.atomizedJsonlName))
      fail("RESTORED_JSONL_CLAIM_WITHOUT_VERIFIABLE_HASH",x.sourceName,"Recovered bytes must be linked to the original archive and matching Supabase hash");
   if(x.publicationAllowed===true&&(!x.bytesHashVerified||!x.atomizedJsonlBytesVerified))
     fail("PUBLICATION_FLAG_WITHOUT_BYTES_EVIDENCE",x.sourceName,"Fail closed");
   return {sourceName:x.sourceName,driveFileId:x.driveFileId,
     storedPdfSha256:x.expectedPdfSha256,storedJsonlSha256:x.expectedJsonlSha256,
     pdfMetadataLocated:x.driveSourceStatus==="METADATA_READBACK_PRESENT",
     pdfBytesVerified:x.bytesHashVerified,
     jsonlRecovered:x.atomizedJsonlLocated,
     jsonlBytesVerified:x.atomizedJsonlBytesVerified,
     reportedAtoms:x.textAtomsReported,reportedVisualRefs:x.visualReferencesReported,
     action:"RECOVER_JSONL_AND_VERIFY_BYTES_HASH_WITH_ORIGINAL_SOURCE",
     releaseEligible:false};
 });
 if(documents.length!==d.atomizations.length)fail("ATOMIZATION_CARDINALITY_DRIFT","recovery","Drive manifest differs from Supabase");
 const norm=new Map(d.normatives.map(x=>[x.normative_ref,x]));
 const sources=new Map(d.evidenceSources.map(x=>[x.source_id,x]));
 const snapshotsBySource=new Map();
 for(const s of d.snapshots) {
   if(!snapshotsBySource.has(s.source_id))snapshotsBySource.set(s.source_id,[]);
   snapshotsBySource.get(s.source_id).push(s);
 }
 const normRefsByUrl=new Map();
 const evidenceRefsByUrl=new Map();
 const key=s=>typeof s==="string"?s.trim().toLowerCase().replace(/\/+$/,""):"";
 for(const n of d.normatives){const k=key(n.official_uri);if(!k)continue;if(!normRefsByUrl.has(k))normRefsByUrl.set(k,[]);normRefsByUrl.get(k).push(n.normative_ref);}
 for(const s of d.evidenceSources){const k=key(s.official_uri);if(!k)continue;if(!evidenceRefsByUrl.has(k))evidenceRefsByUrl.set(k,[]);evidenceRefsByUrl.get(k).push(s.source_id);}
 const links=(sourceInventory.matchingCandidates||[]).map(x=>{
   const n=norm.get(x.normative_ref),s=sources.get(x.source_id);
   if(!n||!s){fail("MATCH_TARGET_MISSING",x.normative_ref,x.source_id);return null;}
   if(key(n.official_uri)!==key(s.official_uri))fail("URL_MATCH_DRIFT",x.normative_ref,x.source_id);
   if(x.identityApproved!==false)fail("UNAUTHORIZED_SOURCE_ALIAS",x.normative_ref,x.source_id);
   const ss=snapshotsBySource.get(s.source_id)||[];
   return {
     normativeRef:x.normative_ref,evidenceSourceId:x.source_id,
     normativeTitle:n.title,evidenceTitle:s.title,
     authority:n.authority,evidencePublisher:s.publisher,
     normativeStatus:n.binding_status,evidenceAccreditation:s.accreditation_status,
     officialUri:n.official_uri,sourceUri:s.official_uri,
     sourceSnapshots:ss.map(y=>({snapshotId:y.snapshot_id,validationStatus:y.validation_status,
       contentSha256:y.content_sha256})),
     identitySignals:{urlSameAfterCaseAndTrailingSlashNormalization:true,
       multipleNormativeRefsShareUrl:(normRefsByUrl.get(key(n.official_uri))||[]).length>1,
       multipleEvidenceSourceIdsShareUrl:(evidenceRefsByUrl.get(key(s.official_uri))||[]).length>1},
     checkRequired:["ISSUER","DOCUMENT_IDENTITY","EDITION","JURISDICTION","VIGENCY","LICENSE","SNAPSHOT_BYTES"],
     approval:"HOLD_HUMAN",autoMerged:false
   };
 }).filter(Boolean);
 const assertionsBySubject=new Map();
 for(const a of d.assertions) {
  if(!assertionsBySubject.has(a.subject_ref))assertionsBySubject.set(a.subject_ref,[]);
  assertionsBySubject.get(a.subject_ref).push(a.assertion_id);
 }
 const evidenceIds=new Set([...d.evidenceSources.map(x=>x.source_id),
  ...d.snapshots.map(x=>x.snapshot_id),...d.fragments.map(x=>x.fragment_id),
  ...d.extractions.map(x=>x.extraction_id),...d.normatives.map(x=>x.normative_ref)]);
 const claims=d.claims.filter(x=>!x.assertion_refs?.length).map(c=>({
  claimId:c.claim_id,subjectRef:c.subject_ref,existingStatus:c.status,
  evidenceRefs:c.evidence_refs||[],
  evidenceIdKnown:(c.evidence_refs||[]).filter(x=>evidenceIds.has(x)),
  evidenceUnresolved:(c.evidence_refs||[]).filter(x=>!evidenceIds.has(x)),
  candidateAssertionsSameSubject:assertionsBySubject.get(c.subject_ref)||[],
  candidateMeaningVerified:false,
  action:"REVIEW_EXACT_ATOMIC_CLAIM_WITH_SOURCE_FRAGMENT_BEFORE_BINDING",
  autoLinked:false,approval:"HOLD_HUMAN"
 }));
 const claimIdSet=new Set(d.claims.map(x=>x.claim_id));
 let moduleCount=0,withClaimIds=0,brokenExplicitClaimIds=0,legacySourcePages=0;
 const pages=editorial.map(({slug,page,provenance})=>{
  const moduleRows=(page.modules||[]).map(m=>{
   moduleCount++;
   const meta=provenance.module_provenance?.[m.module_id];
   const explicit=new Set();
   const visit=(obj,depth=0)=>{
     if(depth>10||obj===null||typeof obj!=="object")return;
     if(Array.isArray(obj)){for(const x of obj)visit(x,depth+1);return;}
     for(const [k,v] of Object.entries(obj)){
       if(k==="claim_ids"&&Array.isArray(v))v.filter(x=>typeof x==="string").forEach(x=>explicit.add(x));
       // Collect only explicit claim_ids, not arbitrary names/strings in editorial prose.
       else if(typeof v==="object")visit(v,depth+1);
     }
   };
   visit(m);
   const unknown=[...explicit].filter(x=>!claimIdSet.has(x));
   if(unknown.length){brokenExplicitClaimIds+=unknown.length;fail("EDITORIAL_EXPLICIT_CLAIM_UNKNOWN",slug+"#"+m.module_id,unknown);}
   if(explicit.size>0)withClaimIds++;
   if(!meta)fail("EDITORIAL_PROVENANCE_MISSING",slug,m.module_id);
   const ref=m.provenance_ref||"";
   if(!ref.endsWith("/module_provenance/"+m.module_id))
     hold("EDITORIAL_PROVENANCE_POINTER_REVIEW",slug+"#"+m.module_id,ref);
   return {moduleId:m.module_id,editorialProvenanceClass:meta?.provenance?.class||null,
     explicitClaimIds:[...explicit].sort(),knownClaimIds:[...explicit].filter(x=>claimIdSet.has(x)),
     legacySourceRef:meta?.source?.legacy_snapshot_ref||null,
     sourceEvidencePromoted:false,releaseEligible:false};
  });
  const legacy=!!provenance.page_source?.source_file;
  if(legacy)legacySourcePages++;
  return {slug,legacyOrigin:legacy,modules:moduleRows,approval:"HOLD_EDITORIAL_CKO_CLAIM_ALIGNMENT"};
 });
 if(brokenExplicitClaimIds)hold("UNKNOWN_EDITORIAL_CLAIMS",String(brokenExplicitClaimIds),"Cannot use editorial as authority");
 if(claims.length)hold("CLAIMS_MISSING_ASSERTIONS",String(claims.length),"Some have only same-subject candidates, not proof");
 if(links.length)hold("URI_CANDIDATE_IDENTITIES_NEED_REVIEW",String(links.length),"URL equivalence is not authoritative");
 if(legacySourcePages)hold("EDITORIAL_LEGACY_SOURCE_BINDINGS",String(legacySourcePages),"Provenance is editorial origin, not source authority");
 const totals={
    recoveredPdfMetadata:documents.filter(x=>x.pdfMetadataLocated).length,
    originalPdfByteHashesVerified:documents.filter(x=>x.pdfBytesVerified).length,
    recoveredAndVerifiedJsonl:documents.filter(x=>x.jsonlBytesVerified).length,
    atomizationSourceRecords:documents.length,
    candidateIdentityPairs:links.length,
    claimsWithoutAssertion:claims.length,
    claimsWithSameSubjectCandidate:claims.filter(x=>x.candidateAssertionsSameSubject.length>0).length,
    editorialPages:pages.length,editorialModules:moduleCount,
    editorialModulesWithExplicitClaimId:withClaimIds,
    unresolvedExplicitClaimIds:brokenExplicitClaimIds,
    editorialPagesWithLegacyOrigin:legacySourcePages,
    hardErrors:errors.length,reviewHolds:holds.length
 };
 return {totals,errors,holds,documents,links,claims,pages,
   releaseGate:"HOLD_HUMAN_SOURCE_LINEAGE_AND_ATOMS"};
}
