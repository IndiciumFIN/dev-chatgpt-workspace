#!/usr/bin/env node
/** Mandatory post-build fail-closed gate: the 87 HOLD drafts must not reach the public output. */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";

const root = ".vercel/output/static";
const catalog = JSON.parse(readFileSync("src/lib/content/curiosidades/catalog.json", "utf8"));
assert.equal(catalog.length, 87, "Expected 87 HOLD draft records");
assert(catalog.every((page) => page.content_status !== "APPROVED" && page.content_status !== "PUBLISHED"), "New admission detected; manual policy review required");
assert(existsSync(join(root,"blog/index.html")), "Missing safe public blog index");
for (const {slug} of catalog) {
  assert(!existsSync(join(root,"blog",slug,"index.html")), "UNAUTHORIZED_PUBLIC_ROUTE:" + slug);
}
const sitemap = readFileSync(join(root,"sitemap.xml"),"utf8");
for (const {slug} of catalog) {
  assert(!sitemap.includes("/blog/" + slug), "UNAUTHORIZED_SITEMAP:" + slug);
}

// Compilation must not include the article bodies, even as dynamically imported chunks.
// Read only generated text assets. Match unique phrases from source JSON, not common titles.
const samples = [
  "Ana Néri não era enfermeira formal",
  "A Farrand Training School liderou a proposta",
  "Em 10 de agosto de 1938, o Decreto nº 2.956",
];
const files = [];
function scan(dir) {
  for (const item of readdirSync(dir)) {
    const path = join(dir,item);
    const stat = statSync(path);
    if (stat.isDirectory()) scan(path);
    else if (/\.(?:js|json|html|txt|map)$/.test(item) && stat.size < 12_000_000) files.push(path);
  }
}
scan(root);
for (const path of files) {
  const text = readFileSync(path,"utf8");
  for (const sample of samples) {
    assert(!text.includes(sample), "DRAFT_BODY_LEAK:" + path + ":" + sample);
  }
}
const route = readFileSync("src/routes/blog.$slug.tsx","utf8");
const loader = readFileSync("src/lib/content/curiosidades/load.ts","utf8");
assert(route.includes('VITE_CURIOSIDADES_MEM_PREVIEW'), "Missing route deny-by-default");
assert(loader.includes('VITE_CURIOSIDADES_MEM_PREVIEW'), "Missing draft module gate");
console.log(JSON.stringify({
  verdict:"PASS_PUBLICATION_GATE",checkedDrafts:catalog.length,publicDraftRoutes:0,
  indexableDraftRoutes:0,bundleLeaks:0,assetsScanned:files.length,
  publicCatalogStatus:"DRAFT_UNLISTED",approval:"NOT_GRANTED"
}));
