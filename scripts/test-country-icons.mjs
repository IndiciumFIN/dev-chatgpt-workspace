import fs from "node:fs";
import assert from "node:assert/strict";
const r=JSON.parse(fs.readFileSync("registers/i18n/country-icon-contract.v1.json", "utf8"));
assert.equal(r.items.length,19);
assert.equal(new Set(r.items.map(x=>x.locale)).size,19);
for (const x of r.items) { assert.equal(x.approval,"HOLD_HUMAN"); assert.equal(x.iconAssetPath,null); assert.equal(x.brandAssetsCopied,false); assert.equal(x.accessibilityRules.localizedAccessibleName,true); }
const shell=fs.readFileSync("src/components/site/shell.tsx","utf8");
assert(shell.includes("fontControlVisual(chrome.locale"));
assert(!shell.includes("fontGlyph(chrome.locale"));
const render=fs.readFileSync("src/lib/country-icon-rendering.ts","utf8");
assert(render.includes('if (locale === "zh")'));
assert(render.includes('if (locale === "id")'));
// O glifo neutro vem do contrato de ícone/idioma. A afirmação antiga exigia a
// linha literal `return delta === "up" ? "+" : "−"` — que é justamente a
// duplicação que a consolidação removeu, e que fazia ru/uk mostrarem um "−"
// solto, sem nenhuma pista de que o controle é o do "A".
assert(render.includes("fontGlyph(locale, delta)"), "o renderizador deve delegar o glifo neutro ao contrato");
assert(!/return delta === "up" \? "\+" : "−"/.test(render), "a linha duplicada não deve voltar a existir");

// e o comportamento observável é o que importa de verdade:
const { fontControlVisual } = await import("../src/lib/country-icon-rendering.ts");
assert.equal(fontControlVisual("ru","up"), "А+");
assert.equal(fontControlVisual("uk","down"), "А−");
assert.equal(fontControlVisual("en","up"), "A+");
assert.equal(fontControlVisual("zh","up"), "字号放大");
assert.equal(fontControlVisual("id","up"), "Perbesar Teks");
assert.equal(fontControlVisual("pt-BR","down"), "A−");
console.log("PASS: 19 locales, no unlicensed artwork, no inferred national glyphs, localized control names preserved, glifo neutro vindo do contrato");
