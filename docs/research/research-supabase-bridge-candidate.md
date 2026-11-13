# Research Supabase Bridge - isolated candidate

Scope: read-only metadata contract, 5 existing ce_platform roots + 23 private ce_research_candidate tables.
No new DDL, no DML, no grants, no HTTP route, no DB credentials, no app remote access.
Bridge: scripts/research-supabase-bridge.mjs; tests: scripts/research-supabase-bridge.test.mjs.
Corrected conditional React report hook in src/components/research/research-hub.tsx.

Evidence from Supabase (2026-11-01): 23 tables, 54 indexes, 30 FKs, FORCE RLS 23/23, 0 policies/grants.
Access gate still closed, Kernel emergency lockdown active, WO NOT_SUBMITTED.
Health check returns PRIVATE_CANDIDATE_HOLD, never production readiness or admission.
Next: independently authorized least-privilege server identity, RLS ownership rules, integrations, E2E, LGPD/ethics.
