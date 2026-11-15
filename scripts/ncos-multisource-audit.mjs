#!/usr/bin/env node
import {readFileSync,readdirSync,mkdirSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {auditSourceUniverse} from "./lib/ncos-multisource-audit.mjs";
const root=new URL("../",import.meta.url);
const read=(path)=>readFileSync(new URL(path,root));
const json=(path)=>JSON.parse(read(path).toString("utf8"));
const snapshotPath="registers/governance/ncos-source-universe-supabase-snapshot-20261114.v1.json";
const indexPath="audit-evidence/transversal-acquisition/article-index/20261024/index-manifest.json";
const snapshot=json(snapshotPath);
const index=json(indexPath);
const clinicalSources=json("contracts/entities/tool-sources.v1.json").items;
const editorialDir=new URL("../contracts/cko-bibliotecas/bindings/content/",import.meta.url);
const editorialPages=readdirSync(editorialDir).filter(x=>x.endsWith(".content.json")).length;
const report=auditSourceUniverse(snapshot,{articleIndex:index,clinicalSources,editorialPages});
const indexIntegrity=[];
for(const x of index.items){
 try{
  const page=json(x.indexPath);
  const n=page.articleOccurrences??page.articles?.length;
  if(n!==x.articleOccurrences)report.errors.push({code:"GITHUB_ATOM_INDEX_DRIFT",detail:x.indexPath});
  indexIntegrity.push({identifier:x.identifier,sourceCanonicalId:x.sourceCanonicalId,
    articles:x.articleOccurrences,localIndexPath:x.indexPath,
    reviewed:false,releaseEligible:false});
 }catch(e){report.errors.push({code:"GITHUB_ATOM_INDEX_UNAVAILABLE",detail:x.indexPath});}
}
const normSet=new Set(snapshot.datasets.normatives.map(x=>x.normative_ref));
for(const b of snapshot.datasets.fieldBindingRefs)
 if(!normSet.has(b.normative_ref))report.errors.push({code:"BINDING_OUTSIDE_NON_ACCOUNTING_SCOPE",detail:b.normative_ref});
const envelope={
 schemaVersion:"1.0.0",description:"Read-only reconciliation of Supabase metadata and GitHub source atoms, NOT a canonization",
 scope:"NCOS_CE_NON_ACCOUNTING",sourceSnapshot:snapshotPath,
 sourceSnapshotSha256:createHash("sha256").update(read(snapshotPath)).digest("hex"),
 githubIndexSha256:createHash("sha256").update(read(indexPath)).digest("hex"),
 sourceProject:snapshot.sourceProject,observationDayUtc:snapshot.observationDayUtc,
 inputs:["Existing CKO source/claim/field/relation contracts",snapshotPath,indexPath,
 "contracts/entities/tool-sources.v1.json","contracts/cko-bibliotecas/bindings/content"],
 recordsNotGrantedCanonicalStatus:true,doesNotReadProtectedFullText:true,
 cannotInferRightsFromPublicUri:true,doesNotUpdateSupabase:true,
 counts:report.counts,
 findings:{hardErrors:report.errors,needsReview:report.holds},
 githubSourceIndexes:indexIntegrity,
 candidateLinks:report.edges,
 outcome:report.errors.length?"FAIL_STRUCTURAL_REFERENCE_INTEGRITY":
   report.holds.length?"HOLD_HUMAN_SOURCE_REVIEW":"EVIDENCE_ONLY_NOT_RELEASE",
 releaseEligible:false
};
const folder=new URL("../audit-evidence/ncos-multisource-universe/",import.meta.url);
mkdirSync(folder,{recursive:true});
writeFileSync(new URL("universe-report.v1.json",folder),JSON.stringify(envelope,null,2)+"\n");
console.log("NCOS_MULTISOURCE_COUNTS "+JSON.stringify(report.counts));
console.log("NCOS_MULTISOURCE_GATE "+envelope.outcome);
console.log("HARD_ERRORS "+report.errors.length+" HOLDS "+report.holds.length);
if(report.errors.length)process.exitCode=1;
if(process.argv.includes("--enforce-release")&&report.holds.length)process.exitCode=1;
// --inventory succeeds for structure only and NEVER certifies release readiness.
