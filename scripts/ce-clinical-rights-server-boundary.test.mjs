import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
const source = readFileSync(new URL("../src/lib/source.functions.ts",import.meta.url),"utf8");
const part = (a,b) => source.slice(source.indexOf(a),source.indexOf(b));
test("server public catalog and direct read enforce rights veto",()=>{
  assert.match(part("export const readCatalog","export const ensureRole"), /rows\.filter\(\(row\) => !isClinicalRightsHeld\(row\.slug\)\)/);
  assert.match(part("export const readTool","export const ensureRole"), /isClinicalRightsHeld\(slug\)/);
});
test("cover publication and preview seed cannot mark held tools public",()=>{
  const cover=part("export const saveTool","export const saveClinicalSheet");
  assert.match(cover,/input\.published === true && isClinicalRightsHeld\(input\.slug\)/);
  assert.match(cover,/data\.published && isClinicalRightsHeld\(data\.slug\)/);
  assert.ok(source.includes("${!isClinicalRightsHeld(tool.slug)}"));
});
