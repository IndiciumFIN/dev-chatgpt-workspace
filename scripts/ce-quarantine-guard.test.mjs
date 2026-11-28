import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';

const guard = resolve('scripts/ce-quarantine-guard.mjs');
const run = (cwd, command, args) => spawnSync(command, args, { cwd, encoding: 'utf8', env: {...process.env, CE_QUARANTINE_ROOT: cwd}});
const git = (cwd,...args) => execFileSync('git',args,{cwd,encoding:'utf8'}).trim();

test('quarantine is inert, exact, bounded and fail-closed', () => {
  const root = mkdtempSync(join(tmpdir(),'ce-quarantine-test-'));
  try {
    git(root,'init','-q');
    const dest = '_quarantine/ce/calculadoras/pilot/candidate.ts';
    mkdirSync(join(root,'_quarantine/ce/manifests'),{recursive:true});
    mkdirSync(join(root,'_quarantine/ce/calculadoras/pilot'),{recursive:true});
    mkdirSync(join(root,'src'),{recursive:true});
    writeFileSync(join(root,dest),'export const candidate = true;\n');
    writeFileSync(join(root,'_quarantine/ce/README.md'),'inert\n');
    writeFileSync(join(root,'.vercelignore'),'_quarantine/\n');
    writeFileSync(join(root,'src/index.ts'),'export const active = true;\n');
    const sha=git(root,'hash-object','--',dest);
    const manifest={protocol:'CE.QUARANTINE.STAGING.v1',runtime_admission:false,release_eligible:false,entries:[{destination:dest,source_git_blob_sha:sha,source_commit_sha:'a'.repeat(40),source_mode:'100644',state:'STAGED_PENDING_REVIEW',runtime_admission:false,release_eligible:false}]};
    writeFileSync(join(root,'_quarantine/ce/manifests/index.v1.json'),JSON.stringify(manifest));
    git(root,'add','.');
    const check=()=>run(root,process.execPath,[guard]);
    assert.equal(check().status,0,'valid quarantine must pass');
    writeFileSync(join(root,dest),'export const candidate = false;\n');
    assert.notEqual(check().status,0,'byte drift must fail');
    writeFileSync(join(root,dest),'export const candidate = true;\n');
    writeFileSync(join(root,'src/index.ts'),"import x from '../_quarantine/ce/calculadoras/pilot/candidate.ts';\n");
    assert.notEqual(check().status,0,'runtime reference must fail');
    writeFileSync(join(root,'src/index.ts'),'export const active = true;\n');
    writeFileSync(join(root,'_quarantine/ce/calculadoras/pilot/extra.txt'),'surprise\n');
    git(root,'add','.');
    assert.notEqual(check().status,0,'unregistered candidate must fail');
    rmSync(join(root,'_quarantine/ce/calculadoras/pilot/extra.txt'));
    git(root,'add','-u');
    writeFileSync(join(root,'.vercelignore'),'other/\n');
    assert.notEqual(check().status,0,'missing deploy exclusion must fail');
  } finally { rmSync(root,{recursive:true,force:true}); }
});

test('literal TanStack route names and original regular-file modes are preserved', () => {
  const root = mkdtempSync(join(tmpdir(),'ce-quarantine-modes-'));
  try {
    git(root,'init','-q');
    const dest = '_quarantine/ce/kernel/pilot/blog.$slug.tsx';
    const manifestPath = '_quarantine/ce/manifests/index.v1.json';
    mkdirSync(join(root,'_quarantine/ce/manifests'),{recursive:true});
    mkdirSync(join(root,'_quarantine/ce/kernel/pilot'),{recursive:true});
    writeFileSync(join(root,dest),'export const inert = true;\n');
    writeFileSync(join(root,'.vercelignore'),'_quarantine/\n');
    const sha=git(root,'hash-object','--',dest);
    const entry={destination:dest,source_git_blob_sha:sha,source_commit_sha:'a'.repeat(40),source_mode:'100755',state:'STAGED_PENDING_REVIEW',runtime_admission:false,release_eligible:false};
    const manifest={protocol:'CE.QUARANTINE.STAGING.v1',runtime_admission:false,release_eligible:false,entries:[entry]};
    const save=()=>writeFileSync(join(root,manifestPath),JSON.stringify(manifest));
    const check=()=>run(root,process.execPath,[guard]);
    save(); git(root,'add','.'); git(root,'update-index','--chmod=+x','--',dest);
    assert.equal(check().status,0,'literal dollar and original executable bit must pass');
    entry.source_mode='100644'; save();
    assert.match(check().stderr,/index blob\/mode drift/);
    entry.source_mode='120000'; save();
    assert.match(check().stderr,/invalid source regular-file mode/);
    delete entry.source_mode; save();
    assert.match(check().stderr,/invalid source regular-file mode/);
    entry.source_mode='100755';
    for (const path of ['_quarantine/ce/kernel/../outside.ts','_quarantine/ce/kernel//pilot/blog.ts','_quarantine/ce/kernel/pilot/*.ts']) {
      entry.destination=path; save(); assert.match(check().stderr,/invalid candidate path/);
    }
    entry.destination=dest; save();
    assert.equal(check().status,0,'restored manifest must pass');
  } finally { rmSync(root,{recursive:true,force:true}); }
});
