#!/usr/bin/env node
import {readFileSync,readdirSync,mkdirSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {buildRecoveryDeltas} from "./lib/ncos-recovery-deltas.mjs";
const root=new URL("../",import.meta.url);
const paths={
 source:"registers/governance/ncos-source-universe-supabase-snapshot-20261114.v1.json",
 drive:"registers/governance/ncos-drive-atomization-recovery-20261114.v1.json"
};
const read=p=>readFileSync(new URL(p,root));
const json=p=>JSON.parse(read(p).toString("utf8"));
const folder="contracts/cko-bibliotecas/bindings/";
const names=readdirSync(new URL(folder+"content/",root)).filter(x=>x.endsWith(".content.json")).sort();
const editorial=names.map(file=>{
 const slug=file.slice(0,-".content.json".length);
 return {slug,page:json(folder+"content/"+file),provenance:json(folder+"provenance/"+slug+".provenance.json")};
});
const report=buildRecoveryDeltas({sourceInventory:json(paths.source),recovery:json(paths.drive),editorial});
const common={schemaVersion:"1.0.0",scope:"NCOS_CE_NONACCOUNTING",
 sourceInputs:Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,{path:p,sha256:createHash("sha256").update(read(p)).digest("hex")}])),
 sourceType:"VERSIONED_SOURCE_EVIDENCE_METADATA_ONLY",approved:false,releaseEligible:false,
 actionPolicy:"No atom recomputation, claim binding, source merge, schema mutation or editorial promotion without verified evidence"};
const out=new URL("../audit-evidence/ncos-multisource-universe/",import.meta.url);
mkdirSync(out,{recursive:true});
const artifacts=[
 ["identity-crosswalk-candidates.v1.json",{...common,kind:"URI_IDENTITY_CROSSWALK_REVIEW",candidates:report.links}],
 ["atomization-recovery-delta.v1.json",{...common,kind:"ORIGINAL_VS_ATOMIZED_SOURCE_RECOVERY",sources:report.documents}],
 ["claims-evidence-gap.v1.json",{...common,kind:"EXISTING_CLAIMS_WITHOUT_ATOMIC_ASSERTIONS",claims:report.claims}],
 ["editorial-claim-bindings.v1.json",{...common,kind:"EDITORIAL_TO_CKO_EXPLICIT_BINDING_CROSSWALK",pages:report.pages}],
 ["recovery-gate.v1.json",{...common,kind:"SOURCE_FIRST_RECOVERY_GATE",totals:report.totals,errors:report.errors,holds:report.holds,releaseGate:report.releaseGate}]
];
for(const [name,obj] of artifacts)writeFileSync(new URL(name,out),JSON.stringify(obj,null,2)+"\n");
console.log("NCOS_RECOVERY_COUNTS "+JSON.stringify(report.totals));
console.log("NCOS_RECOVERY_GATE "+report.releaseGate);
if(report.errors.length)process.exitCode=1;
if(process.argv.includes("--enforce-release"))process.exitCode=1;
