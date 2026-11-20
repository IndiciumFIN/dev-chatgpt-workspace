import { verifyAllowDecision } from "./policy-signature.ts";
import type { Sql } from "@/lib/db";

export type PolicyFact = {
  code: string;
  active: boolean;
  effect: "allow" | "deny";
};

/**
 * Legacy validators from the CE source snapshot currently return unconditional
 * success and are not acceptable admission evidence. Names are normalized at
 * the database boundary; a future implementation needs independent review.
 */
export const LEGACY_UNTRUSTED_VALIDATOR_IDS = [
  "catmat_validator",
  "cid10_validator",
  "cid11_validator",
  "cvx_validator",
  "human_review_validator",
  "loinc_validator",
  "mesh_validator",
  "ncm_validator",
  "schema_validator",
] as const;
const legacyUntrustedValidatorIds = new Set<string>(LEGACY_UNTRUSTED_VALIDATOR_IDS);

export type AdmitInput = {
  workOrderId: string;
  policyCodes: string[];
  rules: PolicyFact[];
  validators: boolean[];
  /** Observed validator IDs, supplied by the database adapter, not the caller. */
  validatorIds?: string[];
  approverId: string | null;
  /** HMAC-SHA256 hex of the canonical allow decision. Never a caller boolean. */
  policySignature?: string | null;
  /** Explicit HMAC key. Not read from the environment. */
  signatureKey?: string | null;
  /** Who asked. Must differ from the approver. */
  ownerId?: string | null;
  /** Admission does not execute. True rejects. */
  executionRequested?: boolean;
  /**
   * Ignored. A caller-supplied claim that a bundle signature was verified
   * is not a verification result and cannot admit.
   */
  bundle_signature_verified?: boolean;
};

export type AdmitDecision = {
  outcome: "reject" | "hold" | "admit";
  reason: string;
};

export function admit(input: AdmitInput): AdmitDecision {
  if (!input.workOrderId) return { outcome: "reject", reason: "work-order-missing-id" };
  if (input.policyCodes.length === 0) return { outcome: "reject", reason: "policy-set-required" };

  const signatureOk = verifyAllowDecision(
    { workOrderId: input.workOrderId, policyCodes: input.policyCodes },
    input.policySignature,
    input.signatureKey,
  );
  if (!signatureOk) return { outcome: "reject", reason: "policy-signature-failed" };

  for (const code of input.policyCodes) {
    const rule = input.rules.find((item) => item.code === code && item.active);
    if (!rule) return { outcome: "reject", reason: `inactive-policy:${code}` };
    if (rule.effect !== "allow") return { outcome: "reject", reason: `policy-denied:${code}` };
  }

  if (input.validators.length === 0) return { outcome: "reject", reason: "validators-required" };
  // Reject coerced truthy strings such as "false"; only boolean true is valid.
  if (input.validators.some((ok) => ok !== true)) return { outcome: "reject", reason: "validator-failed" };

  if (input.validatorIds !== undefined) {
    if (
      !Array.isArray(input.validatorIds) ||
      input.validatorIds.length !== input.validators.length ||
      input.validatorIds.some((id) => typeof id !== "string" || !id.trim())
    ) {
      return { outcome: "reject", reason: "validator-evidence-invalid" };
    }
    const legacy = input.validatorIds
      .map((id) => id.trim().toLowerCase())
      .find((id) => legacyUntrustedValidatorIds.has(id));
    if (legacy) return { outcome: "reject", reason: `legacy-validator-untrusted:${legacy}` };
  }

  if (input.executionRequested) return { outcome: "reject", reason: "execution-not-authorized" };

  if (!input.ownerId) return { outcome: "reject", reason: "owner-required" };
  if (input.ownerId === input.approverId || input.ownerId === "kernel") {
    return { outcome: "reject", reason: "approver-must-differ-from-owner" };
  }

  if (!input.approverId || input.approverId === "kernel") {
    return { outcome: "hold", reason: "human-approval-required" };
  }

  return { outcome: "admit", reason: "policy-validator-and-human" };
}

export function manifestStatus(decision: AdmitDecision, approverId: string | null) {
  if (decision.outcome !== "admit" || !approverId || approverId === "kernel") {
    return { status: "draft" as const, approvedBy: null };
  }
  return { status: "approved" as const, approvedBy: approverId };
}

const orderStatus = {
  reject: "rejeitada",
  hold: "em_espera",
  admit: "admitida",
} as const;

export async function admitOrder(
  sql: Sql,
  orderId: string,
  proof?: {
    signatureKey?: string | null;
    policySignature?: string | null;
    bundle_signature_verified?: boolean;
  } | null,
) {
  const orders = await sql.query<{ approver_id: string | null; owner_id: string | null; execution_requested: boolean | string }>(
    "select approver_id, owner_id, execution_requested from kernel_order where id = $1",
    [orderId],
  );
  const order = orders[0];
  if (!order) return { outcome: "reject" as const, reason: "work-order-missing-id" };

  const rules = await sql.query<{ code: string; active: boolean | string; effect: "allow" | "deny" }>(
    `select rule.id as code, package.status = 'ativo' as active, rule.effect
     from kernel_order_policy link
     join policy_rule rule on rule.package_id = link.package_id and rule.id = link.rule_id
     join policy_package package on package.id = link.package_id
     where link.order_id = $1`,
    [orderId],
  );
  const validators = await sql.query<{ id: string; passed: boolean | string }>(
    "select id, passed from kernel_validator where order_id = $1",
    [orderId],
  );
  const on = (value: boolean | string) => value === true || value === "t" || value === "true";
  const decision = admit({
    workOrderId: orderId,
    policyCodes: rules.map((rule) => rule.code),
    rules: rules.map((rule) => ({ code: rule.code, active: on(rule.active), effect: rule.effect })),
    validators: validators.map((row) => on(row.passed)),
    validatorIds: validators.map((row) => row.id),
    approverId: order.approver_id,
    ownerId: order.owner_id,
    executionRequested: on(order.execution_requested),
    policySignature: proof?.policySignature ?? null,
    signatureKey: proof?.signatureKey ?? null,
  });
  const manifest = manifestStatus(decision, order.approver_id);
  await sql.query(
    "update kernel_order set status = $2, reason = $3 where id = $1",
    [orderId, orderStatus[decision.outcome], decision.reason],
  );
  await sql.query(
    `insert into kernel_manifest (order_id, status, approved_by)
     values ($1, $2, $3)
     on conflict (order_id) do update
     set status = excluded.status, approved_by = excluded.approved_by`,
    [orderId, manifest.status === "approved" ? "aprovado" : "rascunho", manifest.approvedBy],
  );
  return decision;
}
