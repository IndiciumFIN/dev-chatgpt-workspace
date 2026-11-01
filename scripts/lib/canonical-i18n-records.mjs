import { createHash } from 'node:crypto';
import {
  normalizeCanonicalJson,
  normalizedJsonEvidence,
} from './semantic-collision-audit.mjs';

export function canonicalizeEquivalentDraft({
  path,
  blobs,
  readBlob,
  expectedSemanticSha256,
}) {
  if (
    !Array.isArray(blobs) ||
    blobs.length < 2 ||
    typeof readBlob !== 'function' ||
    !/^[a-f0-9]{64}$/.test(expectedSemanticSha256 ?? '')
  ) {
    throw new Error('INVALID_CANONICALIZATION_EVIDENCE');
  }

  const sourceBlobs = [...new Set(blobs)].sort();
  if (sourceBlobs.length < 2) throw new Error('INSUFFICIENT_SOURCE_VARIANTS');

  let canonicalJson;
  for (const blob of sourceBlobs) {
    if (!/^[a-f0-9]{40,64}$/.test(blob)) throw new Error('INVALID_SOURCE_BLOB');
    const raw = readBlob(blob);
    const evidence = normalizedJsonEvidence(path, raw);
    if (evidence.hash !== expectedSemanticSha256) {
      throw new Error('SEMANTIC_HASH_MISMATCH');
    }
    if (evidence.status !== 'DRAFT' || evidence.translationStatus !== 'DRAFT') {
      throw new Error('RECORD_NOT_UNAPPROVED_DRAFT');
    }

    const serialized = `${JSON.stringify(
      normalizeCanonicalJson(JSON.parse(raw)),
      null,
      2,
    )}\n`;
    if (canonicalJson !== undefined && canonicalJson !== serialized) {
      throw new Error('CANONICAL_SERIALIZATION_MISMATCH');
    }
    canonicalJson = serialized;
  }

  return {
    content: canonicalJson,
    contentSha256: createHash('sha256').update(canonicalJson).digest('hex'),
    semanticSha256: expectedSemanticSha256,
    sourceBlobs,
  };
}
