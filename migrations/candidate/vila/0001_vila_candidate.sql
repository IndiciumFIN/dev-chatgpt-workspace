-- CANDIDATE ONLY. Do not apply to production; requires kernel admission, authorized DB and migration review.
CREATE SCHEMA IF NOT EXISTS vila_candidate;
CREATE TABLE IF NOT EXISTS vila_candidate.content (
 id text PRIMARY KEY CHECK (id ~ '^VILA\\.[A-Z]+\\.[0-9]{3}$'),
 kind text NOT NULL CHECK (kind IN ('mission','story','emotion')),
 title text NOT NULL, summary text NOT NULL, age_band text NOT NULL,
 template_id text NOT NULL, source_ref text NOT NULL,
 status text NOT NULL DEFAULT 'CANDIDATE' CHECK (status IN ('CANDIDATE','REVIEW_REQUIRED','ASSURED','RETIRED')),
 locale text NOT NULL DEFAULT 'pt-BR', version text NOT NULL DEFAULT '0.1.0',
 payload jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(id,locale,version)
);
CREATE TABLE IF NOT EXISTS vila_candidate.evidence (
 id text PRIMARY KEY, content_id text NOT NULL REFERENCES vila_candidate.content(id),
 source_uri text, source_hash text, qualification text NOT NULL DEFAULT 'NOT_VERIFIED',
 reviewed_by text, reviewed_at timestamptz,
 CHECK (qualification IN ('NOT_VERIFIED','REVIEW_REQUIRED','QUALIFIED'))
);
-- No anonymous writes, accounts, child profiles, clinical records or personal data.
REVOKE ALL ON SCHEMA vila_candidate FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA vila_candidate FROM PUBLIC;
