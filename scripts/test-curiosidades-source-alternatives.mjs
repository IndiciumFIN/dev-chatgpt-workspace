#!/usr/bin/env node
// Automated consistency gate for research candidates, not a source/claims approval.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = p => JSON.parse(readFileSync(p, "utf8"));
const root = "src/lib/content/curiosidades/";
const register = read("registers/curiosidades/mem-source-alternatives.v1.json");
const catalog = read(root + "catalog.json");
const sources = read(root + "sources.json");
const sourceIds = new Set(sources.map(x=>x.source_id));
const candidateByRef = new Map();
assert.equal(catalog.length,87);
assert.equal(register.counts.total,register.items.length);
const unresolved = new Set();
const sourceStatuses = new Set();
for(const meta of catalog) {
 const page=read(root + "pages/" + meta.slug + ".json");
 for(const ref of page.content.references??[]) {
   if(!sourceIds.has(ref.id)) unresolved.add(meta.slug+"::"+ref.id+"::PAGE_REFERENCES");
 }
 for(const section of page.content.sections??[]) {
   for(const sid of section.sources??[]) {
     if(!sourceIds.has(sid) && !(page.content.references??[]).some(r=>r.id===sid)) {
       unresolved.add(meta.slug+"::"+sid+"::SECTION_ONLY");
     }
   }
 }
}
for(const e of register.items){
 const key=e.slug+"::"+e.originalSourceId+"::"+e.referenceLocation;
 assert(unresolved.has(key),"ALTERNATIVE_WITHOUT_ORIGINAL_FIND:"+key);
 assert(!candidateByRef.has(key),"DUPLICATE_CANDIDATE:"+key);
 candidateByRef.set(key,e);
 assert.equal(e.claimLevel,"NOT_VALIDATED");
 assert.equal(e.rights,"NOT_ASSESSED");
 assert(["CANDIDATE_FOR_REVIEW","HOLD_NO_MATCH"].includes(e.disposition));
 if(e.disposition==="CANDIDATE_FOR_REVIEW"){
   assert(e.alternative.url?.startsWith("https://"),"SOURCE_URL_REQUIRED:"+key);
   const url=new URL(e.alternative.url);
   assert(!url.username&&!url.password,"UNSAFE_SOURCE_URL:"+key);
   if(e.candidateSourceId) assert(sourceIds.has(e.candidateSourceId),"UNKNOWN_EXISTING_SOURCE:"+key);
 } else {
   assert.equal(e.alternative.url,null,"HOLD_WITH_UNREVIEWED_PUBLIC_URL:"+key);
 }
 sourceStatuses.add(e.verification);
}
assert.equal(candidateByRef.size,unresolved.size,"GAPS_IN_SOURCE_MAPPING");
assert.equal(register.counts.total,48);
assert.equal(register.counts.withCandidates,46);
assert.equal(register.counts.stillWithoutDefensibleCandidate,2);
assert.equal(register.counts.sectionOnly,2);
const view=readFileSync("src/components/templates/curiosity-view.tsx","utf8");
const adapter=readFileSync("src/components/article/curiosity-page.tsx","utf8");
assert(view.includes("Alternativas bibliográficas para revisão"));
assert(view.includes("Sem fonte defensável; HOLD_HUMAN"));
// O adaptador consolidado não pode empacotar fontes candidatas no cliente.
// Só a etapa editorial protegida poderá carregar essas alternativas em uma revisão futura.
assert(adapter.includes("alternativesDeferred"), "CANDIDATE_SOURCES_MUST_STAY_DEFERRED");
assert(!adapter.includes("mem-source-alternatives.v1.json"), "UNREVIEWED_CANDIDATE_SOURCES_BUNDLED");
assert(view.includes("Alternativas bibliográficas candidatas aguardam a etapa de dados; nenhuma fonte foi substituída."), "DEFERRED_SOURCE_NOTICE_MISSING");
const route=readFileSync("src/routes/blog.$slug.tsx","utf8");
assert(route.includes("import.meta.env.DEV") && route.includes("VITE_CURIOSIDADES_MEM_PREVIEW"), "DEV_PREVIEW_GATE_MISSING");
console.log(JSON.stringify({
 verdict:"PASS_CANDIDATE_MAPPING_ONLY",unresolvedUses:unresolved.size,
 alternatives:register.counts.withCandidates,hold:register.counts.stillWithoutDefensibleCandidate,
 pendingSectionOnly:register.counts.sectionOnly,claimReview:"HOLD",rightsReview:"HOLD",adapterSourceRendering:"DEFERRED_NOT_APPROVED"
}));
