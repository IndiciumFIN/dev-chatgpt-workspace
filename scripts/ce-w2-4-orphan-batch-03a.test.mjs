import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const read=p=>readFileSync(new URL("../"+p,import.meta.url));
const sha=b=>createHash("sha1").update(`blob ${b.length}\0`).update(b).digest("hex");
test("W2.4 batch 3a: complete immutable file-union and OPEN state",()=>{
 const raw=read("registers/governance/ce-w2-4-orphan-full-file-batch-03a-20261120.v1.json");assert.equal(sha(raw),"1f6a33b781e2fc618c10af58e44100e6357b6ff1");
 const v=JSON.parse(raw),w=JSON.parse(read("registers/governance/ce-cross-orphan-root-trees-20261120.v1.json"));
 assert.equal(v.protocol,"CE.CROSS.W2.4");assert.equal(v.batch,3);
 assert.equal(v.source_orphan_manifest_git_sha,sha(read("registers/governance/ce-cross-orphan-root-trees-20261120.v1.json")));
 assert.equal(v.source_baseline_sha,w.baseline_main_sha);assert.equal(v.main_baseline_sha,"80d5e19778b90d69c621eea381a152fbcd7e9912");assert.equal(v.main_tree_sha,"da0a511a58a7a8204a2848f31a2c5fd6ace99154");
 assert.equal(v.sources.length,1);assert.equal(v.semantic_review_complete,false);assert.equal(v.closure_status,"OPEN");assert.equal(v.no_revisit,false);assert.equal(v.merge_authorized,false);
 const hex=/^[0-9a-f]{40}$/;
 for(const x of v.sources){
  assert.ok(hex.test(x.source_sha)&&hex.test(x.source_tree_sha));
  assert.deepEqual(x.branches,w.rows.filter(r=>r.source_sha===x.source_sha&&r.tree_sha===x.source_tree_sha).map(r=>r.branch));
  assert.equal(x.recursive_truncated,false);assert.equal(x.union_non_tree,x.rows.length);
  const cnt={E:0,D:0,S:0,C:0,T:0},roots={};let prev="";
  for(const r of x.rows){
   const [p,c,a,b]=r;assert.ok(p>prev);prev=p;assert.ok(Object.hasOwn(cnt,c));cnt[c]++;
   (roots[p.split("/")[0]]??={E:0,D:0,S:0,C:0,T:0})[c]++;
   if(c==="E"){assert.equal(r.length,4);assert.equal(a,b);assert.ok(hex.test(a));}
   if(c==="D"){assert.equal(r.length,4);assert.notEqual(a,b);assert.ok(hex.test(a)&&hex.test(b));}
   if(c==="S"){assert.equal(r.length,4);assert.ok(hex.test(a));assert.equal(b,"");}
   if(c==="C"){assert.equal(r.length,4);assert.equal(a,"");assert.ok(hex.test(b));}
   if(c==="T"){assert.equal(r.length,8);assert.ok(hex.test(a)&&hex.test(b));assert.ok(r[4]!==r[5]||r[6]!==r[7]);}
  }
  assert.deepEqual(x.counts,cnt);assert.deepEqual(x.roots,roots);
  assert.equal(x.source_non_tree,cnt.E+cnt.D+cnt.S+cnt.T);
  assert.equal(x.main_non_tree,cnt.E+cnt.D+cnt.C+cnt.T);
 }
});
