import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateDispositions,verify} from "./ce-w26-grook-p1-test-disposition-verify.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const m=read("registers/governance/ce-w26-grook-full-delta-20261121.v1.json");
const d=read("registers/governance/ce-w26-grook-p1-test-disposition-20261121.v1.json");
const copy=x=>structuredClone(x);
test("three historical test decisions, all 48 objects retained and zero sealed",()=>{
 assert.deepEqual(verify(),{protocol:"CE.W2.6.G2.P1_TEST.DISPOSITION.v1",dispositions:3,unresolved:45,sealed:0,phase:"DEV_ONLY"});
 assert.deepEqual(d.dispositions.map(x=>x.path).sort(),m.divergences.filter(x=>x.risk_preliminary==="P1_TEST").map(x=>x.path).sort());
});
test("fabricated SHA, duplicated or missing rows rejected",()=>{
 const a=copy(d);a.dispositions[0].canonical_git_blob_sha="f".repeat(40);
 assert.throws(()=>validateDispositions(a,m),/blob provenance/);
 const b=copy(d);b.remaining_paths[0].path=b.dispositions[0].path;
 assert.throws(()=>validateDispositions(b,m),/missing or duplicated/);
 const c=copy(d);c.remaining_paths.pop();
 assert.throws(()=>validateDispositions(c,m),/full coverage/);
});
test("spurious domain approval, sealing, clinical clearance rejected",()=>{
 const a=copy(d);a.closing.branch_dev_reconciled=true;assert.throws(()=>validateDispositions(a,m),/false branch close/);
 const b=copy(d);b.evidence.release_assertions.rights_clearance=true;assert.throws(()=>validateDispositions(b,m),/fake clearance/);
 const c=copy(d);c.counts.branches_sealed=1;assert.throws(()=>validateDispositions(c,m),/false sealing/);
});
test("test contracts are checked by real Git blob bytes and assertions",()=>{
 const a=copy(d);a.dispositions[0].canonical_assertion="assert(false)";
 assert.throws(()=>validateDispositions(a,m),/canonical assertion missing/);
 const b=copy(d);b.dispositions[2].historical_assertion=b.dispositions[2].canonical_assertion;
 assert.throws(()=>validateDispositions(b,m),/obsolete assertion still in main/);
});
