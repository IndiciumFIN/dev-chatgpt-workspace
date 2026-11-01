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

/** Legacy display shape only. No field in this type is an execution grant. */
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

/** Fail closed when there is no active bundle or no resolvable normative rules. */
export function evaluateCompliance(
  policyBundle: PolicyBundle | null,
  evidence: Record<string, unknown>,
): ComplianceDecision[] {
  if (!policyBundle || policyBundle.status !== "active") {
    return [{ ok: false, reason: "missing-active-policy-bundle", outcome: "rejected" }];
  }
  if (!Array.isArray(policyBundle.normativeIds) || !policyBundle.normativeIds.length ||
      !policyBundle.normativeIds.every(x => typeof x === "string" && x.length > 0)) {
    return [{ ok: false, reason: "normative-policy-set-required", outcome: "rejected" }];
  }
  const rules = getRequiredRules(normativeCatalog, policyBundle.normativeIds);
  if (rules.length !== policyBundle.normativeIds.length ||
      new Set(policyBundle.normativeIds).size !== policyBundle.normativeIds.length) {
    return [{ ok: false, reason: "unresolved-or-duplicate-normative-rule", outcome: "rejected" }];
  }
  return rules.map(rule => {
    const result = validateRequiredEvidence(rule, evidence);
    return { ok: result.ok, reason: result.reason, ruleId: result.ruleId, outcome: result.outcome };
  });
}

/**
 * This is an intentionally non-authoritative COMPATIBILITY shim.
 * Previously it approved on gate.status alone, ignored signedArtifacts, and
 * formatted timestamps as counterfeit signatures. There is no trusted
 * server-side admission/authorization verifier attached to this module.
 * Consequently it can NEVER return "approved" or issue a signature.
 */
export function decide(
  gate: ExecutionGate | null,
  _signedArtifacts: SignedArtifact[],
  findings: Finding[],
  complianceResults: ComplianceDecision[] = [],
): KernelDecision {
  const status = !gate || !["homologated", "approved"].includes(gate.status)
    ? "rejected" : "hold";
  const reason = status === "rejected"
    ? "gate-not-homologated"
    : findings?.some(f => f.status !== "resolved" && f.status !== "closed")
      ? "open-finding-exists"
      : !complianceResults.length
        ? "compliance-results-not-provided"
        : complianceResults.some(r => r.ok !== true)
          ? "compliance-not-passed"
          : "trusted-server-authorization-not-connected";

  return {
    decisionId: "LEGACY_PREVIEW_ONLY_NOT_ADMITTED",
    artifactId: gate?.id ?? "missing-gate",
    artifactType: "gate",
    outcome: status,
    reason,
    policyVersion: "UNVERIFIED",
    signature: "", // deliberately absent; NEVER synthetic
    createdAt: new Date().toISOString(),
  };
}
