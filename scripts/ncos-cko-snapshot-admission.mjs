#!/usr/bin/env node
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {createHash} from "node:crypto";
import {checkCkoSnapshotAdmissionCandidates} from "./lib/ncos-cko-snapshot-admission.mjs";
const root=new URL("../",import.meta.url);
const paths={
 crosswalk:"registers/governance/ncos-recovered-pdf-cko-snapshot-gap.v1.json",
 recovery:"registers/governance/ncos-drive-atomization-recovery-20261114.v1.json"
};
const read=p=>readFileSync(new URL(p,root));
const inputs=Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,JSON.parse(read(p).toString("utf8"))]));
const report=checkCkoSnapshotAdmissionCandidates(inputs);
const out=new URL("../audit-evidence/ncos-multisource-universe/",import.meta.url);
mkdirSync(out,{recursive:true});
writeFileSync(new URL("recovered-archive-to-cko-snapshot-gap.v1.json",out),
 JSON.stringify({schemaVersion:"1.0.0",scope:"NCOS_CE_NONACCOUNTING",
 sourceInputs:Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,{path:p,sha256:createHash("sha256").update(read(p)).digest("hex")}])),
 ...report,sourcePromotion:false,publicationApproval:false,rawArchiveNotInCI:true},null,2)+"\n");
console.log("NCOS_CKO_SNAPSHOT_GAP "+JSON.stringify(report.totals));
if(report.errors.length||process.argv.includes("--enforce-release"))process.exitCode=1;
