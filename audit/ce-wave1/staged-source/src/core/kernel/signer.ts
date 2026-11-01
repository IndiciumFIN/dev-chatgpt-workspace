/**
 * Legacy API retained so existing imports compile, but never fabricates signatures.
 * Actual cryptographic evidence sealing must happen in a trusted server process;
 * see crypto.server.ts. Sealing evidence does not authorize execution.
 */
export type SignedArtifact = {
  artifactId: string;
  artifactType: "workflow" | "work-order" | "tool" | "source" | "manifest" | "finding" | "evidence" | "gate";
  status: "approved" | "rejected" | "hold" | "revoked";
  signer: "kernel";
  signature: string;
  hash: string;
  createdAt: string;
  reason?: string;
  policyVersion: string;
};

/** @deprecated Insecure local signing is disabled. */
export function signArtifact(_input: Omit<SignedArtifact, "signature">): SignedArtifact {
  throw new Error("LEGACY_SYNTHETIC_SIGNATURE_DISABLED");
}
