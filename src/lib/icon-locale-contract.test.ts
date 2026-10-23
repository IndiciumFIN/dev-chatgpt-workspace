import { strict as assert } from "node:assert";
import { test } from "node:test";
import { fontControlVisual } from "./country-icon-rendering.ts";
import { fontGlyph, fontGlyphByLocale } from "./icon-locale-contract.ts";
import { countryIconPolicy } from "./country-icon-policy.ts";
import { headerLocales } from "./header-i18n.ts";

/**
 * Paridade entre as duas fontes do glifo de fonte.
 *
 * Havia dois lugares decidindo o mesmo glifo: `fontControlVisual` (if-chain, em
 * uso) e `fontGlyph` (tabela, sem consumidor). Eles discordavam em três idiomas.
 * Este teste existe para o contrato de ícone/idioma não voltar a ser um arquivo
 * paralelo: se alguém reintroduzir um caminho que ignore a tabela, ele quebra.
 */

const IDS_OFICIAIS = [
  "pt-BR", "en", "es", "de", "it", "fr", "hi", "zh", "ar", "ja",
  "ru", "ko", "tr", "nl", "pl", "sv", "id", "vi", "uk",
] as const;

test("o contrato de glifo cobre exatamente os 19 idiomas oficiais", () => {
  assert.deepEqual(Object.keys(fontGlyphByLocale).sort(), [...IDS_OFICIAIS].sort());
});

test("o contrato de glifo cobre os mesmos idiomas que a politica de icone", () => {
  assert.deepEqual(
    Object.keys(fontGlyphByLocale).sort(),
    Object.keys(countryIconPolicy).sort(),
  );
});

test("todo idioma do header tem glifo — nenhum botao fica sem desenho", () => {
  for (const l of headerLocales) {
    const g = fontGlyph(l.id, "up");
    assert.equal(typeof g, "string", `${l.id} sem glifo`);
    assert.ok(g.length > 0, `${l.id} devolveu glifo vazio`);
  }
});

test("zh e id sao os unicos que divergem do glifo generico, e por politica", () => {
  // Deliberado: zh e id tem acao TEXTUAL por politica de governo, não desenho.
  // pt-BR NAO diverge — a tabela já codifica "A", então "A+" sai da mesma fonte
  // que todo o resto. Qualquer terceiro idioma divergindo é regressão silenciosa.
  const divergentes = IDS_OFICIAIS.filter(
    (l) => fontControlVisual(l, "up") !== fontGlyph(l, "up"),
  ).sort();
  assert.deepEqual(divergentes, ["id", "zh"]);
});

test("pt-BR converge com o glifo generico — a fonte e a mesma", () => {
  assert.equal(fontControlVisual("pt-BR", "up"), fontGlyph("pt-BR", "up"));
  assert.equal(fontControlVisual("pt-BR", "down"), fontGlyph("pt-BR", "down"));
});

test("up e down nunca devolvem o mesmo glifo", () => {
  for (const l of IDS_OFICIAIS) {
    assert.notEqual(fontControlVisual(l, "up"), fontControlVisual(l, "down"), `${l}: up == down`);
  }
});

test("os overrides preservam o sinal de mais e de menos", () => {
  assert.equal(fontControlVisual("pt-BR", "up"), "A+");
  assert.equal(fontControlVisual("pt-BR", "down"), "A−");
  assert.ok(fontControlVisual("zh", "up").includes("放大"));
  assert.ok(fontControlVisual("id", "down").includes("Perkecil"));
});

test("russo e ucraniano usam a letra cirilica, nao a latina", () => {
  // Comportamento que MUDOU ao consolidar: antes devolviam "-" e "+" puros.
  assert.equal(fontControlVisual("ru", "up"), "А+");
  assert.equal(fontControlVisual("uk", "down"), "А−");
  assert.notEqual(fontControlVisual("ru", "up"), fontControlVisual("en", "up"));
});