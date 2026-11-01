import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { canonicalizeEquivalentDraft } from './lib/canonical-i18n-records.mjs';
import { normalizedJsonEvidence } from './lib/semantic-collision-audit.mjs';

const path = 'registers/i18n/incoming/de/contracts/interface__enter.json';
const blobA = 'a'.repeat(40);
const blobB = 'b'.repeat(40);
const recordA = {
  schema_version: '0.1.0',
  canonical_id: 'cko:i18n:de:interface.enter',
  version: '1.0.0',
  status: 'DRAFT',
  updated_at: '2026-10-24T00:00:00Z',
  provenance_refs: ['b.json', 'a.json'],
  locale: 'de',
  key: 'interface.enter',
  value: 'Anmelden',
  source_locale: 'en',
  translation_status: 'DRAFT',
  clinical_review: { status: 'NOT_REQUIRED' },
  fallback_key: 'interface.enter',
};
const recordB = {
  fallback_key: 'interface.enter',
  clinical_review: { status: 'NOT_REQUIRED' },
  translation_status: 'DRAFT',
  source_locale: 'en',
  value: 'Anmelden',
  key: 'interface.enter',
  locale: 'de',
  provenance_refs: ['a.json', 'b.json'],
  updated_at: '2026-10-24T00:00:00Z',
  status: 'DRAFT',
  version: '1.0.0',
  canonical_id: 'cko:i18n:de:interface.enter',
  schema_version: '0.1.0',
};
const rawByBlob = new Map([
  [blobA, JSON.stringify(recordA)],
  [blobB, JSON.stringify(recordB)],
]);
const semanticSha256 = createHash('sha256')
  .update(
    JSON.stringify({
      canonical_id: recordA.canonical_id,
      clinical_review: recordA.clinical_review,
      fallback_key: recordA.fallback_key,
      key: recordA.key,
      locale: recordA.locale,
      provenance_refs: ['a.json', 'b.json'],
      schema_version: recordA.schema_version,
      source_locale: recordA.source_locale,
      status: recordA.status,
      translation_status: recordA.translation_status,
      updated_at: recordA.updated_at,
      value: recordA.value,
      version: recordA.version,
    }),
  )
  .digest('hex');
const readBlob = blob => rawByBlob.get(blob);

test('canonicalizes equivalent drafts without changing their meaning or approval state', () => {
  const result = canonicalizeEquivalentDraft({
    path,
    blobs: [blobB, blobA],
    readBlob,
    expectedSemanticSha256: semanticSha256,
  });
  const normalized = JSON.parse(result.content);
  assert.deepEqual(normalized.provenance_refs, ['a.json', 'b.json']);
  assert.equal(normalized.status, 'DRAFT');
  assert.equal(normalized.translation_status, 'DRAFT');
  assert.equal(normalized.value, recordA.value);
  assert.equal(result.sourceBlobs.length, 2);
  assert.equal(result.semanticSha256, semanticSha256);
});

test('does not canonicalize a substantive source difference', () => {
  rawByBlob.set(blobB, JSON.stringify({ ...recordB, value: 'Einloggen' }));
  assert.throws(
    () =>
      canonicalizeEquivalentDraft({
        path,
        blobs: [blobA, blobB],
        readBlob,
        expectedSemanticSha256: semanticSha256,
      }),
    /SEMANTIC_HASH_MISMATCH/,
  );
  rawByBlob.set(blobB, JSON.stringify(recordB));
});

test('does not promote approved or partially approved records', () => {
  const approved = { ...recordA, status: 'APPROVED' };
  const rawApproved = JSON.stringify(approved);
  rawByBlob.set(blobA, rawApproved);
  rawByBlob.set(blobB, rawApproved);
  const approvedSemanticSha = normalizedJsonEvidence(path, rawApproved).hash;
  assert.throws(
    () =>
      canonicalizeEquivalentDraft({
        path,
        blobs: [blobA, blobB],
        readBlob,
        expectedSemanticSha256: approvedSemanticSha,
      }),
    /RECORD_NOT_UNAPPROVED_DRAFT/,
  );
  rawByBlob.set(blobA, JSON.stringify(recordA));
  rawByBlob.set(blobB, JSON.stringify(recordB));
});

test('fails closed outside the approved incoming German registry path', () => {
  assert.throws(
    () =>
      canonicalizeEquivalentDraft({
        path: 'registers/i18n/incoming/de/index.json',
        blobs: [blobA, blobB],
        readBlob,
        expectedSemanticSha256: semanticSha256,
      }),
    /PATH_NOT_ALLOWLISTED/,
  );
});
