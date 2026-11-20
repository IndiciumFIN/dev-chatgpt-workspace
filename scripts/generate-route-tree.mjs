#!/usr/bin/env node
/**
 * Deterministic TanStack file-route generation before stand-alone typecheck.
 * Reuses the exact router-generator version pinned in package-lock.json.
 * It does not build or deploy the application, and does not bypass TypeScript.
 */
import { Generator, getConfig } from "@tanstack/router-generator";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const config = getConfig({
  target: "react",
  routesDirectory: "./src/routes",
  generatedRouteTree: "./src/routeTree.gen.ts",
  quoteStyle: "single",
  disableLogging: true,
}, root);
const generator = new Generator({ config, root });
await generator.run();

// Regression: the file route must actually appear in the generated contract.
// If it does not, exit nonzero rather than hiding a broken route with a cast.
const routeTree = readFileSync(resolve(root, "src/routeTree.gen.ts"), "utf8");
if (!routeTree.includes("'/blog/mary-eliza-mahoney'")) {
  throw new Error("Route generation omitted blog/mary-eliza-mahoney; fail closed");
}
console.log("PASS: generated TanStack route tree before TypeScript checks.");
