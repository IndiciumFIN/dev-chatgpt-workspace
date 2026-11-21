import test from "node:test";
import assert from "node:assert/strict";
import {compareParity,verifyParity} from "./ce-route-component-source-parity.mjs";
const spec={label:"routes",dir:"src/routes",code:"CE-ROUTE-",domain:"canonical",accept:n=>n.endsWith(".tsx")&&!n.startsWith("__")};
const fixture={schemaVersion:1,contract:"CE-CONTRACT-ROUTES",domain:"canonical",
 authority:"src/routes/",generatedBy:"scripts/generate-entity-contracts.mjs",
 items:[{id:"CE-ROUTE-admin",file:"src/routes/admin.tsx"}]};
test("mechanical CE route/component contracts match real code, without semantic admission",()=>{
 const x=verifyParity();
 assert.equal(x.state,"READ_ONLY_NO_ADMISSION");
 assert.equal(x.reports.length,2);
 assert.equal(x.failures.length,0);
 assert.equal(x.remote_db_write,false);
 assert.equal(x.deployment_authorized,false);
 assert.ok(x.reports.every(s=>s.equal&&s.write_count===0&&!s.clinical_authority_granted));
 assert.ok(x.reports.find(s=>s.label==="routes")?.cross_domain_routes.includes("src/routes/calculadoras-trabalhistas.tsx"));
});
test("route inventory rejects added/missing routes, fake clinical rights, changed generator and duplicate IDs",()=>{
 assert.equal(compareParity(spec,["admin.tsx"],fixture).equal,true);
 for(const x of [
   {f:[],m:fixture},
   {f:["admin.tsx","nova.tsx"],m:fixture},
   {f:["admin.tsx"],m:{...fixture,items:[{...fixture.items[0],clinicalAuthority:true}]}},
   {f:["admin.tsx"],m:{...fixture,generatedBy:"other"}},
   {f:["admin.tsx"],m:{...fixture,items:[fixture.items[0],fixture.items[0]]}},
   {f:["admin.tsx"],m:{...fixture,domain:"clinical"}}
 ]){
   assert.equal(compareParity(spec,x.f,x.m).equal,false);
 }
});
test("untrusted --fix never becomes an option of read-only parity checker",()=>{
 const output=compareParity(spec,["admin.tsx"],fixture);
 assert.equal(output.write_count,0);
 assert.equal(output.release_eligible,false);
});
