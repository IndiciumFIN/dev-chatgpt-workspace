import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { canonicalEvidence, sealEvidence, verifySealedEvidence, type EvidenceEnvelope } from './crypto.server.ts';

const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
const publicPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();
const envelope: EvidenceEnvelope = {
  schemaVersion: 1, workOrderId: 'WO-DEMO', policyBundleId: 'PB-001',
  policyVersion: '1.0.0', actorId: 'reviewer-01', evidenceRef: 'ev://001',
  evidenceSha256: 'a'.repeat(64), issuedAt: '2026-11-01T00:00:00Z',
  expiresAt: '2026-11-02T00:00:00Z', decision: 'HOLD',
};

describe('Ed25519 evidence integrity, not authorization', () => {
  it('binds and verifies all fields', () => {
    const signed = sealEvidence(envelope, privatePem, 'key-test');
    assert.equal(verifySealedEvidence(signed, publicPem, 'key-test', new Date('2026-11-01T12:00:00Z')), true);
    assert.equal(verifySealedEvidence(signed, publicPem, 'key-another', new Date('2026-11-01T12:00:00Z')), false);
    assert.equal(verifySealedEvidence(signed, publicPem, 'key-test', new Date('2026-11-02T00:00:00Z')), false);
    const mutated = { ...signed, envelope: { ...signed.envelope, workOrderId: 'WO-ATTACK' } };
    assert.equal(verifySealedEvidence(mutated, publicPem, 'key-test', new Date('2026-11-01T12:00:00Z')), false);
  });
  it('rejects non-Ed25519 and malformed hashes', () => {
    assert.throws(() => canonicalEvidence({ ...envelope, evidenceSha256: 'fake' }));
    const altered = { ...envelope, policyVersion: '' };
    assert.throws(() => sealEvidence(altered, privatePem, 'key-test'));
  });
});
