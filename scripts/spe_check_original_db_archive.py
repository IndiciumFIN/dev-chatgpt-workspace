#!/usr/bin/env python3
"""Read-only integrity gate for the private SPE v1.4.0 source ZIP.

This does not execute SQL or confer Kernel, editorial, or release approval.
Never emit the archive's SQL contents or copy the archive into a public repo.
"""
import argparse
import hashlib
import json
import re
import stat
import sys
import zipfile
from pathlib import Path

MIGRATION = re.compile(r"^([^/]+)/supabase/migration_sources/(\d{4})_[^/]+\.sql$")
TEST = re.compile(r"^([^/]+)/supabase/tests/database/(\d{3})_[^/]+\.test\.sql$")
MAX_UNCOMPRESSED = 50 * 1024 * 1024
MAX_ENTRY = 10 * 1024 * 1024


def inspect(path):
    path = Path(path)
    with path.open("rb") as stream:
        digest = hashlib.file_digest(stream, "sha256").hexdigest()
    with zipfile.ZipFile(path) as archive:
        entries = archive.infolist()
        names = [entry.filename for entry in entries]
        duplicates = sorted({name for name in names if names.count(name) > 1})
        unsafe = sorted(name for name in names if
                        name.startswith("/") or "\\" in name or
                        any(part in ("", ".", "..") for part in name.rstrip("/").split("/")))
        symlinks = sorted(entry.filename for entry in entries if
                          stat.S_IFMT(entry.external_attr >> 16) == stat.S_IFLNK)
        encrypted = sorted(entry.filename for entry in entries if entry.flag_bits & 1)
        oversized = sorted(entry.filename for entry in entries if entry.file_size > MAX_ENTRY)
        total_size = sum(entry.file_size for entry in entries)
        size_safe = total_size <= MAX_UNCOMPRESSED and not oversized
        migration_files = sorted(name for name in names if MIGRATION.fullmatch(name))
        test_files = sorted(name for name in names if TEST.fullmatch(name))
        migration_sequence = [int(MIGRATION.fullmatch(name).group(2)) for name in migration_files]
        test_sequence = [int(TEST.fullmatch(name).group(2)) for name in test_files]
        roots = sorted({match.group(1) for name in migration_files + test_files
                        if (match := (MIGRATION.fullmatch(name) or TEST.fullmatch(name)))})
        safe_archive = size_safe and not (duplicates or unsafe or symlinks or encrypted)
        crc_pass = False
        valid_utf8 = False
        plans = False
        rollbacks = False
        definer_count = 0
        if safe_archive:
            try:
                crc_pass = archive.testzip() is None
                if crc_pass:
                    migration_sql = [archive.read(name).decode("utf-8") for name in migration_files]
                    test_sql = [archive.read(name).decode("utf-8") for name in test_files]
                    valid_utf8 = True
                    plans = all(re.search(r"\bselect\s+plan\s*\(\s*\d+\s*\)", sql, re.I) for sql in test_sql)
                    rollbacks = all(re.search(r"\brollback\s*;", sql, re.I) for sql in test_sql)
                    definer_count = sum(len(re.findall(r"\bsecurity\s+definer\b", sql, re.I)) for sql in migration_sql)
            except (UnicodeDecodeError, zipfile.BadZipFile, RuntimeError, OSError):
                crc_pass = False
        migration_complete = migration_sequence == list(range(1, 48))
        tests_complete = test_sequence == list(range(1, 18))
        integrity_pass = all((safe_archive, crc_pass, valid_utf8, migration_complete,
                              tests_complete, len(roots) == 1, plans, rollbacks))
        return {
            "schema_version": "spe-original-archive-integrity-v2",
            "source_sha256": digest,
            "source_size_bytes": path.stat().st_size,
            "zip_crc_pass": crc_pass,
            "zip_duplicate_entries": len(duplicates),
            "zip_unsafe_paths": len(unsafe),
            "zip_symlinks": len(symlinks),
            "zip_encrypted_entries": len(encrypted),
            "zip_size_limits_pass": size_safe,
            "sql_utf8_pass": valid_utf8,
            "migration_count": len(migration_files),
            "migration_sequence_0001_0047": migration_complete,
            "test_count": len(test_files),
            "test_sequence_001_017": tests_complete,
            "tests_have_plan_syntax": bool(plans),
            "tests_have_plan": bool(plans),
            "tests_have_rollback_syntax": bool(rollbacks),
            "tests_have_rollback": bool(rollbacks),
            "security_definer_occurrences_static": definer_count,
            "security_definer_occurrences": definer_count,
            "single_archive_root": len(roots) == 1,
            "source_integrity_pass": integrity_pass,
            "postgres_execution": "NOT_RUN",
            "pgtap_execution": "NOT_RUN",
            "kernel_admission": "NOT_SUBMITTED",
            "release_decision": "HOLD_HUMAN",
        }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", help="Private local v1.4.0 ZIP; never publish it")
    parser.add_argument("--expected-sha256", help="Expected complete archive SHA-256, if independently recorded")
    args = parser.parse_args()
    try:
        report = inspect(args.archive)
    except (OSError, zipfile.BadZipFile, ValueError) as exc:
        print(json.dumps({"source_integrity_pass": False, "error_type": type(exc).__name__,
                          "postgres_execution": "NOT_RUN", "release_decision": "HOLD_HUMAN"}))
        return 1
    if args.expected_sha256:
        report["expected_sha256_match"] = report["source_sha256"] == args.expected_sha256.lower()
        report["source_integrity_pass"] &= report["expected_sha256_match"]
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if report["source_integrity_pass"] else 1


if __name__ == "__main__":
    sys.exit(main())
