#!/usr/bin/env node
/** CE read-only full-tree Git crosswalk. No merges and no source-branch writes. */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
const output = process.argv[2] ?? 'artifacts/ce-agents/branch-crosswalk.json';
const git = (...args) => execFileSync('git', args, {encoding:'utf8',maxBuffer:128*1024*1024,stdio:['ignore','pipe','pipe']}).trimEnd();
const buf = (...args) => execFileSync('git', args, {maxBuffer:128*1024*1024,stdio:['ignore','pipe','pipe']});
const refs = () => new Map(git('for-each-ref','--format=%(refname:short)%09%(objectname)','refs/remotes/origin')
  .split('\n').filter(Boolean).map(s=>s.split('\t')).filter(([name,sha])=>name!=='origin/HEAD' && /^origin\/.+/.test(name) && /^[a-f\d]{40,64}$/.test(sha))
  .map(([name,sha])=>[name.slice(7),sha]));
function tree(ref) {
  const items = buf('ls-tree','-r','-z','--full-tree',ref).toString('utf8').split('\0');
  const out=new Map();
  for (const item of items) {
    if (!item) continue;
    const m=/^[0-7]{6} (?:blob|commit) ([0-9a-f]{40,64})\t([\s\S]+)$/.exec(item);
    if (!m) throw Error('UNKNOWN_GIT_TREE_RECORD:'+item.slice(0,80));
    if (out.has(m[2])) throw Error('DUPLICATE_TREE_PATH:'+m[2]);
    out.set(m[2],m[1]);
  }
  return out;
}
const before = refs();
if (!before.has('main')) throw Error('MISSING_REMOTE_MAIN');
const main=tree('refs/remotes/origin/main');
const all=new Map();
const branches=[];
for (const [name,sha] of before) {
  if (name==='main') continue;
  const source=tree('refs/remotes/origin/'+name);
  const modified=[];
  let same=0, absent=0, changed=0;
  for (const [path,blob] of source) {
    if (main.get(path)===blob) {same++;continue;}
    if (!main.has(path)) absent++; else changed++;
    modified.push({path,blob,mainBlob:main.get(path)??null});
    if (!all.has(path)) all.set(path,new Map());
    const mapping=all.get(path);
    if (!mapping.has(blob)) mapping.set(blob,[]);
    mapping.get(blob).push(name);
  }
  let base=null, ahead=null, behind=null;
  try {
    base=git('merge-base','refs/remotes/origin/main','refs/remotes/origin/'+name);
    const counts=git('rev-list','--left-right','--count','refs/remotes/origin/main...refs/remotes/origin/'+name).split(/\s+/).map(Number);
    behind=counts[0];ahead=counts[1];
  } catch {}
  branches.push({name,sha,files:source.size,unchanged:same,sourceExclusive:absent,changedShared:changed,
    sourcePathsNotInMain:modified.length,missingFromBranch:[...main.keys()].filter(p=>!source.has(p)).length,
    commonAncestor:base,ahead,behind,divergence:base===null?'NO_COMMON_ANCESTOR':ahead===0?'BEHIND':behind===0?'AHEAD':'DIVERGED',
    changes:modified});
}
const after=refs();
const moving=[...new Set([...before.keys(),...after.keys()])]
 .filter(n=>before.get(n)!==after.get(n)).map(n=>({branch:n,before:before.get(n)??null,after:after.get(n)??null}));
const collisions=[...all].filter(([path,variants])=>variants.size>1).map(([path,variants])=>({
  path, variantCount:variants.size, variants:[...variants].map(([blob,sources])=>({blob,sources}))}));
const summary={mainSha:before.get('main'),totalRefs:before.size,sources:branches.length,
  branchHeadsPinned:!moving.length,mainPaths:main.size,
  distinctMissingOrChangedPaths:all.size,conflictPaths:collisions.length,
  branchesWithoutAncestor:branches.filter(x=>!x.commonAncestor).length,
  totalSourceDiffOccurrences:branches.reduce((n,x)=>n+x.sourcePathsNotInMain,0),
  releaseGate:'HOLD_HUMAN'};
const report={schemaVersion:'1.0.0',workOrder:'WO-CE-DB-SKELETON-001',
  dataSource:'git object trees and pinned refs',summary,branches,collisions,moving,
  notClaims:['Content equivalence','Valid migration ordering','Kernel admission','Clinical validity','Merge eligible','Local Supabase parity']};
mkdirSync(dirname(output),{recursive:true});
writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(summary));
if (moving.length) process.exitCode=2;
