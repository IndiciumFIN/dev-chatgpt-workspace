import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
// Integridade do inventário, NÃO conformidade nem validador de cláusulas normativas.
const r = JSON.parse(readFileSync('registers/governance/transversal-standards-candidates.v1.json','utf8'));
assert.equal(r.registryId,'CKO-TRANS-REFERENCES-001');
assert.equal(r.status,'CANDIDATE_HOLD');
assert.equal(r.kernelAdmission,'NOT_REQUESTED');
assert.equal(r.summary.total,r.standards.length);
assert.equal(r.summary.additionalReferencesIdentified,r.coverageExpansion.items.length);
assert.equal(r.coverageExpansion.items.length,28);
assert.equal(r.coverageExpansion.excludedByApplicability.length,1);
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

const ifrs = r.coverageExpansion.excludedByApplicability.find(x=>x.officialIdentifier==='IFRS S1 e IFRS S2');
assert(!r.coverageExpansion.items.some(x=>x.officialIdentifier==='IFRS S1 e IFRS S2'),'IFRS indevidamente no inventário ativo');
assert(ifrs,'IFRS precisa permanecer rastreável no histórico');
assert.equal(ifrs.applicabilityDecision,'NOT_APPLICABLE_JUSTIFIED','IFRS não pode retornar à fila de aquisição de enfermagem');
assert.equal(ifrs.acquisitionRequired,false);
assert.equal(ifrs.applicabilityContractRef,'contracts/cko-schemas/applicability.schema.json');
assert(ifrs.applicabilityRationale?.includes('não requisitos técnicos ou clínicos'));
assert.equal(r.acquisitionReadback20261024.scopeReconciliation.currentProjectApplicableCandidates,46);
assert.equal(r.acquisitionReadback20261024.scopeReconciliation.currentApplicableMetadataOnlyCandidates,21);
const iso=[...r.standards.filter(x=>x.authority==='ISO'||x.authority==='ISO/IEC').map(x=>x.id),
 ...r.coverageExpansion.items.filter(x=>/^(ISO |ISO\/IEC )/.test(x.officialIdentifier)).map(x=>x.officialIdentifier)];
assert.equal(iso.length,18,'Número de referências ISO alterado sem reconciliação');
assert.deepEqual(r.sourceContractReview.identifiers,iso,'Cobertura de contratos ISO divergente');
for(const field of ['sourceSchemaRef','applicabilitySchemaRef','authorityBindingSchemaRef','auditEvidenceSchemaRef']){
 const path=r.sourceContractReview[field];
 assert(path?.startsWith('contracts/cko-schemas/'),'Não criar contrato paralelo');
 assert(readFileSync(path,'utf8').includes('"$schema"'),'Schema canônico inacessível');
}
assert.equal(r.sourceContractReview.canonicalSourceInstancesVerified,0,'Instâncias não comprovadas não podem ser afirmadas');
assert.equal(r.sourceContractReview.canonicalRequirementBindingsVerified,0);
assert.equal(r.sourceContractReview.normativeClauseTestsVerified,0);
assert.equal(r.sourceContractReview.admission,'NOT_ADMITTED');
assert(['RUN_PENDING','CANDIDATES_MATERIALIZED'].includes(r.sourceContractReview.materializationStatus));

console.log('PASS inventário transversal candidato: '+r.standards.length+' anteriores + '+keys.length+' referências complementares; sem alegação de implementação ou Kernel.');
