import assert from "node:assert/strict";
import { test } from "node:test";
import { injectGrokPwaHead } from "./grok-pwa-shared.mjs";

/**
 * Precedência entre o que a aplicação declara e o padrão da plataforma.
 *
 * O bug que este teste existe para travar: o filtro de injeção comparava o
 * HREF específico da plataforma. Um documento que declarasse o próprio ícone
 * (`/apple-touch-icon.png`) não casava com `/__grok/icon-180.png`, e a tag da
 * plataforma entrava por baixo. Como iOS costuma ficar com a ÚLTIMA ocorrência
 * de `apple-touch-icon`, o ícone da plataforma vencia — e nesta marca era o
 * ícone do ChatGPT.
 *
 * Regra: o ícone e o manifest da plataforma são PADRÃO, não override. Só entram
 * quando o documento realmente não declara nenhum.
 */

const doc = (head = "") =>
  `<html><head><title>CE</title>${head}</head><body></body></html>`;

test("app que declara apple-touch-icon nao recebe o padrao da plataforma", () => {
  const out = injectGrokPwaHead(doc('<link rel="apple-touch-icon" href="/apple-touch-icon.png">'));
  assert.ok(!out.includes("/__grok/icon-180.png"), "a plataforma reinyectou o icone dela");
  assert.ok(out.includes('href="/apple-touch-icon.png"'), "a tag da app sumiu");
});

test("app que declara manifest nao recebe o padrao da plataforma", () => {
  const out = injectGrokPwaHead(doc('<link rel="manifest" href="/site.webmanifest">'));
  assert.ok(!out.includes('href="/__grok/manifest.webmanifest"'), "a plataforma reinyectou o manifest dela");
  assert.ok(out.includes('href="/site.webmanifest"'));
});

test("app que declara theme-color nao tem a cor da plataforma por cima", () => {
  const out = injectGrokPwaHead(doc('<meta name="theme-color" content="#1A3E74">'));
  assert.ok(!out.includes('content="#000000"'), "a plataforma sobrescreveu a cor da app");
  assert.ok(out.includes('content="#1A3E74"'));
});

test("documento sem nenhuma declaracao ainda recebe o padrao da plataforma", () => {
  // O padrao continua sendo padrao: sem declaracao da app, ele entra.
  const out = injectGrokPwaHead(doc());
  assert.ok(out.includes('href="/__grok/manifest.webmanifest"'));
  assert.ok(out.includes('href="/__grok/icon-180.png"'));
});

test("a checagem e pelo TIPO da tag, nao pelo href — qualquer src conta", () => {
  const out = injectGrokPwaHead(
    doc('<link rel="apple-touch-icon" sizes="180x180" href="/qualquer/coisa.png">'),
  );
  assert.ok(!out.includes("/__grok/icon-180.png"));
});

test("documento sem head nao lanca", () => {
  assert.doesNotThrow(() => injectGrokPwaHead("<html><body>sem head</body></html>"));
});

test("input que nao e string passa direto", () => {
  assert.equal(injectGrokPwaHead(null), null);
});