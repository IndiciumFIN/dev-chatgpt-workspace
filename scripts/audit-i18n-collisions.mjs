#!/usr/bin/env node
/** Read-only semantic audit of conflicting German i18n candidate records. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {execFileSync} from 'node:child_process';
import {analyzeSemanticI18nCollisions} from './lib/semantic-collision-audit.mjs';
const args=process.argv.slice(2);
const opt=(name,otherwise)=>{const i=args.indexOf(name);return i<0?otherwise:args[i+1];};
const report=JSON.parse(readFileSync(opt('--report','audit-evidence/main-migration/runtime-report.json'),'utf8'));
const outPath=opt('--output','audit-evidence/main-migration/semantic-i18n-collisions.v1.json');
if(report.releaseGate!=='HOLD_HUMAN'||report.migrationComplete!==false)throw Error('UNSAFE_REPORT');
const input=report.collisions;
const unique= new Set();
const audit=analyzeSemanticI18nCollisions(input,sha=>{
 if(!/^[a-f0-9]{40,64}$/.test(sha))throw Error('INVALID_BLOB_SHA');
 unique.add(sha);
 return execFileSync('git',['cat-file','blob',sha],{encoding:'utf8',maxBuffer:2*1024*1024});
});
const output={
  schemaVersion:'1.0.0',
  sourceReportSha:report.main.sha,
  auditKind:'GERMAN_I18N_SEMANTIC_EQUIVALENCE_ONLY',
  candidateSource:'registers/i18n/incoming/de/',
  counts:{...audit.counts,uniqueSourceBlobsRead:unique.size},
  equivalent:audit.equivalent,
  substantive:audit.substantive,
  unableToVerify:audit.unableToVerify,
  note:'Only provenance_refs order and JSON object key order are treated as non-semantic. No translation value, approval status, other array, or clinical fact may be ignored.',
  releaseGate:'HOLD_HUMAN',
  canonicalWinnerSelected:false,
};
mkdirSync(dirname(outPath),{recursive:true});
writeFileSync(outPath,JSON.stringify(output,null,2)+'\n');
console.log('[semantic-collision] '+JSON.stringify(output.counts));
console.log('[semantic-collision] report='+outPath+' gate=HOLD_HUMAN');
if(audit.unableToVerify.length) {
  console.log('[semantic-collision] REQUIRE_REVIEW '+JSON.stringify(audit.unableToVerify));
  // Inventory succeeds with findings; never authorize a canonical winner.
  // Strict callers may demand zero unresolved items and receive a nonzero exit.
  if(args.includes('--require-clean'))process.exit(2);
}
