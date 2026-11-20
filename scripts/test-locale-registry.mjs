import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const base = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, base), "utf8");
const reg = JSON.parse(read("registers/i18n/locale-register.v1.json"));
const source = read("src/lib/locale-registry.ts");
const prefix = "export const localeRegistry = ";
const start = source.indexOf(prefix);
const end = source.indexOf(" as const;", start);
assert.ok(start >= 0 && end > start, "must have one canonical locale registry");
const runtimeLocales = JSON.parse(source.slice(start + prefix.length, end));
const ids = reg.locales.map((item) => item.id);
assert.equal(ids.length, 19);
assert.equal(new Set(ids).size, 19);
assert.deepEqual(reg.locales, runtimeLocales, "versioned register must agree byte-for-byte in data with runtime inventory");
assert.deepEqual(reg.locales.filter((item) => item.direction === "rtl").map((item) => item.id), ["ar"]);
assert.deepEqual(
  reg.locales.filter((item) => item.interfaceDictionary === "partial_existing").map((item) => item.id),
  ["pt-BR", "en", "es", "fr"],
);
assert.equal(reg.locales.filter((item) => item.interfaceDictionary === "header_only").length, 15);
assert.ok(reg.locales.every((item) => item.content === "not_verified"));
assert.ok(reg.locales.filter((item) => item.interfaceDictionary === "header_only")
  .every((item) => item.seoEligibility === "blocked_pending_verified_localization"));
assert.equal(reg.policy.seoAlternatesRequireApprovedTranslation, true);
assert.equal(reg.policy.neverMarkCompleteWithoutReview, true);

const header = read("src/lib/header-i18n.ts");
const translate = read("src/lib/translate.ts");
const seo = read("src/lib/seo.ts");
const registry = read("src/lib/route-registry.ts");
assert.match(header, /headerLocales = localeRegistry/);
assert.match(header, /selectableLocales = localeRegistry\.filter\(\(item\) => item\.interfaceDictionary === "partial_existing"\)/);
assert.match(translate, /export function parseLocale\(value: unknown\)/);
assert.match(translate, /value === "pt-BR" \|\| value === "en" \|\| value === "es" \|\| value === "fr"/);
assert.match(seo, /alternateLocales\(\)/);
assert.match(registry, /export function alternateLocales\(\)/);
console.log("PASS: 19 canonical locales; 4 selectable UI locales; 15 header-only, clinical/SEO HOLD; runtime-register parity.");
