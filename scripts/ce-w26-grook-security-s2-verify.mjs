#!/usr/bin/env node
/** CE W2.6-G2/S2: immutable-source semantic safety guard. No network or writes. */
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";
const root=new URL("../",import.meta.url);
const files={
 original:"registers/governance/ce-w26-grook-full-delta-20261121.v1.json",
 p1:"registers/governance/ce-w26-grook-p1-test-disposition-20261121.v1.json",
 s1:"registers/governance/ce-w26-grook-p0-security-s1-20261121.v1.json",
 s2:"registers/governance/ce-w26-grook-security-s2-20261121.v1.json"
};
const get=p=>readFileSync(new URL(p,root),"utf8");
const parsed=p=>JSON.parse(get(p));
const isSha=s=>typeof s==="string"&&/^[0-9a-f]{40}$/.test(s);
const hash=s=>{const b=Buffer.from(s,"utf8");return createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex");};
function hold(ok,msg){if(!ok)throw Error("CE_GROOK_SECURITY_S2_HOLD:"+msg);}
const expected=[
"src/lib/auth/client.ts",
"src/lib/auth/gate-identity.test.ts",
"src/lib/auth/popup.server.ts",
"src/lib/auth/providers.ts",
"src/lib/source.functions.ts",
"src/routes/login.tsx"
].sort();
export function validateSecurityS2(d,m,p1,s1,readCode=get){
 hold(d?.protocol==="CE.W2.6.G2.P0_SECURITY.S2.v1"&&d.task_issue===113&&d.parent_issue===106&&d.phase==="DEVELOPMENT","protocol/scope");
 hold(m?.counts?.divergent===48&&m?.tree_truncated===false&&p1?.dispositions?.length===3&&s1?.new_decisions?.length===6,"immutable baseline");
 hold(d.source?.branch===m.source.branch&&d.source.commit===m.source.commit&&d.source.tree===m.source.tree,"pinned source");
 hold(isSha(d.baseline?.commit)&&isSha(d.baseline?.tree)&&d.baseline.branch==="main","pinned main");
 hold(d.origin_manifest===files.original&&JSON.stringify(d.previous_ledgers)===JSON.stringify([files.p1,files.s1]),"previous ledger references");
 hold(d.lock_dependency?.package==="better-auth"&&d.lock_dependency.pinned_version==="1.7.15"&&d.lock_dependency.runtime_oauth_e2e_verified===false,"Better Auth version/E2E");
 const packageJson=JSON.parse(readCode("package.json"));
 hold(packageJson.dependencies?.["better-auth"]==="1.7.15","dependency drift");
 const c=d.counts;
 hold(c.total_historical===48&&c.prior_dispositions===9&&c.new_code_dispositions===6&&c.total_disposed_dev===15&&
      c.hold_issuer===1&&c.other_pending===32&&c.total_unresolved===33&&c.security_unresolved===1&&
      c.clinical_unresolved===6&&c.runtime_unresolved===16&&c.ui_unresolved===10&&c.branches_sealed===0,"counts/SEALED");
 hold(Array.isArray(d.new_decisions)&&d.new_decisions.length===6&&Array.isArray(d.prior_dispositions)&&d.prior_dispositions.length===9&&
      d.hold_issuer&&Array.isArray(d.pending_paths)&&d.pending_paths.length===32,"48 objects");
 hold(JSON.stringify(d.new_decisions.map(x=>x.path).sort())===JSON.stringify(expected),"six specified paths");
 const all=[...d.new_decisions,...d.prior_dispositions,d.hold_issuer,...d.pending_paths];
 const origin=new Map(m.divergences.map(x=>[x.path,x]));
 hold(origin.size===48&&all.length===48&&new Set(all.map(x=>x.path)).size===48&&all.every(x=>origin.has(x.path)),"complete 48/48 without duplicates");
 const prior=[...p1.dispositions.map(x=>({...x,issue:109})),...s1.new_decisions.map(x=>({...x,issue:111}))];
 for(const item of d.prior_dispositions){
  const p=prior.find(x=>x.path===item.path);
  hold(p&&item.issue===p.issue&&item.decision===p.decision&&item.source_git_blob_sha===p.source_git_blob_sha&&
       item.canonical_git_blob_sha===p.canonical_git_blob_sha,"previous disposition modified");
 }
 for(const item of d.new_decisions){
  const row=origin.get(item.path);
  hold(row.risk_preliminary==="P0_SECURITY"&&item.risk==="P0_SECURITY"&&item.decision==="SUPERSEDED_WITH_PROOF","security decision");
  hold(item.source_git_blob_sha===row.source_git_blob_sha&&item.canonical_git_blob_sha===row.main_git_blob_sha,"blob chain");
  hold(item.evidence_status==="SEMANTICALLY_DISPOSED_DEV_CODE_ONLY"&&item.rights_state==="FIRST_PARTY_GIT_PROVENANCE_ONLY","unverified external proof");
  hold(typeof item.reason==="string"&&item.reason.length>120&&typeof item.residual==="string"&&item.residual.length>60&&
       Array.isArray(item.dependencies)&&item.dependencies.length>=2&&Array.isArray(item.tests)&&item.tests.length>=1&&
       item.rollback.includes("PR"),"evidence rationale");
  const source=readCode(item.path);
  hold(hash(source)===item.canonical_git_blob_sha,"canonical file changed: "+item.path);
  hold(source.includes(item.new_marker)&&!source.includes(item.old_marker),"old behavior restored: "+item.path);
 }
 const key=d.hold_issuer,old=origin.get(key.path);
 hold(key.path==="src/lib/auth/preview.ts"&&key.risk==="P0_SECURITY"&&
      key.decision==="HOLD_ISSUER_ROTATION_AND_HISTORY_SCAN"&&
      key.source_git_blob_sha===old.source_git_blob_sha&&key.canonical_git_blob_sha===old.main_git_blob_sha,"issuer hold identity");
 hold(key.security_incident_open===true&&key.operational_evidence==="NO_ISSUER_REVOCATION_RECEIPT"&&
      JSON.stringify(key.related_issues)==="[91,92]"&&key.release_allowed===false&&key.revisit_conditions.length===3,"false issuer clearance");
 const currentPreview=readCode(key.path);
 hold(hash(currentPreview)===key.canonical_git_blob_sha&&
      currentPreview.includes("process.env.GROK_PREVIEW_CLIENT_SECRET")&&
      !/PREVIEW_CLIENT_SECRET\s*=\s*["'][A-Za-z0-9_-]{16,}["']/.test(currentPreview),"credential literal reintroduced");
 for(const item of d.pending_paths){
  const row=origin.get(item.path);
  hold(item.decision==="PENDING_SEMANTIC"&&row.risk_preliminary===item.risk&&
       row.source_git_blob_sha===item.source_git_blob_sha&&row.main_git_blob_sha===item.baseline_git_blob_sha,"pending object incorrectly closed");
 }
 const e=d.evidence_gates;
 hold(e.baseline_verify?.head_sha===d.baseline.commit&&e.baseline_verify?.conclusion==="success"&&
      e.read_seven_old_and_new_blob_shas===true&&e.external_issuer_revocation_verified===false&&
      e.history_secret_scan_completed===false&&e.full_live_oauth_e2e_verified===false&&
      e.production_rbac_verified===false&&e.operational_db_identified===false&&e.supabase_write===false&&
      e.rights_of_external_content_verified===false&&e.clinical_release_approved===false,"false external/security proof");
 const b=d.branch_closure;
 hold(b.grook_dev_reconciled===false&&b.grook_sealed===false&&b.owner_approval==="NOT_REQUESTED_DEFERRED"&&
      b.branch_deletion===false&&b.release_authorized===false,"false branch closure");
 return {status:"PASS_DEV_CODE_ONLY",total:48,disposed:15,pending:33,issuer_hold:1,branches_sealed:0};
}
export function verify(){
 return validateSecurityS2(parsed(files.s2),parsed(files.original),parsed(files.p1),parsed(files.s1));
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 try{console.log(JSON.stringify(verify()));}catch(e){console.error(String(e?.message??e));process.exitCode=2;}
}
