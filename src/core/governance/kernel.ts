/**
 * Kernel fail-closed.
 *
 * O kernel é o portão da cadeia de source: captura → átomo → admissão → publicação.
 * Ele não executa pedido, não dá permissão, não publica e não grava linha do kernel.
 * Ele decide: `admit` | `hold` | `reject`. Quem grava a decisão é o chamador.
 *
 * A forma vem de `origin/preview/central-comando-20261026:src/core/governance/kernel.ts`
 * (leitura, não checkout). O que mudou ao portar, e por quê:
 *
 *   1. `policy-denied:<code>` — a regra com efeito `deny` derruba o pedido antes
 *      de perguntar a quem decide. Na origem isso só aparecia depois do avaliador.
 *   2. `validators-required` — o conjunto de validadores vazio tem motivo próprio,
 *      distinto de "o conjunto não casa com o do manifesto".
 *   3. `work-order-missing-owner` — pedido sem dono não tem contra quem medir a
 *      independência da aprovação.
 *   4. `kernel-evaluation-error` — exceção vira espera, nunca admissão.
 *
 * Fail-closed: tudo que não pode ser provado segura. Nada que não possa ser
 * provado admits.
 */

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
  left.length === right.length && left.every((value) => right.includes(value));

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
  try {
    return await decide(
      workOrder,
      manifest,
      policyRules,
      validators,
      evaluatePolicy,
    );
  } catch {
    // Fail-closed de verdade: um defeito aqui não vira admissão, vira espera.
    return { outcome: "hold", reason: "kernel-evaluation-error" };
  }
}

async function decide(
  workOrder: WorkOrder,
  manifest: Manifest | null,
  policyRules: PolicyRule[],
  validators: NamedValidator[],
  evaluatePolicy?: PolicyEvaluator,
): Promise<KernelDecision> {
  if (!nonempty(workOrder?.id)) {
    return { outcome: "reject", reason: "work-order-missing-id" };
  }
  if (!uniqueNames(workOrder.policySet)) {
    return { outcome: "reject", reason: "policy-set-required" };
  }
  if (!nonempty(workOrder.owner)) {
    return { outcome: "reject", reason: "work-order-missing-owner" };
  }
  if (!nonempty(workOrder.sourceRef) || !uniqueNames(workOrder.acceptanceCriteria)) {
    return { outcome: "hold", reason: "work-order-source-or-acceptance-missing" };
  }

  const activePolicies = policyRules.filter((rule) => rule.active);
  const missingPolicy = workOrder.policySet.find(
    (code) => !activePolicies.some((rule) => rule.code === code && nonempty(rule.version)),
  );
  if (missingPolicy) {
    return { outcome: "reject", reason: `inactive-policy:${missingPolicy}` };
  }
  // A regra que nega derruba o pedido aqui, com o código da regra no motivo.
  const denyingPolicy = workOrder.policySet.find((code) =>
    activePolicies.some((rule) => rule.code === code && rule.effect === "deny"),
  );
  if (denyingPolicy) {
    return { outcome: "reject", reason: `policy-denied:${denyingPolicy}` };
  }

  if (!manifest) {
    return { outcome: "hold", reason: "manifest-required" };
  }
  if (manifest.serviceOrderId !== workOrder.id) {
    return { outcome: "reject", reason: "manifest-work-order-mismatch" };
  }
  if (!sha256(manifest.hash) || (workOrder.hash && workOrder.hash !== manifest.hash)) {
    return { outcome: "reject", reason: "manifest-integrity-mismatch" };
  }
  if (!uniqueNames(manifest.policySet) || !sameSet(manifest.policySet, workOrder.policySet)) {
    return { outcome: "reject", reason: "manifest-policy-set-mismatch" };
  }
  if (!Array.isArray(manifest.validators) || manifest.validators.length === 0) {
    return { outcome: "reject", reason: "validators-required" };
  }
  if (!Array.isArray(validators) ||
    validators.length !== manifest.validators.length ||
    validators.some((v) => !v || !nonempty(v.id) || typeof v.run !== "function") ||
    !sameSet(manifest.validators, validators.map((v) => v.id))) {
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
  if (assessment.allow !== true) {
    return { outcome: "reject", reason: "policy-denied" };
  }

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
    Number.isNaN(Date.parse(manifest.approvedAt))) {
    return false;
  }
  return Array.isArray(order.approvals) && order.approvals.some((approval) =>
    approval.decision === "approved" &&
    approval.approver === manifest.approvedBy &&
    approval.approver !== order.owner &&
    approval.approvedAt === manifest.approvedAt &&
    nonempty(approval.id),
  );
}

/** Produces an unapproved candidate. Approval MUST come from a separate
 * authenticated process; this builder cannot approve a manifest.
 */
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
 * Production releases require a separate trusted gate and approval.
 */
export function canDeploy(manifest: Manifest | null): boolean {
  return canPreview(manifest) && manifest?.state === "preview";
}
