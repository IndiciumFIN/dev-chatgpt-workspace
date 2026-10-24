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

export function signArtifact(input: Omit<SignedArtifact, "signature">): SignedArtifact {
  return {
    ...input,
    signature: `kernel:${input.artifactType}:${input.artifactId}:${input.hash}`,
  };
}
