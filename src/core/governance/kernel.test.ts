/**
 * Kernel fail-closed. A prova de que ele segura e recusa nos casos da doutrina.
 *
 * A regra do teste: cada caso quebra UMA coisa e o teste nomeia o motivo.
 * Kernel que admite em tudo não é garantia.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildManifest,
  canDeploy,
  canPreview,
  evaluateWorkOrder,
  type NamedValidator,
  type PolicyEvaluator,
} from "./kernel.ts";
import type { Manifest, PolicyRule, WorkOrder } from "./types.ts";

const hash = "a".repeat(64);
const timestamp = "2026-10-26T12:00:00Z";

const policies: PolicyRule[] = [
  {
    id: "p1",
    code: "policy.require.source",
    description: "source",
    version: "1.0.0",
    active: true,
    effect: "allow",
    scope: "global",
  },
  {
    id: "p2",
    code: "policy.preview-required",
    description: "preview",
    version: "1.0.0",
    active: true,
    effect: "allow",
    scope: "preview",
  },
];

const makeOrder = (): WorkOrder => ({
  id: "wo-test",
  type: "pilot",
  title: "Teste isolado",
  objective: "avaliar gate",
  scope: "public-backup",
  owner: "maker",
  approver: "reviewer",
  sourceRef: "source://test",
  policySet: ["policy.require.source", "policy.preview-required"],
  riskLevel: "medium",
  dataClassification: "internal",
  securityImpact: "low",
  environment: "pilot",
  status: "draft",
  dependencies: [],
  acceptanceCriteria: ["test"],
  evidence: [],
  approvals: [{ id: "approval-1", approver: "reviewer", decision: "approved", approvedAt: timestamp }],
  createdAt: timestamp,
  updatedAt: timestamp,
  hash,
});

const makeManifest = (order = makeOrder()): Manifest => ({
  ...buildManifest(order.id, "preview", hash, ["schema", "rights"], order.policySet),
  status: "approved",
  approvedBy: "reviewer",
  approvedAt: timestamp,
});

const validators: NamedValidator[] = [
  { id: "schema", run: async () => true },
  { id: "rights", run: async () => true },
];

const policy: PolicyEvaluator = async () => ({
  allow: true,
  decisionId: "opa-decision-001",
  bundleRef: "bundle://candidate/1.0.0",
});

const assess = (
  order: WorkOrder = makeOrder(),
  manifest: Manifest | null = makeManifest(order),
  checks: NamedValidator[] = validators,
  evaluate?: PolicyEvaluator,
) => evaluateWorkOrder(order, manifest, policies, checks, evaluate ?? policy);

describe("kernel fail-closed — os seis casos da doutrina", () => {
  it("1. sem manifesto segura: manifest-required", async () => {
    assert.deepEqual(await assess(makeOrder(), null), { outcome: "hold", reason: "manifest-required" });
  });

  it("2. sem política ativa recusa: inactive-policy:<código>", async () => {
    const order = makeOrder();
    const regras = policies.map((regra) =>
      regra.code === "policy.preview-required" ? { ...regra, active: false } : regra,
    );
    const resultado = await evaluateWorkOrder(order, makeManifest(order), regras, validators, policy);
    assert.equal(resultado.outcome, "reject");
    assert.equal(resultado.reason, "inactive-policy:policy.preview-required");
  });

  it("3. sem validador recusa: validators-required", async () => {
    const order = makeOrder();
    const manifesto = makeManifest(order);
    manifesto.validators = [];
    const resultado = await evaluateWorkOrder(order, manifesto, policies, [], policy);
    assert.equal(resultado.outcome, "reject");
    assert.equal(resultado.reason, "validators-required");
  });

  it("4. aprovação do kernel segura: independent-approval-required", async () => {
    const manifesto = makeManifest();
    manifesto.approvedBy = "kernel";
    const resultado = await assess(makeOrder(), manifesto);
    assert.equal(resultado.outcome, "hold");
    assert.equal(resultado.reason, "independent-approval-required");
  });

  it("5. política que nega recusa: policy-denied", async () => {
    const resultado = await assess(makeOrder(), makeManifest(), validators, async () => ({
      allow: false,
      decisionId: "opa-2",
      bundleRef: "bundle://candidate",
    }));
    assert.equal(resultado.outcome, "reject");
    assert.equal(resultado.reason, "policy-denied");
  });

  it("6. hash do manifesto que não confere recusa: manifest-integrity-mismatch", async () => {
    const manifesto = makeManifest();
    manifesto.hash = "b".repeat(64);
    const resultado = await assess(makeOrder(), manifesto);
    assert.equal(resultado.outcome, "reject");
    assert.equal(resultado.reason, "manifest-integrity-mismatch");
  });
});

describe("kernel fail-closed — o resto dos motivos", () => {
  it("pedido sem id recusa: work-order-missing-id", async () => {
    const order = makeOrder();
    order.id = "";
    const resultado = await assess(order);
    assert.equal(resultado.outcome, "reject");
    assert.equal(resultado.reason, "work-order-missing-id");
  });

  it("pedido sem conjunto de política recusa: policy-set-required", async () => {
    const order = makeOrder();
    order.policySet = [];
    const resultado = await assess(order);
    assert.equal(resultado.outcome, "reject");
    assert.equal(resultado.reason, "policy-set-required");
  });

  it("pedido sem dono recusa: work-order-missing-owner", async () => {
    const order = makeOrder();
    order.owner = "";
    const resultado = await assess(order);
    assert.equal(resultado.outcome, "reject");
    assert.equal(resultado.reason, "work-order-missing-owner");
  });

  it("regra com efeito deny recusa e nomeia a regra: policy-denied:<código>", async () => {
    const regras = [
      ...policies,
      {
        id: "p3",
        code: "policy.require.source",
        description: "negada",
        version: "1.0.0",
        active: true,
        effect: "deny" as const,
        scope: "global" as const,
      },
    ];
    const resultado = await evaluateWorkOrder(makeOrder(), makeManifest(), regras, validators, policy);
    assert.equal(resultado.outcome, "reject");
    assert.equal(resultado.reason, "policy-denied:policy.require.source");
  });

  it("pedido sem origem ou sem critério de aceite segura: work-order-source-or-acceptance-missing", async () => {
    const order = makeOrder();
    order.sourceRef = "";
    const resultado = await assess(order);
    assert.equal(resultado.outcome, "hold");
    assert.equal(resultado.reason, "work-order-source-or-acceptance-missing");
  });

  it("manifesto de outro pedido recusa: manifest-work-order-mismatch", async () => {
    const manifesto = makeManifest();
    manifesto.serviceOrderId = "another-wo";
    const resultado = await assess(makeOrder(), manifesto);
    assert.equal(resultado.outcome, "reject");
    assert.equal(resultado.reason, "manifest-work-order-mismatch");
  });

  it("conjunto de política diferente recusa: manifest-policy-set-mismatch", async () => {
    const manifesto = makeManifest();
    manifesto.policySet = ["policy.require.source"];
    const resultado = await assess(makeOrder(), manifesto);
    assert.equal(resultado.outcome, "reject");
    assert.equal(resultado.reason, "manifest-policy-set-mismatch");
  });

  it("conjunto de validadores diferente recusa: validator-manifest-mismatch", async () => {
    const resultado = await assess(makeOrder(), makeManifest(), [validators[0]]);
    assert.equal(resultado.outcome, "reject");
    assert.equal(resultado.reason, "validator-manifest-mismatch");
  });

  it("dono que aprova o próprio pedido segura: independent-approval-required", async () => {
    const order = makeOrder();
    order.owner = "reviewer";
    const resultado = await assess(order, makeManifest(order));
    assert.equal(resultado.outcome, "hold");
    assert.equal(resultado.reason, "independent-approval-required");
  });

  it("aprovação sem registro que case segura: independent-approval-required", async () => {
    const order = makeOrder();
    order.approvals = [];
    const resultado = await assess(order, makeManifest(order));
    assert.equal(resultado.outcome, "hold");
    assert.equal(resultado.reason, "independent-approval-required");
  });

  it("aprovação com data diferente da do manifesto segura: independent-approval-required", async () => {
    const order = makeOrder();
    order.approvals = [
      { id: "approval-1", approver: "reviewer", decision: "approved", approvedAt: "2026-10-26T13:00:00Z" },
    ];
    const resultado = await assess(order, makeManifest(order));
    assert.equal(resultado.outcome, "hold");
    assert.equal(resultado.reason, "independent-approval-required");
  });

  it("sem avaliador de política segura: policy-evaluation-unavailable", async () => {
    const resultado = await evaluateWorkOrder(makeOrder(), makeManifest(), policies, validators);
    assert.equal(resultado.outcome, "hold");
    assert.equal(resultado.reason, "policy-evaluation-unavailable");
  });

  it("decisão de política sem evidência segura: policy-decision-evidence-missing", async () => {
    const resultado = await assess(makeOrder(), makeManifest(), validators, async () => ({
      allow: true,
      decisionId: "",
      bundleRef: "",
    }));
    assert.equal(resultado.outcome, "hold");
    assert.equal(resultado.reason, "policy-decision-evidence-missing");
  });

  it("avaliador de política que estoura segura: policy-evaluation-error", async () => {
    const resultado = await assess(makeOrder(), makeManifest(), validators, async () => {
      throw new Error("offline");
    });
    assert.equal(resultado.outcome, "hold");
    assert.equal(resultado.reason, "policy-evaluation-error");
  });

  it("validador que falha recusa e nomeia o validador: validator-failed:<id>", async () => {
    const resultado = await assess(makeOrder(), makeManifest(), [
      { id: "schema", run: async () => false },
      validators[1],
    ]);
    assert.equal(resultado.outcome, "reject");
    assert.equal(resultado.reason, "validator-failed:schema");
  });

  it("validador que estoura segura: validator-error:<id>", async () => {
    const resultado = await assess(makeOrder(), makeManifest(), [
      {
        id: "schema",
        run: async () => {
          throw new Error("offline");
        },
      },
      validators[1],
    ]);
    assert.equal(resultado.outcome, "hold");
    assert.equal(resultado.reason, "validator-error:schema");
  });

  it("defeito dentro do kernel segura: kernel-evaluation-error", async () => {
    const resultado = await evaluateWorkOrder(
      makeOrder(),
      makeManifest(),
      null as unknown as PolicyRule[],
      validators,
      policy,
    );
    assert.equal(resultado.outcome, "hold");
    assert.equal(resultado.reason, "kernel-evaluation-error");
  });
});

describe("manifesto — o construtor não aprova", () => {
  it("buildManifest nunca aprova um candidato", () => {
    const construido = buildManifest("WO-1", "preview", hash, ["schema"], ["policy.require.source"]);
    assert.equal(construido.status, "draft");
    assert.equal(construido.approvedBy, undefined);
    assert.equal(canPreview(construido), false);
    assert.equal(canDeploy(construido), false);
  });

  it("só o manifesto completo é preview, e produção nunca é preview", () => {
    assert.equal(canPreview(makeManifest()), true);
    assert.equal(canDeploy(makeManifest()), true);
    const manifesto = makeManifest();
    manifesto.state = "prod";
    assert.equal(canDeploy(manifesto), false);
  });
});

describe("admissão — só fecha com tudo em cima", () => {
  it("admite e devolve o hash da evidência e a referência da decisão", async () => {
    const resultado = await assess();
    assert.deepEqual(resultado, {
      outcome: "admit",
      reason: "independent-approval-policy-and-validators-passed",
      evidenceHash: hash,
      policyDecisionRef: "opa-decision-001",
    });
  });
});
