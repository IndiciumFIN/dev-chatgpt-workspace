import {test} from 'node:test';
import assert from 'node:assert/strict';
import {examineSourcePage,summarizeSourceIndex} from './lib/corpus-index.mjs';

const hash='a'.repeat(64);
const base={arquivo:'pt-br/escalas/glasgow/index.html',idioma:'pt-BR',papel:'origem',sha256:hash,
  titulo:'Escala Glasgow',secoes:[{titulo:'Conceito',corpo:'Texto'}],
  textoCompleto:'Texto explicativo',metadados:{canonical:'https://www.calculadorasdeenfermagem.com.br/pt-br/escalas/glasgow/'}};
const path='artifacts/fonte/corpus/paginas/'+hash+'.json';
function page(data=base,filename=path){return examineSourcePage(filename,Buffer.from(JSON.stringify(data),'utf8'));}
test('source page preserves original lineage with git hash and NO release',()=>{
  const p=page();
  assert.equal(p.sourceHtmlSha256Claim,hash);
  assert.equal(p.sourceBlobSha.length,40);
  assert.equal(p.sourceJsonSha256.length,64);
  assert.equal(p.identity,'pt-BR|pt-br/escalas/glasgow/index.html');
  assert.deepEqual(p.structuralProblems,[]);
  assert.equal(p.publicationAllowed,false);
  assert.equal(p.rightsStatus,'NOT_VERIFIED');
  assert.equal(p.clinicalStatus,'HOLD_HUMAN');
});
test('missing licensing data remains unverified (not public)',()=>{
  const p=page();assert.equal(p.hasLicenseEvidence,false);
  const s=summarizeSourceIndex([p],1);
  assert.equal(s.licenseUnverified,1);
  assert.equal(s.publicationAllowed,false);
});
test('source HTML hash is only a claim; filename mismatch is blocked',()=>{
  const p=page({...base,sha256:'b'.repeat(64)});
  assert.ok(p.structuralProblems.includes('FILENAME_SHA256_MISMATCH'));
});
test('malformed JSON and invalid paths fail structural validation without throwing',()=>{
  const p=examineSourcePage(path,Buffer.from('{invalid'));
  assert.ok(p.structuralProblems.includes('INVALID_JSON'));
  assert.ok(p.structuralProblems.includes('INVALID_DOCUMENT_PATH'));
});
test('foreign canonical URLs are not silently accepted',()=>{
  const p=page({...base,metadados:{canonical:'https://attacker.invalid/'}});
  assert.ok(p.structuralProblems.includes('CANONICAL_OUTSIDE_PROJECT'));
});
test('duplicates are reported as identity collisions, not auto-deduplicated',()=>{
  const one=page();
  const two=page({...base,sha256:'b'.repeat(64)},'artifacts/fonte/corpus/paginas/'+'b'.repeat(64)+'.json');
  const s=summarizeSourceIndex([one,two],2);
  assert.equal(s.duplicateIdentityGroups,1);
  assert.equal(s.observedCount,2);
});
test('incomplete corpus cannot pass batch coverage completeness',()=>{
  const s=summarizeSourceIndex([page()],8250);
  assert.equal(s.complete,false);
  assert.equal(s.expectedCount,8250);
});
test('locale missing and missing text are reported for quarantine',()=>{
  const p=page({...base,idioma:'',secoes:null,textoCompleto:null});
  assert.ok(p.structuralProblems.includes('INVALID_LOCALE'));
  assert.ok(p.structuralProblems.includes('SECTIONS_MISSING'));
  assert.ok(p.structuralProblems.includes('FULL_TEXT_MISSING'));
});
