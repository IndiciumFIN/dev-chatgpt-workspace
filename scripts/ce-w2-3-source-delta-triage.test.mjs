import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const base = new URL("../", import.meta.url);
const sourcePath = "registers/governance/ce-w2-2-pr32-pr36-shared-origin-20261120.v1.json";
const reviewPath = "registers/governance/ce-w2-3-source-delta-triage-20261120.v1.json";
function read(path) { return readFileSync(new URL(path, base)); }
function classify(p) {
  if (p.startsWith("migrations/")) return ["DB_MIGRATIONS", "P0"];
  if (p.startsWith(".github/workflows/")) return ["CI_GATES", "P0"];
  if (p.startsWith("src/core/governance/") || p.includes("/opa/") || p.startsWith("src/lib/kernel-admit") || p.startsWith("src/lib/policy-") || p === "src/lib/db.ts" || p.startsWith("src/lib/rls") || p === "src/lib/tenant-store.ts" || p === "src/lib/education/published.ts" || p === "src/lib/tools/governance.ts") return ["RUNTIME_SAFETY", "P0"];
  if (p.includes("migration-plan") || p.startsWith("scripts/migrate") || p.startsWith("scripts/check-governance")) return ["DB_RUNNER_GATES", "P0"];
  if (p.startsWith("docs/evidence/") && p.endsWith(".pdf")) return ["NORMATIVE_RIGHTS", "P0"];
  if (p === "package.json" || p === "package-lock.json") return ["DEPENDENCIES_BUILD", "P1"];
  if (p.startsWith("contracts/") || p.startsWith("registers/canonical/") || p.startsWith("src/data/contracts/") || p.startsWith("src/data/cko-schemas/") || p.startsWith("src/lib/cko-")) return ["CKO_CONTRACTS", "P1"];
  if (p.startsWith("src/") || p.startsWith("scripts/")) return ["APP_TESTS_SCRIPTS", "P1"];
  if (p.startsWith("public/")) return ["PUBLIC_ASSETS_RIGHTS", "P2"];
  return ["HISTORICAL_EVIDENCE", "P2"];
}
test("W2.3: 480 risk-screened rows exhaustively reconcile to immutable W2.2 manifest, without admissibility claims", () => {
  const origin = read(sourcePath);
  const digest = createHash("sha1").update(`blob ${origin.length}\0`).update(origin).digest("hex");
  assert.equal(digest, "bcae37d1e74329ac853c2e77cc089bcf606f866d");
  const m = JSON.parse(origin);
  const triage = JSON.parse(read(reviewPath));
  assert.equal(triage.original_manifest_git_blob_sha, digest);
  assert.equal(triage.original_main_baseline_sha, m.main_baseline_sha);
  assert.deepEqual([triage.source32_sha,triage.source36_sha],m.sources.map(s=>s.sha));
  const expected = [];
  for (const [p,a,b,stA,stB] of m.difference_rows) expected.push([p,"SHARED_DIVERGENT",a,b,stA,stB,...classify(p),"PENDING_SEMANTIC_REVIEW"]);
  for (const [p,b,stB] of m.pr36_extra_rows) expected.push([p,"PR36_ONLY",null,b,null,stB,...classify(p),"PENDING_SEMANTIC_REVIEW"]);
  expected.sort((a,b) => a[0].localeCompare(b[0],"en"));
  assert.deepEqual(triage.rows,expected);
  assert.equal(expected.length,480);
  assert.equal(new Set(expected.map(r=>r[0])).size,480);
  const counts = {total:480,shared_divergent:53,pr36_only:427,by_priority:{P0:0,P1:0,P2:0},by_area:{}};
  for (const r of expected) { counts.by_priority[r[7]]++; counts.by_area[r[6]]=(counts.by_area[r[6]]||0)+1; }
  assert.deepEqual(triage.counts,counts);
  assert.equal(triage.review_findings.length,4);
  assert.equal(triage.semantic_content_admission_count,0);
  assert.equal(triage.screening_only,true);
  assert.equal(triage.authorization_to_merge,false);
  assert.equal(triage.remote_db_write,false);
  assert.equal(triage.closure_status,"OPEN");
  assert.equal(triage.no_revisit,false);
});
