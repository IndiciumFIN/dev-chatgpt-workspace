#!/usr/bin/env node
/** Safe Git-only snapshot of every pinned CE branch against live canonical main. */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseGitLsTree, reconcileBranchTrees } from './lib/ce-live-branch-reconcile-core.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const run = (args, options = {}) => execFileSync('git', args, {cwd:root,maxBuffer:128*1024*1024,...options});
const defaultLedger = 'registers/governance/ce-branch-completion-20261120.v1.json';
const getArg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index<0 ? fallback : process.argv[index+1];
};
const ledgerPath = resolve(root,getArg('--ledger', defaultLedger));
const outPath = resolve(root,getArg('--output','audit-evidence/ce-live-reconciliation/git-inventory.json'));
const summaryPath = resolve(root,getArg('--summary','audit-evidence/ce-live-reconciliation/summary.json'));
const ledger=JSON.parse(readFileSync(ledgerPath,'utf8'));
const lines=run(['for-each-ref','--format=%(refname)%09%(objectname)%09%(symref)','refs/remotes/origin'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
const refs = new Map();
for (const line of lines) {
  const [ref,sha,symref] = line.split('\t');
  if (symref) continue;
  if (!ref.startsWith('refs/remotes/origin/')) throw Error('UNEXPECTED_REMOTE_REF');
  const name=ref.slice('refs/remotes/origin/'.length);
  if (refs.has(name)) throw Error('DUPLICATE_REMOTE_REF');
  refs.set(name,sha);
}
const mainSha=refs.get('main');
if (!mainSha) throw Error('MAIN_REF_NOT_FETCHED');
const ce=ledger.rows.filter(row=>row.scope==='CE_CKO_NCOS_REVIEW');
const sourceShas = new Set([mainSha,...ce.map(row=>row.source_commit_sha)]);
const trees = new Map();
let i=0;
for (const sha of [...sourceShas].sort()) {
  i++;
  try {
    run(['cat-file','-e',`${sha}^{commit}`]);
    trees.set(sha,parseGitLsTree(run(['ls-tree','-rz',sha])));
  } catch(e) {
    if (sha===mainSha) throw Error('CURRENT_MAIN_TREE_UNAVAILABLE');
    console.log(`HOLD: pinned source SHA not available (${i}/${sourceShas.size})`);
  }
  if(i%5===0||i===sourceShas.size) console.log(`PROGRESS: ${i}/${sourceShas.size} immutable Git trees scanned`);
}
const report=reconcileBranchTrees({ledger,currentMainSha:mainSha,remoteRefs:refs,treesBySha:trees,maxDetails:0});
mkdirSync(dirname(outPath),{recursive:true});
mkdirSync(dirname(summaryPath),{recursive:true});
writeFileSync(outPath,JSON.stringify(report,null,2)+'\n');
const {review_queue,branches,...summary}=report;
summary.branch_statuses=branches.map(({branch,counts,sha_matches_pinned})=>({branch,counts,sha_matches_pinned}));
writeFileSync(summaryPath,JSON.stringify(summary,null,2)+'\n');
console.log('CE_LIVE_GIT_RECONCILIATION',JSON.stringify({mainSha,coverage:report.coverage,counts:report.status_counts,review_objects:report.unique_review_objects,sha256:report.report_sha256,gate:report.release_gate}));
if(!report.source_comparison_complete) process.exitCode=2;
