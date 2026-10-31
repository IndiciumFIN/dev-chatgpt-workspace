import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeCanonicalJson,normalizedJsonEvidence,analyzeSemanticI18nCollisions} from './lib/semantic-collision-audit.mjs';

const PATH='registers/i18n/incoming/de/contracts/interface__enter.json';
const a={schema_version:'0.1.0',canonical_id:'cko:i18n:de:interface.enter',locale:'de',
 value:'Anmelden',status:'DRAFT',translation_status:'DRAFT',version:'1.0.0',
 provenance_refs:['x.json','y.json']};
const b={...a,provenance_refs:['y.json','x.json']};
const hashA='a'.repeat(40),hashB='b'.repeat(40);
const collision=[{path:PATH,sources:[{branch:'idioma/de-v1',blob:hashA},{branch:'idioma/consolidado-19',blob:hashB}]}];
const read=(sha)=>JSON.stringify(sha===hashA?a:b);

test('same exact German translation with reordered citations is semantically equivalent but not authorized',()=>{
 const r=analyzeSemanticI18nCollisions(collision,read);
 assert.equal(r.counts.semanticEquivalents,1);
 assert.equal(r.counts.substantiveOrNonAllowlisted,0);
 assert.equal(r.equivalent[0].approvalState,'DRAFT_OR_UNVERIFIED');
 assert.equal(r.equivalent[0].outcome,'SEMANTIC_EQUIVALENCE_ONLY_NO_CANONICAL_WINNER');
 assert.equal(r.releaseGate,'HOLD_HUMAN');
});
test('different translated value remains a substantive conflict',()=>{
 const r=analyzeSemanticI18nCollisions(collision,sha=>JSON.stringify(sha===hashA?a:{...b,value:'Einloggen'}));
 assert.equal(r.counts.semanticEquivalents,0);
 assert.equal(r.substantive[0].reason,'SEMANTIC_DIFFERENCE');
});
test('different numerical or clinical array order must not be normalized away',()=>{
 const x={...a,items:[1,2,3]};
 const y={...b,items:[3,2,1]};
 const r=analyzeSemanticI18nCollisions(collision,sha=>JSON.stringify(sha===hashA?x:y));
 assert.equal(r.counts.semanticEquivalents,0);
});
test('untrusted or non-German path is never presumed equivalent',()=>{
 const r=analyzeSemanticI18nCollisions([{path:'src/core/governance/kernel.ts',sources:collision[0].sources}],read);
 assert.equal(r.counts.substantiveOrNonAllowlisted,1);
 assert.equal(r.substantive[0].reason,'NOT_ALLOWLISTED');
 assert.throws(()=>normalizedJsonEvidence('src/core/governance/kernel.ts',JSON.stringify(a)),/PATH_NOT_ALLOWLISTED/);
});
test('provenance references must be unique nonempty order-insensitive strings',()=>{
 assert.throws(()=>normalizeCanonicalJson({provenance_refs:['x','x']}),/AMBIGUOUS_PROVENANCE_REFS/);
 assert.throws(()=>normalizeCanonicalJson({provenance_refs:[1,'x']}),/AMBIGUOUS_PROVENANCE_REFS/);
});
test('missing blob or malformed source fails closed',()=>{
 const missing=analyzeSemanticI18nCollisions([{path:PATH,sources:[{blob:null},{blob:hashA}]}],read);
 assert.equal(missing.counts.unverifiable,1);
 const malformed=analyzeSemanticI18nCollisions(collision,()=>'{invalid');
 assert.equal(malformed.counts.unverifiable,1);
});
test('all expected JSON fields including status must match; nonapproved content remains draft',()=>{
 const r=analyzeSemanticI18nCollisions(collision,sha=>JSON.stringify(sha===hashA?a:{...b,status:'APPROVED'}));
 assert.equal(r.counts.semanticEquivalents,0);
});
test('input JSON must contain German canonical identity and bounded size',()=>{
 assert.throws(()=>normalizedJsonEvidence(PATH,JSON.stringify({...a,locale:'fr'})),/UNEXPECTED_RECORD_ID/);
 assert.throws(()=>normalizedJsonEvidence(PATH,' '.repeat(1024*1024+1)),/UNSAFE_JSON_SIZE/);
});
