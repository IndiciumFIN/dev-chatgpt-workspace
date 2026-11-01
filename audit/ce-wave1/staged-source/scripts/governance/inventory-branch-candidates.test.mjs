import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';

const script=resolve(import.meta.dirname,'inventory-branch-candidates.mjs');
const git=(cwd,...args)=>execFileSync('git',args,{cwd,encoding:'utf8'}).trim();
test('full remote refs, stable SHA, collision/missing, no approval',()=>{
 const temp=mkdtempSync(join(tmpdir(),'ce-refs-'));
 try{
  const remote=join(temp,'remote.git'), work=join(temp,'work'),audit=join(temp,'audit');
  git(temp,'init','-q','--bare',remote);git(temp,'clone','-q',remote,work);
  git(work,'config','user.email','test@example.invalid');git(work,'config','user.name','Test');
  git(work,'checkout','-q','-b','main');writeFileSync(join(work,'same.txt'),'original\n');
  git(work,'add','.');git(work,'commit','-qm','base');git(work,'push','-q','-u','origin','main');
  git(work,'checkout','-q','-b','feature');writeFileSync(join(work,'same.txt'),'changed\n');
  writeFileSync(join(work,'new.txt'),'new\n');git(work,'add','.');git(work,'commit','-qm','feature');
  git(work,'push','-q','-u','origin','feature');
  git(temp,'clone','-q','-b','main',remote,audit);
  const out=JSON.parse(execFileSync('node',[script],{cwd:audit,encoding:'utf8'}));
  assert.equal(out.branchCount,2);
  assert.equal(out.branchesAudited,1);
  assert.equal(out.sources[0].branch,'feature');
  assert.equal(out.sources[0].summary.collision,1);
  assert.equal(out.sources[0].summary.missing,1);
  assert.equal(out.releaseGate,'HOLD_HUMAN');
  assert(out.sources[0].candidates.every(x=>x.kernelAdmission==='NOT_VERIFIED'));
  git(work,'checkout','-q','-b','unfetched');git(work,'push','-q','-u','origin','unfetched');
  assert.throws(()=>execFileSync('node',[script],{cwd:audit,stdio:'pipe'}),
    /INCOMPLETE_REF_COVERAGE/);
 }finally{rmSync(temp,{recursive:true,force:true});}
});
