import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { inspectVercelOutput } from "./ce-vercel-output-contract.mjs";

function fixture(config = { version: 3 }, withFunction = true) {
  const root = mkdtempSync(join(tmpdir(), "ce-vercel-gate-"));
  const dir = join(root, ".vercel", "output");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "nitro.json"), "{}");
  if (config !== null) writeFileSync(join(dir, "config.json"), typeof config === "string" ? config : JSON.stringify(config));
  if (withFunction) mkdirSync(join(dir, "functions", "__server.func"), { recursive: true });
  return { root, dispose: () => rmSync(root, { recursive: true, force: true }) };
}

test("a complete version 3 server build passes", () => {
  const f = fixture();
  try { assert.equal(inspectVercelOutput(f.root).pass, true); }
  finally { f.dispose(); }
});
test("nitro.json alone is not proof of a Vercel build", () => {
  const f = fixture(null);
  try {
    const v = inspectVercelOutput(f.root);
    assert.equal(v.pass, false);
    assert.ok(v.problems.some((x) => x.includes("MISSING_BUILD_OUTPUT_CONFIG")));
  } finally { f.dispose(); }
});
test("reject invalid version, invalid manifest and missing server function", () => {
  for (const [config, hasFunction] of [[{ version: 2 }, true], ["{", true], [{ version: 3 }, false]]) {
    const f = fixture(config, hasFunction);
    try { assert.equal(inspectVercelOutput(f.root).pass, false); }
    finally { f.dispose(); }
  }
});
