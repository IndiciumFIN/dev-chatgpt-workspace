/** Structural validation of private-source original PDF page attestations.
 * CI validates pinned metadata; actual ZIP bytes are checked by the offline generator.
 */
export function verifyPageEvidence({attestation,recovery}) {
 const errors=[],holds=[];
 const fail=(code,id)=>errors.push({code,id});
 const sha=v=>typeof v==="string" && /^[a-f0-9]{64}$/.test(v);
 const src=attestation||{},g=src.governance||{},s=src.counts||{};
 const rmap=new Map((recovery.documents||[]).map(d=>[d.expectedPdfSha256,d]));
 if(src.scope!=="NCOS_CE_NONACCOUNTING" ||src.kind!=="PAGE_LINEAGE_NONCONTENT_ATTESTATION"||
    src.sourceArchiveSha256!==recovery.originalArchive?.sha256 ||
    !sha(src.fullPrivatePageLedgerSha256) || !sha(src.privateAuditSha256) || !sha(src.generatorSha256) ||
    !g.noRawTextIncluded||!g.noRawImageIncluded||!g.noSqlWrites||!g.noNewCkoIdentifiers||
    g.releaseEligible!==false)
   fail("UNAUTHORIZED_PAGE_LINEAGE_SCOPE_OR_ARCHIVE_DRIFT","root");
 const seen=new Set();let pages=0,text=0,visual=0;
 for(const d of src.documents||[]){
  const r=rmap.get(d.sourcePdfSha256);
  if(seen.has(d.sourcePdfSha256))fail("DUPLICATE_PAGE_SOURCE",d.sourcePdfSha256);
  seen.add(d.sourcePdfSha256);
  if(!r ||d.originalJsonlSha256!==r.expectedJsonlSha256||
     d.pageCount!==r.pageCount||d.textAtoms!==r.textAtomsReported||
     d.visualReferences!==r.visualReferencesReported||
     r.bytesHashVerified!==true||r.atomizedJsonlBytesVerified!==true||
     !sha(d.pageMetadataRootSha256))fail("UNBACKED_PAGE_LINEAGE_ROOT",d.sourcePdfSha256);
  if(d.candidateCkoSourceId!==null||d.candidateCkoSnapshotId!==null||
     d.rightsApproved!==false||d.clinicalApproved!==false||d.publicationApproved!==false)
    fail("PAGE_LINEAGE_PREMATURE_AUTHORITY",d.sourcePdfSha256);
  pages+=d.pageCount||0;text+=d.textAtoms||0;visual+=d.visualReferences||0;
  holds.push({code:"SOURCE_CKO_LICENSE_CLINICAL_IDENTITY_REVIEW",sourcePdfSha256:d.sourcePdfSha256});
 }
 if(seen.size!==rmap.size||seen.size!==s.documents||s.documents!==s.verifiedOriginalJsonlFiles||
   pages!==s.pages||text!==s.textAtoms||visual!==s.visualReferences||
   s.atomRecordIds!==text+visual||s.validatedCkoIdentities!==0||
   s.rightsApprovals!==0||s.clinicalApprovals!==0||
   s.pagesWithOriginalTextLayerSha256+s.pagesWithoutTextLayerSha256!==pages ||
   pages!==recovery.totals?.sourcePdfPagesVerified||
   text!==recovery.totals?.textAtomsReported||
   visual!==recovery.totals?.visualAtomsReported)
    fail("PAGE_ATTESTATION_TOTALS_DRIFT","root");
 return {counts:{verifiedSourceRoots:seen.size,pages,textAtoms:text,visualReferences:visual,
   structuralErrors:errors.length,holds:holds.length},errors,holds,
   releaseGate:"HOLD_HUMAN_SOURCE_RIGHTS_CLINICAL_AND_CKO_IDENTITY"};
}
