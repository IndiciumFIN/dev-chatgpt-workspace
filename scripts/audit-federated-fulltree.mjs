#!/usr/bin/env node
/**
 * CE | Federated full-tree audit, read only. No content is promoted.
 * Six repositories: 4 distinct source trees, one exact-backup mirror and one empty repo.
 * Reads Git object metadata (no checkout of source files or credentials).
 */
import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';

const definitions=[
 {repo:'IndiciumFIN/dev-chatgpt-workspace',role:'candidate',expected:29},
 {repo:'IndiciumFIN/calculadorasdeenfermagem',role:'governance',expected:17},
 {repo:'IndiciumFIN/calculadorasdeenfermagem-backup-20261031',role:'mirror',expected:17,mirror:'IndiciumFIN/calculadorasdeenfermagem'},
 {repo:'auditeduca/Calculadoras-de-Enfermagem',role:'historic-site',expected:1},
 {repo:'auditeduca/teste-enf',role:'historic-corpus',expected:46},
 {repo:'auditeduca/teste',role:'empty',expected:0}
];
const output='audit-evidence/federated-20261101';
const errors=[];
const run=(args,cwd,timeout=480000)=>execFileSync('git',args,{cwd,encoding:'utf8',maxBuffer:256*1024*1024,timeout,stdio:['ignore','pipe','pipe']});
const url=repo=>'https://github.com/'+repo+'.git';
function remoteHeads(repo) {
 const value=run(['ls-remote','--heads',url(repo)],process.cwd(),120000);
 const map=new Map();
 for(const row of value.trim().split('\n')) {
  if(!row) continue;
  const m=/^([0-9a-f]{40,64})\s+refs\/heads\/(.+)$/.exec(row);
  if(!m) throw Error('BAD_REMOTE_HEAD:'+repo);
  if(map.has(m[2])) throw Error('DUPLICATE_HEAD:'+repo+':'+m[2]);
  map.set(m[2],m[1]);
 }
 return map;
}
function clone(repo,dir) {
 // Blobless shallow clones hold all branch tree objects without executing repository code.
 run(['clone','--quiet','--filter=blob:none','--depth=1','--no-single-branch','--no-checkout',url(repo),dir],process.cwd(),900000);
}
function localHeads(dir) {
 const map=new Map();
 const s=run(['for-each-ref','--format=%(refname:short)%09%(objectname)','refs/remotes/origin'],dir);
 for(const row of s.split('\n')) {
  if(!row) continue;
  const m=/^origin\/(.+)\t([0-9a-f]{40,64})$/.exec(row);
  // Git may enumerate the symbolic origin/HEAD as a shortened 'origin' ref.
  if(row.startsWith('origin\t'))continue;
  if(!m)throw Error('BAD_LOCAL_REF:'+row);
  if(m[1]!=='HEAD')map.set(m[1],m[2]);
 }
 return map;
}
function equalMaps(a,b) {
 return a.size===b.size&&[...a].every(([k,v])=>b.get(k)===v);
}
function tree(dir,branch) {
 const buf=execFileSync('git',['ls-tree','-r','-z','refs/remotes/origin/'+branch],{cwd:dir,maxBuffer:256*1024*1024,timeout:180000});
 const records=new Map();
 for(const line of buf.toString('utf8').split('\0')) {
  if(!line)continue;
  const idx=line.indexOf('\t');
  if(idx===-1)throw Error('BAD_TREE_ENTRY');
  const [mode,type,sha]=line.slice(0,idx).split(' ');
  const path=line.slice(idx+1);
  if(!/^[0-9a-f]{40,64}$/.test(sha)||!path||records.has(path))throw Error('BAD_BLOB_OR_PATH:'+branch+':'+path);
  records.set(path,{sha,mode,type});
 }
 return records;
}
const initial=definitions.map(d=>({...d,heads:remoteHeads(d.repo)}));
for(const d of initial)if(d.heads.size<d.expected)errors.push('POPULATION_SHORT:'+d.repo+':'+d.heads.size+'<'+d.expected);
const gov=initial.find(d=>d.role==='governance').heads;
const mir=initial.find(d=>d.role==='mirror').heads;
if(!equalMaps(gov,mir))errors.push('HISTORIC_MIRROR_DRIFT');
if(initial.find(d=>d.role==='empty').heads.size!==0)errors.push('EXPECTED_EMPTY_NOT_EMPTY');
const folder=mkdtempSync(join(tmpdir(),'ce-federated-'));
const sources=[];
const shaGlobal=new Map();
const pathGlobal=new Map();
try{
 for(const d of initial.filter(x=>x.role!=='mirror'&&x.role!=='empty')){
  const dir=join(folder,d.repo.replaceAll('/','__'));
  clone(d.repo,dir);
  const local=localHeads(dir);
  if(!equalMaps(d.heads,local))errors.push('CLONE_HEAD_DRIFT:'+d.repo);
  for(const [branch,sha] of local) {
   const files=tree(dir,branch);
   const ref=d.repo+'@'+branch;
   sources.push({repo:d.repo,branch,sha,ref,files});
   for(const [path,v] of files) {
    if(!pathGlobal.has(path))pathGlobal.set(path,[]);
    pathGlobal.get(path).push({ref,repo:d.repo,branch,...v});
    if(v.type!=='blob')continue;
    if(!shaGlobal.has(v.sha))shaGlobal.set(v.sha,new Set());
    shaGlobal.get(v.sha).add(ref);
   }
  }
  const current=remoteHeads(d.repo);
  if(!equalMaps(d.heads,current))errors.push('REMOTE_HEAD_DRIFT:'+d.repo);
 }
 for(const d of initial.filter(x=>x.role==='mirror'||x.role==='empty')) {
  if(!equalMaps(d.heads,remoteHeads(d.repo)))errors.push('REMOTE_HEAD_DRIFT:'+d.repo);
 }
 mkdirSync(output,{recursive:true});
 const candidate=sources.find(x=>x.ref==='IndiciumFIN/dev-chatgpt-workspace@canonical/local-20261101');
 if(!candidate)errors.push('CANDIDATE_MISSING');
 const canonicalSha=new Set([...candidate?.files.values()||[]].filter(v=>v.type==='blob').map(v=>v.sha));
 const perRepo=initial.map(d=>{
  const bs=sources.filter(s=>s.repo===d.repo);
  const blobs=new Set(bs.flatMap(s=>[...s.files.values()].filter(v=>v.type==='blob').map(v=>v.sha)));
  const mains=bs.find(s=>s.branch==='main');
  return {repo:d.repo,role:d.role,branchCount:d.heads.size,mainSha:d.heads.get('main')??null,
   mainFileCount:mains?.files.size??(d.role==='mirror'?sources.find(s=>s.repo===d.mirror&&s.branch==='main')?.files.size??0:0),
   distinctBlobCount:blobs.size,blobsNotInCandidate:[...blobs].filter(x=>!canonicalSha.has(x)).length,
   sameAs:d.role==='mirror'&&equalMaps(gov,mir)?d.mirror:null,
   branches:[...d.heads].sort(([a],[b])=>a.localeCompare(b)).map(([name,sha])=>({name,sha}))};
 });
 const pairwise=[];
 for(let i=0;i<sources.length;i++)for(let j=i+1;j<sources.length;j++){
  const a=sources[i],b=sources[j];let identical=0,different=0,onlyA=0,onlyB=0;
  for(const [p,v] of a.files) {
   const other=b.files.get(p);
   if(!other)onlyA++;
   else if(v.sha===other.sha&&v.mode===other.mode&&v.type===other.type)identical++;
   else different++;
  }
  for(const p of b.files.keys())if(!a.files.has(p))onlyB++;
  pairwise.push({left:a.ref,right:b.ref,identical,different,onlyLeft:onlyA,onlyRight:onlyB});
 }
 const classifications={singleReference:0,identicalWherePresent:0,conflictingVersions:0,sharedAcrossRepositories:0};
 const records=[];
 const priority=path=>/^(contracts|schemas|policies|agents|src\/core|packages\/cli\/kernel|rego|opa)\//i.test(path)?'P0_GOVERNANCE':
 /^(migrations|registers|data|database|supabase|packages\/builder)\//i.test(path)?'P1_STRUCTURE':
 /^(src|public|reference-website|NIFS|i18n-pipeline|cko-controlled)\//i.test(path)?'P2_PRODUCT_CORPUS':'P3_OTHER';
 const rows=['priority,path,versions,references,repositories,existsInCandidate'];
 for(const [path,versions] of [...pathGlobal].sort(([a],[b])=>a.localeCompare(b))) {
  const distinct=new Set(versions.map(v=>v.mode+':'+v.type+':'+v.sha));
  const nRepos=new Set(versions.map(v=>v.repo)).size;
  const category=versions.length===1?'SINGLE_REFERENCE':distinct.size===1?'IDENTICAL_SHARED':'CONFLICTING_VERSIONS';
  if(category==='SINGLE_REFERENCE')classifications.singleReference++;
  else if(category==='IDENTICAL_SHARED')classifications.identicalWherePresent++;
  else classifications.conflictingVersions++;
  if(nRepos>1)classifications.sharedAcrossRepositories++;
  const existsInCandidate=Boolean(candidate?.files.has(path));
  if(distinct.size>1)rows.push([priority(path),path,distinct.size,versions.length,nRepos,existsInCandidate].map(csv).join(','));
  records.push(JSON.stringify({path,category,priority:priority(path),existsInCandidate,versions}));
 }
 const c='reference,sha,files\n'+sources.map(s=>[s.ref,s.sha,s.files.size].map(csv).join(',')).join('\n')+'\n';
 writeFileSync(output+'/branch-heads.csv',c);
 writeFileSync(output+'/cross-repo-conflicts.csv',rows.join('\n')+'\n');
 writeFileSync(output+'/pairwise.csv','left,right,identical,different,onlyLeft,onlyRight\n'+pairwise.map(r=>[r.left,r.right,r.identical,r.different,r.onlyLeft,r.onlyRight].map(csv).join(',')).join('\n')+'\n');
 writeFileSync(output+'/all-path-versions.jsonl.gz',gzipSync(records.join('\n')+'\n',{level:9}));
 const candidateMissing=[];
 for(const [sha,refs] of shaGlobal)if(!canonicalSha.has(sha))candidateMissing.push({sha,refs:[...refs].sort()});
 writeFileSync(output+'/blob-coverage-not-in-candidate.jsonl.gz',gzipSync(candidateMissing.map(x=>JSON.stringify(x)).join('\n')+'\n',{level:9}));
 const res={schemaVersion:1,kind:'FEDERATED_GIT_BLOB_PATH_RECONCILIATION',scope:'read_only',generatedAt:new Date().toISOString(),
  physicalBranchReferences:initial.reduce((n,r)=>n+r.heads.size,0),independentBranchReferences:sources.length,
  duplicateMirroredReferences:mir.size,gitPairwise:pairwise.length,distinctPaths:pathGlobal.size,distinctGitBlobs:shaGlobal.size,
  classifications,perRepo,errors,gate:'HOLD_HUMAN',authorizedForMerge:false,
  notes:['Git SHAs measure byte equality, not semantic, clinical, licensing or runtime equivalence',
  'Mirror branches are verified by ref name+SHA and not redundantly cloned',
  'Candidate missing blobs may be intentionally obsolete; not proof of loss',
  'No source code, data or secrets copied into the candidate application','No winner or release is selected']};
 writeFileSync(output+'/summary.json',JSON.stringify(res,null,2)+'\n');
 console.log(JSON.stringify({physicalRefs:res.physicalBranchReferences,independentRefs:res.independentBranchReferences,pairs:res.gitPairwise,paths:res.distinctPaths,blobs:res.distinctGitBlobs,classified:classifications,errors,output}));
 if(errors.length)process.exitCode=2;
} finally {rmSync(folder,{recursive:true,force:true});}
function csv(x){return '"'+String(x??'').replaceAll('"','""')+'"';}
