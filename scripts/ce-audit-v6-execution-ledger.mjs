#!/usr/bin/env node
/** Fail-closed coverage guard for CE audit v6 task ledger.
 * Creates NO issues/PRs/branches, executes NO remote writes or DB access.
 * A tracked task != a completed task; controls owner/reviewer separation. */
import {readFileSync} from "node:fs";
import {pathToFileURL} from "node:url";
const src=new URL("../registers/governance/ce-audit-v6-execution-ledger-20261121.v1.json",import.meta.url);
const must=(v,m)=>{if(!v)throw Error("CE_V6_LEDGER_HOLD:"+m);};
const isSha=s=>typeof s==="string"&&/^[0-9a-f]{40}$/.test(s);
export function validateAuditV6Ledger(d){
 must(d?.protocol==="CE.AUDIT.V6.EXECUTION_LEDGER.v1","wrong protocol");
 must(d.repository==="IndiciumFIN/dev-chatgpt-workspace"&&d.document_date==="2026-11-21","wrong scope/date");
 const e=d.evidence_source,t=d.tracking;
 must(e?.version==="6.0.0"&&e?.source_version==="5.0.0","unverified source version");
 must(e.audit_report_sha256==="87e12b07ddc58ed451d898e5b497ab6b2d27c4bdc19f2d327e8baf5385c87a50"&&
      e.v5_reconstructed_sha256==="997b882014e40ba6b5bdc26633a287c6ec703da31789ee1437d765c6a5020087"&&
      e.manifest_files_verified===5&&e.manifest_files_total===5&&
      e.v5_patch_reverse_verification==="PASS","original audit provenance not verified");
 must(e.source_py_sha256==="51eeaaa74419b65e914af0218aae0922ebd1576b8690267e3410afdc21044be3"&&
      e.source_py_test==="PASS_SYNTHETIC_GIT_ONLY"&&
      e.real_repository_census_by_source_script===false&&
      e.full_history_secret_scan_completed===false&&
      e.lint_full_rerun_completed===false&&e.vercel_ready_verified===false,
      "invented security scan, lint, deployment or real repo execution");
 must(isSha(d.snapshots?.main_at_audit)&&isSha(d.snapshots?.pr89_at_v6_source)&&
      isSha(d.snapshots?.pr89_after_eighth_wave)&&d.snapshots.snapshot_heads_are_not_live===true,
      "snapshot improperly presented as live");
 const db=d.snapshots.supabase_current_readonly_observation;
 must(db?.project_name==="Calculadoras-Smart"&&db.schema==="public"&&
      db.table_count===48&&db.runtime_database_identified===false&&db.schema_cross_complete===false,
      "partial Supabase metadata falsely admitted");
 must(t?.epic_issue===90&&t.legacy_mapping_issue===103&&
      t.v6_dedicated_issues===12&&t.legacy_documented_tasks===32&&
      t.total_documented_tasks===44&&
      t.legacy_specific_issue_mapping_pending===12&&
      t.all_completed===0&&t.all_sealed===0&&
      t.production_deploy_allowed===false&&t.remote_db_writes_allowed===false&&
      t.source_branch_delete_allowed===false&&t.protected_workflows_no_unreviewed_merge===true&&
      t.approval_policy==="OWNER_LEIVIS_LIMA_DISTINCT_FROM_AUTHENTIC_INDEPENDENT_REVIEWER",
      "false completion/merge/deploy authorization");
 must(t.task_definition_of_done?.length>=7,"task evidence contract missing");
 must(Array.isArray(d.records)&&d.records.length===44,"missing historical or v6 task");
 const ids=new Set(),groups={baseline:0,v5:0,v6:0},withDedicated=new Set(),pendingLegacy=[];
 for(const r of d.records){
  must(typeof r.id==="string"&&!ids.has(r.id),"duplicated or missing ID");ids.add(r.id);
  must(["P0","P1","P2","P0/P1"].includes(r.priority)&&
       typeof r.title==="string"&&r.title.length>8,"missing priority/scope");
  must(Array.isArray(r.execution_proof)&&r.merge_commit_sha===null&&
       r.independent_approval_ref===null&&r.final_disposition===null,
       "unsupported close without main/check/reviewer evidence");
  if(/^V6-A\d\d$/.test(r.id)){
   groups.v6++;
   const n=Number(r.id.slice(-2));
   must(n>=1&&n<=12&&r.issue_number===90+n&&
        r.issue_mapping==="DEDICATED_ISSUE_CREATED"&&
        r.source==="V6_INCREMENTAL"&&r.dedicated_execution_issue_required===false,
        "v6 action not individually mapped to a verified issue");
   must(r.state==="IN_PROGRESS_PR_OPEN_NO_MERGE"&&n===5||
        r.state==="SYNTHETIC_SMOKE_ONLY"&&n===9||
        r.state==="READ_ONLY_PARTIAL_SCHEMA_ONLY"&&n===10||
        r.state==="OPEN_NOT_VERIFIED"&&![5,9,10].includes(n),
        "v6 action claims unverified execution");
   must(Array.isArray(r.candidate_pr_numbers)&&
        r.candidate_pr_numbers.every(x=>Number.isInteger(x)&&x>0),
        "candidate PR number malformed");
   withDedicated.add(r.issue_number);
  }else{
   must(r.issue_number===103&&r.issue_mapping==="HISTORICAL_REGISTER_NOT_EXECUTION_CERTIFICATE"&&
        r.state==="HISTORICAL_UNVERIFIED"&&
        (r.related_current_issue_id===null||/^V6-A(0[1-9]|1[0-2])$/.test(r.related_current_issue_id)),
        "historic action incorrectly represented as executed");
   if(r.id.startsWith("V5-A")){groups.v5++;must(Number(r.id.slice(-2))>=25&&Number(r.id.slice(-2))<=32,"v5 ID invalid");}
   else {groups.baseline++;must(/^(W0|W1|W2|W3|W4)-\d\d$/.test(r.id),"baseline ID invalid");}
   if(r.dedicated_execution_issue_required){must(r.related_current_issue_id===null,"historic issue mapping drift");pendingLegacy.push(r.id);}
  }
 }
 must(groups.baseline===24&&groups.v5===8&&groups.v6===12&&
      withDedicated.size===12&&
      pendingLegacy.length===12&&
      [...Array(12)].every((_,i)=>ids.has("V6-A"+String(i+1).padStart(2,"0"))),"missing actions");
 return {state:"PASS_44_TASKS_DOCUMENTED_NOT_EXECUTED",
   action_count:44,baseline:24,v5:8,v6:12,v6_with_dedicated_issues:12,
   legacy_missing_dedicated_tracker:12,completed:0,sealed:0,
   real_repo_census:false,secret_scan:false,production_deploy:false};
}
export function loadAuditV6Ledger(){return validateAuditV6Ledger(JSON.parse(readFileSync(src,"utf8")));}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
 try{console.log(JSON.stringify(loadAuditV6Ledger()));}
 catch(err){console.error(String(err?.message??err));process.exitCode=2;}
}
