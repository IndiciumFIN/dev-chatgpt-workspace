#!/usr/bin/env node
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {verifyPageEvidence} from "./lib/ncos-page-evidence.mjs";
const root=new URL("../",import.meta.url);
const paths={attestation:"registers/governance/ncos-pdf-page-lineage-roots-20261114.v1.json",
 recovery:"registers/governance/ncos-drive-atomization-recovery-20261114.v1.json"};
const raw=Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,readFileSync(new URL(p,root))]));
const data=Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,JSON.parse(v.toString("utf8"))]));
const r=verifyPageEvidence(data);
const out=new URL("../audit-evidence/ncos-multisource-universe/",import.meta.url);
mkdirSync(out,{recursive:true});
writeFileSync(new URL("ncos-page-lineage-snapshot-gate.v1.json",out),
 JSON.stringify({schemaVersion:"1.0.0",...r,CIValidatesPinnedMetadataNotRawPdfZip:true,
 inputSha256:Object.fromEntries(Object.entries(raw).map(([k,b])=>[k,createHash("sha256").update(b).digest("hex")])),
 sourceContentPublished:false,dbWrites:0},null,2)+"\n");
console.log("NCOS_PAGE_LINEAGE "+JSON.stringify(r.counts));
if(r.errors.length||process.argv.includes("--enforce-release"))process.exitCode=1;
