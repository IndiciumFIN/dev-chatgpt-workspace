import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const root = resolve(process.env.CE_QUARANTINE_ROOT || process.cwd());
const read = path => readFileSync(join(root, path), 'utf8');
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const fail = message => { throw new Error('CE_QUARANTINE_GUARD: ' + message); };
const manifest = JSON.parse(read('_quarantine/ce/manifests/index.v1.json'));
if (manifest.protocol !== 'CE.QUARANTINE.STAGING.v1' || !Array.isArray(manifest.entries)) fail('manifest format');
if (!manifest.release_eligible && manifest.runtime_admission === false) {
  // Explicitly denied by default.
} else fail('manifest must remain inactive');

const expected = new Set();
for (const entry of manifest.entries) {
  const path = entry.destination;
  if (typeof path !== 'string' || !/^_quarantine\/ce\/(calculadoras|kernel|conteudos|interfaces|migrations)\/[a-zA-Z0-9._/$-]+$/.test(path) || path.includes('..') || path.split('/').some(segment => !segment || segment === '.')) fail('invalid candidate path');
  if (expected.has(path)) fail('duplicate candidate');
  expected.add(path);
  if (entry.state !== 'STAGED_PENDING_REVIEW' || entry.runtime_admission !== false || entry.release_eligible !== false) fail('candidate not inactive');
  if (!/^[0-9a-f]{40}$/.test(entry.source_git_blob_sha) || !/^[0-9a-f]{40}$/.test(entry.source_commit_sha)) fail('source hashes missing');
  if (!['100644','100755'].includes(entry.source_mode)) fail('invalid source regular-file mode');
  if (!existsSync(join(root, path))) fail('candidate missing: ' + path);
  if (git('hash-object', '--', path) !== entry.source_git_blob_sha) fail('Git blob drift: ' + path);
  const staged = git('ls-files', '-s', '--', path);
  if (staged !== entry.source_mode + ' ' + entry.source_git_blob_sha + ' 0\t' + path) fail('index blob/mode drift: ' + path);
}
const tracked = git('ls-files', '-z', '--', '_quarantine/ce').split('\0').filter(Boolean);
for (const path of tracked) {
  if (path === '_quarantine/ce/README.md' || path === '_quarantine/ce/manifests/index.v1.json') continue;
  if (!expected.has(path)) fail('unregistered candidate: ' + path);
}
if (tracked.filter(p => expected.has(p)).length !== expected.size) fail('candidate count mismatch');
if (!/^[ \t]*_quarantine\/[ \t]*$/m.test(read('.vercelignore'))) fail('Vercel isolation missing');
const folders = ['src','server','public','apps','packages','tools'].filter(p => existsSync(join(root,p)));
if (folders.length) {
  const result = spawnSync('git', ['grep','-n','-I','-F','_quarantine/ce/','--',...folders], {cwd:root,encoding:'utf8'});
  if (result.status === 0) fail('runtime source references quarantine: ' + result.stdout.slice(0, 350));
  if (result.status !== 1) fail('runtime import scan failed: ' + result.stderr);
}
console.log('PASS CE_QUARANTINE_GUARD candidates=' + expected.size + ' build=excluded runtime=unreferenced Git=exact');
