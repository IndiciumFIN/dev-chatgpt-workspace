import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseTree,compareTrees,assessRefs,firstWave,verifyReport} from './structural-reconcile-core.mjs';
const a='a'.repeat(40),b='b'.repeat(40),c='c'.repeat(40);
const row=(mode,sha,path,type='blob')=>`${mode} ${type} ${sha}\t${path}\0`;
test('Tree parser retains paths and executable mode',()=>{
  const m=parseTree(row('100644',a,'docs/a.md')+row('100755',b,'scripts/run.sh'));
  assert.equal(m.size,2);assert.equal(m.get('scripts/run.sh').mode,'100755');
});
test('Mode-only changes are collisions and all four dispositions counted',()=>{
  const s=parseTree(row('100644',a,'same')+row('100644',b,'collide')+row('100644',a,'source'));
  const t=parseTree(row('100644',a,'same')+row('100755',b,'collide')+row('100644',c,'candidate'));
  const x=compareTrees(s,t);
  assert.deepEqual(x.counts,{identical:1,sourceOnly:1,candidateOnly:1,collision:1});
  assert.deepEqual(x.items.map(i=>i.path),['candidate','collide','source']);
  assert(x.items.every(i=>i.releaseGate==='HOLD_HUMAN'&&i.decision==='NOT_APPROVED'));
});
test('Unusual newline filenames survive NUL delimiter',()=>{
  const m=parseTree(row('100644',a,'a\nnew.txt'));
  assert(m.has('a\nnew.txt'));
});
test('Reject duplicate refs and partial ref coverage',()=>{
  const rem=new Map([['main',a],['feature',b]]);
  assert.throws(()=>assessRefs(rem,new Map([['main',a]])));
  assert.throws(()=>assessRefs(rem,new Map([['main',a],['feature',c]])));
  assert.equal(assessRefs(rem,new Map(rem)).refs.length,2);
});
test('Fail on malformed tree or duplicate path',()=>{
  assert.throws(()=>parseTree('oops\0'));
  assert.throws(()=>parseTree(row('100644',a,'x')+row('100644',b,'x')));
});
test('Classify foundational work before UI',()=>{
  assert.equal(firstWave('migrations/candidate.sql'),'BASE-03');
  assert.equal(firstWave('contracts/crosswalk.json'),'BASE-02');
  assert.equal(firstWave('src/routes/index.tsx'),'BASE-07');
});
test('A missing path or forged approval is never a valid report',()=>{
  const refs=new Map([['main',a],['feature',b]]),item={path:'x',decision:'NOT_APPROVED',kernelAdmission:'NOT_VERIFIED'};
  const report={releaseGate:'HOLD_HUMAN',authority:'NONE',branchCount:2,branchesAudited:1,refs:[...refs],sources:[{branch:'feature',sha:b,counts:{sourceOnly:1,candidateOnly:0,collision:0},items:[item]}]};
  assert.equal(verifyReport(report,refs),true);
  const bad=structuredClone(report);bad.sources[0].items=[];
  assert.throws(()=>verifyReport(bad,refs));
  const forged=structuredClone(report);forged.sources[0].items[0].decision='APPROVED';
  assert.throws(()=>verifyReport(forged,refs));
});
