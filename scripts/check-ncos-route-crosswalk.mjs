#!/usr/bin/env node
// Evidence-only NCOS route crosswalk. Never infers RBAC, template approval, or publication.
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const root = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, root));
const source = JSON.parse(read("audit/branch-canonicalization/ncos-route-source-crosswalk-unregistered-20261113.v1.json"));
const legacy = JSON.parse(read("registers/canonical/surface-contracts.v2.json"));
const routes = [];
function scan(dir, prefix = "") {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) scan(join(dir, e.name), prefix + e.name + "/");
    else if (/\.(tsx|ts)$/.test(e.name)) routes.push(prefix + e.name);
  }
}
scan(new URL("src/routes/", root).pathname);
routes.sort();
const findings = [];
const check = (assertion, reason) => { if (!assertion) findings.push(reason); };
check(source.documentType === "NCOS_SOURCE_ROUTE_CROSSWALK_CANDIDATE", "SOURCE_CONTRACT_WRONG_TYPE");
check(legacy.scope === "CE_PUBLIC_BACKUP_ONLY", "LEGACY_BACKUP_SCOPE_CHANGED");
check(source.releaseReady === false && source.classification === "HOLD_ROLE_AND_TEMPLATE_REVIEW", "UNAPPROVED_RELEASE_CLAIM");
check(source.sources.length === 20, "REVIEW_20_SOURCE_COUNT_DRIFT");
const legacyFiles = new Set(Object.keys(legacy.entries));
const seen = new Set();
const reviewed = [];
for (const item of source.sources) {
  const path = "src/routes/" + item.file;
  check(!seen.has(item.file), "DUPLICATE_REVIEW:" + item.file);
  seen.add(item.file);
  check(!legacyFiles.has(item.file), "LEGACY_ROUTE_MISCLASSIFIED:" + item.file);
  check(routes.includes(item.file), "MISSING_ROUTE:" + item.file);
  check(item.role === "HOLD_ROLE_REVIEW" && item.templateKind === "HOLD_TEMPLATE_REVIEW" && item.releaseApproval === false, "UNAPPROVED_ROLE:" + item.file);
  if (!routes.includes(item.file)) continue;
  const bytes = read(path);
  const content = bytes.toString("utf8");
  const gitSha = createHash("sha1").update("blob " + bytes.length + "\0").update(bytes).digest("hex");
  check(gitSha === item.gitBlobSha, "UNREVIEWED_SOURCE_CHANGE:" + item.file);
  const route = content.match(/createFileRoute\(\s*["'\x60]([^"'\x60]+)["'\x60]\s*\)/)?.[1] ?? null;
  check(route === item.declaredRoute, "DECLARATION_MISMATCH:" + item.file);
  const imports = [...new Set([...content.matchAll(/from\s+["']([^"']+)["']|^\s*import\s+["']([^"']+)["']/gm)].map((m) => m[1] ?? m[2]))].sort();
  reviewed.push({
    file: item.file, declaredRoute: route, gitBlobSha: gitSha,
    actualImports: imports,
    sourceObservations: {
      hasLoader: /\bloader\s*:/.test(content),
      hasBeforeLoad: /\bbeforeLoad\s*:/.test(content),
      importsPublishedContent: imports.some((x) => x.includes("content-object.functions")),
      importsSeedOrStore: imports.some((x) => /(\.seed$|\/store$|\.data$)/.test(x)),
      directlyImportsDb: imports.some((x) => /^@\/lib\/db(?:\.ts)?$/.test(x))
    },
    roleReview: "HOLD", templateReview: "HOLD",
    publicationApproval: false
  });
}
const covered = new Set([...legacyFiles, ...seen]);
for (const file of routes) check(covered.has(file), "UNCOVERED_ROUTE:" + file);
for (const file of covered) check(routes.includes(file), "STALE_ROUTE_CONTRACT:" + file);
check(legacyFiles.size === 33 && routes.length === 53, "BASELINE_COUNTS_CHANGED_REVIEW_REQUIRED");
const report = {
  schemaVersion: "1.0.0",scope:"NCOS_INTEGRATED_CANDIDATE",
  kind:"ROUTE_SOURCE_INTEGRITY_NOT_AUTHORIZATION",
  sourceHeadAtReview:source.source_head_sha,
  summary:{routeFiles:routes.length,legacyBackupContracts:legacyFiles.size,sourceReviewed:reviewed.length,findings:findings.length,authorizationApprovals:0},
  status:findings.length ? "FAIL_SOURCE_INTEGRITY" : "PASS_SOURCE_INTEGRITY_ONLY",
  routeAuthorization:"HOLD_ROLE_TEMPLATE_REVIEW",
  databaseAuthorization:"HOLD_RLS_RBAC_MIGRATIONS",
  releaseGate:"BLOCKED",findings,reviewed
};
const dest = new URL("audit-evidence/",root);
mkdirSync(dest,{recursive:true});
writeFileSync(new URL("ncos-route-behavior-check.v1.json",dest),JSON.stringify(report,null,2)+"\n");
console.log("NCOS_ROUTE_BEHAVIOR_CHECK "+JSON.stringify(report.summary));
console.log(report.status+"; HOLD_ROLE_TEMPLATE_REVIEW; no publication approval");
if (findings.length) { for (const f of findings) console.error("FAIL "+f); process.exitCode = 1; }
