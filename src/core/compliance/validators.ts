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
  // Presence validation only. It never authenticates provenance or licensing.
  // Reject empty placeholders and inherited properties rather than accepting
  // any truthy container as proof. Numeric zero is retained as a valid value.
  const present = (value: unknown): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return Number.isFinite(value);
    if (Array.isArray(value)) return value.length > 0 && value.every(present);
    if (typeof value === "object") {
      const items = Object.values(value);
      return items.length > 0 && items.some(present);
    }
    return false;
  };
  const values = evidence && typeof evidence === "object" ? evidence : {};
  const missing = rule.requiredEvidence.filter(
    item => !Object.prototype.hasOwnProperty.call(values, item) || !present(values[item]),
  );

  if (missing.length > 0) {
    return {
      ok: false,
      ruleId: rule.id,
      framework: rule.framework,
      reason: `missing-evidence:${missing.join(",")}`,
      requiredEvidence: rule.requiredEvidence,
      severity: rule.severity,
      onFail: rule.onFail,
      outcome: rule.onFail === "hold" || rule.onFail === "finding" ? "hold" : "rejected",
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
