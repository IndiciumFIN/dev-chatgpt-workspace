/**
 * Offline executable evidence replay: Apgar candidate fields from Supabase CKO.
 *
 * Reads a frozen SQL export of metadata only; no patient information, no DB
 * connection, no executable clinical rules and no approval/promotion side effects.
 * This is an arithmetic test of candidate enums, NOT a validated clinical score.
 *
 * Run: node --test scripts/cko-db-first-replay.test.mjs
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const base = resolve(root, "audit-evidence/cko/db-first/20261026");
const prerequisites = [
  "apgar-field-domains-from-db.json",
  "apgar-requirement-bridge-replay.json",
  "apgar-fugulin-live-readback.json",
].map(name => resolve(base, name));
if (prerequisites.some(path => !existsSync(path))) {
  test("CKO replay checks remain blocked until deferred evidence is restored", {
    skip: "NOT_RUN: one or more DB-derived CKO replay artifacts are deferred; no fixture was synthesized.",
  }, () => {});
} else {
function load(filename) {
  return JSON.parse(readFileSync(resolve(base, filename), "utf8"));
}

const fixture = load("apgar-field-domains-from-db.json");
const trace = load("apgar-requirement-bridge-replay.json");
const prior = load("apgar-fugulin-live-readback.json");
const bySlug = new Map(prior.records.map((row) => [row.tool_slug, row]));

const values = (field) => field.enum_values.map((choice) => choice.value);

function arithmeticCandidate(criteria, answers) {
  // Never expose this local testing helper to a production runtime.
  if (!Array.isArray(criteria) || criteria.length !== 5) return { ok: false, reason: "MISSING_CRITERIA" };
  if (Object.keys(answers).length !== criteria.length) return { ok: false, reason: "MISSING_OR_EXTRA_FIELD" };
  for (const field of criteria) {
    if (!Object.hasOwn(answers, field.source_field_id)) return { ok: false, reason: "MISSING_FIELD" };
    if (!values(field).includes(answers[field.source_field_id])) return { ok: false, reason: "INVALID_CHOICE" };
  }
  return {
    ok: true,
    provisionalSum: criteria.reduce((sum, field) => sum + answers[field.source_field_id], 0),
    purpose: "CANDIDATE_ENUM_ARITHMETIC_ONLY",
  };
}

function eligibleForClinicalRelease(record, evidence, candidate) {
  return candidate.clinical_release_authorized === true
    && evidence.extraction_state !== "CANDIDATE_UNCHECKED"
    && evidence.bridge.awaiting_checker === 0
    && record.source_of_truth === true
    && record.canonical_promotion === true
    && record.claim_count > 0
    && record.pending_claim_count === 0
    && record.evidence_refs_unresolved_in_cko === 0
    && typeof record.object_engine_ref === "string"
    && record.object_engine_ref.length > 0
    && typeof record.rule_pack_ref === "string"
    && record.rule_pack_ref.length > 0
    && record.named_run_count > 0
    && record.clinical_review_status === "APPROVED"
    && record.publication_state === "RELEASED";
}

test("DB export is explicitly a candidate read-only fixture", () => {
  assert.equal(fixture.query_scope, "READ_ONLY_CANDIDATE_SCORING_FIELDS");
  assert.equal(fixture.clinical_release_authorized, false);
  assert.equal(fixture.fields.length, 5);
  assert.equal(trace.access, "READ_ONLY");
});

test("five scoring fields have typed required 0/1/2 choices", () => {
  const ids = new Set();
  for (const field of fixture.fields) {
    assert.equal(field.required_status, "REQUIRED");
    assert.equal(field.validation_status, "PASS_CONTRACT_COMPLETE");
    assert.deepEqual([...values(field)].sort(), [0, 1, 2]);
    assert.ok(!ids.has(field.source_field_id));
    ids.add(field.source_field_id);
  }
  assert.deepEqual([...ids].sort(), [
    "apgar::cor", "apgar::fc", "apgar::reflexo", "apgar::resp", "apgar::tonus",
  ]);
});

test("minutes and patient identifiers never enter the scoring choice set", () => {
  for (const field of fixture.fields) {
    assert.ok(!/minuto|pac|min|nome|data/i.test(field.source_field_id));
  }
});

test("independently replays all 243 synthetic combinations from the DB fixture", () => {
  let tuples = [{}];
  for (const field of fixture.fields) {
    tuples = tuples.flatMap((answer) =>
      values(field).map((v) => ({ ...answer, [field.source_field_id]: v })));
  }
  assert.equal(tuples.length, 243);
  const totals = tuples.map((tuple) => {
    const result = arithmeticCandidate(fixture.fields, tuple);
    assert.equal(result.ok, true);
    assert.equal(result.purpose, "CANDIDATE_ENUM_ARITHMETIC_ONLY");
    return result.provisionalSum;
  });
  assert.equal(Math.min(...totals), trace.arithmetic.arithmetic_min);
  assert.equal(Math.max(...totals), trace.arithmetic.arithmetic_max);
  assert.equal(new Set(totals).size, trace.arithmetic.distinct_totals);
  assert.equal(totals.length, trace.arithmetic.synthetic_combinations);
});

test("invalid, unknown and missing fields fail closed", () => {
  const valid = Object.fromEntries(fixture.fields.map((f) => [f.source_field_id, 0]));
  const first = fixture.fields[0].source_field_id;
  assert.deepEqual(arithmeticCandidate(fixture.fields, { ...valid, [first]: 3 }), {
    ok: false, reason: "INVALID_CHOICE",
  });
  assert.equal(arithmeticCandidate(fixture.fields, { ...valid, extra: 0 }).ok, false);
  const missing = { ...valid }; delete missing[first];
  assert.equal(arithmeticCandidate(fixture.fields, missing).ok, false);
});

test("all six evidence references bridge to unchecked candidate requirements", () => {
  const b = trace.bridge;
  assert.equal(b.references_total, 6);
  assert.equal(b.bridged_to_requirement, 6);
  assert.equal(b.unchecked_extractions, 6);
  assert.equal(b.candidate_requirements, 6);
  assert.equal(b.awaiting_checker, 6);
  assert.equal(trace.extraction_state, "CANDIDATE_UNCHECKED");
});

test("synthetic arithmetic PASS cannot release Apgar clinically", () => {
  const apgar = bySlug.get("apgar");
  assert.equal(apgar.publication_state, "HOLD");
  assert.equal(apgar.object_engine_ref, null);
  assert.equal(apgar.rule_pack_ref, null);
  assert.equal(eligibleForClinicalRelease(apgar, trace, fixture), false);
});

test("a forged publication label cannot bypass source and Kernel gates", () => {
  const apgar = bySlug.get("apgar");
  const forged = { ...apgar, publication_state: "RELEASED", source_of_truth: true, canonical_promotion: true };
  assert.equal(eligibleForClinicalRelease(forged, trace, fixture), false);
});

test("unchecked extraction still blocks even if synthetic engine flags are forged", () => {
  const apgar = bySlug.get("apgar");
  const forged = { ...apgar, publication_state: "RELEASED", source_of_truth: true,
    canonical_promotion: true, object_engine_ref: "FAKE", rule_pack_ref: "FAKE",
    named_run_count: 1, pending_claim_count: 0, evidence_refs_unresolved_in_cko: 0,
    clinical_review_status: "APPROVED" };
  const candidate = { ...fixture, clinical_release_authorized: true };
  assert.equal(eligibleForClinicalRelease(forged, trace, candidate), false);
});

test("Fugulin with 10 context fields and 0 scoring domains must not compute", () => {
  assert.equal(trace.arithmetic.fugulin_total_fields, 10);
  assert.equal(trace.arithmetic.fugulin_enum_fields, 0);
  const fugulin = bySlug.get("fugulin");
  assert.equal(fugulin.claim_count, 0);
  assert.equal(fugulin.publication_state, "HOLD");
  assert.equal(arithmeticCandidate([], {}).ok, false);
});
}
