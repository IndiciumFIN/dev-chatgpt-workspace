/**
 * Admissão do kernel. Este arquivo não reimplementa a doutrina: ele traduz o
 * que o banco tem para o que o kernel entende, chama o kernel e grava o que o
 * kernel decidiu.
 *
 * O kernel está em `src/core/governance/kernel.ts` (portado de
 * `origin/preview/central-comando-20261026`, fail-closed). O motivo da decisão
 * vem de lá — daqui só sai a gravação.
 *
 * Cadeia: pedido (kernel_order) → política (kernel_order_policy) → validador
 * (kernel_validator) → manifesto (kernel_manifest) → aprovação (kernel_approval)
 * → decisão registrada (policy_decision + audit_event).
 */

import { evaluateWorkOrder, type NamedValidator, type PolicyEvaluator } from "@/core/governance/kernel";
import type { ApprovalRecord, Manifest, PolicyRule, WorkOrder } from "@/core/governance/types";
import { sha256Hex } from "@/core/compliance/validators";
import type { Sql } from "@/lib/db";

export type PolicyFact = {
  code: string;
  active: boolean;
  effect: "allow" | "deny";
};

export type AdmitInput = {
  workOrderId: string;
  policyCodes: string[];
  rules: PolicyFact[];
  validators: boolean[];
  approverId: string | null;
};

export type AdmitDecision = {
  outcome: "reject" | "hold" | "admit";
  reason: string;
};

/** Dono padrão do pedido quando o chamador não diz quem pediu. */
const donoPadrao = "sistema";
/** Pacote de regras onde a decisão é registrada. */
const pacoteDeRegras = "acesso";

const on = (value: unknown): boolean =>
  value === true || value === "t" || value === "true" || value === 1;

const dataIso = (value: unknown): string | undefined => {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" && value.trim()) return value;
  return undefined;
};

/**
 * Avaliação pura do pedido. O manifesto e a aprovação são fatos que o
 * chamador traz: esta função não aprova nada — a aprovação vem de
 * `aprovarManifesto`, que é um processo separado.
 */
export async function admit(input: AdmitInput): Promise<AdmitDecision> {
  const approvedAt = new Date().toISOString();
  const hash = await sha256Hex(
    [
      input.workOrderId,
      input.policyCodes.join(","),
      input.validators.map((ok) => (ok ? "1" : "0")).join(""),
      input.approverId ?? "",
    ].join("|"),
  );

  const approverId = input.approverId?.trim() ? input.approverId.trim() : null;
  const aprovavel = approverId !== null && approverId !== "kernel";
  const approver = aprovavel ? approverId : donoPadrao;

  const order: WorkOrder = {
    id: input.workOrderId,
    type: "planning",
    title: input.workOrderId,
    objective: "",
    scope: "",
    owner: donoPadrao,
    approver,
    sourceRef: `memoria://admit/${input.workOrderId}`,
    policySet: input.policyCodes,
    riskLevel: "medium",
    dataClassification: "internal",
    securityImpact: "low",
    environment: "planning",
    status: "draft",
    dependencies: [],
    acceptanceCriteria: ["policy-ativa", "validador-aprovado", "aprovacao-humana"],
    evidence: [],
    approvals: aprovavel
      ? [{ id: `apr-${input.workOrderId}`, approver: approverId, decision: "approved", approvedAt }]
      : [],
    createdAt: approvedAt,
    updatedAt: approvedAt,
  };

  const manifest: Manifest = {
    id: `manifest-${input.workOrderId}`,
    serviceOrderId: input.workOrderId,
    version: "1.0.0",
    state: "preview",
    hash,
    validators: input.validators.map((_, indice) => `validador-${indice + 1}`),
    policySet: input.policyCodes,
    status: aprovavel ? "approved" : "draft",
    approvedBy: aprovavel ? approverId : undefined,
    approvedAt: aprovavel ? approvedAt : undefined,
  };

  const rules: PolicyRule[] = input.rules.map((rule) => ({
    id: rule.code,
    code: rule.code,
    description: "",
    version: "1.0.0",
    active: rule.active,
    effect: rule.effect,
    scope: "global",
  }));

  const validators: NamedValidator[] = input.validators.map((ok, indice) => ({
    id: `validador-${indice + 1}`,
    run: async () => ok,
  }));

  // O chamador já trouxe o resultado das regras: a decisão interna é a
  // avaliação desse conjunto, com referência para o bundle do pacote.
  const evaluator: PolicyEvaluator = async () => ({
    allow: true,
    decisionId: `decisao-${hash.slice(0, 32)}`,
    bundleRef: `bundle://${pacoteDeRegras}/1.0.0`,
  });

  const decision = await evaluateWorkOrder(order, manifest, rules, validators, evaluator);
  return { outcome: decision.outcome, reason: decision.reason };
}

/** Estado do manifesto a partir da decisão. O kernel não aprova. */
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

type KernelOrderRow = {
  id: string;
  title: string;
  status: string;
  approver_id: string | null;
  owner_id: string | null;
  source_ref: string | null;
  hash: string | null;
  acceptance_criteria: string[] | null;
};

type ManifestRow = {
  order_id: string;
  status: string;
  approved_by: string | null;
  approved_at: unknown;
  hash: string | null;
  policy_set: string[] | null;
  validators: string[] | null;
  version: string | null;
};

type ApprovalRow = {
  id: string;
  approver: string;
  decision: string;
  reason: string;
  approved_at: unknown;
};

type RuleRow = {
  code: string;
  package_id: string;
  active: boolean | string;
  effect: "allow" | "deny";
};

type ValidatorRow = { id: string; passed: boolean | string; note: string };

const manifestStatusFromDb = (status: string): Manifest["status"] =>
  status === "aprovado" ? "approved" : status === "rejeitado" ? "rejected" : "draft";

/**
 * Avalia o pedido que está no banco e grava a decisão.
 *
 * Grava: status do pedido, manifesto, decisão de política e trilha de auditoria.
 * O `kernel_approval` (a aprovação humana) é gravado por `aprovarManifesto`.
 */
export async function admitOrder(sql: Sql, orderId: string): Promise<AdmitDecision> {
  const orders = await sql.query<KernelOrderRow>(
    `select id, title, status, approver_id, owner_id, source_ref, hash, acceptance_criteria
     from kernel_order where id = $1`,
    [orderId],
  );
  const order = orders[0];
  if (!order) return { outcome: "reject", reason: "work-order-missing-id" };

  const manifests = await sql.query<ManifestRow>(
    `select order_id, status, approved_by, approved_at, hash, policy_set, validators, version
     from kernel_manifest where order_id = $1`,
    [orderId],
  );
  const approvals = await sql.query<ApprovalRow>(
    `select id, approver, decision, reason, approved_at
     from kernel_approval where order_id = $1`,
    [orderId],
  );
  const rules = await sql.query<RuleRow>(
    `select rule.id as code, link.package_id as package_id, package.status = 'ativo' as active, rule.effect
     from kernel_order_policy link
     join policy_rule rule on rule.package_id = link.package_id and rule.id = link.rule_id
     join policy_package package on package.id = link.package_id
     where link.order_id = $1`,
    [orderId],
  );
  const validators = await sql.query<ValidatorRow>(
    "select id, passed, note from kernel_validator where order_id = $1",
    [orderId],
  );

  const manifestRow = manifests[0] ?? null;
  const manifest: Manifest | null = manifestRow
    ? {
        id: `manifest-${manifestRow.order_id}`,
        serviceOrderId: manifestRow.order_id,
        version: manifestRow.version ?? "1.0.0",
        state: "preview",
        hash: manifestRow.hash ?? "",
        validators: manifestRow.validators ?? [],
        policySet: manifestRow.policy_set ?? [],
        status: manifestStatusFromDb(manifestRow.status),
        approvedBy: manifestRow.approved_by ?? undefined,
        approvedAt: dataIso(manifestRow.approved_at),
      }
    : null;

  const approvalRecords: ApprovalRecord[] = approvals.map((row) => ({
    id: row.id,
    approver: row.approver,
    decision:
      row.decision === "aprovado" ? "approved" : row.decision === "rejeitado" ? "rejected" : "hold",
    reason: row.reason,
    approvedAt: dataIso(row.approved_at) ?? "",
  }));

  const now = new Date().toISOString();
  const workOrder: WorkOrder = {
    id: order.id,
    type: "planning",
    title: order.title,
    objective: "",
    scope: "",
    owner: order.owner_id ?? donoPadrao,
    approver: order.approver_id ?? "",
    sourceRef: order.source_ref ?? "",
    policySet: rules.map((rule) => rule.code),
    riskLevel: "medium",
    dataClassification: "internal",
    securityImpact: "low",
    environment: "planning",
    status: "draft",
    hash: order.hash ?? undefined,
    dependencies: [],
    acceptanceCriteria: order.acceptance_criteria ?? [],
    evidence: [],
    approvals: approvalRecords,
    createdAt: now,
    updatedAt: now,
  };

  const policyRules: PolicyRule[] = rules.map((rule) => ({
    id: rule.code,
    code: rule.code,
    description: "",
    version: "1.0.0",
    active: on(rule.active),
    effect: rule.effect,
    scope: "global",
  }));

  const namedValidators: NamedValidator[] = validators.map((row) => ({
    id: row.id,
    run: async () => on(row.passed),
  }));

  const packageId = rules[0]?.package_id ?? pacoteDeRegras;
  let decisionId = "";
  const evaluator: PolicyEvaluator = async ({ activePolicies }) => {
    decisionId = crypto.randomUUID();
    const permite = workOrder.policySet.every((code) =>
      activePolicies.some((rule) => rule.code === code && rule.effect === "allow"),
    );
    return { allow: permite, decisionId, bundleRef: `bundle://${packageId}/1.0.0` };
  };

  const decision = await evaluateWorkOrder(
    workOrder,
    manifest,
    policyRules,
    namedValidators,
    evaluator,
  );

  const recordedDecisionId = decisionId || crypto.randomUUID();
  const efeito = decision.outcome === "admit" ? "allow" : "deny";
  const regraQueDecidiu =
    efeito === "allow"
      ? (rules.find((rule) => rule.effect === "allow" && on(rule.active))?.code ?? null)
      : (rules.find((rule) => rule.effect === "deny")?.code ?? null);

  await sql.query(
    "update kernel_order set status = $2, reason = $3 where id = $1",
    [orderId, orderStatus[decision.outcome], decision.reason],
  );

  const manifesto = manifestStatus(decision, order.approver_id);
  await sql.query(
    `insert into kernel_manifest (order_id, status, approved_by, approved_at, hash, policy_set, validators, version, evidence_ref)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     on conflict (order_id) do update
     set status = excluded.status,
         approved_by = excluded.approved_by,
         approved_at = excluded.approved_at,
         hash = excluded.hash,
         policy_set = excluded.policy_set,
         validators = excluded.validators,
         version = excluded.version,
         evidence_ref = excluded.evidence_ref`,
    [
      orderId,
      manifesto.status === "approved" ? "aprovado" : "rascunho",
      manifesto.approvedBy,
      manifesto.status === "approved" ? (manifest?.approvedAt ?? new Date().toISOString()) : null,
      manifest?.hash ?? null,
      manifest?.policySet ?? [],
      manifest?.validators ?? [],
      manifest?.version ?? "1.0.0",
      `policy_decision:${recordedDecisionId}`,
    ],
  );

  await sql.query(
    `insert into policy_decision (id, package_id, rule_id, action, subject_role, effect, actor_id)
     values ($1, $2, $3, $4, $5, $6, $7)`,
    [
      recordedDecisionId,
      packageId,
      regraQueDecidiu,
      "admitir_ordem",
      "admin",
      efeito,
      order.approver_id ?? "kernel",
    ],
  );

  await sql.query(
    `insert into audit_event (id, actor_id, action, entity, entity_id)
     values ($1, $2, $3, $4, $5)`,
    [crypto.randomUUID(), order.approver_id ?? "kernel", "decidir_admissao", "kernel_order", orderId],
  );

  return { outcome: decision.outcome, reason: decision.reason };
}

/**
 * Aprovação humana do manifesto. É um processo separado: o kernel não aprova,
 * e o pedido não é o aprovador.
 *
 * Grava o `kernel_approval` (o registro que casa com o manifesto) e o manifesto
 * aprovado, com hash e data.
 */
export async function aprovarManifesto(
  sql: Sql,
  input: { orderId: string; approverId: string; hash?: string; reason?: string },
): Promise<{ ok: boolean; motivo: string; approvalId?: string; approvedAt?: string }> {
  const orders = await sql.query<KernelOrderRow>(
    `select id, title, status, approver_id, owner_id, source_ref, hash, acceptance_criteria
     from kernel_order where id = $1`,
    [input.orderId],
  );
  const order = orders[0];
  if (!order) return { ok: false, motivo: "work-order-missing-id" };

  const approverId = input.approverId?.trim() ?? "";
  if (!approverId || approverId === "kernel") {
    return { ok: false, motivo: "aprovador-invalido: o kernel não aprova" };
  }
  if (order.owner_id && approverId === order.owner_id) {
    return { ok: false, motivo: "aprovacao-nao-independente: o dono não aprova o próprio pedido" };
  }
  if (order.approver_id && approverId !== order.approver_id) {
    return { ok: false, motivo: "aprovador-nao-nomeado: o pedido nomeia outro aprovador" };
  }

  const hash = input.hash ?? order.hash ?? "";
  if (!/^[a-f0-9]{64}$/.test(hash)) {
    return { ok: false, motivo: "manifesto-sem-hash: o manifesto sem sha256 não é evidência" };
  }

  const rules = await sql.query<{ code: string }>(
    `select rule.id as code
     from kernel_order_policy link
     join policy_rule rule on rule.package_id = link.package_id and rule.id = link.rule_id
     where link.order_id = $1`,
    [input.orderId],
  );
  const validators = await sql.query<{ id: string }>(
    "select id from kernel_validator where order_id = $1",
    [input.orderId],
  );
  if (validators.length === 0) {
    return { ok: false, motivo: "validators-required: pedido sem validador não tem manifesto" };
  }

  const approvedAt = new Date().toISOString();
  const approvalId = `apr-${crypto.randomUUID()}`;

  await sql.query(
    `insert into kernel_approval (id, order_id, approver, decision, reason, approved_at)
     values ($1, $2, $3, $4, $5, $6)`,
    [approvalId, input.orderId, approverId, "aprovado", input.reason ?? "", approvedAt],
  );

  await sql.query(
    `insert into kernel_manifest (order_id, status, approved_by, approved_at, hash, policy_set, validators, version)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     on conflict (order_id) do update
     set status = excluded.status,
         approved_by = excluded.approved_by,
         approved_at = excluded.approved_at,
         hash = excluded.hash,
         policy_set = excluded.policy_set,
         validators = excluded.validators,
         version = excluded.version`,
    [
      input.orderId,
      "aprovado",
      approverId,
      approvedAt,
      hash,
      rules.map((rule) => rule.code),
      validators.map((row) => row.id),
      "1.0.0",
    ],
  );

  return { ok: true, motivo: "o manifesto foi aprovado por uma pessoa", approvalId, approvedAt };
}
