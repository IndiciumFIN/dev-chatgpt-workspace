import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const root = new URL("../", import.meta.url);
const expected = {
  32: {
    source: "8c0c4b6f9c049bb5bf13de260074b5020b08a07d",
    tree: "7ef0814dd98acaa0428325c2cfcbaa4d5ad9b231",
    blob: "8d570f45bc953860d798d09caac123bb9c54ab6d",
    main: 3133, sourceCount: 15595, union: 16216,
    counts: { E:2072, D:140, S:13083, C:621, T:300 },
  },
  36: {
    source: "65486491dece96e107a1f3f5172a473d7421f14d",
    tree: "e112786bc917a99b50bc41f45718118d6d1289c8",
    blob: "ebdd0bb3a43c2ccf3b8873fe2644f72253c2b5b0",
    main: 3133, sourceCount: 16022, union: 16242,
    counts: { E:2450, D:163, S:13109, C:220, T:300 },
  },
};
const sha40 = /^[0-9a-f]{40}$/;

for (const [number, pin] of Object.entries(expected)) {
  test(`W2.1 PR #${number}: full-tree proof, row accounting, stable Git blob, no false SEALED`, () => {
    const path = `registers/governance/ce-w2-1-pr${number}-full-tree-union-20261120.v1.json`;
    const raw = readFileSync(new URL(path, root));
    const gitBlobSha = createHash("sha1")
      .update(`blob ${raw.length}\0`).update(raw).digest("hex");
    assert.equal(gitBlobSha, pin.blob, "File bytes differ from pinned Git blob");
    const v = JSON.parse(raw.toString("utf8"));
    assert.equal(v.protocol, "CE.CROSS.W2.1");
    assert.equal(v.pr, Number(number));
    assert.equal(v.repository, "IndiciumFIN/dev-chatgpt-workspace");
    assert.equal(v.source_commit_sha, pin.source);
    assert.equal(v.source_tree_sha, pin.tree);
    assert.equal(v.baseline_main_sha, "d977c6ef1e142d4a5c9dd3dfc528912b44f3b031");
    assert.equal(v.baseline_main_tree_sha, "e72c4f34d6f2265d79992502ea4c2fca5c5fe8ce");
    assert.equal(v.api_recursive_truncated, false);
    assert.equal(v.closure_status, "OPEN");
    assert.equal(v.no_revisit, false);
    assert.equal(v.main_non_tree, pin.main);
    assert.equal(v.source_non_tree, pin.sourceCount);
    assert.equal(v.union_non_tree, pin.union);
    assert.equal(v.rows.length, pin.union);
    const counts = { E:0,D:0,S:0,C:0,T:0 }, roots = {};
    let last = null;
    for (const row of v.rows) {
      assert.ok(Array.isArray(row) && (row.length === 4 || row.length === 8), "Invalid row format");
      const [path, code, src, main] = row;
      assert.ok(typeof path === "string" && path.length > 0 && !path.includes("\0"), "Invalid path");
      if (last !== null) assert.ok(path > last, "Rows must be unique and bytewise sorted");
      last = path;
      assert.ok(Object.hasOwn(counts, code), "Unexpected decision status");
      counts[code]++;
      const rootPath = path.split("/")[0];
      (roots[rootPath] ??= {E:0,D:0,S:0,C:0,T:0})[code]++;
      if (code === "E") {
        assert.ok(sha40.test(src)); assert.equal(src, main);
      } else if (code === "D") {
        assert.ok(sha40.test(src) && sha40.test(main) && src !== main);
      } else if (code === "S") {
        assert.ok(sha40.test(src)); assert.equal(main, "");
      } else if (code === "C") {
        assert.equal(src, ""); assert.ok(sha40.test(main));
      } else {
        assert.equal(row.length, 8);
        assert.ok(sha40.test(src) && sha40.test(main));
        assert.ok(row[4] !== row[5] || row[6] !== row[7], "Type/mode change must be real");
      }
    }
    assert.deepEqual(counts, pin.counts);
    assert.deepEqual(v.counts, counts);
    assert.deepEqual(v.roots, roots);
    assert.equal(counts.E + counts.D + counts.S + counts.T, pin.sourceCount);
    assert.equal(counts.E + counts.D + counts.C + counts.T, pin.main);
    assert.equal(v.unresolved_semantic_items, counts.D + counts.S + counts.T);
  });
}

test("W2 baseline remains an immutable administrative snapshot, not a false promotion", () => {
  const w2 = JSON.parse(readFileSync(new URL("registers/governance/ce-branch-completion-20261120.v1.json", root), "utf8"));
  const rows = w2.rows.filter(x => [32,36].includes(x.pr_number));
  assert.equal(rows.length, 2);
  assert.ok(rows.every(x => x.scan_status === "PR_FILES_INCOMPLETE_API_LIMIT" && x.closure_status === "OPEN"));
  assert.equal(w2.counts.ce_sealed, 0);
});
