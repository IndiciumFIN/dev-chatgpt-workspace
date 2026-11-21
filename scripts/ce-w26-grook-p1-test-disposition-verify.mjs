#!/usr/bin/env node
/** W2.6-G2/T read-only semantic disposition guard. NEVER seals, merges or writes DB. */
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {pathToFileURL} from "node:url";
import {resolve} from "node:path";
const root=new URL("../",import.meta.url);
const ledgerPath="registers/governance/ce-w26-grook-p1-test-disposition-20261121.v1.json";
const basePath="registers/governance/ce-w26-grook-full-delta-20261121.v1.json";
const text=p=>readFileSync(new URL(p,root),"utf8");
const parse=p=>JSON.parse(text(p));
const blobSha=s=>{const b=Buffer.from(s,"utf8");return createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex");};
const validSha=x=>typeof x==="string"&&/^[0-9a-f]{40}$/.test(x);
function check(ok,message){if(!ok)throw Error("CE_W26_P1_TEST_HOLD:"+message);}
const decisions=new Set(["SUPERSEDED_WITH_PROOF","REJECTED_WITH_PROVENANCE"]);
export function validateDispositions(d,m,readCurrent=text){
 check(d?.protocol==="CE.W2.6.G2.P1_TEST.DISPOSITION.v1"&&d.parent_issue===106&&d.issue===109,"protocol or issues");
 check(d.phase==="DEVELOPMENT"&&d.scope==="TEST_FILES_ONLY","scope");
 check(d.source_commit===m.source.commit&&d.source_tree===m.source.tree&&
       d.source_branch===m.source.branch,"immutable origin");
 check(validSha(d.reviewed_main_sha)&&validSha(d.reviewed_main_tree),"main sha");
 check(m?.counts?.divergent===48&&m?.counts?.unresolved===48&&
       m?.tree_truncated===false,"baseline expected inventory");
 const c=d.counts;
 check(c.original_divergences===48&&c.p1_test_total===3&&c.p1_test_disposed_dev===3&&
       c.all_disposed_dev===3&&c.unresolved===45&&c.branches_sealed===0&&
       c.security_pending===13&&c.clinical_pending===6&&c.runtime_pending===16&&
       c.ui_pending===10,"expected counts or false sealing");
 check(Array.isArray(d.dispositions)&&d.dispositions.length===3&&
       Array.isArray(d.remaining_paths)&&d.remaining_paths.length===45,"full coverage");
 const known=new Map(m.divergences.map(x=>[x.path,x]));
 check(known.size===48,"original duplicate");
 const all=[...d.dispositions,...d.remaining_paths].map(x=>x.path);
 check(new Set(all).size===48&&all.every(p=>known.has(p)),"missing or duplicated difference");
 const p1=m.divergences.filter(x=>x.risk_preliminary==="P1_TEST").map(x=>x.path).sort();
 check(JSON.stringify(d.dispositions.map(x=>x.path).sort())===JSON.stringify(p1),"improperly disposed risk");
 for(const x of d.dispositions){
  const old=known.get(x.path);
  check(decisions.has(x.decision)&&x.evidence_status==="SEMANTICALLY_DISPOSED_IN_DEV_NOT_RELEASE_CLEARED","status/category");
  check(old.risk_preliminary==="P1_TEST"&&x.risk==="P1_TEST"&&
        old.source_git_blob_sha===x.source_git_blob_sha&&
        old.main_git_blob_sha===x.canonical_git_blob_sha,"blob provenance");
  check(x.material_change==="TEST_ASSERTIONS_ONLY"&&
        x.rights==="SAME_REPOSITORY_PROVENANCE_ONLY_NO_NEW_EXTERNAL_CONTENT","scope/rights");
  check(typeof x.reason==="string"&&x.reason.length>80&&
        typeof x.semantic_evidence==="string"&&x.semantic_evidence.length>80&&
        Array.isArray(x.dependencies)&&x.dependencies.length>=2&&
        x.rollback.includes("Revert"),"semantic justification missing");
  const current=readCurrent(x.path);
  check(blobSha(current)===x.canonical_git_blob_sha,"canonical blob drift "+x.path);
  check(current.includes(x.canonical_assertion),"canonical assertion missing "+x.path);
  check(!current.includes(x.historical_assertion),"obsolete assertion still in main "+x.path);
 }
 for(const x of d.remaining_paths){
  const old=known.get(x.path);
  check(x.decision==="PENDING_SEMANTIC"&&x.risk===old.risk_preliminary&&
        x.source_git_blob_sha===old.source_git_blob_sha&&
        x.baseline_git_blob_sha===old.main_git_blob_sha,"non-test object misclassified");
 }
 check(d.evidence?.executed_baseline_ci?.sha===d.reviewed_main_sha&&
       d.evidence.executed_baseline_ci.conclusion==="success"&&
       d.evidence.executed_baseline_ci.run_url.includes("44898488975"),"baseline CI");
 const e=d.evidence?.release_assertions;
 check(e?.owner_approval==="NOT_REQUESTED_DEFERRED"&&
       e.remote_db_writes===false&&e.branch_deleted===false&&
       e.clinical_approval===false&&e.rights_clearance===false&&
       e.secret_scan_finished===false&&e.release_authorized===false,"fake clearance");
 check(d.closing?.parent_issue_remains_open===true&&
       d.closing.branch_dev_reconciled===false&&d.closing.branch_sealed===false&&
       d.closing.release_eligible===false,"false branch close");
 return{protocol:d.protocol,dispositions:d.dispositions.length,unresolved:d.remaining_paths.length,sealed:0,phase:"DEV_ONLY"};
}
export function verify(){return validateDispositions(parse(ledgerPath),parse(basePath));}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)
 try{console.log(JSON.stringify(verify()));}catch(e){console.error(String(e?.message||e));process.exitCode=2;}
