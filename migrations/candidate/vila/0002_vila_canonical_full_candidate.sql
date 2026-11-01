-- VILA W05 Candidate canonical schema v0.3.0. NOT APPLIED. Kernel WO HOLD_HUMAN.
-- Private schema, no public client grants, no child accounts, sensitive metrics or medical data.
BEGIN;
CREATE SCHEMA IF NOT EXISTS vila_canonical_candidate;
REVOKE ALL ON SCHEMA vila_canonical_candidate FROM PUBLIC, anon, authenticated;
CREATE TABLE vila_canonical_candidate.sources (
 source_id text PRIMARY KEY, title text NOT NULL, origin_uri text, license_status text NOT NULL DEFAULT 'UNKNOWN'
 CHECK (license_status IN ('UNKNOWN','ELIGIBLE','REFERENCE_ONLY','LICENSE_BLOCKED')),
 checksum_sha256 text CHECK(checksum_sha256 ~ '^[a-f0-9]{64}$'),
 checked_at timestamptz, provenance jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE vila_canonical_candidate.content_objects (
 content_id text PRIMARY KEY, family text NOT NULL CHECK(family IN
 ('educational','story','mission','game','activity','coloring','emotion','adult_guide','printable','discovery','quiz')),
 slug text NOT NULL UNIQUE, age_min smallint CHECK(age_min BETWEEN 0 AND 17),
 age_max smallint CHECK(age_max BETWEEN 0 AND 17), safety_level text NOT NULL DEFAULT 'REVIEW_REQUIRED'
 CHECK(safety_level IN ('REVIEW_REQUIRED','EDUCATIONAL','RESTRICTED')),
 state text NOT NULL DEFAULT 'CANDIDATE' CHECK(state IN
 ('CANDIDATE','REVIEW_REQUIRED','ASSURED','ELIGIBLE_FOR_RELEASE','RELEASED','RETIRED')),
 source_id text NOT NULL REFERENCES vila_canonical_candidate.sources(source_id),
 version integer NOT NULL DEFAULT 1 CHECK(version>0),
 payload jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now(), CHECK(age_max IS NULL OR age_min IS NULL OR age_max>=age_min)
);
CREATE TABLE vila_canonical_candidate.translations (
 content_id text NOT NULL REFERENCES vila_canonical_candidate.content_objects(content_id),
 locale text NOT NULL CHECK(locale ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$'),
 title text NOT NULL, summary text, body jsonb NOT NULL DEFAULT '{}'::jsonb,
 state text NOT NULL DEFAULT 'DRAFT' CHECK(state IN ('DRAFT','REVIEW_REQUIRED','APPROVED')),
 PRIMARY KEY(content_id,locale)
);
CREATE TABLE vila_canonical_candidate.characters (
 character_id text PRIMARY KEY, name text NOT NULL, role_key text NOT NULL,
 status text NOT NULL DEFAULT 'CANDIDATE' CHECK(status IN ('CANDIDATE','REVIEW_REQUIRED','ASSURED')),
 source_id text NOT NULL REFERENCES vila_canonical_candidate.sources(source_id),
 appearance_contract jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE vila_canonical_candidate.assets (
 asset_id text PRIMARY KEY, source_id text NOT NULL REFERENCES vila_canonical_candidate.sources(source_id),
 kind text NOT NULL CHECK(kind IN ('image','illustration','scene','audio','video','thumbnail','printable_source')),
 storage_path text, mime_type text, checksum_sha256 text CHECK(checksum_sha256 ~ '^[a-f0-9]{64}$'),
 alt_text_key text, text_free_art boolean NOT NULL DEFAULT true,
 lifecycle text NOT NULL DEFAULT 'CANDIDATE'
 CHECK(lifecycle IN ('CANDIDATE','VERIFIED','APPROVED','RETIRED')), width_px integer, height_px integer
);
CREATE TABLE vila_canonical_candidate.asset_bindings (
 content_id text NOT NULL REFERENCES vila_canonical_candidate.content_objects(content_id),
 asset_id text NOT NULL REFERENCES vila_canonical_candidate.assets(asset_id),
 slot_key text NOT NULL, sort_order integer NOT NULL DEFAULT 0,
 PRIMARY KEY(content_id,slot_key,asset_id)
);
CREATE TABLE vila_canonical_candidate.character_bindings (
 content_id text NOT NULL REFERENCES vila_canonical_candidate.content_objects(content_id),
 character_id text NOT NULL REFERENCES vila_canonical_candidate.characters(character_id),
 usage_role text NOT NULL, PRIMARY KEY(content_id,character_id,usage_role)
);
CREATE TABLE vila_canonical_candidate.template_definitions (
 template_id text PRIMARY KEY, family text NOT NULL, version text NOT NULL,
 slots_schema jsonb NOT NULL DEFAULT '{}'::jsonb, state text NOT NULL DEFAULT 'CANDIDATE',
 UNIQUE(template_id,version)
);
CREATE TABLE vila_canonical_candidate.template_bindings (
 content_id text NOT NULL REFERENCES vila_canonical_candidate.content_objects(content_id),
 template_id text NOT NULL REFERENCES vila_canonical_candidate.template_definitions(template_id),
 configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
 PRIMARY KEY(content_id,template_id)
);
CREATE TABLE vila_canonical_candidate.activities (
 activity_id text PRIMARY KEY, content_id text NOT NULL UNIQUE REFERENCES vila_canonical_candidate.content_objects(content_id),
 mechanic text NOT NULL CHECK(mechanic IN
 ('memory','matching','ordering','selection','quiz','story_branch','mission_steps','draw','coloring','observation','printable','other')),
 specification jsonb NOT NULL DEFAULT '{}'::jsonb,
 scoring_policy jsonb NOT NULL DEFAULT '{}'::jsonb,
 local_only_progress boolean NOT NULL DEFAULT true
);
CREATE TABLE vila_canonical_candidate.activity_steps (
 activity_id text NOT NULL REFERENCES vila_canonical_candidate.activities(activity_id),
 step_key text NOT NULL, position integer NOT NULL CHECK(position>0),
 action_spec jsonb NOT NULL DEFAULT '{}'::jsonb,
 feedback_spec jsonb NOT NULL DEFAULT '{}'::jsonb,
 PRIMARY KEY(activity_id,step_key), UNIQUE(activity_id,position)
);
CREATE TABLE vila_canonical_candidate.learning_goals (
 goal_id text PRIMARY KEY, concept_key text NOT NULL, source_id text NOT NULL REFERENCES vila_canonical_candidate.sources(source_id),
 evidence_level text NOT NULL DEFAULT 'UNVERIFIED'
);
CREATE TABLE vila_canonical_candidate.content_goals (
 content_id text NOT NULL REFERENCES vila_canonical_candidate.content_objects(content_id),
 goal_id text NOT NULL REFERENCES vila_canonical_candidate.learning_goals(goal_id),
 PRIMARY KEY(content_id,goal_id)
);
CREATE TABLE vila_canonical_candidate.experiences (
 experience_id text PRIMARY KEY, route_key text NOT NULL UNIQUE,
 audience text NOT NULL CHECK(audience IN ('CHILD','FAMILY','EDUCATOR','PROFESSIONAL')),
 title_key text NOT NULL, publish_state text NOT NULL DEFAULT 'CANDIDATE'
);
CREATE TABLE vila_canonical_candidate.experience_items (
 experience_id text NOT NULL REFERENCES vila_canonical_candidate.experiences(experience_id),
 content_id text NOT NULL REFERENCES vila_canonical_candidate.content_objects(content_id),
 position integer NOT NULL CHECK(position>0),
 PRIMARY KEY(experience_id,content_id),UNIQUE(experience_id,position)
);
CREATE TABLE vila_canonical_candidate.output_profiles (
 output_id text PRIMARY KEY, channel text NOT NULL CHECK(channel IN
 ('WEB','PWA','PDF','PRINT_COLOR','PRINT_BW','SLIDES','SOCIAL','POCKET')),
 version text NOT NULL, renderer_contract jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE vila_canonical_candidate.output_bindings (
 content_id text NOT NULL REFERENCES vila_canonical_candidate.content_objects(content_id),
 output_id text NOT NULL REFERENCES vila_canonical_candidate.output_profiles(output_id),
 configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
 PRIMARY KEY(content_id,output_id)
);
CREATE TABLE vila_canonical_candidate.accessibility_reviews (
 review_id text PRIMARY KEY, content_id text REFERENCES vila_canonical_candidate.content_objects(content_id),
 template_id text REFERENCES vila_canonical_candidate.template_definitions(template_id),
 criteria jsonb NOT NULL, outcome text NOT NULL CHECK(outcome IN ('PASS','HOLD','FAIL')),
 evidence_ref text, reviewed_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE vila_canonical_candidate.safety_reviews (
 review_id text PRIMARY KEY, content_id text NOT NULL REFERENCES vila_canonical_candidate.content_objects(content_id),
 audience_age text, claims_checked boolean NOT NULL DEFAULT false,
 privacy_checked boolean NOT NULL DEFAULT false, outcome text NOT NULL CHECK(outcome IN ('PASS','HOLD','FAIL')),
 evidence_ref text, reviewed_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE vila_canonical_candidate.evidence (
 evidence_id text PRIMARY KEY, source_id text REFERENCES vila_canonical_candidate.sources(source_id),
 object_type text NOT NULL, object_id text NOT NULL, claim_key text,
 uri text, checksum_sha256 text, verdict text NOT NULL DEFAULT 'NOT_VERIFIED',
 recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE vila_canonical_candidate.audit_events (
 event_id text PRIMARY KEY, actor_ref text NOT NULL, action text NOT NULL,
 object_type text NOT NULL, object_id text NOT NULL,
 detail jsonb NOT NULL DEFAULT '{}'::jsonb, occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE vila_canonical_candidate.release_decisions (
 decision_id text PRIMARY KEY, content_id text NOT NULL REFERENCES vila_canonical_candidate.content_objects(content_id),
 wo_ref text NOT NULL, kernel_evidence_ref text, safety_review_id text REFERENCES vila_canonical_candidate.safety_reviews(review_id),
 accessibility_review_id text REFERENCES vila_canonical_candidate.accessibility_reviews(review_id),
 decision text NOT NULL DEFAULT 'HOLD' CHECK(decision IN ('HOLD','APPROVED','REJECTED')),
 decided_at timestamptz,
 CHECK(decision <> 'APPROVED' OR (kernel_evidence_ref IS NOT NULL AND safety_review_id IS NOT NULL AND accessibility_review_id IS NOT NULL AND decided_at IS NOT NULL))
);
DO $$ DECLARE t text; BEGIN
 FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='vila_canonical_candidate' LOOP
  EXECUTE format('ALTER TABLE vila_canonical_candidate.%I ENABLE ROW LEVEL SECURITY',t);
 END LOOP;
END $$;
REVOKE ALL ON ALL TABLES IN SCHEMA vila_canonical_candidate FROM PUBLIC, anon, authenticated;
COMMIT;
