import assert from "node:assert/strict";
import test from "node:test";
import { visibleText } from "./visible-text.ts";

test("o texto visível ignora script, anúncio e etiqueta", () => {
  const html = `<main><script>alert(1)</script><ins>Anúncio</ins><p>Início</p><p>Escala de Braden</p><p>Avaliação de risco.</p></main>`;
  const text = visibleText(html);
  assert.equal(text.includes("alert"), false);
  assert.equal(text.includes("Anúncio"), false);
  assert.equal(text.includes("<p>"), false);
  assert.match(text, /Escala de Braden\nAvaliação de risco\./);
});
