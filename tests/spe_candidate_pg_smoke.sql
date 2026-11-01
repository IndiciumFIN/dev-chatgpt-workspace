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

-- Defense-in-depth: a real answer-key fixture must be invisible even if a
-- future migration accidentally grants SELECT to a public-facing role.
-- Grant + data are deliberately transaction-local and rolled back.
BEGIN;
INSERT INTO spe_candidate.sources (source_id, title, source_kind)
VALUES ('SPE.SRC.rls_fixture', 'RLS fixture only', 'OTHER_DOCUMENT');
INSERT INTO spe_candidate.exams (exam_id, institution, position_title, exam_source_id)
VALUES ('SPE.EXAM.rls_fixture', 'CI only', 'RLS fixture', 'SPE.SRC.rls_fixture');
INSERT INTO spe_candidate.questions (question_id, exam_id, ordinal_in_source, stem)
VALUES ('SPE.Q.rls_fixture', 'SPE.EXAM.rls_fixture', 1, 'Private question fixture');
INSERT INTO spe_candidate.choices (question_id, choice_key, choice_text, ordinal)
VALUES ('SPE.Q.rls_fixture', 'A', 'Private choice fixture', 1);
INSERT INTO spe_candidate.answer_keys (answer_key_id, exam_id, source_id)
VALUES ('SPE.AK.rls_fixture', 'SPE.EXAM.rls_fixture', 'SPE.SRC.rls_fixture');
INSERT INTO spe_candidate.answer_key_items (answer_key_id, exam_id, question_id, choice_key)
VALUES ('SPE.AK.rls_fixture', 'SPE.EXAM.rls_fixture', 'SPE.Q.rls_fixture', 'A');
DO $checks$
BEGIN
  IF (SELECT count(*) FROM spe_candidate.sources WHERE source_id = 'SPE.SRC.rls_fixture') <> 1
     OR (SELECT count(*) FROM spe_candidate.answer_key_items WHERE answer_key_id = 'SPE.AK.rls_fixture') <> 1 THEN
    RAISE EXCEPTION 'Missing private fixture: zero visible rows would be false assurance';
  END IF;
END
$checks$;
GRANT USAGE ON SCHEMA spe_candidate TO anon, authenticated;
GRANT SELECT ON spe_candidate.sources, spe_candidate.answer_key_items TO anon, authenticated;
SET ROLE anon;
DO $checks$
BEGIN
  IF NOT has_table_privilege(current_user, 'spe_candidate.answer_key_items', 'SELECT')
     OR NOT row_security_active('spe_candidate.answer_key_items'::regclass) THEN
    RAISE EXCEPTION 'anon negative test not exercising granted SELECT under active RLS';
  END IF;
  IF (SELECT count(*) FROM spe_candidate.sources) <> 0
     OR (SELECT count(*) FROM spe_candidate.answer_key_items) <> 0 THEN
    RAISE EXCEPTION 'anon bypassed candidate source or answer-key RLS';
  END IF;
END
$checks$;
RESET ROLE;
SET ROLE authenticated;
DO $checks$
BEGIN
  IF NOT has_table_privilege(current_user, 'spe_candidate.answer_key_items', 'SELECT')
     OR NOT row_security_active('spe_candidate.answer_key_items'::regclass) THEN
    RAISE EXCEPTION 'authenticated negative test not exercising granted SELECT under active RLS';
  END IF;
  IF (SELECT count(*) FROM spe_candidate.sources) <> 0
     OR (SELECT count(*) FROM spe_candidate.answer_key_items) <> 0 THEN
    RAISE EXCEPTION 'authenticated bypassed candidate source or answer-key RLS';
  END IF;
END
$checks$;
RESET ROLE;
ROLLBACK;
DO $checks$
BEGIN
  IF EXISTS (SELECT 1 FROM spe_candidate.sources WHERE source_id = 'SPE.SRC.rls_fixture')
     OR EXISTS (SELECT 1 FROM spe_candidate.answer_key_items WHERE answer_key_id = 'SPE.AK.rls_fixture') THEN
    RAISE EXCEPTION 'Private fixture persisted after rollback';
  END IF;
  IF has_table_privilege('anon', 'spe_candidate.answer_key_items', 'SELECT')
     OR has_table_privilege('authenticated', 'spe_candidate.answer_key_items', 'SELECT') THEN
    RAISE EXCEPTION 'Temporary answer-key grants persisted after rollback';
  END IF;
END
$checks$;
