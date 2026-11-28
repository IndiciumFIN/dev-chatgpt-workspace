import type { NormativeRule } from "./frameworks";

export type ValidationResult = {
  ok: boolean;
  ruleId: string;
  framework: string;
  reason?: string;
  requiredEvidence: string[];
  severity: "warning" | "critical" | "blocker";
  onFail: "hold" | "reject" | "finding";
  outcome: "approved" | "rejected" | "hold";
};

export function validateRequiredEvidence(
  rule: NormativeRule,
  evidence: Record<string, unknown>,
): ValidationResult {
  const missing = rule.requiredEvidence.filter((item) => !evidence[item]);

  if (missing.length > 0) {
    return {
      ok: false,
      ruleId: rule.id,
      framework: rule.framework,
      reason: `missing-evidence:${missing.join(",")}`,
      requiredEvidence: rule.requiredEvidence,
      severity: rule.severity,
      onFail: rule.onFail,
      outcome: rule.onFail === "hold" ? "hold" : rule.onFail === "finding" ? "hold" : "rejected",
    };
  }

  return {
    ok: true,
    ruleId: rule.id,
    framework: rule.framework,
    requiredEvidence: rule.requiredEvidence,
    severity: rule.severity,
    onFail: rule.onFail,
    outcome: "approved",
  };
}
