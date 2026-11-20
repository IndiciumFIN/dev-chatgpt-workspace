import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
test("W2.5.6 historical 149 identifiers crosswalk, never presented as admitted runtime",()=>{
 const a=load("registers/governance/ce-w2-5-grook-historical-contract-id-crosswalk-20261120.v1.json"),p=load("registers/governance/ce-w2-5-review-current-20261120.v1.json"),c=load(a.canonical_clinical_catalog_path);
 assert.equal(p.new_id_crosswalk,"registers/governance/ce-w2-5-grook-historical-contract-id-crosswalk-20261120.v1.json");
 assert.equal(a.stats.source_only_id_occurrences,149);
 assert.equal(a.rows.length,149);
 assert.equal(a.stats.by_category["CE-TOOL"],78);
 assert.equal(a.stats.by_category["CE-COMP"],70);
 assert.equal(a.stats.by_category["CE-ROUTE"],1);
 assert.equal(new Set(a.rows.map(x=>x.id)).size,149);
 assert.deepEqual([...c.items.map(x=>x.slug)].sort(),a.canonical_current_clinical_slugs);
 assert.equal(c.items.length,5);
 assert.equal(a.stats.canonical_current_clinical_catalog_entries,5);
 assert.equal(a.stats.potential_out_of_scope_tools,4);
 assert.equal(a.stats.fully_traced_to_runtime,0);
 assert.equal(a.stats.independently_dispositioned,0);
 for(const row of a.rows){
  assert.equal(row.origin_canonical_presence,"ABSENT_FROM_GENERATED_INDEX_ONLY");
  assert.equal(row.runtime_status,"UNVERIFIED");
  assert.equal(row.final_decision,null);
  assert.equal(row.action,"TRACE_TO_ORIGINAL_RUNTIME_OR_CKO_AND_DECIDE");
  assert.match(row.source_git_blob,/^[a-f0-9]{40}$/);
 }
 assert.equal(a.permissions.merge,false);
 assert.equal(a.permissions.delete_source,false);
 assert.equal(a.permissions.remote_db_write,false);
 assert.equal(a.permissions.publish_clinical,false);
 assert.equal(p.branch_closure_status,"OPEN");
});
