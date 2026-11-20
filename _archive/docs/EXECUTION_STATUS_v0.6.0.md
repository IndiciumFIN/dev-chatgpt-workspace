# Isolated public backup — v0.6.0

Scope: ONLY CE_PUBLIC_WORKTREE_v0.5.0, extracted to a new independent worktree. No GitHub interaction, no external database mutation.

## Implemented
- `/admin` is a local-only editor, sharing the existing validated `localStorage` workshop component with `/oficina-local`.
- `/assinante` shows the same browser-local catalog and desired visibility; no remote catalog request.
- Both tool route loaders resolve the same local catalog contract, without contacting `source.functions`.
- Database access and migration are rejected by default with `REMOTE_INTEGRATION_BLOCKED`; **this is a fail-closed technical safeguard, not authorization for remote integration**.
- Navigation account slot exposes local administration/subscriber routes.
- `npm run audit:isolation` checks six basic invariants.

## Important constraints / not complete
- The original remote `source.functions` and auth modules remain in the backup for forensic/reference purposes; they are not deleted. More runtime routes may still use them; this package is NOT a proof of full network isolation.
- SSR cannot read browser localStorage; the loaders initially use catalog defaults on the server and browser state on navigation. Full SSR parity requires a separately designed client-side hydration boundary.
- Local 'published' is a per-browser preview flag, not authorization to publicly release content.
- Source maps, dynamic routes, visual cross-browser audit, clinical review, SEO tests and full security verification are not completed.
- `npm ci` was attempted but timed out in this environment; therefore build/typecheck and full test suite were NOT verified for v0.6.0.
- `npm run audit:isolation` passed six structural controls, which are not a comprehensive security audit.
- Remote migration stays blocked even when DATABASE_URL exists, unless the explicit integration flag is supplied. The integration flag MUST NOT be enabled until independent schema/policy/evidence approval; blocking by this flag alone is insufficient for production approval.

## Scope lock
Do not reconcile or compare this worktree against any other repository. No remote integration before complete technical requirements and explicit human approval. Historical file archiving remains dry-run only.
