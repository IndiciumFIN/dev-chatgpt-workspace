// CKO M05: independent structural check for metadata-only evidence FINDs.
// Run: node cko/evidence-index/2026-11-14/m05/validate-m05-findings.mjs
// This does not approve rights, authorize publication, or mutate historical databases.
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../../../..");
const get=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const base="cko/evidence-index/2026-11-14/m05/";
const schema=get("contracts/cko-schemas/find.schema.json");
const finds=get(base+"M05_FINDINGS.schema-compatible.json").records;
const sources=get(base+"M05_SOURCE_DISCOVERY_CANDIDATES.json");
const rule=get(base+"M05_SEMANTIC_FALSE_POSITIVE_RULE.json");
const cover=get(base+"M05_PILOT_EVIDENCE_COVERAGE.json");
const errs=[];const test=(v,msg)=>{if(!v)errs.push(msg)};
function check(s,x,p){
 if(s.type==="object"){
  if(!x||typeof x!=="object"||Array.isArray(x)){errs.push(p+": object required");return}
  for(const k of s.required||[])test(Object.hasOwn(x,k),p+"."+k+": required");
  if(s.additionalProperties===false)for(const k of Object.keys(x))test(Object.hasOwn(s.properties||{},k),p+"."+k+": unexpected");
  for(const [k,v]of Object.entries(x))if(s.properties?.[k])check(s.properties[k],v,p+"."+k);
 }else if(s.type==="array"){
  if(!Array.isArray(x)){errs.push(p+": array required");return}
  if(s.minItems!==undefined)test(x.length>=s.minItems,p+": minItems");
  if(s.items)for(let i=0;i<x.length;i++)check(s.items,x[i],p+"["+i+"]");
 }else if(s.type==="string")test(typeof x==="string",p+": string");
 if(s.const!==undefined)test(x===s.const,p+": const");
 if(s.enum)test(s.enum.includes(x),p+": enum");
 if(s.pattern&&typeof x==="string")test(new RegExp(s.pattern).test(x),p+": pattern");
}
test(finds.length===3,"3 candidate findings");
for(const [i,f]of finds.entries()){check(schema,f,"find["+i+"]");test(f.status==="CANDIDATE",f.canonical_id+": admitted without review");}
test(rule.topic_uid==="TOPIC-UE-2-26"&&rule.source_id==="SRC-SBC-HA-2025","false-positive pair");
test(rule.candidate_rows===80&&rule.candidate_atoms_with_text===80,"audited row count");
test(rule.action==="PROPOSED_EXCLUDE_FROM_SCM_CLAIM_PROMOTION","no silent source deletion");
test(rule.data_deletion===false&&rule.original_snapshot_modified===false,"source must remain immutable");
test(sources.discovery_only===true&&sources.records.length===6,"6 metadata-only discoveries");
for(const s of sources.records){test(s.discovery_status.startsWith("METADATA_ONLY")||s.discovery_status.startsWith("WEB_METADATA_CONFIRMED"),s.candidate_id+": unexpected ingested state");test(!Object.hasOwn(s,"text"),s.candidate_id+": text in public repo");test(s.rights!=="APPROVED",s.candidate_id+": rights erroneously approved");}
test(cover.pilot_coverage.length===3,"three pilot coverage entries");
for(const p of cover.pilot_coverage){test(p.claim_candidates===0||p.pilot==="ECG",p.pilot+": unapproved clinical claim promotion");}
const result={gate:"M05_FINDINGS_STRUCTURAL",status:errs.length?"FAIL":"PASS",findings:finds.length,source_discoveries:sources.records.length,pilots:cover.pilot_coverage.length,clinical_release:"BLOCKED",rights_release:"BLOCKED",errors:errs};
process.stdout.write(JSON.stringify(result,null,2)+"\n");if(errs.length)process.exitCode=1;
