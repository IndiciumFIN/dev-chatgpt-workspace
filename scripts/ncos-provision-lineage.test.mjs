import test from "node:test";
import assert from "node:assert/strict";
import {auditRegulatorySourceChain} from "./lib/ncos-provision-lineage.mjs";
function fixture(){
 const sha="a".repeat(64), fsha="b".repeat(64);
 return {sourceInventory:{datasets:{
   evidenceSources:[{source_id:"SRC-BASE"},{source_id:"SRC-AMEND"}],
   snapshots:[{snapshot_id:"SNAP-BASE",source_id:"SRC-BASE",content_sha256:sha},
    {snapshot_id:"SNAP-AMEND",source_id:"SRC-AMEND",content_sha256:sha}],
   fragments:[{fragment_id:"FRAG",snapshot_id:"SNAP-AMEND",fragment_sha256:fsha}]
 }},
 graph:{scope:"NCOS_REGULATORY_NONACCOUNTING",noRemoteMutations:true,
  noAutomaticQualification:true,noNormativeFullTextIncluded:true,
  records:{
   instruments:[
    {instrument_id:"I1",canonical_id:"LAW-BASE",official_source_id:"SRC-BASE",current_snapshot_id:"SNAP-BASE"},
    {instrument_id:"I2",canonical_id:"LAW-AMEND",official_source_id:"SRC-AMEND",current_snapshot_id:"SNAP-AMEND"}],
   provisions:[{provision_id:"P1",instrument_id:"I1",source_fragment_id:"FRAG",
     snapshot_id:"SNAP-AMEND",fragment_sha256:fsha,source_snapshot_sha256:sha,fragment_source_id:"SRC-AMEND"}],
   masterProvisions:[{provision_id:"P1",canonical_id:"LAW-BASE-ART-1",source_fragment_id:"FRAG"}],
   derivedSnapshotOrigins:[],
   amendments:[{relationship_id:"R1",source_id:"LAW-AMEND",target_id:"LAW-BASE-ART-1",
     provenance_ref:"SRC-AMEND",relation_type:"AMENDS_PROVISION",status:"CONTROLLED_VALIDATED"}]
 }}}
}
test("legitimate cross-source amendment is recognized only with explicit provision relation",()=>{
 const x=fixture(),r=auditRegulatorySourceChain(x);
 assert.equal(r.errors.length,0);assert.equal(r.counts.crossSourceProvisionsSupportedByExactAmendments,1);
 assert.equal(r.releaseGate,"HOLD_HUMAN_LEGAL_FORCE_AND_CANONICAL_PROJECTION");
});
test("cross-source fragment with removed amendment evidence fails",()=>{
 const x=fixture();x.graph.records.amendments=[];
 assert.ok(auditRegulatorySourceChain(x).errors.some(e=>e.code==="CROSS_SOURCE_PROVISION_WITHOUT_EXPLICIT_AMENDMENT"));
});
test("provision missing from master is a transparent HOLD, not invented",()=>{
 const x=fixture();x.graph.records.masterProvisions=[];
 const r=auditRegulatorySourceChain(x);
 assert.equal(r.counts.missingMasterProvisionNodes,1);
 assert.ok(r.holds.some(e=>e.code==="REGULATORY_PROVISION_NOT_IN_MASTER"));
});
test("derived snapshot needs explicit no-official-publication metadata",()=>{
 const x=fixture();x.graph.records.instruments[0].current_snapshot_id="SNAP-AMEND";
 assert.ok(auditRegulatorySourceChain(x).errors.some(e=>e.code==="UNACCOUNTED_DERIVED_SNAPSHOT"));
});
test("tampered physical source-fragment hash blocks projection",()=>{
 const x=fixture();x.graph.records.provisions[0].fragment_sha256="0".repeat(64);
 assert.ok(auditRegulatorySourceChain(x).errors.some(e=>e.code==="PROVISION_FRAGMENT_DRIFT"));
});
