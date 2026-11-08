-- WUTRIB-WO-PLAN-017 | AUD-017-12 / migration v0.4.3
-- Additive only: cover four specific PostgreSQL FK columns reported by Supabase Performance Advisor.
-- Target project ONLY SOT-10-09-2026 (hcqukuotfwflmebjygam), private schema wutrib.
-- No policy change, no table rewrite, no ERP access, no fiscal data reads/writes.
-- Small tables (legacy demo_casefiles one synthetic record; others zero): ordinary transactional index.
-- Monitor in a larger environment; use CREATE INDEX CONCURRENTLY outside a migration transaction if justified.
create index if not exists demo_casefiles_project_fk_v043_idx
  on wutrib.demo_casefiles (project_code);
create index if not exists demo_casefiles_wo_fk_v043_idx
  on wutrib.demo_casefiles (wo_code);
create index if not exists demo_org_events_casefile_fk_v043_idx
  on wutrib.demo_org_audit_events_v1 (casefile_id);
create index if not exists demo_org_casefiles_membership_fk_v043_idx
  on wutrib.demo_org_casefiles_v1 (org_code, actor_id);
-- No indexes are dropped. Unused-index warnings from an empty schema are not sufficient
-- evidence for removal; review query plans and workload later.
