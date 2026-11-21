// CKO M05: deterministic structural gate. No clinical approval or source-rights grant.
// Run: node cko/canonical-content/2026-11-14/m05/validate-m05.mjs
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const current=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(current,"../../../..");
const json=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const prefix="cko/canonical-content/2026-11-14/";
const schema=json("contracts/cko-schemas/claim.schema.json");
const bundle=json(prefix+"m05/CLAIMS_ECG_CANDIDATE.schema-compatible.json");
const atoms=json(prefix+"m05/ECG_ATOM_PROVENANCE_METADATA.json");
const review=json(prefix+"m05/CLAIM_DOSSIERS_REVIEW.json");
const topics=json(prefix+"m04/TOPIC_REFERENCE_INDEX.json").topics;
const errs=[];
const require=(ok,msg)=>{if(!ok)errs.push(msg)};
function validate(s,v,p){
 if(s.type==="object"){
  if(v===null||typeof v!=="object"||Array.isArray(v)){errs.push(p+": type object");return}
  for(const k of s.required||[])require(Object.hasOwn(v,k),p+"."+k+": required");
  if(s.additionalProperties===false)for(const k of Object.keys(v))require(Object.hasOwn(s.properties||{},k),p+"."+k+": unexpected");
  for(const [k,x]of Object.entries(v))if(s.properties?.[k])validate(s.properties[k],x,p+"."+k);
 }else if(s.type==="array"){
  if(!Array.isArray(v)){errs.push(p+": array required");return}
  if(s.minItems!==undefined)require(v.length>=s.minItems,p+": minItems");
  if(s.items)for(let i=0;i<v.length;i++)validate(s.items,v[i],p+"["+i+"]");
 }else if(s.type==="string")require(typeof v==="string",p+": string");
 if(s.const!==undefined)require(v===s.const,p+": const");
 if(s.enum)require(s.enum.includes(v),p+": enum");
 if(s.pattern&&typeof v==="string")require(new RegExp(s.pattern).test(v),p+": pattern");
 if(s.minLength!==undefined&&typeof v==="string")require(v.length>=s.minLength,p+": minLength");
}
require(bundle.claims.length===3,"expected 3 candidate ECG claims");
require(review.dossiers.length===3,"expected 3 review dossiers");
require(atoms.source_id==="SRC-SBC-ECG-2022","source identity");
require(/^[a-f0-9]{64}$/.test(atoms.document_sha256),"document sha");
const atomIds=new Set(Object.keys(atoms.atom_refs));
require(atomIds.size===4,"4 independent atom refs");
const keys=new Set(),claimIds=new Set();
for(const [i,c]of bundle.claims.entries()){
 validate(schema,c,"claim["+i+"]");
 require(c.status==="CANDIDATE"&&c.review==="PENDING",c.canonical_id+": unapproved");
 require(c.claim_type==="CLINICAL",c.canonical_id+": claim type");
 require(c.source_ids.length===1&&c.source_ids[0]===atoms.source_id,c.canonical_id+": source mismatch");
 require(Boolean(topics[c.object_id]),c.canonical_id+": unknown topic ID");
 require(c.provenance_refs.includes(atoms.document_id),c.canonical_id+": missing document");
 require(c.applicability.population_ref==="PENDING_POPULATION_REF_MAPPING",c.canonical_id+": unintended population mapping");
 require(!keys.has(c.assertion_key),c.canonical_id+": duplicated assertion");
 keys.add(c.assertion_key);claimIds.add(c.canonical_id);
 for(const a of c.binding_ids){
  require(atomIds.has(a),c.canonical_id+": missing atom "+a);
  require(c.provenance_refs.includes(a),c.canonical_id+": missing provenance for "+a);
 }
}
for(const [a,v]of Object.entries(atoms.atom_refs)){
 require(/^[a-f0-9]{64}$/.test(v.sha256),a+": atom SHA");
 require(Number.isInteger(v.page)&&v.page>0,a+": page");
 require(/^pdf:p\d+:b\d+$/.test(v.locator),a+": PDF locator");
}
for(const d of review.dossiers){
 require(claimIds.has(d.claim_id),d.claim_id+": dossier mismatch");
 require(d.editorial_release===false,d.claim_id+": attempted public release");
 require(d.status==="CANDIDATE_NO_CLINICAL_APPROVAL",d.claim_id+": status");
 require(!Object.hasOwn(d,"raw_text"),d.claim_id+": raw text included");
}
require(bundle.release_status==="BLOCKED","release must be blocked");
require(atoms.clinical_approval==="NO","unexpected clinical approval");
const result={gate:"M05_CLAIMS_STRUCTURAL",status:errs.length?"FAIL":"PASS",claims:bundle.claims.length,atom_refs:atomIds.size,dossiers:review.dossiers.length,source_rights:"ITEM_RECHECK_PENDING",clinical_approval:"NOT_PERFORMED",errors:errs};
process.stdout.write(JSON.stringify(result,null,2)+"\n");
if(errs.length)process.exitCode=1;
