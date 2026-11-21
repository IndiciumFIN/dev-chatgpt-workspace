import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {validateClinicalC1,verify} from "./ce-w26-grook-clinical-c1-verify.mjs";
const root=new URL("../",import.meta.url);
const read=p=>readFileSync(new URL(p,root),"utf8");
const obj=p=>JSON.parse(read(p));
const prefix="registers/governance/";
const m=obj(prefix+"ce-w26-grook-full-delta-20261121.v1.json");
const p1=obj(prefix+"ce-w26-grook-p1-test-disposition-20261121.v1.json");
const s1=obj(prefix+"ce-w26-grook-p0-security-s1-20261121.v1.json");
const s2=obj(prefix+"ce-w26-grook-security-s2-20261121.v1.json");
const cross=obj(prefix+"ce-w26-grook-78-tools-crosswalk-20261121.v1.json");
const ledger=obj(prefix+"ce-w26-grook-clinical-c1-20261121.v1.json");
const copy=x=>structuredClone(x);
const validate=x=>validateClinicalC1(x,m,p1,s1,s2,cross);
test("C1 validates 48/48, two HOLDs, 78 old-only tools, zero SEALED",()=>{
 assert.deepEqual(verify(),{phase:"DEV_ONLY",prior_disposed:15,new_disposed:5,cumulative_disposed:20,unresolved:28,holds:2,catalog_old_only:78,branches_sealed:0});
});
test("fabricated source blob, missing ledger row, and prior decisions rejected",()=>{
 const a=copy(ledger);a.new_decisions[0].canonical_git_blob_sha="f".repeat(40);
 assert.throws(()=>validate(a),/new blob mapping/);
 const b=copy(ledger);b.other_pending_paths.pop();
 assert.throws(()=>validate(b),/coverage/);
 const c=copy(ledger);c.previous_dev_dispositions[0].decision="INTEGRATED_VERIFIED";
 assert.throws(()=>validate(c),/earlier proof mutation/);
});
test("cannot silently clear issuer, catalog, rights or clinical release",()=>{
 const a=copy(ledger);a.holds[1].decision="SUPERSEDED_WITH_PROOF";
 assert.throws(()=>validate(a),/catalog HOLD displaced/);
 const b=copy(ledger);b.release.clinical_or_medical_approval=true;
 assert.throws(()=>validate(b),/fake release/);
 const c=copy(ledger);c.holds[0].release_allowed=true;
 assert.throws(()=>validate(c),/issuer hold displaced/);
 const d=copy(ledger);d.counts.branches_sealed=1;
 assert.throws(()=>validate(d),/counts/);
});
test("source clinical contracts gate form and report while routes reject unpublished candidates",()=>{
 const ui=read("src/components/tools/clinical-tool.tsx");
 const tmp=read("src/lib/template-contract.ts");
 const report=read("src/lib/contract.ts");
 const registry=read("src/lib/route-registry.ts");
 assert.match(ui,/contractOf\("ferramenta"\)\.resources\.includes\("formulario"\)/);
 assert.match(ui,/contractOf\("ferramenta"\)\.resources\.includes\("laudo"\)/);
 assert.match(ui,/onDocx=\{canExportReport \? saveDoc : undefined\}/);
 assert.match(tmp,/ferramenta: \{[^}]+resources: \["formulario", "laudo"\]/);
 assert.match(report,/return indexablePaths\(\)/);
 assert.match(registry,/indexavel: \(tool\.publicacao \?\? "publicada"\) === "publicada"/);
});
test("kernel admission rejects all nine untrusted placeholder IDs and forged passed string",()=>{
 const source=read("src/lib/kernel-admit.ts");
 assert.match(source,/LEGACY_UNTRUSTED_VALIDATOR_IDS/);
 assert.match(source,/input\.validators\.some\(\(ok\) => ok !== true\)/);
 assert.match(source,/select id, passed from kernel_validator where order_id = \$1/);
 assert.match(source,/validatorIds: validators\.map\(\(row\) => row\.id\)/);
 assert.equal((ledger.new_decisions.find(x=>x.path==="src/lib/kernel-admit.ts")||{}).clinical_approval,false);
 // Use the actual existing TS test suite (including disposable PGlite), not a fake regex-only substitute.
 const result=spawnSync(process.execPath,["--experimental-strip-types","--test","src/lib/kernel-admit.test.ts"],{
   cwd:fileURLToPath(root),encoding:"utf8",timeout:150000,maxBuffer:3*1024*1024,
   env:{...process.env,DATABASE_URL:"",VITE_AUTH_ENABLED:"false"}
 });
 assert.equal(result.error,undefined,"kernel TS test process "+String(result.error?.message));
 assert.equal(result.status,0,"kernel-admit.test.ts failed in isolated CI: "+String(result.stderr||result.stdout).slice(-1800));
});
test("published 5 and candidate 2: 78 legacy IDs preserved, never silently admitted",()=>{
 assert.equal(cross.historical_only.length,78);
 assert.equal(cross.historical_only.filter(x=>x.status==="CURRENT_CANDIDATE_NOT_INDEXED").length,2);
 assert.equal(cross.historical_only.filter(x=>x.status==="SCOPE_REVIEW_POTENTIAL_NON_CLINICAL").length,4);
 assert.equal(cross.historical_only.filter(x=>x.status==="UNMAPPED_ACROSS_SOURCES").length,72);
 const cat=read("src/lib/tools/catalog.ts");
 assert.match(cat,/export const tools: ClinicalTool\[\] = \[braden, morse, apgar, gotejamento, imc\]/);
 assert.match(cat,/export const candidateTools: ClinicalTool\[\] = \[aldrete, examesLaboratoriais\]/);
 assert.equal(cross.historical_only.filter(x=>x.clinical_correctness==="NOT_VERIFIED").length,78);
});
