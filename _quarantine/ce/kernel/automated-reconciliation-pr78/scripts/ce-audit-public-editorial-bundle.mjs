#!/usr/bin/env node
/** Scans *deployed static JS* only; server source and historical evidence stay auditable. */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';

const root=resolve('.vercel/output/static');
if(!existsSync(root)) throw Error('PUBLIC_BUNDLE_DIRECTORY_MISSING');
const files=[];
function walk(dir){
 for(const x of readdirSync(dir,{withFileTypes:true})){
  const p=join(dir,x.name);
  if(x.isDirectory())walk(p);
  else if(x.isFile()&&['.js','.mjs'].includes(extname(x.name)))files.push(p);
 }
}
walk(root);
if(!files.length)throw Error('PUBLIC_JS_BUNDLE_MISSING');
const forbidden=[
 // Unreleased normative fact FF-009; exact title in the held seed only.
 'Processo de Enfermagem segundo a Resolução Cofen nº 736/2024',
 // Unreleased placeholder content in the editorial source.
 'Este slot foi reservado no template catalog original (87 slots)',
 // A status object that should never leave the seed via this public module.
 'version: "0.0.0-placeholder"'
];
const exposed=[];
for(const file of files){
 const bytes=readFileSync(file,'utf8');
 for(const needle of forbidden){
  if(bytes.includes(needle))exposed.push({asset:file.slice(root.length+1),type:needle.slice(0,26)});
 }
}
if(exposed.length) {
 console.error('CE_PUBLIC_EDITORIAL_CANDIDATE_BUNDLE_LEAK '+JSON.stringify(exposed));
 process.exitCode=1;
} else {
 console.log('CE_PUBLIC_EDITORIAL_STATIC_BUNDLE_PASS scanned_js_files='+files.length);
}
