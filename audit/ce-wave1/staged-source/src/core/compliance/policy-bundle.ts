import type { NormativeRule } from "./frameworks";

export type PolicyBundle = {
  id: string;
  name: string;
  version: string;
  normativeIds: string[];
  owner: string;
  status: "draft" | "active" | "archived";
  createdAt: string;
  updatedAt: string;
  hash: string;
};

/**
 * Prepares a candidate bundle, NOT an active/enforced signed policy.
 * Activation requires independent review + trusted server signature process.
 */
export function buildPolicyBundle(
  id: string, name: string, version: string, normativeIds: string[],
  owner: string, createdAt: string,
): PolicyBundle {
  if (!id || !name || !version || !owner || !createdAt ||
      !Array.isArray(normativeIds) || !normativeIds.length ||
      normativeIds.some(x => typeof x !== "string" || !x)) {
    throw new Error("INVALID_POLICY_BUNDLE_CANDIDATE");
  }
  return { id, name, version, normativeIds, owner,
    status: "draft", createdAt, updatedAt: createdAt, hash: "" };
}

export function getRequiredRules(rules: Record<string, NormativeRule>, normativeIds: string[]) {
  return normativeIds.map(id => rules[id]).filter(Boolean) as NormativeRule[];
}
