import { describe, expect, it } from "vitest";
import { buildManifest, canDeploy, canPreview, evaluateServiceOrder } from "./kernel";

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
  it("rejects activity without service order policy set", async () => {
    const order: any = {
      id: "os-1",
      type: "content",
      title: "Demo",
      owner: "ops",
      scope: "content:demo",
      sourceRef: "source://demo",
      policySet: [],
      status: "draft",
      createdAt: "2026-10-24T00:00:00Z",
      evidence: [],
    };

    const decision = await evaluateServiceOrder(order, null, [...policyRules], [async () => true]);
    expect(decision.outcome).toBe("reject");
  });

  it("holds activity without manifest", async () => {
    const order: any = {
      id: "os-2",
      type: "content",
      title: "Demo",
      owner: "ops",
      scope: "content:demo",
      sourceRef: "source://demo",
      policySet: ["policy.require.source"],
      status: "pending",
      createdAt: "2026-10-24T00:00:00Z",
      evidence: [],
    };

    const decision = await evaluateServiceOrder(order, null, [...policyRules], [async () => true]);
    expect(decision.outcome).toBe("hold");
  });

  it("admits activity with manifest and valid validators", async () => {
    const order: any = {
      id: "os-3",
      type: "content",
      title: "Demo",
      owner: "ops",
      scope: "content:demo",
      sourceRef: "source://demo",
      policySet: ["policy.require.source", "policy.preview-required"],
      status: "pending",
      createdAt: "2026-10-24T00:00:00Z",
      evidence: [],
    };

    const manifest = buildManifest(
      "os-3",
      "preview",
      "sha256:abc",
      ["schema", "policy"],
      ["policy.require.source", "policy.preview-required"],
    );

    const decision = await evaluateServiceOrder(
      order,
      manifest,
      [...policyRules],
      [async () => true, async () => true],
    );

    expect(decision.outcome).toBe("admit");
  });

  it("blocks preview without approved manifest", () => {
    const manifest = buildManifest(
      "os-3",
      "draft",
      "sha256:abc",
      ["schema"],
      ["policy.require.source"],
    );
    expect(canPreview(manifest)).toBe(false);
  });

  it("allows preview only with approved manifest", () => {
    const manifest = buildManifest(
      "os-3",
      "preview",
      "sha256:abc",
      ["schema", "policy"],
      ["policy.require.source"],
    );
    expect(canPreview(manifest)).toBe(true);
  });

  it("allows deploy only with approved preview state", () => {
    const manifest = buildManifest(
      "os-3",
      "preview",
      "sha256:abc",
      ["schema", "policy"],
      ["policy.require.source"],
    );
    expect(canDeploy(manifest)).toBe(true);
  });
});
