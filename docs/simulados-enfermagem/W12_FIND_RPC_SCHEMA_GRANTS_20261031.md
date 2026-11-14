# FIND-SPE-RPC-SCHEMA-GRANT-20261031 — static ACL blind spot

Status: **CANDIDATE_FIX / HOLD_HUMAN / NO_DATABASE_EXECUTION**.

## Finding and scope

The read-only scanner `scripts/spe_audit_rpc_answers.py` previously inspected only `GRANT EXECUTE ON FUNCTION api.evaluate_question...` and `api.evaluate_question_set...`. PostgreSQL also accepts `GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA api TO PUBLIC/anon/authenticated`. A function defined and then covered by such a grant in the same migration could be missed by the static scanner. This is a scanner coverage finding, **not** proof of a new production exposure.

## Traceability and policy

- Source: existing `W07_FIND_RPC_ANSWER_EXPOSURE_v0.1.0.md` and `P0-04` in `PENDENCIAS_CONSOLIDADAS_v0.2.0.json`.
- Policy references: `AGENTS.project.md`, `docs/governance/04-work-order-model.md`; no override or reduced release gate.
- Validator: `scripts/spe_audit_rpc_answers.py`, with positive and negative regressions in `scripts/test_spe_audit_rpc_answers.py` and `.github/workflows/spe-rpc-static-regression.yml`.
- Task candidate: **P0-04** (public grading RPC exposure), pending formal TASK registration and admission.
- Work order candidate: `WO-SPE-DB-FIRST-20261026-001` in `docs/simulados-enfermagem/wo-candidate.v0.1.0.json`; `kernel_admission=NOT_SUBMITTED`, `approvals=[]`.
- Execution scope: isolated static scanner and tests in this branch only; no SQL migration applied, no remote database access, no promotion.
- Release: **HOLD_HUMAN** until signed Kernel admission, independent security review, disposable PostgreSQL/pgTAP tests, consumer migration, and main protection/review evidence.

## Change and negative checks

The scanner now conservatively recognizes schema-wide EXECUTE grants and grantees followed by `WITH GRANT OPTION`. Added tests verify schema-wide PUBLIC grants are detected, a grant on an unrelated schema is not treated as an `api` grant, and grant-option suffixes do not conceal an `anon` grantee.

This remains a *static* signal: SQL comments, default PostgreSQL PUBLIC function privileges, grant/revoke ordering, inherited roles, schema-qualified ACLs across migration files, and actual RLS/SECURITY DEFINER behavior still require database-level verification. A clean static result **must not** be interpreted as safe public access. No release gate or existing HOLD was weakened.
