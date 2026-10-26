#!/usr/bin/env node
/**
 * Static offline gates for the branch's MEM editorial bridge.
 * Does NOT claim page approval or pixel-perfect visual QA.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = process.cwd();
const read = (path) => readFileSync(root + "/" + path, "utf8");
const inventory = JSON.parse(read("registers/curiosidades/mem-content-inventory.v1.json"));
assert.equal(inventory.sourceCount, 87, "Expected complete original Supabase inventory");
assert.equal(inventory.items.length, 87);
assert.equal(new Set(inventory.items.map((x) => x.slug)).size, 87, "Repeated slug");
assert.equal(new Set(inventory.items.map((x) => x.category)).size, 8, "Category crosswalk incomplete");
assert(inventory.items.every((x) => x.source_sha256 && x.title && x.slug), "Missing source identity");
assert(inventory.items.every((x) => x.content_status === "NEEDS_REVIEW" || x.content_status === "BLOCKED_SOURCE"), "Unexpected approved status in original inventory");
const status = inventory.items.reduce((acc, page) => (acc[page.content_status] = (acc[page.content_status] ?? 0) + 1, acc), {});
assert.equal(status.NEEDS_REVIEW, 43);
assert.equal(status.BLOCKED_SOURCE, 44);
const component = read("src/components/templates/curiosity-view.tsx");
assert(component.includes('import { ArticlePage }'), "MEM reference frame replaced");
assert(component.includes('import { ArticleFaq, Cite, ContextGrid, Keyline, ReferenceList }'), "MEM pieces not reused");
assert(!component.includes("dangerouslySetInnerHTML"), "Unsafe untrusted HTML render");
const model = read("src/lib/content/curiosidades/model.ts");
for (const block of ["cards","pair","stats","timeline","faq","callout","evidence","conflict","checkgrid","quote"]) {
  assert(model.includes('"' + block + '"') && component.includes('case "' + block + '":'), "Unmapped component " + block);
}
assert(model.includes('row.content_status !== "APPROVED"'), "Fail-closed policy missing");
console.log(JSON.stringify({status:"PASS_STATIC", pages:87,categories:8,blockTypes:10,distribution:status,visualQA:"NOT_RUN",clinicalEditorialQA:"NOT_RUN"}));
