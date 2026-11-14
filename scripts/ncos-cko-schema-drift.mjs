#!/usr/bin/env node
/** Group actual CKO enum drift against the already vendored schemas.
 * PROPOSAL ONLY. Never rewrite canonical vocabularies or default values.
 */
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
const root=new URL("../",import.meta.url);
const json=(p)=>JSON.parse(readFileSync(new URL(p,root),"utf8"));
const src=json("contracts/entities/tool-sources.v1.json").items;
const mixed=json("contracts/entities/tool-bindings.v1.json").items;
const types={
 source:{rows:src,schema:"contracts/cko-schemas/source.schema.json"},
 authority_binding:{rows:mixed.filter(x=>x.authority_class!==undefined),schema:"contracts/cko-schemas/authority_binding.schema.json"},
 field_definition:{rows:mixed.filter(x=>x.authority_binding_ref!==undefined),schema:"contracts/cko-schemas/field_definition.schema.json"}
};
const grouped=new Map(), missing=[];
for(const [domain,{rows,schema}] of Object.entries(types)){
 const contract=json(schema);
 for(const record of rows){
  for(const [field,def] of Object.entries(contract.properties)){
   if(!Array.isArray(def.enum)||record[field]===undefined)continue;
   const value=record[field];
   if(def.enum.includes(value))continue;
   const id=JSON.stringify([domain,field,value]);
   if(!grouped.has(id))grouped.set(id,{domain,field,legacyValue:value,acceptedVocabulary:def.enum,count:0,examples:[],
     recommendedAction:"REVIEW_CANONICAL_MAPPING_OR_SOURCE_CORRECTION_NO_AUTO_REWRITE"});
   const g=grouped.get(id);g.count++;
   if(g.examples.length<8)g.examples.push(record.canonical_id);
  }
  for(const key of contract.required||[])
    if(record[key]===undefined||record[key]===null)
      missing.push({domain,canonical_id:record.canonical_id,requiredField:key});
 }
}
const delta={
 schemaVersion:"1.0.0",purpose:"EXISTING_CKO_SCHEMA_DRIFT_CANDIDATE",
 source:"Existing clinical-tool source/binding/field records compared against contracts/cko-schemas/*.schema.json",
 sourceOfTruth:"Existing vendored CKO contracts; no new enum, authority, or publication approval",
 observedCount:{sources:src.length,bindings:types.authority_binding.rows.length,fields:types.field_definition.rows.length},
 incompatibleEnumEntries:[...grouped.values()].sort((a,b)=>b.count-a.count||a.domain.localeCompare(b.domain)),
 totalEnumDrift:[...grouped.values()].reduce((n,x)=>n+x.count,0),
 requiredPropertyMissing:missing,
 permittedPromotion:false,rootCauseDisposition:"HOLD_HUMAN_REVIEW_CANONICAL_PROVENANCE_AND_LICENSE"
};
const out=new URL("../audit-evidence/ncos-canonical-source-lineage/",import.meta.url);
mkdirSync(out,{recursive:true});
writeFileSync(new URL("schema-drift-delta.v1.json",out),JSON.stringify(delta,null,2)+"\n");
console.log("CKO_VOCABULARY_DRIFT "+JSON.stringify({
 total:delta.totalEnumDrift,groups:delta.incompatibleEnumEntries.length,requiredMissing:missing.length,
 top:delta.incompatibleEnumEntries.slice(0,7).map(x=>({field:x.field,legacyValue:x.legacyValue,count:x.count}))
}));
if(process.argv.includes("--enforce")&&(delta.totalEnumDrift||missing.length))process.exitCode=1;
