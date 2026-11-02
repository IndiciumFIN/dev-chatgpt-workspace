# CE BACKUP PUBLICO — v1.8.0

Authority: backup v1.7.0 ONLY. No Github, Supabase, remote database, or crosswalk.

## Applied
- `scripts/check-local-runtime.mjs`: offline, deterministic preflight of lockfile root specs, declared resolutions, installed React/Vite/TypeScript, executables, and actual isolation validator execution.
- `package.json`: `npm run audit:runtime:local`.
- `audit/execution/local-runtime-latest.json`: observed result. A failing readiness gate is not a failed test of project code.

## Verified
- Offline preflight: structural checks pass; runtime readiness FAIL due to missing node_modules and binaries; zero screenshots.
- `node scripts/check-isolation.mjs`: PASS seven checks.
- `node scripts/check-context-invariants.mjs`: PASS seven checks.
- `node --experimental-strip-types scripts/test-local-publication.mjs`: PASS.
- `node scripts/audit-surface-bindings-v2.mjs`: PASS 23/23, visual homologations 0.

## Open FINDs
- FIND-LOCAL-DEPENDENCIES: no local node_modules; registry DNS previously failed. Until dependencies are available, no valid `npm run build`/`npm run typecheck` or actual React/Vite renders can be asserted.
- FIND-VISUAL-EVIDENCE: no screenshots of `/admin`, `/assinante`, or public route; parity not established.
- FIND-LOCAL-AUDIT-TRUST: `localStorage` changes can be tampered with; audit log is operational, not tamper-proof.

## Recovery instructions
Inside extracted backup: `npm ci` (only when npm packages can be provisioned in an authorized manner); then `npm run audit:runtime:local`; `npm run typecheck`; `npm run build`; start preview and capture actual pages. No authorization to enable remote database. Never publish fabricated UI images.
