import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const m = JSON.parse(readFileSync(new URL("../registers/governance/ce-w26-grook-full-delta-20261121.v1.json", import.meta.url), "utf8"));
const sha = /^[0-9a-f]{40}$/;
test("W2.6-G1 immutable Git source and main checkpoint", () => {
  assert.equal(m.protocol, "CE.W2.6.G1.v1");
  assert.equal(m.issue, 104);
  assert.equal(m.tree_truncated, false);
  assert.match(m.source.commit, sha); assert.match(m.source.tree, sha);
  assert.match(m.baseline.commit, sha); assert.match(m.baseline.tree, sha);
  assert.equal(m.source.commit, "2eacacafd95c106e58a33372ee96bc6a6442439f");
  assert.equal(m.baseline.commit, "bee0cceb2561c31729e6a2345eae2b8fc199231d");
});
test("W2.6-G1 full counts and partition", () => {
  const c=m.counts;
  assert.equal(c.source_files,1061); assert.equal(c.main_files,3251);
  assert.equal(c.source_exact,1013); assert.equal(c.divergent,48);
  assert.equal(c.source_only,0); assert.equal(c.main_only,2190);
  assert.equal(c.source_files,c.source_exact+c.divergent+c.source_only);
  assert.equal(c.main_files,c.source_exact+c.divergent+c.main_only);
  assert.equal(c.classified_differences,m.divergences.length);
});
test("W2.6-G1 distinct paths, hash provenance and no premature disposition", () => {
  assert.equal(new Set(m.divergences.map(x=>x.path)).size,48);
  for(const x of m.divergences){
    assert.ok(x.path && !x.path.startsWith("/") && !x.path.includes(".."));
    assert.match(x.source_git_blob_sha,sha); assert.match(x.main_git_blob_sha,sha);
    assert.notEqual(x.source_git_blob_sha,x.main_git_blob_sha);
    assert.equal(x.decision,"PENDING_SEMANTIC");
    assert.equal(x.relationship,"DIVERGENT_BLOB");
    assert.ok(/^P[01]_/.test(x.risk_preliminary));
  }
  assert.deepEqual(m.source_only_paths,[]);
});
test("W2.6-G1 forbids SEALED or semantic completion", () => {
  assert.equal(m.closure_status,"OPEN");
  assert.equal(m.no_revisit,false); assert.equal(m.release_eligible,false);
  assert.equal(m.counts.semantically_disposed,0);
  assert.equal(m.counts.unresolved,48);
  assert.equal(Object.values(m.risk_preliminary_counts).reduce((a,b)=>a+b,0),48);
});
