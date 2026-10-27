#!/usr/bin/env node
/**
 * Deterministic page-by-page evidence inventory, without leaking article bodies.
 * Use with the original read-only snapshots; never changes Supabase or approves pages.
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
const root = "src/lib/content/curiosidades";
const pages = JSON.parse(readFileSync(root+"/catalog.json","utf8"));
const sources = JSON.parse(readFileSync(root+"/sources.json","utf8"));
const sourceMap = new Map(sources.map(s=>[s.source_id,s]));
const missingSourceIds = new Set();
const findings = [], totals = {pages:pages.length,sections:0,components:0,sourceReferences:0,pagesWithMissingSources:0,pagesWithMissingHash:0,provisionallyApproved:0};
const supported = new Set(["checkgrid","callout","faq","pair","stats","evidence","cards","timeline","conflict","quote"]);
for(const entry of pages){
 const record = JSON.parse(readFileSync(root+"/pages/"+entry.slug+".json","utf8"));
 const content = record.content;
 const issues = [], missing = new Set();
 const references = new Set((content.references ?? []).map(ref=>ref.id));
 const sectionIds = new Set();
 if(record.slug!==entry.slug || content.slug!==entry.slug || record.content_status!==entry.content_status) issues.push("PROVENANCE_MISMATCH");
 if(!record.source_sha256){ issues.push("SOURCE_HASH_MISSING");totals.pagesWithMissingHash++ }
 if(content.sections?.length!==entry.section_count) issues.push("SECTION_COUNT_MISMATCH");
 if(content.references?.length!==entry.reference_count) issues.push("REFERENCE_COUNT_MISMATCH");
 if(!content.hero_lead && !content.intro?.lead) issues.push("LEAD_MISSING");
 const related=(content.related_slugs??[]);
 if(related.includes(entry.slug)) issues.push("SELF_RELATED_LINK");
 const orphanRelated=related.filter(s=>!pages.some(p=>p.slug===s));
 if(orphanRelated.length) issues.push("RELATED_SLUG_NOT_IN_CATALOG:"+orphanRelated.length);
 for(const ref of references){
   totals.sourceReferences++;
   if(!sourceMap.has(ref)){missing.add(ref);missingSourceIds.add(ref);}
 }
 for(const sec of content.sections??[]){
   totals.sections++;
   if(sectionIds.has(sec.id)||!sec.id)issues.push("DUPLICATE_SECTION:"+sec.id);
   sectionIds.add(sec.id);
   for(const id of sec.sources??[]){
     if(!sourceMap.has(id)){missing.add(id);missingSourceIds.add(id);}
     if(!references.has(id))issues.push("UNDECLARED_SECTION_CITATION:"+id);
   }
   for(const block of sec.components??[]){
     totals.components++;
     if(!supported.has(block.type))issues.push("UNKNOWN_COMPONENT:"+block.type);
     if(["faq","cards","pair","stats","timeline","conflict","checkgrid"].includes(block.type) && !(block.items?.length))issues.push("EMPTY_BLOCK:"+block.type);
     if(["quote","evidence","callout"].includes(block.type) && !block.text)issues.push("EMPTY_BLOCK:"+block.type);
   }
 }
 if(missing.size){
   totals.pagesWithMissingSources++;
   issues.push("MISSING_SOURCE_IDS:"+missing.size);
 }
 if(entry.content_status==="APPROVED" || entry.content_status==="PUBLISHED") totals.provisionallyApproved++;
 findings.push({
   slug:entry.slug,category:entry.category,status:entry.content_status,
   sections:content.sections?.length??0,componentBlocks:(content.sections??[]).reduce((n,s)=>n+(s.components?.length??0),0),
   referenceDeclarations:content.references?.length??0,
   unresolvedSourceIds:[...missing].sort(),
   issues:[...new Set(issues)].sort(),
   publicationDecision:"HOLD_HUMAN",
 });
}
const result = {
  schemaVersion:1,
  purpose:"READ_ONLY_EDITORIAL_FIND_REGISTER",
  source:"src/lib/content/curiosidades/pages/*.json — Supabase ce_curiosidades_v1 snapshot",
  status:"NOT_PUBLISHED",
  totals,
  missingSourceIds:[...missingSourceIds].sort(),
  findings,
  releaseGate:{automaticPublication:false,requiresOwnerApproval:true,rightsAndSourcesPending:true},
};
const output="audit-evidence/curiosidades/mem-editorial-find-register.v1.json";
mkdirSync("audit-evidence/curiosidades",{recursive:true});
writeFileSync(output,JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify({output,totals,missingSourceIds:result.missingSourceIds.length,pagesWithIssues:findings.filter(f=>f.issues.length).length},null,2));
if(totals.pages!==87||totals.provisionallyApproved>0)process.exitCode=1;
