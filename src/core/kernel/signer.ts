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

/**
 * NO TRUST ANCHOR is provisioned in the client/runtime. Never manufacture a
 * 'kernel:*' string that callers might treat as a cryptographic signature.
 * Real signing must occur in an independent, authenticated service.
 */
export function signArtifact(_input: Omit<SignedArtifact, "signature">): SignedArtifact {
  throw new Error("TRUSTED_KERNEL_SIGNER_NOT_CONFIGURED");
}
