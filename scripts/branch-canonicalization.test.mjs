import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseTreeEntries,
  summarizePath,
} from './lib/branch-canonicalization.mjs';

const commitA = 'a'.repeat(40);
const commitB = 'b'.repeat(40);
const blobA = { mode: '100644', type: 'blob', oid: 'c'.repeat(40) };
const blobB = { mode: '100755', type: 'blob', oid: 'd'.repeat(40) };

test('tree parser retains mode, blob identity, and non-ASCII paths', () => {
  const tree = parseTreeEntries(
    Buffer.from(
      `100644 blob ${blobA.oid}\tconteúdo/enfermagem.json\0` +
        `100755 blob ${blobB.oid}\tscripts/a.sh\0`,
    ),
  );
  assert.deepEqual(tree.get('conteúdo/enfermagem.json'), blobA);
  assert.deepEqual(tree.get('scripts/a.sh'), blobB);
  assert.throws(() => parseTreeEntries(Buffer.from('invalid\0')), /MALFORMED_LS_TREE/);
});

test('identical source versions expose the reusable canonical bytes', () => {
  const summary = summarizePath({
    path: 'src/shared.ts',
    baselineEntry: null,
    candidateEntry: blobA,
    sourceEntries: [
      { branch: 'source-a', commit: commitA, comparisonBaseCommit: commitB, comparisonBaseEntry: null, entry: blobA },
      { branch: 'source-b', commit: commitB, comparisonBaseCommit: commitA, comparisonBaseEntry: null, entry: blobA },
    ],
  });
  assert.equal(summary.sourceBranchesAgree, true);
  assert.equal(summary.sourceVersionCount, 1);
  assert.deepEqual(summary.commonSourceEntry, blobA);
  assert.equal(summary.candidateMatchesCommonSource, true);
});

test('different source versions remain visible instead of selecting a winner', () => {
  const summary = summarizePath({
    path: 'src/conflict.ts',
    baselineEntry: null,
    candidateEntry: blobA,
    sourceEntries: [
      { branch: 'source-a', commit: commitA, comparisonBaseCommit: commitB, comparisonBaseEntry: null, entry: blobA },
      { branch: 'source-b', commit: commitB, comparisonBaseCommit: commitA, comparisonBaseEntry: null, entry: blobB },
    ],
  });
  assert.equal(summary.sourceBranchesAgree, false);
  assert.equal(summary.commonSourceEntry, null);
  assert.equal(summary.candidateMatchesAnySource, true);
});

test('unanimous deletion is represented separately from a missing blob', () => {
  const summary = summarizePath({
    path: 'obsolete.ts',
    baselineEntry: blobA,
    candidateEntry: blobA,
    sourceEntries: [
      { branch: 'source-a', commit: commitA, comparisonBaseCommit: commitB, comparisonBaseEntry: blobA, entry: null },
      { branch: 'source-b', commit: commitB, comparisonBaseCommit: commitA, comparisonBaseEntry: blobA, entry: null },
    ],
  });
  assert.equal(summary.sourceBranchesAgree, true);
  assert.equal(summary.commonSourceEntry, null);
  assert.equal(summary.candidateMatchesCommonSource, false);
  assert.equal(summary.candidateMatchesAnySource, false);
});

test('source path lineage is required for every comparison', () => {
  assert.throws(
    () =>
      summarizePath({
        path: 'src/conflict.ts',
        baselineEntry: null,
        candidateEntry: null,
        sourceEntries: [{
          branch: 'source-a',
          commit: 'invalid',
          comparisonBaseCommit: commitB,
          comparisonBaseEntry: null,
          entry: blobA,
        }],
      }),
    /INVALID_SOURCE_LINEAGE/,
  );
});
