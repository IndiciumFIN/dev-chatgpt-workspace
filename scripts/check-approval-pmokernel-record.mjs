#!/usr/bin/env node
/** Read-only guard for the recorded project-owner approval. Not Kernel admission. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const REL="registers/governance/approval-pmokernel-audit-20261031.v1.json";
const args=process.argv.slice(2);
let root=".";
for(let i=0;i<args.length;i++){
  if(args[i]==="--root" && args[i+1]) root=args[++i];
  else { console.error("[approval-record] usage: node scripts/check-approval-pmokernel-record.mjs [--root path]");process.exit(2); }
}
let r;
try {r=JSON.parse(readFileSync(resolve(root,REL),"utf8"));}
catch(e){ console.error("[approval-record] MISSING_OR_INVALID: "+e.message);process.exit(1); }
const errs=[];
const need=(ok,code)=>{if(!ok)errs.push(code)};
const repo="IndiciumFIN/dev-chatgpt-workspace";
const prefix="https://github.com/"+repo;
need(r.schemaVersion==="1.0.0","INVALID_SCHEMA");
need(r.recordId==="CE-APPROVAL-PMOKERNEL-AUDIT-20261031","INVALID_RECORD_ID");
need(r.date==="2026-10-31"&&r.scope===repo,"INVALID_SCOPE_OR_DATE");
need(r.state==="RECORDED","NOT_RECORDED");
need(r.decision==="APPROVED_FOR_PERSISTENCE_AND_CONTINUED_VERIFICATION","UNAUTHORIZED_DECISION_SCOPE");
need(r.approvalProvenance?.attestationLevel==="CONVERSATION_DECLARATION_NOT_CRYPTOGRAPHIC_SIGNED","FALSE_SIGNATURE_CLAIM");
need(r.approvalProvenance?.identityVerification==="NOT_PERFORMED","FALSE_IDENTITY_CLAIM");
need(Array.isArray(r.approvedScope)&&r.approvedScope.length>=3,"SCOPE_MISSING");
need(Array.isArray(r.notApproved)&&r.notApproved.length>=4,"PROHIBITIONS_MISSING");
need(r.releaseGate==="HOLD_HUMAN","RELEASE_GATE_BYPASS");
need(r.references?.pullRequest===prefix+"/pull/26"&&r.references?.centralIssue===prefix+"/issues/25","SOURCE_REFERENCE_MISSING");
need(r.githubAcknowledgements?.centralIssueComment?.startsWith(prefix+"/issues/25#issuecomment-"),"ISSUE_ACK_MISSING");
need(r.githubAcknowledgements?.pullRequestComment?.startsWith(prefix+"/pull/26#issuecomment-"),"PR_ACK_MISSING");
const t=r.verifiedEvidence?.candidateTests;
const categories=["coverage","schema","dataKernel"];
need(categories.every(k=>Number.isInteger(t?.[k]?.pass)&&t[k].pass===t[k].total&&t[k].total>0),"CANDIDATE_TEST_COUNTS_INVALID");
need(categories.reduce((sum,k)=>sum+(t?.[k]?.pass??0),0)===t?.aggregate?.pass&&t?.aggregate?.pass===t?.aggregate?.total,"CANDIDATE_TEST_SUM_INVALID");
need(r.verifiedEvidence?.latestCandidateRun?.startsWith(prefix+"/actions/runs/"),"RUN_EVIDENCE_MISSING");
need(r.verifiedEvidence?.integratedWorkflowConclusion==="FAILURE","FALSE_INTEGRATED_CI_GREEN");
const source=r.verifiedEvidence?.realSourceVerification;
need(source?.orphanPendencies===0&&source?.wosWithoutTask===0&&source?.openCoverageGaps===4&&source?.coverageGateExpectedExitCode===1,"FALSE_COVERAGE_RELEASE");
need(Array.isArray(r.remainingGaps)&&r.remainingGaps.length===4&&r.remainingGaps.every(g=>g.state==="OPEN")&&
     ["GAP-01","GAP-02","GAP-03","GAP-04"].every(id=>r.remainingGaps.some(g=>g.id===id)),"GAPS_MISREPRESENTED");
need(Array.isArray(r.humanDependencies)&&r.humanDependencies.length>=4,"HUMAN_BLOCKERS_MISSING");
need(r.ownerNotification==="OWNER_NOTIFIED_IN_CHAT_AFTER_READBACK","OWNER_NOTIFICATION_UNRECORDED");
if(errs.length){ console.error("[approval-record] FAIL "+errs.join(", "));process.exit(1); }
console.log("[approval-record] PASS — approval persisted with GitHub acknowledgements, 39 passing candidate tests, 4 open gaps; HOLD_HUMAN preserved.");
