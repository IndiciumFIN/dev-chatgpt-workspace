# FIND-SPE-CANDIDATE-SQL-CORRUPTION-20261031 — migration 0001 not executable

**Status:** CANDIDATE_FIX / HOLD_HUMAN. **Release:** prohibited. **Environment:** isolated candidate branch and disposable PostgreSQL CI only.

## FIND / source

Readback of `migrations/candidate/simulados-enfermagem/0001_spe_core_candidate.sql` at blob `2db1b8b0a829e59735e096eb085e1b21f4c87d53` found four repeated `COMMIT;` blocks, three extraneous `),` suffixes, and an unterminated source ID CHECK regex. The 20,718-byte candidate file was not syntactically executable. This is distinct from the historical 47-migration ZIP, which remains outside the repository.

## Applicable policy and validator

- Policy: `AGENTS.project.md`, `docs/governance/04-work-order-model.md`, existing W07 and W12 security FINDs.
- Validator: `.github/workflows/spe-candidate-postgres-smoke.yml`, `tests/spe_candidate_pg_smoke.sql`; use PostgreSQL 16 in a disposable CI service, with no remote Supabase connection or deployment credentials.
- TASK candidate: P0-04 / W11 database-execution prerequisite, formal TASK registration pending.
- WO candidate: `WO-SPE-DB-FIRST-20261026-001` (`docs/simulados-enfermagem/wo-candidate.v0.1.0.json`), **NOT_SUBMITTED**, no approvals. No Kernel admission is inferred from a passing test.

## Code change / controlled execution

- Reconstructed a **single** nine-table candidate `0001` migration, restored the source ID CHECK expression, and removed repeated invalid SQL; resulting file is 5,463 bytes.
- Added disposable PostgreSQL CI applying **only** candidate `0001` and `0002` after creating isolated `anon` and `authenticated` test roles.
- Checks: SQL compilation/application, 13 expected tables with RLS, absence of public/schema/answer-key access, invalid source IDs rejected, rollback of test fixture, direct negative SELECT as both roles.
- `0003_rpc_grade_gate_HOLD.sql` is intentionally **not applied**. Historical 47 migrations, 17 pgTAP tests, actual legacy RPCs and full application E2E remain **NOT_RUN** until original source and an approved test plan are available.

## Gate / promotion

This is code repair and isolated candidate testing, **not** approval to deploy, to change Supabase production, to release answer keys, or to merge. Remain **HOLD_HUMAN** until real Kernel admission, independent security review, original SQL replay and pgTAP tests, caller migration, CI at reviewed merge SHA, main protection/review and homologation. Preserve existing MEM design system and all unrelated branches.
