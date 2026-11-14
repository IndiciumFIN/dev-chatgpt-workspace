import test from "node:test";
import assert from "node:assert/strict";
import {dispatchUnderReservation,sha256Text} from "./rights-reservation-contract.mjs";
const H="a".repeat(64),F="frag-1",D="doc-1",S="source-1";
async function ctx(){
 const raw="synthetic unit test content only";
 const h=await sha256Text(raw);
 return {now_iso:"2026-11-14T12:00:00Z",provider:"deepseek",operation:"EXTERNAL_AI_TDM",
  actor:{id:"actor",role:"operator"},
  source:{id:S,active:true,acquisition_policy:"ALLOW",redistribution_policy:"UNKNOWN"},
  document:{id:D,source_id:S,original_certification_status:"VERIFIED"},
  fragment:{id:F,document_id:D,origin_sha256_hex:H,text_sha256_hex:h,text_content:raw},
  permission:{id:"grant-1",revision:1,source_id:S,document_id:D,fragment_id:F,
   origin_sha256_hex:H,text_sha256_hex:h,operation:"EXTERNAL_AI_TDM",provider:"deepseek",
   purpose:"clinical_education_atomization",rights_status:"APPROVED",privacy_status:"APPROVED",
   pii_review_status:"CLEARED",admission_status:"ADMITTED",is_revoked:false,
   rights_evidence_ref:"synthetic-only",privacy_evidence_ref:"synthetic-only",
   approved_by:"independent-reviewer",approved_at:"2026-11-13T12:00:00Z",
   valid_from:"2026-11-13T12:00:00Z",expires_at:"2026-12-01T12:00:00Z"}
 };
}
const clone=x=>structuredClone(x);
async function fixture(overrides={}){
 const state={ctx:await ctx(),reserved:false,sends:[],released:0,
   ...overrides};
 const deps={
  load:async()=>clone(state.ctx),
  reserve:async req=>{
    if(state.reserved||state.ctx.permission.is_revoked||
       req.revision!==state.ctx.permission.revision)return {status:"DENIED"};
    state.reserved=true;return {status:"RESERVED",token:"synthetic-lease"};
  },
  confirm:async token=>({lease_status:state.reserved?"RESERVED":"DENIED",token,context:clone(state.ctx)}),
  dispatch:async payload=>{state.sends.push(payload)},
  release:async()=>{state.reserved=false;state.released++;}
 };
 return {state,deps};
}
test("synthetic approved context may reach mock dispatch",async()=>{
 const {state,deps}=await fixture();
 const v=await dispatchUnderReservation({fragment_id:F},deps);
 assert.equal(v.status,"DISPATCHED_CANDIDATE");assert.equal(state.sends.length,1);
 assert.equal(state.released,1);
});
test("missing adapter always denies",async()=>assert.equal((await dispatchUnderReservation({},{})).status,"DENY"));
test("source rights revoked before fetch: zero sends",async()=>{
 const {state,deps}=await fixture();state.ctx.permission.is_revoked=true;
 assert.equal((await dispatchUnderReservation({fragment_id:F},deps)).status,"DENY");
 assert.equal(state.sends.length,0);
});
test("revocation BETWEEN read and reservation denies",async()=>{
 const {state,deps}=await fixture();const load=deps.load;
 deps.load=async id=>{const before=await load(id);state.ctx.permission.is_revoked=true;return before};
 const v=await dispatchUnderReservation({fragment_id:F},deps);
 assert.equal(v.reason,"RESERVATION_DENIED");assert.equal(state.sends.length,0);
});
test("revocation BETWEEN reservation and confirmation denies",async()=>{
 const {state,deps}=await fixture();const reserve=deps.reserve;
 deps.reserve=async a=>{const lease=await reserve(a);state.ctx.permission.is_revoked=true;return lease;};
 const v=await dispatchUnderReservation({fragment_id:F},deps);
 assert.equal(v.reason,"RIGHTS_NOT_ADMITTED");assert.equal(state.sends.length,0);
 assert.equal(state.released,1);
});
test("revision changes between reservation and confirmation deny",async()=>{
 const {state,deps}=await fixture();const reserve=deps.reserve;
 deps.reserve=async a=>{const lease=await reserve(a);state.ctx.permission.revision++;return lease;};
 const v=await dispatchUnderReservation({fragment_id:F},deps);
 assert.equal(v.reason,"CONTEXT_CHANGED");assert.equal(state.sends.length,0);
});
test("fragment content changes after reservation deny",async()=>{
 const {state,deps}=await fixture();const reserve=deps.reserve;
 deps.reserve=async a=>{const lease=await reserve(a);state.ctx.fragment.text_content+=" tampered";return lease;};
 const v=await dispatchUnderReservation({fragment_id:F},deps);
 assert.equal(v.reason,"CONTEXT_CHANGED");assert.equal(state.sends.length,0);
});
test("permission expiry between reservation and confirmation deny",async()=>{
 const {state,deps}=await fixture();const reserve=deps.reserve;
 deps.reserve=async a=>{const lease=await reserve(a);state.ctx.now_iso="2026-12-02T00:00:00Z";return lease;};
 const v=await dispatchUnderReservation({fragment_id:F},deps);
 assert.equal(v.reason,"RIGHTS_OUTSIDE_VALIDITY");assert.equal(state.sends.length,0);
});
test("DB failure denies without dispatch",async()=>{
 const {state,deps}=await fixture();deps.confirm=async()=>{throw new Error("db unavailable")};
 const v=await dispatchUnderReservation({fragment_id:F},deps);
 assert.equal(v.reason,"PREFLIGHT_OR_DISPATCH_ERROR");assert.equal(state.sends.length,0);
 assert.equal(state.released,1);
});
test("stale lease token never dispatches",async()=>{
 const {state,deps}=await fixture();deps.confirm=async()=>({lease_status:"RESERVED",token:"wrong",context:await ctx()});
 const v=await dispatchUnderReservation({fragment_id:F},deps);
 assert.equal(v.reason,"LEASE_NOT_CONFIRMED");assert.equal(state.sends.length,0);
});
test("two simultaneous calls: at most one mock dispatch until lease released",async()=>{
 const {state,deps}=await fixture();
 let unlock;const barrier=new Promise(resolve=>{unlock=resolve});
 let notify;const sent=new Promise(resolve=>{notify=resolve});
 deps.dispatch=async payload=>{state.sends.push(payload);notify();await barrier;};
 const a=dispatchUnderReservation({fragment_id:F},deps);
 await sent;
 const b=await dispatchUnderReservation({fragment_id:F},deps);
 assert.equal(b.reason,"RESERVATION_DENIED");assert.equal(state.sends.length,1);
 unlock();assert.equal((await a).status,"DISPATCHED_CANDIDATE");
});
test("negative permission state never dispatches",async()=>{
 const {state,deps}=await fixture();state.ctx.permission.privacy_status="HOLD";
 const v=await dispatchUnderReservation({fragment_id:F},deps);
 assert.equal(v.status,"DENY");assert.equal(state.sends.length,0);
});
test("request must NOT assume global exactly-once delivery across retries",async()=>{
 const {state,deps}=await fixture();
 await dispatchUnderReservation({fragment_id:F},deps);
 await dispatchUnderReservation({fragment_id:F},deps);
 assert.equal(state.sends.length,2); // demonstrates need for durable claim + idempotency
});
