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
    const tool = registry.tools.find(t => t.slug === slug);
    assert.ok(tool, "Missing existing canonical tool: " + slug);
    assert.equal(tool.status, "EVIDENCE_BOUND", "Binding status not derived from normative registry");
    assert.ok(tool.sourceIds.length > 0, "Provenance was erased: " + slug);
  }
  assert.equal(registry.tools.find(t => t.slug === "aldrete").status, "EVIDENCE_BOUND");
  assert.ok(registry.tools.find(t => t.slug === "aldrete").sourceIds.length > 0);
  assert.equal(registry.tools.find(t => t.slug === "exames-laboratoriais").status, "CANDIDATE");
});
