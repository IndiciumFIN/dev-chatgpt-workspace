import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../",import.meta.url);
const get=p=>JSON.parse(readFileSync(new URL(p,root),"utf8"));
test("W2.5.10: 78 historical generated tool IDs cross-checked without assuming functionality lost",()=>{
 const a=get("registers/governance/ce-w2-5-10-grook-tool-id-runtime-trace-20261120.v1.json"),b=get(a.prior_crossbranch_components),c=get("registers/governance/ce-w2-5-review-current-20261120.v1.json");
 assert.equal(a.protocol,"CE.CROSS.W2.5.10.TOOL_RUNTIME_TRACE.v1");
 assert.equal(a.counts.historical_ids,78);
 assert.equal(a.rows.length,78);
 assert.equal(new Set(a.rows.map(x=>x.slug)).size,78);
 assert.equal(a.counts.source_sha_count,22);
 assert.equal(a.counts.orphan_branches,23);
 assert.equal(a.counts.source_named_tool_module_matches,1);
 assert.deepEqual(a.counts.named_tool_module_slugs,["exames-laboratoriais"]);
 assert.equal(a.counts.candidate_tools_in_current_catalog,2);
 assert.equal(a.counts.current_catalogue_source_sha_variants,2);
 assert.equal(b.catalogue_source_blob_variants.length,2);
 assert.equal(c.crossbranch_tool_trace,"registers/governance/ce-w2-5-10-grook-tool-id-runtime-trace-20261120.v1.json");
 assert.equal(a.status,"STRUCTURAL_TRACE_NOT_FUNCTIONAL_CLOSURE");
 assert.ok(a.rows.every(x=>x.final_semantic_decision===null));
 assert.equal(a.independent_review_complete,false);
 assert.equal(a.merge_authorized,false);
 assert.equal(a.source_branch_sealed,false);
 assert.equal(a.no_revisit,false);
});
test("W2.5.10: named module evidence matches original 22 source trees",()=>{
 const r=get("registers/governance/ce-w2-5-10-grook-tool-id-runtime-trace-20261120.v1.json"),index=get(r.source_manifest_index),map=new Map();
 for(const batch of index.batches)for(const src of get(batch.path).sources){
  const names=new Map(src.rows.map(row=>[row[0],row]));
  map.set(src.source_sha,names);
 }
 assert.equal(map.size,22);
 for(const item of r.rows)for(const hit of item.direct_named_tool_module_evidence){
  const row=map.get(hit.source_sha)?.get(hit.path);
  assert.ok(row,hit.path);
  assert.equal(row[1],hit.relation);
  assert.equal(row[2]||null,hit.source_blob_sha);
  assert.equal(row[3]||null,hit.canonical_blob_sha);
  assert.equal(hit.path.split("/").at(-1).replace(/\.(tsx?|json)$/,""),item.slug);
 }
 const candidate=r.rows.filter(x=>x.canonical_runtime_catalog_status==="CANDIDATE_ONLY_IN_CURRENT_SOURCE_CATALOG").map(x=>x.slug).sort();
 assert.deepEqual(candidate,["aldrete","exames-laboratoriais"]);
});
