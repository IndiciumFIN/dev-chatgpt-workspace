import assert from "node:assert/strict";
import test from "node:test";
import { assembleTool } from "./bridge.ts";
import { getTool, toolRecord } from "./catalog.ts";
import { isClinicalRightsHeld } from "./rights-boundary.ts";

test("rights veto is instrument-specific and independent of publication state", () => {
  for (const slug of ["braden", "morse"]) assert.equal(isClinicalRightsHeld(slug), true);
  for (const slug of ["imc", "gotejamento", "apgar", "aldrete", "exames-laboratoriais"]) assert.equal(isClinicalRightsHeld(slug), false);
});

test("held instruments stay in the record and leave every public lookup", () => {
  for (const slug of ["braden", "morse"]) {
    assert.equal(getTool(slug), undefined);
    const record = toolRecord(slug);
    assert.equal(record?.publicacao, "candidata");
    assert.equal(
      assembleTool(
        {
          cover: { slug, kind: "escala", title: "x", lead: "x", category: null, nandaMode: null, bandFrom: null, evidence: null, version: null },
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
        },
        record,
      ),
      null,
    );
  }
  assert.ok(getTool("apgar"));
  assert.ok(getTool("imc"));
  assert.ok(getTool("gotejamento"));
});
