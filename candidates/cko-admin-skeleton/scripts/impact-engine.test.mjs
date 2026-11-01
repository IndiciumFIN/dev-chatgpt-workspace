#!/usr/bin/env node
/**
 * Cenários de referência do motor de impacto (docs/PLANO..., "Controles de qualidade").
 * Node >= 22.6: `node --experimental-strip-types scripts/test-impact-engine.mjs`
 * Sem rede, sem localStorage, sem dados reais: os grafos abaixo são fixtures sintéticas de teste.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyChange, analyzeImpact, processChangeEvent, emptyLedger, buildTriageDrafts,
  validateDecision, computeCoverage, pendingSuggestions, DEFAULT_SEVERITY_MATRIX,
} from '../src/lib/impact-engine.ts';

const n = (kind, id, version) => ({ kind, id, version });
const edge = (source, dependent, relation = 'derivado_de', extra = {}) =>
  ({ source, dependent, relation, status: 'validada', validatedBy: 'curador', validatedAt: '2026-10-01T00:00:00Z', ...extra });
const ev = (over = {}) => ({
  eventId: 'EV-1', object: n('dispositivo', 'D1', '2'), previousVersion: '1', changeClass: 'requisito',
  classifiedBy: 'revisor-a', changedBy: 'maker-x', changedAt: '2026-10-20T00:00:00Z', ...over,
});

const D1v1 = n('dispositivo', 'D1', '1');
const graph = [
  edge(D1v1, n('atomo_normativo', 'A1', '1')),
  edge(D1v1, n('atomo_normativo', 'A2', '1')),
  edge(n('atomo_normativo', 'A1', '1'), n('atomo_editorial', 'E1', '1'), 'explica'),
  edge(n('atomo_editorial', 'E1', '1'), n('pagina', 'P1', '1'), 'compoe', { locale: 'pt-BR' }),
  edge(n('atomo_editorial', 'E1', '1'), n('pagina', 'P1-en', '1'), 'compoe', { locale: 'en' }),
  edge(n('atomo_normativo', 'A2', '1'), n('pagina', 'P2', '1'), 'usa_como_dado'),
];

test('mudança de dispositivo com vários dependentes: todos com caminho e motivo', () => {
  const found = analyzeImpact(graph, ev());
  const ids = found.map(c => c.asset.id).sort();
  assert.deepEqual(ids, ['A1', 'A2', 'E1', 'P1', 'P1-en', 'P2']);
  const p1 = found.find(c => c.asset.id === 'P1');
  assert.deepEqual(p1.path.map(p => p.node.id), ['D1', 'A1', 'E1', 'P1']);
  assert.match(p1.reason, /ainda usa 1/);
  assert.equal(p1.severity, 'alta');
  assert.equal(p1.state, 'impacto_em_analise');
});

test('remoção de uma relação: o ativo deixa de ser candidato', () => {
  const without = graph.filter(e => e.dependent.id !== 'P2');
  assert.ok(!analyzeImpact(without, ev()).some(c => c.asset.id === 'P2'));
});

test('tradução: filtro por locale respeita a aresta', () => {
  const found = analyzeImpact(graph, ev(), { locales: ['pt-BR'] });
  assert.ok(found.some(c => c.asset.id === 'P1'));
  assert.ok(!found.some(c => c.asset.id === 'P1-en'));
});

test('quem já fixou a versão nova não é afetado; quem fixa versão antiga é', () => {
  const g = [edge(n('dispositivo', 'D1', '2'), n('pagina', 'NOVA', '1')), edge(D1v1, n('pagina', 'VELHA', '1'))];
  const ids = analyzeImpact(g, ev()).map(c => c.asset.id);
  assert.deepEqual(ids, ['VELHA']);
});

test('mudança cosmética confirmada não abre análise por ativo', () => {
  const r = processChangeEvent(emptyLedger(), graph, ev({ changeClass: 'metadados' }));
  assert.equal(r.status, 'ignorado');
  assert.equal(r.created.length, 0);
});

test('norma revogada: crítica, bloqueia publicação dependente', () => {
  const found = analyzeImpact(graph, ev({ changeClass: 'revogacao' }));
  assert.ok(found.length > 0 && found.every(c => c.severity === 'critica' && c.blocksPublication));
});

test('alteração de template alcança páginas que o usam', () => {
  const g = [edge(n('template', 'T1', '1'), n('pagina', 'P9', '1'), 'usa_template')];
  const found = analyzeImpact(g, ev({ object: n('template', 'T1', '2'), changeClass: 'estrutura_apresentacao' }));
  assert.deepEqual(found.map(c => c.asset.id), ['P9']);
  assert.equal(found[0].severity, 'baixa');
});

test('fórmula/valor que toca cálculo é crítica mesmo sem texto alterado', () => {
  const g = [edge(n('atomo_normativo', 'A9', '1'), n('formula', 'F1', '1'), 'usa_como_dado'), edge(n('formula', 'F1', '1'), n('pagina', 'CALC', '1'), 'usa_formula')];
  const found = analyzeImpact(g, ev({ object: n('atomo_normativo', 'A9', '2'), changeClass: 'valor_dado' }));
  assert.ok(found.length === 2 && found.every(c => c.severity === 'critica'));
});

test('falha/repetição de evento e OS duplicada: idempotente', () => {
  const first = processChangeEvent(emptyLedger(), graph, ev());
  assert.equal(first.status, 'processado');
  const again = processChangeEvent(first.ledger, graph, ev());
  assert.equal(again.status, 'duplicado');
  assert.equal(again.created.length, 0);
  // Mesmo ativo por outro evento da mesma versão não duplica a chave do primeiro.
  assert.equal(Object.keys(first.ledger.candidates).length, first.created.length);
});

test('falha de processamento é registrada e retomável', () => {
  const bad = { ...graph[0], validatedAt: '2026-10-01T00:00:00Z' };
  const broken = processChangeEvent(emptyLedger(), [bad], { ...ev(), changedAt: undefined, object: null });
  assert.equal(broken.status, 'falhou');
  assert.equal(broken.ledger.events['EV-1'].attempts, 1);
  const retry = processChangeEvent(broken.ledger, graph, ev());
  assert.equal(retry.status, 'processado');
  assert.equal(retry.ledger.events['EV-1'].attempts, 2);
});

test('arestas sugeridas não propagam, mas ficam visíveis ao curador', () => {
  const g = [...graph, { ...edge(D1v1, n('pagina', 'SUG', '1')), status: 'sugerida', validatedAt: undefined }];
  assert.ok(!analyzeImpact(g, ev()).some(c => c.asset.id === 'SUG'));
  assert.equal(pendingSuggestions(g, ev()).length, 1);
});

test('ciclo no grafo termina', () => {
  const a = n('atomo_editorial', 'X', '1'); const b = n('atomo_editorial', 'Y', '1');
  const g = [edge(D1v1, a), edge(a, b), edge(b, a)];
  assert.deepEqual(analyzeImpact(g, ev()).map(c => c.asset.id).sort(), ['X', 'Y']);
});

test('classificação: campo desconhecido nunca vira "só metadados"', () => {
  assert.equal(classifyChange(['title']), 'metadados');
  assert.equal(classifyChange(['title', 'unit']), 'valor_dado');
  assert.equal(classifyChange(['campo_novo']), 'indeterminada');
  assert.equal(classifyChange([]), 'indeterminada');
  const found = analyzeImpact(graph, ev({ changeClass: 'indeterminada', classifiedBy: undefined }));
  assert.ok(found.every(c => c.requiresHumanClassification));
});

test('matriz padrão é proposta, não aprovada', () => {
  assert.equal(DEFAULT_SEVERITY_MATRIX.approved, false);
});

test('triagem agrupa por responsável e origem, sem perder o vínculo por ativo', () => {
  const found = analyzeImpact(graph, ev());
  const drafts = buildTriageDrafts(found, a => (a.id.startsWith('P') ? 'equipe-conteudo' : undefined));
  const total = drafts.reduce((s, d) => s + d.candidateKeys.length, 0);
  assert.equal(total, found.length);
  assert.ok(drafts.every(d => d.status === 'draft'));
  assert.ok(drafts.some(d => d.owner === 'SEM_RESPONSAVEL' && /atribuir/.test(d.note)));
});

test('decisão: Maker≠Checker, justificativa e evidência por severidade', () => {
  const c = analyzeImpact(graph, ev({ changeClass: 'revogacao' }))[0];
  const base = { candidateKey: c.idempotencyKey, outcome: 'nao_impacta', reviewerId: 'rev', makerId: 'maker-x', justification: 'Página não cita o dispositivo revogado; verificado manualmente no texto.', evidenceRefs: [], decidedAt: '2026-10-21T00:00:00Z' };
  assert.ok(validateDecision(c, base).errors.some(e => /evidência/.test(e)));
  assert.ok(validateDecision(c, { ...base, evidenceRefs: ['ev://1'], reviewerId: 'maker-x' }).errors.some(e => /Maker/.test(e)));
  assert.ok(validateDecision(c, { ...base, justification: 'curta' }).errors.some(e => /Justificativa/.test(e)));
  assert.equal(validateDecision(c, { ...base, evidenceRefs: ['ev://1'] }).ok, true);
});

test('cobertura tem denominador e não declara rastreabilidade sem fonte', () => {
  const nodes = [D1v1, n('atomo_normativo', 'A1', '1'), n('atomo_editorial', 'E1', '1'), n('pagina', 'P1', '1'), n('pagina', 'ORFA', '1')];
  const g = [edge(D1v1, nodes[1]), edge(nodes[1], nodes[2], 'explica'), edge(nodes[2], nodes[3], 'compoe'), edge(nodes[2], n('pagina', 'FANTASMA', '1'), 'compoe')];
  const r = computeCoverage(['P1', 'ORFA'], g, nodes);
  assert.equal(r.publishedPages, 2);
  assert.equal(r.pagesWithValidatedSource, 1);
  assert.deepEqual(r.pagesWithoutSource, ['ORFA']);
  assert.equal(r.danglingEdges, 1);
});
