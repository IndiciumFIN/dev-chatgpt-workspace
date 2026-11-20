import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const read=p=>readFileSync(new URL("../"+p,import.meta.url));
const sha=b=>createHash("sha1").update(`blob ${b.length}\0`).update(b).digest("hex");
test("W2.4 batch 1: exact file union and fail-closed disposition",()=>{
 const raw=read("registers/governance/ce-w2-4-orphan-full-file-batch-01-20261120.v1.json");
 assert.equal(sha(raw),"e824a85baf3acb4150bdec791da03016fe96b063");
 const v=JSON.parse(raw);
 assert.equal(v.protocol,"CE.CROSS.W2.4");
 assert.equal(v.batch,1);
 assert.equal(v.source_orphan_manifest_git_sha,sha(read("registers/governance/ce-cross-orphan-root-trees-20261120.v1.json")));
 const baseline=JSON.parse(read("registers/governance/ce-cross-orphan-root-trees-20261120.v1.json"));
 assert.equal(v.source_baseline_sha,baseline.baseline_main_sha);
 assert.equal(v.main_baseline_sha,"80d5e19778b90d69c621eea381a152fbcd7e9912");
 assert.equal(v.main_tree_sha,"da0a511a58a7a8204a2848f31a2c5fd6ace99154");
 assert.equal(v.sources.length,5);
 assert.equal(v.semantic_review_complete,false);
 assert.equal(v.closure_status,"OPEN");
 assert.equal(v.no_revisit,false);
 assert.equal(v.merge_authorized,false);
 const sha40=/^[0-9a-f]{40}$/;
 for(const m of v.sources){
   assert.ok(sha40.test(m.source_sha)&&sha40.test(m.source_tree_sha));
   assert.deepEqual(m.branches,baseline.rows.filter(q=>q.source_sha===m.source_sha&&q.tree_sha===m.source_tree_sha).map(q=>q.branch));
   assert.equal(m.recursive_truncated,false);
   assert.equal(m.union_non_tree,m.rows.length);
   const cnt={E:0,D:0,S:0,C:0,T:0},roots={};
   let last="";
   for(const r of m.rows){
    const [p,c,a,b]=r;
    assert.ok(p>last);last=p;
    assert.ok(Object.hasOwn(cnt,c));cnt[c]++;
    const root=p.split("/")[0];(roots[root]??={E:0,D:0,S:0,C:0,T:0})[c]++;
    if(c==="E"){assert.equal(r.length,4);assert.equal(a,b);assert.ok(sha40.test(a));}
    else if(c==="D"){assert.equal(r.length,4);assert.notEqual(a,b);assert.ok(sha40.test(a)&&sha40.test(b));}
    else if(c==="S"){assert.equal(r.length,4);assert.ok(sha40.test(a));assert.equal(b,"");}
    else if(c==="C"){assert.equal(r.length,4);assert.equal(a,"");assert.ok(sha40.test(b));}
    else {assert.equal(r.length,8);assert.ok(sha40.test(a)&&sha40.test(b));assert.ok(r[4]!==r[5]||r[6]!==r[7]);}
   }
   assert.deepEqual(m.counts,cnt);
   assert.deepEqual(m.roots,roots);
   assert.equal(m.source_non_tree,cnt.E+cnt.D+cnt.S+cnt.T);
   assert.equal(m.main_non_tree,cnt.E+cnt.D+cnt.C+cnt.T);
 }
});
