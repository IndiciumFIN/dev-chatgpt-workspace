import type { ExecutionGate } from "./gate";
import type { SignedArtifact } from "./signer";
import type { Finding } from "./findings";
import { getRequiredRules, type PolicyBundle } from "../compliance/policy-bundle.ts";
import { normativeCatalog } from "../compliance/frameworks.ts";
import { validateRequiredEvidence } from "../compliance/validators.ts";

export type ComplianceDecision = {
  ok: boolean;
  reason?: string;
  ruleId?: string;
  outcome: "approved" | "rejected" | "hold";
};

export type KernelDecision = {
  decisionId: string;
  artifactId: string;
  artifactType: string;
  outcome: "approved" | "rejected" | "hold";
  reason: string;
  policyVersion: string;
  signature: string;
  createdAt: string;
};

export function evaluateCompliance(
  policyBundle: PolicyBundle | null,
  evidence: Record<string, unknown>,
): ComplianceDecision[] {
  if (!policyBundle) {
    return [{ ok: false, reason: "missing-policy-bundle", outcome: "rejected" }];
  }
  // Incomplete/unknown normative IDs cannot accidentally yield [] == PASS.
  const ids = policyBundle.normativeIds;
  if (policyBundle.status !== "active" || !Array.isArray(ids) || ids.length === 0 ||
      new Set(ids).size !== ids.length || ids.some(id => !normativeCatalog[id])) {
    return [{ ok: false, reason: "policy-bundle-invalid-or-incomplete", outcome: "rejected" }];
  }
  return getRequiredRules(normativeCatalog, ids).map(rule => {
    const result = validateRequiredEvidence(rule, evidence);
    return { ok: result.ok, reason: result.reason, ruleId: result.ruleId, outcome: result.outcome };
  });
}

/**
 * Legacy DISPLAY result only. Never returns an executable approval unless an
 * independent trusted signature/OPA verifier is wired here and negative-tested.
 * User approval or a gate marked "approved" is insufficient on its own.
 */
export function decide(
  gate: ExecutionGate | null,
  signedArtifacts: SignedArtifact[],
  findings: Finding[],
  complianceResults: ComplianceDecision[] = [],
): KernelDecision {
  const result = (outcome: KernelDecision["outcome"], reason: string): KernelDecision => ({
    decisionId: `decision:${Date.now()}`,
    artifactId: gate?.id ?? "missing-gate",
    artifactType: "gate",
    outcome,
    reason,
    policyVersion: "1.0.0",
    signature: "", // Explicitly UNSIGNED. Never emit a fabricated kernel signature.
    createdAt: new Date().toISOString(),
  });
  if (!gate || (gate.status !== "homologated" && gate.status !== "approved")) {
    return result("rejected", "gate-not-homologated");
  }
  if (!Array.isArray(findings) || findings.some(f => f.status !== "resolved" && f.status !== "closed")) {
    return result("hold", "open-finding-exists");
  }
  if (!Array.isArray(complianceResults) || complianceResults.length === 0) {
    return result("hold", "missing-compliance-results");
  }
  const failed = complianceResults.find(r => !r.ok);
  if (failed) {
    return result(failed.outcome === "approved" ? "hold" : failed.outcome,
      failed.reason ?? "compliance-check-failed");
  }
  if (!Array.isArray(signedArtifacts) || signedArtifacts.length === 0) {
    return result("hold", "missing-signed-artifacts");
  }
  // No trusted public key, revocation check or authenticated OPA decision is
  // bound to this legacy function. A plausible string is NOT a signature.
  return result("hold", "trusted-kernel-admission-verifier-unavailable");
}
