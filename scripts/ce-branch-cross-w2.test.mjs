import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const base = new URL("../", import.meta.url);
const json = path => JSON.parse(readFileSync(new URL(path, base), "utf8"));
const ledger = json("registers/governance/ce-branch-completion-20261120.v1.json");
const branch = json("registers/governance/ce-cross-github-branches-20261120.v1.json");
const prs = json("registers/governance/ce-cross-all-prs-20261120.v2.json");
const orphan = json("registers/governance/ce-cross-orphan-root-trees-20261120.v1.json");
const huge = json("registers/governance/ce-cross-large-pr-roots-20261120.v1.json");

test("independent W2 snapshots account for all branches and PR sources", () => {
  assert.equal(ledger.rows.length, branch.branches.length);
  assert.equal(prs.count_pr, 25);
  assert.equal(orphan.rows.length, 23);
  assert.equal(ledger.counts.with_pr_complete, 23);
  assert.equal(ledger.counts.with_pr_incomplete, 2);
  assert.equal(ledger.counts.without_pr_root_scanned, 23);
  const github = new Map(branch.branches.map(x => [x.branch, x]));
  const prMap = new Map(prs.entries.map(x => [x.branch, x]));
  const rootMap = new Map(orphan.rows.map(x => [x.branch, x]));
  for (const row of ledger.rows) {
    if (row.scope === "CANONICAL_MAIN") {
      assert.equal(row.source_commit_sha, ledger.baseline_main_sha,
        "main row must use the W2 review baseline, not the earlier W1 census HEAD");
    } else {
      assert.equal(github.get(row.branch)?.commit_sha, row.source_commit_sha, row.branch);
    }
    if (row.pr_number) {
      const ref = prMap.get(row.branch);
      assert.ok(ref, row.branch);
      assert.equal(ref.branch_sha, row.source_commit_sha);
      assert.equal(ref.pr, row.pr_number);
      assert.equal(ref.observed_files, row.observed_files);
      assert.equal(ref.expected_files, row.expected_pr_changes);
      assert.equal(row.scan_status, ref.complete ? "PR_FILES_SCANNED" : "PR_FILES_INCOMPLETE_API_LIMIT");
    } else if (row.scope === "CE_CKO_NCOS_REVIEW") {
      const root = rootMap.get(row.branch);
      assert.ok(root, row.branch);
      assert.equal(root.source_sha, row.source_commit_sha);
      assert.equal(root.tree_sha, row.source_tree_sha);
      assert.equal(row.scan_status, "ROOT_TREE_SCANNED");
    }
  }
  assert.equal(prMap.size, 25);
  assert.equal(rootMap.size, 23);
});

test("W2 never treats API-limited mega-PRs as complete", () => {
  const partial = prs.entries.filter(x => !x.complete);
  assert.deepEqual(partial.map(x => x.pr).sort((a,b)=>a-b), [32,36]);
  assert.deepEqual(partial.map(x => x.expected_files).sort((a,b)=>a-b), [13550,13770]);
  assert.equal(huge.branches.length, 2);
  assert.ok(huge.branches.every(x => x.root_differences > 0));
  assert.ok(partial.every(x => x.observed_files < x.expected_files));
});

test("W2 blob outcomes reconcile to actual changed-files inventory", () => {
  const outcomes = {same_blob:0,divergent_blob:0,source_only:0,source_removed:0};
  let seen = 0;
  for (const pr of prs.entries) {
    assert.equal(pr.files.length, pr.observed_files);
    seen += pr.files.length;
    const local = {same_blob:0,divergent_blob:0,source_only:0,source_removed:0};
    for (const file of pr.files) {
      assert.ok(Object.hasOwn(local, file.status));
      local[file.status]++;
    }
    assert.deepEqual(local, pr.counts);
    for (const [key,value] of Object.entries(local)) outcomes[key]+=value;
  }
  assert.equal(seen, prs.observed_file_occurrences);
  assert.deepEqual(outcomes, prs.counts);
  assert.equal(prs.auto_merge, false);
});

test("W2 closure cannot silently seal or mix WU-TRIB branches", () => {
  assert.equal(ledger.counts.ce_sealed, 0);
  assert.equal(ledger.rows.filter(x => x.closure_status === "SEALED").length, 0);
  assert.equal(ledger.rows.filter(x => x.scope === "WUTRIB_ISOLATED").length, 14);
  assert.ok(ledger.rows.filter(x => x.scope === "WUTRIB_ISOLATED").every(x => x.closure_status === "OUT_OF_SCOPE"));
  assert.ok(ledger.rows.filter(x => x.scope === "CE_CKO_NCOS_REVIEW").every(x => x.closure_status === "OPEN" && x.no_revisit === false));
});
