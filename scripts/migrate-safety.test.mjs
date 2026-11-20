import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const source = readFileSync(new URL("./migrate.mjs", import.meta.url), "utf8");
const dummyDb = "postgresql://127.0.0.1:1/never-connect";

function tryMigrate(args = [], envExtra = {}) {
  return spawnSync(process.execPath, [new URL("./migrate.mjs", import.meta.url).pathname, ...args], {
    env: {
      ...process.env,
      CI: "",
      GITHUB_ACTIONS: "",
      CE_DB_MIGRATION_APPROVED: "",
      DATABASE_URL: dummyDb,
      ...envExtra,
    },
    encoding: "utf8",
    timeout: 5000,
  });
}

test("build and build:spa never trigger remote SQL migration", () => {
  assert.equal(pkg.scripts.build, "node scripts/with-app-env.mjs vite build");
  assert.equal(pkg.scripts["build:spa"], "npm run build");
  assert.ok(!pkg.scripts.build.includes("db:migrate"));
});

test("plain db:migrate fails closed even with an injected database URL", () => {
  const run = tryMigrate();
  assert.equal(run.status, 2);
  assert.match(run.stderr, /HOLD_DB_MIGRATION_APPROVAL_REQUIRED/);
});

test("env approval without explicit CLI approval cannot connect", () => {
  const run = tryMigrate([], { CE_DB_MIGRATION_APPROVED: "true" });
  assert.equal(run.status, 2);
  assert.match(run.stderr, /HOLD_DB_MIGRATION_APPROVAL_REQUIRED/);
});

test("CLI approval alone cannot connect", () => {
  const run = tryMigrate(["--approved"]);
  assert.equal(run.status, 2);
  assert.match(run.stderr, /HOLD_DB_MIGRATION_APPROVAL_REQUIRED/);
});

test("CI forbids migrations even if both approval flags are present", () => {
  const run = tryMigrate(["--approved"], { GITHUB_ACTIONS: "true", CE_DB_MIGRATION_APPROVED: "true" });
  assert.equal(run.status, 2);
  assert.match(run.stderr, /HOLD_DB_MIGRATION_CI_FORBIDDEN/);
});

test("approved attempt with no target fails before connecting", () => {
  const run = tryMigrate(["--approved"], { CE_DB_MIGRATION_APPROVED: "true", DATABASE_URL: "" });
  assert.equal(run.status, 2);
  assert.match(run.stderr, /HOLD_DB_MIGRATION_DATABASE_URL_REQUIRED/);
});

test("migration runner retains shallow scan and one transaction per file", () => {
  assert.match(source, /pendingMigrations\(entries, applied\)/);
  assert.match(source, /await client\.query\("BEGIN"\)/);
  assert.match(source, /await client\.query\("ROLLBACK"\)/);
  assert.match(source, /await client\.query\("COMMIT"\)/);
  assert.match(source, /CE_DB_MIGRATION_APPROVED/);
});
