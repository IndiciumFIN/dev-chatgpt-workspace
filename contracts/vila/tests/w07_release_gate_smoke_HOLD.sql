-- W07 pgTAP-like transactional smoke test; requires isolated PostgreSQL and 0002+0003.
-- NO production use. Results are NOT_RUN.
BEGIN;
DO $$
DECLARE n integer;
BEGIN
 SELECT count(*) INTO n FROM pg_tables
 WHERE schemaname='vila_canonical_candidate' AND tablename='content_revisions';
 IF n<>1 THEN RAISE EXCEPTION 'Missing content revisions'; END IF;
 SELECT count(*) INTO n FROM pg_trigger
 WHERE tgname IN ('revision_immutable','release_review_gate','safety_review_protect','accessibility_review_protect') AND NOT tgisinternal;
 IF n<>4 THEN RAISE EXCEPTION 'Expected four W07 enforcement triggers; found %',n; END IF;
END $$;
ROLLBACK;
