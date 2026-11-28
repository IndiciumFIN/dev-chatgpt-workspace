import test from 'node:test';
import assert from 'node:assert/strict';
import { compareFileSets, decidePR32 } from './ce-pr32-baseline-diagnostic.mjs';

test('a 486 historical-only set explains precisely a 486 count gap',()=>{
 const old=Array.from({length:488},(_,i)=>({path:'src/f'+i,status:'A'}));
 const now=old.slice(486);
 const r=compareFileSets(old,now);
 assert.equal(r.historicalOnlyCount,486);
 assert.equal(r.currentOnlyCount,0);
 assert.equal(r.changedStatusCount,0);
 assert.equal(decidePR32({expected:488,oldCount:488,newCount:2,oldOnly:486,newOnly:0,
 oldMergeBase:'a'.repeat(40),currentMergeBase:'b'.repeat(40),headFresh:true}),
 'BASELINE_DRIFT_EXPLAINS_REST_COUNT_GAP_NOT_MISSING_FILES');
});
test('equivalent base but mismatching count stays HOLD',()=>{
 assert.equal(decidePR32({expected:13770,oldCount:13284,newCount:13284,oldOnly:0,newOnly:0,oldMergeBase:'a',currentMergeBase:'a',headFresh:true}),
 'HOLD_UNEXPLAINED_COMPARISON_MISMATCH');
});
test('source head drift is never dismissed as baseline variance',()=>{
 assert.equal(decidePR32({expected:3,oldCount:3,newCount:2,oldOnly:1,newOnly:0,oldMergeBase:'a',currentMergeBase:'b',headFresh:false}),
 'HOLD_HEAD_DRIFT');
});
test('a path changed in status is independently identified',()=>{
 const r=compareFileSets([{path:'a',status:'A'},{path:'b',status:'M'}],[{path:'a',status:'M'},{path:'b',status:'M'}]);
 assert.equal(r.historicalOnlyCount,0);
 assert.equal(r.currentOnlyCount,0);
 assert.deepEqual(r.changedStatus,[{path:'a',historic:'A',current:'M'}]);
});
test('duplicate path or nonconserved synthetic state fails',()=>{
 assert.throws(()=>compareFileSets([{path:'a',status:'A'},{path:'a',status:'A'}],[]),/DUPLICATE/);
});
