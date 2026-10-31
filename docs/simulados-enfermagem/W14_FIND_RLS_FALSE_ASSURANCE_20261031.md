# FIND-SPE-RLS-FALSE-ASSURANCE-20261031 — candidate answer-key isolation

**State:** CANDIDATE_FIX / HOLD_HUMAN. **Scope:** `IndiciumFIN/dev-chatgpt-workspace`, PR #24, disposable PostgreSQL only. No clinical content publication, production database write or main merge is authorized by this FIND.

## FIND → applicable policy

Prior smoke tests exercised `spe_candidate.sources` with temporary SELECT grants, but did not insert a real answer-key row and then test its visibility after an explicit grant. A role denied access by missing privileges could pass an answer-key check without proving RLS protection. This is a **test-coverage gap**, not evidence of an exploitable production database.

Policies: `AGENTS.project.md`, `docs/governance/04-work-order-model.md`, W07/W12/W13 security findings; fail closed on unverified answer-key access.

## Validator → TASK → WO

- Validator: `tests/spe_candidate_pg_smoke.sql`, executed by `.github/workflows/spe-candidate-postgres-smoke.yml` on PostgreSQL 16 with disposable roles `anon` and `authenticated`.
- Candidate TASK: P0-03/P0-04, prove candidate answer-key RLS under intentionally granted SELECT; never use patient or licensed exam data.
- Candidate WO: `WO-SPE-DB-FIRST-20261026-001` in `docs/simulados-enfermagem/wo-candidate.v0.1.0.json`; status `draft`, `kernel_admission=NOT_SUBMITTED`. **No approval, signature or admission is asserted.**

## Isolated implementation and negative checks

A transaction inserts synthetic source, exam, question, choice, answer key and answer-key item. Before switching roles, the test asserts that both the source and answer-key fixture actually exist. It temporarily grants schema USAGE and table SELECT to `anon` and `authenticated`; each role must have SELECT privilege, must have active row security, and must observe **zero** rows from both tables. Finally the transaction rolls back and the test asserts that neither fixtures nor temporary answer-key grants survived.

This test intentionally covers the **candidate** schema only; it does not validate the original v1.4.0 schema, `SECURITY DEFINER` RPCs, the 47 historical migrations, 17 pgTAP files, downstream callers or live identity/session policies.

## Admission / audit / promotion

Kernel admission: **NOT_SUBMITTED**. Independent security reviewer: **PENDING**. Rights/clinical review: **NOT_APPLICABLE_TO_SYNTHETIC_FIXTURES**; production release approvals remain **PENDING**. The CI result and SHA must be attached separately after execution; a passing candidate test does not satisfy the original database P0 gates.

**Decision:** HOLD_HUMAN. Do not execute `0003_rpc_grade_gate_HOLD.sql`, publish a new grading RPC, change Supabase production or merge to `main` until the required governance and release gates are evidenced.
