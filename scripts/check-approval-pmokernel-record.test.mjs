#!/usr/bin/env node
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT=join(dirname(fileURLToPath(import.meta.url)),"..");
const SCRIPT=join(ROOT,"scripts/check-approval-pmokernel-record.mjs");
const REL="registers/governance/approval-pmokernel-audit-20261031.v1.json";
const ORIGINAL=JSON.parse(readFileSync(join(ROOT,REL),"utf8"));
function run(doc,missing=false){
  const root=mkdtempSync(join(tmpdir(),"approval-record-"));
  try {
    if(!missing){const p=join(root,REL);mkdirSync(dirname(p),{recursive:true});writeFileSync(p,JSON.stringify(doc));}
    try {
      const result=execFileSync(process.execPath,[SCRIPT,"--root",root],{encoding:"utf8",stdio:["ignore","pipe","pipe"]});
      return {code:0,output:result};
    }catch(e){return {code:e.status??1,output:String(e.stdout??"")+String(e.stderr??"")};}
  }finally{rmSync(root,{recursive:true,force:true});}
}
test("valid recorded approval succeeds",()=>{const r=run(ORIGINAL);assert.equal(r.code,0,r.output);assert.match(r.output,/PASS/);});
test("missing approval record fails closed",()=>{const r=run(ORIGINAL,true);assert.equal(r.code,1);assert.match(r.output,/MISSING_OR_INVALID/);});
test("unverified conversation cannot be declared signed",()=>{const doc=structuredClone(ORIGINAL);doc.approvalProvenance.attestationLevel="KERNEL_SIGNED";const r=run(doc);assert.equal(r.code,1);assert.match(r.output,/FALSE_SIGNATURE_CLAIM/);});
test("approval must not release production",()=>{const doc=structuredClone(ORIGINAL);doc.releaseGate="RELEASED";const r=run(doc);assert.equal(r.code,1);assert.match(r.output,/RELEASE_GATE_BYPASS/);});
test("integrated CI cannot be described as passing",()=>{const doc=structuredClone(ORIGINAL);doc.verifiedEvidence.integratedWorkflowConclusion="SUCCESS";const r=run(doc);assert.equal(r.code,1);assert.match(r.output,/FALSE_INTEGRATED_CI_GREEN/);});
test("four unresolved gaps cannot disappear from the record",()=>{const doc=structuredClone(ORIGINAL);doc.remainingGaps=[];const r=run(doc);assert.equal(r.code,1);assert.match(r.output,/GAPS_MISREPRESENTED/);});
test("GitHub issue and PR acknowledgements cannot be omitted",()=>{const doc=structuredClone(ORIGINAL);delete doc.githubAcknowledgements;const r=run(doc);assert.equal(r.code,1);assert.match(r.output,/ISSUE_ACK_MISSING/);assert.match(r.output,/PR_ACK_MISSING/);});
