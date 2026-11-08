/**
 * Runner that validates the validators themselves.
 * Execute before any content audit.
 */
import {spawnSync} from "node:child_process";
import {resolve} from "node:path";

const scripts = [
  "agents/doc-governance.mjs",
  "agents/normative-applicability.mjs",
  "agents/meta-validator.mjs"
];

let allPass = true;
for (const s of scripts) {
  console.log(`\n=== Running ${s} ===`);
  const r = spawnSync("node", [resolve(process.cwd(), s)], {stdio: "inherit", cwd: process.cwd()});
  if (r.status !== 0) allPass = false;
}
console.log("\n=== OVERALL ===");
console.log(allPass ? "VALIDATORS_PASS" : "VALIDATORS_FAIL");
process.exit(allPass ? 0 : 1);
