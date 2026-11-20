import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../",import.meta.url);
const load=p=>JSON.parse(readFileSync(new URL(p,root),"utf8"));
test("W2.5.8: 35 component names have canonical path matches across all 22 orphan SHAs",()=>{
 const r=load("registers/governance/ce-w2-5-8-grook-components-crossbranch-trace-20261120.v1.json"),i=load(r.input_index),ptr=load("registers/governance/ce-w2-5-review-current-20261120.v1.json");
 assert.equal(r.protocol,"CE.CROSS.W2.5.8.COMPONENTS_CROSSBRANCH.v1");
 assert.equal(ptr.crossbranch_component_trace,"registers/governance/ce-w2-5-8-grook-components-crossbranch-trace-20261120.v1.json");
 assert.equal(i.batches.length,6);assert.equal(r.source_manifests.length,6);
 assert.deepEqual(r.source_manifests,i.batches.map(x=>x.path));
 assert.equal(r.baseline_git_sha,i.full_file_main_sha);
 const components=r.results.filter(x=>x.category==="CE-COMP");
 const route=r.results.filter(x=>x.category==="CE-ROUTE");
 assert.equal(components.length,35);assert.equal(route.length,1);
 assert.equal(r.counts.origins,22);assert.equal(r.counts.branches,23);
 assert.ok(components.every(x=>x.verified_canonical_file_presence));
 assert.ok(components.every(x=>x.canonical_matches.length>0));
 assert.equal(route[0].id,"CE-ROUTE-minha-area");
 assert.equal(route[0].verified_canonical_file_presence,false);
 for(const row of r.results){
  assert.equal(row.functional_equivalence_verified,false);
  assert.equal(row.final_decision,null);
  assert.equal(row.independent_review,"NOT_DONE");
  for(const hit of row.canonical_matches)assert.match(hit.baseline_main_blob_sha,/^[0-9a-f]{40}$/);
 }
 assert.equal(r.counts.origin_catalog_blob_variants,2);
 assert.equal(r.counts.semantic_final_dispositions,0);
 assert.equal(r.counts.branches_sealed,0);
 assert.equal(r.closure_status,"OPEN");
 assert.equal(r.merge_authorized,false);assert.equal(r.delete_branch_authorized,false);assert.equal(r.no_revisit,false);
});
test("W2.5.8: every pinned component path proof exists in original W2.4 manifests",()=>{
 const r=load("registers/governance/ce-w2-5-8-grook-components-crossbranch-trace-20261120.v1.json");
 const fromManifests=new Map();
 for(const path of r.source_manifests){const m=load(path);for(const s of m.sources){fromManifests.set(s.source_sha,new Map(s.rows.map(x=>[x[0],x])));}}
 assert.equal(fromManifests.size,22);
 for(const e of r.results)for(const hit of e.source_origin_evidence){
  const row=fromManifests.get(hit.source_sha)?.get(hit.source_path);
  assert.ok(row,"missing origin proof "+hit.source_path);
  assert.equal(row[1],hit.relation);
  assert.equal(row[2]||null,hit.source_blob_sha);
  assert.equal(row[3]||null,hit.baseline_main_blob_sha);
  assert.equal(hit.source_path.split("/").at(-1),e.id.replace(/^CE-(COMP|ROUTE)-/,"")+".tsx");
 }
});
