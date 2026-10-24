import type { Manifest, PolicyRule, ServiceOrder, KernelDecision } from "./types";

export async function evaluateServiceOrder(
  order: ServiceOrder,
  manifest: Manifest | null,
  policyRules: PolicyRule[],
  validators: Array<() => Promise<boolean>>,
): Promise<KernelDecision> {
  if (!order.id) {
    return { outcome: "reject", reason: "service-order-missing-id" };
  }

  if (!order.policySet?.length) {
    return { outcome: "reject", reason: "policy-set-required" };
  }

  const activePolicies = policyRules.filter((rule) => rule.active);
  const missingPolicy = order.policySet.find(
    (code) => !activePolicies.some((rule) => rule.code === code),
  );

  if (missingPolicy) {
    return { outcome: "reject", reason: `inactive-policy:${missingPolicy}` };
  }

  if (!manifest) {
    return { outcome: "hold", reason: "manifest-required" };
  }

  const validatorResults = await Promise.all(validators.map((v) => v()));
  if (validatorResults.some((ok) => !ok)) {
    return { outcome: "reject", reason: "validator-failed" };
  }

  return {
    outcome: "admit",
    reason: "policy-and-validator-checks-passed",
    evidenceHash: manifest.hash,
  };
}

export function buildManifest(
  serviceOrderId: string,
  state: string,
  hash: string,
  validators: string[],
  policySet: string[],
): Manifest {
  return {
    id: `manifest-${serviceOrderId}`,
    serviceOrderId,
    version: "1.0.0",
    state,
    hash,
    validators,
    policySet,
    status: "approved",
    approvedBy: "kernel",
    approvedAt: new Date().toISOString(),
  };
}

export function canPreview(manifest: Manifest | null): boolean {
  return manifest !== null && manifest.status === "approved";
}

export function canDeploy(manifest: Manifest | null): boolean {
  return manifest !== null && manifest.status === "approved" && manifest.state === "preview";
}
