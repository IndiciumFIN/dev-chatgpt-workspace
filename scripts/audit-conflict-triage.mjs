#!/usr/bin/env node
/** Candidate-only classification across all collision paths, not a merge engine. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {buildCanonicalTriage} from './lib/canonical-conflict-triage.mjs';
const args=process.argv.slice(2);
const opt=(n,f)=>{const i=args.indexOf(n);return i>=0?args[i+1]:f;};
const source=JSON.parse(readFileSync(opt('--source','audit-evidence/main-migration/runtime-report.json'),'utf8'));
const semantic=JSON.parse(readFileSync(opt('--semantic','audit-evidence/main-migration/semantic-i18n-collisions.v1.json'),'utf8'));
const destination=opt('--output','audit-evidence/main-migration/canonical-conflict-triage.v1.json');
if(source.releaseGate!=='HOLD_HUMAN'||semantic.releaseGate!=='HOLD_HUMAN')throw Error('BYPASS_ATTEMPT');
if(source.collisions.length!==semantic.counts.sourceCollisions)throw Error('MISMATCHED_SOURCE_SNAPSHOT');
const triage=buildCanonicalTriage(source.collisions,semantic);
if(triage.counts.total!==source.collisions.length)throw Error('INCOMPLETE_COLLISION_TRIAGE');
const report={
 ...triage,
 date:'2026-10-31',
 repo:'IndiciumFIN/dev-chatgpt-workspace',
 mainSha:source.main.sha,
 semanticRunEvidence:'https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/41227985734',
 limitations:[
   'Suggested WOs are candidate mappings; approved Kernel admission is not established.',
   'Proposed source branches are not decisions or merges. No source is authorized for production.',
   '57 semantically identical DRAFT German translations still require editorial ownership and QA.',
   'Unknown WO mappings remain explicit and require PMO reconciliation.'
 ]
};
mkdirSync(dirname(destination),{recursive:true});
writeFileSync(destination,JSON.stringify(report,null,2)+'\n');
console.log('[conflict-triage] '+JSON.stringify(report.counts));
console.log('[conflict-triage] report='+destination+' release=HOLD_HUMAN');
