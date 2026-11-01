#!/usr/bin/env node
/** Structural-first, read-only audit gate: does not promote any code or schema. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve, dirname} from 'node:path';
const here=dirname(fileURLToPath(import.meta.url));
const source=resolve(here,'../../docs/CE_BASE_ESTRUTURAL_20261101.json');
export function validateStructuralBase(data){
 const hex=/^[a-f0-9]{40}$/;
 assert.equal(data.classification,'CANDIDATE_READ_ONLY_BASELINE');
 assert.equal(data.releaseGate,'HOLD_HUMAN');
 assert.equal(data.kernelAdmission,'NOT_VERIFIED');
 assert.equal(data.migrationApplied,false);
 assert(hex.test(data.source.githubBaseSha));
 const refs=data.branchPopulation;
 assert.equal(refs.totalWithMain,26,'SNAPSHOT_COUNT_CHANGED');
 assert.equal(refs.main.sha,data.source.githubBaseSha,'MAIN_BASELINE_INCONSISTENT');
 assert.equal(refs.sources.length,25,'SNAPSHOT_BRANCH_POPULATION_INCOMPLETE');
 const names=refs.sources.map(x=>x.branch);
 const ledger=[[refs.main.branch,refs.main.sha],...refs.sources.map(x=>[x.branch,x.sha])].sort((a,b)=>a[0].localeCompare(b[0]));
 assert.equal(createHash('sha256').update(JSON.stringify(ledger)).digest('hex'),refs.shaLedgerSha256,'REF_LEDGER_HASH_MISMATCH');
 assert.equal(new Set(names).size,names.length,'DUPLICATE_BRANCH');
 assert(!names.includes('main'),'MAIN_DUPLICATED');
 assert(refs.sources.every(x=>hex.test(x.sha)&&x.review==='NOT_APPROVED'),'INVALID_BRANCH_AUTHORITY');
 assert.equal(refs.sources.find(x=>x.branch==='integration/structural-overlay-20261101')?.sha,data.source.overlaySha,'OVERLAY_REF_MISMATCH');
 assert.equal(refs.sources.filter(x=>x.status==='no_common_ancestor').length,2,'UNRELATED_BRANCHES_NOT_TRACKED');
 const tables=[...data.baseTables.map(x=>x.name),...data.candidateTables.map(x=>x.name)];
 assert.equal(data.baseTables.length,12);
 assert.equal(data.candidateTables.length,8);
 assert.equal(new Set(tables).size,tables.length,'DUPLICATE_CANONICAL_TABLE');
 assert(data.baseTables.every(x=>x.observed==='EXISTS_IN_LIVE_DB'&&x.change==='REUSE_NOT_RECREATE'));
 assert(data.candidateTables.every(x=>x.observed==='ABSENT_IN_LIVE_DB'&&x.deployment==='CANDIDATE_HOLD'&&x.ddlAuthorization==='NOT_GRANTED'),'UNAUTHORIZED_DDL_STATUS');
 for(const c of data.candidateTables){
  assert(c.refs.length>0, 'MISSING_TABLE_DEPENDENCIES:'+c.name);
  for(const ref of c.refs) assert(tables.includes(ref),'UNKNOWN_TABLE_REFERENCE:'+ref);
 }
 assert.equal(data.database.schemas.reduce((n,s)=>n+s.tables,0),160,'DB_SCHEMA_COUNT_MISMATCH');
 assert.equal(data.database.schemas.reduce((n,s)=>n+s.withPrimaryKey,0),160,'DB_PK_COUNT_MISMATCH');
 assert.equal(data.database.observedMigrations,240,'DB_MIGRATION_SNAPSHOT_CHANGED');
 const ids=data.phases.map(p=>p.id);
 assert.equal(ids.length,9);
 assert.equal(new Set(ids).size,ids.length,'DUPLICATE_PHASE');
 const order=new Map(ids.map((v,i)=>[v,i]));
 for(const [i,p] of data.phases.entries()){
  assert.equal(p.state,'HOLD_HUMAN','UNAUTHORIZED_PHASE_CLEARANCE');
  for(const d of p.dependsOn){assert(order.has(d)&&order.get(d)<i,'CYCLE_OR_FORWARD_DEPENDENCY:'+p.id);}
 }
 for(const b of refs.sources)assert(order.has(b.firstPhase),'BRANCH_UNMAPPED:'+b.branch);
 for(const m of data.candidateMigrations){
  assert(names.includes(m.branch),'MIGRATION_FROM_UNTRACKED_BRANCH:'+m.branch);
  assert(m.state==='NOT_APPLIED'||m.state==='NOT_VERIFIED','UNAUTHORIZED_MIGRATION_STATUS');
 }
 assert.equal(data.knownOpenReconciliation.formallyApproved,0,'FALSE_TRIAGE_APPROVAL');
 return {verdict:'SNAPSHOT_VALID_HOLD',baseTablesConfirmed:data.baseTables.length,
  candidateTablesNotApplied:data.candidateTables.length,branchesObserved:refs.totalWithMain,
  phases:data.phases.length,approval:'NOT_GRANTED',releaseGate:'HOLD_HUMAN'};
}
export function assertLiveRefs(snapshot, remote){
 const expected=new Map([[snapshot.branchPopulation.main.branch,snapshot.branchPopulation.main.sha],
  ...snapshot.branchPopulation.sources.map(b=>[b.branch,b.sha])]);
 assert.equal(remote.size,expected.size,'REF_POPULATION_DRIFT');
 for(const [b,sha] of remote)assert.equal(expected.get(b),sha,'BRANCH_REF_MOVED_OR_UNTRACKED:'+b);
 return {liveRefsVerified:remote.size,branchDrift:0,releaseGate:'HOLD_HUMAN'};
}
export function parseLsRemote(text){
 const m=new Map();for(const l of text.trim().split('\n').filter(Boolean)){
  const [sha,ref]=l.split('\t');
  assert(/^[a-f0-9]{40}$/.test(sha) && ref?.startsWith('refs/heads/'),'INVALID_LS_REMOTE_ROW');
  const name=ref.slice('refs/heads/'.length);
  assert(!m.has(name),'DUPLICATE_REMOTE_REF');m.set(name,sha);
 }return m;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const data=JSON.parse(readFileSync(source,'utf8'));
  const result=validateStructuralBase(data);
  if(process.argv.includes('--git-check')){
   const rows=execFileSync('git',['ls-remote','--heads','origin'],{encoding:'utf8',maxBuffer:64*1024*1024});
   Object.assign(result,assertLiveRefs(data,parseLsRemote(rows)));
  }
  console.log(JSON.stringify(result,null,2));
 }catch(e){console.error('HOLD:'+e.message);process.exitCode=2;}
}
