import { test } from "node:test";
import assert from "node:assert/strict";
import { createFinding } from "./findings.ts";

const sample = {
  id: "FIND-TEST-1", workOrderId: "WO-GOV-TRANS-001",
  severity: "blocker" as const,
  title: "Verification missing", description: "No trusted signer provisioned",
  reason: "trusted-evidence-required",
  status: "open" as const, createdBy: "test-reviewer",
  createdAt: "2026-11-01T00:00:00Z",
};
test("finding remains an unsigned draft and preserves provenance", () => {
  const result = createFinding(sample);
  assert.equal(result.hash, "");
  assert.equal(result.signature, "");
  assert.equal(result.workOrderId, sample.workOrderId);
  assert.equal(result.reason, sample.reason);
});
test("draft cannot inherit fabricated hash or signature from untrusted input", () => {
  const data = { ...sample, hash: "a".repeat(64), signature: "kernel:fake" };
  const result = createFinding(data);
  assert.equal(result.hash, "");
  assert.equal(result.signature, "");
});
test("finding refuses missing mandatory evidence fields", () => {
  for(const key of ["id", "reason", "createdBy", "createdAt"] as const) {
    assert.throws(() => createFinding({ ...sample, [key]: "" }), /INVALID_FIND_CANDIDATE/);
  }
});
