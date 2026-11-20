import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const ledgerPath = new URL("../registers/governance/ce-branch-completion-20261120.v1.json", import.meta.url);
const fresh = () => JSON.parse(readFileSync(ledgerPath, "utf8"));

function run(ledger, requireClosed = false) {
  const dir = mkdtempSync(join(tmpdir(), "ce-branch-closure-"));
  try {
    const input = join(dir, "ledger.json");
    writeFileSync(input, JSON.stringify(ledger));
    const args = ["scripts/ce-branch-closure.py", "--ledger", input];
    if (requireClosed) args.push("--require-closed");
    const child = spawnSync("python3", args, { encoding: "utf8" });
    assert.equal(child.error, undefined, child.error?.message || child.stderr);
    return { code: child.status, output: child.stdout, error: child.stderr };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("CE W2 baseline verifies 48 open branches without falsely sealing any", () => {
  const result = run(fresh());
  assert.equal(result.code, 0, result.error);
  const p = JSON.parse(result.output);
  assert.equal(p.branches, 63);
  assert.equal(p.ce, 48);
  assert.equal(p.sealed, 0);
  assert.equal(p.open, 48);
  assert.equal(p.status, "VERIFIED_OPEN_LEDGER");
});

test("CE complete gate must fail while even one source branch is open", () => {
  const result = run(fresh(), true);
  assert.equal(result.code, 2);
  assert.match(result.error, /NOT READY/);
});

test("CE gate refuses false no-revisit without independent evidence", () => {
  const data = fresh();
  const target = data.rows.find(r => r.scope === "CE_CKO_NCOS_REVIEW");
  target.closure_status = "SEALED";
  target.no_revisit = true;
  target.final_disposition = "INTEGRATED_VERIFIED";
  data.counts.ce_sealed += 1;
  const result = run(data);
  assert.equal(result.code, 2);
  assert.match(result.error, /proof/);
});

test("CE gate refuses tampered branch, scope or counts", () => {
  const data = fresh();
  data.rows.pop();
  assert.equal(run(data).code, 2);

  const out = fresh();
  const otherDomain = out.rows.find(r => r.scope === "WUTRIB_ISOLATED");
  otherDomain.closure_status = "SEALED";
  otherDomain.no_revisit = true;
  assert.equal(run(out).code, 2);

  const wrongCount = fresh();
  wrongCount.counts.ce_branches += 1;
  assert.equal(run(wrongCount).code, 2);
});

test("CE gate blocks truncating an oversized PR file list", () => {
  const data = fresh();
  const large = data.rows.find(r => r.pr_number === 36);
  assert.ok(large.expected_pr_changes > 13000);
  assert.ok(large.observed_files < large.expected_pr_changes);
  large.scan_status = "PR_FILES_SCANNED";
  assert.equal(run(data).code, 2);
});

test("CE exact-SHA aliases cannot point to an unrelated commit", () => {
  const data = fresh();
  const alias = data.rows.find(r => r.branch === "planning");
  assert.equal(alias.duplicate_ref, "archivamento");
  alias.source_commit_sha = "f".repeat(40);
  assert.equal(run(data).code, 2);
});

test("CE missing source tree or false PR coverage never passes", () => {
  const missing = fresh();
  const orphan = missing.rows.find(r => r.scan_status === "ROOT_TREE_SCANNED");
  orphan.source_tree_sha = null;
  assert.equal(run(missing).code, 2);
  const falsePr = fresh();
  const pr = falsePr.rows.find(r => r.scan_status === "PR_FILES_SCANNED");
  pr.expected_pr_changes += 1;
  assert.equal(run(falsePr).code, 2);
});

test("CE no auto-merge or database write is allowed by ledger", () => {
  const changes = fresh();
  changes.policy.remote_database_writes = true;
  assert.equal(run(changes).code, 2);
  const newBranches = fresh();
  newBranches.policy.new_branch = true;
  assert.equal(run(newBranches).code, 2);
});
