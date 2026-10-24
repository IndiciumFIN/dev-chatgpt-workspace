import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const contract = resolve(root, 'registers/canonical/surface-contracts.v2.json');
const old = readFileSync(contract, 'utf8');

const result = spawnSync(process.execPath, ['scripts/audit-surface-bindings-v2.mjs'], {
  cwd: root,
  encoding: 'utf8',
});
if (result.status !== 0) throw Error('expected baseline PASS ' + result.stderr);

let restoreError;
try {
  const data = JSON.parse(old);
  delete data.entries['admin.tsx'];
  writeFileSync(contract, JSON.stringify(data));

  const negative = spawnSync(process.execPath, ['scripts/audit-surface-bindings-v2.mjs'], {
    cwd: root,
    encoding: 'utf8',
  });
  if (negative.status === 0 || !negative.stderr.includes('UNKNOWN_ROUTE')) {
    throw Error('FAIL-OPEN: unknown route was accepted');
  }
  console.log('PASS: unregistered route blocked');
} finally {
  writeFileSync(contract, old);
  const replay = spawnSync(process.execPath, ['scripts/audit-surface-bindings-v2.mjs'], {
    cwd: root,
    encoding: 'utf8',
  });
  if (replay.status !== 0) {
    restoreError = Error('restore failed: ' + replay.stderr);
  }
}

if (restoreError) {
  throw restoreError;
}
