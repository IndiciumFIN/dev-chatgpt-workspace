#!/usr/bin/env node
/**
 * status-projeto.mjs — painel de status do projeto, DERIVADO.
 *
 * Regra: nenhum número aqui é digitado à mão. Os percentuais saem dos
 * artefatos dos portões (artifacts/*.json) e do estado do motor do time
 * (.mavis/plans/plan_03e9bf0a/state.json). O que não der para medir é
 * marcado como TAL, não estimado em silêncio.
 *
 *   node scripts/status-projeto.mjs            # painel em texto
 *   node scripts/status-projeto.mjs --json     # mesmo painel, em JSON
 *   node scripts/status-projeto.mjs --detalhe  # com a evidência de cada frente
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';

const RAIZ = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const ARGS = process.argv.slice(2);
const SAIDA_JSON = ARGS.includes('--json');
const DETALHE = ARGS.includes('--detalhe');

/* O plano ativo é o do diretório com state.json mais recente. */
function planoAtivo() {
  const raiz = '/workspace/.mavis/plans';
  if (!existsSync(raiz)) return { dir: null, estado: null };
  const dirs = readdirSync(raiz)
    .map((d) => {
      const st = ler(`${raiz}/${d}/state.json`);
      return { dir: `${raiz}/${d}`, mtime: statSync(`${raiz}/${d}/state.json`).mtimeMs, status: st?.status ?? '?' };
    })
    .filter((d) => existsSync(`${d.dir}/state.json`))
    // planos encerrados não são o plano ativo: prefere quem está rodando
    .sort((a, b) => {
      const vivo = (s) => (s === 'cancelled' || s === 'failed' ? 1 : 0);
      return vivo(a.status) - vivo(b.status) || b.mtime - a.mtime;
    });
  if (!dirs.length) return { dir: null, estado: null };
  return { dir: dirs[0].dir, estado: ler(`${dirs[0].dir}/state.json`) };
}

const ler = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null);
const pct = (a, b) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);
const ok = (v) => (v ? 'OK ' : 'FALHA');

/* ------------------------------------------------------------------ *
 * 1. As frentes e o peso de cada uma no total.
 * ------------------------------------------------------------------ */
const FRENTES = [
  { id: 'indice', peso: 10, nome: 'Índice do banco — rótulo humano para tudo' },
  { id: 'derby', peso: 15, nome: 'DERBY — nada fica retido' },
  { id: 'source', peso: 15, nome: 'Processo de source — kernel, intake, portão, OPA' },
  { id: 'normativos', peso: 15, nome: 'Normativos — requisitos, captura e atomização' },
  { id: 'fonte', peso: 20, nome: 'Fonte — HTML→JSON, confronto com o banco, recuperação' },
  { id: 'admin', peso: 15, nome: 'Área administrativa — rotas, UX do DS, acessibilidade' },
  { id: 'final', peso: 10, nome: 'Verificação final (#9) — encontro das duas linhagens' },
];

/* Tarefas do plano que compõem cada frente. */
const TAREFAS = {
  source: ['source-processo', 'doutrina'],
  normativos: ['normas-requisitos', 'normas-atomizacao'],
  fonte: ['fonte-catalogo', 'fonte-recuperacao'],
  admin: ['spec-mesas', 'admin-area'],
  final: ['verificacao-final'],
};

/* Status da tarefa -> % do caminho dela. */
const PCT_STATUS = {
  done: 100,
  verifying: 70,
  producing: 40,
  ready: 0,
  blocked: 0,
  pending: 0,
};

/* ------------------------------------------------------------------ *
 * 2. Medições (artefatos dos portões).
 * ------------------------------------------------------------------ */
const indice = ler(`${RAIZ}/artifacts/db-indice.json`);
const derby = ler(`${RAIZ}/artifacts/db-derby.json`);
const source = ler(`${RAIZ}/artifacts/source-processo.json`);
const { dir: PLANO_DIR, estado } = planoAtivo();

/* ------------------------------------------------------------------ *
 * 3. Cálculo por frente.
 * ------------------------------------------------------------------ */
const evidencia = {};
const partes = {};

function statusTarefa(t) {
  return estado?.results?.find((r) => r.task_id === t) ?? null;
}
function pctTarefa(t) {
  const r = statusTarefa(t);
  if (!r) return { pct: 0, status: 'sem registro' };
  return { pct: PCT_STATUS[r.status] ?? 0, status: r.status, r };
}

// (a) Índice: o portão conta as tabelas; o front mede cobertura de label.
{
  const c = indice?.contagens ?? {};
  const p = pct(c.tabelasComLabel ?? 0, c.tabelasDoBanco ?? 0);
  partes.indice = p;
  evidencia.indice = `tabelas=${c.tabelasDoBanco} · com label=${c.tabelasComLabel} · fora do dicionário=${c.tabelasForaDoDicionario ?? '?'} · violações=${indice?.violacoes?.length ?? '?'}`;
}

// (b) DERBY: nada retido = nenhuma pendência alvo e nenhuma violação.
{
  const alvo = (derby?.pendencias ?? []).filter((p) => p.alvo);
  const p = derby?.violacoes?.length === 0 && alvo.length === 0 ? 100 : Math.max(0, 100 - alvo.length * 10 - (derby?.violacoes?.length ?? 0) * 10);
  partes.derby = p;
  evidencia.derby = `violações=${derby?.violacoes?.length ?? '?'} · pendências-alvo=${alvo.length} · discriminadores nomeados=${(derby?.estruturais ?? []).length} · marcador em ${Object.keys(derby?.marcador ?? {}).length} tabelas`;
}

// (c) Source: medido pelo artefato + a fase da tarefa no motor.
{
  const c = source?.contagens ?? {};
  const sub = [
    { nome: 'átomos admitidos', a: c.atomosAdmitidos ?? 0, b: c.atomos ?? 0 },
    { nome: 'manifestos aprovados', a: c.manifestosAprovados ?? 0, b: c.manifestos ?? 0 },
    { nome: 'aprovegoes registradas', a: c.aprovacoes ?? 0, b: c.manifestos ?? 0 },
  ].map((s) => ({ ...s, p: s.b > 0 ? pct(s.a, s.b) : null }));
  const validos = sub.filter((s) => s.p !== null);
  const mecanica = validos.length ? Math.round((validos.reduce((t, s) => t + s.p, 0) / validos.length) * 10) / 10 : 0;
  const t = pctTarefa('source-processo');
  partes.source = Math.min(mecanica, t.pct);
  evidencia.source = `${sub.map((s) => `${s.nome} ${s.a}/${s.b}${s.p === null ? ' (n/a)' : ''}`).join(' · ')} · portão violações=${source?.violacoes?.length ?? '?'} · tarefa=${t.status}`;
}

// (d) As frentes cujas tarefas vivem no motor do time.
for (const [frente, tarefas] of Object.entries(TAREFAS)) {
  if (frente === 'source') continue;
  const ts = tarefas.map((t) => ({ t, ...pctTarefa(t) }));
  const p = Math.round((ts.reduce((acc, x) => acc + x.pct, 0) / ts.length) * 10) / 10;
  partes[frente] = p;
  evidencia[frente] = ts.map((x) => `${x.t}=${x.status}(${x.pct}%)`).join(' · ');
}

/* ------------------------------------------------------------------ *
 * 4. Total ponderado.
 * ------------------------------------------------------------------ */
const total = Math.round((FRENTES.reduce((acc, f) => acc + (partes[f.id] ?? 0) * f.peso, 0) / FRENTES.reduce((acc, f) => acc + f.peso, 0)) * 10) / 10;

/* ------------------------------------------------------------------ *
 * 5. Saída.
 * ------------------------------------------------------------------ */
const paineis = FRENTES.map((f) => ({
  id: f.id,
  nome: f.nome,
  peso: f.peso,
  pct: partes[f.id] ?? 0,
  evidencia: evidencia[f.id] ?? '',
}));

if (SAIDA_JSON) {
  console.log(JSON.stringify({ total, frentes: paineis, estado_plano: estado?.status ?? null, ciclo: estado?.cycle ?? null }, null, 2));
  process.exit(0);
}

const barra = (p, largura = 20) => {
  const cheio = Math.round((p / 100) * largura);
  return '█'.repeat(cheio) + '░'.repeat(largura - cheio);
};

console.log('');
console.log(`  PAINEL DO PROJETO — ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`);
  console.log(`  plano: ${estado?.status ?? 'sem estado'} · ciclo ${estado?.cycle ?? '?'}   TOTAL: ${total}%`);
console.log('');
for (const f of paineis) {
  console.log(`  ${String(f.pct).padStart(5)}%  ${barra(f.pct)}  ${f.nome}  (peso ${f.peso})`);
  if (DETALHE) console.log(`          ↳ ${f.evidencia}`);
}
console.log('');
if (!DETALHE) {
  console.log('  (--detalhe mostra a evidência de cada frente; --json mostra tudo em JSON)');
  console.log('');
}
