// Deterministic, read-only structural gate for CKO M04.
// Run from repository root: node cko/canonical-content/2026-11-14/m04/validate-m04.mjs
// DOES NOT validate scientific claims, evidence licenses, or clinical safety.
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const base=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(base,"../../../..");
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8");
const json=(p)=>JSON.parse(read(p));
const prefix="cko/canonical-content/2026-11-14/";
const problems=[];
function check(cond,what){if(!cond)problems.push(what)}
function csv(s){
  const rows=[]; let row=[], field="", quoted=false;
  s=s.replace(/^\uFEFF/,"");
  for(let i=0;i<s.length;i++){const c=s[i],n=s[i+1];
    if(c==='"'&&quoted&&n==='"'){field+='"';i++;continue}
    if(c==='"'){quoted=!quoted;continue}
    if(c===","&&!quoted){row.push(field);field="";continue}
    if((c==="\n"||c==="\r")&&!quoted){
      if(c==="\r"&&n==="\n")i++;
      row.push(field); if(row.some(x=>x.length))rows.push(row);
      row=[];field="";continue;
    }
    field+=c;
  }
  if(field.length||row.length){row.push(field);rows.push(row)}
  const [keys,...data]=rows;
  return data.map((r,i)=>Object.fromEntries(keys.map((k,j)=>[k,r[j]??""])));
}
function validate(schema,val,pathName){
  if(schema.type==="object"){
    check(val!==null&&!Array.isArray(val)&&typeof val==="object",pathName+": object");
    if(!val||typeof val!=="object"||Array.isArray(val))return;
    for(const k of schema.required||[])check(Object.hasOwn(val,k),pathName+"."+k+": required");
    if(schema.additionalProperties===false)for(const k of Object.keys(val))check(Object.hasOwn(schema.properties||{},k),pathName+"."+k+": unexpected");
    for(const k of Object.keys(schema.properties||{}))if(Object.hasOwn(val,k))validate(schema.properties[k],val[k],pathName+"."+k);
  }else if(schema.type==="array"){
    check(Array.isArray(val),pathName+": array");
    if(!Array.isArray(val))return;
    if(schema.minItems!==undefined)check(val.length>=schema.minItems,pathName+": minItems");
    for(let i=0;i<val.length;i++)if(schema.items)validate(schema.items,val[i],pathName+"["+i+"]");
  }else if(schema.type==="string")check(typeof val==="string",pathName+": string");
  if(schema.enum)check(schema.enum.includes(val),pathName+": enum");
  if(schema.const!==undefined)check(val===schema.const,pathName+": const");
  if(schema.pattern&&typeof val==="string")check(new RegExp(schema.pattern).test(val),pathName+": pattern");
  if(schema.minLength&&typeof val==="string")check(val.length>=schema.minLength,pathName+": minLength");
}
const units=csv(read(prefix+"datasets/01_unidades_curriculares.csv"));
const modules=csv(read(prefix+"datasets/02_modulos.csv"));
const axes=csv(read(prefix+"datasets/15_UC08_EIXOS_RECEBIDOS.csv"));
const cross=csv(read(prefix+"m04/CURRICULUM_TOPIC_CROSSWALK.csv"));
const topics=json(prefix+"m04/TOPIC_REFERENCE_INDEX.json").topics;
const rel=json(prefix+"m04/RELATIONS_CANDIDATE.schema-compatible.json").records;
const learning=json(prefix+"m04/LEARNING_RESOURCES_HOLD.schema-compatible.json").records;
const relSchema=json("contracts/cko-schemas/relation.schema.json");
const lrSchema=json("contracts/cko-schemas/learning_resource.schema.json");
check(units.length===10,"10 UCs present");
check(units.reduce((s,x)=>s+Number(x.hours||0),0)===300,"300h sum");
check(modules.length===51,"51 current detailed modules");
check(axes.length===8,"8 current UC08 axes");
check(!modules.some(x=>x.unit_id==="CARDIOLOGIA-UC-08"),"UC08 must not silently inherit UC07 modules");
check(axes.every(x=>x.publication==="BLOCKED"),"UC08 axes blocked");
const subjects=new Set([...modules.map(x=>x.module_id),...axes.map(x=>x.axis_id)]);
const topicIds=new Set(Object.keys(topics));
const pairKeys=new Set();
for(const [i,x]of rel.entries()){
 validate(relSchema,x,"relation["+i+"]");
 check(subjects.has(x.subject_id),"relation subject "+x.subject_id);
 check(topicIds.has(x.object_id),"relation topic "+x.object_id);
 check(x.status==="CANDIDATE"&&x.semantic_mapping==="related"&&x.predicate==="RELATED_TO","relation candidate only "+x.canonical_id);
 check(x.applicability?.publication_allowed===false&&x.applicability?.rights_status==="NOT_CLEARED","no publish "+x.canonical_id);
 const key=x.subject_id+"|"+x.object_id;check(!pairKeys.has(key),"duplicate "+key);pairKeys.add(key);
}
check(cross.length===rel.length,"CSV+JSON relation row parity");
for(const x of cross)check(pairKeys.has(x.curriculum_id+"|"+x.canonical_topic_id),"crosswalk row "+x.relation_id);
for(const [i,x]of learning.entries()){
 validate(lrSchema,x,"learning["+i+"]");
 check(x.status==="HOLD_HUMAN","resource must remain HOLD "+x.canonical_id);
 check(x.source_claim_ids.length===0,"no invented claim "+x.canonical_id);
 check(x.projection_profile_ref==="TPL-ARTICLE-001@0.2.0","reuse existing article template");
 for(const uid of x.canonical_topic_ids)check(topicIds.has(uid),"resource topic "+uid);
}
check(learning.length===3,"3 draft resources");
check(rel.length===17,"17 curated candidate relations");
check(topicIds.size===12,"12 verified subject topic refs");
const summary={gate:"M04_STRUCTURAL_ONLY",status:problems.length?"FAIL":"PASS",units:units.length,modules:modules.length,uc08_axes:axes.length,relationships:rel.length,topic_refs:topicIds.size,resources:learning.length,claims_promoted:0,clinical_review:"NOT_EXECUTED",rights_review:"NOT_EXECUTED",errors:problems};
process.stdout.write(JSON.stringify(summary,null,2)+"\n");
if(problems.length)process.exitCode=1;
