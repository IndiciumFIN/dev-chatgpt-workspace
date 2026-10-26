import assert from "node:assert/strict";
import test from "node:test";
import { classifyPath, suggestFromHead, suggestionOf } from "./intake.ts";

test("a capa governada entra e o idioma irmão espera", () => {
  assert.equal(classifyPath("braden.html").verdict, "admitir");
  assert.equal(classifyPath("en/braden.html").verdict, "espera");
  assert.equal(classifyPath("en/braden.html").locale, "en");
  assert.equal(classifyPath("es/braden.html").module, "instrumento");
});

test("catálogo protegido, cache e mídia não viram conteúdo", () => {
  assert.equal(classifyPath("banco_nanda.json").verdict, "recusar");
  assert.equal(classifyPath("banco_nanda_en.json").module, "catalogo");
  assert.equal(classifyPath(".tradutor_cache/en/braden.html").verdict, "recusar");
  assert.equal(classifyPath("img/braden.webp").verdict, "recusar");
});

test("a sugestão tira título e descrição e não nasce de arquivo recusado", () => {
  const head = `<title>\nCalculadora da Escala de Braden\n</title><meta content="Calcule a Escala de Braden." name="description"/>`;
  assert.equal(suggestFromHead(head).title, "Calculadora da Escala de Braden");
  assert.equal(suggestFromHead(head).lead, "Calcule a Escala de Braden.");
  assert.equal(suggestionOf("banco_nanda.json", classifyPath("banco_nanda.json"), head), null);
  assert.equal(suggestionOf("en/braden.html", classifyPath("en/braden.html"), "<html></html>")?.title, "braden");
});
test("formulário e página ficam na fila", () => {
  assert.equal(classifyPath("formulario_escala_de_braden.html").module, "formulario");
  assert.equal(classifyPath("formulario_escala_de_braden.html").verdict, "espera");
  assert.equal(classifyPath("js/main.js").locale, "pt-BR");
});
