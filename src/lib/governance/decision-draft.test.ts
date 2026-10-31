import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDecisionDraft, type DecisionInput } from './decision-draft.ts';

const base: DecisionInput = {
  workOrderId: 'WO-ADM-001',
  choice: 'REVIEW',
  reason: 'Parecer técnico em revisão, sem efeito autorizativo.',
  evidenceUrl: 'https://github.com/IndiciumFIN/dev-chatgpt-workspace/pull/26',
};
test('minuta de revisão explicita ausência de submissão e bloqueio de promoção', () => {
  const result = buildDecisionDraft(base);
  assert.equal(result.ok, true);
  assert.equal(result.status, 'NOT_SUBMITTED');
  assert.equal(result.promotionAllowed, false);
  if (result.ok) {
    assert.match(result.text, /NÃO ENVIADA/);
    assert.match(result.text, /NOT_VERIFIED/);
    assert.match(result.text, /nenhum; não altera PMO/);
  }
});
test('minuta não aprova execução mesmo quando escolha é Aprovar', () => {
  const result = buildDecisionDraft({...base, choice: 'APPROVE'});
  assert.equal(result.ok, true);
  assert.equal(result.promotionAllowed, false);
  assert.equal(result.status, 'NOT_SUBMITTED');
});
test('aprovar com ressalvas exige ressalvas explícitas', () => {
  const result = buildDecisionDraft({...base, choice: 'APPROVE_WITH_RESERVATIONS', caveats: ''});
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.errors.join(' '), /ressalvas/i);
});
test('parecer favorável sem evidência é rejeitado', () => {
  const result = buildDecisionDraft({...base, choice: 'APPROVE', evidenceUrl: ''});
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.errors.join(' '), /evidência/i);
});
test('WO inválida é rejeitada', () => {
  const result = buildDecisionDraft({...base, workOrderId: 'other'});
  assert.equal(result.ok, false);
});
test('links de evidência externos ao repositório são rejeitados', () => {
  const result = buildDecisionDraft({...base, evidenceUrl: 'https://example.com/fake'});
  assert.equal(result.ok, false);
});
test('justificativa vazia ou muito curta é rejeitada', () => {
  const result = buildDecisionDraft({...base, reason: 'ok'});
  assert.equal(result.ok, false);
});
test('solicitação de ajustes permanece apenas minuta', () => {
  const result = buildDecisionDraft({...base, choice: 'REQUEST_CHANGES'});
  assert.equal(result.ok, true);
  assert.equal(result.promotionAllowed, false);
});
test('tipo desconhecido não autoriza nada mesmo forjado em runtime', () => {
  const result = buildDecisionDraft({...base, choice: 'RELEASE' as DecisionInput['choice']});
  assert.equal(result.ok, false);
  assert.equal(result.promotionAllowed, false);
});

test('stale hidden reservations cannot appear in plain approval', () => {
  const result = buildDecisionDraft({ ...base, choice: 'APPROVE', caveats: 'Ressalvas de uma escolha anterior' });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.match(result.text, /Ressalvas:\*\* Não registradas/);
    assert.doesNotMatch(result.text, /Ressalvas de uma escolha anterior/);
  }
});
