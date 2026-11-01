# CE public backup — v1.0.0: explicit route contracts

Scope: CE_PUBLIC_BACKUP_ONLY. No GitHub/Supabase/kernel or remote database access was used.

## Changes
- `registers/canonical/route-contracts.v1.json`: explicit route/path/role/surface/template bindings for all files discovered in the v0.9.0 backup.
- `scripts/audit-canonical-bindings.mjs`: strict gate for unregistered, missing, duplicate, and mismatched routes and invalid template kinds.
- `scripts/test-canonical-contracts.mjs`: negative test proving an unregistered route fails, and restoration passes.
- `package.json`: `audit:canonical:test` command.
- regenerated `registers/canonical/route-template-register.v1.json` and audit snapshots.

## Observed results
- 23 route files; 22 `createFileRoute` declarations; 21 declared visual template bindings; 2 nonvisual entries; 0 missing/unregistered; 0 contract errors.
- Positive/negative contract test: PASS.
- isolation checks: 7 PASS; context checks: 7 PASS; local publication structural checks: 9 PASS.
- audit register refreshed and integrity verification: PASS.

## Limitations and open FINDs
- Route/template mappings are explicitly declared but still require runtime rendering and visual comparison; do not claim visual parity.
- Build, TypeScript, full tests, accessibility/SEO/clinical checks not completed in this round. Dependencies (`node_modules`) absent.
- LocalStorage is not tamper-proof and shared browser origin is required for shared local projections.
- All remote database calls remain blocked; approval to enable integration has not been given.
- The register is evidence of file content and declared contracts, not independent approval/homologation.
