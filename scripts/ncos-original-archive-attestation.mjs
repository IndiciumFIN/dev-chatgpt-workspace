#!/usr/bin/env node
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {checkRecoveredOriginalArchive} from "./lib/ncos-original-archive-attestation.mjs";
const root=new URL("../",import.meta.url);
const paths={
 attestation:"registers/governance/ncos-17-original-jsonl-restoration-attestation.v1.json",
 recovery:"registers/governance/ncos-drive-atomization-recovery-20261114.v1.json",
 sourceInventory:"registers/governance/ncos-source-universe-supabase-snapshot-20261114.v1.json"
};
const read=p=>readFileSync(new URL(p,root));
const data=Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,JSON.parse(read(p).toString("utf8"))]));
const r=checkRecoveredOriginalArchive(data);
const obj={schemaVersion:"1.0.0",scope:"NCOS_CE_NONACCOUNTING",
 inputHashes:Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,{path:p,sha256:createHash("sha256").update(read(p)).digest("hex")}])),
 ...r,approval:false,rawArchiveBytesNotPresentInCI:true,clinicalStatus:"PENDING",publicationStatus:"BLOCKED"};
const out=new URL("../audit-evidence/ncos-multisource-universe/",import.meta.url);
mkdirSync(out,{recursive:true});
writeFileSync(new URL("original-archive-restoration-gate.v1.json",out),JSON.stringify(obj,null,2)+"\n");
console.log("NCOS_ORIGINAL_ARCHIVE_RECOVERY "+JSON.stringify(r.counts));
console.log("NCOS_ORIGINAL_ARCHIVE_RELEASE "+r.releaseGate);
if(r.errors.length||process.argv.includes("--enforce-release"))process.exitCode=1;
