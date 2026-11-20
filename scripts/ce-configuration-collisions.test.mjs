import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const root = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, root), "utf8");

test("CE collided root configs stay in semantic review and are never auto-admitted", () => {
  const manifest = JSON.parse(read("registers/governance/ce-origin-reconciliation-20261120.v1.json"));
  const conflicts = [".env.example", ".gitignore", "package.json", "package-lock.json", "README.md", "tsconfig.json"];
  for (const path of conflicts) {
    const row = manifest.records.find((r) => r.path === path);
    assert.ok(row, path);
    assert.equal(row.status, "COLLISION_MANUAL_RECONCILIATION", path);
    assert.equal(row.admitted, false, path);
  }
});

test("CE security ignore patterns are retained alongside canonical preview rules", () => {
  const ignored = new Set(read(".gitignore").split(/\r?\n/));
  for (const name of ["*.pem", "__pycache__/", "*.py[cod]", ".venv/", "venv/", ".next/", ".pnp", ".pnp.js", "node_modules", ".env", ".env.*"]) {
    assert.ok(ignored.has(name), "missing ignore pattern: " + name);
  }
  assert.ok(ignored.has("!.env.example"), "do not hide public env sample");
  assert.ok(ignored.has("!.grok/app-env.json"), "preserve guarded Grok build flag");
});

test("CE legacy Next.js root does not replace canonical Vite build or enable bank/auth", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.equal(pkg.scripts["build:spa"], "npm run build");
  assert.ok(pkg.devDependencies?.vite || pkg.dependencies?.vite);
  const sample = read(".env.example");
  assert.match(sample, /^VITE_AUTH_ENABLED=false$/m);
});
