#!/usr/bin/env node
/** Runs on a full, read-only Git checkout; never writes the canonical queue. */
import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {reconcilePmoForks,PMO_SOURCE_ORDER} from './lib/reconcile-pmo-forks.mjs';

const output=process.argv.includes('--output')?process.argv[process.argv.indexOf('--output')+1]:'audit-evidence/pmo-forks/fork-reconciliation.v1.json';
if(!output||output.startsWith('-')||output==='registers/pmo/queue.v1.json')throw Error('UNSAFE_OUTPUT_PATH');
const exec=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:20*1024*1024,stdio:['ignore','pipe','pipe']}).trim();
const sources=PMO_SOURCE_ORDER.map(ref=>{
 const gitref='refs/remotes/origin/'+ref;
 const commit=exec('rev-parse','--verify',gitref);
 const raw=exec('show',gitref+':registers/pmo/queue.v1.json');
 return {ref,commit,queue:JSON.parse(raw)};
});
const report=reconcilePmoForks(sources);
report.provenance={repository:'IndiciumFIN/dev-chatgpt-workspace',method:'git show refs/remotes/origin/{ref}:registers/pmo/queue.v1.json; event payload SHA-256',createdFor:'CE PMO rev18-vs-19-vs-20-vs-21-vs-23 fork reconciliation'};
report.reconciliationComplete=false;
report.whyNotComplete='Owner has not elected a single authoritative revision, resolved conflicting WO status or authenticated event replay; signed Kernel admission absent.';
mkdirSync(dirname(output),{recursive:true});
writeFileSync(output,JSON.stringify(report,null,2)+'\n','utf8');
console.log('[pmo-fork] '+JSON.stringify(report.counts));
console.log('[pmo-fork] additional WO candidates='+report.additionalWos.join(','));
console.log('[pmo-fork] output='+output+' decision=NOT_ELECTED gate=HOLD_HUMAN');
