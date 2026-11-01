import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildManifest, canDeploy, canPreview, evaluateWorkOrder, type NamedValidator, type PolicyEvaluator } from "./kernel.ts";
import type { Manifest, PolicyRule, WorkOrder } from "./types.ts";

const hash = "a".repeat(64);
const timestamp = "2026-10-26T12:00:00Z";
const policies: PolicyRule[] = [
  { id: "p1", code: "policy.require.source", description: "source", version: "1.0.0", active: true, scope: "global" },
  { id: "p2", code: "policy.preview-required", description: "preview", version: "1.0.0", active: true, scope: "preview" },
];
const makeOrder = (): WorkOrder => ({
  id: "wo-test", type: "pilot", title: "Teste isolado", objective: "avaliar gate",
  scope: "public-backup", owner: "maker", approver: "reviewer", sourceRef: "source://test",
  findRef: "FIND-TEST-1", taskRef: "TASK-TEST-1",
  policySet: ["policy.require.source", "policy.preview-required"], riskLevel: "medium",
  dataClassification: "internal", securityImpact: "low", environment: "pilot",
  status: "draft", dependencies: [], acceptanceCriteria: ["test"],
  evidence: [], approvals: [{ id: "approval-1", approver: "reviewer", decision: "approved", approvedAt: timestamp }],
  createdAt: timestamp, updatedAt: timestamp, hash,
});
const makeManifest = (order = makeOrder()): Manifest => ({
  ...buildManifest(order.id, "preview", hash, ["schema", "rights"], order.policySet),
  status: "approved", approvedBy: "reviewer", approvedAt: timestamp,
});
const validators: NamedValidator[] = [
  { id: "schema", run: async () => ({ passed: true, evidenceRef: "evidence://schema", runRef: "run://schema" }) },
  { id: "rights", run: async () => ({ passed: true, evidenceRef: "evidence://rights", runRef: "run://rights" }) },
];
const policy: PolicyEvaluator = async () => ({
  allow: true, decisionId: "opa-decision-001", bundleRef: "bundle://candidate/1.0.0",
  bundleSignatureVerified: true, decisionEvidenceRef: "evidence://opa",
  workOrderRef: "wo-test", inputHash: hash,
});
const assess = (
  order = makeOrder(),
  manifest: Manifest | null = makeManifest(order),
  checks: NamedValidator[] = validators,
  evaluate?: PolicyEvaluator,
) => evaluateWorkOrder(order, manifest, policies, checks, evaluate ?? policy);

describe("governance kernel — fail-closed local gate", () => {
  it("rejects missing policy set", async () => {
    const order = makeOrder(); order.policySet = [];
    assert.equal((await assess(order)).reason, "policy-set-required");
  });
  it("holds missing FIND/TASK linkage and owner–approver conflicts", async () => {
    const order = makeOrder(); delete order.findRef;
    assert.equal((await assess(order)).reason, "find-task-lineage-required");
    order.findRef = "FIND-TEST-1"; delete order.taskRef;
    assert.equal((await assess(order)).reason, "find-task-lineage-required");
    order.taskRef = "TASK-TEST-1"; order.approver = order.owner;
    assert.equal((await assess(order)).reason, "independent-owner-approver-required");
  });
  it("requires a verified policy bundle and a bound policy decision", async () => {
    const order = makeOrder();
    const full = await policy({workOrder:order,manifest:makeManifest(order),activePolicies:policies});
    for (const override of [
      {bundleSignatureVerified:false},
      {decisionEvidenceRef:""},
      {workOrderRef:"WO-other"},
      {inputHash:"b".repeat(64)},
    ]) {
      assert.equal((await assess(order,makeManifest(order),validators,async()=>({...full,...override}))).reason,
        "policy-bundle-or-decision-evidence-unverified");
    }
  });
  it("does not accept boolean-only validator successes without evidence", async () => {
    const result = await assess(makeOrder(), makeManifest(), [
      {id:"schema",run:async()=>true},
      validators[1],
    ]);
    assert.equal(result.reason, "validator-evidence-required:schema");
  });
  it("holds a PASS with no run or evidence provenance", async () => {
    const result = await assess(makeOrder(),makeManifest(),[
      {id:"schema",run:async()=>({passed:true,evidenceRef:"",runRef:""})},
      validators[1],
    ]);
    assert.equal(result.reason, "validator-evidence-required:schema");
  });
  it("holds without manifest", async () => {
    assert.deepEqual(await assess(makeOrder(), null), { outcome: "hold", reason: "manifest-required" });
  });
  it("buildManifest never approves a candidate", () => {
    const built = buildManifest("WO-1", "preview", hash, ["schema"], ["policy.require.source"]);
    assert.equal(built.status, "draft");
    assert.equal(built.approvedBy, undefined);
    assert.equal(canPreview(built), false);
    assert.equal(canDeploy(built), false);
  });
  it("rejects cross-WO manifest", async () => {
    const manifest = makeManifest(); manifest.serviceOrderId = "another-wo";
    assert.equal((await assess(makeOrder(), manifest)).reason, "manifest-work-order-mismatch");
  });
  it("rejects hash mismatch and malformed hash", async () => {
    const manifest = makeManifest(); manifest.hash = "sha256:abc";
    assert.equal((await assess(makeOrder(), manifest)).reason, "manifest-integrity-mismatch");
    manifest.hash = "b".repeat(64);
    assert.equal((await assess(makeOrder(), manifest)).reason, "manifest-integrity-mismatch");
  });
  it("rejects changed/duplicated policy set", async () => {
    const manifest = makeManifest(); manifest.policySet = ["policy.require.source"];
    assert.equal((await assess(makeOrder(), manifest)).reason, "manifest-policy-set-mismatch");
  });
  it("rejects missing, unnamed or bypassed validators", async () => {
    assert.equal((await assess(makeOrder(), makeManifest(), [])).reason, "validator-manifest-mismatch");
    const manifest = makeManifest(); manifest.validators = [];
    assert.equal((await assess(makeOrder(), manifest, [])).reason, "validator-manifest-mismatch");
    assert.equal((await assess(makeOrder(), makeManifest(), [{ id: "schema", run: async () => true }])).reason, "validator-manifest-mismatch");
  });
  it("holds without independent approval, including kernel self-approval", async () => {
    const manifest = makeManifest(); manifest.approvedBy = "kernel";
    assert.equal((await assess(makeOrder(), manifest)).reason, "independent-approval-required");
    const order = makeOrder(); order.owner = "reviewer";
    assert.equal((await assess(order, makeManifest(order))).reason, "independent-owner-approver-required");
    const absent = makeOrder(); absent.approvals = [];
    assert.equal((await assess(absent, makeManifest(absent))).reason, "independent-approval-required");
  });
  it("holds if OPA evaluator is absent", async () => {
    const order = makeOrder();
    assert.equal((await evaluateWorkOrder(order, makeManifest(order), policies, validators)).reason, "policy-evaluation-unavailable");
  });
  it("rejects explicit OPA denial", async () => {
    assert.equal((await assess(makeOrder(), makeManifest(), validators, async () => ({
      allow: false, decisionId: "opa-2", bundleRef: "bundle://candidate",
    }))).reason, "policy-denied");
  });
  it("holds if policy decision evidence is missing or evaluation throws", async () => {
    assert.equal((await assess(makeOrder(), makeManifest(), validators, async () => ({
      allow: true, decisionId: "", bundleRef: "",
    }))).reason, "policy-decision-evidence-missing");
    assert.equal((await assess(makeOrder(), makeManifest(), validators, async () => { throw new Error("offline"); })).reason, "policy-evaluation-error");
  });
  it("rejects failed validator, holds unexpected exceptions", async () => {
    assert.equal((await assess(makeOrder(), makeManifest(), [
      { id: "schema", run: async () => false }, validators[1],
    ])).reason, "validator-failed:schema");
    assert.equal((await assess(makeOrder(), makeManifest(), [
      { id: "schema", run: async () => { throw new Error("offline"); } }, validators[1],
    ])).reason, "validator-error:schema");
  });
  it("admits ONLY a fully scoped positive evaluation and records decision ID", async () => {
    assert.deepEqual(await assess(), {
      outcome: "admit", reason: "independent-approval-policy-and-validators-passed",
      evidenceHash: hash, policyDecisionRef: "opa-decision-001",
    });
    assert.equal(canPreview(makeManifest()), true);
    assert.equal(canDeploy(makeManifest()), true);
  });
  it("never treats production as an eligible preview artifact", () => {
    const manifest = makeManifest(); manifest.state = "prod";
    assert.equal(canDeploy(manifest), false);
  });
});
