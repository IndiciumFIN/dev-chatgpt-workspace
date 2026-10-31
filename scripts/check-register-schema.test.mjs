#!/usr/bin/env node
/**
 * Testes negativos do validador de schema do inventário.
 *
 *   node --test scripts/check-register-schema.test.mjs
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(HERE, "check-register-schema.mjs");
const REL = "registers/pmo/cross-source-pending-intake.v1.json";

const VALID = {
  schemaVersion: 1,
  registerId: "CE-CROSS-SOURCE-PENDING-INTAKE",
  snapshotDate: "2026-10-31",
  scope: "IndiciumFIN/dev-chatgpt-workspace",
  completeness: "NOT_VERIFIED",
  policy: "Do not infer closure or Kernel admission from source snapshot; reconcile records and preserve HOLD.",
  sourceSnapshots: {
    pmo: { branch: "fix/governed-activities-cli-20261026", revision: 20, file: "registers/pmo/queue.v1.json" },
    simulados: { branch: "simulados-enfermagem-db-canonico", file: "docs/x.json" },
    issues: { query: "repo:IndiciumFIN/dev-chatgpt-workspace is:issue is:open", observedCount: 1 },
  },
  pmo: [
    { id: "WO-ADM-001", title: "Commander", status: "IN_PROGRESS", priority: "P1", dependencies: [], evidenceCount: 1 },
    { id: "WO-HOM-001", title: "Homologação", status: "HOLD_HUMAN", priority: "P0", dependencies: [], evidenceCount: 0 },
  ],
  simulados: [{ id: "P0-04", title: "RPCs públicas", status: "SECURITY_FIND", wo: "UNRECONCILED", sourceBranch: "simulados" }],
  openIssues: [{ id: "GH-25", title: "Cobertura", url: "https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/25", state: "OPEN", wo: "UNRECONCILED", admission: "NOT_VERIFIED" }],
  coverageGaps: [{ id: "GAP-01", description: "Mapeamento de issue e pendência para WO não verificado", status: "OPEN" }],
  releaseGate: "HOLD_HUMAN",
};

function tmp() {
  return mkdtempSync(join(tmpdir(), "register-schema-"));
}
function writeRegister(root, doc) {
  const p = join(root, REL);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(doc, null, 2));
}
function run(root) {
  try {
    const out = execFileSync(process.execPath, [SCRIPT, "--root", root], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status ?? 1, out: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
}

test("SKIP declarado quando o inventario ainda não aterrissou", () => {
  const root = tmp();
  try {
    const r = run(root);
    assert.equal(r.code, 0);
    assert.match(r.out, /SKIP/);
    assert.match(r.out, /T0\.005/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("registro válido passa", () => {
  const root = tmp();
  try {
    writeRegister(root, VALID);
    const r = run(root);
    assert.equal(r.code, 0, r.out);
    assert.match(r.out, /OK/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("id duplicado reprova", () => {
  const root = tmp();
  try {
    const doc = structuredClone(VALID);
    doc.simulados.push({ id: "P0-04", title: "dup", status: "HOLD", wo: "UNRECONCILED" });
    writeRegister(root, doc);
    const r = run(root);
    assert.equal(r.code, 1);
    assert.match(r.out, /ID_DUPLICADO/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("WO desconhecida reprova", () => {
  const root = tmp();
  try {
    const doc = structuredClone(VALID);
    doc.openIssues[0].wo = "WO-NAO-EXISTE";
    writeRegister(root, doc);
    const r = run(root);
    assert.equal(r.code, 1);
    assert.match(r.out, /WO_DESCONHECIDA/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("coerência completeness x releaseGate reprova", () => {
  const root = tmp();
  try {
    const doc = structuredClone(VALID);
    doc.completeness = "NOT_VERIFIED";
    doc.releaseGate = "RELEASED";
    writeRegister(root, doc);
    const r = run(root);
    assert.equal(r.code, 1);
    assert.match(r.out, /COERENCIA/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("campo obrigatório ausente reprova", () => {
  const root = tmp();
  try {
    const doc = structuredClone(VALID);
    delete doc.sourceSnapshots;
    writeRegister(root, doc);
    const r = run(root);
    assert.equal(r.code, 1);
    assert.match(r.out, /SNAPSHOT/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("url de issue fora do repositório reprova", () => {
  const root = tmp();
  try {
    const doc = structuredClone(VALID);
    doc.openIssues[0].url = "https://exemplo.com/issues/1";
    writeRegister(root, doc);
    const r = run(root);
    assert.equal(r.code, 1);
    assert.match(r.out, /URL/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("coleção de issues omitida não pode resultar em falso verde", () => {
  const root = tmp();
  try {
    const doc = structuredClone(VALID);
    delete doc.openIssues;
    writeRegister(root, doc);
    const result = run(root);
    assert.equal(result.code, 1, result.out);
    assert.match(result.out, /COLECAO_AUSENTE/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("contagem de issues divergente do snapshot reprova", () => {
  const root = tmp();
  try {
    const doc = structuredClone(VALID);
    doc.sourceSnapshots.issues.observedCount = 18;
    writeRegister(root, doc);
    const result = run(root);
    assert.equal(result.code, 1, result.out);
    assert.match(result.out, /SNAPSHOT_CONTAGEM/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("GH-id divergente do número na URL reprova", () => {
  const root = tmp();
  try {
    const doc = structuredClone(VALID);
    doc.openIssues[0].id = "GH-24";
    writeRegister(root, doc);
    const result = run(root);
    assert.equal(result.code, 1, result.out);
    assert.match(result.out, /ISSUE_IDENTIDADE/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
