#!/usr/bin/env node
/**
 * Testes negativos do gate de cobertura de pendências.
 *
 * Rodar:  node --test scripts/check-pending-coverage.test.mjs
 *
 * O contrato testado é o do gate em modo fail-closed: entrada presente e
 * incompleta ⇒ saída 1 com o código de violação esperado.
 * Entrada ausente ⇒ saída 0 com SKIP declarado (ausência não é aprovação,
 * a ativação do gate é a task T1.3, dependente de T0.2).
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(HERE, "check-pending-coverage.mjs");

function writeTree(root, files) {
  for (const [rel, content] of Object.entries(files)) {
    const p = join(root, rel);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, typeof content === "string" ? content : JSON.stringify(content, null, 2));
  }
}

function run(root) {
  try {
    const out = execFileSync(process.execPath, [SCRIPT, "--root", root], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status ?? 1, out: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
}

const QUEUE = {
  schemaVersion: 1,
  revision: 20,
  items: [
    { id: "WO-ADM-001", status: "IN_PROGRESS", title: "Administração local — Commander", dependencies: [], evidence: ["https://github.com/IndiciumFIN/dev-chatgpt-workspace/commit/1ab0561"] },
    { id: "WO-SEC-001", status: "IN_PROGRESS", title: "Segurança", dependencies: [], evidence: [] },
    { id: "WO-PMO-001", status: "DONE", title: "PMO visível", dependencies: [], evidence: [] },
  ],
};

const PLAN = {
  schemaVersion: 1,
  tasks: [
    { id: "TASK-PLAN-001", wo: "WO-ADM-001", status: "PROPOSTO", covers: [], artifacts: [] },
    { id: "TASK-PLAN-002", wo: "WO-SEC-001", status: "PROPOSTO", covers: [], artifacts: [] },
  ],
};

const INTAKE = {
  schemaVersion: 1,
  simulados: [{ id: "P0-04", title: "Public grading RPCs reveal answers", status: "SECURITY_FIND", wo: "UNRECONCILED" }],
  openIssues: [{ id: "GH-25", title: "Reconciliar cobertura", state: "OPEN", wo: "UNRECONCILED" }],
  coverageGaps: [],
};

function tmp() {
  return mkdtempSync(join(tmpdir(), "pmo-coverage-"));
}

test("SKIP declarado quando o inventário ainda não aterrissou (ausência ≠ aprovação)", () => {
  const root = tmp();
  try {
    writeTree(root, { "registers/pmo/queue.v1.json": QUEUE, "docs/PLAN-TASKS-PMOKERNEL-v0.1.0.json": PLAN });
    const r = run(root);
    assert.equal(r.code, 0);
    assert.match(r.out, /SKIP/);
    assert.match(r.out, /T0\.2/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("violação: pendência órfã (sem task e sem WO) falha fechado", () => {
  const root = tmp();
  try {
    writeTree(root, {
      "registers/pmo/queue.v1.json": QUEUE,
      "registers/pmo/cross-source-pending-intake.v1.json": INTAKE,
      "docs/PLAN-TASKS-PMOKERNEL-v0.1.0.json": PLAN,
    });
    const r = run(root);
    assert.equal(r.code, 1);
    assert.match(r.out, /PENDENCIA_ORFA/);
    assert.match(r.out, /GH-25/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("violação: WO ativa sem task falha fechado", () => {
  const root = tmp();
  try {
    const plan = { ...PLAN, tasks: [PLAN.tasks[0]] };
    writeTree(root, {
      "registers/pmo/queue.v1.json": QUEUE,
      "registers/pmo/cross-source-pending-intake.v1.json": { ...INTAKE, simulados: [], openIssues: [] },
      "docs/PLAN-TASKS-PMOKERNEL-v0.1.0.json": plan,
    });
    const r = run(root);
    assert.equal(r.code, 1);
    assert.match(r.out, /WO_SEM_TASK/);
    assert.match(r.out, /WO-SEC-001/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("violação: task apontando para WO inexistente falha fechado", () => {
  const root = tmp();
  try {
    const plan = { ...PLAN, tasks: [{ id: "TASK-PLAN-009", wo: "WO-NAO-EXISTE", status: "PROPOSTO", covers: [], artifacts: [] }] };
    writeTree(root, {
      "registers/pmo/queue.v1.json": QUEUE,
      "registers/pmo/cross-source-pending-intake.v1.json": { ...INTAKE, simulados: [], openIssues: [] },
      "docs/PLAN-TASKS-PMOKERNEL-v0.1.0.json": plan,
    });
    const r = run(root);
    assert.equal(r.code, 1);
    assert.match(r.out, /TASK_WO_INEXISTENTE/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("violação: WO DONE sem evidência falha fechado", () => {
  const root = tmp();
  try {
    writeTree(root, {
      "registers/pmo/queue.v1.json": QUEUE,
      "registers/pmo/cross-source-pending-intake.v1.json": { ...INTAKE, simulados: [], openIssues: [] },
      "docs/PLAN-TASKS-PMOKERNEL-v0.1.0.json": PLAN,
    });
    const r = run(root);
    assert.equal(r.code, 1);
    assert.match(r.out, /DONE_SEM_EVIDENCIA/);
    assert.match(r.out, /WO-PMO-001/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("violação: lacuna de cobertura aberta falha fechado", () => {
  const root = tmp();
  try {
    writeTree(root, {
      "registers/pmo/queue.v1.json": QUEUE,
      "registers/pmo/cross-source-pending-intake.v1.json": { ...INTAKE, simulados: [], openIssues: [], coverageGaps: [{ id: "GAP-03", description: "cobertura não comprovada", status: "OPEN" }] },
      "docs/PLAN-TASKS-PMOKERNEL-v0.1.0.json": PLAN,
    });
    const r = run(root);
    assert.equal(r.code, 1);
    assert.match(r.out, /GAP_ABERTO/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("verde: cobertura completa, task ativa com artefato e sem gaps", () => {
  const root = tmp();
  try {
    const plan = {
      schemaVersion: 1,
      tasks: [
        { id: "TASK-PLAN-001", wo: "WO-ADM-001", status: "IN_PROGRESS", covers: ["GH-25"], artifacts: ["docs/PLAN-PMOKERNEL-FINALIZATION-v0.1.0.md"] },
        { id: "TASK-PLAN-002", wo: "WO-SEC-001", status: "PROPOSTO", covers: ["simulados:P0-04"], artifacts: [] },
        { id: "TASK-PLAN-003", wo: "WO-PMO-001", status: "DONE", covers: [], artifacts: ["registers/pmo/queue.v1.json"] },
      ],
    };
    const queue = { ...QUEUE, items: QUEUE.items.map((w) => (w.id === "WO-PMO-001" ? { ...w, evidence: ["https://github.com/IndiciumFIN/dev-chatgpt-workspace/commit/1ab0561"] } : w)) };
    writeTree(root, {
      "registers/pmo/queue.v1.json": queue,
      "registers/pmo/cross-source-pending-intake.v1.json": INTAKE,
      "docs/PLAN-TASKS-PMOKERNEL-v0.1.0.json": plan,
    });
    const r = run(root);
    assert.equal(r.code, 0, r.out);
    assert.match(r.out, /OK/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("aceita o formato antigo de issue ({number}) sem criar falso verde", () => {
  const root = tmp();
  try {
    writeTree(root, {
      "registers/pmo/queue.v1.json": QUEUE,
      "registers/pmo/cross-source-pending-intake.v1.json": { ...INTAKE, openIssues: [{ number: 25, title: "Reconciliar cobertura", state: "OPEN" }] },
      "docs/PLAN-TASKS-PMOKERNEL-v0.1.0.json": PLAN,
    });
    const r = run(root);
    assert.equal(r.code, 1);
    assert.match(r.out, /PENDENCIA_ORFA/);
    assert.match(r.out, /ISSUE-25/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("nao Creates falso verde: task que cobre outra issue não cobre a pendencia", () => {
  const root = tmp();
  try {
    const plan = { ...PLAN, tasks: [{ id: "TASK-PLAN-001", wo: "WO-ADM-001", status: "IN_PROGRESS", covers: ["GH-24"], artifacts: ["x.md"] }] };
    writeTree(root, {
      "registers/pmo/queue.v1.json": QUEUE,
      "registers/pmo/cross-source-pending-intake.v1.json": INTAKE,
      "docs/PLAN-TASKS-PMOKERNEL-v0.1.0.json": plan,
    });
    const r = run(root);
    assert.equal(r.code, 1);
    assert.match(r.out, /PENDENCIA_ORFA/);
    assert.match(r.out, /GH-25/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
