import test from "node:test";
import assert from "node:assert/strict";
import {checkRelationalModel} from "./lib/ncos-schema-check.mjs";
function fixture(){
  return {
    tables:[{table_name:"a"},{table_name:"b"},{table_name:"content_text",rls_enabled:true},{table_name:"media_alt",rls_enabled:true}],
    columns:[["a","id"],["b","id"],["b","a_id"],["content_text","id"],["media_alt","id"]].map(([table_name,column_name])=>({table_name,column_name})),
    constraints:[
      ...["a","b","content_text","media_alt"].map(table_name=>({table_name,kind:"p"})),
      {table_name:"b",target_table:"a",kind:"f",name:"b_a_fk",from_columns:["a_id"],to_columns:["id"],validated:true}
    ],
    entities:["a","b","content_text","media_alt"].map(name=>({name})),
    dictionary:[["a","id"],["b","id"],["b","a_id"],["content_text","id"],["media_alt","id"]].map(([entity,name])=>({entity,name,ref_entity:entity==="b"&&name==="a_id"?"a":null})),
    policies:["content_text","media_alt"].map(table_name=>({table_name,policy_name:table_name+"_publicado"}))
  };
}
test("known physical and documented relationships pass static checks",()=>{
  assert.equal(checkRelationalModel(fixture()).gate,"SCHEMA_STATIC_PASS_NOT_RELEASE");
});
test("an invalid foreign key target fails",()=>{
  const x=fixture();x.constraints.at(-1).to_columns=["no_such_column"];
  assert.ok(checkRelationalModel(x).errors.some(e=>e.id==="FK_TARGET_COLUMN_MISSING"));
});
test("unregistered table and column are blocked by dictionary gate",()=>{
  const x=fixture();x.tables.push({table_name:"new"});x.columns.push({table_name:"a",column_name:"new"});
  const r=checkRelationalModel(x);
  assert.ok(r.gaps.some(e=>e.id==="MISSING_ENTITY_DICTIONARY"));
  assert.ok(r.gaps.some(e=>e.id==="MISSING_COLUMN_DICTIONARY"));
  assert.equal(r.gate,"HOLD_SCHEMA_DICTIONARY_CONSISTENCY");
});
test("legacy relation without FK never claims database enforcement",()=>{
  const x=fixture();x.constraints.pop();
  assert.ok(checkRelationalModel(x).holds.some(e=>e.id==="UNBACKED_DECLARED_RELATION"));
});
test("missing public reader RLS or policy fails",()=>{
  const x=fixture();x.policies=[];x.tables.at(-1).rls_enabled=false;
  assert.ok(checkRelationalModel(x).errors.some(e=>e.id==="RLS_POLICY_MISSING"));
  assert.ok(checkRelationalModel(x).errors.some(e=>e.id==="RLS_DISABLED"));
});
