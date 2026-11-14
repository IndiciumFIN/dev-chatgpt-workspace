/** Immutable historical archive attestations; checks pinned metadata only.
 * Real independent ZIP byte check was done outside CI without committing the source.
 */
export function checkRecoveredOriginalArchive({attestation,recovery,sourceInventory}){
 const errors=[],holds=[];
 const fail=(code,id)=>errors.push({code,id});
 const hold=(code,id)=>holds.push({code,id});
 const a=attestation?.sourceLibraryArchive;
 if(attestation.scope!=="NCOS_CE_NONACCOUNTING"||
    a?.verifiedJsonlEntries!==17||
    !/^[0-9a-f]{64}$/.test(a?.sha256||"")||
    !/^file_[0-9a-f]+$/.test(a?.libraryFileId||"")||
    attestation.noClinicalApproval!==true||attestation.noDbMutation!==true)
   fail("RECOVERY_ARCHIVE_PROVENANCE_INVALID","attestation");
 const counts=attestation.verification||{};
 if(counts.verifiedPdfSha256Count!==17||counts.verifiedJsonlSha256Count!==17||
    counts.originalJsonlCount!==17||counts.originalPdfCount!==17||
    counts.totalPdfPagesWithExactTextLayerReconstruction!==1192||
    counts.verifiedTextAtoms!==25508||counts.verifiedVisualHashReferences!==887||
    counts.parsedAtomicJsonLines!==26395||
    counts.jsonParsingErrors!==0||counts.sourceTextPageMismatchCount!==0||
    counts.sourceVisualImageMismatchPages!==0||counts.clinicalSemanticSignoffs!==0||
    counts.rightsApprovals!==0||counts.publicationAuthorized!==false||
    counts.fulltextCommittedToGitHub!==false)
   fail("RECOVERY_ATTESTATION_COUNTS_OR_RELEASE_CHANGED","totals");
 const rows=recovery.documents||[],history=attestation.filenamesAndHashes||[];
 const registry=new Map((sourceInventory.datasets?.atomizations||[]).map(x=>[x.atomized_jsonl_sha256,x]));
 const byOriginal=new Map(rows.map(x=>[x.atomizedJsonlName,x]));
 const seen=new Set();let totalText=0,totalVisual=0;
 for(const x of history){
  const member=x.restoredJsonlZipMember||"";
  if(seen.has(member)||!member.startsWith("atomic_docs/")||member.includes(".."))
   fail("DUPLICATE_OR_UNSAFE_ORIGINAL_ZIP_MEMBER",member);
  seen.add(member);
  const rec=byOriginal.get(member.slice("atomic_docs/".length));
  const original=registry.get(x.restoredJsonlSha256);
  if(!rec||!original||original.source_pdf_sha256!==x.originalPdfSha256||
     x.originalSourcePdf!==rec.sourceName||
     rec.expectedJsonlSha256!==x.restoredJsonlSha256||
     rec.actualJsonlSha256!==x.restoredJsonlSha256||
     rec.expectedPdfSha256!==x.originalPdfSha256||
     rec.actualPdfSha256!==x.originalPdfSha256||
     rec.atomizedJsonlArchiveMember!==member||
     rec.atomizedJsonlArchiveSha256!==a?.sha256||
     rec.atomizedJsonlBytesVerified!==true||
     rec.atomizedJsonlLocated!==true)
    fail("RECOVERED_ATOM_SOURCE_CHAIN_MISMATCH",member);
  if(rec?.publicationAllowed!==false||rec?.clinicalSignoff==="APPROVED"||
      x.publicationStatus!=="BLOCKED"||x.clinicalStatus!=="PENDING")
    fail("UNAUTHORIZED_ATOM_RELEASE",member);
  totalText+=x.literalAtoms;totalVisual+=x.visualReferences;
 }
 if(seen.size!==17||seen.size!==rows.length||
    totalText!==counts.verifiedTextAtoms||totalVisual!==counts.verifiedVisualHashReferences)
   fail("RESTORED_ENTRY_COUNT_DRIFT","counts");
 if(recovery.originalArchive?.sha256!==a?.sha256||
    recovery.totals?.jsonlArtifactHashesVerified!==17||
    recovery.totals?.atomRecordsVerified!==26395||
    recovery.totals?.sourcePdfPagesVerified!==1192)
   fail("RECOVERY_SUMMARY_ATTESTATION_DRIFT","root");
 hold("SEMANTIC_CLINICAL_VALIDATION_STILL_PENDING","all-17");
 hold("SOURCE_LICENSE_AND_REPRODUCTION_REVIEW_STILL_PENDING","all-17");
 hold("VISUAL_IMAGE_CONTENT_NOT_CLINICALLY_REVIEWED","all-887");
 return {counts:{archiveEntries:seen.size,verifiedOriginalPdfHashes:17,
  verifiedOriginalJsonlHashes:17,textAtoms:totalText,visualReferences:totalVisual,
  structuralErrors:errors.length,releaseHolds:holds.length},errors,holds,
  releaseGate:"HOLD_HUMAN_CLINICAL_RIGHTS_AND_VISUAL"};
}