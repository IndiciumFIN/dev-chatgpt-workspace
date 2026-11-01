import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,rmSync,writeFileSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
const git=(cwd,...args)=>execFileSync('git',args,{cwd,encoding:'utf8'}).trim();
const script=resolve(import.meta.dirname,'structural-reconcile-all-branches.mjs');
test('full CLI: refs, blob modes, unrelated histories, fail-closed remote drift',()=>{
  const root=mkdtempSync(join(tmpdir(),'ce-base-first-'));
  try{
    const bare=join(root,'remote.git'),work=join(root,'work'),audit=join(root,'audit');
    git(root,'init','--bare','-q',bare);git(root,'clone','-q',bare,work);
    git(work,'config','user.email','t@example.invalid');git(work,'config','user.name','T');
    git(work,'checkout','-qb','main');writeFileSync(join(work,'same'),'baseline');
    git(work,'add','.');git(work,'commit','-qm','main');git(work,'push','-q','-u','origin','main');
    git(bare,'symbolic-ref','HEAD','refs/heads/main');
    git(work,'checkout','-qb','integration/structural-overlay-20261101');
    writeFileSync(join(work,'only-overlay'),'a');git(work,'add','.');git(work,'commit','-qm','overlay');git(work,'push','-q','-u','origin','integration/structural-overlay-20261101');
    git(work,'checkout','-qb','feature','main');writeFileSync(join(work,'same'),'branch changed');writeFileSync(join(work,'only-feature'),'b');
    git(work,'add','.');git(work,'commit','-qm','feature');git(work,'push','-q','-u','origin','feature');
    git(work,'checkout','--orphan','unrelated');git(work,'rm','-rfq','.');writeFileSync(join(work,'unrelated-file'),'not linked');
    git(work,'add','.');git(work,'commit','-qm','unrelated');git(work,'push','-q','-u','origin','unrelated');
    git(root,'clone','-q','-b','integration/structural-overlay-20261101',bare,audit);
    git(audit,'fetch','-q','origin','+refs/heads/*:refs/remotes/origin/*');
    const output=join(root,'evidence','report.json');
    const stdout=execFileSync('node',[script,'--output',output],{cwd:audit,encoding:'utf8'});
    const report=JSON.parse(readFileSync(output,'utf8'));
    assert.equal(report.branchCount,4);assert.equal(report.branchesAudited,3);
    assert.equal(JSON.parse(stdout).result,'CANDIDATE_HOLD');
    const feature=report.sources.find(x=>x.branch==='feature');
    assert.equal(feature.summary.collision,1);assert.equal(feature.summary.sourceOnly,1);assert.equal(feature.summary.candidateOnly,1);
    assert.equal(report.sources.find(x=>x.branch==='unrelated').classification,'UNRELATED_HISTORY');
    git(work,'checkout','-q','feature');writeFileSync(join(work,'only-feature'),'changed again');
    git(work,'add','.');git(work,'commit','-qm','advance');git(work,'push','-q','origin','feature');
    const failed=spawnSync('node',[script,'--output',output],{cwd:audit,encoding:'utf8'});
    assert.notEqual(failed.status,0);assert.match(failed.stderr,/REF_NOT_FETCHED_OR_CHANGED|INCOMPLETE_LOCAL_REF_COVERAGE/);
  }finally{rmSync(root,{recursive:true,force:true});}
});
