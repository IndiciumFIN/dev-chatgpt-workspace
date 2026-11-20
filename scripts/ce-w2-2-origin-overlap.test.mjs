import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const base = new URL("../", import.meta.url);
const w21 = number => JSON.parse(readFileSync(new URL(`registers/governance/ce-w2-1-pr${number}-full-tree-union-20261120.v1.json`, base), "utf8"));
const resultPath = "registers/governance/ce-w2-2-pr32-pr36-shared-origin-20261120.v1.json";

test("W2.2: source path intersections match 2 immutable W2.1 manifests and contain all 480 differences", () => {
  const raw = readFileSync(new URL(resultPath, base));
  const sha = createHash("sha1").update(`blob ${raw.length}\0`).update(raw).digest("hex");
  assert.equal(sha, "bcae37d1e74329ac853c2e77cc089bcf606f866d");
  const v = JSON.parse(raw.toString("utf8"));
  const a = w21(32), b = w21(36);
  assert.equal(v.protocol, "CE.CROSS.W2.2");
  assert.equal(v.main_baseline_sha, a.baseline_main_sha);
  assert.equal(a.baseline_main_sha, b.baseline_main_sha);
  assert.deepEqual(v.sources.map(x => x.sha), [a.source_commit_sha, b.source_commit_sha]);
  assert.deepEqual(v.sources.map(x => x.tree), [a.source_tree_sha, b.source_tree_sha]);
  assert.deepEqual(v.sources.map(x => x.manifest_git_blob_sha), [
    "8d570f45bc953860d798d09caac123bb9c54ab6d",
    "ebdd0bb3a43c2ccf3b8873fe2644f72253c2b5b0",
  ]);
  const toSource = m => new Map(m.rows.filter(x => x[1] !== "C").map(x => [x[0], x]));
  const x = toSource(a), y = toSource(b);
  let same = 0; const diffs = [], extras = [], only32 = [];
  const roots = {};
  for (const [p, r] of x) {
    const q = y.get(p);
    if (!q) { only32.push(p); continue; }
    const sameMode = (r[1] !== "T" && q[1] !== "T")
      || (r[1] === "T" && q[1] === "T" && r[4] === q[4]);
    if (r[2] === q[2] && sameMode) same++;
    else {
      diffs.push([p, r[2], q[2], r[1], q[1]]);
      (roots[p.split("/")[0]] ??= { diff:0, additional36:0 }).diff++;
    }
  }
  for (const [p,r] of y) {
    if (!x.has(p)) {
      extras.push([p, r[2], r[1]]);
      (roots[p.split("/")[0]] ??= { diff:0, additional36:0 }).additional36++;
    }
  }
  assert.deepEqual(only32, []);
  assert.equal(same, 15542);
  assert.equal(diffs.length, 53);
  assert.equal(extras.length, 427);
  assert.equal(v.source32_count, x.size);
  assert.equal(v.source36_count, y.size);
  assert.equal(v.identical_git_sha_and_mode, same);
  assert.equal(v.shared_different, diffs.length);
  assert.equal(v.only36, extras.length);
  assert.deepEqual(v.difference_rows, diffs);
  assert.deepEqual(v.pr36_extra_rows, extras);
  assert.deepEqual(v.affected_roots, roots);
  assert.equal(v.authorization_to_merge, false);
  assert.equal(v.closure_status, "OPEN");
  assert.equal(v.no_revisit, false);
});
