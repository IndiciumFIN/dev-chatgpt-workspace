import test from "node:test";
import assert from "node:assert/strict";
import { inspectCanonicalLineage } from "./lib/ncos-source-lineage.mjs";
function fixture(){
  const common={schema_version:"0.1.0",status:"DRAFT",version:"1",updated_at:"2026-11-13",provenance_refs:["local-check"]};
  const source={...common,canonical_id:"SRC-A",source_type:"STANDARD",title:"Test",authority:"Test",locator:{uri:"https://example.invalid/a",pinpoint:"1"},rights:"PERMITTED",jurisdiction:"BR",retrieved_at:"2026-11-13",integrity:{sha256:"a".repeat(64),snapshot_ref:"sha256:a"}};
  const binding={...common,canonical_id:"AB-A",field_path:"tool.a.x",requirement_id:"UTC-001",source_ids:["SRC-A"],authority_class:"TECHNICAL_STANDARD",validity:{jurisdiction:"BR",applicable_from:"2026-01-01"},decision:"HOLD_HUMAN",evidence_bundle_ids:["E-A"]};
  const field={...common,canonical_id:"FD-A",field_path:"tool.a.x",semantic_concept_ref:"CON-A",value_type:"integer",authority_binding_ref:"AB-A",privacy_policy:"NEVER_PERSIST",applicability_ref:"AP-A"};
  const schema=(props)=>({required:["schema_version"],properties:{schema_version:{const:"0.1.0"},...props}});
  return {sources:[source],bindings:[binding],fields:[field],
    tools:[{id:"CE-TOOL-a",authority_binding_refs:["AB-A"],field_definition_refs:["FD-A"],source_ids:["SRC-A"],evidence_refs:["E-A"]}],
    editorial:[],schemas:{
      source:schema({source_type:{enum:["STANDARD"]},rights:{enum:["PERMITTED"]}}),
      binding:schema({authority_class:{enum:["TECHNICAL_STANDARD"]},decision:{enum:["HOLD_HUMAN"]}}),
      field:schema({value_type:{enum:["integer"]},privacy_policy:{enum:["NEVER_PERSIST"]}})
    }};
}
test("existing CKO records form source->binding->field->tool chains without inventing atoms",()=>{
 const r=inspectCanonicalLineage(fixture());assert.equal(r.errors.length,0);
 assert.ok(r.edges.some(e=>e.from==="SRC-A"&&e.to==="AB-A"));
 assert.ok(r.edges.some(e=>e.from==="AB-A"&&e.to==="FD-A"));
});
test("an undocumented source snapshot never qualifies a normative source",()=>{
 const x=fixture();x.sources[0].integrity.sha256="0".repeat(64);x.sources[0].integrity.snapshot_ref="PENDING_SNAPSHOT";x.sources[0].status="SOURCE_QUALIFIED";
 const r=inspectCanonicalLineage(x);assert.ok(r.errors.some(e=>e.code==="SOURCE_QUALIFICATION_WITHOUT_SNAPSHOT"));
});
test("noncanonical source enum and detached authority are blocked",()=>{
 const x=fixture();x.sources[0].source_type="NORMATIVA";x.bindings[0].source_ids=["SRC-NOT-FOUND"];
 const r=inspectCanonicalLineage(x);assert.ok(r.errors.some(e=>e.code==="NOT_IN_CANONICAL_VOCABULARY"));
 assert.ok(r.errors.some(e=>e.code==="BINDING_UNKNOWN_SOURCE"));
});
test("a clinical field referencing a missing authority binding fails",()=>{
 const x=fixture();x.fields[0].authority_binding_ref="AB-UNKNOWN";
 assert.ok(inspectCanonicalLineage(x).errors.some(e=>e.code==="FIELD_AUTHORITY_NOT_FOUND"));
});
test("editorial content requires per-module provenance and cannot be silently a normative source",()=>{
 const x=fixture();x.editorial=[{slug:"example",content:{identity:{slug:"example"},modules:[{module_id:"overview"}]},
  provenance:{page_slug:"example",page_source:{source_file:"../legacy/example.source.json"},module_provenance:{}}}];
 const r=inspectCanonicalLineage(x);
 assert.ok(r.holds.some(e=>e.code==="EDITORIAL_MODULE_WITHOUT_PROVENANCE"));
 assert.ok(r.holds.some(e=>e.code==="EDITORIAL_ORIGIN_NOT_CANONICAL_SOURCE_BINDING"));
 assert.ok(r.edges.some(e=>e.kind==="EDITORIAL_PROJECTION_NOT_NORMATIVE"));
});
test("duplicate canonical IDs are rejected",()=>{
 const x=fixture();x.fields[0].canonical_id="SRC-A";
 assert.ok(inspectCanonicalLineage(x).errors.some(e=>e.code==="DUPLICATE_CANONICAL_ID"));
});
