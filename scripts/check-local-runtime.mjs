#!/usr/bin/env node
// No network calls, no remote integrations. Diagnostic only; fails closed.
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const root = resolve(import.meta.dirname, '..');
const path = (...parts) => join(root, ...parts);
const checks = [];
const check = (id, ok, reason) => checks.push({id, status: ok ? 'PASS' : 'FAIL', detail: reason});
const pkg = JSON.parse(readFileSync(path('package.json'), 'utf8'));
const lockBytes = existsSync(path('package-lock.json')) ? readFileSync(path('package-lock.json')) : null;
const lock = lockBytes ? JSON.parse(lockBytes.toString()) : null;
const declared = {...pkg.dependencies, ...pkg.devDependencies};
check('lock-present', !!lock, 'package-lock.json must be present');
check('lock-version', !!lock && [2,3].includes(lock.lockfileVersion), `found ${lock?.lockfileVersion ?? 'none'}`);
const roots = lock?.packages?.[''] || {};
const mismatches = Object.entries(declared).filter(([name, spec]) => roots.dependencies?.[name] !== spec && roots.devDependencies?.[name] !== spec);
check('lock-root-specs', mismatches.length === 0 && !!lock, mismatches.length ? `spec mismatch: ${mismatches.map(([k])=>k).join(', ')}` : 'root dependency specifications agree');
const missingLock = Object.keys(declared).filter(name => !lock?.packages?.[`node_modules/${name}`]);
check('lock-resolutions', missingLock.length === 0, missingLock.length ? missingLock.join(', ') : 'all top-level packages represented');
const packages = ['vite','typescript','react','react-dom','@tanstack/react-router'];
for (const name of packages) {
  const rootPkg = path('node_modules', name, 'package.json');
  check(`installed:${name}`, existsSync(rootPkg), existsSync(rootPkg) ? 'local package exists' : 'missing (no installation attempted)');
}
const binaries = [['vite','node_modules/vite/bin/vite.js'],['tsc','node_modules/typescript/bin/tsc']];
for (const [name, file] of binaries) check(`binary:${name}`, existsSync(path(file)), existsSync(path(file)) ? 'local executable exists' : 'missing');
const cmd = spawnSync('node', ['scripts/check-isolation.mjs'], {cwd:root, encoding:'utf8', timeout:10000});
check('remote-integration-block', cmd.status === 0, cmd.status === 0 ? 'isolated validator passed' : `${cmd.status ?? 'no-exit'} ${cmd.stderr?.slice(0,400)}`);
const structuralPass = checks.filter(c=>!c.id.startsWith('installed:') && !c.id.startsWith('binary:')).every(c=>c.status==='PASS');
const runtimeReady = checks.every(c=>c.status==='PASS');
const result = {version:'1.0.0', source:'BACKUP_ONLY', generatedAt:new Date().toISOString(), lockfileSha256:lockBytes?createHash('sha256').update(lockBytes).digest('hex'):null, structuralPass, runtimeReady, capturedScreenshots:0, checks};
if (process.argv.includes('--write-report')) { mkdirSync(path('audit','execution'),{recursive:true}); writeFileSync(path('audit','execution','local-runtime-latest.json'), JSON.stringify(result,null,2)+'\n'); }
console.log(JSON.stringify(result,null,2));
if (!runtimeReady) process.exitCode = 1;
