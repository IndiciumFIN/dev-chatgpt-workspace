import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {fileURLToPath} from "node:url";
import path from "node:path";
import {evaluateExternalAIPreflight as check} from "./external-ai-rights-guard.mjs";
const base=path.dirname(fileURLToPath(import.meta.url));
const h="a".repeat(64), t="b".repeat(64);
const approved=()=>({
 now_iso:"2026-11-14T12:00:00Z",provider:"deepseek",operation:"EXTERNAL_AI_TDM",
 actor:{id:"actor-001",role:"operator"},
 source:{id:"SRC-1",active:true,acquisition_policy:"ALLOW",redistribution_policy:"UNKNOWN"},
 document:{id:"DOC-1",source_id:"SRC-1",original_certification_status:"VERIFIED"},
 fragment:{id:"FRAG-1",document_id:"DOC-1",origin_sha256_hex:h,text_sha256_hex:t},
 permission:{id:"G-1",source_id:"SRC-1",document_id:"DOC-1",fragment_id:"FRAG-1",
  origin_sha256_hex:h,text_sha256_hex:t,operation:"EXTERNAL_AI_TDM",provider:"deepseek",
  purpose:"clinical_education_atomization",rights_status:"APPROVED",privacy_status:"APPROVED",pii_review_status:"CLEARED",
  admission_status:"ADMITTED",is_revoked:false,rights_evidence_ref:"DOC-1-rights",privacy_evidence_ref:"DOC-1-privacy",
  approved_by:"reviewer-002",approved_at:"2026-11-13T12:00:00Z",valid_from:"2026-11-13T12:00:00Z",expires_at:"2026-12-01T12:00:00Z"}
});
const change=(path,value)=>{const c=approved();let node=c;for(const p of path.slice(0,-1))node=node[p];node[path.at(-1)]=value;return c};
test("approved exact fragment is eligible in hypothetical authorized sandbox",()=>assert.equal(check(approved()).allow,true));
const denies=[
 ["missing grant",()=>change(["permission"],null),"NO_ITEM_RIGHTS_RECORD"],
 ["not admitted",()=>change(["permission","admission_status"],"NOT_ADMITTED"),"RIGHTS_NOT_ADMITTED"],
 ["rights hold",()=>change(["permission","rights_status"],"HOLD"),"RIGHTS_NOT_ADMITTED"],
 ["expired",()=>change(["permission","expires_at"],"2026-11-13T13:00:00Z"),"RIGHTS_OUTSIDE_VALIDITY"],
 ["future",()=>change(["permission","valid_from"],"2026-11-15T12:00:00Z"),"RIGHTS_OUTSIDE_VALIDITY"],
 ["revoked",()=>change(["permission","is_revoked"],true),"RIGHTS_NOT_ADMITTED"],
 ["wrong fragment",()=>change(["permission","fragment_id"],"FRAG-2"),"RIGHTS_SCOPE_MISMATCH"],
 ["wrong document",()=>change(["permission","document_id"],"DOC-2"),"RIGHTS_SCOPE_MISMATCH"],
 ["wrong source",()=>change(["permission","source_id"],"SRC-2"),"RIGHTS_SCOPE_MISMATCH"],
 ["tampered text",()=>change(["permission","text_sha256_hex"],"f".repeat(64)),"RIGHTS_HASH_MISMATCH"],
 ["missing rights origin hash",()=>change(["permission","origin_sha256_hex"],null),"RIGHTS_HASH_MISMATCH"],
 ["malformed rights text hash",()=>change(["permission","text_sha256_hex"],"not-a-sha"),"RIGHTS_HASH_MISMATCH"],
 ["tampered origin",()=>change(["permission","origin_sha256_hex"],"c".repeat(64)),"RIGHTS_HASH_MISMATCH"],
 ["wrong provider",()=>change(["permission","provider"],"other"),"RIGHTS_OPERATION_MISMATCH"],
 ["wrong operation",()=>change(["permission","operation"],"LOCAL_RETRIEVAL"),"RIGHTS_OPERATION_MISMATCH"],
 ["privacy hold",()=>change(["permission","privacy_status"],"HOLD"),"PRIVACY_NOT_CLEARED"],
 ["PII unreviewed",()=>change(["permission","pii_review_status"],"PENDING"),"PRIVACY_NOT_CLEARED"],
 ["no evidence",()=>change(["permission","rights_evidence_ref"],""),"APPROVAL_EVIDENCE_MISSING"],
 ["self approval",()=>change(["permission","approved_by"],"actor-001"),"APPROVAL_EVIDENCE_MISSING"],
 ["bad actor",()=>change(["actor","role"],"viewer"),"ACTOR_NOT_AUTHORIZED"],
 ["source disabled",()=>change(["source","active"],false),"SOURCE_NOT_ACTIVE"],
 ["source prohibition",()=>change(["source","acquisition_policy"],"NO_EXTERNAL_AI"),"SOURCE_EXPLICITLY_PROHIBITED"],
 ["certification absent",()=>change(["document","original_certification_status"],"NOT_VERIFIED"),"DOCUMENT_CERTIFICATION_NOT_VERIFIED"],
 ["incorrect doc source FK",()=>change(["document","source_id"],"SRC-X"),"DOCUMENT_SOURCE_MISMATCH"],
 ["incorrect fragment doc FK",()=>change(["fragment","document_id"],"DOC-X"),"FRAGMENT_PROVENANCE_INVALID"],
 ["unsupported provider",()=>change(["provider"],"other"),"OPERATION_OR_PROVIDER_UNSUPPORTED"],
 ["no time context",()=>change(["now_iso"],"not-a-time"),"RIGHTS_TIME_INVALID"]
];
for(const [name,make,code] of denies)test("DENY: "+name,()=>{const x=check(make());assert.deepEqual(x,{allow:false,code})});
test("no outbound on denial (mock)",async()=>{
 let outbound=0;
 const send=async c=>{if(check(c).allow){outbound++;return {ok:true}}return {ok:false}};
 await send(change(["permission","rights_status"],"HOLD"));
 await send(change(["permission","privacy_status"],"HOLD"));
 await send(change(["permission","origin_sha256_hex"],"c".repeat(64)));
 assert.equal(outbound,0);
});
test("candidate function checks rights before outbound and is not deployed",()=>{
 const code=fs.readFileSync(path.join(base,"deepseek-atomize.v6.candidate.ts"),"utf8");
 const gate=code.indexOf("const gateDecision=evaluateExternalAIPreflight");
 const outbound=code.indexOf('fetch("https://api.deepseek.com/chat/completions"');
 assert.ok(gate>0&&outbound>gate);
 assert.ok(code.includes('if(!gateDecision.allow)return json({error:"HOLD_EXTERNAL_AI_TDM_RIGHTS"'));
 assert.ok(code.includes('if(pe)return json({error:"HOLD_RIGHTS_REGISTRY_UNAVAILABLE"'));
 const sql=fs.readFileSync(path.join(base,"SCHEMA_PROPOSAL_DO_NOT_APPLY.sql"),"utf8");
 assert.ok(sql.includes("revoke all on public.corpus_external_ai_permissions from anon, authenticated, public"));
 assert.ok(!code.includes("service_role=sk"));
});
