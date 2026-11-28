"""Candidate F01 projection checker. Read-only; no approval authority."""
import csv
import json
import sys
from collections import Counter
from pathlib import Path

def read_csv(path, required):
    with Path(path).open(encoding="utf-8-sig", newline="") as f:
        r = csv.DictReader(f)
        if not r.fieldnames or not set(required).issubset(r.fieldnames):
            raise ValueError("missing required columns")
        rows = list(r)
        if not rows or any(None in row or any(v is None for v in row.values()) for row in rows):
            raise ValueError("empty or malformed population")
        return rows

def evaluate(identity, lineage):
    ids = read_csv(identity, ["canonical_id","uuid_version","policy_id","pattern_result"])
    versions = read_csv(lineage, ["version_id","parent_id","status","cycle"])
    if any(not r["canonical_id"] for r in ids) or len({r["canonical_id"] for r in ids}) != len(ids):
        raise ValueError("invalid canonical identity population")
    by_id = {r["version_id"]:r for r in versions}
    if "" in by_id or len(by_id) != len(versions):
        raise ValueError("invalid version identity population")
    missing = sum(bool(r["parent_id"]) and r["parent_id"] not in by_id for r in versions)
    cycles = set()
    for start in by_id:
        seen = set()
        node = start
        while node in by_id:
            if node in seen:
                cycles.add(node)
                break
            seen.add(node)
            node = by_id[node]["parent_id"]
    return {
        "entities":len(ids), "versions":len(versions),
        "legacy_uuid":sum(r["uuid_version"] != "7" for r in ids),
        "missing_policy":sum(not r["policy_id"].strip() for r in ids),
        "pattern_results":dict(Counter(r["pattern_result"] for r in ids)),
        "lineage_status":dict(Counter(r["status"] for r in versions)),
        "missing_parents":missing, "cycle_detected":bool(cycles),
        "kernel":"HOLD", "authorization":False,
        "scope":"projection checks only; no raw hash or authority verification"
    }

if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("usage: validate.py identity.csv lineage.csv")
    print(json.dumps(evaluate(*sys.argv[1:]), indent=2))
