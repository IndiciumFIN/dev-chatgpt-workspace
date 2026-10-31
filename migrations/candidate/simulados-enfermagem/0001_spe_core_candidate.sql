-- Candidate-only SQL; NOT APPLIED. No production mutation.
-- Standalone nursing examinations. Data-first, fail-closed, no child/student PII.
BEGIN;
CREATE SCHEMA IF NOT EXISTS spe_candidate;
REVOKE ALL ON SCHEMA spe_candidate FROM PUBLIC, anon, authenticated;

CREATE TABLE spe_candidate.sources (
 source_id text PRIMARY KEY CHECK (source_id ~ '^SPE[.]SRC[.][A-Za-z0-9_-]+$'),
 title text NOT NULL CHECK (length(btrim(title))>0),
 source_kind text NOT NULL CHECK (source_kind IN ('OFFICIAL_EXAM','OFFICIAL_ANSWER_KEY','OTHER_DOCUMENT')),
 source_url text,
 sha256 char(64) CHECK (sha256 ~ '^[a-f0-9]{64}$'),
 byte_size bigint CHECK(byte_size>=0),
 rights_status text NOT NULL DEFAULT 'NOT_VERIFIED' CHECK(rights_status IN ('NOT_VERIFIED','ELIGIBLE_FOR_EXTRACTION','REFERENCE_ONLY','LICENSE_BLOCKED')),
 status text NOT NULL DEFAULT 'CANDIDATE' CHECK(status IN ('CANDIDATE','VERIFIED','HOLD','RETIRED')),
 retrieved_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK (status <> 'VERIFIED' OR (sha256 IS NOT NULL AND rights_status='ELIGIBLE_FOR_EXTRACTION'))
);
CREATE TABLE spe_candidate.exams (
 exam_id text PRIMARY KEY, institution text NOT NULL, examining_board text, position_title text NOT NULL,
 exam_year integer CHECK(exam_year BETWEEN 1900 AND 2100),
 exam_source_id text NOT NULL REFERENCES spe_candidate.sources(source_id),
 publication_status text NOT NULL DEFAULT 'CANDIDATE' CHECK(publication_status IN ('CANDIDATE','REVIEW_REQUIRED','QUALIFIED','RELEASED','RETIRED')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE spe_candidate.questions (
 question_id text PRIMARY KEY, exam_id text NOT NULL REFERENCES spe_candidate.exams(exam_id),
 ordinal_in_source integer NOT NULL CHECK(ordinal_in_source>0), source_page_start integer CHECK(source_page_start>0),
 source_page_end integer CHECK(source_page_end>=source_page_start),
 stem text NOT NULL CHECK(length(btrim(stem))>0),
 question_type text NOT NULL DEFAULT 'single_choice' CHECK(question_type IN ('single_choice','multiple_choice','true_false','ordering','matching','short_answer')),
 status text NOT NULL DEFAULT 'CANDIDATE' CHECK(status IN ('CANDIDATE','SOURCE_QUALIFIED','EVIDENCE_BOUND','REVIEW_REQUIRED','ASSURED','RELEASED','RETIRED')),
 version integer NOT NULL DEFAULT 1 CHECK(version>0),
 source_sha256 char(64) CHECK(source_sha256 ~ '^[a-f0-9]{64}$'),
 UNIQUE (exam_id, ordinal_in_source, version), UNIQUE (question_id, exam_id)
);
CREATE TABLE spe_candidate.choices (
 question_id text NOT NULL REFERENCES spe_candidate.questions(question_id),
 choice_key text NOT NULL CHECK(choice_key ~ '^[A-Z]$'), choice_text text NOT NULL CHECK(length(btrim(choice_text))>0),
 ordinal integer NOT NULL CHECK(ordinal>0), PRIMARY KEY(question_id, choice_key), UNIQUE(question_id,ordinal)
);
CREATE TABLE spe_candidate.answer_keys (
 answer_key_id text PRIMARY KEY, exam_id text NOT NULL REFERENCES spe_candidate.exams(exam_id),
 source_id text NOT NULL REFERENCES spe_candidate.sources(source_id),
 version integer NOT NULL DEFAULT 1 CHECK(version>0), status text NOT NULL DEFAULT 'CANDIDATE' CHECK(status IN ('CANDIDATE','VERIFIED','HOLD')),
 verified_by text, verified_at timestamptz,
 CHECK(status <> 'VERIFIED' OR (verified_by IS NOT NULL AND verified_at IS NOT NULL)), UNIQUE(answer_key_id,exam_id)
);
CREATE TABLE spe_candidate.answer_key_items (
 answer_key_id text NOT NULL, exam_id text NOT NULL,
 question_id text NOT NULL, choice_key text NOT NULL,
 PRIMARY KEY(answer_key_id,question_id),
 FOREIGN KEY(answer_key_id,exam_id) REFERENCES spe_candidate.answer_keys(answer_key_id,exam_id),
 FOREIGN KEY(question_id,exam_id) REFERENCES spe_candidate.questions(question_id,exam_id),
 FOREIGN KEY(question_id,choice_key) REFERENCES spe_candidate.choices(question_id,choice_key)
);
CREATE TABLE spe_candidate.evidence (
 evidence_id text PRIMARY KEY, source_id text NOT NULL REFERENCES spe_candidate.sources(source_id),
 question_id text REFERENCES spe_candidate.questions(question_id),
 page_start integer CHECK(page_start>0), page_end integer CHECK(page_end>=page_start),
 evidence_kind text NOT NULL CHECK(evidence_kind IN ('PDF_PAGE','ANSWER_KEY','EXTRACTION_TRACE','HUMAN_REVIEW')),
 excerpt_sha256 char(64) CHECK(excerpt_sha256 ~ '^[a-f0-9]{64}$'),
 status text NOT NULL DEFAULT 'CANDIDATE' CHECK(status IN ('CANDIDATE','VERIFIED','HOLD')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE spe_candidate.extraction_runs (
 run_id text PRIMARY KEY, source_id text NOT NULL REFERENCES spe_candidate.sources(source_id),
 tool_version text NOT NULL, input_sha256 char(64) NOT NULL CHECK(input_sha256 ~ '^[a-f0-9]{64}$'),
 output_sha256 char(64) CHECK(output_sha256 ~ '^[a-f0-9]{64}$'),
 outcome text NOT NULL CHECK(outcome IN ('PENDING','PASS','HOLD','FAIL')),
 executed_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE spe_candidate.audit_events (
 event_id text PRIMARY KEY, object_type text NOT NULL, object_id text NOT NULL,
 action text NOT NULL, actor_ref text NOT NULL, detail jsonb NOT NULL DEFAULT '{}'::jsonb,
 recorded_at timestamptz NOT NULL DEFAULT now()
);
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['sources','exams','questions','choices','answer_keys','answer_key_items','evidence','extraction_runs','audit_events'] LOOP
 EXECUTE format('ALTER TABLE spe_candidate.%I ENABLE ROW LEVEL SECURITY',t);
 END LOOP;
END $$;
REVOKE ALL ON ALL TABLES IN SCHEMA spe_candidate FROM PUBLIC, anon, authenticated;
COMMIT;
