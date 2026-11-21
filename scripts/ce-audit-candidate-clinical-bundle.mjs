#!/usr/bin/env node
/** Check built public JS; narrow sentinels distinguish held tools from the published reference library. */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';
const root=resolve('.vercel/output/static');
if(!existsSync(root))throw Error('CE_CANDIDATE_BUNDLE_DIRECTORY_MISSING');
const files=[];
function walk(dir){
 for(const e of readdirSync(dir,{withFileTypes:true})){
  const path=join(dir,e.name);
  if(e.isDirectory())walk(path);
  else if(e.isFile()&&['.js','.mjs'].includes(extname(e.name)))files.push(path);
 }
}
walk(root);
if(files.length===0)throw Error('CE_CANDIDATE_BUNDLE_NO_JS');
const forbidden=[
 // These phrases occur only in candidate clinical tool definitions, not in noindex route metadata.
 'Critério de recuperação atingido',
 'Avalia a recuperação pós-anestésica na sala de recuperação para apoiar a decisão de alta',
 'UTC-024 — a comparacao e aritmetica, nao motor de formula com test vectors',
 // Candidate formula-specific description; the independently published 149-exam library is allowed.
 'A base não traz máximo.'
];
const hits=[];
for(const file of files){
 const data=readFileSync(file,'utf8');
 for(const marker of forbidden){
  if(data.includes(marker))hits.push({js:file.slice(root.length+1),marker:marker.slice(0,28)});
 }
}
if(hits.length){
 console.error('CE_UNRELEASED_CLINICAL_TOOL_BUNDLE_LEAK '+JSON.stringify(hits));
 process.exitCode=1;
}else{
 console.log('CE_CANDIDATE_CLINICAL_BUNDLE_PASS scanned_js_files='+files.length);
}
