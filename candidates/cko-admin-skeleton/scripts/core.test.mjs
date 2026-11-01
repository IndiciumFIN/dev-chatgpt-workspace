import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { appendEntry, verifyChain, GENESIS } from '../src/lib/hash-chain.ts';
import { validateRecord, looksLikeSecret } from '../src/lib/validate.ts';
import { schemas } from '../src/data/schemas.ts';
import { runReferenceTest } from '../src/lib/formulas.ts';
import { deriveAttention } from '../src/lib/attention.ts';
import { evaluateGates, diffSnapshots } from '../src/lib/publication-gates.ts';
import { redirectIssue } from '../src/lib/redirects.ts';
import { modules, groups, MODE_LABEL, DOC_ROUTE } from '../src/core/modules.ts';
import { demoCollections, demoEdges } from '../src/data/demo.ts';
import { analyzeImpact } from '../src/lib/impact-engine.ts';
import { captureBoundary, clearBoundary, boundaryChangesWithKey } from '../src/ds/boundary.ts';

test('trilha encadeada: íntegra, detecta alteração, remoção e reordenação', async () => {
  let c = [];
  for (const a of ['A', 'B', 'C']) c = await appendEntry(c, { action: a, objectRef: 'x/1', summary: 'resumo', at: '2026-11-01T00:00:00Z' });
  assert.equal(c[0].prevHash, GENESIS);
  assert.equal((await verifyChain(c)).ok, true);
  assert.equal((await verifyChain(c.map((e, i) => (i === 1 ? { ...e, summary: 'adulterado' } : e)))).ok, false);
  assert.equal((await verifyChain([c[0], c[2]])).ok, false);
  assert.equal((await verifyChain([c[1], c[0], c[2]])).ok, false);
});

test('validação: obrigatório, formato, número, data e segredos', () => {
  const f = schemas.apis.fields;
  const e = validateRecord(f, { name: 'ab', supplier: '', sourceType: 'x', method: 'GET', status: 'ativa', rights: 'licenciada', termsUrl: 'http://x', quotaMonthly: -1, credentialLabel: 'sk-ABCDEFGH12345678', credentialExpiresAt: '2026-13-40' });
  for (const k of ['name', 'supplier', 'sourceType', 'termsUrl', 'quotaMonthly', 'credentialLabel', 'credentialExpiresAt']) assert.ok(e[k], k);
  assert.ok(looksLikeSecret('ghp_abcdefghijklmnop') && looksLikeSecret('A'.repeat(40)) && !looksLikeSecret('chave-2026-A'));
});

test('regras entre campos: API ativa, fonte vigente, candidata noindex, controle evidenciado, Maker≠Checker', () => {
  assert.ok(schemas.apis.rules({ status: 'ativa', rights: 'desconhecido' }).rights);
  assert.ok(schemas.apis.rules({ status: 'ativa', rights: 'livre' }).dossierReviewedAt);
  assert.ok(schemas.sources.rules({ status: 'vigente', rights: 'desconhecido' }).rights);
  assert.ok(schemas.sources.rules({ effectiveFrom: '2026-02-01', effectiveTo: '2026-01-01' }).effectiveTo);
  assert.ok(schemas.seo.rules({ status: 'candidata', noindex: false }).noindex);
  assert.deepEqual(schemas.seo.rules({ status: 'candidata', noindex: true }), {});
  assert.ok(schemas.controls.rules({ status: 'evidenciado', evidence: 'x', consulted: 'metadados_apenas' }).status);
  assert.ok(schemas.reviews.rules({ author: 'Ana', reviewer: 'ana', outcome: 'pendente' }).reviewer);
  assert.ok(schemas.atoms.rules({ status: 'rejeitado', reviewNote: 'curta' }).reviewNote);
  assert.ok(schemas.reftests.rules({ inputsJson: '{x' }).inputsJson);
});

test('testes de referência: passa, falha com dica de unidade, erro de entrada', () => {
  assert.equal(runReferenceTest({ formulaId: 'SINT-MG-PARA-G', inputsJson: '{"mg":500}', expected: 0.5, tolerance: 0.0001 }).result, 'passou');
  const f = runReferenceTest({ formulaId: 'SINT-MG-PARA-G', inputsJson: '{"mg":500}', expected: 500, tolerance: 0.1 });
  assert.equal(f.result, 'falhou'); assert.match(f.message, /unidade/);
  assert.equal(runReferenceTest({ formulaId: 'SINT-REGRA-DE-TRES', inputsJson: '{"a":1,"b":1,"c":0}', expected: 1, tolerance: 0 }).result, 'erro');
  assert.equal(runReferenceTest({ formulaId: 'NAO', inputsJson: '{}', expected: 1, tolerance: 0 }).result, 'erro');
});

const base = { today: '2026-11-01', queue: [], collections: { atoms: [], apis: [], sources: [], reviews: [], controls: [], pages: [] }, impact: { openCandidates: [], failedEvents: [] }, auditChainOk: true };
test('alertas: derivados só de registros, ordenados por severidade', () => {
  assert.deepEqual(deriveAttention(base), []);
  const out = deriveAttention({ ...base,
    queue: [{ id: 'WO-1', title: 't', status: 'HOLD_HUMAN', priority: 'P0', evidence: [] }, { id: 'WO-2', title: 't', status: 'QUEUED', priority: 'P0', evidence: [] }],
    collections: { ...base.collections, apis: [{ id: 'A', name: 'X', credentialExpiresAt: '2026-10-01', quotaMonthly: 10, quotaUsed: 9, status: 'quarentena' }], pages: [{ id: 'P', slug: 'p', sourceIds: 'F1', status: 'homologada' }], sources: [{ id: 'F1', title: 'N', status: 'revogada' }] },
    auditChainOk: false });
  assert.equal(out[0].severity, 'critica');
  const ids = out.map(o => o.id);
  for (const id of ['pmo:WO-1:hold', 'pmo:WO-2:noev', 'api:A:cred', 'api:A:quota', 'api:A:quar', 'page:p:revoked', 'page:p:rev', 'audit:broken']) assert.ok(ids.includes(id), id);
  assert.ok(!deriveAttention({ ...base, collections: { ...base.collections, apis: [{ id: 'A', name: 'X', archived: true, credentialExpiresAt: '2020-01-01' }] } }).length);
});

test('gates de publicação: fonte, SEO, noindex, revisão, testes e md_gate fechado', () => {
  const ok = { today: '2026-11-01', pages: [{ id: 'P1', slug: 'a', include: true, status: 'homologada', sourceIds: 'F1' }], seo: [{ route: '/ferramentas/a', noindex: false }], reviews: [{ objectRef: 'a', outcome: 'aprovado', validUntil: '2027-01-01' }], sources: [{ id: 'F1', status: 'vigente' }], reftests: [] };
  const r = evaluateGates(ok); assert.equal(r.blocked, false); assert.equal(r.mdGate, 'fechado');
  assert.ok(evaluateGates({ ...ok, sources: [{ id: 'F1', status: 'revogada' }] }).blocked);
  assert.ok(evaluateGates({ ...ok, seo: [] }).blocked);
  assert.ok(evaluateGates({ ...ok, reviews: [] }).blocked);
  assert.ok(evaluateGates({ ...ok, reftests: [{ lastResult: 'falhou' }] }).global.length === 1);
  const cand = evaluateGates({ ...ok, pages: [{ id: 'P1', slug: 'a', include: true, status: 'candidata', sourceIds: 'F1' }], reviews: [], seo: [{ route: '/ferramentas/a', noindex: false }] });
  assert.ok(cand.perPage[0].blockers.some(b => /noindex/.test(b)));
});

test('diff de projeções: novo, alterado, removido', () => {
  const a = [{ slug: 'x', title: 'A' }, { slug: 'y', title: 'B' }]; const b = [{ slug: 'x', title: 'A2' }, { slug: 'z', title: 'C' }];
  assert.deepEqual(diffSnapshots(a, b).map(d => `${d.slug}:${d.kind}`).sort(), ['x:alterado', 'y:removido', 'z:novo']);
  assert.equal(diffSnapshots(a, a).length, 0);
});

test('redirecionamentos: duplicata e ciclos bloqueados', () => {
  const rows = [{ id: '1', from: '/a', to: '/b' }, { id: '2', from: '/b', to: '/c' }];
  assert.match(redirectIssue(rows, { from: '/a', to: '/z' }), /Já existe/);
  assert.match(redirectIssue(rows, { from: '/c', to: '/a' }), /ciclo/);
  assert.equal(redirectIssue(rows, { from: '/c', to: '/d' }), null);
  assert.equal(redirectIssue(rows, { from: '/b', to: '/c' }, '2'), null);
});

test('registro de módulos: ids únicos, grupos válidos, modos válidos e todos com limites declarados', () => {
  const ids = modules.map(m => m.id); assert.equal(new Set(ids).size, ids.length);
  for (const m of modules) { assert.ok(groups.includes(m.group), m.id); assert.ok(MODE_LABEL[m.mode], m.id); assert.ok(m.limits.length > 10, m.id); assert.ok(m.source, m.id); }
  assert.ok(modules.length >= 20);
});

test('dados de demonstração: todos rotulados como sintéticos e coerentes com os esquemas', () => {
  for (const [name, rows] of Object.entries(demoCollections)) {
    for (const r of rows) {
      assert.equal(r.synthetic, true, `${name}/${r.id}`);
      const sc = schemas[name]; if (!sc) continue;
      const errs = { ...validateRecord(sc.fields, r), ...(sc.rules?.(r) ?? {}) };
      // Linhas demonstram também casos inválidos de negócio? Não: devem validar.
      assert.deepEqual(errs, {}, `${name}/${r.id}`);
    }
  }
  assert.ok(analyzeImpact(demoEdges, { eventId: 'E', object: { kind: 'dispositivo', id: 'DISP-1', version: '2' }, previousVersion: '1', changeClass: 'revogacao', classifiedBy: 'x', changedBy: 'y', changedAt: '2026-11-01T00:00:00Z' }).length > 0);
});

function walk(dir) { return readdirSync(dir).flatMap(f => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; }); }
test('invariantes estáticas: sem rede, sem credenciais, sem cores rejeitadas, sem login/banco', () => {
  const files = walk('src').filter(f => /\.(ts|tsx|css)$/.test(f)); const text = files.map(f => [f, readFileSync(f, 'utf8')]);
  for (const [f, t] of text) {
    assert.ok(!/\b(fetch|XMLHttpRequest|axios|WebSocket|sendBeacon)\b\s*\(|new\s+(WebSocket|EventSource)/.test(t), `rede em ${f}`);
    assert.ok(!/#0ea5e9|#6366f1|#e0f2fe/i.test(t), `cor rejeitada em ${f}`);
    assert.ok(!/supabase|getSql|getPglite|signInWith|firebase/i.test(t), `login/banco em ${f}`);
  }
  const css = readFileSync('src/styles/tokens.css', 'utf8');
  for (const hex of ['#1a3e74', '#1e4d8c', '#163269', '#4a90e2', '#0f2440', '#475569', '#64748b', '#f9fafb']) assert.ok(css.includes(hex), hex);
  const set = readFileSync('src/modules/Sistema.tsx', 'utf8');
  assert.match(set, /VITE_AUTH_ENABLED/); assert.match(set, /DB_ENABLED/); assert.match(set, /md_gate/);
  assert.ok(!/<input[^>]*type="password"/.test(text.map(x => x[1]).join('')), 'campo de senha');
});

test('foco em anel duplo: halo branco e anel azul com contraste mínimo (WCAG 2.2: 3:1) sobre navy e branco', () => {
  const lum = h => { const [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const cr = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const tok = readFileSync('src/styles/tokens.css', 'utf8'); const css = readFileSync('src/styles/admin.css', 'utf8');
  const ring = /--focus-ring:\s*(#[0-9a-f]{6})/i.exec(tok)[1]; const halo = /--focus-halo:\s*(#[0-9a-f]{6})/i.exec(tok)[1];
  assert.ok(Math.abs(cr(halo, '#1a3e74') - 10.58) < 0.01); assert.ok(Math.abs(cr(ring, '#ffffff') - 6.7) < 0.01);
  assert.match(css, /:focus-visible\s*\{[^}]*var\(--focus-ring\)[^}]*var\(--focus-halo\)/);
});

test('documentação máster não vira módulo inexistente nem aprovação', () => {
  const ids = new Set(modules.map(m => m.id));
  for (const [route, id] of Object.entries(DOC_ROUTE)) {
    if (id === null) assert.equal(ids.has(route), false, route);
    else assert.equal(ids.has(id), true, route);
  }
  assert.equal(DOC_ROUTE.agents, null);
  assert.equal(DOC_ROUTE.finops, null);
  assert.equal(DOC_ROUTE.users, null);
  const captured = captureBoundary(new Error('quebra'));
  assert.equal(captured.failed, true);
  assert.equal(captured.message, 'quebra');
  assert.equal(clearBoundary().failed, false);
  assert.equal(boundaryChangesWithKey('pmo', 'pmo', true), false);
  assert.equal(boundaryChangesWithKey('pmo', 'sources', true), true);
  const app = readFileSync('src/App.tsx', 'utf8');
  assert.match(app, /ModuleErrorBoundary/);
  assert.doesNotMatch(app, /super_admin|setRole/);
});

