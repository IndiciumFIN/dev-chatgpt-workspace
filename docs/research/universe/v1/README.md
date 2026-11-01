# Coverage 100% — Research Hub and Citizen Participation (candidate contracts)
Scope: 30/30 original capabilities plus 6/6 citizen experiences, with 70/70 crosswalk aliases. This is **100% of documentation and repository custody**, not 100% functional delivery.
Canonical originals are preserved, not copied:
- docs/handoffs/research-hub-20261026/CAPACIDADES-30.csv
- docs/handoffs/research-hub-20261026/supabase-reconciliation-20261101/CROSSWALK-70.json
- PR #19 research implementation; PR #38 read-only Supabase topology bridge (its five changed files have been imported by their Git blobs).
Each candidate capability is a single contract in docs/research/universe/v1/contracts. UNIVERSE-36.json is an index, not a second content registry.
Every contract covers inputs, outputs, execution boundary, canonical mapping, privacy and identity controls, acceptance criteria, lineage, prior implementation state and outstanding development.
Supabase readback from this conversation on 2026-11-01: five research roots already in ce_platform and 23 private candidate tables in ce_research_candidate; these are not production-ready.
Important: in this wave, Supabase was not contacted or modified. Snapshot metadata should be revalidated before future DDL, auth policy or release work.
Remaining: 36 functional operations, 26 adapter reviews, 18 equivalence reviews, privacy/ethics, RBAC/RLS, server APIs, CI global and E2E, Kernel WO approval and release.
Kernel state remains HOLD_HUMAN / NOT_SUBMITTED; EMERGENCY_LOCKDOWN preserved; main and production unchanged.
To verify on this branch: node scripts/audit-research-universe.mjs
