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

export function buildPolicyBundle(
  id: string,
  name: string,
  version: string,
  normativeIds: string[],
  owner: string,
  createdAt: string,
): PolicyBundle {
  return {
    id,
    name,
    version,
    normativeIds,
    owner,
    status: "active",
    createdAt,
    updatedAt: createdAt,
    hash: `policy:${id}:${version}`,
  };
}

export function getRequiredRules(rules: Record<string, NormativeRule>, normativeIds: string[]) {
  return normativeIds
    .map((id) => rules[id])
    .filter(Boolean) as NormativeRule[];
}
