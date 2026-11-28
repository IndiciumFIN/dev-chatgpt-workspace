#!/usr/bin/env node
/**
 * Non-deploying verifier for Nitro's Vercel Build Output API contract.
 * This script neither runs migrations nor publishes the output.
 * It never dumps function contents or secrets to logs.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), ".vercel", "output");
const summary = {
  outputDirectoryPresent: existsSync(root),
  nitroManifestPresent: existsSync(join(root, "nitro.json")),
  buildOutputApiConfigPresent: existsSync(join(root, "config.json")),
  buildOutputApiVersion: null,
  functionEntryCount: 0,
  staticAssetEntryCount: 0,
  valid: false,
};

if (summary.buildOutputApiConfigPresent) {
  try {
    const config = JSON.parse(readFileSync(join(root, "config.json"), "utf8"));
    summary.buildOutputApiVersion = config.version ?? null;
  } catch {
    summary.buildOutputApiVersion = "INVALID_JSON";
  }
}
const functionsDir = join(root, "functions");
if (existsSync(functionsDir)) {
  summary.functionEntryCount = readdirSync(functionsDir).length;
}
const staticDir = join(root, "static");
if (existsSync(staticDir)) {
  summary.staticAssetEntryCount = readdirSync(staticDir).length;
}
summary.valid = summary.outputDirectoryPresent &&
  summary.buildOutputApiConfigPresent &&
  summary.buildOutputApiVersion === 3 &&
  summary.functionEntryCount > 0;
console.log("CE_VERCEL_BUILD_OUTPUT_AUDIT " + JSON.stringify(summary));
if (!summary.valid) {
  console.error("HOLD_BUILD_OUTPUT_API: Nitro output is not a verified Vercel v3 dynamic-function deployment; do not use a static dist fallback.");
  process.exitCode = 1;
}
