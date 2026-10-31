import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// Isolate fixtures: never mutate the canonical PMO or invoke external services.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const validator = join(root, 'scripts/check-pmo-queue.mjs');
const files = [
  'registers/pmo/queue.v1.json',
  'src/components/admin/commander-panel.tsx',
  'src/components/admin/admin-console.tsx',
  'src/components/admin/pmo-panel.tsx'
];
function exercise(mutate = () => {}) {
  const cwd = mkdtempSync(join(tmpdir(), 'ce-pmo-negative-'));
  try {
    for (const path of files) {
      mkdirSync(dirname(join(cwd, path)), { recursive: true });
      copyFileSync(join(root, path), join(cwd, path));
    }
    const queuePath = join(cwd, files[0]);
    const queue = JSON.parse(readFileSync(queuePath, 'utf8'));
    mutate(queue, cwd);
    writeFileSync(queuePath, JSON.stringify(queue, null, 2));
    return spawnSync(process.execPath, [validator], { cwd, encoding: 'utf8', timeout: 15000 });
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}
function rejected(run, reason) {
  assert.notEqual(run.status, 0, 'unsafe fixture was accepted');
  assert.match((run.stderr ?? '') + (run.stdout ?? ''), reason);
}
test('authorized local Commander and current PMO pass', () => {
  const run = exercise();
  assert.equal(run.status, 0, (run.stderr ?? '') + (run.stdout ?? ''));
});
test('DONE with unfinished dependency is rejected', () => {
  const run = exercise(q => {
    const item = q.items.find(x => x.id === 'WO-CKO-001');
    item.status = 'DONE';
    item.evidence.push('https://github.com/IndiciumFIN/dev-chatgpt-workspace/commit/ce0fc13aa45d88efb29d38a0a385377d490c5168');
  });
  rejected(run, /DONE com dependência pendente/);
});
test('cycle between two unfinished work orders is rejected', () => {
  const run = exercise(q => {
    q.items.find(x => x.id === 'WO-GOV-TRANS-001').dependencies.push('WO-CKO-001');
  });
  rejected(run, /Ciclo de dependências/);
});
test('Commander without documented owner authorization is rejected', () => {
  const run = exercise(q => {
    const ev = [...q.events].reverse().find(x => x.workId === 'WO-ADM-001');
    ev.reason = 'Mudança não autorizada para execução externa no sistema.';
  });
  rejected(run, /Owner-approved local scope is missing/);
});
test('homologation HOLD cannot be silently removed', () => {
  const run = exercise(q => {
    q.items.find(x => x.id === 'WO-HOM-001').status = 'QUEUED';
  });
  rejected(run, /Release HOLD bypassed/);
});
test('Commander cannot add an external fetch call under local-only scope', () => {
  const run = exercise((q, cwd) => {
    const file = join(cwd, 'src/components/admin/commander-panel.tsx');
    writeFileSync(file, readFileSync(file, 'utf8') + '\nfetch("/api/execute");\n');
  });
  rejected(run, /Commander exceeded local-only scope/);
});
