import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const getJson = path => JSON.parse(readFileSync(new URL("../" + path, import.meta.url), "utf8"));
const pkg = getJson("package.json");
const vercel = getJson("vercel.json");
const vite = readFileSync(new URL("../vite.config.ts", import.meta.url), "utf8");
const migrator = readFileSync(new URL("./migrate.mjs", import.meta.url), "utf8");

test("Vercel uses TanStack Start preset with Nitro output, not static dist", () => {
  assert.equal(vercel.framework, "tanstack-start");
  assert.equal(Object.hasOwn(vercel, "outputDirectory"), false);
  assert.equal(Object.hasOwn(vercel, "buildCommand"), false);
  assert.match(vite, /nitro\(\{/);
  assert.match(vite, /preset: "vercel"/);
});

test("build cannot apply SQL migrations implicitly in CI, preview or production", () => {
  assert.equal(pkg.scripts.build, "node scripts/with-app-env.mjs vite build");
  assert.equal(pkg.scripts["build:spa"], "npm run build");
  assert.doesNotMatch(pkg.scripts.build, /migrate|DATABASE_URL|psql|supabase/);
  assert.equal(pkg.scripts["db:migrate"], "node scripts/migrate.mjs");
  assert.match(migrator, /only under a separately approved migration work order/);
});

test("deployment installs lockfile dependencies without bypassing release gates", () => {
  assert.equal(vercel.installCommand, "npm ci --no-audit --no-fund");
  assert.equal(vercel.framework, "tanstack-start");
  assert.equal("DATABASE_URL" in vercel, false);
  assert.equal("allowUnsafe" in vercel, false);
});
