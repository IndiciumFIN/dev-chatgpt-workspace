# CE PUBLIC BACKUP — v0.7.0 — 2026-10-21

## Scope
Only the isolated `calculadoras-enfermagem-backup.zip` derived working tree (v0.6.0 input); no repository integration, GitHub crosswalk, or remote persistence.

## Code changes
- `src/lib/db.ts`: `getSql()` and `getPglite()` unconditionally refuse access. No environment variable is allowed to unlock them in this branch.
- `scripts/migrate.mjs`: unconditional exit 4 before database connection.
- `src/routes/ferramentas.$slug.tsx` and `src/routes/assinante.ferramentas.$slug.tsx`: slug validation remains server-side against the bundled catalog, while local publication is read after client hydration, with fail-closed handling of malformed local records.
- `scripts/check-isolation.mjs`: changed assertions to test unconditional guards rather than merely checking for a variable name.

## Evidence collected
- `node scripts/check-isolation.mjs`: 7 PASS, 0 FAIL.
- `node scripts/check-context-invariants.mjs`: 7 PASS, 0 FAIL.
- `node scripts/audit-navigation-contracts.mjs`: executed; template binding still NOT_VERIFIED. Output is a static check, not a visual or end-to-end test.
- `node scripts/version-register.mjs snapshot correction-v070 after`: executed and registry updated.

## Blockers / not certified
- `npm ci`/`typecheck`/`build`/full tests NOT rerun: dependencies absent from this isolated working directory and package install was previously blocked.
- React loader, route rendering, accessibility, browser compatibility and screenshot parity require dependency-backed browser tests.
- `localStorage` is per origin/browser. It is not a shared publishing backend across devices/users.
- The public index and static SEO metadata still rely on bundled code. The runtime published-state of each tool is not SSR-indexable from browser-local storage, so do not claim fully synchronized SEO.
- A single live *local* draft-versus-published transaction with explicit approvals remains to be implemented.
- Full register/master-data atomization, normative validation and visual parity remain open.

## Isolation invariant
No remote DB integration is authorized or reachable through the wrapped SQL accessors in this version, even when `CDE_REMOTE_INTEGRATION_APPROVED=true`. Re-enabling remote integration requires a separately authorized and tested code change, not changing environment variables.
