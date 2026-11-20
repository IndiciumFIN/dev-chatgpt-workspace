#!/usr/bin/env python3
"""Read-only CE N-way reconciliation of pinned GitHub/Supabase/Drive snapshots."""
import argparse
from collections import defaultdict
from hashlib import sha256
from itertools import combinations
import json
from pathlib import Path
import re
import sys

KINDS = {"github", "supabase", "drive"}
REQUIRED = {"source_id", "source_kind", "snapshot_ref", "complete", "cursor_exhausted", "records"}
FIELDS = {"canonical_key", "record_ref", "artifact_class", "rights_state"}
HASH = re.compile(r"^[0-9a-f]{64}$")
BLOB = re.compile(r"^[0-9a-f]{40}$")
RIGHTS_HOLD = {"UNKNOWN", "UNRESOLVED", "NOT_VERIFIED", "PENDING", "BLOCKED", "HOLD"}


def snapshot(path):
    doc = json.loads(Path(path).read_text("utf-8"))
    if not isinstance(doc, dict) or REQUIRED - doc.keys():
        raise ValueError("missing snapshot fields: " + str(path))
    kind, sid = doc["source_kind"], doc["source_id"]
    if kind not in KINDS or not isinstance(sid, str) or not sid.startswith(kind + ":"):
        raise ValueError("invalid source identity")
    if not isinstance(doc["snapshot_ref"], str) or not doc["snapshot_ref"]:
        raise ValueError("unpinned snapshot")
    if type(doc["complete"]) is not bool or type(doc["cursor_exhausted"]) is not bool:
        raise ValueError("completeness must be explicit booleans")
    if not isinstance(doc["records"], list):
        raise ValueError("records must be a list")
    for row in doc["records"]:
        if not isinstance(row, dict) or FIELDS - row.keys():
            raise ValueError("incomplete object record in " + sid)
        if any(not isinstance(row[k], str) or not row[k].strip() for k in FIELDS):
            raise ValueError("invalid canonical identity/ref/class/rights in " + sid)
        for name in ("content_sha256", "semantic_sha256"):
            value = row.get(name)
            if value is not None and (not isinstance(value, str) or not HASH.fullmatch(value)):
                raise ValueError("invalid " + name)
        if row.get("git_blob_sha") is not None and not BLOB.fullmatch(str(row["git_blob_sha"])):
            raise ValueError("invalid git blob SHA-1")
        expected = row.get("expected_source_ids", [])
        if not isinstance(expected, list) or any(not isinstance(v, str) or not v for v in expected):
            raise ValueError("invalid explicit expected_source_ids")
    return doc


def reconcile(inputs):
    if len(inputs) < 2:
        raise ValueError("cross requires two or more sources")
    sources = {s["source_id"]: s for s in inputs}
    if len(sources) != len(inputs):
        raise ValueError("duplicate source snapshot")
    violations = []
    absent = sorted(KINDS - {s["source_kind"] for s in inputs})
    if absent:
        violations.append("SOURCE_KIND_MISSING:" + ",".join(absent))
    grouped = defaultdict(list)
    for sid, doc in sources.items():
        if not doc["complete"] or not doc["cursor_exhausted"]:
            violations.append("SNAPSHOT_INCOMPLETE:" + sid)
        seen = set()
        for row in doc["records"]:
            pair = (row["canonical_key"], row["artifact_class"])
            if pair in seen:
                violations.append("DUPLICATE_IN_SOURCE:" + sid + ":" + row["canonical_key"])
            seen.add(pair)
            grouped[row["canonical_key"]].append(dict(row, source_id=sid))
    decisions = []
    for key, rows in sorted(grouped.items()):
        ids = {r["source_id"] for r in rows}
        issues = []
        classes = {r["artifact_class"] for r in rows}
        if len(classes) != 1:
            issues.append("CLASS_CONFLICT")
        requirements = {tuple(sorted(set(r.get("expected_source_ids", [])))) for r in rows}
        if len(requirements) != 1:
            issues.append("REQUIRED_SOURCE_DISAGREEMENT")
        required_ids = set().union(*(set(v) for v in requirements))
        if required_ids - ids:
            issues.append("SOURCE_MISSING:" + ",".join(sorted(required_ids - ids)))
        if len(ids) < 2:
            issues.append("SOURCE_ONLY")
        semantic = {r.get("semantic_sha256") for r in rows if r.get("semantic_sha256")}
        bytesets = {r.get("content_sha256") for r in rows if r.get("content_sha256")}
        if any(not r.get("semantic_sha256") for r in rows):
            issues.append("SEMANTIC_SHA256_MISSING")
        if len(semantic) > 1:
            issues.append("SEMANTIC_MISMATCH")
        if any(not r.get("content_sha256") for r in rows):
            issues.append("CONTENT_SHA256_MISSING")
        if len(bytesets) > 1:
            issues.append("BYTES_DIFFER_REVIEW")
        if any(r["rights_state"].upper() in RIGHTS_HOLD for r in rows):
            issues.append("RIGHTS_NOT_CLEARED")
        if any(r.get("admitted") is True for r in rows):
            issues.append("ADMISSION_CLAIM_REVIEW")
        if any(v.startswith("DUPLICATE_IN_SOURCE:") and v.endswith(":" + key) for v in violations):
            issues.append("DUPLICATE_REVIEW")
        decisions.append({
            "canonical_key": key, "sources": sorted(ids),
            "state": "HOLD" if issues else "CROSS_OK_NOT_RELEASE",
            "issues": sorted(set(issues)),
            "references": sorted([{"source_id": r["source_id"], "record_ref": r["record_ref"]}
                                  for r in rows], key=lambda x: (x["source_id"], x["record_ref"])),
        })
    pairs = []
    for a, b in combinations(sorted(sources), 2):
        ka = {k for k, rs in grouped.items() if any(r["source_id"] == a for r in rs)}
        kb = {k for k, rs in grouped.items() if any(r["source_id"] == b for r in rs)}
        pairs.append({"a": a, "b": b, "shared": len(ka & kb),
                      "only_a": len(ka - kb), "only_b": len(kb - ka)})
    hold = bool(violations) or any(d["state"] == "HOLD" for d in decisions)
    result = {
        "protocol": "CE.CROSS.v1",
        "status": "HOLD_RECONCILIATION" if hold else "CROSS_OK_NOT_RELEASE",
        "auto_merge": False, "remote_writes": False, "clinical_release": False,
        "snapshots": [{"source_id": s["source_id"], "ref": s["snapshot_ref"],
                       "complete": s["complete"], "cursor_exhausted": s["cursor_exhausted"],
                       "count": len(s["records"])} for s in sorted(inputs, key=lambda x: x["source_id"])],
        "violations": sorted(violations), "pairs": pairs,
        "counts": {"objects": len(decisions),
                   "hold": sum(d["state"] == "HOLD" for d in decisions),
                   "cross_ok_not_release": sum(d["state"] == "CROSS_OK_NOT_RELEASE" for d in decisions)},
        "decisions": decisions,
    }
    serialized = json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    result["report_sha256"] = sha256(serialized.encode("utf-8")).hexdigest()
    return result


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--input", action="append", required=True, type=Path)
    ap.add_argument("--output", required=True, type=Path)
    ap.add_argument("--strict", action="store_true")
    args = ap.parse_args()
    try:
        result = reconcile([snapshot(p) for p in args.input])
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(result["status"], result["counts"], "pairs", len(result["pairs"]))
        if args.strict and result["status"] != "CROSS_OK_NOT_RELEASE":
            print("FAIL CLOSED: no automatic merge or clinical approval", file=sys.stderr)
            return 2
        return 0
    except (ValueError, OSError, json.JSONDecodeError) as exc:
        print("FAIL CROSS: " + str(exc), file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
