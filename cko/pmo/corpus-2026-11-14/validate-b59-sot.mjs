// CKO B59/SOT: validates the *documented holds* and source metadata, NOT runtime security or licenses.
// Run: node cko/pmo/corpus-2026-11-14/validate-b59-sot.mjs
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const cwd=path.dirname(fileURLToPath(import.meta.url));
const get=p=>JSON.parse(fs.readFileSync(path.join(cwd,p),"utf8"));
const read=p=>fs.readFileSync(path.join(cwd,p),"utf8");
const errors=[],ok=(v,s)=>{if(!v)errors.push(s)};
const b59=get("b59/B59_SNAPSHOT_RECONCILIATION.json");
const tdm=get("SOT_EXTERNAL_AI_RIGHTS_PREFLIGHT_PROPOSED.json");
const report=get("PMO_REPORT.json");
const inputs=b59.pairs||[];
ok(inputs.length===5,"exactly 5 candidates");
const m03=new Map(),supa=new Map();
for(const p of inputs){
 ok(p.hash_match===false,"unexpected hash-approved alias "+p.m03);
 for(const d of p.m03_docs){
  ok(/^[0-9a-f]{64}$/.test(d.sha),"invalid SHA M03 "+d.id);
  m03.set(d.id,d.sha);
 }
 for(const s of p.supa_snapshots){
  ok(/^[0-9a-f]{64}$/.test(s.sha),"invalid SHA Supabase "+s.id);
  supa.set(s.id,s.sha);
 }
}
ok(m03.size===6,"6 distinct M03 documents");
ok(supa.size===7,"7 distinct Supabase snapshots");
const m03sha=new Set(m03.values());
ok([...supa.values()].every(hash=>!m03sha.has(hash)),"unexpected exact SHA identity");
ok(b59.summary.hash_equal_document_to_snapshot_pairs===0&&b59.summary.eligible_for_auto_alias===0,"no auto alias");
ok([...supa.entries()].some(([id])=>id==="SNAP-MON-22735D509E75D6E3C8E84D54"),"rejected nonnormative snapshot provenance");
ok(inputs.find(p=>p.m03==="SRC-BR-EXERCICIO-ENF"&&p.supa==="SRC-BR-PLANALTO-LEI-7498-1986")?.candidate==="PARTIAL_SCOPE_NOT_EQUIVALENT","law/decree must not merge");
ok(tdm.state==="PROPOSAL_NOT_DEPLOYED"&&!tdm.deployment,"no hidden deployment");
ok(tdm.default_state==="DENY"&&tdm.outbound_before_preflight===false,"fail-closed outbound");
ok(tdm.required_preflight.includes("approved_item_rights_for_external_ai_tdm"),"rights document gate");
ok(tdm.required_preflight.includes("data_privacy_approved"),"privacy gate");
ok(tdm.tests.length>=6,"negative rights cases");
ok(tdm.tests.filter(x=>x.expect==="DENY").length>=5,"insufficient deny test coverage");
ok(report.b59_snapshot_reconciliation?.eligible_for_auto_alias===0,"report premature aliases");
ok(report.sot_function_static_review?.explicit_external_tdm_rights_guard_in_atomizer==="NOT_OBSERVED","incorrect current rights gate assurance");
ok(report.sot_function_static_review?.operational_approval==="HOLD","SOT must remain in HOLD");
ok(read("RISKS.csv").includes("R18,HIGH"),"risk R18 missing");
ok(read("DECISION_LOG.csv").includes("D016")&&read("DECISION_LOG.csv").includes("D017"),"governance decisions missing");
const result={gate:"CKO_B59_SOT_STATIC_DOCUMENT_GATE",result:errors.length?"FAIL":"PASS",meaning:"Documentation metadata and explicit holds only; NOT a live security test, copyright clearance or admission",m03_documents:m03.size,supabase_snapshots:supa.size,exact_bytes_matches:0,alias_admitted:0,rights_guard_deployed:false,errors};
console.log(JSON.stringify(result,null,2));if(errors.length)process.exitCode=1;
