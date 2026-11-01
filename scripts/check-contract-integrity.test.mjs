#!/usr/bin/env node
/**
 * Testes do portão de integridade dos contratos.
 *
 * Regra de desenho dos testes: **assinam códigos, não prosa.** Um teste que
 * assina `/\[R6\].*contraditório/` passa hoje e falha amanhã por causa de uma
 * palavra ou de um acento. Cada teste assina o código estável `[RULE.SUB]`.
 *
 *   node --test scripts/check-contract-integrity.test.mjs
 *
 * Os fixtures são sintéticos e não dependem do estado do repo: um portão que
 * só passa porque o dado do repo está bom não é um portão.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..");
const GATE = join(HERE, "check-contract-integrity.mjs");

/* ── catálogo canónico mínimo (enums verdadeiros, lidos do contrato real) ── */
const CATALOG = {
  schemaVersion: 1,
  contracts: [
    {
      id: "source",
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["schema_version", "canonical_id", "version", "status", "updated_at", "provenance_refs",
          "source_type", "title", "authority", "locator", "rights", "jurisdiction", "retrieved_at", "integrity"],
        properties: {
          schema_version: { type: "string" },
          canonical_id: { type: "string" },
          version: { type: "string" },
          status: { type: "string", enum: ["CANDIDATE", "DRAFT", "SOURCE_QUALIFIED", "EVIDENCE_BOUND", "REVIEW_REQUIRED", "HOLD_HUMAN", "ASSURED", "ELIGIBLE_FOR_RELEASE", "RELEASED", "RETIRED"] },
          updated_at: { type: "string" },
          provenance_refs: { type: "array", items: { type: "string" } },
          source_type: { type: "string", enum: ["OFFICIAL_LAW", "REGULATOR", "STANDARD", "TERMINOLOGY", "PRIMARY_STUDY", "GUIDELINE", "TEXTBOOK", "DATASET_API", "SOFTWARE", "IMAGE", "INTERNAL_GOVERNED"] },
          title: { type: "string", minLength: 1 },
          authority: { type: "string", minLength: 1 },
          locator: {
            type: "object",
            required: ["uri", "pinpoint"],
            properties: { uri: { type: "string" }, pinpoint: { type: "string", minLength: 1 } },
            additionalProperties: false
          },
          rights: { type: "string", enum: ["UNKNOWN", "PERMITTED", "RESTRICTED", "LICENSED", "PUBLIC_DOMAIN", "NOT_APPLICABLE"] },
          jurisdiction: { type: "string", minLength: 1 },
          retrieved_at: { type: "string" },
          language: { type: "string" },
          effective_from: { type: "string" },
          license_ref: { type: "string" },
          integrity: {
            type: "object",
            required: ["sha256", "snapshot_ref"],
            properties: {
              sha256: { type: "string", pattern: "^[a-f0-9]{64}$" },
              snapshot_ref: { type: "string", minLength: 1 }
            },
            additionalProperties: false
          }
        }
      }
    },
    {
      id: "authority_binding",
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["schema_version", "canonical_id", "version", "status", "updated_at", "provenance_refs",
          "authority_class", "decision", "field_path", "source_ids", "validator_ids", "evidence_bundle_ids"],
        properties: {
          schema_version: { type: "string" },
          canonical_id: { type: "string" },
          version: { type: "string" },
          status: { type: "string", enum: ["CANDIDATE", "DRAFT", "SOURCE_QUALIFIED", "EVIDENCE_BOUND", "REVIEW_REQUIRED", "HOLD_HUMAN", "ASSURED", "ELIGIBLE_FOR_RELEASE", "RELEASED", "RETIRED"] },
          updated_at: { type: "string" },
          provenance_refs: { type: "array", items: { type: "string" } },
          authority_class: { type: "string", enum: ["REGULATORY", "TECHNICAL_STANDARD", "AUTHORITATIVE_TERMINOLOGY", "CLINICAL_EVIDENCE", "INTERNAL_NONCLINICAL"] },
          decision: { type: "string", enum: ["ALLOW", "HOLD_HUMAN", "REJECT", "NOT_APPLICABLE_JUSTIFIED"] },
          field_path: { type: "string", minLength: 1 },
          source_ids: { type: "array", items: { type: "string" } },
          validator_ids: { type: "array", items: { type: "string" } },
          evidence_bundle_ids: { type: "array", items: { type: "string" } },
          requirement_id: { type: "string" },
          exception_reason: { type: "string" }
        }
      }
    },
    {
      id: "field_definition",
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["schema_version", "canonical_id", "version", "status", "updated_at", "provenance_refs",
          "field_path", "authority_binding_ref", "semantic_concept_ref", "value_type"],
        properties: {
          schema_version: { type: "string" },
          canonical_id: { type: "string" },
          version: { type: "string" },
          status: { type: "string", enum: ["CANDIDATE", "DRAFT", "SOURCE_QUALIFIED", "EVIDENCE_BOUND", "REVIEW_REQUIRED", "HOLD_HUMAN", "ASSURED", "ELIGIBLE_FOR_RELEASE", "RELEASED", "RETIRED"] },
          updated_at: { type: "string" },
          provenance_refs: { type: "array", items: { type: "string" } },
          field_path: { type: "string", minLength: 1 },
          authority_binding_ref: { type: "string", minLength: 1 },
          semantic_concept_ref: { type: "string" },
          value_type: { type: "string" },
          privacy_policy: { type: "string" }
        }
      }
    }
  ]
};

const CONTEUDO_ARTEFACTO_DE_TESTE = "conteudo de teste\n";
const SHA_DO_ARTEFACTO_DE_TESTE = createHash("sha256").update(CONTEUDO_ARTEFACTO_DE_TESTE).digest("hex");

const CONFORM_SOURCE = {
  schema_version: "0.1.0",
  canonical_id: "SRC-TESTE-01",
  version: "1.0.0",
  status: "REVIEW_REQUIRED",
  updated_at: "2026-11-01",
  provenance_refs: ["SRC-CKO-POL-UT-001"],
  source_type: "PRIMARY_STUDY",
  title: "Fonte de teste",
  authority: "Editor de teste",
  locator: { uri: "https://exemplo.test/doc", pinpoint: "p. 1" },
  rights: "PUBLIC_DOMAIN",
  jurisdiction: "BR",
  retrieved_at: "2026-11-01",
  integrity: {
    // o hash é o do artefacto que o sandbox escreve — o portão recalcula e compara
    sha256: SHA_DO_ARTEFACTO_DE_TESTE,
    snapshot_ref: "docs/evidence/teste/fonte.pdf"
  }
};

const CONFORM_BINDING = {
  schema_version: "0.1.0",
  canonical_id: "AB-TESTE-01",
  version: "1.0.0",
  status: "HOLD_HUMAN",
  updated_at: "2026-11-01",
  provenance_refs: ["SRC-TESTE-01"],
  authority_class: "CLINICAL_EVIDENCE",
  decision: "HOLD_HUMAN",
  field_path: "tool.teste.criterio.x",
  source_ids: ["SRC-TESTE-01"],
  validator_ids: [],
  evidence_bundle_ids: []
};

const CONFORM_FIELD = {
  schema_version: "0.1.0",
  canonical_id: "FD-TESTE-01",
  version: "1.0.0",
  status: "HOLD_HUMAN",
  updated_at: "2026-11-01",
  provenance_refs: ["AB-TESTE-01"],
  field_path: "tool.teste.criterio.x",
  authority_binding_ref: "AB-TESTE-01",
  semantic_concept_ref: "MD-X",
  value_type: "ORDINAL_SCORE"
};

/* ── sandbox ───────────────────────────────────────────────────────────── */
function sandbox() {
  const root = mkdtempSync(join(tmpdir(), "gate-int-"));
  mkdirSync(join(root, "contracts/cko-skeleton/catalog"), { recursive: true });
  mkdirSync(join(root, "contracts/entities"), { recursive: true });
  mkdirSync(join(root, "docs/evidence/teste"), { recursive: true });
  writeFileSync(join(root, "contracts/cko-skeleton/catalog/cko-data.json"), JSON.stringify(CATALOG, null, 2));
  writeFileSync(join(root, "docs/evidence/teste/fonte.pdf"), CONTEUDO_ARTEFACTO_DE_TESTE);
  return root;
}

function writeSources(root, items) {
  writeFileSync(join(root, "contracts/entities/tool-sources.v1.json"),
    JSON.stringify({ schemaVersion: 1, items }, null, 2));
}

function writeBindings(root, items) {
  writeFileSync(join(root, "contracts/entities/tool-bindings.v1.json"),
    JSON.stringify({ schemaVersion: 1, items }, null, 2));
}

function run(root, extra = []) {
  const r = spawnSync(process.execPath, [GATE, "--root", root, ...extra], { encoding: "utf8" });
  return { status: r.status, stdout: r.stdout || "", stderr: r.stderr || "" };
}

function json(root, extra = []) {
  const r = run(root, ["--json", ...extra]);
  try {
    return { ...r, data: JSON.parse(r.stdout) };
  } catch {
    return { ...r, data: null };
  }
}

const clone = (o) => JSON.parse(JSON.stringify(o));

/* ── testes ────────────────────────────────────────────────────────────── */

test("estado conforme: o portão passa", () => {
  const root = sandbox();
  try {
    writeSources(root, [clone(CONFORM_SOURCE)]);
    writeBindings(root, [clone(CONFORM_BINDING), clone(CONFORM_FIELD)]);
    const r = run(root);
    assert.equal(r.status, 0, `esperava PASS, obtive:\n${r.stderr}`);
    assert.match(r.stdout, /PASS contratos/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("estado conforme: o portão não deixa passar um sha256 que não é o do artefacto", () => {
  const root = sandbox();
  try {
    const src = clone(CONFORM_SOURCE);
    src.integrity.sha256 = "b".repeat(64); // ≠ hash recalculado do artefacto em disco
    writeSources(root, [src]);
    writeBindings(root, [clone(CONFORM_BINDING)]);
    const r = json(root);
    assert.equal(r.status, 1);
    assert.ok(r.data.violations.some((v) => v.rule === "R9.HASH_MISMATCH"),
      "esperava R9.HASH_MISMATCH: hash declarado ≠ hash recalculado");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R9.ARTEFACT_MISSING — hash real sem artefacto no disco reprova", () => {
  const root = sandbox();
  try {
    const src = clone(CONFORM_SOURCE);
    src.integrity.snapshot_ref = "docs/evidence/teste/nao-existe.pdf";
    writeSources(root, [src]);
    writeBindings(root, [clone(CONFORM_BINDING)]);
    const r = json(root);
    assert.equal(r.status, 1);
    assert.ok(r.data.violations.some((v) => v.rule === "R9.ARTEFACT_MISSING"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R2.SHA256_NOT_REPRESENTABLE — NOT_AVAILABLE reprova (o contrato não tem esse estado)", () => {
  const root = sandbox();
  try {
    const src = clone(CONFORM_SOURCE);
    src.integrity.sha256 = "NOT_AVAILABLE";
    writeSources(root, [src]);
    writeBindings(root, [clone(CONFORM_BINDING)]);
    const r = json(root);
    assert.equal(r.status, 1);
    assert.ok(r.data.violations.some((v) => v.rule === "R2.SHA256_NOT_REPRESENTABLE"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R2.SHA256_ZEROS — 64 zeros reprova sempre", () => {
  const root = sandbox();
  try {
    const src = clone(CONFORM_SOURCE);
    src.integrity.sha256 = "0".repeat(64);
    writeSources(root, [src]);
    writeBindings(root, [clone(CONFORM_BINDING)]);
    const r = json(root);
    assert.equal(r.status, 1);
    assert.ok(r.data.violations.some((v) => v.rule === "R2.SHA256_ZEROS"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R3.SNAPSHOT_REF — placeholder reprova", () => {
  const root = sandbox();
  try {
    const src = clone(CONFORM_SOURCE);
    src.integrity.snapshot_ref = "PENDING_SNAPSHOT";
    writeSources(root, [src]);
    writeBindings(root, [clone(CONFORM_BINDING)]);
    const r = json(root);
    assert.equal(r.status, 1);
    assert.ok(r.data.violations.some((v) => v.rule === "R3.SNAPSHOT_REF"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R13.PROPERTY_NOT_IN_CONTRACT — propriedade fora do contrato reprova", () => {
  const root = sandbox();
  try {
    const src = clone(CONFORM_SOURCE);
    src.citacao = "citação que o contrato não tem";
    writeSources(root, [src]);
    writeBindings(root, [clone(CONFORM_BINDING)]);
    const r = json(root);
    assert.equal(r.status, 1);
    assert.ok(r.data.violations.some((v) => v.rule === "R13.PROPERTY_NOT_IN_CONTRACT"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R13.REQUIRED_MISSING — campo exigido pelo contrato e ausente reprova", () => {
  const root = sandbox();
  try {
    const src = clone(CONFORM_SOURCE);
    delete src.jurisdiction;
    writeSources(root, [src]);
    writeBindings(root, [clone(CONFORM_BINDING)]);
    const r = json(root);
    assert.equal(r.status, 1);
    assert.ok(r.data.violations.some((v) => v.rule === "R13.REQUIRED_MISSING"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R1.SOURCE_TYPE — valor fora do enum canónico reprova", () => {
  const root = sandbox();
  try {
    const src = clone(CONFORM_SOURCE);
    src.source_type = "NORMATIVA";
    writeSources(root, [src]);
    writeBindings(root, [clone(CONFORM_BINDING)]);
    const r = json(root);
    assert.equal(r.status, 1);
    assert.ok(r.data.violations.some((v) => v.rule === "R1.SOURCE_TYPE"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R4.AUTHORITY_CLASS — ausente reprova (ausência não é imputação)", () => {
  const root = sandbox();
  try {
    const b = clone(CONFORM_BINDING);
    delete b.authority_class;
    writeSources(root, [clone(CONFORM_SOURCE)]);
    writeBindings(root, [b]);
    const r = json(root);
    assert.equal(r.status, 1);
    assert.ok(r.data.violations.some((v) => v.rule === "R4.AUTHORITY_CLASS"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R4.AUTHORITY_CLASS — field_definition com authority_class IMPUTADA reprova", () => {
  const root = sandbox();
  try {
    const f = clone(CONFORM_FIELD);
    f.authority_class = "INTERNAL_NONCLINICAL";
    writeSources(root, [clone(CONFORM_SOURCE)]);
    writeBindings(root, [clone(CONFORM_BINDING), f]);
    const r = json(root);
    assert.equal(r.status, 1);
    assert.ok(r.data.violations.some((v) => v.rule === "R4.AUTHORITY_CLASS"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R5.DECISION — decision fora do enum do authority_binding reprova", () => {
  const root = sandbox();
  try {
    const b = clone(CONFORM_BINDING);
    b.decision = "BOUND";
    writeSources(root, [clone(CONFORM_SOURCE)]);
    writeBindings(root, [b]);
    const r = json(root);
    assert.equal(r.status, 1);
    assert.ok(r.data.violations.some((v) => v.rule === "R5.DECISION"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R6.HOLD_HUMAN_WITH_EVIDENCE_BOUND — contraditório reprova", () => {
  const root = sandbox();
  try {
    const b = clone(CONFORM_BINDING);
    b.status = "EVIDENCE_BOUND";
    writeSources(root, [clone(CONFORM_SOURCE)]);
    writeBindings(root, [b]);
    const r = json(root);
    assert.equal(r.status, 1);
    assert.ok(r.data.violations.some((v) => v.rule === "R6.HOLD_HUMAN_WITH_EVIDENCE_BOUND"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R6.ALLOW_WITHOUT_VALIDATORS — ALLOW sem validator_ids reprova", () => {
  const root = sandbox();
  try {
    const b = clone(CONFORM_BINDING);
    b.decision = "ALLOW";
    b.status = "REVIEW_REQUIRED";
    writeSources(root, [clone(CONFORM_SOURCE)]);
    writeBindings(root, [b]);
    const r = json(root);
    assert.equal(r.status, 1);
    assert.ok(r.data.violations.some((v) => v.rule === "R6.ALLOW_WITHOUT_VALIDATORS"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R7.SOURCE_REF_UNRESOLVED — source_id que não existe reprova", () => {
  const root = sandbox();
  try {
    const b = clone(CONFORM_BINDING);
    b.source_ids = ["SRC-NAO-EXISTE"];
    writeSources(root, [clone(CONFORM_SOURCE)]);
    writeBindings(root, [b]);
    const r = json(root);
    assert.equal(r.status, 1);
    assert.ok(r.data.violations.some((v) => v.rule === "R7.SOURCE_REF_UNRESOLVED"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R7.BINDING_REF_UNRESOLVED — authority_binding_ref quebrada reprova", () => {
  const root = sandbox();
  try {
    const f = clone(CONFORM_FIELD);
    f.authority_binding_ref = "AB-NAO-EXISTE";
    writeSources(root, [clone(CONFORM_SOURCE)]);
    writeBindings(root, [clone(CONFORM_BINDING), f]);
    const r = json(root);
    assert.equal(r.status, 1);
    assert.ok(r.data.violations.some((v) => v.rule === "R7.BINDING_REF_UNRESOLVED"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R8.NON_INTERNAL_WITHOUT_SOURCE — autoridade clínica sem fonte reprova", () => {
  const root = sandbox();
  try {
    const b = clone(CONFORM_BINDING);
    b.source_ids = [];
    writeSources(root, [clone(CONFORM_SOURCE)]);
    writeBindings(root, [b]);
    const r = json(root);
    assert.equal(r.status, 1);
    assert.ok(r.data.violations.some((v) => v.rule === "R8.NON_INTERNAL_WITHOUT_SOURCE"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("R10.DUPLICATE_ID — canonical_id repetido reprova", () => {
  const root = sandbox();
  try {
    writeSources(root, [clone(CONFORM_SOURCE), clone(CONFORM_SOURCE)]);
    writeBindings(root, [clone(CONFORM_BINDING)]);
    const r = json(root);
    assert.equal(r.status, 1);
    assert.ok(r.data.violations.some((v) => v.rule === "R10.DUPLICATE_ID"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("violações derivadas contam à parte (1 defeito no binding ≠ N defeitos)", () => {
  const root = sandbox();
  try {
    const b = clone(CONFORM_BINDING);
    delete b.authority_class;           // 1 defeito no binding
    const f1 = clone(CONFORM_FIELD); f1.canonical_id = "FD-TESTE-02";
    const f2 = clone(CONFORM_FIELD); f2.canonical_id = "FD-TESTE-03";
    writeSources(root, [clone(CONFORM_SOURCE)]);
    writeBindings(root, [b, f1, f2]);
    const r = json(root);
    assert.equal(r.status, 1);
    // 1 primária (o binding) + 2 derivadas (as duas field_definitions que o referenciam)
    assert.equal(r.data.violations.filter((v) => v.rule === "R4.AUTHORITY_CLASS").length, 1);
    assert.equal(r.data.derived_violations.length, 2);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a mensagem aponta a LINHA real do registo, não o índice do array", () => {
  const root = sandbox();
  try {
    const src = clone(CONFORM_SOURCE);
    src.source_type = "NORMATIVA";
    writeSources(root, [src]);
    writeBindings(root, [clone(CONFORM_BINDING)]);
    const r = json(root);
    const v = r.data.violations.find((x) => x.rule === "R1.SOURCE_TYPE");
    assert.ok(v, "esperava a violação R1.SOURCE_TYPE");
    assert.match(v.where, /tool-sources\.v1\.json:\d+/, "a mensagem deve trazer a linha");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("código de saída 2 para argumento desconhecido (convenção do repo)", () => {
  const r = spawnSync(process.execPath, [GATE, "--argumento-inventado"], { encoding: "utf8" });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /ERRO: argumento desconhecido/);
});

test("código de saída 1 para insumo ausente, sem stack trace", () => {
  const root = sandbox();
  try {
    const r = spawnSync(process.execPath, [GATE, "--root", root, "--sources", "nao-existe.json"], { encoding: "utf8" });
    assert.equal(r.status, 1);
    assert.doesNotMatch(r.stderr, /at file:\/\//, "não deve stack trace");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a saída JSON separa primárias, derivadas e lacunas de contrato", () => {
  const root = sandbox();
  try {
    const src = clone(CONFORM_SOURCE);
    src.integrity.sha256 = "NOT_AVAILABLE";
    writeSources(root, [src]);
    writeBindings(root, [clone(CONFORM_BINDING)]);
    const r = json(root);
    assert.equal(r.status, 1);
    assert.equal(r.data.status, "REPROVADO");
    assert.ok(r.data.contract_gaps >= 1, "o caso NOT_AVAILABLE é uma lacuna de contrato, não um erro de dado");
    assert.ok(Array.isArray(r.data.violations));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
