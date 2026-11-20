#!/usr/bin/env node
/**
 * Canonical CE/CKO/NCOS DB isolation policy. Reconciles the historical
 * CE_PUBLIC_BACKUP_ONLY checker, which assumed permanently disabled SQL.
 * Production RLS, credentials and clinical publication remain HOLD_HUMAN.
 */
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const routePaths = ["src/routes/admin.tsx", "src/routes/assinante.tsx",
  "src/routes/ferramentas.$slug.tsx", "src/routes/assinante.ferramentas.$slug.tsx"];
const db = read("src/lib/db.ts");
const source = read("src/lib/source.functions.ts");
const migrator = read("scripts/migrate.mjs");
const pkg = JSON.parse(read("package.json"));
let failures = 0;
function check(label, passed) {
  console.log((passed ? "PASS " : "FAIL ") + label);
  if (!passed) failures += 1;
}

for (const path of routePaths) {
  const route = read(path);
  check("no direct SQL/DB credentials in browser route: " + path,
    !/(?:@\/lib\/db|from\s+["']pg["']|new\s+(?:Pool|Client)\(|process\.env\.DATABASE_URL|withSqlTransaction\()/.test(route));
}
check("source RPCs are typed TanStack server functions",
  /createServerFn\(\{\s*method:\s*"GET"/.test(source) &&
  /createServerFn\(\{\s*method:\s*"POST"/.test(source) &&
  /from "@tanstack\/react-start"/.test(source));
check("privileged writes include middleware and policy checks",
  /\.middleware\(\[authMiddleware\]\)/.test(source) &&
  /assertProductionAuth\(\)/.test(source) &&
  /await decide\(sql,/.test(source));
const seedStart = source.indexOf("async function seed(");
const seedEnd = source.indexOf("async function requireAdmin(", seedStart);
const seed = source.slice(seedStart, seedEnd);
check("GET seeding is PGLite-only, never implicit remote publication",
  seedStart >= 0 && seedEnd > seedStart &&
  seed.indexOf('if (dbSource !== "pglite") return;') >= 0 &&
  seed.indexOf('if (dbSource !== "pglite") return;') < seed.indexOf("insert into source_tool"));
check("SQL client is server-only",
  /if \(typeof window !== "undefined"\)/.test(db) && /server-only/.test(db));
check("Neon selected only with explicit DATABASE_URL",
  /export const dbSource: DbSource = databaseUrl \? "neon" : "pglite";/.test(db));
check("preview database uses separate embedded PGLite path",
  /async function createPgliteSql\(\)/.test(db) && /new PGlite\(\{/.test(db));
check("build has no database migration side effect",
  pkg.scripts.build === "node scripts/with-app-env.mjs vite build" &&
  pkg.scripts["build:spa"] === "npm run build" && !/db:migrate|migrate\.mjs/.test(pkg.scripts.build));
check("remote migration needs manual dual approval",
  /CE_DB_MIGRATION_APPROVED/.test(migrator) && /cliApproved/.test(migrator) &&
  /HOLD_DB_MIGRATION_APPROVAL_REQUIRED/.test(migrator));
check("CI explicitly blocks SQL migrations",
  /HOLD_DB_MIGRATION_CI_FORBIDDEN/.test(migrator) &&
  /process\.env\.GITHUB_ACTIONS === "true"/.test(migrator));
check("manual migrations remain transactional",
  /await client\.query\("BEGIN"\)/.test(migrator) &&
  /await client\.query\("ROLLBACK"\)/.test(migrator) &&
  /await client\.query\("COMMIT"\)/.test(migrator));
const dry = spawnSync(process.execPath, [new URL("./migrate.mjs", import.meta.url).pathname], {
  env: {...process.env, DATABASE_URL: "postgresql://127.0.0.1:1/forbidden",
    CE_DB_MIGRATION_APPROVED: "", CI: "", GITHUB_ACTIONS: ""},
  encoding: "utf8", timeout: 5000,
});
check("unapproved migration is rejected without network connection",
  dry.status === 2 && dry.stderr.includes("HOLD_DB_MIGRATION_APPROVAL_REQUIRED"));
console.log(failures ? "FAIL isolation: " + failures + " controls" :
  "PASS isolation: no automatic remote writes, manual migration only; release remains HOLD.");
process.exitCode = failures ? 1 : 0;
