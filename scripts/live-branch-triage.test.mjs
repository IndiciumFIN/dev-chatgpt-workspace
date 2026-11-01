import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLiveBranchTriage } from './lib/live-branch-triage.mjs';

const commitA = 'a'.repeat(40);
const commitB = 'b'.repeat(40);
const fileA = { mode: '100644', type: 'blob', oid: 'c'.repeat(40) };

function report(records, equivalent = []) {
  return {
    reportType: 'READ_ONLY_BRANCH_CANONICALIZATION_INVENTORY',
    generatedAt: '2026-11-01T00:00:00.000Z',
    baseline: { ref: 'refs/remotes/origin/main', commit: commitA },
    candidate: { branch: 'integration/candidate', commit: commitB },
    sourceBranches: [{ name: 'source-a' }, { name: 'source-b' }],
    semanticI18n: { equivalent },
    records,
  };
}

function record(path, sourceEntries, sourceVersionCount, candidateEntry = null) {
  return {
    path,
    sourceEntries,
    sourceVersionCount,
    baselineEntry: null,
    candidateEntry,
  };
}

test('triages current source conflicts without admitting semantic matches or deletion', () => {
  const localePath = 'registers/i18n/incoming/de/contracts/interface__enter.json';
  const authPath = 'src/lib/auth/server.ts';
  const result = buildLiveBranchTriage(
    report(
      [
        record(
          localePath,
          [
            { branch: 'source-a', commit: commitA, comparisonBaseCommit: commitA, comparisonBaseEntry: null, entry: fileA },
            { branch: 'source-b', commit: commitB, comparisonBaseCommit: commitA, comparisonBaseEntry: null, entry: { ...fileA, oid: 'd'.repeat(40) } },
          ],
          2,
          fileA,
        ),
        record(
          authPath,
          [
            { branch: 'source-a', commit: commitA, comparisonBaseCommit: commitA, comparisonBaseEntry: fileA, entry: null },
            { branch: 'source-b', commit: commitB, comparisonBaseCommit: commitA, comparisonBaseEntry: fileA, entry: fileA },
          ],
          2,
        ),
      ],
      [{ path: localePath }],
    ),
  );
  assert.equal(result.counts.total, 2);
  assert.equal(result.counts.semanticEquivalentNotAdmitted, 1);
  assert.equal(result.counts.requiringReconciliation, 1);
  assert.equal(result.counts.formallyApproved, 0);
  assert.equal(result.items.find(item => item.path === localePath).decision, 'NOT_APPROVED');
  assert.ok(result.items.find(item => item.path === authPath).sourceVersions.some(x => x.version === 'DELETED'));
  assert.equal(result.releaseGate, 'HOLD_HUMAN');
  assert.equal(result.mainUpdated, false);
});

test('rejects source suggestions without lineage evidence', () => {
  const path = 'src/components/site/shell.tsx';
  assert.throws(
    () =>
      buildLiveBranchTriage(
        report([
          record(
            path,
            [
              { branch: 'unrelated', commit: commitA, comparisonBaseCommit: commitA, comparisonBaseEntry: null, entry: fileA },
              { branch: 'other', commit: commitB, comparisonBaseCommit: commitA, comparisonBaseEntry: null, entry: { ...fileA, oid: 'd'.repeat(40) } },
            ],
            2,
          ),
        ]),
      ),
    /CANDIDATE_SOURCE_NOT_IN_CONFLICT/,
  );
});
