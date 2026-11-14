# FIND-SPE-ORIGINAL-ARCHIVE-INTEGRITY-20261031 — W15

**State:** SOURCE_INTEGRITY_PASS / DB_RUNTIME_NOT_RUN / HOLD_HUMAN. **Repository:** IndiciumFIN/dev-chatgpt-workspace, PR #24. **Source:** privately owned Google Drive archive simulados-platform-next-cms-v1.4.0.zip (Drive ID previously recorded in W07); no SQL, exam data, ZIP or patient data was uploaded to this public repository.

## FIND → policy → validator

R07 had verified only isolated candidate SQL and could not locate the historical 47 migrations and 17 pgTAP tests. In R08 the exact source ZIP was recovered through the owner's connected Drive, read-only. Policies: AGENTS.project.md, docs/governance/04-work-order-model.md, W07/W12/W13/W14; source integrity is not runtime validation or release authorization.

The deterministic validator scripts/spe_check_original_db_archive.py now fails closed on missing numbered files, malformed test syntax, CRC errors, unsafe ZIP paths, duplicate entries, encrypted entries, symlinks, oversized archives and SHA mismatch. It does not extract, print or commit source SQL. scripts/test_spe_check_original_db_archive.py contains synthetic positive/negative regressions and is included in the RPC static CI.

## Evidence — local read-only source verification

- Original private archive: **582,756 bytes**, SHA-256 **5cf346be3e823b192395ad898a7798b6375b23077714353d2817a8697fe59f47**.
- ZIP CRC: PASS. Duplicate members, unsafe paths, symlinks, encrypted entries: **0**.
- Historical migrations: **47/47**, contiguous 0001 through 0047, valid UTF-8.
- Original database tests: **17/17**, contiguous 001 through 017, with static SELECT plan(...) and ROLLBACK; syntax in all 17.
- **57** static occurrences of SECURITY DEFINER in historical migrations. This is a lexical count, not an ACL/runtime safety determination.
- Local Python regression suite for the expanded validator: **8/8 PASS**; committed CI subset: **5 synthetic tests**, subject to GitHub Actions readback.
- Source integrity: **PASS**. PostgreSQL replay of 47 historical migrations: **NOT_RUN**. pgTAP runtime: **NOT_RUN**. Legacy RPC runtime, role isolation, caller E2E: **NOT_RUN**.

The original ZIP stays private and is not attached to CI. The CI checks the validator against synthetic fixtures only. Source hashes and counts are metadata, not proof of migration execution.

## TASK → WO → admission → audit → promotion

TASK candidate: P0-01 (original source provenance) and P0-02/P0-03 (disposable PostgreSQL 16 replay and 17 pgTAP runtime checks). WO candidate: WO-SPE-DB-FIRST-20261026-001 (docs/simulados-enfermagem/wo-candidate.v0.1.0.json), **draft / Kernel admission NOT_SUBMITTED**. Do not self-approve.

Next action: prepare a disposable PostgreSQL 16 runner that consumes the private archive without publishing it, run migrations in order with isolated Supabase-like roles/extensions, execute all 17 pgTAP files and negative direct/indirect grading RPC tests, and persist redacted logs with SHA. No production Supabase writes, no candidate REVOKE deployment, no main merge. Independent security and clinical/editorial approval, Kernel admission, and main protection/review remain required.

**Promotion decision:** HOLD_HUMAN.
