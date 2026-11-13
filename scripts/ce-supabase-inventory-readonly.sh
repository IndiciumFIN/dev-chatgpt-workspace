#!/usr/bin/env bash
# CE Best Excellence — Supabase/PostgreSQL INVENTORY ONLY.
# No migration, no DDL, no table contents, no token handling, no deployment.
set -euo pipefail
umask 077

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if ! command -v psql >/dev/null 2>&1 || ! command -v node >/dev/null 2>&1; then
  echo "NOT_RUN: psql and node must be installed." >&2
  exit 2
fi
if [[ -z "${PGSERVICE:-}" && ( -z "${PGHOST:-}" || -z "${PGDATABASE:-}" ) ]]; then
  echo "NOT_RUN: configure PGSERVICE or PGHOST + PGDATABASE, using a read-only database role." >&2
  echo "Use PGPASSFILE/.pgpass for passwords. A Supabase access token is NOT a PostgreSQL password." >&2
  exit 2
fi

OUT_ROOT="${CE_REPORT_DIR:-${TMPDIR:-/tmp}/ce-db-reconcile}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$OUT_ROOT/$STAMP"
mkdir -p "$OUT"
SNAPSHOT="$OUT/catalog.json"
REPORT="$OUT/reconciliation.json"
GOVERNANCE="$OUT/governance-aggregate.json"

# Defense in depth: read-only at both session and transaction levels.
export PGOPTIONS="${PGOPTIONS:-} -c default_transaction_read_only=on -c statement_timeout=30000"
psql -X -q -A -t -v ON_ERROR_STOP=1 \
  -f "$ROOT/scripts/sql/ce-supabase-catalog-readonly.sql" > "$SNAPSHOT"

psql -X -q -A -t -v ON_ERROR_STOP=1 \
  -f "$ROOT/scripts/sql/ce-supabase-governance-readonly.sql" > "$GOVERNANCE"

node "$ROOT/scripts/ce-reconcile-supabase-catalog.mjs" \
  --snapshot "$SNAPSHOT" --output "$REPORT"

echo "Catalog: $SNAPSHOT"
echo "Reconciliation: $REPORT"
echo "Governance aggregate: $GOVERNANCE"
echo "Authority: INVENTORY_ONLY / HOLD_HUMAN. Review before committing sanitized evidence."
