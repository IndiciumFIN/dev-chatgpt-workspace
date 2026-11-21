import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateCensus,compareTwoPasses,deriveDiff} from "./ce-live-census.mjs";
const pin=JSON.parse(readFileSync(new URL("../registers/governance/ce-github-live-census-20261121.v1.json",import.meta.url),"utf8"));
const dup=x=>structuredClone(x);
test("pinned GitHub snapshot has complete stable counts and no SEALED",()=>{
 assert.deepEqual(validateCensus(pin),{valid:true,branches:69,open_prs:38});
 assert.equal(pin.counts.ce_cko_ncos,54);assert.equal(pin.counts.wutrib_isolated,14);
 assert.equal(pin.main.sha,"2c2872c46cdb860086d6b5f8feb5a70efc4c2c9e");
 assert.equal(pin.recent_merged_prs.find(x=>x.number===105).merged,true);
});
test("missing pagination or duplicated refs fails closed",()=>{
 const a=dup(pin);a.complete_pages.branches=false;assert.throws(()=>validateCensus(a),/pagination/);
 const b=dup(pin);b.branches.push(dup(b.branches[0]));b.counts.branches++;assert.throws(()=>validateCensus(b),/duplicates/);
});
test("stale PR SHA, invalid main SHA, false SEALED fail closed",()=>{
 const a=dup(pin);a.open_pull_requests[0].head_sha="0".repeat(40);assert.throws(()=>validateCensus(a),/stale PR HEAD/);
 const b=dup(pin);b.main.sha="invalid";assert.throws(()=>validateCensus(b),/main SHA/);
 const c=dup(pin);c.technical_gates.branches_sealed=54;assert.throws(()=>validateCensus(c),/false SEALED/);
});
test("two GitHub read passes reject concurrent moving heads",()=>{
 const b=dup(pin);b.branches.find(x=>x.name==="grook_10_26").sha="f".repeat(40);
 assert.throws(()=>compareTwoPasses(pin,b),/concurrent remote/);
});
test("a moved branch means drift, never branch closure",()=>{
 const b=dup(pin);b.branches.find(x=>x.name==="grook_10_26").sha="f".repeat(40);
 const d=deriveDiff(pin,b);assert.equal(d.state,"DRIFT_OBSERVED_REVIEW_REQUIRED");
 assert.equal(d.drift_events,1);assert.equal(d.moved_branches.length,1);
 assert.equal(deriveDiff(pin,dup(pin)).state,"NO_DRIFT_AT_CAPTURE");
});
