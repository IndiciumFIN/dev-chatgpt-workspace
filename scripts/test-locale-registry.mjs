import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const base = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, base), "utf8");
const registry = JSON.parse(read("registers/i18n/locale-register.v1.json"));
const ids = registry.locales.map((entry) => entry.id);
assert.equal(ids.length, 19);
assert.equal(new Set(ids).size, 19);
assert.deepEqual(registry.locales.filter((entry) => entry.direction === "rtl").map((entry) => entry.id), ["ar"]);

// The older registry records full-site delivery status, NOT the availability
// of individual header vocabulary candidates. Do not auto-promote 15 languages.
assert.deepEqual(
  registry.locales.filter((entry) => entry.interfaceDictionary === "partial_existing").map((entry) => entry.id),
  ["pt-BR", "en", "es", "fr"],
);
assert.equal(registry.locales.filter((entry) => entry.interfaceDictionary === "missing").length, 15);
assert.ok(registry.locales.every((entry) => entry.content === "not_verified"));
assert.equal(registry.locales.filter((entry) => entry.seoEligibility === "blocked_pending_verified_localization").length, 15);
assert.equal(registry.policy.seoAlternatesRequireApprovedTranslation, true);
assert.equal(registry.policy.neverMarkCompleteWithoutReview, true);

const locale = read("src/lib/locale-registry.ts");
const header = read("src/lib/header-i18n.ts");
const translate = read("src/lib/translate.ts");
const seo = read("src/lib/seo.ts");
const routes = read("src/lib/route-registry.ts");
assert.match(locale, /export const localeRegistry =/);
assert.match(locale, /export const localesWithInterface = localeRegistry\.filter\(item => item\.interfaceDictionary === "partial_existing"\)/);
assert.match(locale, /if \(item\.interfaceDictionary === "interface_ready"\) return defaultLocale/);
assert.match(header, /export const headerLocales = localeRegistry/);
assert.match(header, /export const selectableLocales = localeRegistry\.filter\(\(item\) => item\.interfaceDictionary === "partial_existing"\)/);
assert.match(translate, /if \(value === "pt-BR" \|\| value === "en" \|\| value === "es" \|\| value === "fr"\) return value/);
assert.match(seo, /const canonicalLang = canonicalLocale\(lang\)/);
assert.match(seo, /alternateLocales\(\)/);
assert.match(routes, /import \{ localesWithInterface \} from "@\/lib\/locale-registry"/);
assert.doesNotMatch(seo, /\["pt-BR",\s*"en",\s*"es",\s*"fr"\]/);
console.log("PASS: 19 locale candidates; 4 selectable; 15 blocked for full delivery; clinical SEO not approved.");
