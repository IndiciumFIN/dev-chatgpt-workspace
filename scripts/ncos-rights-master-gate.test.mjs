import test from "node:test";
import assert from "node:assert/strict";
import {checkSourceRightsAndProjections} from "./lib/ncos-rights-master-gate.mjs";
const A="a".repeat(64),B="b".repeat(64);
function base(){
return {rights:{scope:"NCOS_CE_NONACCOUNTING",
  governance:{allForHumanReview:true,rightsAndClinicalApprovalIndependent:true},
  documents:[{sourceName:"test.pdf",verifiedPdfSha256:A,sourceBytesVerified:true,usageApproval:false,
    publicationApproval:false,reviewerRequired:true,rightsEvidence:{conditionsOrRedFlags:["NO_GENERAL_REDISTRIBUTION_PERMISSION"]}}]},
 recovery:{documents:[{sourceName:"test.pdf",actualPdfSha256:A,bytesHashVerified:true}]},
 projections:{scope:"NCOS_CE_NONACCOUNTING",noDbMutation:true,noNewCanonicalIds:true,
  noLegalStatusInference:true,noLegalTextCopy:true,missingMasterProvisionNodes:1,
  candidateProjections:[{existingProvisionId:"P1",existingInstrumentId:"I1",existingInstrumentCanonicalId:"LAW-1",
    sourceFragmentId:"F1",sourceFragmentSha256:B,sourceSnapshotId:"SN1",sourceId:"S1",
    approved:false,autoInsert:false,autoPromote:false,proposedMasterCanonicalId:null,proposedLegalText:null}]},
 graph:{records:{masterProvisions:[],
  instruments:[{instrument_id:"I1",canonical_id:"LAW-1"}],
  provisions:[{provision_id:"P1",instrument_id:"I1",source_fragment_id:"F1",fragment_sha256:B,
    snapshot_id:"SN1",fragment_source_id:"S1"}]}}
};
}
test("candidate proof remains HOLD even with bytes validated",()=>{
 const r=checkSourceRightsAndProjections(base());
 assert.equal(r.failures.length,0);
 assert.equal(r.counts.licenseEvidenceRecords,1);
 assert.ok(r.holds.some(x=>x.code==="REPRODUCTION_RIGHTS_RESTRICTED"));
 assert.ok(r.holds.some(x=>x.code==="PROVISION_LEGAL_STATUS_PENDING"));
});
test("attempt to approve rights without human review fails closed",()=>{
 const x=base();x.rights.documents[0].publicationApproval=true;
 assert.ok(checkSourceRightsAndProjections(x).failures.some(y=>y.code==="UNAPPROVED_RIGHTS_RELEASE"));
});
test("tampered source hash invalidates license provenance",()=>{
 const x=base();x.rights.documents[0].verifiedPdfSha256="0".repeat(64);
 assert.ok(checkSourceRightsAndProjections(x).failures.some(y=>y.code==="RIGHTS_SOURCE_HASH_NOT_VERIFIED"));
});
test("uncorroborated provision projection must fail",()=>{
 const x=base();x.projections.candidateProjections[0].sourceFragmentId="FRAG-UNKNOWN";
 assert.ok(checkSourceRightsAndProjections(x).failures.some(y=>y.code==="UNBACKED_MASTER_PROJECTION"));
});
test("canonical id and legal text may not be auto-invented",()=>{
 const x=base();x.projections.candidateProjections[0].proposedMasterCanonicalId="LAW-1-ART-01";
 assert.ok(checkSourceRightsAndProjections(x).failures.some(y=>y.code==="CANONICAL_ID_OR_TEXT_WAS_INVENTED"));
});
test("missing projection cannot be silently omitted",()=>{
 const x=base();x.projections.candidateProjections=[];
 assert.ok(checkSourceRightsAndProjections(x).failures.some(y=>y.code==="MASTER_MISSING_PROVISION_DELTA_DRIFT"));
});
test("noncommercial license condition must block until site use is reviewed",()=>{
 const x=base();x.rights.documents[0].rightsEvidence.conditionsOrRedFlags=["NONCOMMERCIAL_USE_ONLY"];
 assert.ok(checkSourceRightsAndProjections(x).holds.some(y=>y.code==="NONCOMMERCIAL_LICENSE_SITE_REVIEW"));
});
