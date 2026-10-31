-- Disposable PostgreSQL only. This does not validate the 47 historical migrations.
-- Run after 0001_spe_core_candidate.sql and 0002_spe_source_lineage_candidate.sql.
DO $checks$
DECLARE
  table_count integer;
  rls_count integer;
  role_name text;
BEGIN
  SELECT count(*), count(*) FILTER (WHERE c.relrowsecurity)
    INTO table_count, rls_count
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'spe_candidate' AND c.relkind = 'r';
  IF table_count <> 13 OR rls_count <> 13 THEN
    RAISE EXCEPTION 'Expected 13 candidate tables with RLS, found % tables and % RLS', table_count, rls_count;
  END IF;
  FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF has_schema_privilege(role_name, 'spe_candidate', 'USAGE') THEN
      RAISE EXCEPTION '% unexpectedly has schema USAGE', role_name;
    END IF;
    IF has_table_privilege(role_name, 'spe_candidate.answer_key_items', 'SELECT') THEN
      RAISE EXCEPTION '% unexpectedly has answer-key SELECT', role_name;
    END IF;
    IF has_table_privilege(role_name, 'spe_candidate.questions', 'SELECT') THEN
      RAISE EXCEPTION '% unexpectedly has question SELECT', role_name;
    END IF;
  END LOOP;
  IF EXISTS (
    SELECT 1 FROM pg_namespace n
    CROSS JOIN LATERAL aclexplode(COALESCE(n.nspacl, acldefault('n', n.nspowner))) acl
    WHERE n.nspname = 'spe_candidate'
      AND acl.grantee = 0 AND acl.privilege_type = 'USAGE'
  ) THEN
    RAISE EXCEPTION 'PUBLIC unexpectedly has candidate schema USAGE';
  END IF;
END
$checks$;

-- A valid candidate row is rolled back. Invalid identifiers must be rejected.
BEGIN;
INSERT INTO spe_candidate.sources (source_id, title, source_kind)
VALUES ('SPE.SRC.ci_smoke', 'CI fixture only', 'OTHER_DOCUMENT');
DO $checks$
BEGIN
  BEGIN
    INSERT INTO spe_candidate.sources (source_id, title, source_kind)
    VALUES ('INVALID', 'CI invalid fixture', 'OTHER_DOCUMENT');
    RAISE EXCEPTION 'INVALID source_id unexpectedly accepted';
  EXCEPTION WHEN check_violation THEN
    NULL;
  END;
END
$checks$;
ROLLBACK;
DO $checks$
BEGIN
  IF EXISTS (SELECT 1 FROM spe_candidate.sources WHERE source_id = 'SPE.SRC.ci_smoke') THEN
    RAISE EXCEPTION 'Candidate fixture persisted despite ROLLBACK';
  END IF;
END
$checks$;
