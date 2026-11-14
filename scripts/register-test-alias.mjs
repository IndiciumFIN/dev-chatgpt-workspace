/**
 * Node-only test preload for the Vite/TypeScript "@/" module alias.
 *
 * Does not change runtime imports, production bundling or clinical code.
 * Rejects path traversal and resolves only files under the tracked src root.
 * Node 22.15+ supports synchronous registerHooks through --import.
 */
import { registerHooks } from "node:module";
import { existsSync, statSync } from "node:fs";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const srcRoot = fileURLToPath(new URL("../src/", import.meta.url));
const srcRootURL = pathToFileURL(srcRoot).href;
const extensions = ["", ".ts", ".tsx", ".mjs", ".js", "/index.ts", "/index.tsx", "/index.js"];

function sourceFile(base, nextResolve, context, originalSpecifier) {
  if (!(base === srcRoot || base.startsWith(srcRoot + sep))) {
    throw new Error("UNSAFE_TEST_ALIAS: " + originalSpecifier);
  }
  for (const extension of extensions) {
    const candidate = base + extension;
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return nextResolve(pathToFileURL(candidate).href, context);
    }
  }
  throw new Error("UNRESOLVED_TEST_ALIAS: " + originalSpecifier);
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const relative = specifier.slice(2);
      if (!relative || relative.split("/").includes("..") ||
          relative.includes("\\") || !/^[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*$/.test(relative)) {
        throw new Error("UNSAFE_TEST_ALIAS: " + specifier);
      }
      return sourceFile(resolve(srcRoot, relative), nextResolve, context, specifier);
    }
    // TS bundler semantics for extensionless relative imports in src.
    if (specifier.startsWith(".") && context.parentURL?.startsWith(srcRootURL)) {
      const fileURL = new URL(specifier, context.parentURL);
      if (fileURL.protocol === "file:") {
        const resolved = fileURLToPath(fileURL);
        if (!extname(resolved)) {
          return sourceFile(resolved, nextResolve, context, specifier);
        }
      }
    }
    return nextResolve(specifier, context);
  },
});
