import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateAuditV6Ledger,loadAuditV6Ledger} from "./ce-audit-v6-execution-ledger.mjs";
const path=new URL("../registers/governance/ce-audit-v6-execution-ledger-20261121.v1.json",import.meta.url);
const data=JSON.parse(readFileSync(path,"utf8"));
test("v6 manifest: all 44 actions documented, 12 dedicated issues, no inferred completion",()=>{
 const r=loadAuditV6Ledger();
 assert.deepEqual(r,{state:"PASS_44_TASKS_DOCUMENTED_NOT_EXECUTED",action_count:44,baseline:24,v5:8,v6:12,
   v6_with_dedicated_issues:12,legacy_missing_dedicated_tracker:12,
   completed:0,sealed:0,real_repo_census:false,secret_scan:false,production_deploy:false});
});
test("v6 ledger rejects missing action or unlinked v6 issue",()=>{
 const d=structuredClone(data);d.records.pop();
 assert.throws(()=>validateAuditV6Ledger(d),/missing historical or v6 task/);
 const bad=structuredClone(data);bad.records.find(x=>x.id==="V6-A07").issue_number=89;
 assert.throws(()=>validateAuditV6Ledger(bad),/not individually mapped/);
});
test("v6 ledger rejects forged execution, self-review, database cross and hidden secret-scanning claims",()=>{
 const forged=structuredClone(data);forged.tracking.all_completed=1;
 assert.throws(()=>validateAuditV6Ledger(forged),/false completion/);
 const fakeMerge=structuredClone(data);fakeMerge.records[0].merge_commit_sha="0".repeat(40);
 assert.throws(()=>validateAuditV6Ledger(fakeMerge),/unsupported close/);
 const changed=structuredClone(data);changed.evidence_source.full_history_secret_scan_completed=true;
 assert.throws(()=>validateAuditV6Ledger(changed),/invented security scan/);
 const db=structuredClone(data);db.snapshots.supabase_current_readonly_observation.schema_cross_complete=true;
 assert.throws(()=>validateAuditV6Ledger(db),/falsely admitted/);
 const approver=structuredClone(data);approver.tracking.approval_policy="OWNER_ALONE";
 assert.throws(()=>validateAuditV6Ledger(approver),/false completion/);
 const falseOwner=structuredClone(data);falseOwner.tracking.project_owner="Leivis Lima";
 assert.throws(()=>validateAuditV6Ledger(falseOwner),/false completion/);
 const falseReview=structuredClone(data);falseReview.tracking.independent_review_dev_gate="REQUIRED";
 assert.throws(()=>validateAuditV6Ledger(falseReview),/false completion/);
 const earlyApproval=structuredClone(data);earlyApproval.tracking.owner_approval_state="APPROVED";
 assert.throws(()=>validateAuditV6Ledger(earlyApproval),/false completion/);
 const falsePhase=structuredClone(data);falsePhase.tracking.governance_phase="PRODUCTION";
 assert.throws(()=>validateAuditV6Ledger(falsePhase),/false completion/);
});
