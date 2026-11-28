#!/usr/bin/env node
/** Mandatory post-build fail-closed gate: the 87 HOLD drafts must not reach the public output. */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";

const output = ".vercel/output";
const root = join(output, "static");
assert(existsSync(output) && existsSync(root), "Missing Vercel build output");
const catalog = JSON.parse(readFileSync("src/lib/content/curiosidades/catalog.json", "utf8"));
assert.equal(catalog.length, 87, "Expected 87 HOLD draft records");
assert(catalog.every((page) => page.content_status !== "APPROVED" && page.content_status !== "PUBLISHED"), "New admission detected; manual policy review required");
// Nitro SSR serves the admitted index dynamically; static prerender is not required.
for (const {slug} of catalog) {
  assert(!existsSync(join(root,"blog",slug,"index.html")), "UNAUTHORIZED_PUBLIC_ROUTE:" + slug);
}
const sitemapPath = join(root,"sitemap.xml");
if (existsSync(sitemapPath)) {
  const sitemap = readFileSync(sitemapPath,"utf8");
  for (const {slug} of catalog) assert(!sitemap.includes("/blog/" + slug), "UNAUTHORIZED_SITEMAP:" + slug);
}
// SSR sitemap authority is the canonical contract, independent of static generation.
const { execFileSync } = await import("node:child_process");
const paths = JSON.parse(execFileSync(process.execPath, ["--experimental-strip-types", "--import", "./scripts/alias-hook.mjs", "-e", "import(\"./src/lib/contract.ts\").then(m=>console.log(JSON.stringify(m.publicPaths())))"], {encoding:"utf8"}).trim().split("\n").pop());
for (const {slug} of catalog) assert(!paths.includes("/blog/" + slug), "UNAUTHORIZED_CONTRACT_ROUTE:" + slug);

// Compilation must not include the article bodies, even as dynamically imported chunks.
// Read only generated text assets. Match unique phrases from source JSON, not common titles.
const anchors = catalog.map(({slug}) => {
  const record = JSON.parse(readFileSync("src/lib/content/curiosidades/pages/" + slug + ".json", "utf8"));
  const intro = record.content?.intro?.lead;
  const firstParagraph = record.content?.sections?.[0]?.paragraphs?.[0];
  // 70 caracteres quase sempre distinguem corpo editorial de título/metadata.
  const anchor = (typeof firstParagraph === "string" ? firstParagraph : intro)?.slice(0,70);
  assert(typeof anchor === "string" && anchor.length >= 35, "MISSING_LEAK_ANCHOR:" + slug);
  return {slug,anchor};
});
const files = [];
function scan(dir) {
  for (const item of readdirSync(dir)) {
    const path = join(dir,item);
    const stat = statSync(path);
    if (stat.isDirectory()) scan(path);
    else if (/\.(?:js|mjs|cjs|json|html|txt|map)$/.test(item)) files.push(path);
  }
}
scan(output);
assert(files.length > 0, "No build assets inspected");
for (const path of files) {
  const text = readFileSync(path,"utf8");
  for (const {slug,anchor} of anchors) {
    assert(!text.includes(anchor), "DRAFT_BODY_LEAK:" + path + ":" + slug);
  }
}
const route = readFileSync("src/routes/blog.$slug.tsx","utf8");
const loader = readFileSync("src/lib/content/curiosidades/load.ts","utf8");
assert(route.includes('VITE_CURIOSIDADES_MEM_PREVIEW'), "Missing route deny-by-default");
assert(loader.includes('VITE_CURIOSIDADES_MEM_PREVIEW'), "Missing draft module gate");
console.log(JSON.stringify({
  verdict:"PASS_PUBLICATION_GATE",checkedDrafts:catalog.length,publicDraftRoutes:0,
  indexableDraftRoutes:0,bundleLeaks:0,anchorsChecked:anchors.length,assetsScanned:files.length,
  publicCatalogStatus:"DRAFT_UNLISTED",approval:"NOT_GRANTED"
}));
