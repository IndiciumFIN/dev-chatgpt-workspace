#!/usr/bin/env node
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {createHash} from "node:crypto";
import {checkCofen736ArticleOffsets} from "./lib/ncos-cofen736-article-offsets.mjs";
const root=new URL("../",import.meta.url);
const paths={articles:"registers/governance/ncos-cofen736-article-offset-proofs-20261114.v1.json",
 actBoundary:"registers/governance/ncos-cofen736-dou-act-atom-proofs-20261114.v1.json",
 recovery:"registers/governance/ncos-drive-atomization-recovery-20261114.v1.json"};
const raw=Object.fromEntries(Object.entries(paths).map(([key,path])=>[key,readFileSync(new URL(path,root))]));
const inputs=Object.fromEntries(Object.entries(raw).map(([key,b])=>[key,JSON.parse(b.toString("utf8"))]));
const r=checkCofen736ArticleOffsets(inputs);
const target=new URL("../audit-evidence/ncos-multisource-universe/",import.meta.url);
mkdirSync(target,{recursive:true});
writeFileSync(new URL("cofen736-article-span-hold-gate.v1.json",target),
 JSON.stringify({schemaVersion:"1.0.0",...r,noRawPdfInCI:true,noSourceTextInRepo:true,
  sourceHashes:Object.fromEntries(Object.entries(raw).map(([k,b])=>[k,createHash("sha256").update(b).digest("hex")]))},null,2)+"\n");
console.log("NCOS_COFEN736_ARTICLE_SPANS "+JSON.stringify(r.counts));
if(r.errors.length||process.argv.includes("--enforce-release"))process.exitCode=1;
