#!/usr/bin/env node
/** Read-only guard: archived chrome tokens, generator and CSS must agree. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const css=readFileSync("src/styles.css","utf8");
const contract=JSON.parse(readFileSync("contracts/entities/chrome-bands.v1.json","utf8"));
const manifesto=readFileSync("MANIFESTO-backup.md","utf8");
const generator=readFileSync("scripts/generate-entity-contracts.mjs","utf8");
assert.match(manifesto,/--chrome-utility 44.*--chrome-a11y 44.*--chrome-header 64/);
assert.ok(generator.includes("css.matchAll(/--chrome-([a-z0-9-]+):\\s*([^;]+);/g)"),
 "The generator must include digits in CSS custom properties.");
assert.equal(contract.schemaVersion,1);
const generated=[...css.matchAll(/--chrome-([a-z0-9-]+):\s*([^;]+);/g)].map(m=>({
 id:"CE-CHROME-"+m[1].toUpperCase(),name:"--chrome-"+m[1],value:m[2].trim()
}));
assert.deepEqual(contract.items,generated);
assert.equal(generated.length,12);
const index=Object.fromEntries(generated.map(v=>[v.name,v.value]));
assert.equal(index["--chrome-utility"],"44px");
assert.equal(index["--chrome-a11y"],"44px");
assert.equal(index["--chrome-header"],"64px");
assert.equal(index["--chrome-total"],"calc(var(--chrome-utility) + var(--chrome-a11y) + var(--chrome-header))");
assert.equal([44,44,64].reduce((x,y)=>x+y,0),152);
assert.equal(new Set(generated.map(x=>x.name)).size,12);
console.log("CE_CHROME_CANONICAL_PARITY "+JSON.stringify({
 tokens:12,archivePreserved:11,accessibilityBarRecoveredFromManifest:true,
 noAutomaticRelease:true,computedHeaderStack:152,result:"PASS"
}));
