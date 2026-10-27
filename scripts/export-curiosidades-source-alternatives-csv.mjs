#!/usr/bin/env node
/**
 * Metadata-only CSV for offline editorial source review.
 * Never exports the article bodies, never authorizes a source, and never writes
 * to Supabase. Human decision fields are deliberately blank.
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
const registry=JSON.parse(readFileSync("registers/curiosidades/mem-source-alternatives.v1.json","utf8"));
const header=[
  "slug","original_source_id","reference_location","alternative_source_id",
  "alternative_organization","alternative_title","alternative_url",
  "source_page_verification","candidate_disposition","reason",
  "claim_validation","rights_validation","human_decision","reviewer","review_date","evidence_locator"
];
function csv(v){const x=String(v??"");return '"'+x.replaceAll('"','""')+'"'}
const rows=registry.items.map(row=>[
  row.slug,row.originalSourceId,row.referenceLocation,row.candidateSourceId,
  row.alternative.organization,row.alternative.title,row.alternative.url,
  row.verification,row.disposition,row.notes,row.claimLevel,row.rights,
  "","","",""
]);
if(rows.length!==48||rows.filter(row=>!row[6]).length!==2)throw Error("HOLD_INVALID_SOURCE_ALTERNATIVES");
const output="audit-evidence/curiosidades/mem-source-review.v1.csv";
mkdirSync("audit-evidence/curiosidades",{recursive:true});
writeFileSync(output,"\uFEFF"+[header,...rows].map(row=>row.map(csv).join(",")).join("\n")+"\n","utf8");
console.log(JSON.stringify({result:"PASS_METADATA_CSV_ONLY",rows:rows.length,output,publication:false}));
