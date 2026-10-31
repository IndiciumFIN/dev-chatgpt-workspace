#!/usr/bin/env node
/** Read-only intake of source JSON pages; never writes public routes or DB. */
import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
import {join,relative,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {examineSourcePage,summarizeSourceIndex,SOURCE_CORPUS_SCHEMA} from './lib/corpus-index.mjs';

function arg(name,fall){const p=process.argv.indexOf(name);return p>=0?process.argv[p+1]:fall;}
const root=arg('--source-root','');
const output=arg('--output','audit-evidence/corpus-intake/source-index.v1.jsonl');
const summaryPath=arg('--summary','audit-evidence/corpus-intake/source-summary.v1.json');
const expected=Number(arg('--expected','8250'));
const sourceCommit=arg('--source-commit','NOT_RECORDED');
if(!root || !Number.isInteger(expected) || expected<=0 || !/^[a-f0-9]{40}$/.test(sourceCommit)) {
  console.error('[corpus-index] SOURCE_ROOT_EXPECTED_OR_COMMIT_MISSING');process.exit(2);
}
const files=[];
function walk(dir){
  for(const entry of readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
    const path=join(dir,entry.name);
    if(entry.isDirectory())walk(path);
    else if(entry.isFile()&&entry.name.endsWith('.json'))files.push(path);
  }
}
walk(root);
const items=[];
let batches=0;
for(const file of files){
  const sourceFile='artifacts/fonte/corpus/paginas/'+relative(root,file).replaceAll('\\','/');
  items.push(examineSourcePage(sourceFile,readFileSync(file)));
  if(items.length%250===0 || items.length===files.length){
    batches++;
    console.log('[corpus-index] PROGRESS '+items.length+'/'+files.length+' batch='+batches);
  }
}
const results=summarizeSourceIndex(items,expected);
const jsonl=items.map(item=>JSON.stringify({...item,sourceBranch:'feat/projection-unica-f0-suite-real',sourceCommit})).join('\n')+'\n';
mkdirSync(dirname(output),{recursive:true});
writeFileSync(output,jsonl);
const indexSha256=createHash('sha256').update(jsonl).digest('hex');
const report={schemaVersion:'1.0.0',schema:SOURCE_CORPUS_SCHEMA,date:'2026-10-31',
  origin:{repo:'IndiciumFIN/dev-chatgpt-workspace',branch:'feat/projection-unica-f0-suite-real',commit:sourceCommit,root:'artifacts/fonte/corpus/paginas'},
  indexPath:output,indexSha256,validation:results,
  auditConstraints:[
    'Source HTML original not provided here: embedded SHA-256 is a claim, not verified provenance',
    'No license evidence implies NOT_VERIFIED; this index does not establish permission to redistribute',
    'Clinical translation, terminology, score validity and regional rules require domain review',
    'No pages exported to public routes or DB; no main updates; HOLD_HUMAN preserved',
    'One row per JSON source file; this is inventory coverage, not content semantic deduplication'
  ],
  state:'CANDIDATE_INDEX_ONLY',publicationAllowed:false,releaseGate:'HOLD_HUMAN'};
mkdirSync(dirname(summaryPath),{recursive:true});
writeFileSync(summaryPath,JSON.stringify(report,null,2)+'\n');
console.log('[corpus-index] SUMMARY '+JSON.stringify({expected,observed:items.length,structurallyValid:results.structurallyValid,problemGroups:results.problems,duplicateIdentities:results.duplicateIdentityGroups,licenseUnverified:results.licenseUnverified,sha256:indexSha256}));
console.log('[corpus-index] HOLD_HUMAN — no content published');
if(!results.complete)process.exit(2);
