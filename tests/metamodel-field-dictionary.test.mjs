import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const meta=load('contracts/physical-metamodel.audit.v1.json');
const dict=load('contracts/physical-field-dictionary.audit.v1.json');
const entityNames=new Set(meta.entities.map(x=>x.name));
test('physical metamodel explicitly does not masquerade as certified ontology',()=>{
 assert.equal(meta.layer,'PHYSICAL_FOREIGN_KEY_AUDIT_SNAPSHOT');
 assert.equal(meta.normativeSemantics,'NOT_VERIFIED');
 assert.equal(meta.ontology,'NOT_HOMOLOGATED');
 assert.equal(meta.strictGates.productionUse,'HOLD_HUMAN');
 assert.equal(meta.strictGates.fiscalConformity,'NOT_EVALUATED');
});
test('referential metamodel edges join existing entity definitions',()=>{
 assert.equal(meta.relationships.length,25);
 assert.equal(new Set(meta.relationships.map(x=>x.constraint)).size,25);
 for(const e of meta.relationships){
  assert.ok(entityNames.has(e.from),e.from);
  assert.ok(entityNames.has(e.to),e.to);
  assert.equal(e.confidence,'CONFIRMED_FROM_PG_CONSTRAINT');
  assert.equal(e.meaning,'REFERENTIAL_INTEGRITY_ONLY');
 }
});
test('structured audited field dictionary covers select 22 physical fields only',()=>{
 assert.equal(dict.fields.length,22);
 assert.equal(new Set(dict.fields.map(x=>x.canonicalPath)).size,22);
 for(const x of dict.fields){
  assert.equal(x.canonicalPath,'wutrib.'+x.table+'.'+x.column);
  assert.equal(x.source,'INFORMATION_SCHEMA');
  assert.equal(x.status,'PHYSICAL_TYPE_VERIFIED_SEMANTICS_HOLD');
  assert.equal(x.fiscalMeaning,'NOT_HOMOLOGATED');
  assert.equal(x.totvsSourceColumn,null);
  assert.equal(x.businessOwner,'UNASSIGNED');
 }
});
test('monetary precision is physical Postgres type, not invented fiscal rounding',()=>{
 const byPath=new Map(dict.fields.map(x=>[x.canonicalPath,x]));
 for(const c of ['tax_amount','tax_base']){
  const field=byPath.get('wutrib.fiscal_tax_lines.'+c);
  assert.equal(field.postgresType,'numeric');
  assert.equal(field.numericPrecision,20);
  assert.equal(field.numericScale,6);
 }
 const rate=byPath.get('wutrib.fiscal_tax_lines.tax_rate');
 assert.equal(rate.numericPrecision,16);
 assert.equal(rate.numericScale,8);
});
test('the candidate data model does not claim effective dates or legislative links',()=>{
 assert.equal(dict.sourceSnapshotHash,'NOT_CAPTURED');
 assert.equal(dict.taxSemanticsVerified,false);
 assert.equal(dict.totvsFieldMappings,'NOT_AVAILABLE');
 assert.ok(dict.fields.every(x=>x.effectiveFrom===null&&x.effectiveTo===null&&x.normativeSourceRef===null));
});
test('metamodel identifies real business entities separately from synthetic demo records',()=>{
 const org=meta.entities.find(x=>x.name==='demo_org_casefiles_v1');
 const fiscal=meta.entities.find(x=>x.name==='fiscal_documents');
 assert.equal(org.domain,'SYNTHETIC_SANDBOX');
 assert.equal(fiscal.domain,'FISCAL_INPUT');
 assert.equal(meta.strictGates.dataIngestion,'NOT_OPERATIONAL');
});
