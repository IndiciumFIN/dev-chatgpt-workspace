// Pure, deterministic decision function. This is a CANDIDATE, not deployed.
const sha = x => typeof x === "string" && /^[a-f0-9]{64}$/i.test(x);
const iso = x => typeof x === "string" && Number.isFinite(Date.parse(x));
const present = x => typeof x === "string" && x.trim().length > 0;
const deny = code => Object.freeze({allow:false,code});
export function evaluateExternalAIPreflight(ctx) {
  if(!ctx||typeof ctx!=="object")return deny("MISSING_CONTEXT");
  const {actor,source,document,fragment,permission,provider,operation,now_iso}=ctx;
  if(!actor||!present(actor.id)||!["admin","operator","reviewer"].includes(actor.role))return deny("ACTOR_NOT_AUTHORIZED");
  if(operation!=="EXTERNAL_AI_TDM"||provider!=="deepseek")return deny("OPERATION_OR_PROVIDER_UNSUPPORTED");
  if(!source||!present(source.id)||source.active!==true)return deny("SOURCE_NOT_ACTIVE");
  if(["PROHIBITED","NO_EXTERNAL_AI","RESTRICTED_EXTERNAL_TDM"].includes(source.acquisition_policy)||
     ["PROHIBITED","NO_EXTERNAL_AI","RESTRICTED_EXTERNAL_TDM"].includes(source.redistribution_policy))return deny("SOURCE_EXPLICITLY_PROHIBITED");
  if(!document||!present(document.id)||document.source_id!==source.id)return deny("DOCUMENT_SOURCE_MISMATCH");
  if(document.original_certification_status!=="VERIFIED")return deny("DOCUMENT_CERTIFICATION_NOT_VERIFIED");
  if(!fragment||!present(fragment.id)||fragment.document_id!==document.id||
     !sha(fragment.origin_sha256_hex)||!sha(fragment.text_sha256_hex))return deny("FRAGMENT_PROVENANCE_INVALID");
  if(!permission||!present(permission.id))return deny("NO_ITEM_RIGHTS_RECORD");
  if(permission.source_id!==source.id||permission.document_id!==document.id||
     permission.fragment_id!==fragment.id)return deny("RIGHTS_SCOPE_MISMATCH");
  if(permission.origin_sha256_hex.toLowerCase()!==fragment.origin_sha256_hex.toLowerCase()||
     permission.text_sha256_hex.toLowerCase()!==fragment.text_sha256_hex.toLowerCase())return deny("RIGHTS_HASH_MISMATCH");
  if(permission.operation!==operation||permission.provider!==provider||
     permission.purpose!=="clinical_education_atomization")return deny("RIGHTS_OPERATION_MISMATCH");
  if(permission.is_revoked!==false||permission.rights_status!=="APPROVED"||
     permission.admission_status!=="ADMITTED")return deny("RIGHTS_NOT_ADMITTED");
  if(permission.privacy_status!=="APPROVED"||permission.pii_review_status!=="CLEARED")return deny("PRIVACY_NOT_CLEARED");
  if(!present(permission.rights_evidence_ref)||!present(permission.privacy_evidence_ref)||
     !present(permission.approved_by)||permission.approved_by===actor.id)return deny("APPROVAL_EVIDENCE_MISSING");
  if(!iso(now_iso)||!iso(permission.approved_at)||!iso(permission.valid_from)||!iso(permission.expires_at))return deny("RIGHTS_TIME_INVALID");
  const now=Date.parse(now_iso),start=Date.parse(permission.valid_from),end=Date.parse(permission.expires_at),approved=Date.parse(permission.approved_at);
  if(!(start<=now&&now<end&&approved<=now&&start<end))return deny("RIGHTS_OUTSIDE_VALIDITY");
  return Object.freeze({allow:true,code:"EXTERNAL_AI_TDM_ALLOWED_FOR_EXACT_FRAGMENT"});
}
