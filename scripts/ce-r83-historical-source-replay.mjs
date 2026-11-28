import assert from "node:assert/strict";
import {execFileSync,spawnSync} from "node:child_process";
import {createHash} from "node:crypto";
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {dirname,resolve,join} from "node:path";
import {fileURLToPath} from "node:url";
import {load,verify,verifyDecisionPacket} from "./verify-pmo-fork-lineage.mjs";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const sources=[
  {
    "branch": "main",
    "commit": "eeab3942d7c4331586af7f25073d75a2572ab61c",
    "filename": "main.json",
    "git_blob_sha": "c713557a808857eab9952e511d1f2a10bfa6f828"
  },
  {
    "branch": "fix/governed-activities-cli-20261026",
    "commit": "95a416c1e4ac422e435baf7e95f6ce5c09989c99",
    "filename": "governed.json",
    "git_blob_sha": "80c5d327411287132f23caa0ace817d7d356edb8"
  },
  {
    "branch": "work/editorial-canonical-learning-20261026",
    "commit": "38a33fcec02e5bc996a1f84164bf13799b2f81c7",
    "filename": "editorial.json",
    "git_blob_sha": "84f9e1ad8ffa8baf785eb8370facbf258ada3160"
  },
  {
    "branch": "idioma/consolidado-19",
    "commit": "3dc979a795634eda9b097f2e69660f87ddd779e3",
    "filename": "idioma.json",
    "git_blob_sha": "e7d77e9467ee6f6c6a7483de0d8b2b64f673cef5"
  },
  {
    "branch": "preview/central-comando-20261026",
    "commit": "3f004049945ebaa50e4efee313092974b83a5bf2",
    "filename": "preview.json",
    "git_blob_sha": "e60a017b0ffd55d8d0976abea76fa3f0b15fb8cb"
  }
];
const manifest=JSON.parse(readFileSync(join(root,"registers/governance/ce-r83-historical-source-replay-20261128.v1.json"),"utf8"));
assert.deepEqual(manifest.sources,sources);
assert.equal(manifest.source_path,"registers/pmo/queue.v1.json");
assert.ok(Object.values(manifest.controls).every(v=>v===true));
const git=args=>execFileSync("git",args,{cwd:root,maxBuffer:1024*1024});
const dir=mkdtempSync(join(tmpdir(),"ce-r83-source-"));
try{
 for(const item of sources){
  assert.equal(String(git(["rev-parse",item.commit+"^{commit}"])).trim(),item.commit);
  const bytes=git(["show",item.commit+":registers/pmo/queue.v1.json"]);
  assert.equal(createHash("sha1").update("blob "+bytes.length+"\0").update(bytes).digest("hex"),item.git_blob_sha,"SOURCE_BLOB_DRIFT:"+item.branch);
  JSON.parse(bytes.toString("utf8"));
  writeFileSync(join(dir,item.filename),bytes,{flag:"wx"});
 }
 process.chdir(root);
 const result=verify(load(dir));
 const packet=verifyDecisionPacket(load(dir));
 assert.deepEqual(result,{sourceBranches:5,sourceOccurrences:112,uniqueEvents:28,exclusiveEvents:8,seqCollisions:[20,21],workOrders:12,woVariants:7,authority:"NOT_ELECTED",replay:"NOT_AUTHORIZED",releaseGate:"HOLD_HUMAN"});
 assert.deepEqual(packet,{forkOnlyEvents:8,decisionsAwaitingAuthority:4,kernel:"NOT_VERIFIED",replay:"NOT_AUTHORIZED"});
 const run=spawnSync(process.execPath,["--test","scripts/verify-pmo-fork-lineage.test.mjs"],{cwd:root,encoding:"utf8",env:{PATH:process.env.PATH??"",HOME:dir,PMO_FORK_SOURCE_DIR:dir},maxBuffer:1024*1024});
 assert.equal(run.status,0,"R83_HISTORICAL_TEST_FAILURE");
 const count=k=>Number(run.stdout.match(new RegExp("^# "+k+" (\\d+)$","m"))?.[1]);
 assert.equal(count("tests"),13);
 assert.equal(count("pass"),13);
 assert.equal(count("fail"),0);
 assert.equal(count("skipped"),0);
 assert.equal(count("cancelled"),0);
 console.log("CE_R83_HISTORICAL_REPLAY "+JSON.stringify({sources:5,tests:13,pass:13,fail:0,skipped:0,...result,decisionsAwaitingAuthority:4,queue_write:false,kernel_admission:false,release_authorized:false}));
}finally{rmSync(dir,{recursive:true,force:true});}
