import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

export function parseTree(bytes){
  const text=Buffer.isBuffer(bytes)?bytes.toString('utf8'):bytes;
  assert(typeof text==='string','INVALID_GIT_TREE');
  const rows=new Map();
  for(const row of text.split('\0').filter(Boolean)){
    const ix=row.indexOf('\t');
    assert(ix>0,'MALFORMED_GIT_TREE_ENTRY');
    const parts=row.slice(0,ix).split(' ');
    assert.equal(parts.length,3,'MALFORMED_GIT_TREE_ENTRY');
    const [mode,type,sha]=parts;
    const path=row.slice(ix+1);
    assert(/^[0-9]{6}$/.test(mode)&&/^[0-9a-f]{40}$/.test(sha),'INVALID_TREE_OID');
    assert(['blob','commit'].includes(type),'UNEXPECTED_TREE_ENTRY_TYPE');
    assert(path&&!path.includes('\0')&&!rows.has(path),'DUPLICATE_OR_EMPTY_TREE_PATH');
    rows.set(path,{mode,type,oid:sha});
  }
  return rows;
}
export function compareTrees(source, candidate){
  const all=new Set([...source.keys(),...candidate.keys()]);
  const counts={identical:0,sourceOnly:0,candidateOnly:0,collision:0};
  const items=[];
  for(const path of [...all].sort()){
    const a=source.get(path),b=candidate.get(path);
    const status=!a?'CANDIDATE_ONLY':!b?'SOURCE_ONLY':
      a.mode===b.mode&&a.type===b.type&&a.oid===b.oid?'IDENTICAL':'COLLISION';
    counts[{IDENTICAL:'identical',SOURCE_ONLY:'sourceOnly',CANDIDATE_ONLY:'candidateOnly',COLLISION:'collision'}[status]]++;
    if(status==='IDENTICAL')continue;
    items.push({path,status,firstWave:firstWave(path),sourceBlob:a?.oid??null,
      candidateBlob:b?.oid??null,sourceMode:a?.mode??null,candidateMode:b?.mode??null,
      decision:'NOT_APPROVED',kernelAdmission:'NOT_VERIFIED',releaseGate:'HOLD_HUMAN'});
  }
  assert.equal(Object.values(counts).reduce((a,b)=>a+b,0),all.size,'COVERAGE_MISMATCH');
  return {counts,items};
}
export function firstWave(path){
  if(/^(migrations\/|supabase\/migrations\/)/.test(path))return 'BASE-03';
  if(/^(contracts\/|schemas\/|database\/|db\/)/.test(path))return 'BASE-02';
  if(/^(registers\/pmo\/|src\/core\/|src\/lib\/governance\/|scripts\/governance\/)/.test(path))return 'BASE-04';
  if(/^(imports\/|bibliotecas-corpus\/|src\/lib\/content\/|registers\/curiosidades\/)/.test(path))return 'BASE-05';
  if(/^(src\/routes\/|src\/components\/|src\/styles|src\/pages\/)/.test(path))return 'BASE-07';
  if(/^(\.github\/|tests\/|audit\/)/.test(path))return 'BASE-08';
  if(/^(docs\/|README)/.test(path))return 'BASE-01';
  return 'BASE-06';
}
export function assessRefs(remote,local){
  assert(remote instanceof Map && local instanceof Map,'INVALID_REF_INPUT');
  assert(remote.size>=2 && remote.has('main'),'MISSING_MAIN_OR_SOURCE_BRANCH');
  assert.equal(remote.size,local.size,'INCOMPLETE_LOCAL_REF_COVERAGE');
  for(const [name,sha] of remote){
    assert(/^[0-9a-f]{40}$/.test(sha),'INVALID_BRANCH_SHA');
    assert.equal(local.get(name),sha,'REF_NOT_FETCHED_OR_CHANGED:'+name);
  }
  for(const name of local.keys())assert(remote.has(name),'STALE_LOCAL_REF:'+name);
  const refs=[...remote].sort(([a],[b])=>a.localeCompare(b));
  return {refs,sha256:createHash('sha256').update(JSON.stringify(refs)).digest('hex')};
}
export function verifyReport(report,branchRefs){
  assert.equal(report.releaseGate,'HOLD_HUMAN');
  assert.equal(report.authority,'NONE');
  assert.equal(report.branchesAudited,branchRefs.size-1,'MISSING_BRANCH_AUDIT');
  assert.equal(report.branchCount,branchRefs.size,'REF_POPULATION_MISMATCH');
  const shas=new Map(report.refs);
  assert.equal(shas.size,branchRefs.size,'DUPLICATE_REF');
  for(const [name,sha] of branchRefs)assert.equal(shas.get(name),sha,'REPORT_REF_DRIFT:'+name);
  for(const s of report.sources){
    assert.equal(shas.get(s.branch),s.sha,'SOURCE_SHA_DRIFT:'+s.branch);
    assert.equal(s.items.length,s.counts.sourceOnly+s.counts.candidateOnly+s.counts.collision,'INCOMPLETE_DIFF:'+s.branch);
    assert(s.items.every(x=>x.decision==='NOT_APPROVED'&&x.kernelAdmission==='NOT_VERIFIED'));
  }
  return true;
}
