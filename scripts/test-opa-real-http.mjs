/**
 * OPA REST integration test with a loopback-only, ephemeral OPA process.
 * No endpoint publication, remote permissions or database access.
 */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createOpaImportReadEvaluator } from '../src/core/governance/import-opa-read.server.ts';

const binary = process.argv[2];
if (!binary) throw new Error('Provide a SHA256-verified OPA executable path.');
const root = await mkdtemp(join(tmpdir(), 'cko-opa-http-'));
const address = 'http://127.0.0.1:18181';
const policy = 'contracts/cko-governance/opa/import_read.rego';
const expectedBundleSha256 = 'b'.repeat(64);
const fixture = {
  cko_trusted: {
    bundle_sha256: expectedBundleSha256,
    import_read_grants: { 'verified-ci-actor': { sources: true } },
  },
};
const input = {
  actorId: 'verified-ci-actor',
  profileId: 'sources',
  destination: 'cko_evidence.sources',
  sourceSha256: 'a'.repeat(64),
  recordCount: 3,
};
let processLog = '';
let child;
try {
  const file = join(root,'trusted-data.json');
  await writeFile(file, JSON.stringify(fixture), { mode: 0o600 });
  child = spawn(binary, [
    'run','--server','--addr',address,
    '--set','decision_logs.console=true',
    '--data',policy,'--data',file,
  ], { stdio: ['ignore','pipe','pipe'] });
  child.stdout.on('data', part => {processLog = (processLog + String(part)).slice(-6000);});
  child.stderr.on('data', part => {processLog = (processLog + String(part)).slice(-6000);});
  let ready = false;
  for (let i=0; i<50; i++) {
    if (child.exitCode!==null) throw new Error('OPA exited during startup: ' + processLog);
    try {
      const response = await fetch(address+'/health', {signal: AbortSignal.timeout(750)});
      if (response.ok) {ready = true;break;}
    } catch { /* startup in progress */ }
    await new Promise(resolve => setTimeout(resolve,100));
  }
  assert.ok(ready,'OPA loopback server did not start: '+processLog);
  // Test-only HTTPS-to-loopback shim. Production adapter still forbids HTTP.
  const evaluator = createOpaImportReadEvaluator({
    endpoint:'https://opa-ci-only.invalid/v1/data/cko/import_read',
    bearerToken:'ci-not-a-credential',
    expectedBundleSha256,
  },async (_endpoint, options) =>
    fetch(address+'/v1/data/cko/import_read', options));

  const positive = await evaluator(input);
  assert.equal(positive.allowed,true,
    'OPA REST must provide allow, decision_id, pinned bundle hash: '+processLog);
  assert.ok(positive.allowed && positive.decisionId.trim());
  const negative = await evaluator({...input,actorId:'imported-untrusted-user'});
  assert.equal(negative.allowed,false,'Unknown actor must be denied');
  const wrongProfile = await evaluator({...input,profileId:'policies',destination:'cko_orch.policy_registry'});
  assert.equal(wrongProfile.allowed,false,'Missing trusted grant must be denied');
  const invalidAction = await fetch(address+'/v1/data/cko/import_read', {
    method:'POST', headers:{'content-type':'application/json'},
    body:JSON.stringify({input:{
      actor_id:input.actorId,action:'imports.reconcile.write',profile_id:'sources',
      destination:input.destination,source_sha256:input.sourceSha256,record_count:3,
    }}),
  });
  assert.ok(invalidAction.ok);
  const payload = await invalidAction.json();
  assert.equal(payload?.result?.allow,false,'OPA must deny write escalation');
  console.log('PASS OPA REAL REST: decision_id, scoped read, unknown actor denial, absent grant denial, write denial.');
} finally {
  if (child) {
    child.kill('SIGTERM');
    await new Promise(resolve => {
      if (child.exitCode !== null) return resolve();
      child.once('exit',resolve);
      setTimeout(resolve,1500);
    });
  }
  await rm(root,{recursive:true,force:true});
}
