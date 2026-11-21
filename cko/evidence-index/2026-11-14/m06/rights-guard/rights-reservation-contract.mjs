// Candidate-only contract: pre-dispatch checks and an injected atomic reservation adapter.
// NOT deployed. Does not itself provide database transactional guarantees.
import {evaluateExternalAIPreflight} from "./external-ai-rights-guard.mjs";
const result=(status,reason)=>Object.freeze({status,reason});
const hex=x=>typeof x==="string"&&/^[a-f0-9]{64}$/i.test(x);
const norm=x=>typeof x==="string"?x.toLowerCase():"";
export async function sha256Text(text){
  if(typeof text!=="string")throw new Error("INVALID_TEXT");
  const bytes=new TextEncoder().encode(text);
  const digest=await crypto.subtle.digest("SHA-256",bytes);
  return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("");
}
const functions=["load","reserve","confirm","dispatch","release"];
export async function dispatchUnderReservation(request,deps){
  if(!request||typeof request.fragment_id!=="string"||!deps||
     functions.some(f=>typeof deps[f]!=="function"))return result("DENY","INVALID_ADAPTER");
  let lease=null;
  try{
    const before=await deps.load(request.fragment_id);
    if(!before||!before.fragment||typeof before.fragment.text_content!=="string")
      return result("DENY","MISSING_INITIAL_CONTEXT");
    const textHash=await sha256Text(before.fragment.text_content);
    if(norm(textHash)!==norm(before.fragment.text_sha256_hex)||!hex(before.fragment.origin_sha256_hex))
      return result("DENY","INITIAL_HASH_MISMATCH");
    const initial=evaluateExternalAIPreflight(before);
    if(!initial.allow)return result("DENY",initial.code);
    if(!Number.isSafeInteger(before.permission?.revision)||before.permission.revision<1)
      return result("DENY","INVALID_PERMISSION_REVISION");
    // Must be a single atomic DB operation in deployment; the fake adapter only tests the contract.
    lease=await deps.reserve({
      fragment_id:before.fragment.id,
      permission_id:before.permission.id,
      revision:before.permission.revision,
      origin_sha256_hex:before.fragment.origin_sha256_hex,
      text_sha256_hex:textHash,
      operation:"EXTERNAL_AI_TDM",provider:"deepseek"
    });
    if(!lease||lease.status!=="RESERVED"||typeof lease.token!=="string"||!lease.token)
      return result("DENY","RESERVATION_DENIED");
    const fresh=await deps.confirm(lease.token);
    if(!fresh||fresh.lease_status!=="RESERVED"||fresh.token!==lease.token||
       !fresh.context||typeof fresh.context.fragment?.text_content!=="string")
      return result("DENY","LEASE_NOT_CONFIRMED");
    const after=fresh.context,afterHash=await sha256Text(after.fragment.text_content);
    if(after.fragment.id!==before.fragment.id||after.permission?.id!==before.permission.id||
       after.permission.revision!==before.permission.revision||
       norm(after.fragment.origin_sha256_hex)!==norm(before.fragment.origin_sha256_hex)||
       norm(afterHash)!==norm(textHash)||norm(after.fragment.text_sha256_hex)!==norm(afterHash))
      return result("DENY","CONTEXT_CHANGED");
    const second=evaluateExternalAIPreflight(after);
    if(!second.allow)return result("DENY",second.code);
    // This is the FINAL reversible check; revocation after dispatch begins cannot retract bytes.
    await deps.dispatch({
      fragment_id:after.fragment.id,
      permission_id:after.permission.id,
      lease_token:lease.token,
      text:after.fragment.text_content
    });
    return result("DISPATCHED_CANDIDATE","MOCK_OUTBOUND_COMPLETE");
  }catch{
    // Never print grant details, raw text, credentials or provider responses.
    return result("DENY","PREFLIGHT_OR_DISPATCH_ERROR");
  }finally{
    if(lease&&lease.status==="RESERVED"&&typeof lease.token==="string"){
      try{await deps.release(lease.token);}catch{ /* incident event outside this contract */ }
    }
  }
}
