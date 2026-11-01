import { test } from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,symlinkSync,unlinkSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {inspect,gitBlob} from './verify-patch-readiness.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const config={repository:'IndiciumFIN/dev-chatgpt-workspace',branch:'integration/structural-overlay-20261101'};
function fixture() {
 const root=mkdtempSync(join(tmpdir(),'ce-patch-'));
 const mk=(path,value)=>{const p=join(root,path);mkdirSync(dirname(p),{recursive:true});writeFileSync(p,value);};
 const files=[];
 for(let i=0;i<35;i++) {
  const path='docs/mini'+i+'.md';const content=Buffer.from('NEW-'+i);mk('audit/ce-wave1/staged-source/'+path,content);
  const item={path,sha256:sha(content)};
  if(i===0){const old=Buffer.from('OLD');mk(path,old);item.original_git_blob=gitBlob(old)}
  if(i===1){mk(path,content)}
  files.push(item);
 }
 const manifest={version:'0.6.4',baseRepo:config.repository,baseBranch:config.branch,baselineSha:'a'.repeat(40),files};
 return {root,manifest,mk,done:()=>rmSync(root,{recursive:true,force:true})};
}
test('35 original staged blobs classify ADD/REPLACE/ALREADY_IDENTICAL without writing',()=>{
 const x=fixture();try{const r=inspect(x.root,x.manifest);assert.deepEqual(r.counts,{REPLACE:1,ALREADY_IDENTICAL:1,ADD:33});assert.equal(r.writeAuthorized,false);assert.equal(r.items.length,35);}finally{x.done()}
});
test('corrupted source SHA256 blocks',()=>{const x=fixture();try{x.mk('audit/ce-wave1/staged-source/docs/mini0.md','tampered');assert.throws(()=>inspect(x.root,x.manifest),/HOLD_STAGED_SOURCE_HASH_MISMATCH/)}finally{x.done()}});
test('modified existing target blob blocks',()=>{const x=fixture();try{x.mk('docs/mini0.md','TAMPERED');assert.throws(()=>inspect(x.root,x.manifest),/HOLD_TARGET_BLOB_DRIFT/)}finally{x.done()}});
test('missing replacement target blocks',()=>{const x=fixture();try{x.manifest.files[2].original_git_blob='a'.repeat(40);assert.throws(()=>inspect(x.root,x.manifest),/HOLD_REPLACEMENT_TARGET_MISSING/)}finally{x.done()}});
test('manifest count mismatch blocks',()=>{const x=fixture();try{x.manifest.files.pop();assert.throws(()=>inspect(x.root,x.manifest),/HOLD_MANIFEST_CONTRACT_MISMATCH/)}finally{x.done()}});
test('duplicate manifest path blocks',()=>{const x=fixture();try{x.manifest.files[3]={...x.manifest.files[2]};assert.throws(()=>inspect(x.root,x.manifest),/HOLD_DUPLICATE_PATH/)}finally{x.done()}});
test('path traversal blocks',()=>{const x=fixture();try{x.manifest.files[3].path='../secret';assert.throws(()=>inspect(x.root,x.manifest),/HOLD_UNSAFE_RELATIVE_PATH/)}finally{x.done()}});
test('unsafe backslash path blocks',()=>{const x=fixture();try{x.manifest.files[3].path='..\\foo';assert.throws(()=>inspect(x.root,x.manifest),/HOLD_UNSAFE_RELATIVE_PATH/)}finally{x.done()}});
test('unexpected existing file blocks',()=>{const x=fixture();try{x.mk('docs/mini2.md','FOREIGN');assert.throws(()=>inspect(x.root,x.manifest),/HOLD_TARGET_BLOB_DRIFT/)}finally{x.done()}});
test('symlink staged source blocks',()=>{const x=fixture();try{const p=join(x.root,'audit/ce-wave1/staged-source/docs/mini0.md');unlinkSync(p);symlinkSync(join(x.root,'docs/mini0.md'),p);assert.throws(()=>inspect(x.root,x.manifest),/HOLD_SYMLINK_PATH/)}finally{x.done()}});
test('wrong repository blocks',()=>{const x=fixture();try{x.manifest.baseRepo='different';assert.throws(()=>inspect(x.root,x.manifest),/HOLD_MANIFEST_CONTRACT_MISMATCH/)}finally{x.done()}});
test('manifest hash format blocks',()=>{const x=fixture();try{x.manifest.files[5].sha256='abc';assert.throws(()=>inspect(x.root,x.manifest),/HOLD_INVALID_MANIFEST_HASH/)}finally{x.done()}});
