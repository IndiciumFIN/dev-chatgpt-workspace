import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const root = new URL("../", import.meta.url);
const load = p => JSON.parse(readFileSync(new URL(p, root), "utf8"));
const w = load("registers/governance/ce-cross-wave1-20261120.v1.json");
const b = load("registers/governance/ce-cross-github-branches-20261120.v1.json");
const prs = load("registers/governance/ce-cross-pr-files-20261120.v1.json");
const dr = load("registers/governance/ce-cross-drive-aggregates-20261120.v1.json");

test("CE W1 counts stay consistent across independently extracted evidence snapshots", () => {
  assert.equal(w.wave, "W1");
  assert.equal(w.sources.github.branches, b.count);
  assert.equal(w.sources.github.open_prs, b.open_prs);
  assert.equal(w.sources.github.priority_file_occurrences, prs.numFiles);
  assert.equal(w.sources.github.priority_prs_compared, prs.items.length);
  assert.deepEqual(w.sources.github.priority_file_equality, {
    same_git_blob: prs.outcomes.same_blob,
    divergent_git_blob: prs.outcomes.divergent_blob,
    source_only: prs.outcomes.source_only,
  });
  assert.equal(prs.complete, true);
  assert.equal(prs.numFiles, 361);
  assert.equal(prs.items.find(x => x.pr === 52).files_checked, 115);
  assert.equal(b.branches.length, 63);
  assert.equal(b.pull_requests.length, 35);
  assert.equal(dr.sources.length, 4);
});

test("CE W1 cannot be promoted despite catalog counts or candidate slug matches", () => {
  assert.equal(w.state, "HOLD_MULTISOURCE_SEMANTIC");
  assert.equal(w.cross.all_three_sources_semantically_crossed, false);
  assert.equal(w.cross.drive_content_hash_matches_verified, 0);
  assert.equal(w.cross.github_supabase_content_hash_matches_verified, 0);
  assert.equal(w.safety.auto_merge, false);
  assert.equal(w.safety.remote_sql_writes, 0);
  assert.equal(w.safety.drive_writes, 0);
  assert.equal(w.safety.clinical_release, false);
  assert.equal(w.sources.supabase.pilot_matched_by_slug, 5);
  assert.equal(w.sources.supabase.pilot_formula_refs_present, 0);
  assert.equal(w.sources.drive["Drive-1"].cko_documents_cursor_exhausted, false);
});

test("CE public evidence records never expose private Drive object names or IDs", () => {
  const serialized = JSON.stringify(dr);
  assert.equal(dr.source_safety.includes("Only aggregate"), true);
  for (const item of dr.sources) {
    assert.ok(item.account.startsWith("Drive-"));
    assert.equal("file_ids" in item, false);
    assert.equal("file_names" in item, false);
    assert.equal("files" in item, false);
  }
  assert.equal(/docs\.google\.com|drive\.google\.com/i.test(serialized), false);
});
