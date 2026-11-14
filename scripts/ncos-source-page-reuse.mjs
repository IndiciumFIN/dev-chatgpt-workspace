#!/usr/bin/env node
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {guardSourcePageReuse} from "./lib/ncos-source-page-reuse.mjs";
const root=new URL("../",import.meta.url);
const paths={reuse:"registers/governance/ncos-source-page-reuse-candidates-20261114.v1.json",
 recovery:"registers/governance/ncos-drive-atomization-recovery-20261114.v1.json",
 gazette:"registers/governance/ncos-cofen736-mixed-gazette-page-quarantine.v1.json"};
const read=p=>readFileSync(new URL(p,root));
const inputs=Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,JSON.parse(read(p).toString("utf8"))]));
const r=guardSourcePageReuse(inputs);
const out=new URL("../audit-evidence/ncos-multisource-universe/",import.meta.url);
mkdirSync(out,{recursive:true});writeFileSync(new URL("ncos-source-page-reuse-quarantine.v1.json",out),
 JSON.stringify({schemaVersion:"1.0.0",...r,noSourceTextPresent:true,sourceInstancesDeleted:0,dbWrites:0,
  inputSha256:Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,createHash("sha256").update(read(p)).digest("hex")]))},null,2)+"\n");
console.log("NCOS_PAGE_REUSE "+JSON.stringify(r.totals));
if(r.errors.length||process.argv.includes("--enforce-release"))process.exitCode=1;
