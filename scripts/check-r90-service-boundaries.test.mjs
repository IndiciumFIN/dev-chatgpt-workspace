import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateR90,EXACT_ID_COLLISIONS} from './check-r90-service-boundaries.mjs';
const raw=readFileSync('docs/evidence/experience-platform-skeleton-2026-10-31/catalog/service-catalog.v1.json');
const source=JSON.parse(raw.toString('utf8'));
const ledger=JSON.parse(readFileSync('registers/governance/r90-service-boundary-candidates.v1.json','utf8'));
const cp=()=>({catalog:structuredClone(source),record:structuredClone(ledger)});
const run=({catalog,record})=>validateR90(catalog,record,{sourceBytes:raw});
test('R90: 410 source-derived service identities and six unresolved boundary groups',()=>{
 const result=run(cp());
 assert.deepEqual(result,{families:45,services:410,qualifiedKeys:410,ambiguousRawIds:4,semanticBoundaryGroups:6,releaseGate:'HOLD_HUMAN'});
 assert.deepEqual(Object.keys(EXACT_ID_COLLISIONS),['connector-registry','read-later','subscription','print']);
});
test('R90: source Git blob and sha256 pins cannot be forged',()=>{
 const x=cp();x.record.source.gitBlobSha='0'.repeat(40);
 assert.throws(()=>run(x),/R90_SOURCE_PIN_DRIFT/);
 const y=cp();assert.throws(()=>validateR90(y.catalog,y.record,{sourceBytes:Buffer.from('{}')}),/R90_SOURCE_BYTES_DRIFT/);
});
test('R90: cannot add a 411th service or remove source family without drift',()=>{
 const x=cp();x.catalog.families[0].services.push({...x.catalog.families[0].services[0],id:'service-411'});
 assert.throws(()=>run(x),/R90_POPULATION_DRIFT/);
 const y=cp();y.catalog.families.pop();
 assert.throws(()=>run(y),/R90_CATALOG_UNTRUSTED/);
});
test('R90: duplicate fully-qualified IDs fail closed',()=>{
 const x=cp();x.catalog.families[0].services[1].id=x.catalog.families[0].services[0].id;
 assert.throws(()=>run(x),/R90_POPULATION_DRIFT/);
});
test('R90: tampering single service title or qualified key invalidates crosswalk',()=>{
 const x=cp();x.record.serviceEntries[0].title='Approved title without proof';
 assert.throws(()=>run(x),/R90_SERVICE_CROSSWALK_DRIFT/);
 const y=cp();y.record.serviceEntries[1].key='changed-name';
 assert.throws(()=>run(y),/R90_SERVICE_CROSSWALK_DRIFT/);
});
test('R90: cannot hide connector collision or silently resolve it',()=>{
 const x=cp();x.record.exactIdCollisions.pop();
 assert.throws(()=>run(x),/R90_COLLISION_REGISTER_DRIFT/);
 const y=cp();y.record.exactIdCollisions[0].mergeApplied=true;
 assert.throws(()=>run(y),/R90_COLLISION_SCOPE_DRIFT/);
});
test('R90: semantic overlaps are review candidates, not equivalence',()=>{
 const x=cp();x.record.adjacentBoundaryGroups[0].relation='SAME_SERVICE';
 assert.throws(()=>run(x),/R90_FALSE_SEMANTIC_EQUIVALENCE/);
 const y=cp();y.record.adjacentBoundaryGroups[2].keys.pop();
 assert.throws(()=>run(y),/R90_FALSE_SEMANTIC_EQUIVALENCE/);
});
test('R90: ownership principles cannot become a parallel Kernel approval body',()=>{
 const x=cp();x.record.ownershipPrinciples[0].role='SELF_AUTHORIZED_KERNEL';
 assert.throws(()=>run(x),/R90_AUTHORITY_LAYER_DRIFT/);
 const y=cp();y.record.authority.kernelAdmission='ADMITTED';
 assert.throws(()=>run(y),/R90_FALSE_RELEASE_AUTHORITY/);
});
test('R90: neither owner nor reviewer can be asserted by unsigned ledger',()=>{
 const x=cp();x.record.authority.ownerIdentityVerified=true;
 assert.throws(()=>run(x),/R90_FALSE_RELEASE_AUTHORITY/);
 const y=cp();y.record.authority.reviewerIndependent=true;
 assert.throws(()=>run(y),/R90_FALSE_RELEASE_AUTHORITY/);
});
test('R90: unauthorized clinical release, main promotion, FIND closure all fail',()=>{
 const x=cp();x.record.authority.releaseGate='PASS';
 assert.throws(()=>run(x),/R90_FALSE_RELEASE_AUTHORITY/);
 const y=cp();y.record.authority.mainTouched=true;
 assert.throws(()=>run(y),/R90_FALSE_RELEASE_AUTHORITY/);
 const z=cp();z.record.relatedOpenFind='CLOSED';
 assert.throws(()=>run(z),/R90_FALSE_RELEASE_AUTHORITY/);
});
test('R90: generated logical services remain CANDIDATE_HOLD, no fake PASS',()=>{
 const x=cp();x.catalog.families[0].services[0].status='APPROVED';
 assert.throws(()=>run(x),/R90_SERVICE_PROMOTION/);
 const y=cp();y.catalog.families[0].status='ADMITTED';
 assert.throws(()=>run(y),/R90_FAMILY_DRIFT/);
});
