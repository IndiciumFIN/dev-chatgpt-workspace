#!/usr/bin/env node
/**
 * CE candidate patch readiness — READ ONLY. No authorization or installer API.
 * Deterministically cross-checks staged source bytes, manifest sha256 and
 * target Git blobs. A success is a placement plan, NEVER permission to apply.
 */
import { createHash } from 'node:crypto';
import { readFileSync, lstatSync, existsSync } from 'node:fs';
import { resolve, join, relative, sep, isAbsolute, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const hex40 = /^[a-f0-9]{40}$/;
const hex64 = /^[a-f0-9]{64}$/;
const sha256 = b => createHash('sha256').update(b).digest('hex');
export const gitBlob = b => createHash('sha1').update(Buffer.from(`blob ${b.length}\0`)).update(b).digest('hex');
export const fail = (reason) => { throw new Error(`HOLD_${reason}`); };

function safeParts(path) {
  if (typeof path !== 'string' || !path || path.includes('\\') || path.includes('\0') || isAbsolute(path) || path.startsWith('/') || path.split('/').some(p=>!p || p==='.' || p==='..')) fail('UNSAFE_RELATIVE_PATH');
  return path.split('/');
}
function safeFile(root, name, allowAbsent=false) {
  const parts=safeParts(name);
  let next=resolve(root);
  for(let i=0;i<parts.length;i++) {
    next=join(next,parts[i]);
    if(!existsSync(next)) {
      // Broken symlinks must also fail; existsSync would return false.
      try{ lstatSync(next); fail('SYMLINK_OR_BROKEN_TARGET'); }catch(e){ if(e.message==='HOLD_SYMLINK_OR_BROKEN_TARGET') throw e; if(e.code!=='ENOENT')throw e; }
      if(!allowAbsent) fail('MISSING_FILE_OR_PARENT');
      return null;
    }
    const st=lstatSync(next);
    if(st.isSymbolicLink())fail('SYMLINK_PATH');
    if(i<parts.length-1 && !st.isDirectory())fail('NON_DIRECTORY_PARENT');
    if(i===parts.length-1 && !st.isFile())fail('NOT_REGULAR_FILE');
  }
  if(!relative(resolve(root),next) || relative(resolve(root),next).startsWith('..'+sep))fail('ROOT_ESCAPE');
  return readFileSync(next);
}
/** manifest is untrusted input until compared with the trusted external archive. */
export function inspect(root, manifest, opts={}) {
  const issues=[];
  const expectedRepo=opts.repository??'IndiciumFIN/dev-chatgpt-workspace';
  const expectedBranch=opts.branch??'integration/structural-overlay-20261101';
  if(manifest?.version!=='0.6.4'||manifest?.baseRepo!==expectedRepo||manifest?.baseBranch!==expectedBranch||!hex40.test(manifest?.baselineSha)||!Array.isArray(manifest?.files)||manifest.files.length!==35)fail('MANIFEST_CONTRACT_MISMATCH');
  const seen=new Set();
  const items=[];
  for(const item of manifest.files) {
    if(typeof item?.path !== 'string')fail('MISSING_PATH');
    safeParts(item.path);
    if(seen.has(item.path))fail('DUPLICATE_PATH');
    seen.add(item.path);
    if(!hex64.test(item.sha256) || (item.original_git_blob!==undefined&&!hex40.test(item.original_git_blob))) fail('INVALID_MANIFEST_HASH');
    const source=safeFile(root,'audit/ce-wave1/staged-source/'+item.path);
    if(sha256(source)!==item.sha256)fail('STAGED_SOURCE_HASH_MISMATCH:'+item.path);
    const target=safeFile(root,item.path,true);
    let status;
    if(target===null) {
      if(item.original_git_blob)fail('REPLACEMENT_TARGET_MISSING:'+item.path);
      status='ADD';
    } else if(gitBlob(target)===gitBlob(source)) {
      status='ALREADY_IDENTICAL';
    } else {
      if(!item.original_git_blob||gitBlob(target)!==item.original_git_blob)fail('TARGET_BLOB_DRIFT:'+item.path);
      status='REPLACE';
    }
    items.push({path:item.path,status,sha256:item.sha256,expectedOriginalBlob:item.original_git_blob??null});
  }
  const counts=items.reduce((a,x)=>(a[x.status]=(a[x.status]??0)+1,a),{});
  return {schemaVersion:1,status:'DRY_RUN_VALID_NO_EXECUTION',repository:expectedRepo,branch:expectedBranch,
    manifestBaseline:manifest.baselineSha,counts,items,writeAuthorized:false,releaseAuthorized:false,
    kernelAdmission:'NOT_CHECKED',issues};
}
function git(root,...args) {
  const r=spawnSync('git',args,{cwd:root,encoding:'utf8',timeout:10000});
  if(r.status!==0||r.error)fail('GIT_COMMAND_FAILED:'+args[0]);
  return r.stdout.trim();
}
function main() {
  if(process.argv.includes('--apply')||process.argv.includes('--write'))fail('NO_EXECUTION_PATH');
  const root=resolve(process.argv[2]??process.cwd());
  if(!existsSync(join(root,'.git')))fail('NOT_FULL_CHECKOUT');
  if(git(root,'branch','--show-current')!=='integration/structural-overlay-20261101')fail('WRONG_CHECKOUT_BRANCH');
  if(git(root,'status','--porcelain'))fail('DIRTY_CHECKOUT');
  const before=git(root,'rev-parse','HEAD');
  const manifest=JSON.parse(safeFile(root,'audit/ce-wave1/executable-package/PATCH_MANIFEST.json'));
  // The archive's manifest SHA is known independently; no archive version can redefine it.
  if(sha256(safeFile(root,'audit/ce-wave1/executable-package/PATCH_MANIFEST.json'))!=='958d5a91229e9ee7b186787a2a28b64e98eeb7e05fe293bf2cb80397b99fd7d2')fail('MANIFEST_ARCHIVE_DIGEST_MISMATCH');
  git(root,'merge-base','--is-ancestor',manifest.baselineSha,'HEAD');
  const report=inspect(root,manifest);
  const after=git(root,'rev-parse','HEAD');
  if(before!==after)fail('HEAD_CHANGED_DURING_AUDIT');
  console.log(JSON.stringify({...report,head:before},null,2));
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try{ main(); }
  catch(e) { console.error(String(e.message)); process.exitCode=2; }
}
