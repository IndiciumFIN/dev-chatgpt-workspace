import assert from "node:assert/strict";
import {execFileSync,spawnSync} from "node:child_process";
import {createHash} from "node:crypto";
import {mkdtempSync,readFileSync,writeFileSync,mkdirSync,rmSync,copyFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {dirname,resolve,join} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const source="38a33fcec02e5bc996a1f84164bf13799b2f81c7";
const expected={
  "audit-evidence/cko/db-first/20261026/apgar-field-domains-from-db.json": "065be8377612fc8f63ad2e1d2146ca13eaadd134",
  "audit-evidence/cko/db-first/20261026/apgar-fugulin-live-readback.json": "2e77b0d822c6981fa91345df4f9d93001eb31229",
  "audit-evidence/cko/db-first/20261026/apgar-requirement-bridge-replay.json": "63aa0ddc755ba8fead2447b2c6d90ca968f39ddf",
  "audit-evidence/cko/db-first/20261026/candidate-canonical-tool-graph.json": "bb5484f48ac37df9c6fa25ebde5c52bc0c336e05",
  "audit-evidence/cko/db-first/20261026/independent-replay-checks.json": "e4f4d497adabeee592329418ef92b9817ab6fab7",
  "audit-evidence/cko/db-first/20261026/offline-integrity-checks.json": "9147e1ddb3de79df6bb56191d968e85bd31ce8d8",
  "registers/governance/candidates/FIND-CKO-DB-FIRST-EVIDENCE-20261026.json": "a85d6ca845d71426c12034811dec3ae42c6eadbd",
  "registers/governance/candidates/FIND-CKO-DB-FIRST-RULE-20261026.json": "aa9db0d99517098f9ccb1b749a878b9b6f54993c",
  "registers/governance/candidates/FIND-CKO-DB-FIRST-RUNTIME-20261026.json": "b6adf8ebe9df9224af8e9f926a969fae2883cf9b",
  "registers/governance/candidates/FIND-CKO-FUGULIN-VARIANTS-20261026.json": "b403b6288dd6b643043e8da27d8fedb8a52d46a0",
  "registers/governance/candidates/TASK-CKO-PILOT-EVIDENCE-20261026.json": "ca8737538a22aac74d32559cf4be4f9a02f7e01d",
  "registers/governance/candidates/TASK-CKO-PILOT-FUGULIN-20261026.json": "456fce07b2fcad9075cc5cf7a855a32116c4fc34",
  "registers/governance/candidates/TASK-CKO-PILOT-RULE-20261026.json": "81bbd70188dff4f7b3ba64769370444ca7de64ae",
  "registers/governance/candidates/TASK-CKO-PILOT-RUNTIME-20261026.json": "709bedc746385e6266db99d89c130b10e439b865",
  "registers/governance/candidates/WO-CKO-PILOT-EVIDENCE-20261026.json": "d5420f576e669f780ccf035a9a58767b91b41104",
  "registers/governance/candidates/WO-CKO-PILOT-FUGULIN-20261026.json": "b4ee6b50f4a50871907a1e2f4ed5c4d006b538a6",
  "registers/governance/candidates/WO-CKO-PILOT-RULE-20261026.json": "5b73a3965749d7b3f73cf0c723aa97065327a913",
  "registers/governance/candidates/WO-CKO-PILOT-RUNTIME-20261026.json": "e41c3ba93c20999a5582cc475028c2dade4e14a9"
};
const manifest=JSON.parse(readFileSync(join(root,"registers/governance/ce-cko-historical-replay-20261128.v1.json"),"utf8"));
assert.equal(manifest.source.commit,source);
assert.deepEqual(Object.fromEntries(manifest.records.map(x=>[x.path,x.git_blob_sha])),expected);
assert.equal(manifest.records.length,18);
assert.ok(manifest.records.every(x=>x.disposition==="EPHEMERAL_OFFLINE_TEST_ONLY"));
assert.ok(Object.values(manifest.controls).every(x=>x===true));
const git=(args)=>execFileSync("git",args,{cwd:root,maxBuffer:1024*1024});
assert.equal(String(git(["rev-parse",source+"^{commit}"])).trim(),source);
const dir=mkdtempSync(join(tmpdir(),"ce-cko-replay-"));
const write=(path,bytes)=>{const to=join(dir,path);mkdirSync(dirname(to),{recursive:true});writeFileSync(to,bytes,{flag:"wx"});};
try {
 for(const [path,sha] of Object.entries(expected)){
  const bytes=git(["show",source+":"+path]);
  const actual=createHash("sha1").update("blob "+bytes.length+"\0").update(bytes).digest("hex");
  assert.equal(actual,sha,"HISTORICAL_BLOB_DRIFT:"+path);
  JSON.parse(bytes.toString("utf8"));
  write(path,bytes);
 }
 const tests=["scripts/cko-canonical-pilot.test.mjs","scripts/cko-db-first-evidence.test.mjs","scripts/cko-db-first-replay.test.mjs","scripts/cko-governance-pilot.test.mjs"];
 for(const path of [...tests,"scripts/cko-canonical-pilot.mjs","contracts/cko-schemas/find.schema.json","contracts/cko-schemas/task.schema.json","contracts/cko-schemas/work_order.schema.json","registers/pmo/queue.v1.json"]){
  write(path,readFileSync(join(root,path)));
 }
 const run=spawnSync(process.execPath,["--test",...tests],{cwd:dir,encoding:"utf8",env:{PATH:process.env.PATH??"",HOME:dir,CKO_DB_WRITE:"false",CKO_CLINICAL_PROMOTION:"false"},maxBuffer:1024*1024});
 // Never echo test logs: assertion messages could contain historical evidence text.
 assert.equal(run.status,0,"CKO_HISTORICAL_REPLAY_TEST_FAILURE");
 const count=(k)=>Number(run.stdout.match(new RegExp("^# "+k+" (\\d+)$","m"))?.[1]);
 assert.equal(count("tests"),31);
 assert.equal(count("pass"),31);
 assert.equal(count("fail"),0);
 assert.equal(count("skipped"),0);
 assert.equal(count("cancelled"),0);
 console.log("CKO_HISTORICAL_REPLAY "+JSON.stringify({source,blobs:18,tests:31,pass:31,fail:0,skipped:0,clinical_release:false,db_write:false,kernel_admission:false}));
} finally {rmSync(dir,{recursive:true,force:true});}
