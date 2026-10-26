-- CANDIDATE MIGRATION ONLY. DO NOT AUTO-APPLY.
-- These relations were missing from the inspected pg_constraint catalog.
-- Requires a governed WO, preflight query result, lock-window assessment,
-- independent Checker sign-off and application in isolated environment.
-- PostgreSQL does not acquire historical validation at ADD ... NOT VALID;
-- run VALIDATE only after documented preflight and remediation.
--
-- Existing masters are reused; no new object identity registry.
ALTER TABLE cko_evidence.snapshots
 ADD CONSTRAINT cko_snapshots_source_fk_candidate
 FOREIGN KEY (source_id) REFERENCES cko_evidence.sources(source_id)
 ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID;

ALTER TABLE cko_evidence.snapshots
 ADD CONSTRAINT cko_snapshots_supersedes_fk_candidate
 FOREIGN KEY (supersedes_snapshot_id) REFERENCES cko_evidence.snapshots(snapshot_id)
 ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID;

ALTER TABLE cko_evidence.fragments
 ADD CONSTRAINT cko_fragments_snapshot_fk_candidate
 FOREIGN KEY (snapshot_id) REFERENCES cko_evidence.snapshots(snapshot_id)
 ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID;

ALTER TABLE cko_evidence.assertions
 ADD CONSTRAINT cko_assertions_fragment_fk_candidate
 FOREIGN KEY (source_fragment_id) REFERENCES cko_evidence.fragments(fragment_id)
 ON UPDATE RESTRICT ON DELETE RESTRICT NOT VALID;

-- DO NOT run in the same deployment automatically. Phase 2 after audit:
-- ALTER TABLE cko_evidence.snapshots VALIDATE CONSTRAINT cko_snapshots_source_fk_candidate;
-- ALTER TABLE cko_evidence.snapshots VALIDATE CONSTRAINT cko_snapshots_supersedes_fk_candidate;
-- ALTER TABLE cko_evidence.fragments VALIDATE CONSTRAINT cko_fragments_snapshot_fk_candidate;
-- ALTER TABLE cko_evidence.assertions VALIDATE CONSTRAINT cko_assertions_fragment_fk_candidate;
--
-- Before application, query pg_constraint again to avoid duplicate FKs.
-- Claim JSONB refs must be atomized into typed relationship rows or validated
-- against each target type before adding FKs; this file makes no such presumption.
