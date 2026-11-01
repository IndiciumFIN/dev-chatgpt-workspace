import type { SignedPackage } from "./signing";

export function verifyPackage(pack: SignedPackage): boolean {
  if (!pack.packageId) return false;
  if (!pack.version) return false;
  if (!pack.hash) return false;
  if (pack.status === "revoked") return false;
  return true;
}
