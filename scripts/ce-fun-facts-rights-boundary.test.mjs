import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = p => readFileSync(new URL("../" + p, import.meta.url), "utf8");
const seed = read("src/lib/editorial/fun-facts.seed.ts");
const pub = read("src/lib/editorial/fun-facts.public.ts");
const route = read("src/routes/curiosidades.tsx");
const rows = s => s.match(/^  \{\n    schema_version: "0\.1\.0",\n    canonical_id: "FF-\d{3}",[\s\S]*?^  \},$/gm) || [];
const id = row => row.match(/canonical_id: "([^"]+)"/)[1];
test("public projection contains only six unchanged legacy records", () => {
 const all = new Map(rows(seed).map(r => [id(r),r]));
 assert.equal(all.size,10);
 const released = rows(pub);
 assert.equal(released.length,6);
 for (const row of released) { assert.equal(row,all.get(id(row))); assert.match(row,/status: "RELEASED"/); assert.match(row,/rights_status: "(CLEAR|LICENSED|PUBLIC_DOMAIN)"/); }
 for (const n of ["005","007","008","009"]) { const row=all.get("FF-"+n); assert.match(row,/status: "HOLD_HUMAN"/); assert.match(row,/rights_status: "HOLD"/); assert.ok(!pub.includes("FF-"+n)); }
});
test("public route cannot toggle or import candidate seed", () => {
 assert.match(route,/fun-facts\.public/);
 assert.doesNotMatch(route,/fun-facts\.seed|FUN_FACTS_SEED|onlyReleased/);
 assert.match(route,/f\.status !== "RELEASED"/);
});
test("normative corrections and no copied oath", () => {
 assert.match(seed,/48\.202/); assert.match(seed,/29,8 milhões/); assert.match(seed,/736\/2024/);
 assert.doesNotMatch(seed,/Santa Emília|28 milhões|Prometo solenemente|Resolução nº 543\/2017/);
});
