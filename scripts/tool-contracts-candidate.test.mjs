import test from "node:test";
import assert from "node:assert/strict";
import { loadToolContracts } from "./load-tool-contracts.mjs";

// Source of truth is the actual runtime catalog, not a stale contract or regex.
test("candidate clinical tools remain catalogued but are never promoted", () => {
  const registry = loadToolContracts();
  const unique = new Set(registry.tools.map(t => t.slug));
  assert.equal(unique.size, registry.tools.length);
  for (const slug of ["aldrete", "exames-laboratoriais"]) {
    const tool = registry.tools.find(t => t.slug === slug);
    assert.ok(tool, "Missing candidate tool from generated-source runtime: " + slug);
    assert.equal(tool.publicacao, "candidata", "Candidate incorrectly promoted: " + slug);
  }
  for (const slug of ["braden", "morse", "apgar", "gotejamento", "imc"]) {
    assert.ok(unique.has(slug), "Missing existing canonical tool: " + slug);
  }
});
