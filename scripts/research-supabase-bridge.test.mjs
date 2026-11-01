import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ROOT_TABLES, DELTA_TABLES, PROJECT_REF, TABLE_SQL, ACCESS_SQL, LOCK_SQL,
  PUBLICATION_AUTHORIZED, assessResearchTopology, inspectResearchSchemaWithAuthorizedReader } from "./research-supabase-bridge.mjs";
const fixture=()=>({tables:[
 ...ROOT_TABLES.map(table_name=>({schema_name:"ce_platform",table_name,rls_enabled:true,rls_forced:true,policy_count:0})),
 ...DELTA_TABLES.map(table_name=>({schema_name:"ce_research_candidate",table_name,rls_enabled:true,rls_forced:true,policy_count:0}))
],access:{grants:0,anon_usage:false,authenticated_usage:false,service_usage:false},
 lock:{mode:"EMERGENCY_LOCKDOWN",baseline_promotion_guard:true}});
test("canonical 5 + private 23 exact, no duplicate",()=>{
 assert.equal(PROJECT_REF,"pgsybzggewhinaniybiy");
 assert.equal(ROOT_TABLES.length,5);assert.equal(DELTA_TABLES.length,23);
 assert.equal(new Set(DELTA_TABLES).size,23);assert.equal(PUBLICATION_AUTHORIZED,false);
});
test("readiness is PRIVATE_HOLD even when metadata matches",()=>{
 let r=assessResearchTopology(fixture());
 assert.equal(r.status,"PRIVATE_CANDIDATE_HOLD");
 assert.equal(r.releaseAuthorized,false);assert.equal(r.remoteWritesAuthorized,false);
});
test("missing root fails",()=>{let x=fixture();x.tables.shift();assert.equal(assessResearchTopology(x).missingRoots.length,1)});
test("missing domain table fails",()=>{let x=fixture();x.tables.pop();assert.equal(assessResearchTopology(x).missingDelta.length,1)});
test("extra or duplicate relation fails",()=>{
 let x=fixture();x.tables.push({...x.tables.at(-1)});assert.equal(assessResearchTopology(x).duplicateKeys.length,1);
 x=fixture();x.tables.push({...x.tables.at(-1),table_name:"research_projects"});assert.equal(assessResearchTopology(x).extra.length,1);
});
test("RLS missing/weak fails",()=>{
 for(let prop of ["rls_enabled","rls_forced"]){let x=fixture();x.tables.at(-1)[prop]=false;assert.equal(assessResearchTopology(x).status,"DRIFT_OR_ACCESS_RISK_HOLD")}
});
test("any unexpected RLS policy fails until identity review",()=>{
 let x=fixture();x.tables.at(-1).policy_count=1;assert.equal(assessResearchTopology(x).unexpectedPolicies.length,1);
});
test("any public or service access fails",()=>{
 for(let k of ["anon_usage","authenticated_usage","service_usage","grants"]){let x=fixture();x.access[k]=k==="grants"?1:true;assert.equal(assessResearchTopology(x).publicAccess,true)}
});
test("change-control drift fails",()=>{
 let x=fixture();x.lock.mode="OPEN";assert.equal(assessResearchTopology(x).missingLock,true);
 x=fixture();x.lock.baseline_promotion_guard=false;assert.equal(assessResearchTopology(x).missingLock,true);
});
test("metadata adapter only executes fixed SELECT statements",async()=>{
 let f=fixture(),seen=[];let client={async query(sql){
  seen.push(sql);if(sql===TABLE_SQL)return {rows:f.tables};
  if(sql===ACCESS_SQL)return {rows:[f.access]};
  if(sql===LOCK_SQL)return {rows:[f.lock]};
  throw Error("unknown statement");
 }};
 let res=await inspectResearchSchemaWithAuthorizedReader(client);
 assert.equal(res.status,"PRIVATE_CANDIDATE_HOLD");
 assert.deepEqual(seen,[TABLE_SQL,ACCESS_SQL,LOCK_SQL]);
 for(let sql of seen)assert.match(sql,/^select /);
});
test("missing control metadata fails closed",async()=>{
 await assert.rejects(inspectResearchSchemaWithAuthorizedReader({async query(sql){
  return {rows:sql===TABLE_SQL?fixture().tables:[]}
 }}),/INCOMPLETE_HOLD/);
});
test("React report hook is not conditional",()=>{
 const ui=readFileSync(new URL("../src/components/research/research-hub.tsx",import.meta.url),"utf8");
 assert.doesNotMatch(ui,/if\(active==="relatorio"\)\{const text=useMemo/);
 assert.match(ui,/if\(active==="relatorio"\)\{const text=\[/);
});
