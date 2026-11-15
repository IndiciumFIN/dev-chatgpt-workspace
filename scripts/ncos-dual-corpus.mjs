#!/usr/bin/env node
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {createHash} from "node:crypto";
import {checkSeparateCorpora} from "./lib/ncos-dual-corpus.mjs";
const root=new URL("../",import.meta.url);
const paths={index:"registers/governance/ncos-atomized-data-library-v1_1_0-candidate.json",pdfs:"registers/governance/ncos-drive-atomization-recovery-20261114.v1.json"};
const read=p=>readFileSync(new URL(p,root));
const inputs=Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,JSON.parse(read(p).toString("utf8"))]));
const result=checkSeparateCorpora(inputs);
const out=new URL("../audit-evidence/ncos-multisource-universe/",import.meta.url);
mkdirSync(out,{recursive:true});
writeFileSync(new URL("dual-corpus-separation-gate.v1.json",out),JSON.stringify({schemaVersion:"1.0.0",...result,
 sources:Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,{path:p,sha256:createHash("sha256").update(read(p)).digest("hex")}])),
 publicationAuthorized:false},null,2)+"\n");
console.log("NCOS_DUAL_CORPUS "+JSON.stringify(result.stats));
if(result.errors.length||process.argv.includes("--enforce-release"))process.exitCode=1;
