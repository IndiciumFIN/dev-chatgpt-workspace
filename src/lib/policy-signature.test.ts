import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  canonicalPolicyPayload,
  signAllowDecision,
  signPolicyPayload,
  verifyAllowDecision,
  verifyPolicyPayload,
} from "./policy-signature.ts";

const secret = "policy-signature-test-secret";

const decision = {
  workOrderId: "wo-1",
  policyCodes: ["publicar", "arquivo"],
  effect: "allow" as const,
};

test("o payload canônico é JSON estável em UTF-8, com códigos ordenados", () => {
  const payload = canonicalPolicyPayload(decision);
  assert.equal(
    payload,
    '{"effect":"allow","policyCodes":["arquivo","publicar"],"workOrderId":"wo-1"}',
  );
  assert.equal(
    canonicalPolicyPayload({ ...decision, policyCodes: ["arquivo", "publicar"] }),
    payload,
  );
  assert.equal(Buffer.from(payload, "utf8").toString("utf8"), payload);
});

test("HMAC-SHA256 confere o payload e recusa adulteração, assinatura errada ou ausente", () => {
  const payload = canonicalPolicyPayload(decision);
  const signature = signPolicyPayload(payload, secret);
  assert.equal(verifyPolicyPayload(payload, signature, secret), true);
  assert.equal(signAllowDecision(decision, secret), signature);
  assert.equal(verifyAllowDecision(decision, signature, secret), true);

  const tampered = payload.replace("wo-1", "wo-2");
  assert.equal(verifyPolicyPayload(tampered, signature, secret), false);
  assert.equal(verifyPolicyPayload(payload.replace('"allow"', '"deny"'), signature, secret), false);

  const unsorted = JSON.stringify({
    effect: "allow",
    policyCodes: ["publicar", "arquivo"],
    workOrderId: "wo-1",
  });
  assert.notEqual(unsorted, payload);
  assert.equal(verifyPolicyPayload(payload, signPolicyPayload(unsorted, secret), secret), false);

  const wrong = signature.slice(0, -1) + (signature.endsWith("a") ? "b" : "a");
  assert.equal(verifyPolicyPayload(payload, wrong, secret), false);
  assert.equal(verifyPolicyPayload(payload, signature, "another-test-secret"), false);
  assert.equal(verifyPolicyPayload(payload, "", secret), false);
  assert.equal(verifyPolicyPayload(payload, null, secret), false);
  assert.equal(verifyPolicyPayload(payload, undefined, secret), false);
  assert.equal(verifyPolicyPayload(payload, "zz", secret), false);
  assert.equal(verifyAllowDecision(decision, signature, ""), false);
  assert.equal(verifyAllowDecision(decision, signature, null), false);
});

test("o segredo é o argumento, não o ambiente nem uma chave no módulo", async () => {
  const payload = canonicalPolicyPayload(decision);
  const signature = signPolicyPayload(payload, secret);
  const previous = process.env.POLICY_SIGNATURE_KEY;
  process.env.POLICY_SIGNATURE_KEY = "env-secret-that-must-not-be-used";
  try {
    assert.equal(verifyPolicyPayload(payload, signature, secret), true);
    const fromEnv = signPolicyPayload(payload, "env-secret-that-must-not-be-used");
    assert.equal(verifyPolicyPayload(payload, fromEnv, secret), false);
  } finally {
    if (previous === undefined) delete process.env.POLICY_SIGNATURE_KEY;
    else process.env.POLICY_SIGNATURE_KEY = previous;
  }

  const source = await readFile(new URL("./policy-signature.ts", import.meta.url), "utf8");
  assert.match(source, /from "node:crypto"/);
  assert.match(source, /createHmac\(\s*"sha256"/);
  assert.equal(source.includes("process.env"), false);
  assert.equal(source.includes(secret), false);
});
