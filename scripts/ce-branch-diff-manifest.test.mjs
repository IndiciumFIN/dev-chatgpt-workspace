import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, chmodSync, statSync} from "node:fs";
import {tmpdir} from "node:os";
import {join, resolve} from "node:path";
import {execFileSync, spawnSync} from "node:child_process";
import {gunzipSync} from "node:zlib";
import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";
const script=fileURLToPath(new URL("./ce-branch-diff-manifest.py",import.meta.url));
function command(cwd,exe,args){
  return execFileSync(exe,args,{cwd,encoding:"utf8",timeout:30000,stdio:["ignore","pipe","pipe"]}).trim();
}
function git(repo,...args){return command(repo,"git",args);}
function mkfixture(){
 const root=mkdtempSync(join(tmpdir(),"ce-branch-test-"));
 git(root,"init","-q","-b","main");git(root,"config","user.email","ce-fixture@example.invalid");git(root,"config","user.name","CE Fixture");
 writeFileSync(join(root,"shared.txt"),"same\n");writeFileSync(join(root,"change.txt"),"old\n");
 writeFileSync(join(root,"old-only.txt"),"source\n");writeFileSync(join(root,"mode.sh"),"#!/bin/sh\nexit 0\n");
 writeFileSync(join(root,"com espaço.txt"),"unicode path\n");
 git(root,"add",".");git(root,"commit","-qm","initial");
 git(root,"branch","legacy");
 git(root,"switch","-q","legacy");
 writeFileSync(join(root,"change.txt"),"new\n");
 writeFileSync(join(root,"branch-only.txt"),"branch\n");
 chmodSync(join(root,"mode.sh"),0o755);
 git(root,"add",".");git(root,"commit","-qm","legacy changes");
 const source=git(root,"rev-parse","HEAD");
 git(root,"switch","-q","main");
 rmSync(join(root,"old-only.txt"));
 writeFileSync(join(root,"main-only.txt"),"main\n");
 git(root,"add",".");git(root,"commit","-qm","main diverged");
 return {root,source,main:git(root,"rev-parse","HEAD"),tree:git(root,"rev-parse","HEAD^{tree}")};
}
function run(f,params=[]){
 const out=mkdtempSync(join(tmpdir(),"ce-branch-result-"));
 const proc=spawnSync("python3",[script,"--repo",f.root,"--main","refs/heads/main","--branch","refs/heads/legacy","--out",out,...params],
  {encoding:"utf8",timeout:90000,maxBuffer:2*1024*1024});
 const files=command(out,"find",[".","-maxdepth","1","-type","f","-printf","%f\n"]).split("\n");
 const gz=files.find(x=>x.endsWith(".manifest.json.gz"));
 const data=gz?JSON.parse(gunzipSync(readFileSync(join(out,gz)))):null;
 return {out,proc,data,files};
}
test("Git tree manifest compares every path, blob SHA, mode and diff stats, never SEALED",()=>{
 const f=mkfixture();
 try{
  const s=run(f,["--private-diff"]);
  try{
   assert.equal(s.proc.status,0,s.proc.stderr);
   const m=s.data;assert.equal(m.protocol,"CE.BRANCH.PATH.MANIFEST.v1");
   assert.equal(m.source.sha,f.source);assert.equal(m.main.sha,f.main);assert.equal(m.main.tree_sha,f.tree);
   assert.equal(m.scope.union_paths,7);assert.equal(m.scope.identical,2);assert.equal(m.scope.divergent,5);
   const rows=new Map(m.paths.map(x=>[x.path,x]));
   assert.equal(rows.get("shared.txt").decision.status,"EXACT_IN_MAIN_PROVEN");
   assert.equal(rows.get("com espaço.txt").source.blob_sha,rows.get("com espaço.txt").main.blob_sha);
   assert.equal(rows.get("old-only.txt").diff_class,"SOURCE_ONLY");
   assert.equal(rows.get("branch-only.txt").diff_class,"SOURCE_ONLY");
   assert.equal(rows.get("main-only.txt").diff_class,"MAIN_ONLY");
   assert.equal(rows.get("change.txt").diff_class,"BLOB_DIFFERENT");
   assert.equal(rows.get("mode.sh").diff_class,"MODE_DIFFERENT");
   assert.equal(rows.get("mode.sh").source.mode,"100755");
   assert.equal(rows.get("mode.sh").main.mode,"100644");
   assert.equal(rows.get("mode.sh").source.blob_sha,rows.get("mode.sh").main.blob_sha);
   assert.ok(m.paths.every(x=>x.path&&x.decision.justification&&x.decision.tests_evidence.length>0));
   assert.ok(m.paths.filter(x=>x.diff_class!=="EXACT_BLOB_MODE_TYPE").every(x=>x.decision.status==="HOLD_SEMANTIC_REVIEW"));
   assert.equal(m.controls.seal_branch,false);assert.equal(m.controls.auto_merge,false);
   const index=JSON.parse(readFileSync(join(s.out,"index.json"),"utf8"));
   assert.equal(index.requested,1);assert.equal(index.generated,1);assert.equal(index.seal_branch,false);
   assert.ok(s.files.some(x=>x.endsWith(".PRIVATE.patch")));
   const patch=s.files.find(x=>x.endsWith(".PRIVATE.patch"));
   assert.equal(statSync(join(s.out,patch)).mode & 0o077,0,"private patch permissions");
   assert.match(readFileSync(join(s.out,patch),"utf8"),/diff --git a\/change\.txt b\/change\.txt/);
   assert.equal(git(f.root,"rev-parse","HEAD"),f.main,"no checkout or ref mutation");
  }finally{rmSync(s.out,{recursive:true,force:true})}
 }finally{rmSync(f.root,{recursive:true,force:true})}
});
test("read-only reviewer proposals remain HOLD despite matching Git blob/mode and CI link",()=>{
 const f=mkfixture();const reviews=mkdtempSync(join(tmpdir(),"ce-branch-decisions-"));
 try{
  const baseline=run(f);const row=baseline.data.paths.find(x=>x.path==="change.txt");
  const branchName="refs/heads/legacy",slug=branchName.replace(/[^a-zA-Z0-9_.-]/g,"-").replace(/^[.-]+|[.-]+$/g,"").slice(0,65)+"-"+createHash("sha256").update(branchName).digest("hex").slice(0,12);
  const review={branch:branchName,source_sha:f.source,main_sha:f.main,decisions:[{
   path:"change.txt",source_blob_sha:row.source.blob_sha,main_blob_sha:row.main.blob_sha,
   source_mode:row.source.mode,main_mode:row.main.mode,
   decision:"SUPERSEDED_WITH_PROOF",justification:"Demonstration only: source and main blobs pinned, but external CI cannot be verified by this local tool.",
   tests_evidence:[{type:"CI_RUN",ref:"https://github.com/example/example/actions/runs/123"}]
  }]};
  writeFileSync(join(reviews,slug+".decisions.json"),JSON.stringify(review));
  const approved=run(f,["--decisions-dir",reviews]);
  const found=approved.data.paths.find(x=>x.path==="change.txt");
  assert.equal(found.review_proposal.decision,"SUPERSEDED_WITH_PROOF");
  assert.equal(found.decision.status,"HOLD_EXTERNAL_EVIDENCE_VERIFICATION");
  assert.equal(approved.data.controls.seal_branch,false);
  review.decisions[0].source_blob_sha="f".repeat(40);
  writeFileSync(join(reviews,slug+".decisions.json"),JSON.stringify(review));
  const stale=run(f,["--decisions-dir",reviews]);
  assert.equal(stale.data.paths.find(x=>x.path==="change.txt").decision.status,"HOLD_STALE_REVIEW");
  for(const s of [baseline,approved,stale])rmSync(s.out,{recursive:true,force:true});
 }finally{rmSync(reviews,{recursive:true,force:true});rmSync(f.root,{recursive:true,force:true})}
});
test("strict cohort head drift fails closed and no in-repo output is accepted",()=>{
 const f=mkfixture();
 try{
  const cohort=join(f.root,"scope.json");
  writeFileSync(cohort,JSON.stringify({protocol:"CE.BRANCH.COHORT.v1",main_sha:"f".repeat(40),
   branches:[{name:"refs/heads/legacy",sha:f.source}]}));
  const fail=run(f,["--cohort",cohort,"--strict-heads"]);
  assert.equal(fail.proc.status,2);assert.match(fail.proc.stderr,/main SHA drift/);
  const inrepo=spawnSync("python3",[script,"--repo",f.root,"--main","refs/heads/main",
   "--branch","refs/heads/legacy","--out",join(f.root,"out")],{encoding:"utf8",timeout:30000});
  assert.equal(inrepo.status,2);assert.match(inrepo.stderr,/outside the Git checkout/);
  assert.equal(git(f.root,"rev-parse","HEAD"),f.main);
  rmSync(fail.out,{recursive:true,force:true});
 }finally{rmSync(f.root,{recursive:true,force:true})}
});
test("source code does not call mutating Git checkout, merge, reset, push, fetch or apply",()=>{
 const s=readFileSync(script,"utf8");
 for(const command of ['"checkout"','"merge"','"reset"','"push"','"fetch"','"apply"','"cherry-pick"']) {
  assert.equal(s.includes(command),false,"mutating Git command included: "+command);
 }
 assert.match(s,/--private-diff/);assert.match(s,/--strict-heads/);
 assert.match(s,/--no-renames/);assert.match(s,/ls-tree/);
});
