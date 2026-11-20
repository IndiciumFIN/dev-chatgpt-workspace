// Run the existing static secret and auth contract suite in the main CI glob.
import "./test-auth-secret-env.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const preview = readFileSync(new URL("../src/lib/auth/preview.ts", import.meta.url), "utf8");
const verify = readFileSync(new URL("../src/lib/auth/verify.server.ts", import.meta.url), "utf8");
test("auth preview does not contain a literal credential", () => {
  assert.match(preview, /PREVIEW_CLIENT_SECRET\s*=\s*process\.env\.GROK_PREVIEW_CLIENT_SECRET\?\.trim\(\)\s*\?\?\s*""/);
  assert.doesNotMatch(preview, /PREVIEW_CLIENT_SECRET\s*=\s*["'][^"']{16,}["']/);
});
test("non-development or deployed requests cannot receive shared dev identity", () => {
  assert.match(verify, /process\.env\.NODE_ENV === "development"/);
  assert.match(verify, /!process\.env\.VERCEL &&/);
  assert.match(verify, /!process\.env\.VERCEL_ENV &&/);
  assert.match(verify, /!databaseConfigured/);
  assert.match(verify, /if \(!devFallbackAllowed\) \{\s*throw new UnauthorizedError\(\);/);
});
