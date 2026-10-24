import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
// Integridade do inventário, NÃO conformidade nem validador de cláusulas normativas.
const r = JSON.parse(readFileSync('registers/governance/transversal-standards-candidates.v1.json','utf8'));
assert.equal(r.registryId,'CKO-TRANS-REFERENCES-001');
assert.equal(r.status,'CANDIDATE_HOLD');
assert.equal(r.kernelAdmission,'NOT_REQUESTED');
assert.equal(r.summary.total,r.standards.length);
assert.equal(r.summary.additionalReferencesIdentified,r.coverageExpansion.items.length);
assert.equal(r.summary.fullNormativeTextVerified,0);
assert.equal(r.summary.runtimeGatesDerivedFromNewLawRefs,0);
const keys=r.coverageExpansion.items.map(x=>x.officialIdentifier);
assert.equal(new Set(keys).size,keys.length,'Identificadores oficiais duplicados');
for(const x of r.coverageExpansion.items){
  assert(x.officialIdentifier?.trim().length>3);
  assert(x.documentName?.trim().length>8);
  assert(x.publisher?.trim().length>3);
  assert(x.officialSourceUrl?.startsWith('https://'),'URL de fonte inadequada');
  assert(x.howItMayApply?.trim().length>10);
  assert(x.verificationNote?.trim().length>10);
}
assert(r.coverageExpansion.notClaimed.some(x=>x.includes('conformidade')));
console.log('PASS inventário transversal candidato: '+r.standards.length+' anteriores + '+keys.length+' referências complementares; sem alegação de implementação ou Kernel.');
