#!/usr/bin/env node
/**
 * W2.6-G2/S1: six code-level historical security dispositions.
 * No network, authentication to external issuers, credential retrieval or database writes.
 */
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";
const root=new URL("../",import.meta.url);
const file=p=>readFileSync(new URL(p,root),"utf8");
const json=p=>JSON.parse(file(p));
const blob=s=>{const b=Buffer.from(s,"utf8");return createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex");};
const isSHA=v=>typeof v==="string"&&/^[0-9a-f]{40}$/.test(v);
function must(ok,why){if(!ok)throw Error("CE_GROOK_SECURITY_S1_HOLD:"+why);}
const originalPath="registers/governance/ce-w26-grook-full-delta-20261121.v1.json";
const previousPath="registers/governance/ce-w26-grook-p1-test-disposition-20261121.v1.json";
const currentPath="registers/governance/ce-w26-grook-p0-security-s1-20261121.v1.json";
const expected=[
"scripts/check-auth-invariant.mjs",
"scripts/check-auth-invariant.test.mjs",
"scripts/with-app-env.mjs",
"src/lib/auth/server.ts",
"src/lib/auth/verify.server.ts",
"src/lib/db.ts"
].sort();
export function validateSecurityS1(d,m,prior,readFile=file){
 must(d?.protocol==="CE.W2.6.G2.P0_SECURITY.S1.v1"&&d.issue===111&&d.parent_issue===106&&d.prior_issue===109,"identity");
 must(d.phase==="DEVELOPMENT"&&d.source?.commit===m.source.commit&&d.source.tree===m.source.tree&&d.source.branch===m.source.branch,"source pinned");
 must(isSHA(d.baseline?.commit)&&isSHA(d.baseline?.tree),"baseline pinned");
 must(d.previous_ledger===previousPath&&d.origin_manifest===originalPath,"manifest provenance");
 must(m?.counts?.divergent===48&&m.tree_truncated===false&&prior?.counts?.all_disposed_dev===3,"source completeness");
 const c=d.counts;
 must(c.historical_divergences===48&&c.previously_disposed===3&&c.new_security_disposed===6&&c.total_dev_disposed===9&&c.remaining===39&&c.security_remaining===7&&c.clinical_remaining===6&&c.runtime_remaining===16&&c.ui_remaining===10&&c.branches_sealed===0,"counts or false SEALED");
 must(Array.isArray(d.new_decisions)&&d.new_decisions.length===6&&Array.isArray(d.prior_decisions)&&d.prior_decisions.length===3&&Array.isArray(d.pending_paths)&&d.pending_paths.length===39,"48 rows");
 must(JSON.stringify(d.new_decisions.map(x=>x.path).sort())===JSON.stringify(expected),"wrong security objects");
 const immutable=new Map(m.divergences.map(x=>[x.path,x]));
 must(immutable.size===48,"original duplicate");
 const all=[...d.new_decisions,...d.prior_decisions,...d.pending_paths];
 must(new Set(all.map(x=>x.path)).size===48&&all.every(x=>immutable.has(x.path)),"duplicate/missing provenance");
 const seenPrior=new Map(prior.dispositions.map(x=>[x.path,x]));
 for(const item of d.prior_decisions){
  const p=seenPrior.get(item.path);
  must(p&&item.prior_issue===109&&item.decision===p.decision&&item.source_git_blob_sha===p.source_git_blob_sha&&item.canonical_git_blob_sha===p.canonical_git_blob_sha,"prior proof changed");
 }
 for(const item of d.new_decisions){
  const old=immutable.get(item.path);
  must(old.risk_preliminary==="P0_SECURITY"&&item.risk==="P0_SECURITY"&&item.decision==="SUPERSEDED_WITH_PROOF","security class");
  must(old.source_git_blob_sha===item.source_git_blob_sha&&old.main_git_blob_sha===item.canonical_git_blob_sha,"source/canonical blob mapping");
  must(item.evidence_state==="SEMANTICALLY_DISPOSED_IN_DEV_CODE_ONLY"&&item.rights==="FIRST_PARTY_HISTORY_ONLY_NO_EXTERNAL_MATERIAL","false security proof");
  must(typeof item.reason==="string"&&item.reason.length>100&&Array.isArray(item.dependencies)&&item.dependencies.length>=2&&
       Array.isArray(item.tests)&&item.tests.length>=1&&item.residual.length>50&&item.rollback.includes("PR"),"missing semantic rationale");
  const code=readFile(item.path);
  must(blob(code)===item.canonical_git_blob_sha,"canonical source drift "+item.path);
  must(code.includes(item.new_marker),"new condition missing "+item.path);
  if(!item.historical_absent)must(!code.includes(item.old_marker),"historical behavior resurrected "+item.path);
 }
 for(const item of d.pending_paths){
  const row=immutable.get(item.path);
  must(item.decision==="PENDING_SEMANTIC"&&item.risk===row.risk_preliminary&&
       item.source_git_blob_sha===row.source_git_blob_sha&&item.baseline_git_blob_sha===row.main_git_blob_sha,"pending falsely disposed");
 }
 const evid=d.decision_evidence;
 must(evid.baseline_main_verify.sha===d.baseline.commit&&evid.baseline_main_verify.conclusion==="success"&&
      evid.all_source_blobs_read_by_ref===true&&evid.all_current_blobs_read_by_ref===true&&
      evid.actual_issuer_credentials_checked===false&&evid.secret_history_scanned===false&&
      evid.production_auth_e2e_tested===false&&evid.supabase_runtime_db_identified===false&&
      evid.rights_of_external_sources_cleared===false,"false operational security evidence");
 const f=d.closure;
 must(f.parent_issue_open===true&&f.historical_branch_dev_reconciled===false&&f.historical_branch_sealed===false&&
      f.owner_approval==="NOT_REQUESTED_DEFERRED"&&f.remote_db_writes===false&&f.production_deployment===false&&
      f.branch_deletion===false&&f.secret_rotation_proven===false,"false release/branch closure");
 return{validated:true,security_disposed:6,all_disposed:9,unresolved:39,branches_sealed:0};
}
export function verify(){return validateSecurityS1(json(currentPath),json(originalPath),json(previousPath));}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)
 try{console.log(JSON.stringify(verify()));}catch(err){console.error(String(err?.message??err));process.exitCode=2;}
