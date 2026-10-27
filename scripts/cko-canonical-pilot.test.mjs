import { test } from "node:test";
import assert from "node:assert/strict";
import { loadCandidateSnapshot, inspectGraph, enumerateSyntheticDomains } from "./cko-canonical-pilot.mjs";

const { data, sha256 } = loadCandidateSnapshot();
const tools = new Map(data.records.map(r => [r.tool_slug, r]));
const a = tools.get("apgar"), f = tools.get("fugulin");

test("DB source evidence and deterministic fingerprint", () => {
  assert.match(sha256, /^[0-9a-f]{64}$/);
  assert.deepEqual([...tools.keys()].sort(), ["apgar", "fugulin"]);
  assert.equal(data.source, "Supabase Calculadoras-Smart");
  assert.ok(data.records.every(t => t.candidate_only));
});

test("CKO canonical IDs, version references and holds resolve", () => {
  assert.equal(a.canonical_id, "cko:tool:clinical:apgar@1");
  assert.equal(f.canonical_id, "cko:tool:clinical:fugulin@1");
  for (const tool of [a, f]) {
    assert.equal(tool.object_versions.length, 1);
    assert.match(tool.object_versions[0].content_hash, /^[0-9a-f]{64}$/);
    assert.equal(tool.tool_state.source_of_truth, false);
    assert.equal(tool.tool_state.canonical_promotion, false);
    assert.equal(tool.tool_state.publication_state, "HOLD");
  }
});

test("claims resolve through existing nested requirement bindings, never approve automatically", () => {
  assert.equal(a.claims.length, 3);
  assert.equal(a.requirement_bridges.length, 6);
  assert.equal(new Set(a.requirement_bridges.map(x => x.evidence_ref)).size, 6);
  assert.ok(a.requirement_bridges.every(x => x.requirement_id &&
    x.extraction_status === "CANDIDATE_UNCHECKED" &&
    x.requirement_status === "CANDIDATE" &&
    x.checker_recorded === false));
  assert.equal(inspectGraph(a).can_publish, false);
});

test("normative field overlays are context, not clinical score evidence", () => {
  assert.equal(a.normative_roles.length, 7);
  assert.equal(f.normative_roles.length, 9);
  assert.ok(a.normative_roles.every(n => n.normative_ref && n.binding_role));
  assert.ok(inspectGraph(a).findings.some(x => x.code === "OBJECT_ENGINE_RULES_OR_VALIDATOR_MISSING"));
  assert.equal(inspectGraph(a).can_calculate, false);
});

test("Apgar candidate values 0,1,2 enumerate 243 synthetic cases", () => {
  const score = a.fields.filter(x => x.field_id.startsWith("TF-CAND-APGAR-"));
  assert.equal(score.length, 5);
  assert.ok(score.every(x => x.enum_values.map(v=>v.value).join(",") === "0,1,2"));
  const c = enumerateSyntheticDomains(a, score.map(x => x.field_id));
  assert.deepEqual({cases:c.cases,min:c.minimum,max:c.maximum,totals:c.totals.length},
    {cases:243,min:0,max:10,totals:11});
  assert.equal(c.clinical_release_authorized, false);
});

test("unscoped variants and context-only Fugulin must fail closed", () => {
  assert.equal(f.claims.length, 0);
  assert.equal(f.fields.length, 10);
  assert.ok(f.fields.every(x => !Array.isArray(x.enum_values)));
  assert.throws(() => enumerateSyntheticDomains(f, f.fields.map(x=>x.field_id)), /NO_COMPLETE_CANDIDATE_DOMAIN/);
  assert.equal(inspectGraph(f).verdict, "HOLD");
});

test("no fake published UI label can override CKO", () => {
  const fake = structuredClone(a);
  fake.tool_state.publication_state = "RELEASED";
  fake.tool_state.source_of_truth = true;
  fake.tool_state.canonical_promotion = true;
  assert.equal(inspectGraph(fake).verdict, "HOLD");
  assert.equal(inspectGraph(fake).can_publish, false);
});

test("no misleading PASS from fabricated engine refs or cleared normative context", () => {
  const fake = structuredClone(a);
  fake.runtime_control.object_engine_ref = "FAKE";
  fake.runtime_control.rule_pack_ref = "FAKE";
  fake.runtime_control.object_validator_ref = "FAKE";
  fake.tool_state.rights_state = "APPROVED";
  assert.equal(inspectGraph(fake).verdict, "HOLD");
  assert.ok(inspectGraph(fake).findings.some(x => x.code === "EVIDENCE_REVIEW_PENDING"));
});

test("duplicate / extraneous domain IDs and invalid formats are rejected", () => {
  assert.throws(() => enumerateSyntheticDomains(a, []), /INVALID_SYNTHETIC_SCOPE/);
  assert.throws(() => enumerateSyntheticDomains(a, ["WRONG"]), /NO_COMPLETE_CANDIDATE_DOMAIN/);
  assert.throws(() => enumerateSyntheticDomains(a, ["TF-CAND-APGAR-FC","TF-CAND-APGAR-FC"]), /INVALID_SYNTHETIC_SCOPE/);
});

test("Fugulin graph and Apgar graph never imply release", () => {
  assert.deepEqual(data.records.map(x => inspectGraph(x).verdict), ["HOLD", "HOLD"]);
  assert.ok(data.records.every(x => inspectGraph(x).findings.length > 0));
});
