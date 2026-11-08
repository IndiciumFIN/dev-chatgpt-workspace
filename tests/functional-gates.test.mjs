import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
const load=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const requirements=load('contracts/functional-requirements.v1.json');
const registry=load('contracts/official-source-registry.v1.json');
const totvs=load('contracts/totvs-fisa170-table-registry.candidate.json');
const SOURCE_IDS=new Set(registry.sources.map(x=>x.id));
const REQUIRED_SCOPES=new Set(['DEMO','ENTERPRISE','GOVERNANCE','PERFORMANCE','FISCAL','ACCESSIBILITY']);
const statuses=new Set(['PASS','PASS_AUTOMATED_ONLY','PARTIAL','HOLD']);
test('30 versioned product gates with unique IDs and immutable scope classification',()=>{
 const r=requirements.requirements;
 assert.equal(r.length,30);
 assert.equal(new Set(r.map(x=>x.id)).size,r.length);
 assert.ok(r.every(x=>/^WUTRIB-REQ-\d{3}$/.test(x.id)&&REQUIRED_SCOPES.has(x.scope)&&statuses.has(x.status)));
 assert.equal(requirements.reviewState,'CANDIDATE_NOT_HOMOLOGATED');
});
test('no false fiscal readiness or unreviewed normative authority is promoted',()=>{
 const fs=requirements.requirements.filter(x=>x.scope==='FISCAL');
 assert.ok(fs.length>=6);
 assert.ok(fs.every(x=>x.status==='HOLD'));
 assert.ok(requirements.meaning.includes('not necessarily legal'));
 assert.equal(registry.sourceFileHashes,'NOT_CAPTURED');
 assert.ok(registry.sources.every(x=>!x.validity?.includes('CERTIFIED')));
});
test('each functional gate has an accessible local evidence path and known source IDs',()=>{
 for(const r of requirements.requirements){
  assert.ok(existsSync(resolve(process.cwd(),r.evidenceFile)),r.id+': evidence missing');
  assert.ok(r.sourceIds.length,r.id+': missing source');
  assert.ok(r.sourceIds.every(x=>SOURCE_IDS.has(x)),r.id+': unresolved source reference');
 }
});
test('external source URLs are authority bounded and not user-submitted domains',()=>{
 const official=['gov.br','nfe.fazenda.gov.br','centraldeatendimento.totvs.com',
  'w3.org','asvs.owasp.org','theiia.org','iso.org'];
 for(const s of registry.sources){
  const u=new URL(s.url);
  assert.equal(u.protocol,'https:');
  assert.ok(official.some(host=>u.hostname===host||u.hostname.endsWith('.'+host)),s.url);
  assert.ok(s.edition);
  assert.ok(!s.implementation.includes('FISCAL_COMPLIANCE_APPROVED'));
 }
});
test('vendor table dictionary is not treated as an actual Protheus data dictionary',()=>{
 assert.equal(totvs.editorialState,'CANDIDATE');
 assert.equal(totvs.customerSnapshot,'NOT_AVAILABLE');
 assert.equal(totvs.fieldCatalogStatus,'NOT_EXTRACTED');
 assert.equal(totvs.sourceId,'TOTVS_FISA170');
 assert.equal(new Set(totvs.tables.map(t=>t.code)).size,totvs.tables.length);
 assert.ok(totvs.tables.length>=10);
 assert.ok(totvs.tables.every(t=>t.verificationStatus==='VENDOR_REFERENCE_ONLY'&&
  t.columnMapping.length===0&&t.businessRules.length===0));
});
test('safety, security and accessibility gates remain explicit regardless of green CI',()=>{
 const byId=new Map(requirements.requirements.map(x=>[x.id,x]));
 for(const id of ['WUTRIB-REQ-014','WUTRIB-REQ-016','WUTRIB-REQ-022',
  'WUTRIB-REQ-023','WUTRIB-REQ-024','WUTRIB-REQ-025','WUTRIB-REQ-026'])
  assert.equal(byId.get(id).status,'HOLD');
 assert.equal(byId.get('WUTRIB-REQ-010').status,'PASS_AUTOMATED_ONLY');
 assert.equal(byId.get('WUTRIB-REQ-013').status,'PARTIAL');
});
test('provenance catalog preserves date uncertainty',()=>{
 for(const s of registry.sources)assert.ok(s.validity);
 const sped=registry.sources.find(s=>s.id==='SPED_EFD_GUIDE_324');
 assert.equal(sped.edition,'3.2.4');
 assert.equal(sped.validity,'NOT_ASSERTED');
 const pva=registry.sources.find(s=>s.id==='SPED_EFD_PVA_620');
 assert.equal(pva.edition,'6.2.0');
});
