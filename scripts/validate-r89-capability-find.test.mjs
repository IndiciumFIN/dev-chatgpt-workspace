import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateR89CapabilityFind} from './validate-r89-capability-find.mjs';
const source=JSON.parse(readFileSync('registers/governance/r89-capability-reference-find.candidate.v1.json','utf8'));
const cp=()=>structuredClone(source);
test('R89: unresolved PR21 reference is a candidate HOLD, never release',()=>{
 assert.deepEqual(validateR89CapabilityFind(cp()),{find:'FIND-EXP-CAP-REF-001',missing:1,status:'OPEN_HOLD',releaseGate:'HOLD_HUMAN'});
});
test('R89: cannot invent CAP-RELATED-CONTENT availability or silently alias',()=>{
 const a=cp();a.reproducedObservation.registryContainsId=true;
 assert.throws(()=>validateR89CapabilityFind(a),/R89_CAP_UNVERIFIED_MAPPING/);
 const b=cp();b.reproducedObservation.alternateSemanticsVerified=true;
 assert.throws(()=>validateR89CapabilityFind(b),/R89_CAP_UNVERIFIED_MAPPING/);
});
test('R89: source SHA and expected counts are pinned',()=>{
 const a=cp();a.origin.objectBindingRegistry.gitBlobSha='0'.repeat(40);
 assert.throws(()=>validateR89CapabilityFind(a),/R89_CAP_SOURCE_PROVENANCE_DRIFT/);
});
test('R89: cannot turn owner conversation, unverified checker or selection into Kernel approval',()=>{
 const a=cp();a.disposition.selectedOption='PROVE_EQUIVALENCE_AND_REPLACE_WITH_TRACE';
 assert.throws(()=>validateR89CapabilityFind(a),/R89_CAP_FALSE_AUTHORITY/);
 const b=cp();b.disposition.kernelAdmissionVerified=true;
 assert.throws(()=>validateR89CapabilityFind(b),/R89_CAP_FALSE_AUTHORITY/);
});
test('R89: false status closure and source mutations fail',()=>{
 const a=cp();a.state='DONE';
 assert.throws(()=>validateR89CapabilityFind(a),/R89_CAP_FIND_STATUS_DRIFT/);
 const b=cp();b.sourceMutation=true;
 assert.throws(()=>validateR89CapabilityFind(b),/R89_CAP_FALSE_AUTHORITY/);
});
