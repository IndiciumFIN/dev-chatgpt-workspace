import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { canExecute, type ExecutionGate } from './gate.ts';
import { signArtifact } from './signer.ts';
import { decide, evaluateCompliance } from './kernel.ts';

const gate: ExecutionGate = {
  id: 'gate-1', workOrderId: 'WO-001', sourceId: 'source', toolId: 'tool',
  templateId: 'template', policyBundleId: 'policy',
  status: 'approved', approvedBy: 'reviewer', hash: 'a'.repeat(64),
};

describe('legacy kernel compatibility MUST fail closed', () => {
  it('cannot convert a flag to tool authorization', () => {
    assert.equal(canExecute(gate), false);
    assert.equal(canExecute(null), false);
  });
  it('cannot fabricate an artifact signature', () => {
    assert.throws(() => signArtifact({
      artifactId: 'artifact', artifactType: 'evidence', status: 'approved',
      signer: 'kernel', hash: 'a'.repeat(64), createdAt: new Date().toISOString(),
      policyVersion: '1.0.0',
    }), /LEGACY_SYNTHETIC_SIGNATURE_DISABLED/);
  });
  it('does not approve even when ALL UI inputs claim success', () => {
    const result = decide(gate, [], [], [{ ok: true, outcome: 'approved', ruleId: 'p-1' }]);
    assert.equal(result.outcome, 'hold');
    assert.equal(result.signature, '');
    assert.equal(result.reason, 'trusted-server-authorization-not-connected');
  });
  it('missing compliance is not approval', () => {
    assert.equal(decide(gate, [], [], []).outcome, 'hold');
    assert.equal(evaluateCompliance(null, {}).at(0)?.outcome, 'rejected');
  });
  it('rejects missing gate', () => {
    assert.equal(decide(null, [], [], []).outcome, 'rejected');
  });
});
