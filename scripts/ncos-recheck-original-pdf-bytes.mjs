#!/usr/bin/env node
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {checkOriginalPdfBytes} from "./lib/ncos-pdf-byte-integrity.mjs";
const folder=process.argv[2];
if(!folder||folder.startsWith("--"))throw new Error("USAGE: node scripts/ncos-recheck-original-pdf-bytes.mjs <directory-with-17-verified-drive-pdfs>");
const recovery=JSON.parse(readFileSync(new URL("../registers/governance/ncos-drive-atomization-recovery-20261114.v1.json",import.meta.url),"utf8"));
const result=await checkOriginalPdfBytes(recovery,folder);
const out=new URL("../audit-evidence/ncos-multisource-universe/",import.meta.url);
mkdirSync(out,{recursive:true});
writeFileSync(new URL("pdf-independent-byte-check.v1.json",out),JSON.stringify(result,null,2)+"\n");
console.log("NCOS_PDF_BYTE_RECHECK "+JSON.stringify({total:result.total,matched:result.matched,failed:result.failed,jsonlVerified:false}));
if(result.failed>0)process.exitCode=1;
