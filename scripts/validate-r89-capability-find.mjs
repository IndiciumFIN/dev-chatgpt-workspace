/** Read-only evidence guard: validating an OPEN_HOLD is not approving the missing capability. */
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const fail=x=>{throw Error(x);};
export function validateR89CapabilityFind(x){
 if(x?.schemaVersion!=='1.0.0'||x?.recordType!=='UNADMITTED_READ_ONLY_CANDIDATE_FIND'||x.id!=='FIND-EXP-CAP-REF-001'||x.state!=='OPEN_HOLD')fail('R89_CAP_FIND_STATUS_DRIFT');
 if(x.origin?.pr!==21||x.origin.headSha!=='ad4c683890779eda3a096743b70cf6be2bfc4605'||x.origin.capabilityRegistry?.gitBlobSha!=='ab610115cf4ef8bd9544cf562215efcfe941e86e'||x.origin.objectBindingRegistry?.gitBlobSha!=='eb4fe2d1119af3fa85cbdedf4e17562c56cbd4f2'||x.origin.capabilityRegistry.declaredCapabilities!==201||x.origin.objectBindingRegistry.declaredObjectTypes!==16)fail('R89_CAP_SOURCE_PROVENANCE_DRIFT');
 const p=x.reproducedObservation;
 if(p.missingReferences!==1||p.objectType!=='LibraryEntity'||p.capabilityId!=='CAP-RELATED-CONTENT'||p.bindingSupport!=='PROPOSED'||p.registryContainsId!==false||p.alternateIdExists!=='CAP-CLINICAL-RELATED'||p.alternateSemanticsVerified!==false)fail('R89_CAP_UNVERIFIED_MAPPING');
 const d=x.disposition;
 const options=['PROVE_AND_VERSION_NEW_CAPABILITY','PROVE_EQUIVALENCE_AND_REPLACE_WITH_TRACE','REMOVE_UNSUPPORTED_BINDING_WITH_SOURCE_JUSTIFICATION'];
 if(d?.selectedOption!==null||JSON.stringify(d.options)!==JSON.stringify(options)||d.policyRef!=='PENDING_VERIFICATION'||d.relatedTaskId!=='TASK-PLAN-126'||d.proposedWo!=='WO-PMO-001'||d.ownerDecisionSigned!==false||d.checkerDecisionSigned!==false||d.kernelAdmissionVerified!==false||d.workOrderAdmission!=='NOT_VERIFIED'||d.mutationsAuthorized!==false||d.releaseGate!=='HOLD_HUMAN'||x.sourceMutation!==false||x.approval!=='NOT_APPROVED')fail('R89_CAP_FALSE_AUTHORITY');
 return {find:x.id,missing:1,status:'OPEN_HOLD',releaseGate:'HOLD_HUMAN'};
}
if(process.argv[1] && resolve(process.argv[1])===resolve(new URL(import.meta.url).pathname)){
 const f=JSON.parse(readFileSync('registers/governance/r89-capability-reference-find.candidate.v1.json','utf8'));
 console.log('[R89 capability discrepancy] '+JSON.stringify(validateR89CapabilityFind(f)));
}
