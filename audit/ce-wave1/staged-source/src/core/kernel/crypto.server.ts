/**
 * Ed25519 detached verification for evidence integrity, NODE SERVER ONLY.
 * This is a cryptographic primitive, NOT a Kernel approval or tool grant.
 * The server must independently verify persisted WO, identity, policy, expiry,
 * independence of approver and tool scope BEFORE issuing any authorization.
 */
import { createHash, createPrivateKey, createPublicKey, sign, verify } from "node:crypto";

type StringMap = Record<string, unknown>;
export type EvidenceEnvelope = {
  schemaVersion: 1;
  workOrderId: string;
  policyBundleId: string;
  policyVersion: string;
  actorId: string;
  evidenceRef: string;
  evidenceSha256: string;
  issuedAt: string;
  expiresAt: string;
  decision: "HOLD" | "REJECT" | "ADMIT_CANDIDATE";
};
export type DetachedEvidenceSignature = {
  algorithm: "Ed25519";
  keyId: string;
  sha256: string;
  signatureBase64: string;
  envelope: EvidenceEnvelope;
};
const shaPattern = /^[a-f0-9]{64}$/;

function requiredString(x: unknown, name: string): asserts x is string {
  if (typeof x !== "string" || !x.trim()) throw new Error("EVIDENCE_FIELD_REQUIRED:" + name);
}
function canonical(value: unknown): string {
  if (value === null || typeof value === "string" || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "number" && Number.isFinite(value)) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    const object = value as StringMap;
    return `{${Object.keys(object).sort().map(key => {
      if (object[key] === undefined) throw new Error("UNDEFINED_CANONICAL_VALUE");
      return `${JSON.stringify(key)}:${canonical(object[key])}`;
    }).join(",")}}`;
  }
  throw new Error("UNSUPPORTED_CANONICAL_VALUE");
}
export function canonicalEvidence(envelope: EvidenceEnvelope): Buffer {
  if (!envelope || envelope.schemaVersion !== 1 ||
      !["HOLD", "REJECT", "ADMIT_CANDIDATE"].includes(envelope.decision)) {
    throw new Error("INVALID_EVIDENCE_ENVELOPE");
  }
  for (const key of ["workOrderId", "policyBundleId", "policyVersion", "actorId", "evidenceRef", "issuedAt", "expiresAt"] as const) {
    requiredString(envelope[key], key);
  }
  if (!shaPattern.test(envelope.evidenceSha256)) throw new Error("INVALID_EVIDENCE_SHA256");
  const issued = Date.parse(envelope.issuedAt), expires = Date.parse(envelope.expiresAt);
  if (!Number.isFinite(issued) || !Number.isFinite(expires) || expires <= issued) {
    throw new Error("INVALID_EVIDENCE_TIME_RANGE");
  }
  if (Object.keys(envelope).sort().join(",") !==
      ["schemaVersion", "workOrderId", "policyBundleId", "policyVersion", "actorId", "evidenceRef", "evidenceSha256", "issuedAt", "expiresAt", "decision"].sort().join(",")) {
    throw new Error("UNRECOGNIZED_EVIDENCE_FIELD");
  }
  return Buffer.from(`CE-KERNEL-EVIDENCE-v1\n${canonical(envelope)}`, "utf8");
}

/** Only a trusted server with a provisioned private key may call this. */
export function sealEvidence(envelope: EvidenceEnvelope, privatePem: string, keyId: string): DetachedEvidenceSignature {
  requiredString(privatePem, "privatePem");
  requiredString(keyId, "keyId");
  const key = createPrivateKey(privatePem);
  if (key.asymmetricKeyType !== "ed25519") throw new Error("ED25519_REQUIRED");
  const bytes = canonicalEvidence(envelope);
  return {
    algorithm: "Ed25519", keyId, sha256: createHash("sha256").update(bytes).digest("hex"),
    signatureBase64: sign(null, bytes, key).toString("base64"), envelope,
  };
}

/** Verification includes signature, bound data and time, but NOT admission authority. */
export function verifySealedEvidence(
  signed: DetachedEvidenceSignature,
  publicPem: string,
  expectedKeyId: string,
  now: Date = new Date(),
): boolean {
  try {
    if (!signed || signed.algorithm !== "Ed25519" || signed.keyId !== expectedKeyId ||
        typeof signed.signatureBase64 !== "string" || !/^[A-Za-z0-9+/]{86}==$/.test(signed.signatureBase64)) return false;
    const bytes = canonicalEvidence(signed.envelope);
    if (createHash("sha256").update(bytes).digest("hex") !== signed.sha256) return false;
    if (!Number.isFinite(now.getTime()) || Date.parse(signed.envelope.issuedAt) > now.getTime() ||
        Date.parse(signed.envelope.expiresAt) <= now.getTime()) return false;
    const key = createPublicKey(publicPem);
    return key.asymmetricKeyType === "ed25519" &&
      verify(null, bytes, key, Buffer.from(signed.signatureBase64, "base64"));
  } catch { return false; }
}
