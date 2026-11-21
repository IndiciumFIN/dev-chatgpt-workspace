#!/usr/bin/env node
/**
 * Read-only subset of the canonical generator's routes/components projections.
 * The complete clinical/DS generator and its fail-closed gate remain intact.
 * --fix writes ONLY the two factual code-inventory projections.
 * Presence of a route does not constitute clinical scope or release approval.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const targets = [
  { path: "contracts/entities/routes.v1.json", dir: "src/routes",
    filter: name => name.endsWith(".tsx") && !name.startsWith("__"),
    make: name => ({ id: "CE-ROUTE-" + name.slice(0,-4), file: "src/routes/" + name }) },
  { path: "contracts/entities/components.v1.json", dir: "src/components/site",
    filter: name => name.endsWith(".tsx"),
    make: name => ({ id: "CE-COMP-" + name.slice(0,-4), file: "src/components/site/" + name }) }
];
const apply = process.argv.includes("--fix");
if (process.argv.some(arg => arg.startsWith("--") && arg !== "--fix"))
  throw new Error("UNKNOWN_OPTION");
const summary = [];
for (const target of targets) {
  const original = JSON.parse(readFileSync(target.path,"utf8"));
  if (original.schemaVersion !== 1 || !original.generatedBy?.endsWith("generate-entity-contracts.mjs") ||
      !Array.isArray(original.items)) throw new Error("CONTRACT_METADATA_OR_SCHEMA_INVALID:"+target.path);
  const entries = readdirSync(target.dir).filter(target.filter).map(target.make);
  const ids = new Set(entries.map(x=>x.id));
  if (ids.size !== entries.length) throw new Error("DUPLICATE_SOURCE_ROUTE_OR_COMPONENT");
  const oldIds = new Set(original.items.map(x=>x.id));
  const added = entries.filter(x=>!oldIds.has(x.id)).map(x=>x.id);
  const missing = original.items.filter(x=>!ids.has(x.id)).map(x=>x.id);
  const changed = JSON.stringify(original.items) !== JSON.stringify(entries);
  // Source inventory is not approval to publish a cross-domain route.
  const crossDomainRoutes = target.dir === "src/routes"
    ? entries.filter(x => /calculadoras-trabalhistas/.test(x.file)).map(x=>x.file) : [];
  if (apply) {
    original.items = entries;
    writeFileSync(target.path, JSON.stringify(original,null,2)+"\n");
  }
  summary.push({ contract:target.path, sourceEntries:entries.length,
    previousEntries:oldIds.size, added, missing, changed, crossDomainRoutes,
    domainReviewRequired:crossDomainRoutes.length>0, autoAdmittedClinicalSources:0,
    autoApprovedRelease:false });
  if (!apply && changed) process.exitCode=1;
}
console.log("CE_ROUTE_COMPONENT_RECONCILIATION "+JSON.stringify(summary));
if (!apply && process.exitCode) console.error("HOLD_CONTRACT_FRESHNESS: run the source-derived tool with --fix, review diff, preserve clinical and design-system gates.");
