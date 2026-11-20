# FIND-SPE-SQL-LEXICAL-SPOOFING-20261031 — W16

**Status:** CANDIDATE_VALIDATOR_CORRECTED / KERNEL_NOT_ADMITTED / HOLD_HUMAN. **Repository:** IndiciumFIN/dev-chatgpt-workspace, PR #24.

## FIND → applicable policy → validator

The W15 private-archive preflight used a regex against raw pgTAP test SQL. A commented-out or string-literal `SELECT plan(1)` or `ROLLBACK;` could satisfy the source-integrity gate even though the statement would never execute. This is a false-green risk, not evidence that the historical private source is defective.

Policies: `AGENTS.project.md`, `docs/governance/04-work-order-model.md`, and W15 fail-closed source integrity. The correction in `scripts/spe_check_original_db_archive.py` masks PostgreSQL line comments, nested block comments, single/double-quoted strings and dollar-quoted bodies before checking plan/rollback syntax. Unterminated lexical constructs fail closed. The output includes `test_sql_lexical_pass` and retains `postgres_execution: NOT_RUN`, `pgtap_execution: NOT_RUN`, and `release_decision: HOLD_HUMAN`.

## TASK → WO → Kernel admission

- TASK-SPE-W16-01: add lexical preflight and synthetic negative/positive regressions; CI checks this validator, not the private source archive.
- WO candidate: `WO-SPE-DB-FIRST-20261026-001` (existing candidate); no new corporate authorization or Kernel admission is implied.
- Required independent work: verify the original 47 migrations and 17 pgTAP tests against this strengthened preflight in a private workspace; run PostgreSQL 16/pgTAP and grading RPC negative tests in a disposable database; obtain security, editorial/clinical, and governance approvals.
- Kernel admission: **NOT_SUBMITTED / HOLD_HUMAN**. No authority to promote or merge.

## Evidence and limitations

Seven additional synthetic regression cases cover commented plan, commented rollback, nested comments, quoted plan, dollar-quoted rollback, unclosed comment, and valid comments around executable tokens. Source-code unit tests cannot establish that historical pgTAP assertions execute successfully or that RLS protects legacy SECURITY DEFINER functions. Private SQL, ZIP, answer keys, credentials, and patient data remain outside this public repository.

**Decision:** HOLD_HUMAN; no production Supabase change, no publication, no merge to main.
