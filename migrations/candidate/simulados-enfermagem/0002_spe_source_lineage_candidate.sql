-- Historical W02 candidate only. HOLD: NOT APPLIED; overlaps original v1.4.0. Do not run.
BEGIN;
ALTER TABLE spe_candidate.sources
 ADD COLUMN drive_file_id text,
 ADD COLUMN original_path text,
 ADD COLUMN mime_type text,
 ADD COLUMN page_count integer CHECK (page_count IS NULL OR page_count >= 0),
 ADD COLUMN source_authority text NOT NULL DEFAULT 'SOURCE_AUTHORITY_PENDING',
 ADD COLUMN normalized_exam_fingerprint text;
CREATE UNIQUE INDEX spe_source_drive_id_unique ON spe_candidate.sources(drive_file_id) WHERE drive_file_id IS NOT NULL;
CREATE UNIQUE INDEX spe_source_sha256_unique ON spe_candidate.sources(sha256) WHERE sha256 IS NOT NULL;
CREATE TABLE spe_candidate.source_pages (
 source_id text NOT NULL REFERENCES spe_candidate.sources(source_id),
 page_number integer NOT NULL CHECK(page_number > 0),
 page_kind text NOT NULL DEFAULT 'UNKNOWN' CHECK (page_kind IN ('UNKNOWN','DIGITAL_TEXT','IMAGE_ONLY','HYBRID','BROKEN_FONT_MAP','TABLE_HEAVY','MULTI_COLUMN','ANSWER_KEY','SCANNED_LOW_QUALITY')),
 extraction_state text NOT NULL DEFAULT 'RAW' CHECK (extraction_state IN ('RAW','STRUCTURED','VALIDATED_INTERNAL','QUARANTINE','HOLD')),
 PRIMARY KEY (source_id,page_number)
);
CREATE TABLE spe_candidate.question_lineage (
 lineage_id text PRIMARY KEY,
 question_id text NOT NULL REFERENCES spe_candidate.questions(question_id),
 run_id text NOT NULL REFERENCES spe_candidate.extraction_runs(run_id),
 source_id text NOT NULL,
 page_number integer NOT NULL,
 locator jsonb NOT NULL DEFAULT '{}'::jsonb,
 confidence numeric CHECK(confidence BETWEEN 0 AND 1),
 FOREIGN KEY(source_id,page_number) REFERENCES spe_candidate.source_pages(source_id,page_number)
);
CREATE TABLE spe_candidate.quality_findings (
 finding_id text PRIMARY KEY,
 source_id text NOT NULL REFERENCES spe_candidate.sources(source_id),
 run_id text REFERENCES spe_candidate.extraction_runs(run_id),
 validator_id text NOT NULL,
 result text NOT NULL CHECK(result IN ('PASS','FAIL','HOLD','REVIEW_REQUIRED')),
 detail jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE spe_candidate.promotion_decisions (
 decision_id text PRIMARY KEY,
 question_id text NOT NULL REFERENCES spe_candidate.questions(question_id),
 decision text NOT NULL CHECK(decision IN ('HOLD','REVIEW_REQUIRED','APPROVED','REJECTED')),
 evidence_ref text NOT NULL,
 approver_ref text,
 decided_at timestamptz,
 CHECK(decision <> 'APPROVED' OR (approver_ref IS NOT NULL AND decided_at IS NOT NULL))
);
ALTER TABLE spe_candidate.source_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE spe_candidate.question_lineage ENABLE ROW LEVEL SECURITY;
ALTER TABLE spe_candidate.quality_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE spe_candidate.promotion_decisions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA spe_candidate FROM PUBLIC, anon, authenticated;
COMMIT;
