import assert from "node:assert/strict";
import test from "node:test";
import { parsePolicyBody, policyGaps, writePolicyBody, emptyPolicy } from "./policy-document.ts";

test("a política volta inteira e a seção vazia aparece como lacuna", () => {
  const sections = emptyPolicy();
  sections.proposito = "A fonte é uma só.";
  const parsed = parsePolicyBody(writePolicyBody(sections));
  assert.equal(parsed.legacy, "");
  assert.equal(parsed.sections.proposito, "A fonte é uma só.");
  assert.equal(policyGaps(parsed.sections).includes("Papéis"), true);
  assert.equal(policyGaps(parsed.sections).includes("Propósito"), false);
});

test("texto antigo não é recortado em seção", () => {
  const parsed = parsePolicyBody("Grava-se conta e papel. Não se grava paciente.");
  assert.match(parsed.legacy, /paciente/);
  assert.equal(parsed.sections.proposito, "");
});
