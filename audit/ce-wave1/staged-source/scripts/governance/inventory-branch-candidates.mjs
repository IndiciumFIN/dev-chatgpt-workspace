#!/usr/bin/env node
/** Enumerates ALL remote branches and compares blob paths against candidate HEAD.
 * Fully read-only. Requires complete remote synchronization and stable SHA refs.
 * Output is candidate evidence only, never an approved conflict election.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const git = (...args) => execFileSync('git',args,{encoding:'utf8',maxBuffer:256*1024*1024}).trim();
function refs(){
 const r=new Map();
 for(const line of git('for-each-ref','--format=%(refname) %(objectname)','refs/remotes/origin').split('\n').filter(Boolean)){
   const [ref,sha]=line.split(' ');
   if(!ref.startsWith('refs/remotes/origin/')||ref==='refs/remotes/origin/HEAD')continue;
   if(!/^[a-f0-9]{40}$/.test(sha))throw Error('INVALID_LOCAL_REF_SHA:'+ref);
   r.set(ref.slice('refs/remotes/origin/'.length),sha);
 }
 return r;
}
function tree(ref){
 const m=new Map();
 const entries=git('ls-tree','-rz',ref).split('\0').filter(Boolean);
 for(const line of entries){
   const tab=line.indexOf('\t');if(tab<0)throw Error('UNPARSEABLE_TREE');
   const [mode,type,oid]=line.slice(0,tab).split(' ');
   if(type==='blob'&&/^[a-f0-9]{40}$/.test(oid))m.set(line.slice(tab+1),{mode,oid});
 }
 return m;
}
const head=git('rev-parse','HEAD');
const local=refs();
const remote=new Map();
for(const line of git('ls-remote','--heads','origin').split('\n').filter(Boolean)){
 const [sha,ref]=line.split('\t');
 if(!ref?.startsWith('refs/heads/')||!/^[a-f0-9]{40}$/.test(sha))throw Error('INVALID_REMOTE_REF');
 remote.set(ref.slice('refs/heads/'.length),sha);
}
if(!remote.has('main')||remote.size===0||remote.size!==local.size)throw Error('INCOMPLETE_REF_COVERAGE');
for(const [name,sha] of remote){if(local.get(name)!==sha)throw Error('UNFETCHED_OR_DRIFTED_BRANCH:'+name);}
for(const name of local.keys()){if(!remote.has(name))throw Error('STALE_LOCAL_BRANCH:'+name);}
const baseline=tree(head),sources=[];
for(const [branch,sha] of [...remote].filter(([n])=>n!=='main').sort(([a],[b])=>a.localeCompare(b))){
 const t=tree(sha),summary={identical:0,missing:0,collision:0},candidates=[];
 for(const [path,v] of t){
  const b=baseline.get(path),status=!b?'MISSING':b.oid===v.oid&&b.mode===v.mode?'IDENTICAL':'COLLISION';
  summary[status.toLowerCase()]++;
  if(status!=='IDENTICAL')candidates.push({path,sourceBlob:v.oid,candidateBlob:b?.oid??null,
      sourceMode:v.mode,candidateMode:b?.mode??null,status,decision:'NOT_APPROVED',
      kernelAdmission:'NOT_VERIFIED',rights:'NOT_ASSESSED'});
 }
 sources.push({branch,sha,summary,candidates});
}
const shaLedger=[...remote].sort(([a],[b])=>a.localeCompare(b));
const result={schemaVersion:2,source:'REMOTE_REFS_PINNED',head,main:remote.get('main'),
 branchCount:remote.size,branchesAudited:sources.length,refs:shaLedger,sources,
 ledgerSha256:createHash('sha256').update(JSON.stringify(shaLedger)).digest('hex'),
 releaseGate:'HOLD_HUMAN',authority:'NONE',limitations:[
  'OID equality proves exact Git bytes only, not clinical or semantic equivalence.',
  'No conflict has been approved and no Git/DB/project files were changed.',
  'The canonical Kernel must independently admit a WO before integration.']};
console.log(JSON.stringify(result,null,2));
