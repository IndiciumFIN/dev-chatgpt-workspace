import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const source = readFileSync(new URL("../src/lib/source.functions.ts", import.meta.url), "utf8");
const workflow = readFileSync(new URL("../.github/workflows/admin-ux-e2e.yml", import.meta.url), "utf8");
const begin = source.indexOf("async function seed(");
const end = source.indexOf("async function requireAdmin(", begin);
const seed = source.slice(begin, end);

test("admin fixture cannot write to remote DB or normal preview", () => {
  assert.ok(begin >= 0 && end > begin);
  assert.match(seed, /if \(dbSource !== "pglite"\) return/);
  assert.match(seed, /process\.env\.CE_ADMIN_E2E_FIXTURE === "true"/);
  assert.match(seed, /process\.env\.CI === "true"/);
  assert.match(seed, /process\.env\.GITHUB_ACTIONS === "true"/);
  assert.match(seed, /process\.env\.VITE_AUTH_ENABLED === "false"/);
  assert.match(seed, /!process\.env\.DATABASE_URL\?\.trim\(\)/);
  assert.ok(seed.indexOf("dbSource !==") < seed.indexOf("insert into member"));
});

test("fixture seeds role through PGLite member table, never bypasses requireAdmin", () => {
  assert.match(seed, /insert into member \(user_id, role\) values \('dev-user', 'admin'\)/);
  assert.match(source, /async function requireAdmin\(/);
  assert.match(source, /if \(rows\[0\]\?\.role !== "admin"\) throw new Error/);
  assert.match(workflow, /CE_ADMIN_E2E_FIXTURE: "true"/);
  assert.match(workflow, /Iniciar servidor e executar jornadas do administrador/);
});

test("default CI does not enable the fixture", () => {
  const mainCI = readFileSync(new URL("../.github/workflows/verify-bibliotecas.yml", import.meta.url), "utf8");
  assert.doesNotMatch(mainCI, /CE_ADMIN_E2E_FIXTURE:/);
});
