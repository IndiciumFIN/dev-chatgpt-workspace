#!/usr/bin/env node
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {checkSourceRightsAndProjections} from "./lib/ncos-rights-master-gate.mjs";
const root=new URL("../",import.meta.url);
const input={
 rights:"registers/governance/ncos-rights-triage-20261114.v1.json",
 recovery:"registers/governance/ncos-drive-atomization-recovery-20261114.v1.json",
 projections:"registers/governance/ncos-master-provision-delta-20261114.v1.json",
 graph:"registers/governance/ncos-regulatory-provision-lineage-20261114.v1.json"
};
const read=p=>readFileSync(new URL(p,root));
const data=Object.fromEntries(Object.entries(input).map(([k,p])=>[k,JSON.parse(read(p).toString("utf8"))]));
const report=checkSourceRightsAndProjections(data);
const artifact={schemaVersion:"1.0.0",scope:"NCOS_CE_NONACCOUNTING",
 provenance:Object.fromEntries(Object.entries(input).map(([k,p])=>[k,{path:p,sha256:createHash("sha256").update(read(p)).digest("hex")}])),
 ...report,releaseEligible:false,normativeSemanticPromotion:false,dbWrites:0,
 note:"A successfully checked inventory does not qualify source rights or clinical/legal authority"};
const out=new URL("../audit-evidence/ncos-multisource-universe/",import.meta.url);
mkdirSync(out,{recursive:true});
writeFileSync(new URL("rights-master-projection-gate.v1.json",out),JSON.stringify(artifact,null,2)+"\n");
console.log("NCOS_RIGHTS_AND_MASTER_GUARD "+JSON.stringify(artifact.counts));
console.log("NCOS_RIGHTS_AND_MASTER_RELEASE "+artifact.releaseGate);
if(report.failures.length||process.argv.includes("--enforce-release"))process.exitCode=1;
