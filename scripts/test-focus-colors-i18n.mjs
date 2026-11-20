import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const register = JSON.parse(readFileSync(new URL("../registers/i18n/focus-color-locale-register.v1.json", import.meta.url), "utf8"));
const shell = readFileSync(new URL("../src/components/site/shell.tsx", import.meta.url), "utf8");
const helper = readFileSync(new URL("../src/lib/focus-color-i18n.ts", import.meta.url), "utf8");
const locales = readFileSync(new URL("../src/lib/locale-registry.ts", import.meta.url), "utf8");
assert.deepEqual(register.semantics, ["yellow", "lime", "cyan", "magenta"]);
assert.equal(Object.keys(register.colors).length, 19);
for (const [locale, names] of Object.entries(register.colors)) {
  assert.ok(locales.includes('"id": "' + locale + '"'), "locale registry missing " + locale);
  assert.equal(names.length, 4, locale);
  assert.ok(names.every(name => typeof name === "string" && name.trim().length > 0), locale);
}
assert.match(shell, /aria-label=\{focusColorName\(chrome\.locale, color\.id\)\}/);
assert.match(shell, /aria-pressed=\{chrome\.focus === color\.id\}/);
assert.doesNotMatch(shell, /Foco amarelo|Foco verde|Foco ciano|Foco magenta/);
assert.match(helper, /import source from "\.\.\/\.\.\/registers\/i18n\/focus-color-locale-register\.v1\.json"/);
assert.match(helper, /source\.colors\[code\]\[labelIndex\]/);
assert.equal(register.approval, "HOLD_HUMAN");
console.log("PASS 19 locale candidates / 76 color labels / runtime binding / HOLD_HUMAN.");
