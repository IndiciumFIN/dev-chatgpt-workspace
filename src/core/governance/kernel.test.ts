import { describe, expect, it } from "vitest";
import { buildManifest, canDeploy, canPreview, evaluateWorkOrder } from "./kernel";

const policyRules = [
  {
    id: "p1",
    code: "policy.require.source",
    description: "source required",
    version: "1.0.0",
    active: true,
    scope: "global",
  },
  {
    id: "p2",
    code: "policy.preview-required",
    description: "preview required",
    version: "1.0.0",
    active: true,
    scope: "preview",
  },
  {
    id: "p3",
    code: "policy.no-direct-deploy",
    description: "no direct deploy",
    version: "1.0.0",
    active: true,
    scope: "deploy",
  },
] as const;

describe("governance kernel", () => {
  it("rejects work order without policy set", async () => {
    const workOrder: any = {
      id: "wo-1",
      type: "planning",
      title: "Planejamento do piloto",
      objective: "validar fluxo",
      scope: "pilot",
      owner: "ops",
      approver: "ops-lead",
      sourceRef: "source://pilot",
      policySet: [],
      riskLevel: "medium",
      dataClassification: "internal",
      securityImpact: "low",
      environment: "pilot",
      status: "draft",
      dependencies: [],
      acceptanceCriteria: ["manifesto"],
      evidence: [],
      approvals: [],
      createdAt: "2026-10-24T00:00:00Z",
      updatedAt: "2026-10-24T00:00:00Z",
    };

    const decision = await evaluateWorkOrder(workOrder, null, [...policyRules], [async () => true]);
    expect(decision.outcome).toBe("reject");
  });

  it("holds work order without manifest", async () => {
    const workOrder: any = {
      id: "wo-2",
      type: "pilot",
      title: "Pilot de conteúdo",
      objective: "validar fluxo ponta a ponta",
      scope: "pilot",
      owner: "ops",
      approver: "ops-lead",
      sourceRef: "source://pilot",
      policySet: ["policy.require.source"],
      riskLevel: "medium",
      dataClassification: "internal",
      securityImpact: "low",
      environment: "pilot",
      status: "pending",
      dependencies: [],
      acceptanceCriteria: ["manifesto"],
      evidence: [],
      approvals: [],
      createdAt: "2026-10-24T00:00:00Z",
      updatedAt: "2026-10-24T00:00:00Z",
    };

    const decision = await evaluateWorkOrder(workOrder, null, [...policyRules], [async () => true]);
    expect(decision.outcome).toBe("hold");
  });

  it("admits work order with approved manifest and valid validators", async () => {
    const workOrder: any = {
      id: "wo-3",
      type: "pilot",
      title: "Pilot de conteúdo",
      objective: "validar fluxo ponta a ponta",
      scope: "pilot",
      owner: "ops",
      approver: "ops-lead",
      sourceRef: "source://pilot",
      policySet: ["policy.require.source", "policy.preview-required"],
      riskLevel: "medium",
      dataClassification: "internal",
      securityImpact: "low",
      environment: "pilot",
      status: "pending",
      dependencies: [],
      acceptanceCriteria: ["manifesto"],
      evidence: [],
      approvals: [],
      createdAt: "2026-10-24T00:00:00Z",
      updatedAt: "2026-10-24T00:00:00Z",
    };

    const manifest = buildManifest(
      "wo-3",
      "preview",
      "sha256:abc",
      ["schema", "policy"],
      ["policy.require.source", "policy.preview-required"],
    );

    const decision = await evaluateWorkOrder(
      workOrder,
      manifest,
      [...policyRules],
      [async () => true, async () => true],
    );

    expect(decision.outcome).toBe("admit");
  });

  it("blocks preview without approved manifest", () => {
    const manifest = buildManifest(
      "wo-3",
      "draft",
      "sha256:abc",
      ["schema"],
      ["policy.require.source"],
    );
    expect(canPreview(manifest)).toBe(false);
  });

  it("allows preview only with approved manifest", () => {
    const manifest = buildManifest(
      "wo-3",
      "preview",
      "sha256:abc",
      ["schema", "policy"],
      ["policy.require.source"],
    );
    expect(canPreview(manifest)).toBe(true);
  });

  it("allows deploy only with approved preview state", () => {
    const manifest = buildManifest(
      "wo-3",
      "preview",
      "sha256:abc",
      ["schema", "policy"],
      ["policy.require.source"],
    );
    expect(canDeploy(manifest)).toBe(true);
  });
});
