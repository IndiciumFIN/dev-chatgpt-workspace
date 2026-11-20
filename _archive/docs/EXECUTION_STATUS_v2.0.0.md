# CE public backup v2.0.0 — visual capture gate

Scope: ONLY v1.9.0 backup. No GitHub, Supabase, or remote integration.

Implemented `npm run audit:visual:capture`: localhost-only origin; 3 surfaces × 3 viewports; Chromium screenshots with PNG SHA-256 in `audit/visual/current/evidence.json`; fail-closed when no real screenshot; success means capture complete, NEVER visual approval.

Current result: FAIL (playwright package unavailable). 0 of 9 screenshots produced. Build and TS not run. Existing static isolation, context, publication and route checks passed.

Requires app running locally on localhost port 8080 and `playwright` plus browser available. Screenshot gate does not connect to remote services. Human visual review remains HOLD.
