#!/usr/bin/env node
/**
 * Manual database migrator (node-postgres, pg). NEVER invoked by build.
 *
 * Requires BOTH CE_DB_MIGRATION_APPROVED=true and CLI --approved, plus a
 * configured DATABASE_URL. Rejects GitHub Actions/CI even with those values.
 * Approval is operational and target-specific: validate planned deltas,
 * rights, RLS, rollback and backup BEFORE running the manual command.
 *
 * Non-recursive migrations/ prevents implicit admission of auth migrations.
 * Each SQL migration is applied transactionally and recorded in _migrations.
 */
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";
import { pendingMigrations } from "./migration-plan.mjs";

const migrationApproved = process.env.CE_DB_MIGRATION_APPROVED === "true";
const cliApproved = process.argv.slice(2).length === 1 && process.argv[2] === "--approved";
if (process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true") {
  console.error("[migrate] HOLD_DB_MIGRATION_CI_FORBIDDEN: migrations never run in CI/build.");
  process.exit(2);
}
if (!migrationApproved || !cliApproved) {
  console.error("[migrate] HOLD_DB_MIGRATION_APPROVAL_REQUIRED: review target and run with CE_DB_MIGRATION_APPROVED=true plus --approved.");
  process.exit(2);
}
const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error("[migrate] HOLD_DB_MIGRATION_DATABASE_URL_REQUIRED: no target selected.");
  process.exit(2);
}

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "migrations");

async function main() {
  let entries;
  try {
    entries = await readdir(migrationsDir);
  } catch {
    console.log("[migrate] no migrations/ directory — nothing to do.");
    return;
  }
  // An app with no schema of its own must not pay for a database connection.
  if (pendingMigrations(entries, []).length === 0) {
    console.log("[migrate] no migrations — nothing to do.");
    return;
  }

  const pool = new pg.Pool({ connectionString: databaseUrl, max: 1 });
  const client = await pool.connect();
  try {
    await client.query(
      "CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())",
    );
    const applied = (await client.query("SELECT name FROM _migrations")).rows.map(
      (r) => r.name,
    );

    let count = 0;
    for (const { name } of pendingMigrations(entries, applied)) {
      const text = await readFile(join(migrationsDir, name), "utf8");
      try {
        await client.query("BEGIN");
        // pg's simple-query protocol runs a whole multi-statement file at once.
        await client.query(text);
        await client.query("INSERT INTO _migrations (name) VALUES ($1)", [name]);
        await client.query("COMMIT");
      } catch (err) {
        console.error(`[migrate] error applying ${name}`);
        try {
          await client.query("ROLLBACK");
        } catch {
          // ROLLBACK fails when the connection died — keep the original error.
        }
        throw err;
      }
      console.log(`[migrate] applied ${name}`);
      count += 1;
    }
    console.log(count ? `[migrate] done — ${count} migration(s) applied.` : "[migrate] up to date.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[migrate] failed:", err?.message || err);
  // pg errors carry the context needed to debug a bad SQL file.
  for (const key of ["code", "detail", "hint", "position", "where"]) {
    if (err?.[key] != null) console.error(`[migrate]   ${key}: ${err[key]}`);
  }
  process.exit(1);
});
