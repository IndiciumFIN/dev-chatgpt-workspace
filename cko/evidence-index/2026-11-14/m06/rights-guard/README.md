# SOT — External AI TDM rights guard (draft, not deployed)

**Source examined:** SOT `deepseek-atomize` **v5**, SHA-256 `2664031bd31a0c089f98c24463f805a1d77295c461a0766a5e1cc4afee4ddef7`, read from connected Supabase on 2026-11-14. **No live SOT code, grants, data, authentication settings or deployed functions were changed.**

## Deliverables
- `external-ai-rights-guard.mjs`: pure **fail-closed** decision function for the exact `source → document → fragment`, raw-origin and fragment-text SHA-256, operation, provider, rights evidence, privacy and second-party approval, validity interval and revocation.
- `deepseek-atomize.v6.candidate.ts`: proposed v5 adaptation, reads source/document/grant, computes local text SHA and refuses to call DeepSeek unless preflight allows. Not a replacement until reviewed and deployed deliberately.
- `SCHEMA_PROPOSAL_DO_NOT_APPLY.sql`: proposal for a new SOT per-fragment grant registry, **not executed**, with RLS and no `anon/authenticated` grants.
- `external-ai-rights-guard.test.mjs`: Node built-in tests including missing/expired/altered grants, source FKs, PII, and preflight-before-outbound test.

## Safety
The SOT database **does not currently have** `corpus_external_ai_permissions`. Thus the proposed integration would return `HOLD_RIGHTS_REGISTRY_UNAVAILABLE` for all actual requests until a separately reviewed rights registry, migration and admissions process exist. Do **not** deploy the code or apply the SQL as a quick fix.

The hypothetical positive fixture tests the boolean logic, **not** that real-world external provider rights exist. All 25 negative scenarios must remain denied. The unit test does **not** prove protection against concurrency, RLS bypass, secrets exposure, dynamic upstream behavior, or real copyright permissions.

**Architectural requirements before deploy:** reconcile the SOT-isolation ADR, source acquisition and external-AI contractual terms, privacy/LGPD, independent rights reviewer, DB transaction/TOCTOU, rollback, load and rate limiting, auth, failure logging without raw text, versioned model/purpose, RLS and backups. Only a reviewed and approved WO may update production.

**Test:** `node --test cko/evidence-index/2026-11-14/m06/rights-guard/external-ai-rights-guard.test.mjs`.
