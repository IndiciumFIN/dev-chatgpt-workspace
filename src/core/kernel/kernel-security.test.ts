import { test } from "node:test";
import assert from "node:assert/strict";
import { decide, evaluateCompliance } from "./kernel.ts";
import { signArtifact, type SignedArtifact } from "./signer.ts";
import { canExecute, type ExecutionGate } from "./gate.ts";
import type { PolicyBundle } from "../compliance/policy-bundle.ts";

const gate: ExecutionGate = {
  id: "gate-demo", workOrderId: "WO-GOV-TRANS-001",
  sourceId: "source", toolId: "tool", templateId: "template",
  policyBundleId: "bundle", status: "approved", approvedBy: "reviewer",
  hash: "a".repeat(64)
};
const passed = [{ ok: true, outcome: "approved" }] as const;
const forged: SignedArtifact = {
  artifactId: "gate-demo", artifactType: "gate", status: "approved",
  signer: "kernel", hash: "a".repeat(64),
  signature: "kernel:gate:gate-demo:" + "a".repeat(64),
  createdAt: "2026-11-01T00:00:00Z", policyVersion: "1.0.0",
};
const bundle: PolicyBundle = {
  id: "policy", name: "test", version: "1", normativeIds: ["cso-risk-ownership"],
  owner: "owner", status: "active", createdAt: "2026-11-01T00:00:00Z",
  updatedAt: "2026-11-01T00:00:00Z", hash: "a".repeat(64),
};

test("a gate with no compliance evidence cannot be approved", () => {
  const result = decide(gate, [], [], []);
  assert.equal(result.outcome, "hold");
  assert.equal(result.reason, "missing-compliance-results");
  assert.equal(result.signature, "");
});

test("a gate with compliance PASS but no artifacts is not admitted", () => {
  const result = decide(gate, [], [], [...passed]);
  assert.equal(result.outcome, "hold");
  assert.equal(result.reason, "missing-signed-artifacts");
  assert.equal(result.signature, "");
});

test("a forged kernel-looking signature is never sufficient", () => {
  const result = decide(gate, [forged], [], [...passed]);
  assert.equal(result.outcome, "hold");
  assert.equal(result.reason, "trusted-kernel-admission-verifier-unavailable");
  assert.equal(result.signature, "");
});

test("an invalid gate is rejected and open finding keeps HOLD", () => {
  assert.equal(decide(null, [], [], []).outcome, "rejected");
  assert.equal(decide({ ...gate, status: "draft" }, [], [], []).outcome, "rejected");
  const finding = { id: "FIND-1", status: "open" as const } as import("./findings.ts").Finding;
  assert.equal(decide(gate, [], [finding], [...passed]).reason, "open-finding-exists");
});

test("failed compliance is never promoted by fabricated signature", () => {
  const result = decide(gate, [forged], [], [{ ok: false, outcome: "rejected", reason: "control-failed" }]);
  assert.equal(result.outcome, "rejected");
  assert.equal(result.signature, "");
});

test("legacy signing never invents a cryptographic trust anchor", () => {
  const { signature: _ignored, ...input } = forged;
  assert.throws(() => signArtifact(input), /TRUSTED_KERNEL_SIGNER_NOT_CONFIGURED/);
});

test("missing, inactive, duplicate or unknown normative evidence is a failure", () => {
  assert.equal(evaluateCompliance(null, {})[0].ok, false);
  for (const b of [
    { ...bundle, normativeIds: [] },
    { ...bundle, normativeIds: ["unknown-normative"] },
    { ...bundle, normativeIds: ["cso-risk-ownership", "cso-risk-ownership"] },
    { ...bundle, status: "draft" as const },
  ]) {
    const x = evaluateCompliance(b, {});
    assert.equal(x.length, 1);
    assert.equal(x[0].outcome, "rejected");
  }
  assert.equal(evaluateCompliance(bundle, { "risk-owner": "owner", "risk-register": "register" })[0].ok, true);
  assert.equal(evaluateCompliance(bundle, {})[0].ok, false);
});

test("legacy gate status does not grant execution authority", () => {
  assert.equal(canExecute(null), false);
  assert.equal(canExecute(gate), false);
  assert.equal(canExecute({ ...gate, status: "homologated" }), false);
  assert.equal(canExecute({ ...gate, status: "draft" }), false);
});
