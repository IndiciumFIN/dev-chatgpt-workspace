import type { ExecutionGate } from "./gate";
import type { SignedArtifact } from "./signer";
import type { Finding } from "./findings";

export type KernelDecision = {
  decisionId: string;
  artifactId: string;
  artifactType: string;
  outcome: "approved" | "rejected" | "hold";
  reason: string;
  policyVersion: string;
  signature: string;
  createdAt: string;
};

export function decide(
  gate: ExecutionGate | null,
  signedArtifacts: SignedArtifact[],
  findings: Finding[],
): KernelDecision {
  const gateOk = gate && (gate.status === "homologated" || gate.status === "approved");

  if (!gateOk) {
    return {
      decisionId: `decision:${Date.now()}`,
      artifactId: gate?.id ?? "missing-gate",
      artifactType: "gate",
      outcome: "rejected",
      reason: "gate-not-homologated",
      policyVersion: "1.0.0",
      signature: `kernel:decision:${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
  }

  if (findings.some((f) => f.status !== "resolved" && f.status !== "closed")) {
    return {
      decisionId: `decision:${Date.now()}`,
      artifactId: gate?.id ?? "missing-gate",
      artifactType: "gate",
      outcome: "hold",
      reason: "open-finding-exists",
      policyVersion: "1.0.0",
      signature: `kernel:decision:${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
  }

  return {
    decisionId: `decision:${Date.now()}`,
    artifactId: gate?.id ?? "missing-gate",
    artifactType: "gate",
    outcome: "approved",
    reason: "gate-homologated-and-valid",
    policyVersion: "1.0.0",
    signature: `kernel:decision:${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
}
