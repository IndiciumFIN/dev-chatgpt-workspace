/** Deterministic read-only guards over existing evidentiary identities. */
export function checkSourceRightsAndProjections({rights,recovery,projections,graph}) {
  const failures=[],holds=[],edges=[];
  const fail=(code,record,detail)=>failures.push({code,record,detail});
  const hold=(code,record,detail)=>holds.push({code,record,detail});
  if(rights.scope!=="NCOS_CE_NONACCOUNTING"||projections.scope!=="NCOS_CE_NONACCOUNTING")
    fail("NONCE_SCOPE_DRIFT","root","Only non-accounting CE scope is accepted");
  if(!rights.governance?.allForHumanReview||!rights.governance?.rightsAndClinicalApprovalIndependent)
    fail("UNAUTHORIZED_RIGHTS_POLICY_CHANGE","rights","Rights reviewer is mandatory and separate from clinical approval");
  if(!projections.noDbMutation||!projections.noNewCanonicalIds||!projections.noLegalStatusInference||!projections.noLegalTextCopy)
    fail("UNAUTHORIZED_PROJECTION_PROMOTION","projection","Candidate cannot write master objects");
  const original=new Map(recovery.documents.map(x=>[x.sourceName,x]));
  const seen=new Set();
  for(const x of rights.documents||[]){
    if(seen.has(x.sourceName))fail("DUPLICATE_RIGHTS_SOURCE",x.sourceName,"Source identity repeated");
    seen.add(x.sourceName);
    const doc=original.get(x.sourceName);
    if(!doc||doc.actualPdfSha256!==x.verifiedPdfSha256||doc.bytesHashVerified!==true||
       !x.sourceBytesVerified)
       fail("RIGHTS_SOURCE_HASH_NOT_VERIFIED",x.sourceName,"Missing or unverified original PDF");
    if(x.usageApproval!==false||x.publicationApproval!==false||x.reviewerRequired!==true)
       fail("UNAPPROVED_RIGHTS_RELEASE",x.sourceName,"Human review is mandatory");
    if(x.rightsEvidence?.conditionsOrRedFlags?.some(t=>t==="NO_GENERAL_REDISTRIBUTION_PERMISSION"))
       hold("REPRODUCTION_RIGHTS_RESTRICTED",x.sourceName,"No verbatim distribution or publishing until permission");
    else if(x.rightsEvidence?.conditionsOrRedFlags?.some(t=>t==="NONCOMMERCIAL_USE_ONLY"))
       hold("NONCOMMERCIAL_LICENSE_SITE_REVIEW",x.sourceName,"Verify commercial/noncommercial site use before reuse");
    else if(x.rightsEvidence?.conditionsOrRedFlags?.some(t=>t==="CHART_COPYRIGHT_NOTICE"||t==="CHARTS_COLOUR_NO_MODIFICATION"))
       hold("NEWS2_ATTRIBUTION_AND_CHART_INTEGRITY",x.sourceName,"Ensure attribution, colour and no changes when permitted");
    else hold("SOURCE_RIGHTS_AUDIT_UNFINISHED",x.sourceName,"Rights case has no evidence for release");
    edges.push({from:x.sourceName,to:x.verifiedPdfSha256,relation:"INDEPENDENTLY_HASHED_SOURCE_BYTES_ONLY"});
  }
  if(seen.size!==original.size)
    fail("RIGHTS_INVENTORY_CARDINALITY_DRIFT","rights",String(seen.size)+" != "+original.size);
  const master=new Set(graph.records.masterProvisions.map(x=>x.provision_id));
  const provision=new Map(graph.records.provisions.map(x=>[x.provision_id,x]));
  const missing=graph.records.provisions.filter(x=>!master.has(x.provision_id));
  const inst=new Map(graph.records.instruments.map(x=>[x.instrument_id,x]));
  const ids=new Set();
  for(const x of projections.candidateProjections||[]){
    if(ids.has(x.existingProvisionId))fail("DUPLICATE_MASTER_CANDIDATE",x.existingProvisionId,"Candidate repeated");
    ids.add(x.existingProvisionId);
    const p=provision.get(x.existingProvisionId);
    if(!p||master.has(x.existingProvisionId)||
       x.sourceFragmentId!==p?.source_fragment_id||x.sourceFragmentSha256!==p?.fragment_sha256||
       x.sourceId!==p?.fragment_source_id||x.sourceSnapshotId!==p?.snapshot_id||
       x.existingInstrumentId!==p?.instrument_id||
       x.existingInstrumentCanonicalId!==inst.get(p?.instrument_id)?.canonical_id)
       fail("UNBACKED_MASTER_PROJECTION",x.existingProvisionId,"No exact source-backed missing provision");
    if(x.approved!==false||x.autoInsert!==false||x.autoPromote!==false||
       x.proposedMasterCanonicalId!==null||x.proposedLegalText!==null)
       fail("CANONICAL_ID_OR_TEXT_WAS_INVENTED",x.existingProvisionId,"Candidate must remain undecided");
    hold("PROVISION_LEGAL_STATUS_PENDING",x.existingProvisionId,x.observedSourceLegalStatus);
    edges.push({from:x.existingProvisionId,to:x.sourceFragmentId,relation:"EXISTING_SOURCE_FRAGMENT_REFERENCE"});
  }
  if(projections.missingMasterProvisionNodes!==missing.length||ids.size!==missing.length||
      missing.some(x=>!ids.has(x.provision_id)))
    fail("MASTER_MISSING_PROVISION_DELTA_DRIFT","projections","Every and only unmaterialized provision must be proposed");
  return {counts:{originalPdfSources:original.size,rightsRecords:seen.size,
    licenseEvidenceRecords:(rights.documents||[]).filter(x=>x.rightsEvidence).length,
    rightsReviewsComplete:(rights.documents||[]).filter(x=>x.usageApproval===true).length,
    masterProvisionProjectionsMissing:missing.length,projectionCandidateRecords:ids.size,
    failures:failures.length,holds:holds.length},failures,holds,edges,
    releaseGate:"HOLD_HUMAN_SOURCE_RIGHTS_AND_MASTER_PROJECTIONS"};
}
