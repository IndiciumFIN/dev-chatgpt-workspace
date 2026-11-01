import { createHmac, timingSafeEqual } from "node:crypto";

/** Facts covered by an allow decision. The effect is part of the signed bytes. */
export type AllowDecision = {
  workOrderId: string;
  policyCodes: readonly string[];
  effect: "allow";
};

/**
 * Stable UTF-8 JSON: sorted keys, sorted policy codes, effect allow.
 * Callers do not choose the byte layout.
 */
export function canonicalPolicyPayload(input: AllowDecision): string {
  if (input.effect !== "allow") {
    throw new Error("policy signature effect must be allow");
  }
  const policyCodes = [...input.policyCodes].sort();
  return JSON.stringify({
    effect: "allow" as const,
    policyCodes,
    workOrderId: input.workOrderId,
  });
}

function hmacSha256(payload: string, secret: string): Buffer {
  return createHmac("sha256", secret).update(Buffer.from(payload, "utf8")).digest();
}

/** HMAC-SHA256 hex of an already canonical UTF-8 payload. The secret is an argument. */
export function signPolicyPayload(payload: string, secret: string): string {
  if (!secret) throw new Error("policy signature secret is required");
  return hmacSha256(payload, secret).toString("hex");
}

export function signAllowDecision(input: Omit<AllowDecision, "effect">, secret: string): string {
  return signPolicyPayload(
    canonicalPolicyPayload({
      workOrderId: input.workOrderId,
      policyCodes: input.policyCodes,
      effect: "allow",
    }),
    secret,
  );
}

export function verifyPolicyPayload(
  payload: string,
  signature: string | null | undefined,
  secret: string,
): boolean {
  if (!secret || typeof signature !== "string" || signature.length === 0) return false;
  const expected = hmacSha256(payload, secret);
  const actual = Buffer.from(signature, "hex");
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export function verifyAllowDecision(
  input: Omit<AllowDecision, "effect">,
  signature: string | null | undefined,
  secret: string | null | undefined,
): boolean {
  if (!secret) return false;
  return verifyPolicyPayload(
    canonicalPolicyPayload({
      workOrderId: input.workOrderId,
      policyCodes: input.policyCodes,
      effect: "allow",
    }),
    signature,
    secret,
  );
}
