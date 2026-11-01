import assert from "node:assert/strict";
import test from "node:test";
import { assembleTool, hasStoredSheet, type ToolSheet } from "./bridge.ts";

const empty: ToolSheet = {
  cover: { slug: "braden", kind: "escala", title: "Capa", lead: "Texto", category: null, nandaMode: null, bandFrom: null, evidence: null, version: null },
  criteria: [],
  choices: [],
  fields: [],
  selects: [],
  selectOptions: [],
  metas: [],
  metaOptions: [],
  outputs: [],
  bands: [],
  nanda: [],
  references: [],
  steps: [],
  faqs: [],
  related: [],
  specific: [],
};

test("sem critério, campo ou escolha, a ficha não está gravada", () => {
  assert.equal(hasStoredSheet(empty), false);
});

test("a ficha gravada vira o tipo que o motor já aceita", () => {
  const tool = assembleTool({
    ...empty,
    criteria: [{ id: "sensorial", label: "Percepção", help: "Reação", position: 1 }],
    choices: [
      { criterionId: "sensorial", value: "2", label: "Muito limitada", position: 2 },
      { criterionId: "sensorial", value: "1", label: "Completamente limitada", position: 1 },
    ],
    bands: [{ min: "6", max: "9", label: "Risco muito alto", tone: "danger", note: "Reavalie." }],
    nanda: [{ min: "6", label: "Risco de lesão por pressão" }],
  });
  assert.ok(tool);
  assert.equal(tool?.criteria?.[0].choices[0].value, 1);
  assert.equal(tool?.bands?.[0].nanda[0], "Risco de lesão por pressão");
  assert.equal(tool?.nandaMode, "nao-fechar");
});
