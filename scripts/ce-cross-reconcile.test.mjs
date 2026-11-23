import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const sha = (c) => c.repeat(64);
const expected = ["github:ce-main", "supabase:ce-smart", "drive:ce"];
const base = {
  canonical_key: "ce:tool:braden",
  record_ref: "verified-source-ref",
  artifact_class: "tool-contract",
  rights_state: "CLEARED",
  content_sha256: sha("a"),
  semantic_sha256: sha("b"),
  expected_source_ids: expected,
};
const source = (source_kind, source_id) => ({
  source_kind, source_id,
  snapshot_ref: "pinned-snapshot-20261120",
  complete: true,
  cursor_exhausted: true,
  records: [structuredClone(base)],
});
const clean = () => [
  source("github", expected[0]),
  source("supabase", expected[1]),
  source("drive", expected[2]),
];
function cross(snapshots) {
  const temp = mkdtempSync(join(tmpdir(), "ce-cross-"));
  try {
    const args = ["scripts/ce-cross-reconcile.py"];
    for (let i = 0; i < snapshots.length; i += 1) {
      const input = join(temp, "source-" + i + ".json");
      writeFileSync(input, JSON.stringify(snapshots[i]));
      args.push("--input", input);
    }
    const reportPath = join(temp, "cross.json");
    args.push("--output", reportPath, "--strict");
    const run = spawnSync("python3", args, { encoding: "utf8" });
    assert.notEqual(run.status, null, run.error?.message || run.stderr);
    return { code: run.status, report: JSON.parse(readFileSync(reportPath, "utf8")), stderr: run.stderr };
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}
test("CE Python n-way cross checks GitHub, Supabase, Drive in all three pairs", () => {
  const result = cross(clean());
  assert.equal(result.code, 0, result.stderr);
  assert.equal(result.report.status, "CROSS_OK_NOT_RELEASE");
  assert.equal(result.report.counts.cross_ok_not_release, 1);
  assert.equal(result.report.pairs.length, 3);
  assert.deepEqual(result.report.pairs.map(x => x.shared), [1, 1, 1]);
  assert.equal(result.report.auto_merge, false);
  assert.equal(result.report.remote_writes, false);
  assert.equal(result.report.clinical_release, false);
});
test("one diverging Drive snapshot defeats two agreeing sources", () => {
  const inputs = clean();
  inputs[2].records[0].semantic_sha256 = sha("c");
  const r = cross(inputs);
  assert.equal(r.code, 2);
  assert.ok(r.report.decisions[0].issues.includes("SEMANTIC_MISMATCH"));
});
test("missing Drive or incomplete pagination is never globally PASS", () => {
  const omitted = cross(clean().slice(0, 2));
  assert.equal(omitted.code, 2);
  assert.ok(omitted.report.violations.some(x => x.startsWith("SOURCE_KIND_MISSING")));
  const inputs = clean();
  inputs[1].cursor_exhausted = false;
  assert.equal(cross(inputs).code, 2);
});
test("global snapshot violations propagate HOLD to every object decision", () => {
  const incomplete = clean();
  incomplete[1].cursor_exhausted = false;
  const r = cross(incomplete);
  assert.equal(r.code, 2);
  assert.equal(r.report.status, "HOLD_RECONCILIATION");
  assert.equal(r.report.decisions[0].state, "HOLD");
  assert.ok(r.report.decisions[0].issues.some(x => x.startsWith("SNAPSHOT_INCOMPLETE:")));
  assert.equal(r.report.counts.cross_ok_not_release, 0);

  const missing = cross(clean().slice(0, 2));
  assert.equal(missing.code, 2);
  assert.equal(missing.report.decisions[0].state, "HOLD");
  assert.ok(missing.report.decisions[0].issues.some(x => x.startsWith("SOURCE_KIND_MISSING:")));
});
test("duplicate source objects, missing hashes, rights and single-source stay HOLD", () => {
  const dup = clean();
  dup[0].records.push(structuredClone(dup[0].records[0]));
  assert.ok(cross(dup).report.decisions[0].issues.includes("DUPLICATE_REVIEW"));

  const rights = clean();
  rights[2].records[0].rights_state = "UNRESOLVED";
  assert.ok(cross(rights).report.decisions[0].issues.includes("RIGHTS_NOT_CLEARED"));

  const hash = clean();
  hash[1].records[0].content_sha256 = null;
  assert.ok(cross(hash).report.decisions[0].issues.includes("CONTENT_SHA256_MISSING"));

  const only = clean();
  only[1].records = [];
  only[2].records = [];
  assert.ok(cross(only).report.decisions[0].issues.includes("SOURCE_ONLY"));
});
test("misaligned mapping or expected-source sets cannot silently pass", () => {
  const inputs = clean();
  inputs[2].records[0].canonical_key = "ce:tool:other";
  const result = cross(inputs);
  assert.equal(result.code, 2);
  assert.ok(result.report.decisions.some(d => d.issues.some(i => i.startsWith("SOURCE_MISSING"))));

  const mismatch = clean();
  mismatch[0].records[0].expected_source_ids = [expected[0]];
  assert.ok(cross(mismatch).report.decisions[0].issues.includes("REQUIRED_SOURCE_DISAGREEMENT"));
});
