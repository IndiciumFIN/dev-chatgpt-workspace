export type SignedPackage = {
  packageId: string;
  version: string;
  signerId: string;
  signerKeyId: string;
  hash: string;
  signedAt: string;
  environment: "admin" | "control" | "execution" | "audit";
  allowedRoles: string[];
  status: "approved" | "rejected" | "revoked";
};

export function signPackage(input: Omit<SignedPackage, "signature">): SignedPackage & { signature: string } {
  return {
    ...input,
    signature: `sig:${input.packageId}:${input.version}:${input.hash}`,
  };
}
