#!/usr/bin/env node
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {guardGazetteIssuerBoundary} from "./lib/ncos-gazette-issuer-boundary.mjs";
const root=new URL("../",import.meta.url);
const paths={quarantine:"registers/governance/ncos-cofen736-mixed-gazette-page-quarantine.v1.json",
 recovery:"registers/governance/ncos-drive-atomization-recovery-20261114.v1.json",
 crosswalk:"registers/governance/ncos-recovered-pdf-cko-snapshot-gap.v1.json"};
const raw=Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,readFileSync(new URL(p,root))]));
const data=Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,JSON.parse(v.toString("utf8"))]));
const result=guardGazetteIssuerBoundary(data);
const out=new URL("../audit-evidence/ncos-multisource-universe/",import.meta.url);
mkdirSync(out,{recursive:true});writeFileSync(new URL("gazette-cross-issuer-quarantine.v1.json",out),JSON.stringify({
 ...result,pinnedMetadataOnly:true,sourceTextIncluded:false,dbWrites:0,
 inputSha256:Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,createHash("sha256").update(v).digest("hex")]))
},null,2)+"\n");
console.log("NCOS_GAZETTE_BOUNDARY "+JSON.stringify(result.counts));
if(result.errors.length||process.argv.includes("--enforce-release"))process.exitCode=1;
