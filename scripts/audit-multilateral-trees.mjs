#!/usr/bin/env node
// CE — Reconciliação integral de todas as árvores Git, sem alterações no repositório.
import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {createHash} from 'node:crypto';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:256*1024*1024});
const args=process.argv.slice(2);
const idx=args.indexOf('--output');
const output=idx===-1?'audit-evidence/main-migration/multilateral-tree-index.v1.json':args[idx+1];
if(!output||output.startsWith('-')){console.error('INVALID_OUTPUT');process.exit(2);}
function refs(){
  const map=new Map();
  for(const line of git('for-each-ref','--format=%(refname:short) %(objectname)','refs/remotes/origin').split('\n')){
    if(!line)continue;
    const m=/^origin\/(.+) ([0-9a-f]{40,64})$/.exec(line);
    if(!m)throw Error('INVALID_REF:'+line);
    if(m[1]!=='HEAD')map.set(m[1],m[2]);
  }
  return map;
}
const before=refs();
if(!before.has('main'))throw Error('MAIN_NOT_FETCHED');
function tree(branch){
  const buf=execFileSync('git',['ls-tree','-r','-z','refs/remotes/origin/'+branch],{maxBuffer:256*1024*1024});
  const result=new Map();
  for(const item of buf.toString('utf8').split('\0')){
    if(!item)continue;
    const k=item.indexOf('\t');
    if(k<0)throw Error('INVALID_TREE_RECORD');
    const [mode,type,sha]=item.slice(0,k).split(' ');
    const path=item.slice(k+1);
    result.set(path,{mode,type,sha});
  }
  return result;
}
const names=[...before.keys()].sort();
const trees=new Map(names.map(name=>[name,tree(name)]));
const paths=new Map();
for(const [branch,files] of trees)for(const [path,blob] of files){
  if(!paths.has(path))paths.set(path,[]);
  paths.get(path).push({branch,...blob});
}
const counters={singleBranch:0,identicalAcrossPresentBranches:0,conflictingVersions:0,missingFromMain:0};
const records=[];
for(const [path,versions] of [...paths].sort(([a],[b])=>a.localeCompare(b))){
  const distinct=[...new Set(versions.map(v=>v.mode+':'+v.type+':'+v.sha))];
  const classification=versions.length===1?'SINGLE_BRANCH':distinct.length===1?'IDENTICAL_SHARED':'CONFLICTING_VERSIONS';
  if(classification==='SINGLE_BRANCH')counters.singleBranch++;
  else if(classification==='IDENTICAL_SHARED')counters.identicalAcrossPresentBranches++;
  else counters.conflictingVersions++;
  const mainVersion=versions.find(v=>v.branch==='main')??null;
  if(!mainVersion)counters.missingFromMain++;
  records.push({path,classification,mainVersion,distinctVersions:distinct.length,versions});
}
const pairwise=[];
for(let i=0;i<names.length;i++)for(let j=i+1;j<names.length;j++){
  const a=trees.get(names[i]),b=trees.get(names[j]);
  let identical=0,different=0,onlyA=0,onlyB=0;
  for(const [p,x] of a){const y=b.get(p);if(!y)onlyA++;else if(x.sha===y.sha&&x.mode===y.mode&&x.type===y.type)identical++;else different++;}
  for(const p of b.keys())if(!a.has(p))onlyB++;
  pairwise.push({a:names[i],b:names[j],identical,different,onlyA,onlyB});
}
const after=refs();
const changed=before.size!==after.size||[...before].some(([name,sha])=>after.get(name)!==sha);
const result={schemaVersion:'1.0.0',kind:'READ_ONLY_MULTILATERAL_FULL_TREE',mainSha:before.get('main'),branches:names.map(name=>({name,sha:before.get(name),files:trees.get(name).size})),branchCount:names.length,pairCount:pairwise.length,uniquePaths:records.length,counts:counters,pairwise,paths:records,failures:changed?['BRANCH_HEAD_DRIFT']:[],gate:'HOLD_HUMAN',authorizedForMerge:false,limitations:['Git blob identity is not semantic equivalence','Licenses, Supabase data, Kernel authorization, E2E and deployment are not verified','No automatic winner selection']};
const bytes=JSON.stringify(result,null,2)+'\n';
mkdirSync(dirname(output),{recursive:true});writeFileSync(output,bytes);
console.log(JSON.stringify({branches:result.branchCount,pairs:result.pairCount,uniquePaths:result.uniquePaths,counts:counters,output,sha256:createHash('sha256').update(bytes).digest('hex'),failures:result.failures}));
if(changed)process.exit(2);