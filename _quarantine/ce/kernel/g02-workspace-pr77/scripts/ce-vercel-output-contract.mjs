#!/usr/bin/env node
/**
 * CI admission for Nitro output on Vercel. Build output version 3 requires
 * .vercel/output/config.json plus at least one function. nitro.json alone is
 * not a Vercel Build Output API manifest and must never produce a false PASS.
 * Only reports nonsecret paths and file validity, not function contents.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

export function inspectVercelOutput(projectRoot) {
  const out = resolve(projectRoot, ".vercel", "output");
  const manifestFile = join(out, "config.json");
  const functionsDir = join(out, "functions");
  const problems = [];
  let version = null;
  let functionCount = 0;
  const nitroJsonExists = existsSync(join(out, "nitro.json"));
  if (!existsSync(manifestFile)) {
    problems.push("MISSING_BUILD_OUTPUT_CONFIG: .vercel/output/config.json absent");
  } else {
    try {
      const manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
      version = manifest?.version ?? null;
      if (version !== 3) problems.push("WRONG_BUILD_OUTPUT_VERSION: expected version 3");
    } catch {
      problems.push("INVALID_BUILD_OUTPUT_CONFIG: config.json must be valid JSON");
    }
  }
  if (!existsSync(functionsDir)) {
    problems.push("MISSING_FUNCTIONS_DIR: .vercel/output/functions absent");
  } else {
    functionCount = readdirSync(functionsDir).filter((name) => {
      const full = join(functionsDir, name);
      return name.endsWith(".func") && statSync(full).isDirectory();
    }).length;
    if (!functionCount) problems.push("MISSING_SSR_FUNCTIONS: no .func directory");
  }
  if (!nitroJsonExists) problems.push("MISSING_NITRO_MANIFEST: .vercel/output/nitro.json absent");
  return {
    pass: problems.length === 0,
    manifestExists: existsSync(manifestFile),
    version, functionCount, nitroJsonExists, problems,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = inspectVercelOutput(process.cwd());
  console.log("[CE Vercel SSR gate]", JSON.stringify(result));
  if (!result.pass) {
    console.error("::error::Nitro build output is not a verified Vercel Build Output API v3 deployment.");
    process.exitCode = 1;
  }
}
