import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, cpSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const SCRIPT = resolve("scripts/check-contract-integrity.mjs");
const SOURCES = "contracts/entities/tool-sources.v1.json";
const BINDINGS = "contracts/entities/tool-bindings.v1.json";
const ENUM_FILE = "contracts/cko-skeleton/catalog/cko-data.json";

/**
 * Sandbox isolado com contratos CONFORMES sinteticos.
 * Os testes do portao nao dependem do estado actual do repo (que hoje e
 * violador por desenho): o portao e testado contra um estado bom e contra
 * mutacoes desse estado bom.
 */
const CONFORM_SOURCES = {
  schemaVersion: 1,
  items: [
    {
      canonical_id: "SRC-TESTE-01",
      source_type: "REGULATOR",
      title: "Fonte de teste",
      status: "SOURCE_QUALIFIED",
      integrity: { sha256: "NOT_AVAILABLE", reason: "fixture de teste, sem artefacto", artifact_ref: null, snapshot_ref: "PENDING_SNAPSHOT" }
    },
    {
      canonical_id: "SRC-TESTE-02",
      source_type: "PRIMARY_STUDY",
      title: "Fonte de teste 2",
      status: "SOURCE_QUALIFIED",
      integrity: { sha256: "NOT_AVAILABLE", reason: "fixture de teste, sem artefacto", artifact_ref: null, snapshot_ref: "PENDING_SNAPSHOT" }
    }
  ]
};
const CONFORM_BINDINGS = {
  schemaVersion: 1,
  items: [
    {
      canonical_id: "AB-TESTE-01",
      status: "HOLD_HUMAN",
      decision: "HOLD_HUMAN",
      authority_class: "CLINICAL_EVIDENCE",
      source_ids: ["SRC-TESTE-01"],
      validator_ids: [],
      evidence_bundle_ids: []
    },
    {
      canonical_id: "FD-TESTE-01",
      status: "HOLD_HUMAN",
      field_path: "tool.teste.criteria.x",
      semantic_concept_ref: "MD-X",
      value_type: "ORDINAL_SCORE",
      authority_binding_ref: "AB-TESTE-01",
      privacy_policy: "NOT_APPLICABLE",
      applicability_ref: "POP-ADULTO-GERAL"
    }
  ]
};

function sandbox() {
  const root = mkdtempSync(join(tmpdir(), "contract-integrity-"));
  for (const rel of [SOURCES, BINDINGS, ENUM_FILE]) {
    mkdirSync(join(root, rel, ".."), { recursive: true });
  }
  cpSync(ENUM_FILE, join(root, ENUM_FILE));
  writeFileSync(join(root, SOURCES), JSON.stringify(CONFORM_SOURCES, null, 1));
  writeFileSync(join(root, BINDINGS), JSON.stringify(CONFORM_BINDINGS, null, 1));
  return root;
}

function run(root) {
  return spawnSync(process.execPath, [SCRIPT, "--root", root], { encoding: "utf8", timeout: 20000 });
}

function read(root, rel) {
  return JSON.parse(readFileSync(join(root, rel), "utf8"));
}
function write(root, rel, data) {
  writeFileSync(join(root, rel), JSON.stringify(data, null, 1));
}

function mutate(root, rel, fn) {
  const doc = read(root, rel);
  fn(doc);
  write(root, rel, doc);
}

test("estado conforme: o portão passa", () => {
  const root = sandbox();
  try {
    const r = run(root);
    assert.equal(r.status, 0, `esperava PASS, obtive:\n${r.stderr || r.stdout}`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R3 — sha256 de 64 zeros reprova e nomeia o item", () => {
  const root = sandbox();
  try {
    mutate(root, SOURCES, (d) => { d.items[0].integrity.sha256 = "0".repeat(64); });
    const r = run(root);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /\[R3\]/);
    assert.match(r.stderr, /64 zeros/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R2 — NOT_AVAILABLE sem motivo reprova", () => {
  const root = sandbox();
  try {
    mutate(root, SOURCES, (d) => {
      d.items[0].integrity.sha256 = "NOT_AVAILABLE";
      delete d.items[0].integrity.reason;
    });
    const r = run(root);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /\[R2\].*motivo|integrity\.reason/s);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R1 — source_type fora do enum reprova", () => {
  const root = sandbox();
  try {
    mutate(root, SOURCES, (d) => { d.items[0].source_type = "NORMATIVA"; });
    const r = run(root);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /\[R1\]/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R4 — authority_class ausente reprova (ausência não é imputação)", () => {
  const root = sandbox();
  try {
    mutate(root, BINDINGS, (d) => { delete d.items[0].authority_class; });
    const r = run(root);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /\[R4\].*authority_class/s);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R5 — decision fora do enum reprova", () => {
  const root = sandbox();
  try {
    mutate(root, BINDINGS, (d) => { d.items[0].decision = "BOUND"; });
    const r = run(root);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /\[R5\]/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R6 — decision HOLD_HUMAN com status EVIDENCE_BOUND reprova (contradição)", () => {
  const root = sandbox();
  try {
    mutate(root, BINDINGS, (d) => {
      d.items[0].decision = "HOLD_HUMAN";
      d.items[0].status = "EVIDENCE_BOUND";
    });
    const r = run(root);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /\[R6\].*contraditório/s);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R6 — decision ALLOW sem validator_ids reprova", () => {
  const root = sandbox();
  try {
    mutate(root, BINDINGS, (d) => {
      d.items[0].decision = "ALLOW";
      d.items[0].validator_ids = [];
      d.items[0].evidence_bundle_ids = [];
    });
    const r = run(root);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /\[R6\].*validator_ids/s);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R7 — source_id inexistente reprova (integridade referencial)", () => {
  const root = sandbox();
  try {
    mutate(root, BINDINGS, (d) => { d.items[0].source_ids = ["SRC-NAO-EXISTE"]; });
    const r = run(root);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /\[R7\]/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R8 — autoridade não-INTERNAL sem source_ids reprova", () => {
  const root = sandbox();
  try {
    mutate(root, BINDINGS, (d) => {
      d.items[0].authority_class = "CLINICAL_EVIDENCE";
      d.items[0].source_ids = [];
    });
    const r = run(root);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /\[R8\]/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R9 — sha256 real sem artefacto no disco reprova", () => {
  const root = sandbox();
  try {
    mutate(root, SOURCES, (d) => {
      d.items[0].integrity.sha256 = "a".repeat(64);
      d.items[0].integrity.artifact_ref = "docs/evidence/nao-existe.pdf";
    });
    const r = run(root);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /\[R9\]/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("lista vazia de fontes reprova (um gate que passa em vazio não é gate)", () => {
  const root = sandbox();
  try {
    mutate(root, SOURCES, (d) => { d.items = []; });
    const r = run(root);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /REPROVADO/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R4 — field_definition com authority_class IMPUTADA reprova", () => {
  const root = sandbox();
  try {
    mutate(root, BINDINGS, (d) => { d.items[1].authority_class = "INTERNAL_NONCLINICAL"; });
    const r = run(root);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /\[R4\].*imputada/s);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R4 — field_definition com decision IMPUTADA reprova", () => {
  const root = sandbox();
  try {
    mutate(root, BINDINGS, (d) => { d.items[1].decision = "HOLD_HUMAN"; });
    const r = run(root);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /\[R5\]/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R7 — field_definition com authority_binding_ref quebrada reprova", () => {
  const root = sandbox();
  try {
    mutate(root, BINDINGS, (d) => { d.items[1].authority_binding_ref = "AB-NAO-EXISTE"; });
    const r = run(root);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /\[R7\].*authority_binding_ref/s);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R12 — status fora do enum canonico reprova", () => {
  const root = sandbox();
  try {
    mutate(root, BINDINGS, (d) => { d.items[0].status = "HOLD"; });
    const r = run(root);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /\[R12\]/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R12 — status EVIDENCE_BOUND sem evidence_bundle_ids reprova", () => {
  const root = sandbox();
  try {
    mutate(root, BINDINGS, (d) => {
      d.items[0].status = "EVIDENCE_BOUND";
      d.items[0].evidence_bundle_ids = [];
    });
    const r = run(root);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /\[R12\].*evidence_bundle_ids/s);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
