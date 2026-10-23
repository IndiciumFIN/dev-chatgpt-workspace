#!/usr/bin/env node
// Read-only, fail-closed preflight: never substitutes for actual compilation/rendering.
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { lookup } from 'node:dns/promises';
import { createHash } from 'node:crypto';
const root = resolve(import.meta.dirname, '..');
const args = new Set(process.argv.slice(2));
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const lockPath = join(root, 'package-lock.json');
const checks = [];
const add = (id, pass, detail) => checks.push({ id, pass, detail });
const lock = existsSync(lockPath) ? JSON.parse(readFileSync(lockPath, 'utf8')) : null;
add('lockfile-present', !!lock, lock ? 'package-lock.json exists' : 'missing lockfile');
add('lockfile-version', !!lock && [2,3].includes(lock.lockfileVersion), `lockfileVersion: ${lock?.lockfileVersion ?? 'none'}`);
const rootLock = lock?.packages?.[''];
const declared = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
const missing = Object.keys(declared).filter(n => !lock?.packages?.[`node_modules/${n}`]);
add('lockfile-dependency-coverage', !!rootLock && missing.length === 0, missing.length ? `missing entries: ${missing.join(', ')}` : 'all direct dependencies have lockfile package entries');
const nodeModules = join(root, 'node_modules');
add('node-modules-present', existsSync(nodeModules), existsSync(nodeModules) ? 'directory present' : 'dependencies not installed');
for (const [name, path] of [['vite','node_modules/vite/bin/vite.js'], ['typescript','node_modules/typescript/bin/tsc'], ['react','node_modules/react/package.json']]) {
  add(`runtime-${name}`, existsSync(join(root, path)), existsSync(join(root, path)) ? 'installed' : 'not installed');
}
add('remote-integration-disabled', existsSync(join(root, 'scripts/check-isolation.mjs')), 'isolation validator must be executed separately; this check is not a proof of isolation');
if (args.has('--network')) {
  try { const dns = await lookup('registry.npmjs.org'); add('npm-registry-dns', true, `registry resolves (${dns.family === 4 ? 'IPv4' : 'IPv6'})`); }
  catch (error) { add('npm-registry-dns', false, `${error.code ?? 'DNS_ERROR'}: registry.npmjs.org unreachable`); }
}
const report = {
  schemaVersion: '1.0.0',
  generatedAt: new Date().toISOString(),
  sourceScope: 'BACKUP_ONLY',
  remoteIntegrationAllowed: false,
  lockfileSha256: lock ? createHash('sha256').update(readFileSync(lockPath)).digest('hex') : null,
  checks,
  readyForBuild: checks.filter(x => !['remote-integration-disabled','npm-registry-dns'].includes(x.id)).every(x => x.pass),
  rendered: false,
  visualAuditPassed: false,
};
if (args.has('--write-report')) {
  const dir = join(root, 'audit', 'execution'); mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'render-readiness-latest.json'), JSON.stringify(report, null, 2)+'\n');
}
console.log(JSON.stringify(report, null, 2));
if (!report.readyForBuild) process.exitCode = 1;
