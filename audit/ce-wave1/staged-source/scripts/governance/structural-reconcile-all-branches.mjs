#!/usr/bin/env node
/** Read-only: deterministic full blob comparison for EVERY current branch against candidate HEAD. */
import {execFileSync,spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parseTree,compareTrees,assessRefs,verifyReport} from './lib/structural-reconcile-core.mjs';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:256*1024*1024}).trim();
function recordRefs(raw,remote){
  const out=new Map();
  for(const line of raw.split('\n').filter(Boolean)){
    let name,sha;
    if(remote){[sha,name]=line.split('\t');if(!name?.startsWith('refs/heads/'))throw Error('INVALID_REMOTE_REF');name=name.slice(11);}
    else{[name,sha]=line.split(' ');if(!name?.startsWith('refs/remotes/origin/')||name==='refs/remotes/origin/HEAD')continue;name=name.slice('refs/remotes/origin/'.length);}
    if(!/^[0-9a-f]{40}$/.test(sha)||out.has(name))throw Error('INVALID_OR_DUPLICATE_REF:'+name);
    out.set(name,sha);
  }
  return out;
}
function tree(sha){return parseTree(git('ls-tree','-r','-z',sha));}
function ancestor(head){const p=spawnSync('git',['merge-base','HEAD',head],{encoding:'utf8'});
  if(p.status===0)return {classification:'COMMON_ANCESTOR',mergeBaseSha:p.stdout.trim()};
  if(p.status===1)return {classification:'UNRELATED_HISTORY',mergeBaseSha:null};
  throw Error('MERGE_BASE_COMMAND_FAILED:'+p.stderr);
}
function main(){
  const branch=git('branch','--show-current');
  const sha=git('rev-parse','HEAD');
  if(branch!=='integration/structural-overlay-20261101'&&!process.env.GITHUB_ACTIONS)throw Error('UNAUTHORIZED_LOCAL_BRANCH:'+branch);
  const local=recordRefs(git('for-each-ref','--format=%(refname) %(objectname)','refs/remotes/origin'),false);
  const remote=recordRefs(git('ls-remote','--heads','origin'),true);
  const {refs,sha256}=assessRefs(remote,local);
  if(!remote.has('integration/structural-overlay-20261101'))throw Error('MISSING_INTEGRATION_BRANCH');
  if(remote.get('integration/structural-overlay-20261101')!==sha)throw Error('NOT_CHECKED_OUT_AT_REMOTE_OVERLAY_HEAD');
  const baseline=tree(sha);
  const sources=[];
  for(const [name,head] of refs.filter(([x])=>x!=='main')){
    const comparison=compareTrees(tree(head),baseline);
    const history=ancestor(head);
    sources.push({branch:name,sha:head,...history,summary:comparison.counts,items:comparison.items});
  }
  // The source population must not have moved during the scan.
  const endRefs=recordRefs(git('ls-remote','--heads','origin'),true);
  assessRefs(endRefs,remote);
  const report={schemaVersion:'1.0.0',reportType:'STRUCTURAL_FIRST_COMPLETE_PATH_AUDIT',
    createdFrom:sha,main:remote.get('main'),branchCount:refs.length,branchesAudited:sources.length,
    ledgerSha256:sha256,refs,sources,releaseGate:'HOLD_HUMAN',authority:'NONE',
    notice:'No file is promoted, no migration executed, and no canonical winner elected.'};
  // Align report shape for independent verifier.
  const check={...report,sources:sources.map(x=>({...x,counts:x.summary}))};
  verifyReport(check,remote);
  const out=process.argv.indexOf('--output');
  if(out>=0){const file=process.argv[out+1];if(!file)throw Error('MISSING_OUTPUT_PATH');mkdirSync(resolve(file,'..'),{recursive:true});writeFileSync(file,JSON.stringify(report,null,2));console.log(JSON.stringify({result:'CANDIDATE_HOLD',path:file,sha:sha256,branches:sources.length,paths:sources.reduce((n,s)=>n+s.items.length,0)}));}
  else console.log(JSON.stringify(report));
}
try{main();}catch(e){console.error('HOLD:'+e.message);process.exitCode=2;}
