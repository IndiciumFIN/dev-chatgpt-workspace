import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evidenceSuggestions, searchEvidenceSuggestions, searchReviewWorkOrders, selectReviewEvidence, type ReviewWorkOrder } from './review-source-catalog.ts';

const WO: ReviewWorkOrder[] = [
  { id:'WO-SEC-001', title:'Segurança, dependências e LGPD', status:'IN_PROGRESS', priority:'P0',
    criteria:'Verificar autorização e proteção de dados.', next:'Validar auditoria',
    owner:'Revisão independente', evidence:['https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/41221325910'] },
  { id:'WO-HOM-001', title:'Homologação independente', status:'HOLD_HUMAN', priority:'P0',
    criteria:'Aprovações humanas auditáveis.', next:'Aguardar Kernel',
    owner:'Homologador', evidence:[] },
  { id:'WO-PMO-001', title:'PMO visível no administrador', status:'DONE', priority:'P1',
    criteria:'Aba PMO', next:'Nada', owner:'Coordenação', evidence:[] },
];

test('search with Portuguese accents and case',()=>{
  assert.deepEqual(searchReviewWorkOrders(WO,'SEGURANCA').map(w=>w.id), ['WO-SEC-001']);
  assert.deepEqual(searchReviewWorkOrders(WO,'homologacao independente').map(w=>w.id), ['WO-HOM-001']);
});
test('search by ID, state and action without inventing WOs',()=>{
  assert.deepEqual(searchReviewWorkOrders(WO,'WO-PMO-001').map(w=>w.id), ['WO-PMO-001']);
  assert.deepEqual(searchReviewWorkOrders(WO,'aguardar kernel').map(w=>w.id), ['WO-HOM-001']);
  assert.equal(searchReviewWorkOrders(WO,'WO-INVALIDO').length,0);
});
test('blank search preserves canonical order and does not mutate',()=>{
  assert.deepEqual(searchReviewWorkOrders(WO,'').map(w=>w.id), WO.map(w=>w.id));
});
test('PMO evidence suggestions are scoped to selected WO',()=>{
  const options=evidenceSuggestions(WO[0]);
  assert.equal(options.length,1);
  assert.match(options[0].url,/41221325910/);
  assert.ok(options.every(o=>o.origin==='PMO' && o.advisory));
});
test('governance links are suggested but explicitly not Kernel admission',()=>{
  const options=evidenceSuggestions(WO[1]);
  assert.equal(options.length,2);
  assert.ok(options.some(o=>o.label.includes('sem admissão Kernel')));
  assert.ok(options.every(o=>o.origin==='GOVERNANCE'));
  assert.equal(evidenceSuggestions(WO[0]).some(o=>o.url.endsWith('/issues/25')),false);
});
test('evidence search is accent-insensitive and matched within actual options',()=>{
  const options=evidenceSuggestions(WO[1]);
  assert.equal(searchEvidenceSuggestions(options,'APROVACAO').length,1);
  assert.equal(searchEvidenceSuggestions(options,'no source').length,0);
});
test('source selection cannot inject a source outside the list',()=>{
  const options=evidenceSuggestions(WO[0]);
  assert.equal(selectReviewEvidence(options,options[0].id),options[0].url);
  assert.equal(selectReviewEvidence(options,'evidence-3'),null);
});
test('suspicious or duplicate URLs are never suggested',()=>{
  const item={...WO[0],evidence:['https://phishing.invalid/a','https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/1',
    'https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/1','javascript:alert(1)']};
  const options=evidenceSuggestions(item);
  assert.equal(options.length,1);
  assert.equal(options[0].url,'https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/1');
});
test('a WO with no evidence has no fabricated PMO evidence',()=>{
  assert.equal(evidenceSuggestions({...WO[0], evidence:[]}).length,0);
});
