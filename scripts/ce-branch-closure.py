#!/usr/bin/env python3
"""Fail-closed CE branch completion gate; does not merge, delete or publish."""
from __future__ import annotations

import argparse
from collections import Counter
import json
from pathlib import Path
import re
import sys

LEDGER = "registers/governance/ce-branch-completion-20261120.v1.json"
SHA1 = re.compile(r"^[0-9a-f]{40}$")
SHA256 = re.compile(r"^[0-9a-f]{64}$")
SCOPES = {"CE_CKO_NCOS_REVIEW", "WUTRIB_ISOLATED", "CANONICAL_MAIN"}
OPEN_STATES = {"OPEN", "OUT_OF_SCOPE", "NOT_APPLICABLE"}
DECISIONS = {
    "INTEGRATED_VERIFIED", "EXACT_IN_CANONICAL",
    "REJECTED_WITH_PROVENANCE", "SUPERSEDED_WITH_PROOF",
    "ARCHIVED_INERT_WITH_PROOF",
}
SAFE_ALTERNATIVES = {"COMPLETE", "NOT_APPLICABLE_WITH_PROOF"}


def fail(reason: str) -> None:
    raise ValueError(reason)


def looks_sha(value: object, pattern: re.Pattern[str]) -> bool:
    return isinstance(value, str) and bool(pattern.fullmatch(value))


def validate_proof(row: dict, by_name: dict[str, dict]) -> None:
    name = row["branch"]
    if row.get("final_disposition") not in DECISIONS:
        fail(name + ": invalid terminal decision")
    if row.get("no_revisit") is not True or row.get("closure_status") != "SEALED":
        fail(name + ": closure status and no_revisit inconsistent")
    if row.get("scope") != "CE_CKO_NCOS_REVIEW":
        fail(name + ": cross-domain or canonical branches cannot be sealed by CE")
    proof = row.get("closure_proof")
    if not isinstance(proof, dict):
        fail(name + ": closure needs independently reviewable proof")
    for field in ("source_sha", "source_tree_sha", "main_integration_sha", "ci_verified_sha"):
        if not looks_sha(proof.get(field), SHA1):
            fail(name + ": invalid or absent " + field)
    if proof["source_sha"] != row["source_commit_sha"]:
        fail(name + ": head SHA drift; reopen the branch")
    if not looks_sha(row.get("source_tree_sha"), SHA1):
        fail(name + ": source tree SHA is not pinned")
    if proof["source_tree_sha"] != row["source_tree_sha"]:
        fail(name + ": source tree SHA drift; reopen the branch")
    if proof["main_integration_sha"] != proof["ci_verified_sha"]:
        fail(name + ": CI not verified for integration SHA")
    for field in ("full_delta_manifest_sha256", "post_integration_cross_sha256", "evidence_manifest_sha256"):
        if not looks_sha(proof.get(field), SHA256):
            fail(name + ": absent verifiable SHA256 " + field)
    source_count = proof.get("source_file_count")
    classified = proof.get("classified_file_count")
    if type(source_count) is not int or source_count < 0 or type(classified) is not int or classified != source_count:
        fail(name + ": file classification is not 100% of pinned universe")
    if proof.get("unresolved_conflicts") != 0 or proof.get("unreviewed_files") != 0:
        fail(name + ": unresolved conflicts or files")
    for gate in ("license_rights", "security", "runtime_tests", "post_merge_regression", "clinical_safety", "supabase_cross", "drive_cross"):
        obj = proof.get(gate)
        if not isinstance(obj, dict) or obj.get("state") not in SAFE_ALTERNATIVES or not obj.get("evidence_ref"):
            fail(name + ": missing evidence or gate " + gate)
    if proof.get("approval") is None or not isinstance(proof["approval"], dict):
        fail(name + ": independent approval missing")
    approval = proof["approval"]
    for field in ("owner", "reviewer", "review_ref"):
        if not isinstance(approval.get(field), str) or not approval[field].strip():
            fail(name + ": unsigned review " + field)
    if approval["owner"] == approval["reviewer"]:
        fail(name + ": owner and independent reviewer must differ")
    if row.get("duplicate_ref"):
        keeper = by_name.get(row["duplicate_ref"])
        if not keeper or keeper.get("source_commit_sha") != row["source_commit_sha"]:
            fail(name + ": duplicate keeper SHA does not match")
        if keeper.get("closure_status") != "SEALED":
            fail(name + ": cannot seal a duplicate before its source group is sealed")


def validate(ledger: dict, require_closed: bool = False) -> dict:
    if ledger.get("protocol") != "CE.BRANCH.CLOSURE.v1":
        fail("incorrect branch completion protocol")
    if not looks_sha(ledger.get("baseline_main_sha"), SHA1):
        fail("missing canonical main baseline SHA")
    rows = ledger.get("rows")
    if not isinstance(rows, list):
        fail("missing rows list")
    names = [r.get("branch") for r in rows if isinstance(r, dict)]
    if len(names) != len(rows) or len(names) != len(set(names)):
        fail("duplicate/invalid branch names")
    by_name = {r["branch"]: r for r in rows}
    if "main" not in by_name or by_name["main"].get("source_commit_sha") != ledger["baseline_main_sha"]:
        fail("canonical main missing or SHA inconsistent")
    totals = Counter()
    states = Counter()
    for row in rows:
        name = row["branch"]
        if not isinstance(name, str) or not name or "/" in name and name.startswith("../"):
            fail("invalid branch name")
        if not looks_sha(row.get("source_commit_sha"), SHA1):
            fail(name + ": missing fixed HEAD SHA")
        scope = row.get("scope")
        if scope not in SCOPES:
            fail(name + ": unknown domain; cannot silently skip")
        totals[scope] += 1
        state = row.get("closure_status")
        states[state] += 1
        if row.get("no_revisit") is True or state == "SEALED":
            validate_proof(row, by_name)
        elif state not in OPEN_STATES or row.get("no_revisit") is not False:
            fail(name + ": false closure / missing open status")
        if scope == "CE_CKO_NCOS_REVIEW":
            if state not in ("OPEN", "SEALED"):
                fail(name + ": CE branch cannot become out-of-scope")
            if row.get("scan_status") == "PR_FILES_SCANNED":
                if row.get("pr_number") is None or row.get("observed_files") != row.get("expected_pr_changes"):
                    fail(name + ": claimed complete PR changed-files list is incomplete")
            elif row.get("scan_status") == "PR_FILES_INCOMPLETE_API_LIMIT":
                if row.get("pr_number") is None or row.get("observed_files", 0) >= row.get("expected_pr_changes", 0):
                    fail(name + ": invalid large-PR incomplete state")
            elif row.get("scan_status") == "ROOT_TREE_SCANNED":
                if not looks_sha(row.get("source_tree_sha"), SHA1):
                    fail(name + ": missing verified root tree SHA")
            elif state == "OPEN":
                fail(name + ": CE branch has no evidenced scan")
        if scope == "WUTRIB_ISOLATED" and (state != "OUT_OF_SCOPE" or row.get("no_revisit") is not False):
            fail(name + ": WU-TRIB must remain isolated")
        if scope == "CANONICAL_MAIN" and state != "NOT_APPLICABLE":
            fail("main cannot be sealed as a source branch")
        alias = row.get("duplicate_ref")
        if alias:
            target = by_name.get(alias)
            if not target or target.get("source_commit_sha") != row["source_commit_sha"]:
                fail(name + ": false shared-SHA alias")
    counts = ledger.get("counts")
    if not isinstance(counts, dict) or counts.get("all_branches") != len(rows):
        fail("aggregate branch count drift")
    if counts.get("ce_branches") != totals["CE_CKO_NCOS_REVIEW"]:
        fail("CE cohort count drift")
    if counts.get("other_domain_isolated") != totals["WUTRIB_ISOLATED"]:
        fail("isolation count drift")
    if counts.get("canonical_main") != totals["CANONICAL_MAIN"]:
        fail("main count drift")
    if counts.get("with_pr_complete") != sum(r.get("scan_status") == "PR_FILES_SCANNED" for r in rows):
        fail("complete PR count drift")
    if counts.get("with_pr_incomplete") != sum(r.get("scan_status") == "PR_FILES_INCOMPLETE_API_LIMIT" for r in rows):
        fail("incomplete PR count drift")
    if counts.get("without_pr_root_scanned") != sum(r.get("scan_status") == "ROOT_TREE_SCANNED" for r in rows):
        fail("orphan root comparison count drift")
    sealed = sum(r.get("scope") == "CE_CKO_NCOS_REVIEW" and r.get("closure_status") == "SEALED" for r in rows)
    if counts.get("ce_sealed") != sealed:
        fail("sealed count drift")
    if not isinstance(ledger.get("policy"), dict) or any(ledger["policy"].get(k) is not False for k in
        ("new_branch", "force_merge", "delete_branch", "auto_publish", "remote_database_writes", "archive_is_admission")):
        fail("fail-closed policy missing")
    if require_closed and sealed != totals["CE_CKO_NCOS_REVIEW"]:
        fail("global branch closure NOT READY; %d/%d are SEALED" % (sealed, totals["CE_CKO_NCOS_REVIEW"]))
    return {"branches": len(rows), "ce": totals["CE_CKO_NCOS_REVIEW"],
            "sealed": sealed, "open": totals["CE_CKO_NCOS_REVIEW"] - sealed,
            "status": "VERIFIED_OPEN_LEDGER" if sealed < totals["CE_CKO_NCOS_REVIEW"] else "VERIFIED_ALL_SEALED"}


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--ledger", type=Path, default=Path(LEDGER))
    p.add_argument("--require-closed", action="store_true")
    args = p.parse_args()
    try:
        j = json.loads(args.ledger.read_text(encoding="utf-8"))
        result = validate(j, args.require_closed)
        print(json.dumps(result, ensure_ascii=False, sort_keys=True))
        return 0
    except (OSError, ValueError, json.JSONDecodeError, KeyError, TypeError) as err:
        print("CE BRANCH CLOSURE FAIL: " + str(err), file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
