#!/usr/bin/env node
/**
 * Non-authorizing clinical contract drift report, from the real runtime loader.
 * No mutation, no "new tools are published" assumption, and no rights grant.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadToolContracts } from "./load-tool-contracts.mjs";

const canonical=JSON.parse(readFileSync("contracts/entities/clinical-tools.v1.json","utf8"));
const runtime=loadToolContracts();
assert.equal(canonical.schemaVersion,1);
assert.ok(Array.isArray(canonical.items));
assert.ok(Array.isArray(runtime.tools));
const published=new Map(canonical.items.map(x=>[x.slug,x]));
const tools=new Map(runtime.tools.map(x=>[x.slug,x]));
assert.equal(published.size,canonical.items.length,"DUPLICATE_STORED_TOOL");
assert.equal(tools.size,runtime.tools.length,"DUPLICATE_RUNTIME_TOOL");
const absentInStored=[...tools.keys()].filter(slug=>!published.has(slug)).sort();
const deletedFromRuntime=[...published.keys()].filter(slug=>!tools.has(slug)).sort();
const mismatches=[...published.keys()].filter(slug=>tools.has(slug)).flatMap(slug=>{
  const old=published.get(slug),latest=tools.get(slug);
  const changed=[];
  if(old.status!==latest.status)changed.push("status");
  if(old.publicacao!==latest.publicacao)changed.push("publicacao");
  if(JSON.stringify(old.source_ids)!==JSON.stringify(latest.sourceIds ?? []))changed.push("source_ids");
  return changed.length?[{slug,changed}]:[];
});
const refs=(runtime.fontes||[]).filter(x=>x?.integrity?.sha256 &&
  /^0{64}$/.test(x.integrity.sha256)).map(x=>x.canonical_id).sort();
const missingBindings=(runtime.bindings||[]).filter(x=>!x.source_ids?.length).length;
const withoutAtomProof=(runtime.bindings||[]).filter(x=>!x.evidence_bundle_ids?.length).length;
const summary={
  contract:"contracts/entities/clinical-tools.v1.json",
  storedTools:published.size,runtimeTools:tools.size,absentInStored,
  deletedFromRuntime,mismatches,
  missingSourceBindings:missingBindings,bindingsWithoutAtomProof:withoutAtomProof,
  unverifiedSourceHashes:refs,
  autoApprovedBindings:0,autoPublishedTools:0,decision:"HOLD_HUMAN",
  writesPerformed:0,releaseEligible:false
};
console.log("CE_CLINICAL_CONTRACT_DRIFT "+JSON.stringify(summary));
if (absentInStored.length || deletedFromRuntime.length || mismatches.length ||
    refs.length || missingBindings || withoutAtomProof) console.log("CE_CLINICAL_GOVERNANCE_HOLD: provenance and field-level clinical check required.");
