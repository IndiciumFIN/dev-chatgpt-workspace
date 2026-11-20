import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  authEnabledFromEnvValue,
  buildAuthEnabled,
  compareAuthInvariant,
  authInvariantWarnings,
  probeDevAuthEnabled,
} from "./check-auth-invariant.mjs";

test("R77: auth flag is fail-closed unless explicitly true", () => {
  for (const value of [undefined, null, "", "false", "FALSE", "True", "1", "yes", " true", "true ", false, true]) {
    assert.equal(authEnabledFromEnvValue(value), false, String(value));
  }
  assert.equal(authEnabledFromEnvValue("true"), true);
});

test("R77: build flag defaults off without workspace env or process opt-in", () => {
  const root = mkdtempSync(join(tmpdir(), "auth-invariant-r77-"));
  try {
    assert.equal(buildAuthEnabled(root, {}), false);
    assert.equal(buildAuthEnabled(root, { VITE_AUTH_ENABLED: "false" }), false);
    assert.equal(buildAuthEnabled(root, { VITE_AUTH_ENABLED: "true" }), true);
    assert.equal(buildAuthEnabled(root, { VITE_AUTH_ENABLED: "" }), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R77: dev probe refuses absent or unexpected auth values", async () => {
  const response = (value) => async () => ({ ok: true, text: async () => JSON.stringify(value) });
  assert.equal(await probeDevAuthEnabled("http://localhost:8080", response({})), false);
  assert.equal(await probeDevAuthEnabled("http://localhost:8080", response({ VITE_AUTH_ENABLED: "disabled" })), false);
  assert.equal(await probeDevAuthEnabled("http://localhost:8080", response({ VITE_AUTH_ENABLED: "true" })), true);
  assert.equal(await probeDevAuthEnabled("http://localhost:8080", response({ VITE_AUTH_ENABLED: "false" })), false);
  assert.equal(await probeDevAuthEnabled("http://localhost:8080", response(null)), null);
  assert.equal(await probeDevAuthEnabled("http://localhost:8080", async () => ({ ok: false })), null);
});

test("R77: mismatch and unknown server state cannot be labeled as verified agreement", () => {
  const diverged = compareAuthInvariant({ devAuthEnabled: true, buildAuthEnabled: false });
  assert.equal(diverged.status, "diverged");
  assert.equal(authInvariantWarnings(diverged).length, 1);
  const unknown = compareAuthInvariant({ devAuthEnabled: null, buildAuthEnabled: false });
  assert.equal(unknown.status, "indeterminate");
  assert.notEqual(unknown.status, "ok");
  const off = compareAuthInvariant({ devAuthEnabled: false, buildAuthEnabled: false });
  assert.equal(off.status, "ok");
});
