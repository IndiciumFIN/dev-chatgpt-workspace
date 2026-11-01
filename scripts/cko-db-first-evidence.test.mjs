/**
 * Gate de auditoria OFFLINE para o snapshot READ_ONLY consultado no Supabase.
 * NÃO executa cálculo clínico, NÃO consulta Supabase em tempo real,
 * NÃO aprova conteúdo e NÃO autoriza promoção.
 *
 * Executar: node --test scripts/cko-db-first-evidence.test.mjs
 * Evidência: audit-evidence/cko/db-first/20261026/apgar-fugulin-live-readback.json
 */
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import assert from "node:assert/strict";
import { test } from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const path = resolve(root, "audit-evidence/cko/db-first/20261026/apgar-fugulin-live-readback.json");
if (!existsSync(path)) {
  test("CKO DB evidence checks remain blocked until the deferred snapshot is restored", {
    skip: "NOT_RUN: the read-only live-readback snapshot is deferred; no fixture was synthesized.",
  }, () => {});
} else {
const snapshot = JSON.parse(readFileSync(path, "utf8"));
const entries = new Map(snapshot.records.map((r) => [r.tool_slug, r]));

const reviewPermitted = (state) => ["PASS", "APPROVED"].includes(String(state ?? "").toUpperCase());
const rightsPermitted = (state) => ["PASS", "APPROVED", "PERMITTED"].includes(String(state ?? "").toUpperCase());
const published = (state) => ["RELEASED", "APPROVED"].includes(String(state ?? "").toUpperCase());

/** Apenas um diagnóstico conservador de integridade; NÃO é política do Kernel. */
function diagnosticEligibility(r) {
  return r.source_of_truth === true &&
    r.canonical_promotion === true &&
    r.claim_count > 0 &&
    r.pending_claim_count === 0 &&
    r.evidence_refs_unresolved_in_cko === 0 &&
    typeof r.object_engine_ref === "string" && r.object_engine_ref.trim() !== "" &&
    typeof r.rule_pack_ref === "string" && r.rule_pack_ref.trim() !== "" &&
    r.named_run_count > 0 &&
    reviewPermitted(r.clinical_review_status) &&
    rightsPermitted(r.rights_state) &&
    published(r.publication_state);
}

test("snapshot tem origem e escopo explicitamente limitados", () => {
  assert.equal(snapshot.source, "Supabase Calculadoras-Smart");
  assert.equal(snapshot.access, "READ_ONLY");
  assert.equal(snapshot.scope, "DIRECT_KEY_LINKS_ONLY");
  assert.equal(snapshot.records.length, 2);
  assert.deepEqual([...entries.keys()].sort(), ["apgar", "fugulin"]);
});

test("nenhuma ferramenta está promovida ou com fonte canônica aprovada", () => {
  for (const r of entries.values()) {
    assert.equal(r.source_of_truth, false, r.tool_slug);
    assert.equal(r.canonical_promotion, false, r.tool_slug);
    assert.equal(r.publication_state, "HOLD", r.tool_slug);
    assert.equal(r.diagnostic_gate, "HOLD_INCOMPLETE_GRAPH", r.tool_slug);
    assert.equal(diagnosticEligibility(r), false, r.tool_slug);
  }
});

test("contexto normativo não torna regra de pontuação válida", () => {
  for (const r of entries.values()) {
    assert.ok(r.field_normative_count > 0, r.tool_slug);
    assert.equal(r.object_engine_ref, null, r.tool_slug);
    assert.equal(r.rule_pack_ref, null, r.tool_slug);
    assert.equal(r.named_run_count, 0, r.tool_slug);
    assert.equal(diagnosticEligibility(r), false, r.tool_slug);
  }
});

test("Apgar tem claims ainda candidatos com IDs de evidência sem resolução direta no CKO", () => {
  const apgar = entries.get("apgar");
  assert.equal(apgar.claim_count, 3);
  assert.equal(apgar.pending_claim_count, 3);
  assert.equal(apgar.evidence_refs_unresolved_in_cko, 6);
  assert.equal(diagnosticEligibility(apgar), false);
});

test("Fugulin não demonstra cobertura de pontuação pelos campos contextuais", () => {
  const fugulin = entries.get("fugulin");
  assert.equal(fugulin.claim_count, 0);
  assert.equal(fugulin.field_count, 10);
  assert.equal(fugulin.rule_pack_status, "HOLD_SCORING_RULE_PACK_NOT_MATERIALIZED");
  assert.equal(diagnosticEligibility(fugulin), false);
});

test("negativo: simular frontend PUBLICADA e contexto normativo PASS não supera HOLD", () => {
  for (const r of entries.values()) {
    const tampered = { ...r, publication_state: "RELEASED", reg_binding_status: "PASS_REG_CONTEXT",
      train_publication_status: "PASS", renderer_status: "PASS", deployment_status: "PASS" };
    assert.equal(diagnosticEligibility(tampered), false, r.tool_slug);
  }
});

test("negativo: simular motor e rule pack sem claims/revisão não promove", () => {
  for (const r of entries.values()) {
    const tampered = { ...r, object_engine_ref: "FAKE_ENGINE", rule_pack_ref: "FAKE_PACK",
      publication_state: "RELEASED", source_of_truth: true, canonical_promotion: true, named_run_count: 1 };
    assert.equal(diagnosticEligibility(tampered), false, r.tool_slug);
  }
});
}
