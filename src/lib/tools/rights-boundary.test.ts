import assert from "node:assert/strict";
import test from "node:test";
import { isClinicalRightsHeld } from "./rights-boundary.ts";
test("rights veto is instrument-specific and independent of publication state", () => {
  for (const slug of ["braden", "morse"]) assert.equal(isClinicalRightsHeld(slug), true);
  for (const slug of ["imc", "gotejamento", "apgar", "aldrete", "exames-laboratoriais"]) assert.equal(isClinicalRightsHeld(slug), false);
});
