#!/usr/bin/env node
/**
 * Non-mutating CKO canonical evidence crosswalk.
 * Validates actual versioned CKO contracts, clinical source/binding/field records,
 * and editorial projection provenance. NO atom creation from unverified text.
 */
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { inspectCanonicalLineage } from "./lib/ncos-source-lineage.mjs";
const root=new URL("../",import.meta.url);
const read=(p)=>readFileSync(new URL(p,root));
const json=(p)=>JSON.parse(read(p).toString("utf8"));
const sha=(bytes)=>createHash("sha256").update(bytes).digest("hex");
const sourcesPath="contracts/entities/tool-sources.v1.json";
const itemsPath="contracts/entities/tool-bindings.v1.json";
const toolsPath="contracts/entities/clinical-tools.v1.json";
const sources=json(sourcesPath).items;
const items=json(itemsPath).items;
const tools=json(toolsPath).items;
if (!Array.isArray(sources)||!Array.isArray(items)||!Array.isArray(tools))
  throw new Error("CKO_CANONICAL_INPUT_MISSING");
const bindings=items.filter(x=>x.authority_class!==undefined);
const fields=items.filter(x=>x.authority_binding_ref!==undefined);
if (bindings.length+fields.length!==items.length)
  throw new Error("UNKNOWN_CKO_BINDING_RECORD_SHAPE");
const schemaPaths={
 source:"contracts/cko-schemas/source.schema.json",
 binding:"contracts/cko-schemas/authority_binding.schema.json",
 field:"contracts/cko-schemas/field_definition.schema.json",
 claim:"contracts/cko-schemas/claim.schema.json",
 relation:"contracts/cko-schemas/relation.schema.json",
 object:"contracts/cko-schemas/canonical_object.schema.json"
};
const schemas=Object.fromEntries(Object.entries(schemaPaths).map(([k,p])=>[k,json(p)]));
const folder="contracts/cko-bibliotecas/bindings/";
const contentFiles=readdirSync(new URL(folder+"content/",root)).filter(x=>x.endsWith(".content.json")).sort();
const provenanceFiles=new Set(readdirSync(new URL(folder+"provenance/",root)).filter(x=>x.endsWith(".provenance.json")));
const editorial=[];
const missingManifests=[];
for (const file of contentFiles) {
 const slug=file.slice(0,-".content.json".length);
 const provName=slug+".provenance.json";
 if(!provenanceFiles.has(provName)) {missingManifests.push(slug);continue;}
 editorial.push({slug,content:json(folder+"content/"+file),provenance:json(folder+"provenance/"+provName)});
}
const result=inspectCanonicalLineage({sources,bindings,fields,tools,editorial,schemas});
for(const slug of missingManifests)result.errors.push({code:"EDITORIAL_MISSING_PROVENANCE_MANIFEST",entity:slug,detail:"Content present but provenance manifest absent"});
result.counts.errors=result.errors.length;
result.counts.holds=result.holds.length;
const inputFiles=[sourcesPath,itemsPath,toolsPath,...Object.values(schemaPaths),
 ...contentFiles.map(x=>folder+"content/"+x),
 ...[...provenanceFiles].sort().map(x=>folder+"provenance/"+x)];
const inputs=inputFiles.map(path=>({path,sha256:sha(read(path))}));
const lineages={
 schemaVersion:"1.0.0",
 project:"Calculadoras de Enfermagem / NCOS",
 artifactPurpose:"READ_ONLY_SOURCE_FIRST_CKO_CROSSWALK_NOT_RELEASE",
 establishedCkoSchemas:schemaPaths,
 repositorySha:process.env.GITHUB_SHA||null,
 inputDigest:sha(inputs.map(x=>x.path+":"+x.sha256).join("\n")),
 inputProvenance:inputs,
 normativeAndScientificSources:sources.map(s=>({
  canonical_id:s.canonical_id,version:s.version,status:s.status,
  source_type:s.source_type,authority:s.authority,rights:s.rights,
  locator:s.locator,integrity:s.integrity
 })),
 lineageGraph:result.edges,
 checks:{errors:result.errors,holds:result.holds},
 summary:result.counts,
 atomizedClaimRecordsValidated:0,
 claimValidation:"NOT_VERIFIED_NO_ADMITTED_ATOM_CORPUS_IN_THIS_INPUT",
 editorialUse:"ATTRIBUTED_EDITORIAL_PROJECTION_NOT_NORMATIVE_AUTHORITY",
 physicalDatabaseUse:"IMPLEMENTATION_AND_INTEGRITY_CHECK_ONLY",
 status:(result.errors.length||result.holds.length)?"HOLD_HUMAN":"PASS",
 releaseEligible:false
};
const out=new URL("../audit-evidence/ncos-canonical-source-lineage/",import.meta.url);
mkdirSync(out,{recursive:true});
writeFileSync(new URL("lineage-candidate.v1.json",out),JSON.stringify(lineages,null,2)+"\n");
console.log("NCOS_CKO_SOURCE_FIRST_SUMMARY "+JSON.stringify(result.counts));
console.log("NCOS_CKO_SOURCE_FIRST_STATUS "+lineages.status);
console.log("NCOS_CKO_ATOMIZATION "+lineages.claimValidation);
if(process.argv.includes("--enforce")&&(lineages.status!=="PASS"||!lineages.atomizedClaimRecordsValidated))
  process.exitCode=1;
