import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

const ledgerPath = new URL("../registers/governance/ce-branch-completion-20261120.v1.json", import.meta.url);
const fresh = () => JSON.parse(readFileSync(ledgerPath, "utf8"));

const retirementPath = new URL("../registers/governance/ce-branch-live-cohort-20261121.v1.json", import.meta.url);
const freshRetirement = () => JSON.parse(readFileSync(retirementPath, "utf8"));

function run(ledger, requireClosed = false, retirement = freshRetirement(), prepare = null) {
  const dir = mkdtempSync(join(tmpdir(), "ce-branch-closure-"));
  try {
    const input = join(dir, "ledger.json");
    writeFileSync(input, JSON.stringify(ledger));
    if (prepare) prepare(retirement.technical_retirement, dir);
    const retirementInput = join(dir, "retirement.json");
    writeFileSync(retirementInput, JSON.stringify(retirement));
    const args = ["scripts/ce-branch-closure.py", "--ledger", input, "--retirement-cohort", retirementInput, "--evidence-root", dir];
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

test("retirement extension preserves historical closure and denies higher states", () => {
  const data = freshRetirement();
  assert.equal(data.technical_retirement.rows.length, 56);
  assert.equal(data.technical_retirement.counts.candidates, 16);
  assert.equal(run(fresh(), false, data).code, 0);
  assert.equal(run(fresh(), true, data).code, 2);
  for (const state of ["RETIREMENT_ELIGIBLE", "RETIRED_TECHNICAL", "SEALED"]) {
    const bad = freshRetirement();
    bad.technical_retirement.rows.find(r => r.state === "RETIREMENT_CANDIDATE").state = state;
    assert.equal(run(fresh(), false, bad).code, 2);
  }
});
test("retirement extension rejects missing proof, blockers, drift and scope mixing", () => {
  const cases = [
    o => { o.rows.find(r => r.state === "RETIREMENT_CANDIDATE").structural_evidence.main_sha = "0".repeat(40); },
    o => { o.rows.find(r => r.state === "RETIREMENT_CANDIDATE").blocking_checks = []; },
    o => { o.rows[0].branch = "main"; },
    o => { o.rows[0].branch = "wutrib/test"; },
    o => { o.rows[0].source_sha = "invalid"; },
    o => { o.rows[0].branch = o.rows[1].branch; },
    o => { o.counts.retired = 1; },
    o => { o.live_counts.ce = 55; },
    o => { delete o.authorization_ref; },
    o => { o.rows.find(r => r.structural_evidence?.kind === "DELTA_BLOB_MODE_PRESERVED").structural_evidence.quarantined_paths = 100; }
  ];
  for (const mutate of cases) {
    const data = freshRetirement();
    mutate(data.technical_retirement);
    assert.equal(run(fresh(), false, data).code, 2);
  }
});

test("retirement extension cannot be silently removed", () => {
  const data = freshRetirement();
  delete data.technical_retirement;
  assert.equal(run(fresh(), false, data).code, 2);
});

function evidenceFixture(o, dir, retired = false) {
  const row = o.rows.find(r => r.structural_evidence?.kind === "ANCESTOR");
  o.phase = "EVIDENCE_VERIFIED";
  row.state = retired ? "RETIRED_TECHNICAL" : "RETIREMENT_ELIGIBLE";
  row.blocking_checks = [];
  o.counts.candidates--;
  o.counts[retired ? "retired" : "eligible"]++;
  const folder = join(dir, "audit", "branch-retirement");
  mkdirSync(folder, {recursive:true});
  const save = (name, value) => {
    const raw = JSON.stringify(value);
    writeFileSync(join(folder, name), raw);
    return {path:"audit/branch-retirement/"+name, sha256:createHash("sha256").update(raw).digest("hex")};
  };
  row.eligibility_evidence = save("synthetic-evidence.json", {
    protocol:"CE.BRANCH.RETIREMENT.EVIDENCE.v1", branch:row.branch, source_sha:row.source_sha,
    main_sha:o.main_sha, main_tree_sha:o.main_tree_sha, merge_base_sha:row.source_sha, exclusive_commits:0,
    authorization_ref:o.authorization_ref,
    gates:Object.fromEntries(["DEPENDENCIES_FULL","RETENTION","SECURITY_RIGHTS","MAIN_LEDGER_CI"].map(k=>[k,{state:"PASS",evidence_ref:"synthetic only",reviewer:"fixture"}]))
  });
  if (retired) {
    o.live_counts.ce--; o.live_counts.all--;
    row.retirement_receipt = save("synthetic-receipt.json", {
      protocol:"CE.BRANCH.RETIREMENT.RECEIPT.v1", branch:row.branch, expected_sha:row.source_sha,
      eligibility_sha256:row.eligibility_evidence.sha256, method:"GIT_FORCE_WITH_LEASE_DELETE",
      remote_ref_absent:true, main_preserved:true, post_main_sha:o.main_sha, execution_ref:"synthetic only"
    });
  }
  return row;
}

test("technical eligibility and retirement are separate from functional seal", () => {
  for (const retired of [false,true]) {
    const prepare = (o,dir)=>evidenceFixture(o,dir,retired);
    const result=run(fresh(),false,freshRetirement(),prepare);
    assert.equal(result.code,0,result.error);
    assert.equal(JSON.parse(result.output).sealed,0);
    assert.equal(run(fresh(),true,freshRetirement(),prepare).code,2);
  }
});

test("technical gate refuses corrupted evidence, source drift, missing receipt and census drift", () => {
  for (const mutate of [
    (o,r)=>{r.eligibility_evidence.sha256="0".repeat(64)},
    (o,r)=>{r.source_sha="0".repeat(40)},
    (o,r)=>{r.blocking_checks=["DEPENDENCIES_FULL"]},
    (o,r)=>{delete r.retirement_receipt},
    (o,r)=>{o.live_counts.ce++;o.live_counts.all++},
    (o,r)=>{r.retirement_receipt.path="../outside.json"},
    (o,r)=>{o.phase="CANDIDATE_ONLY"}
  ]) {
    const result=run(fresh(),false,freshRetirement(),(o,dir)=>mutate(o,evidenceFixture(o,dir,true)));
    assert.equal(result.code,2,result.output);
  }
});
