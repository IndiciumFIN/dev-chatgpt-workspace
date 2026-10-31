#!/usr/bin/env node
/**
 * Gate de cobertura de pendências — PMO × Kernel.
 *
 * Fecha o ciclo "cobertura integral" da issue #25:
 * toda WO ativa precisa de TASK, toda TASK precisa de WO,
 * toda pendência registrada precisa estar vinculada a uma WO/TASK
 * e nenhuma lacuna de cobertura pode ficar aberta.
 *
 * O gate é NÃO-CIRCULAR: ele re-deriva as WOs do registro canônico
 * (`registers/pmo/queue.v1.json`), re-deriva as pendências do inventário
 * (`registers/pmo/cross-source-pending-intake.v1.json`) e re-deriva as tasks
 * do plano (`docs/PLAN-TASKS-PMOKERNEL-v0.1.0.json`). Nenhuma das três
 * fontes é consideradaautoridade sobre a outra: uma pendência "coberta" por
 * um snapshot que ninguém re-derivou conta como órfã.
 *
 * Modos de entrada (--root <dir>, default "."):
 *   node scripts/check-pending-coverage.mjs
 *   node scripts/check-pending-coverage.mjs --root tests/fixtures/coverage
 *
 * Códigos de saída:
 *   0 = sem violações (ou SKIP declarado por padrão quando falta insumo no branch candidato)
 *   1 = violações bloqueantes (inclusive insumo ausente em --require-inputs)
 *   2 = uso incorreto
 *
 * Regra de ausência: entrada ausente NÃO é aprovação. Quando o insumo ainda
 * não aterrissou no branch, o gate imprime SKIP com o ID da task que falta e
 * sai 0 — a ativação do gate no CI é a task T1.3, dependente de T0.2.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";

const REL = {
  queue: "registers/pmo/queue.v1.json",
  intake: "registers/pmo/cross-source-pending-intake.v1.json",
  plan: "docs/PLAN-TASKS-PMOKERNEL-v0.1.0.json",
};

const args = process.argv.slice(2);
let root = ".";
let requireInputs = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--root") {
    root = args[++i] ?? null;
    if (!root) fail(2, "--root exige um caminho");
  } else if (args[i] === "--require-inputs") {
    requireInputs = true;
  } else if (args[i] === "--help" || args[i] === "-h") {
    console.log("uso: node scripts/check-pending-coverage.mjs [--root <dir>] [--require-inputs]");
    process.exit(0);
  } else {
    fail(2, `argumento desconhecido: ${args[i]}`);
  }
}
const ROOT = resolve(process.cwd(), root);

function fail(code, msg) {
  console.error(`[check-pending-coverage] ${msg}`);
  process.exit(code);
}

function readJson(rel) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch (e) {
    fail(1, `JSON inválido em ${rel}: ${e.message}`);
  }
}

const queue = readJson(REL.queue);
const intake = readJson(REL.intake);
const plan = readJson(REL.plan);

const missing = [];
if (!queue) missing.push({ rel: REL.queue, task: "T0.2" });
if (!intake) missing.push({ rel: REL.intake, task: "T0.2" });
if (!plan) missing.push({ rel: REL.plan, task: "T0.5" });

if (missing.length) {
  if (requireInputs) {
    for (const m of missing) console.error(`[check-pending-coverage] ENTRADA_AUSENTE: ${m.rel} (depende de ${m.task})`);
    process.exit(1);
  }
  console.log("[check-pending-coverage] SKIP — insumo ainda não aterrissado neste branch:");
  for (const m of missing) console.log(`  - ${m.rel} (depende de ${m.task})`);
  console.log("  Ausência de insumo não é aprovação. Ative o gate após T0.2/T0.5 (task T1.3).");
  process.exit(0);
}

const violations = [];
const add = (code, detail) => violations.push({ code, detail });

/* A chamada isolada do gate não pode ignorar coleções omitidas, mesmo
 * quando o validador de schema não foi executado antes dela. */
for (const key of ["items"]) {
  if (!Array.isArray(queue[key])) add("ENTRADA_INCOMPLETA", `fila.${key} deve existir como array`);
}
if (!Array.isArray(plan.tasks)) add("ENTRADA_INCOMPLETA", "plano.tasks deve existir como array");
for (const key of ["simulados", "openIssues", "coverageGaps"]) {
  if (!Array.isArray(intake[key])) add("ENTRADA_INCOMPLETA", `inventário.${key} deve existir como array`);
}

/* ---------- re-derivação 1: WOs canônicas ---------- */
const wos = Array.isArray(queue.items) ? queue.items : [];
const woIds = new Set(wos.map((w) => w.id));
if (!wos.length) add("FILA_VAZIA", "registers/pmo/queue.v1.json não possui itens");

/* ---------- re-derivação 2: tasks do plano ---------- */
const tasks = Array.isArray(plan.tasks) ? plan.tasks : [];
const taskById = new Map(tasks.map((t) => [t.id, t]));
if (!tasks.length) add("PLANO_VAZIO", "docs/PLAN-TASKS-PMOKERNEL-v0.1.0.json não possui tasks");
if (taskById.size !== tasks.length) add("TASK_ID_DUPLICADO", "plano.tasks contém IDs duplicados");

const OPEN_WO_STATUS = new Set(["PAUSED", "IN_PROGRESS", "QUEUED", "HOLD_HUMAN", "BLOCKED"]);
// Task "PROPOSTO" ou "BLOCKED" ainda é uma task viva: o que define cobertura
// é existir vínculo task↔WO, não o estágio de execução. Só vínculo morto
// (SUPERSEDED/CANCELLED) deixa de cobrir.
const CLOSED_TASK_STATUS = new Set(["SUPERSEDED", "CANCELLED"]);

/* ---------- re-derivação 3: pendências do inventário ---------- */
const pending = [];
for (const item of intake.simulados ?? []) {
  pending.push({ group: "simulados", id: item.id, aliases: [item.id, `simulados:${item.id}`], title: item.title ?? "", status: item.status ?? "", wo: item.wo ?? "" });
}
for (const item of intake.openIssues ?? []) {
  // O inventário real usa ids "GH-<n>"; snapshots antigos usam {number}.
  // Aceitamos todas as formas para que o gate não dependa do formato.
  const num = item.number ?? String(item.id ?? "").replace(/^(GH|ISSUE)-/, "");
  const aliases = [...new Set([item.id, num ? `ISSUE-${num}` : null, num ? `GH-${num}` : null].filter(Boolean))];
  pending.push({ group: "issue", id: aliases[0], aliases, title: item.title ?? "", status: item.state ?? "OPEN", wo: item.wo ?? "" });
}

/* ---------- regra 1: task sem WO ---------- */
for (const t of tasks) {
  if (!t.wo) {
    add("TASK_SEM_WO", `${t.id} não declara WO`);
  } else if (!woIds.has(t.wo)) {
    add("TASK_WO_INEXISTENTE", `${t.id} aponta para ${t.wo}, ausente em ${REL.queue}`);
  }
}

/* ---------- regra 2: WO ativa sem task ---------- */
const tasksByWo = new Map();
for (const t of tasks) {
  if (!t.wo) continue;
  if (!tasksByWo.has(t.wo)) tasksByWo.set(t.wo, []);
  tasksByWo.get(t.wo).push(t.id);
}
for (const w of wos) {
  const status = w.status ?? "";
  if (!OPEN_WO_STATUS.has(status)) continue;
  const covered = tasksByWo.get(w.id) ?? [];
  const active = covered.filter((id) => {
    const t = taskById.get(id);
    return t && !CLOSED_TASK_STATUS.has(t.status);
  });
  if (!active.length) {
    add("WO_SEM_TASK", `${w.id} (${status}) não tem task ativa no plano`);
  }
}

/* ---------- regra 3: pendência órfã ---------- */
for (const p of pending) {
  const covered = tasks.some((t) => {
    // Superseded/cancelled tasks cannot discharge live pendencies.
    // A task without a valid WO is never authoritative coverage.
    if (CLOSED_TASK_STATUS.has(t.status) || !woIds.has(t.wo)) return false;
    const covers = Array.isArray(t.covers) ? t.covers : [];
    return p.aliases.some((a) => covers.includes(a)) || covers.includes(`${p.group}:${p.id}`);
  });
  // A WO declarada no inventário não é prova de existência de TASK válida.
  // Um vínculo arbitrário de WO nunca dispensa a cobertura da pendência por task ativa.
  if (!covered) {
    add("PENDENCIA_ORFA", `${p.group}:${p.id} "${p.title.slice(0, 70)}" não possui TASK ativa de cobertura`);
  }
  const declaredWo = p.wo && p.wo !== "UNRECONCILED" ? p.wo : null;
  if (declaredWo && !woIds.has(declaredWo)) {
    add("PENDENCIA_WO_INEXISTENTE", `${p.group}:${p.id} declara WO ${declaredWo} ausente da fila`);
  }
}

/* ---------- regra 4: WO DONE sem evidência ---------- */
for (const w of wos) {
  if ((w.status ?? "") !== "DONE") continue;
  const evidence = Array.isArray(w.evidence) ? w.evidence : [];
  if (!evidence.length) add("DONE_SEM_EVIDENCIA", `${w.id} está DONE sem evidência`);
}

/* ---------- regra 5: task executada sem artefato ---------- */
for (const t of tasks) {
  const status = t.status ?? "";
  if (status === "DONE" || status === "IN_PROGRESS") {
    const artifacts = Array.isArray(t.artifacts) ? t.artifacts : [];
    if (!artifacts.length) add("TASK_SEM_ARTEFATO", `${t.id} está ${status} sem artefato registrado`);
  }
}

/* ---------- regra 6: lacunas de cobertura abertas ---------- */
for (const gap of intake.coverageGaps ?? []) {
  if ((gap.status ?? "") === "OPEN") {
    add("GAP_ABERTO", `${gap.id}: ${gap.description}`);
  }
}

/* ---------- relatório ---------- */
const counts = violations.reduce((acc, v) => ((acc[v.code] = (acc[v.code] ?? 0) + 1), acc), {});
console.log(
  `[check-pending-coverage] ${wos.length} WOs · ${tasks.length} tasks · ${pending.length} pendências · ${(intake.coverageGaps ?? []).length} gaps`,
);
if (!violations.length) {
  console.log("[check-pending-coverage] OK — cobertura integral sem violações.");
  process.exit(0);
}
console.error(`[check-pending-coverage] ${violations.length} violação(ões):`);
for (const [code, n] of Object.entries(counts)) console.error(`  ${code}: ${n}`);
for (const v of violations) console.error(`  - ${v.code}: ${v.detail}`);
process.exit(1);
