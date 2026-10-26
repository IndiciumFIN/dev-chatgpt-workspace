import type { KernelDecision, Manifest, PolicyRule, WorkOrder } from "./types";

/** Executable validators are bound by ID to the immutable manifest.
 * These functions are local checks. They do not prove central Kernel admission.
 */
export type NamedValidator = { id: string; run: () => Promise<boolean> };
export type PolicyAssessment = {
  allow: boolean;
  decisionId: string;
  bundleRef: string;
};
export type PolicyEvaluator = (request: {
  workOrder: WorkOrder;
  manifest: Manifest;
  activePolicies: PolicyRule[];
}) => Promise<PolicyAssessment>;

const nonempty = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;
const sha256 = (value: unknown): value is string =>
  typeof value === "string" && /^(?:sha256:)?[a-f0-9]{64}$/.test(value);
const uniqueNames = (values: unknown): values is string[] =>
  Array.isArray(values) &&
  values.length > 0 &&
  values.every(nonempty) &&
  new Set(values).size === values.length;
const sameSet = (left: string[], right: string[]) =>
  left.length === right.length && left.every(value => right.includes(value));

/** Local admission evaluator: fails closed unless every prerequisite is supplied.
 *
 * Never substitute the caller-supplied policy evaluator for an authenticated,
 * server-side OPA enforcement point. This function itself does not execute WOs,
 * grant capabilities, publish artifacts, or write Kernel records.
 */
export async function evaluateWorkOrder(
  workOrder: WorkOrder,
  manifest: Manifest | null,
  policyRules: PolicyRule[],
  validators: NamedValidator[],
  evaluatePolicy?: PolicyEvaluator,
): Promise<KernelDecision> {
  if (!nonempty(workOrder?.id)) return { outcome: "reject", reason: "work-order-missing-id" };
  if (!uniqueNames(workOrder.policySet)) return { outcome: "reject", reason: "policy-set-required" };
  if (!nonempty(workOrder.sourceRef) || !uniqueNames(workOrder.acceptanceCriteria)) {
    return { outcome: "hold", reason: "work-order-source-or-acceptance-missing" };
  }

  const activePolicies = policyRules.filter(rule => rule.active);
  const missingPolicy = workOrder.policySet.find(code =>
    !activePolicies.some(rule => rule.code === code && nonempty(rule.version)),
  );
  if (missingPolicy) return { outcome: "reject", reason: `inactive-policy:${missingPolicy}` };
  if (!manifest) return { outcome: "hold", reason: "manifest-required" };
  if (manifest.serviceOrderId !== workOrder.id) {
    return { outcome: "reject", reason: "manifest-work-order-mismatch" };
  }
  if (!sha256(manifest.hash) || (workOrder.hash && workOrder.hash !== manifest.hash)) {
    return { outcome: "reject", reason: "manifest-integrity-mismatch" };
  }
  if (!uniqueNames(manifest.policySet) || !sameSet(manifest.policySet, workOrder.policySet)) {
    return { outcome: "reject", reason: "manifest-policy-set-mismatch" };
  }
  if (!uniqueNames(manifest.validators) || !Array.isArray(validators) ||
    validators.length !== manifest.validators.length ||
    validators.some(v => !v || !nonempty(v.id) || typeof v.run !== "function") ||
    !sameSet(manifest.validators, validators.map(v => v.id))) {
    return { outcome: "reject", reason: "validator-manifest-mismatch" };
  }
  if (!manifestHasIndependentApproval(manifest, workOrder)) {
    return { outcome: "hold", reason: "independent-approval-required" };
  }
  if (typeof evaluatePolicy !== "function") {
    return { outcome: "hold", reason: "policy-evaluation-unavailable" };
  }

  let assessment: PolicyAssessment;
  try {
    assessment = await evaluatePolicy({ workOrder, manifest, activePolicies });
  } catch {
    return { outcome: "hold", reason: "policy-evaluation-error" };
  }
  if (!assessment || !nonempty(assessment.decisionId) || !nonempty(assessment.bundleRef)) {
    return { outcome: "hold", reason: "policy-decision-evidence-missing" };
  }
  if (assessment.allow !== true) return { outcome: "reject", reason: "policy-denied" };

  for (const validator of validators) {
    try {
      if ((await validator.run()) !== true) {
        return { outcome: "reject", reason: `validator-failed:${validator.id}` };
      }
    } catch {
      return { outcome: "hold", reason: `validator-error:${validator.id}` };
    }
  }
  return {
    outcome: "admit",
    reason: "independent-approval-policy-and-validators-passed",
    evidenceHash: manifest.hash,
    policyDecisionRef: assessment.decisionId,
  };
}

function manifestHasIndependentApproval(manifest: Manifest, order: WorkOrder): boolean {
  if (manifest.status !== "approved" || !nonempty(manifest.approvedBy) ||
      manifest.approvedBy === "kernel" || manifest.approvedBy === order.owner ||
      manifest.approvedBy !== order.approver || !nonempty(manifest.approvedAt) ||
      Number.isNaN(Date.parse(manifest.approvedAt))) return false;
  return Array.isArray(order.approvals) && order.approvals.some(approval =>
    approval.decision === "approved" &&
    approval.approver === manifest.approvedBy &&
    approval.approver !== order.owner &&
    approval.approvedAt === manifest.approvedAt &&
    nonempty(approval.id),
  );
}

/** Produces an unapproved candidate. Approval MUST come from a separate
 * authenticated process; this builder cannot approve a manifest. */
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
    status: "draft",
  };
}

/** Read-only presentation hints, not authorization for remote execution. */
export function canPreview(manifest: Manifest | null): boolean {
  return manifest !== null && manifest.status === "approved" &&
    nonempty(manifest.approvedBy) && manifest.approvedBy !== "kernel" &&
    nonempty(manifest.approvedAt) && sha256(manifest.hash) &&
    uniqueNames(manifest.policySet) && uniqueNames(manifest.validators);
}

/** Historical name: represents only preview-candidate eligibility.
 * Production releases require a separate trusted gate and approval. */
export function canDeploy(manifest: Manifest | null): boolean {
  return canPreview(manifest) && manifest?.state === "preview";
}
