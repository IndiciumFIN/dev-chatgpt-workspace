#!/usr/bin/env node
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {checkDouActSourceBoundaries} from "./lib/ncos-dou-act-source-boundary.mjs";
const root=new URL("../",import.meta.url);
const paths={
 proof:"registers/governance/ncos-cofen736-dou-act-atom-proofs-20261114.v1.json",
 recovery:"registers/governance/ncos-drive-atomization-recovery-20261114.v1.json",
 gazette:"registers/governance/ncos-cofen736-mixed-gazette-page-quarantine.v1.json",
 crosswalk:"registers/governance/ncos-recovered-pdf-cko-snapshot-gap.v1.json"
};
const raw=Object.fromEntries(Object.entries(paths).map(([key,path])=>[key,readFileSync(new URL(path,root))]));
const inputs=Object.fromEntries(Object.entries(raw).map(([key,b])=>[key,JSON.parse(b.toString("utf8"))]));
const result=checkDouActSourceBoundaries(inputs);
const out=new URL("../audit-evidence/ncos-multisource-universe/",import.meta.url);
mkdirSync(out,{recursive:true});
writeFileSync(new URL("ncos-cofen736-dou-per-act-gate.v1.json",out),
 JSON.stringify({schemaVersion:"1.0.0",...result,clinicalApprovals:0,rawPdfOrJsonlInCI:false,
 sourceTextReleased:false,dbWrites:0,
 inputSha256:Object.fromEntries(Object.entries(raw).map(([key,b])=>[key,createHash("sha256").update(b).digest("hex")]))
 },null,2)+"\n");
console.log("NCOS_DOU_ACT_SEGMENTATION "+JSON.stringify(result.totals));
if(result.errors.length||process.argv.includes("--enforce-release"))process.exitCode=1;
