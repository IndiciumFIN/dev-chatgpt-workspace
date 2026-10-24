import type { KernelDecision, Manifest, PolicyRule, WorkOrder } from "./types";

export async function evaluateWorkOrder(
  workOrder: WorkOrder,
  manifest: Manifest | null,
  policyRules: PolicyRule[],
  validators: Array<() => Promise<boolean>>,
): Promise<KernelDecision> {
  if (!workOrder.id) {
    return { outcome: "reject", reason: "work-order-missing-id" };
  }

  if (!workOrder.policySet?.length) {
    return { outcome: "reject", reason: "policy-set-required" };
  }

  const activePolicies = policyRules.filter((rule) => rule.active);
  const missingPolicy = workOrder.policySet.find(
    (code) => !activePolicies.some((rule) => rule.code === code),
  );

  if (missingPolicy) {
    return { outcome: "reject", reason: `inactive-policy:${missingPolicy}` };
  }

  if (!manifest) {
    return { outcome: "hold", reason: "manifest-required" };
  }

  const validatorResults = await Promise.all(validators.map((validator) => validator()));
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
  workOrderId: string,
  state: string,
  hash: string,
  validators: string[],
  policySet: string[],
): Manifest {
  return {
    id: `manifest-${workOrderId}`,
    serviceOrderId: workOrderId,
    version: "1.0.0",
    state,
    hash,
    validators,
    policySet,
    // Um manifesto em rascunho nunca nasce aprovado: canPreview/canDeploy exigem "approved".
    status: state === "draft" ? "draft" : "approved",
    ...(state === "draft"
      ? {}
      : { approvedBy: "kernel", approvedAt: new Date().toISOString() }),
  };
}

export function canPreview(manifest: Manifest | null): boolean {
  return manifest !== null && manifest.status === "approved";
}

export function canDeploy(manifest: Manifest | null): boolean {
  return manifest !== null && manifest.status === "approved" && manifest.state === "preview";
}
