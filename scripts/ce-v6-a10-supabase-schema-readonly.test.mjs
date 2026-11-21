import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const file=new URL("../registers/governance/ce-v6-a10-supabase-schema-readonly-20261121.v1.json",import.meta.url);
const data=JSON.parse(readFileSync(file,"utf8"));
function check(d){
 assert.equal(d.protocol,"CE.V6.A10.SUPABASE_PUBLIC_SCHEMA_READONLY.v1");
 assert.equal(d.project_name,"Calculadoras-Smart");assert.equal(d.schema,"public");
 assert.equal(d.status,"READ_ONLY_METADATA_PARTIAL");
 assert.equal(d.tables,48);assert.equal(d.rls_enabled_tables,48);
 assert.equal(d.tables_primary_key,48);assert.equal(d.columns,608);assert.equal(d.foreign_keys,71);
 assert.equal(d.rls_policies,45);
 assert.equal(d.tables_with_policies+d.tables_without_explicit_policies,d.tables);
 assert.equal(d.views,1);assert.equal(d.views_security_invoker,0);
 assert.equal(d.views_select_granted_anon,0);
 assert.equal(d.views_select_granted_authenticated,0);
 assert.equal(d.public_security_definer_functions,56);
 assert.equal(d.public_security_definer_execute_anon,0);
 assert.equal(d.public_security_definer_execute_authenticated,0);
 assert.equal(d.public_security_definer_no_explicit_search_path,0);
 for(const k of ["runtime_database_identified","all_schemas_reconciled","drive_cross_complete",
  "rls_behavior_tested","permissions_comprehensively_audited","full_source_body_audited",
  "production_release_authorized","remote_database_write_performed"]) assert.equal(d[k],false);
 assert.equal(d.owner_approval_state,"NOT_REQUESTED_DEFERRED");
 assert.equal(d.findings.length,3);
 return {state:"PASS_STATIC_METADATA_PIN_NO_RUNTIME_CLAIM",tables:d.tables,rls:d.rls_enabled_tables};
}
test("V6-A10: Supabase public schema metadata is pinned with G04 still OPEN",()=>{
 const r=check(data);assert.equal(r.tables,48);assert.equal(r.state,"PASS_STATIC_METADATA_PIN_NO_RUNTIME_CLAIM");
});
test("V6-A10: cannot claim release, functional RLS or runtime DB from catalog",()=>{
 for(const k of ["runtime_database_identified","rls_behavior_tested","production_release_authorized","remote_database_write_performed"]){
  const fake=structuredClone(data);fake[k]=true;assert.throws(()=>check(fake));
 }
});
test("V6-A10: cannot falsify RLS inventory or grant states",()=>{
 const fake=structuredClone(data);fake.rls_enabled_tables=47;assert.throws(()=>check(fake));
 const grant=structuredClone(data);grant.public_security_definer_execute_anon=5;assert.throws(()=>check(grant));
});
