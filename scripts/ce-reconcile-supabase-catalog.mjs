#!/usr/bin/env node
/**
 * CE / Supabase catalog reconciliation. OFFLINE, NO DB CONNECTIONS, NO WRITES.
 * Explicitly compares a subset: structural registry existing_reused/candidates;
 * application-local PGLite index is a DIFFERENT store and is NOT treated as drift.
 * Does not certify normatives, approvals, RLS effectiveness, or migration application.
 */
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { inventoryMigrations } from './inventory-migration-collisions.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const sha256 = (data) => createHash('sha256').update(data).digest('hex');
const sorted = (arr) => [...new Set(arr)].sort();

export function reconcile(snapshot, registry, migrationInventory, appIndexNames = []) {
  if (!snapshot || snapshot.schema_version !== 'ce-db-catalog.v1' ||
      !Array.isArray(snapshot.schemas) || !Array.isArray(snapshot.tables) ||
      !Array.isArray(snapshot.columns) || !Array.isArray(snapshot.constraints) ||
      !Array.isArray(snapshot.policies) || !Array.isArray(snapshot.functions)) {
    throw new Error('Invalid/incomplete catalog snapshot: fail closed (NOT_RUN).');
  }
  if (!snapshot.tables.every((t) =>
    typeof t.schema === 'string' && typeof t.name === 'string' &&
    typeof t.kind === 'string' && typeof t.rls_enabled === 'boolean')) {
    throw new Error('Catalog contains invalid table entries: fail closed.');
  }
  if (!registry || !Array.isArray(registry.existing_reused) ||
      !Array.isArray(registry.candidates)) {
    throw new Error('Structural registry missing: fail closed.');
  }
  const actual = new Set(snapshot.tables.map((t) => t.schema + '.' + t.name));
  const reused = sorted(registry.existing_reused.map((r) => r.table).filter(Boolean));
  const candidates = sorted(registry.candidates.map((r) => r.table).filter(Boolean));
  const missingReused = reused.filter((name) => !actual.has(name));
  const presentCandidates = candidates.filter((name) => actual.has(name));
  const absentCandidates = candidates.filter((name) => !actual.has(name));
  const appOnlyNames = sorted(appIndexNames);
  const sameNameRemote = snapshot.tables
    .filter((t) => appOnlyNames.includes(t.name))
    .map((t) => t.schema + '.' + t.name);
  const dataTables = snapshot.tables.filter((t) => ['r','p'].includes(t.kind));
  const schemaCounts = Object.fromEntries(
    sorted(snapshot.schemas).map((schema) => [
      schema, dataTables.filter((t) => t.schema === schema).length,
    ]),
  );
  return {
    schemaVersion: 'ce-db-reconciliation.v1',
    observedAtUtc: snapshot.observed_at_utc ?? null,
    source: {
      database: snapshot.database_name ?? null,
      method: snapshot.method ?? null,
      catalogVersion: snapshot.schema_version,
      registryScope: registry.scope ?? 'UNKNOWN',
      registryApproval: registry.approval_state ?? 'UNKNOWN',
    },
    counts: {
      schemas: snapshot.schemas.length,
      relations: snapshot.tables.length,
      dataTables: dataTables.length,
      columns: snapshot.columns.length,
      constraints: snapshot.constraints.length,
      policies: snapshot.policies.length,
      functions: snapshot.functions.length,
      localMigrations: migrationInventory.migrationFiles ?? 0,
      collidingMigrationNumbers: migrationInventory.collidingNumbers ?? 0,
    },
    schemaCounts,
    comparison: {
      mode: 'CROSSWALK_CANDIDATE_NOT_FULL_PARITY',
      reusedPresent: reused.filter((name) => actual.has(name)),
      reusedMissingOrRenamed: missingReused,
      candidatesFoundInRemote: presentCandidates,
      candidatesNotFoundInRemote: absentCandidates,
      localAppIndexNames: appOnlyNames.length,
      localAppNamesAlsoInRemote: sameNameRemote,
      note: 'The app index describes a PGLite/runtime store; absence in Supabase is NOT drift.',
    },
    migrations: {
      status: 'HOLD_HUMAN',
      localCollisionNumbers: (migrationInventory.collisions ?? []).map((c) => c.number),
      appliedRemoteHistory: 'NOT_VERIFIED',
      warning: 'No migration may be automatically numbered, applied, deleted or declared rolled out.',
    },
    assessment: {
      status: 'INVENTORIED_ONLY',
      releaseGate: 'HOLD_HUMAN',
      kernelAdmission: false,
      authorizationToWrite: false,
      checksNotPerformed: [
        'contents/record quality', 'normative validity and licenses',
        'source and parser runtime', 'RLS effective enforcement',
        'remote migration history and dependencies',
        'clinical or independent review',
      ],
    },
  };
}

function args(argv) {
  const obj = {};
  for (let i = 0; i < argv.length; i += 2) {
    if (!['--snapshot','--output'].includes(argv[i]) || !argv[i + 1])
      throw new Error('Usage: node scripts/ce-reconcile-supabase-catalog.mjs --snapshot FILE --output FILE');
    obj[argv[i].slice(2)] = argv[i + 1];
  }
  if (!obj.snapshot || !obj.output) throw new Error('Missing --snapshot or --output');
  return obj;
}

function main() {
  const {snapshot,output} = args(process.argv.slice(2));
  const snapshotBytes = readFileSync(resolve(snapshot));
  const catalog = JSON.parse(snapshotBytes);
  const registry = JSON.parse(readFileSync(join(root,'contracts/cko-governance/structural-table-registry.v1.json'),'utf8'));
  const appIndexContent = readFileSync(join(root,'src/lib/banco/indice.ts'),'utf8');
  const appNames = [...appIndexContent.matchAll(/^\s*name:\s*"([a-zA-Z_0-9]+)"/gm)].map((m) => m[1]);
  const dir = join(root,'migrations');
  const entries = readdirSync(dir).filter((p) => /^\d{4}_.+\.sql$/.test(p))
    .map((name) => ({name,content:readFileSync(join(dir,name),'utf8')}));
  const migrations = inventoryMigrations(entries);
  const report = reconcile(catalog,registry,migrations,appNames);
  report.source.snapshotSha256 = sha256(snapshotBytes);
  const outputPath = resolve(output);
  mkdirSync(dirname(outputPath),{recursive:true});
  writeFileSync(outputPath,JSON.stringify(report,null,2)+'\n',{mode:0o600});
  console.log(JSON.stringify({
    status:report.assessment.status,gate:report.assessment.releaseGate,
    schemas:report.counts.schemas,tables:report.counts.dataTables,
    columns:report.counts.columns,localCollisionNumbers:report.counts.collidingMigrationNumbers,
    missingReused:report.comparison.reusedMissingOrRenamed.length,output:outputPath,
  }));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch(e) {
    console.error('CE inventory: NOT_RUN / ERROR: ' + e.message);
    process.exitCode = 1;
  }
}
