# CE — Live GitHub census W2.6-G3

**Issue:** #107; **V6-A07:** #97. **Phase:** DEVELOPMENT; no release.
**Owner:** Cauê Zipfel (approval deferred). **Coordination:** Leivis Lima.

## Pinned baseline and scope

The immutable historical delta is retained as its own prior observation; it must not be presented as live. The new two-pass snapshot is `registers/governance/ce-github-live-census-20261121.v1.json`, captured on 21/11/2026. It contains 69 branches (54 CE/CKO/NCOS; 14 WU-TRIB isolated; 1 main), 38 open PRs (33 draft), and the exact SHA of every named reference and PR head. The protected main baseline was `2c2872c46cdb860086d6b5f8feb5a70efc4c2c9e`, tree `4fb0de2bb58c53cc6e565eb64bdba7e598bd832c`. PRs #89 and #105 were MERGED at the snapshot. This is not permanent freshness certification.

## Automated capture and testing

- `scripts/ce-live-census.mjs` requests all pages of branches and open pull requests with a read-only GitHub token; validates PR head alignment and total counts.
- The script reads each full collection twice. Any HEAD or PR movement between the two passes fails closed. Missing pages, malformed SHAs, duplicate paths, or false `SEALED`/release states also fail closed.
- Ordinary drift is reported as `DRIFT_OBSERVED_REVIEW_REQUIRED` in a sanitized JSON artifact and GitHub Actions summary. It is not silently merged, deleted, or treated as completed reconciliation.
- `scripts/ce-live-census.test.mjs` runs negative tests for duplicate refs, incomplete pagination, invalid SHA, mismatched PR HEAD, concurrent updates, and false branch closure.
- `.github/workflows/ce-live-github-census.yml` supports PR validation, manual dispatch, and a daily schedule at 11:17 UTC (08:17 America/Sao_Paulo). Schedule only becomes active on default branch after merging.

## Acceptance boundary

Task #107 is eligible for DEV_MERGED_VERIFIED after PR checks, main merge SHA and post-merge CI are verified. V6-A07 #97 requires an actual later `schedule` event with run ID and artifact; neither a workflow file nor a successful PR check satisfies that separate criterion.

Do not infer completion of G00 historical secret scanning, OAuth revocation, Supabase runtime identity, schema/RLS testing, clinical/rights decisions or release readiness. Do not delete historical branches, push to main without PR, perform remote DDL/DML, or deploy to production. The WU-TRIB cohort remains isolated even though its public Git refs are included in the censo.

**Rollback:** revert workflow/script/tests only by PR while preserving historical snapshots and issue receipts.
