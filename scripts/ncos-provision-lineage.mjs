#!/usr/bin/env node
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {auditRegulatorySourceChain} from "./lib/ncos-provision-lineage.mjs";
const root=new URL("../",import.meta.url);
const paths={
 graph:"registers/governance/ncos-regulatory-provision-lineage-20261114.v1.json",
 sources:"registers/governance/ncos-source-universe-supabase-snapshot-20261114.v1.json"
};
const read=p=>readFileSync(new URL(p,root));
const json=p=>JSON.parse(read(p).toString("utf8"));
const checked=auditRegulatorySourceChain({graph:json(paths.graph),sourceInventory:json(paths.sources)});
const artifact={
 schemaVersion:"1.0.0",scope:"NCOS_CE_REGULATORY_NONACCOUNTING",kind:"REGULATORY_ATOM_TO_MASTER_LINEAGE",
 inputDigests:Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,{path:p,sha256:createHash("sha256").update(read(p)).digest("hex")}])),
 counts:checked.counts,errors:checked.errors,holds:checked.holds,edges:checked.edges,
 approval:"HOLD_HUMAN",releaseEligible:false,noLegalTextInferred:true,
 governance:"Explicit amendment and derived snapshot provenance must not be mistaken for a new official enactment or clinical sign-off"
};
const out=new URL("../audit-evidence/ncos-multisource-universe/",import.meta.url);
mkdirSync(out,{recursive:true});
writeFileSync(new URL("regulatory-atom-source-chain.v1.json",out),JSON.stringify(artifact,null,2)+"\n");
console.log("NCOS_REGULATORY_LINEAGE "+JSON.stringify(artifact.counts));
if(checked.errors.length)process.exitCode=1;
if(process.argv.includes("--enforce-release"))process.exitCode=1;
