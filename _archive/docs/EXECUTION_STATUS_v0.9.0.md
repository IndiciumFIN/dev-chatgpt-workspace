# CE Public Backup v0.9.0 — Canonical bindings (isolated)

## Source boundary
Only the v0.8.0 worktree derived from `calculadoras-enfermagem-backup.zip` was processed. No GitHub, Supabase, or other repository was accessed or changed. Crosswalk remains deferred.

## Implemented
- `scripts/audit-canonical-bindings.mjs`: source-derived route and template candidate register, SHA-256 per route source, detection of duplicate route declarations and invalid template kinds.
- `registers/canonical/route-template-register.v1.json`: one record per discovered route source file; no unverified association is marked PASS.
- `npm run audit:canonical` command in `package.json`.

## Execution evidence
- 23 route source files; 22 declarations; 14 candidate template bindings; 9 unverified; zero duplicate route declarations.
- `node scripts/check-isolation.mjs`: seven PASS.
- `node scripts/check-context-invariants.mjs`: seven PASS.
- A binding marked CANDIDATE_REQUIRES_RUNTIME_PROOF is a lexical, path-based suggestion, not a tested runtime template association.

## Open FINDs
- FIND-CE09-001: nine route source records without a verified template binding (includes nonpage routing modules and dynamic subpages); need manual rules and runtime validation.
- FIND-CE09-002: render parity for public, subscriber and administrator remains untested; screenshot comparison cannot be inferred from source alone.
- FIND-CE09-003: full install/build/typecheck suite not rerun here; release blocked pending these tests and source/license review.
- FIND-CE09-004: localStorage is browser-scoped and mutable; audit event log is operational, not tamper-proof. Remote integration remains forbidden.

## Promotion status
HOLD. No production deployment, deletion, crosswalk, or remote database integration was performed. No schema or normative atom was represented as certified.
