#!/usr/bin/env python3
"""Read-only historical i18n blob audit; no activation, writes to Git or deletion."""
import argparse
import collections
import hashlib
import json
import re
import subprocess
from pathlib import Path

COHORT_BASE = "80f2e0946c53f5ec680378443ee474e3c71c4a86"
SOURCES = (
    ("idioma/de-v1", "9a12fad8d32fc17f424d4425c0acfb11af3ef1d6", "97684528ae2cfe1a2899e8caa53fbac4b45184ef"),
    ("idioma/pt-PT-v1", "314199bc72f7be9928f120c85e14c2f644a28e9e", "97684528ae2cfe1a2899e8caa53fbac4b45184ef"),
    ("idioma/consolidado-19", "3dc979a795634eda9b097f2e69660f87ddd779e3", "97684528ae2cfe1a2899e8caa53fbac4b45184ef"),
    ("fix/pendencias-camadas-20261101", "949423ef555f40d5e6538b3d7bf2fa4b0c9051e3", "621f73b5abde2dbb65818645c00d4821cbd3d061"),
    ("feat/projection-unica-f0-suite-real", "6d712dd47029286869f909a2014f42083f5db2a9", "eb2d47925dcbea40307d4078c991e76abc4189dc"),
)
CREDENTIAL = re.compile(r'-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|sk-[A-Za-z0-9_-]{30,}|AKIA[A-Z0-9]{16})|(?:password|secret|api[_-]?key|token)["\x27]?\s*:\s*["\x27][^"\x27\s]{12,}["\x27]', re.I)
SAFE_PATH = re.compile(r'^registers/i18n/incoming/([a-zA-Z-]+)/contracts/([A-Za-z0-9_-]+)__([A-Za-z0-9_-]+)\.json$')

def git(*args):
    return subprocess.check_output(["git", *args])

def tree(ref):
    result = {}
    for item in git("ls-tree", "-r", "-z", ref).split(b"\0"):
        if not item:
            continue
        metadata, path = item.split(b"\t", 1)
        mode, kind, sha = metadata.decode("ascii").split()
        if kind == "blob":
            result[path.decode("utf-8")] = (mode, sha)
    return result

def unique_object(pairs):
    obj = {}
    for key, value in pairs:
        if key in obj:
            raise ValueError("duplicate key")
        obj[key] = value
    return obj

def reject_constant(_):
    raise ValueError("nonfinite")

def inspect(raw, path, sha, mode):
    if hashlib.sha1(b"blob "+str(len(raw)).encode()+b"\0"+raw).hexdigest() != sha:
        return "HOLD_BLOB_INTEGRITY", None, None
    try:
        text = raw.decode("utf-8")
        obj = json.loads(text, object_pairs_hook=unique_object, parse_constant=reject_constant)
    except (ValueError, UnicodeError, RecursionError):
        return "HOLD_JSON", None, None
    if CREDENTIAL.search(text):
        return "HOLD_CREDENTIAL_PATTERN", None, None
    match = SAFE_PATH.fullmatch(path)
    if not match or not isinstance(obj, dict) or mode not in ("100644", "100755"):
        return "HOLD_NON_CONTRACT_REVIEW", None, None
    locale, section, name = match.groups()
    key = section+"."+name
    if (obj.get("locale") != locale or obj.get("key") != key
        or obj.get("canonical_id") != "cko:i18n:"+locale+":"+key
        or not isinstance(obj.get("value"), str) or not obj["value"].strip()
        or obj.get("status") != "DRAFT" or obj.get("translation_status") != "DRAFT"):
        return "HOLD_IDENTITY_OR_STATE", locale, key
    if obj.get("clinical_review") != "NOT_APPLICABLE":
        return "HOLD_CLINICAL_REVIEW", locale, key
    return "STAGING_CANDIDATE", locale, key

def audit(baseline):
    if not re.fullmatch(r"[0-9a-f]{40}", baseline):
        raise ValueError("baseline must be pinned SHA")
    original = set(tree(COHORT_BASE).values())
    current = set(tree(baseline).values())
    missing = collections.defaultdict(list)
    for ref, tip, base in SOURCES:
        prior = tree(base)
        for path, pair in tree(tip).items():
            if prior.get(path) != pair and pair not in original:
                missing[pair].append((path, ref, tip))
    # Existing cohort uses lexicographically first source path; casefold keeps
    # equivalent locale variants deterministic, with bytewise tie breaker.
    cohort = []
    for pair, origins in missing.items():
        ordered = sorted(origins, key=lambda x: (x[0].casefold(), x[0], x[1]))
        if ordered[0][0].startswith("registers/i18n/") and ordered[0][0].endswith(".json"):
            cohort.append((pair, ordered))
    if len(cohort) != 1257:
        raise RuntimeError("historical cohort mismatch: "+str(len(cohort)))
    rows = []
    for (mode, sha), origins in sorted(cohort):
        path, ref, tip = origins[0]
        raw = git("cat-file", "blob", sha)
        result, locale, key = inspect(raw, path, sha, mode)
        rows.append({"sha":sha, "mode":mode, "path":path, "source_ref":ref,
                     "source_commit":tip, "origins":[{"path":p,"ref":r,"commit":s} for p,r,s in origins],
                     "already_preserved":(mode,sha) in current, "disposition":result,
                     "locale":locale,"key":key})
    counts = collections.Counter(x["disposition"] for x in rows)
    groups = collections.Counter((x["locale"],x["key"]) for x in rows if x["key"])
    for row in rows:
        row["competing_key_variants"] = groups[(row["locale"],row["key"])] if row["key"] else 0
    return {"protocol":"CE.I18N.BULK.AUDIT.v1","baseline":baseline,"cohort_base":COHORT_BASE,
            "total":len(rows),"already_preserved":sum(x["already_preserved"] for x in rows),
            "remaining":sum(not x["already_preserved"] for x in rows),
            "dispositions":dict(counts),"remaining_dispositions":dict(collections.Counter(x["disposition"] for x in rows if not x["already_preserved"])),
            "runtime_admission":False,"release":False,"retirement":"HOLD",
            "limitations":"Structural triage only. No linguistic, clinical, privacy, rights or metaschema approval. Variants must be separately preserved or reconciled.", "rows":rows}

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--baseline",required=True)
    parser.add_argument("--out",required=True,type=Path)
    args=parser.parse_args()
    report=audit(args.baseline)
    args.out.parent.mkdir(parents=True,exist_ok=True)
    args.out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({k:v for k,v in report.items() if k!="rows"},ensure_ascii=False,sort_keys=True))

if __name__ == "__main__":
    main()
