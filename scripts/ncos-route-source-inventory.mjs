#!/usr/bin/env node
/**
 * NCOS route crosswalk: source-derived inventory, NOT approval of a route.
 * Read-only scan of every file route and historical backup-only contracts.
 * Never changes routes, DB, role guards, legacy registers, or release gates.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const routeRoot = resolve(root, "src/routes");
const readJson = (file) => JSON.parse(readFileSync(resolve(root, file), "utf8"));
const legacySurface = readJson("registers/canonical/surface-contracts.v2.json");
const legacyRoutes = readJson("registers/canonical/route-contracts.v1.json");

if (legacySurface.scope !== "CE_PUBLIC_BACKUP_ONLY" || legacyRoutes.scope !== "CE_PUBLIC_BACKUP_ONLY") {
  throw new Error("LEGACY_SOURCE_SCOPE_CHANGED: do not promote to NCOS without governance approval");
}
function routeFiles(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const full = resolve(folder, entry.name);
    return entry.isDirectory() ? routeFiles(full) : /\.(?:ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}
const routes = routeFiles(routeRoot).sort();
if (routes.length === 0) throw new Error("NO_SOURCE_ROUTES");
const routeNames = new Set();
const invalidDeclarations = [];
const records = routes.map((full) => {
  const file = relative(routeRoot, full).replaceAll("\\", "/");
  const source = readFileSync(full, "utf8");
  const imports = [...new Set([...source.matchAll(/from\s+["']([^"']+)["']|^\s*import\s+["']([^"']+)["']/gm)]
    .map((match) => match[1] ?? match[2]))].sort();
  const declared = source.match(/createFileRoute\(\s*["'\x60]([^"'\x60]+)["'\x60]\s*\)/)?.[1]
    ?? (file === "__root.tsx" && /createRootRoute(?:WithContext)?\s*[<(]/.test(source) ? "__root" : null);
  if (!declared) invalidDeclarations.push({ file, cause: "MISSING_CREATE_ROUTE" });
  else if (routeNames.has(declared)) invalidDeclarations.push({ file, cause: "DUPLICATE_ROUTE_DECLARATION", path: declared });
  if (declared) routeNames.add(declared);

  const previous = legacySurface.entries[file] ?? null;
  const oldRoute = legacyRoutes.routes[file] ?? null;
  const missingImports = (previous?.requiredImports ?? []).filter((specifier) => !imports.includes(specifier));
  return {
    file,
    declaredRoute: declared,
    sourceSha256: createHash("sha256").update(source).digest("hex"),
    actualImports: imports,
    legacyCoverage: previous !== null,
    obsoleteLegacyRequiredImports: missingImports,
    legacyRole: oldRoute?.role ?? null,
    legacyTemplateKind: oldRoute?.templateKind ?? null,
    roleApproval: "NOT_VERIFIED",
    publicationApproval: "NOT_VERIFIED",
    clinicalEvidenceApproval: "NOT_VERIFIED",
    admission: "HOLD_SOURCE_REVIEW",
  };
});
const files = new Set(records.map((r) => r.file));
const staleLegacyEntries = Object.keys(legacySurface.entries).filter((file) => !files.has(file)).sort();
const unregistered = records.filter((r) => !r.legacyCoverage);
const drifted = records.filter((r) => r.obsoleteLegacyRequiredImports.length > 0);
const summary = {
  sourceFiles: records.length,
  legacyContractEntries: Object.keys(legacySurface.entries).length,
  unregistered: unregistered.length,
  legacyImportDriftFiles: drifted.length,
  obsoleteRequiredImportAssertions: drifted.reduce((sum, row) => sum + row.obsoleteLegacyRequiredImports.length, 0),
  staleLegacyEntries: staleLegacyEntries.length,
  parseErrors: invalidDeclarations.length,
  approvedForRelease: 0,
};
const report = {
  schemaVersion: "1.0.0",
  kind: "NCOS_ROUTE_SOURCE_CROSSWALK_DIAGNOSTIC_ONLY",
  source: "src/routes/**/*.{ts,tsx}",
  legacyScope: legacySurface.scope,
  sourceCommit: process.env.GITHUB_SHA || null,
  generatedAt: new Date().toISOString(),
  summary,
  releaseGate: "HOLD_ROLE_TEMPLATE_AND_ISOLATION",
  explanation: "Source imports and declarations are verifiable; legacy roles, templates and publication authority are NOT inferred or promoted.",
  invalidDeclarations,
  staleLegacyEntries,
  records,
};
const outputIndex = process.argv.indexOf("--output");
if (outputIndex !== -1) {
  const rel = process.argv[outputIndex + 1];
  if (!rel || rel.startsWith("/") || rel.split("/").includes("..")) throw new Error("UNSAFE_DIAGNOSTIC_OUTPUT");
  const out = resolve(root, rel);
  if (!out.startsWith(root + "/")) throw new Error("OUTPUT_OUTSIDE_REPO");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(report, null, 2) + "\n");
}
console.log("NCOS_ROUTE_SOURCE_SUMMARY " + JSON.stringify(summary));
console.log("HOLD: diagnostic inventory is not a role review, a visual test or a release-gate substitute");
if (invalidDeclarations.length || staleLegacyEntries.length) {
  console.error(JSON.stringify({ invalidDeclarations, staleLegacyEntries }));
  process.exitCode = 1;
}
