#!/usr/bin/env python3
"""W04: import existing Vila assets in deterministic, fail-closed manner.

Usage: python3 scripts/vila-import-assets.py --packages DIR [--apply]
No --apply: validates packages and source hash, does not mutate files.
--apply: writes only declared public/vila files, refusing conflicting bytes.
"""
import argparse
import hashlib
import json
import pathlib
import sys
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
PACKAGES = ("VILA-W01-brand-hero-v0.2.0.zip", "VILA-W02-characters-v0.2.0.zip", "VILA-W03-quick-feature-v0.2.0.zip")
MASTER_SHA = "98291b0432233002000f5d2be7a18a60e6ae950da26454be56cc008608556d6d"

def digest(data):
    return hashlib.sha256(data).hexdigest()

def run(directory, apply=False):
    verified = []
    for package in PACKAGES:
        p = directory / package
        if not p.is_file():
            raise ValueError(f"MISSING_PACKAGE:{p}")
        with zipfile.ZipFile(p) as archive:
            if archive.testzip() is not None:
                raise ValueError(f"CORRUPT_PACKAGE:{package}")
            manifest = json.loads(archive.read("ASSETS_MANIFEST.json"))
            if manifest.get("source_archive_sha256") != MASTER_SHA:
                raise ValueError(f"INVALID_MASTER_HASH:{package}")
            for item in manifest["assets"]:
                target = pathlib.PurePosixPath(item["target"])
                if target.is_absolute() or ".." in target.parts or target.parts[:2] != ("public", "vila"):
                    raise ValueError(f"UNSAFE_PATH:{target}")
                data = archive.read(str(target))
                if digest(data) != item["sha256"] or len(data) != item["bytes"]:
                    raise ValueError(f"HASH_MISMATCH:{target}")
                dest = ROOT.joinpath(*target.parts)
                if dest.exists() and digest(dest.read_bytes()) != item["sha256"]:
                    raise ValueError(f"CONFLICTING_DESTINATION:{target}")
                verified.append((dest, data, item))
    if len(verified) != 8 or len({str(x[0]) for x in verified}) != 8:
        raise ValueError("ASSET_COUNT_OR_DUPLICATE_ERROR")
    if apply:
        for dest, data, _ in verified:
            dest.parent.mkdir(parents=True, exist_ok=True)
            if not dest.exists():
                dest.write_bytes(data)
            if digest(dest.read_bytes()) != digest(data):
                raise ValueError(f"WRITE_VERIFY_FAILED:{dest}")
    return {"status": "IMPORTED" if apply else "VERIFIED_ONLY", "count": len(verified),
            "assets": [{"path": str(x[0].relative_to(ROOT)), "sha256": x[2]["sha256"], "bytes": len(x[1])} for x in verified]}

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--packages", type=pathlib.Path, required=True)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    try:
        result = run(args.packages, args.apply)
        print(json.dumps(result, indent=2, ensure_ascii=False))
    except (ValueError, OSError, KeyError, zipfile.BadZipFile) as exc:
        print(json.dumps({"status": "FAIL", "reason": str(exc)}), file=sys.stderr)
        sys.exit(1)
