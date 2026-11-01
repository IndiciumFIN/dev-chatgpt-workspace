import type { ExecutionGate } from "./gate";
import type { SignedArtifact } from "./signer";
import type { Finding } from "./findings";
import { getRequiredRules, type PolicyBundle } from "../compliance/policy-bundle";
import { normativeCatalog } from "../compliance/frameworks";
import { validateRequiredEvidence } from "../compliance/validators";

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
    return [{
      ok: false,
      reason: "missing-policy-bundle",
      outcome: "rejected",
    }];
  }

  const rules = getRequiredRules(normativeCatalog, policyBundle.normativeIds);

  return rules.map((rule) => {
    const result = validateRequiredEvidence(rule, evidence);
    return {
      ok: result.ok,
      reason: result.reason,
      ruleId: result.ruleId,
      outcome: result.outcome,
    };
  });
}

export function decide(
  gate: ExecutionGate | null,
  signedArtifacts: SignedArtifact[],
  findings: Finding[],
  complianceResults: ComplianceDecision[] = [],
): KernelDecision {
  const gateOk = gate && (gate.status === "homologated" || gate.status === "approved");

  if (!gateOk) {
    return {
      decisionId: `decision:${Date.now()}`,
      artifactId: gate?.id ?? "missing-gate",
      artifactType: "gate",
      outcome: "rejected",
      reason: "gate-not-homologated",
      policyVersion: "1.0.0",
      signature: `kernel:decision:${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
  }

  if (findings.some((f) => f.status !== "resolved" && f.status !== "closed")) {
    return {
      decisionId: `decision:${Date.now()}`,
      artifactId: gate?.id ?? "missing-gate",
      artifactType: "gate",
      outcome: "hold",
      reason: "open-finding-exists",
      policyVersion: "1.0.0",
      signature: `kernel:decision:${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
  }

  const failedCompliance = complianceResults.find((r) => !r.ok);

  if (failedCompliance) {
    return {
      decisionId: `decision:${Date.now()}`,
      artifactId: gate?.id ?? "missing-gate",
      artifactType: "gate",
      outcome: failedCompliance.outcome,
      reason: failedCompliance.reason ?? "compliance-check-failed",
      policyVersion: "1.0.0",
      signature: `kernel:decision:${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
  }

  return {
    decisionId: `decision:${Date.now()}`,
    artifactId: gate?.id ?? "missing-gate",
    artifactType: "gate",
    outcome: "approved",
    reason: "gate-homologated-and-valid",
    policyVersion: "1.0.0",
    signature: `kernel:decision:${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
}
