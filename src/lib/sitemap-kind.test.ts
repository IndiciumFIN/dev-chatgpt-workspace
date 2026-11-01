import assert from "node:assert/strict";
import test from "node:test";
import { kindForSitemap, localeOfPath, shouldPublishPath, toolSlugForSitemap } from "./sitemap-kind.ts";

test("o sitemap escolhe o contrato que já existe", () => {
  assert.equal(kindForSitemap("/blog/artigo.html"), "artigo");
  assert.equal(kindForSitemap("/en/blog/artigo.html"), "artigo");
  assert.equal(kindForSitemap("/biblioteca/item.html"), "biblioteca");
  assert.equal(kindForSitemap("/downloads/folha.html"), "editorial");
  assert.equal(kindForSitemap("/guia_rapido_bundles.html"), "guia");
  assert.equal(kindForSitemap("/formulario_escala_de_braden.html"), "guia");
  assert.equal(kindForSitemap("/codigo_de_etica_enfermagem.html"), "norma");
  assert.equal(kindForSitemap("/braden.html"), "secao");
  assert.equal(localeOfPath("/en/braden.html"), "en");
  assert.equal(localeOfPath("/braden.html"), "pt-BR");
  assert.equal(toolSlugForSitemap("/braden.html"), "braden");
  assert.equal(toolSlugForSitemap("/en/braden.html"), null);
  assert.equal(toolSlugForSitemap("/guia_rapido_bundles.html"), null);
  assert.equal(shouldPublishPath("/en/braden.html"), true);
  assert.equal(shouldPublishPath("/escalas-de-enfermagem/dor/index.html"), true);
  assert.equal(shouldPublishPath("/politicaapp.html"), true);
  assert.equal(shouldPublishPath("/conta/login.html"), false);
  assert.equal(shouldPublishPath("/automacoes/x.html"), false);
  assert.equal(shouldPublishPath("/footer.html"), false);
});
