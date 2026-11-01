import fs from "node:fs";
import assert from "node:assert/strict";
const read = f => JSON.parse(fs.readFileSync(f,"utf8"));
const manifest=read("docs/research/universe/v1/UNIVERSE-36.json");
const source=fs.readFileSync(manifest.source_matrix,"utf8").trim().split(/\r?\n/).slice(1).map(x=>x.split(";"));
const crosswalk=read(manifest.source_crosswalk).rows;
assert.equal(source.length,30);
assert.equal(crosswalk.length,70);
assert.equal(manifest.tool_count,36);
assert.equal(manifest.tool_contracts.length,36);
assert.equal(manifest.production_homologated,0);
assert.equal(manifest.all_tools_functional,false);
const keys=new Set(),mapped=new Set(),primary=new Map(),actualPrivate=new Set();
const refs=new Map(crosswalk.map(x=>[x.candidate_table,x]));
for(const ref of manifest.tool_contracts){
 assert(!keys.has(ref.key),"Duplicate key: "+ref.key);keys.add(ref.key);
 const obj=read(ref.path);assert.equal(obj.planning_key,ref.key);
 assert.equal(obj.controls.production_release,false);
 assert.equal(obj.controls.remote_writes,false);
 assert.equal(obj.controls.public_access,false);
 assert.equal(obj.controls.collection_of_personal_data,false);
 assert.equal(obj.controls.kernel_status,"NOT_SUBMITTED");
 assert.equal(obj.provenance.canonical_id_assigned,false);
 assert.equal(obj.operation.status,"DEFINED_NOT_ENABLED");
 assert(obj.operation.input_fields.length>0);assert(obj.operation.output_fields.length>0);
 assert.equal(obj.acceptance_tests.length,5);
 assert(obj.acceptance_tests.every(x=>x.result==="NOT_RUN"));
 for(const x of obj.storage){
  assert(refs.has(x.semantic_alias),"Unknown alias: "+x.semantic_alias);
  mapped.add(x.semantic_alias);
  assert.equal(x.crosswalk_treatment,refs.get(x.semantic_alias).decision);
  assert(x.physical_storage.length>0);
  if(x.relation==="PRIMARY_CANDIDATE_OWNER"){
   assert(!primary.has(x.semantic_alias),"Duplicate primary owner");
   primary.set(x.semantic_alias,obj.planning_key);
  }
  if(x.crosswalk_treatment==="NEW_DOMAIN_CANDIDATE_UNAPPROVED"){
   for(const t of x.physical_storage){assert(t.startsWith("ce_research_candidate."));actualPrivate.add(t)}
  }
 }
 const old=source.find(x=>x[0]===ref.key);
 if(old){assert.equal(obj.title,old[2]);assert.equal(obj.baseline_status,old[3]);assert.equal(obj.priority,old[4])}
 else assert(/^P0[1-6]$/.test(ref.key),"Unknown participation key");
}
for(const x of source)assert(keys.has(x[0]),"Missing original tool "+x[0]);
for(let i=1;i<=6;i++)assert(keys.has("P0"+i),"Missing participation P0"+i);
assert.equal(mapped.size,70,"Uncovered crosswalk alias");
assert.equal(primary.size,70,"Unowned alias");
assert.equal(actualPrivate.size,23,"Uncovered private candidate tables");
for(const shared of manifest.shared_resources)assert.equal(primary.get(shared.alias),shared.primary_owner_key);
console.log("PASS: 30/30 research capabilities, 6/6 citizen experiences.");
console.log("PASS: 70/70 crosswalk aliases, 23/23 private candidate physical tables.");
console.log("PASS: zero duplicate primary planning owners or untracked capabilities.");
console.log("PASS: all contracts candidate-only, all acceptance tests NOT_RUN, no production authorization.");
