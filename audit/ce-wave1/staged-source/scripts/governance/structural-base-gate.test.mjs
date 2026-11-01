import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateStructuralBase,assertLiveRefs,parseLsRemote} from './structural-base-gate.mjs';
const here=dirname(fileURLToPath(import.meta.url));
const original=JSON.parse(readFileSync(resolve(here,'../../docs/CE_BASE_ESTRUTURAL_20261101.json'),'utf8'));
const modified=f=>{const x=structuredClone(original); f(x); return x;};
test('structural inventory is candidate HOLD and references are complete',()=>{
 const v=validateStructuralBase(original);
 assert.equal(v.verdict,'SNAPSHOT_VALID_HOLD'); assert.equal(v.approval,'NOT_GRANTED');
});
test('complete stable remote ref inventory',()=>{
 const records=[[original.branchPopulation.main.branch,original.branchPopulation.main.sha],...original.branchPopulation.sources.map(x=>[x.branch,x.sha])];
 const raw=records.map(([name,sha])=>`${sha}\trefs/heads/${name}`).join('\n');
 assert.equal(assertLiveRefs(original,parseLsRemote(raw)).liveRefsVerified,26);
});
for(const [label,mutate] of [
 ['missing branch',x=>x.branchPopulation.sources.pop()],
 ['altered branch SHA',x=>x.branchPopulation.sources[1].sha='a'.repeat(40)],
 ['fake Kernel admission',x=>x.kernelAdmission='ADMITTED'],
 ['fake migration clearance',x=>x.candidateTables[0].ddlAuthorization='GRANTED'],
 ['duplicate structural table',x=>x.candidateTables[0].name=x.baseTables[0].name],
 ['orphan foreign key reference',x=>x.candidateTables[0].refs.push('new.shadow_table')],
 ['forward phase dependency',x=>x.phases[1].dependsOn=['BASE-07']],
 ['unmapped branch',x=>x.branchPopulation.sources[1].firstPhase='MISSING'],
 ['false conflict approval',x=>x.knownOpenReconciliation.formallyApproved=1]
]) test('fail closed: '+label,()=>assert.throws(()=>validateStructuralBase(modified(mutate))));
test('remote with an extra untracked branch fails',()=>{
 const rec=new Map([[original.branchPopulation.main.branch,original.branchPopulation.main.sha],...original.branchPopulation.sources.map(x=>[x.branch,x.sha])]);
 rec.set('new-untracked-branch','f'.repeat(40));
 assert.throws(()=>assertLiveRefs(original,rec));
});
test('remote branch HEAD moved fails',()=>{
 const rec=new Map([[original.branchPopulation.main.branch,'f'.repeat(40)],...original.branchPopulation.sources.map(x=>[x.branch,x.sha])]);
 assert.throws(()=>assertLiveRefs(original,rec));
});
