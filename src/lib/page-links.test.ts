import assert from "node:assert/strict";
import test from "node:test";
import { isShellHtml, linkedHtml, resolveHref, shellBody } from "./page-links.ts";

const published = new Set(["/en/escalas-de-enfermagem/dor/index.html", "/braden.html"]);

test("o caminho relativo do idioma resolve e o externo não vira link", () => {
  assert.equal(resolveHref("/en/index.html", "escalas-de-enfermagem/dor/index.html"), "/en/escalas-de-enfermagem/dor/index.html");
  assert.equal(resolveHref("/en/braden.html", "https://exemplo.com/braden.html"), null);
  assert.equal(resolveHref("/en/braden.html", "/conta/login.html"), null);
  assert.equal(resolveHref("/en/braden.html", "mailto:a@b.c"), null);
  const html = `<main><a href="escalas-de-enfermagem/dor/index.html">Pain</a><a href="https://ads.example/x">Ad</a></main>`;
  const linked = linkedHtml(html, "/en/index.html", published);
  assert.match(linked, /\[\[Pain\|\/en\/escalas-de-enfermagem\/dor\/index\.html\]\]/);
  assert.equal(linked.includes("ads.example"), false);
});

test("a casca não finge tradução e aponta para o português publicado", () => {
  const html = `<div id="premium-content-placeholder">Carregando conteúdo protegido…</div>`;
  assert.equal(isShellHtml(html), true);
  const body = shellBody("/en/braden.html", published);
  assert.equal(body.includes("Carregando conteúdo protegido"), false);
  assert.equal(body.includes("premium-content"), false);
  assert.match(body, /não está no repositório/);
  assert.match(body, /\[\[Versão em português\|\/braden\.html\]\]/);
});
