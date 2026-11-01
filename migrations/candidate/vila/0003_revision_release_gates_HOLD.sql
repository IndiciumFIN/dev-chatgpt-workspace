-- W07 candidate follow-up. NOT APPLIED. Depends on 0002. Requires Kernel-admitted WO.
BEGIN;
CREATE TABLE vila_canonical_candidate.content_revisions (
 content_id text NOT NULL REFERENCES vila_canonical_candidate.content_objects(content_id),
 revision_number integer NOT NULL CHECK (revision_number > 0),
 source_id text NOT NULL REFERENCES vila_canonical_candidate.sources(source_id),
 payload jsonb NOT NULL,
 payload_sha256 text NOT NULL CHECK (payload_sha256 ~ '^[a-f0-9]{64}$'),
 created_at timestamptz NOT NULL DEFAULT now(),
 created_by_ref text NOT NULL,
 PRIMARY KEY(content_id,revision_number)
);
CREATE FUNCTION vila_canonical_candidate.prevent_revision_mutation()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN RAISE EXCEPTION 'Immutable content revision: append a new revision'; END $$;
CREATE TRIGGER revision_immutable BEFORE UPDATE OR DELETE ON vila_canonical_candidate.content_revisions
FOR EACH ROW EXECUTE FUNCTION vila_canonical_candidate.prevent_revision_mutation();
-- Make publication dependent on verified reviews for the same object.
CREATE FUNCTION vila_canonical_candidate.assert_release_reviews()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog AS $$
DECLARE s record; a record; r record;
BEGIN
 IF NEW.decision <> 'APPROVED' THEN RETURN NEW; END IF;
 IF NEW.kernel_evidence_ref IS NULL OR btrim(NEW.kernel_evidence_ref) = '' OR
    NEW.wo_ref IS NULL OR btrim(NEW.wo_ref) = '' OR NEW.decided_at IS NULL THEN
   RAISE EXCEPTION 'Release blocked: missing Kernel/WO evidence';
 END IF;
 SELECT content_id,outcome INTO s FROM vila_canonical_candidate.safety_reviews
 WHERE review_id=NEW.safety_review_id;
 SELECT content_id,template_id,outcome INTO a FROM vila_canonical_candidate.accessibility_reviews
 WHERE review_id=NEW.accessibility_review_id;
 IF NOT FOUND OR s.content_id IS DISTINCT FROM NEW.content_id OR s.outcome IS DISTINCT FROM 'PASS'
   OR a.outcome IS DISTINCT FROM 'PASS' OR
   (a.content_id IS DISTINCT FROM NEW.content_id) THEN
   RAISE EXCEPTION 'Release blocked: PASS reviews must belong to the content';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER release_review_gate BEFORE INSERT OR UPDATE ON vila_canonical_candidate.release_decisions
FOR EACH ROW EXECUTE FUNCTION vila_canonical_candidate.assert_release_reviews();
-- Prevent downgrading a review that an approved decision relies upon.
CREATE FUNCTION vila_canonical_candidate.protect_approved_review()
RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
 IF EXISTS (
 SELECT 1 FROM vila_canonical_candidate.release_decisions d
 WHERE d.decision='APPROVED' AND
 ((TG_TABLE_NAME='safety_reviews' AND d.safety_review_id=OLD.review_id)
 OR (TG_TABLE_NAME='accessibility_reviews' AND d.accessibility_review_id=OLD.review_id))
 ) THEN RAISE EXCEPTION 'Release review immutable while approved'; END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END $$;
CREATE TRIGGER safety_review_protect BEFORE UPDATE OR DELETE ON vila_canonical_candidate.safety_reviews
FOR EACH ROW EXECUTE FUNCTION vila_canonical_candidate.protect_approved_review();
CREATE TRIGGER accessibility_review_protect BEFORE UPDATE OR DELETE ON vila_canonical_candidate.accessibility_reviews
FOR EACH ROW EXECUTE FUNCTION vila_canonical_candidate.protect_approved_review();
ALTER TABLE vila_canonical_candidate.content_revisions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON vila_canonical_candidate.content_revisions FROM PUBLIC,anon,authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA vila_canonical_candidate FROM PUBLIC,anon,authenticated;
COMMIT;
