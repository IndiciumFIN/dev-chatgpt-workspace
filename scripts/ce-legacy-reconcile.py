#!/usr/bin/env python3
"""CE historical-source reconciler: local Git checkouts, safe deterministic batches.

No remote writes, SQL, deletions, activation, deploys, secrets, or force merge.
Use 'verify' in CI. 'stage' is dry-run unless --apply is supplied.
Source must be pinned to the exact commit recorded by the manifest.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys

DEFAULT = "registers/governance/ce-origin-reconciliation-20261120.v1.json"
ARCHIVE = "intake/legacy-ce/"
ALLOWED_STATES = {"ARCHIVED_SOURCE_EXACT", "PENDING_TRIAGE", "COLLISION_MANUAL_RECONCILIATION", "ALREADY_IDENTICAL"}
DANGER = re.compile(rb"(?:ghp_[A-Za-z0-9]{16,}|sb_secret_[A-Za-z0-9_-]{16,}|sk-[A-Za-z0-9_-]{24,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)", re.I)

def fail(message: str) -> None:
    raise ValueError(message)

def git(repo: Path, *args: str) -> str:
    result = subprocess.run(["git", "-C", str(repo), *args], capture_output=True, text=True, check=False)
    if result.returncode:
        fail("git " + " ".join(args) + ": " + result.stderr[:350])
    return result.stdout.strip()

def git_sha(data: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()

def target_path(root: Path, relative: str) -> Path:
    name = PurePosixPath(relative)
    if not relative or "\\" in relative or name.is_absolute() or ".." in name.parts or "." in name.parts:
        fail("unsafe path: " + repr(relative))
    if not relative.startswith("intake/legacy-ce/") and relative != DEFAULT:
        fail("outside archival scope: " + relative)
    candidate = root.joinpath(*name.parts)
    if root.resolve() not in candidate.resolve().parents:
        fail("path escapes target: " + relative)
    return candidate

def source_path(root: Path, relative: str) -> Path:
    name = PurePosixPath(relative)
    if not relative or "\\" in relative or name.is_absolute() or ".." in name.parts:
        fail("unsafe source path")
    path = root.joinpath(*name.parts)
    if root.resolve() not in path.resolve().parents:
        fail("source path escapes checkout")
    if path.is_symlink():
        fail("symlink source blocked: " + relative)
    return path

def load(root: Path, manifest: str) -> dict:
    m = target_path(root, manifest)
    data = json.loads(m.read_text(encoding="utf8"))
    records = data.get("records")
    if not isinstance(records, list) or len(records) != data.get("counts", {}).get("total"):
        fail("manifest total mismatch")
    if len({r["path"] for r in records}) != len(records):
        fail("duplicate canonical paths")
    count = Counter(r.get("status") for r in records)
    for key, number in count.items():
        if key not in ALLOWED_STATES or data["counts"].get(key) != number:
            fail("invalid status or count mismatch: " + str(key))
    for key in ALLOWED_STATES:
        if data["counts"].get(key, 0) != count[key]:
            fail("stale count: " + key)
    for r in records:
        if not re.fullmatch(r"[a-f0-9]{40}", r.get("sourceBlobSha", "")):
            fail("invalid source git blob sha: " + str(r.get("path")))
        if not isinstance(r.get("bytes"), int) or r["bytes"] < 0:
            fail("invalid byte length: " + str(r.get("path")))
        if r.get("admitted") is not False:
            fail("unexpected automatic admission: " + str(r.get("path")))
    if data.get("policy", {}).get("overwriteConflicts") is not False:
        fail("fail-closed conflict policy missing")
    if data.get("policy", {}).get("archiveIsAdmission") is not False:
        fail("archive must not be automatic clinical admission")
    return data

def verify(root: Path, manifest: str, source: Path | None) -> dict:
    m = load(root, manifest)
    count = Counter()
    seen_hashes = defaultdict(list)
    for i, r in enumerate(m["records"], 1):
        state, original = r["status"], r["path"]
        seen_hashes[r["sourceBlobSha"]].append(original)
        if state == "ARCHIVED_SOURCE_EXACT":
            archive = r.get("archivePath")
            if archive != ARCHIVE + original:
                fail("archive path mismatch: " + original)
            path = target_path(root, archive)
            if path.is_symlink() or not path.is_file():
                fail("archived file missing: " + archive)
            blob = path.read_bytes()
            if len(blob) != r["bytes"] or git_sha(blob) != r["sourceBlobSha"]:
                fail("archive SHA or length mismatch: " + archive)
            if r.get("sha256") and hashlib.sha256(blob).hexdigest() != r["sha256"]:
                fail("archive SHA-256 mismatch: " + archive)
        if source is not None:
            s = source_path(source, original)
            if not s.is_file():
                fail("source file missing: " + original)
            blob = s.read_bytes()
            if len(blob) != r["bytes"] or git_sha(blob) != r["sourceBlobSha"]:
                fail("source mutation: " + original)
        count[state] += 1
        if i % 10 == 0 or i == len(m["records"]):
            print(f"[{i:03}/{len(m['records']):03}] verified")
    if source is not None:
        if git(source, "rev-parse", "HEAD") != m["source"]["sha"]:
            fail("source checkout HEAD must be pinned to manifest SHA")
        all_files = git(source, "ls-files", "--cached", "-z")
        # '--cached -z' returns NUL-separated entries; text mode strips trailing NUL.
        actual = {p for p in all_files.split("\0") if p}
        expected = {r["path"] for r in m["records"]}
        if actual != expected:
            fail("source file list differs from 176-file snapshot")
    duplicates = [v for v in seen_hashes.values() if len(v) > 1]
    print("PASS CE source inventory: " + str(len(m["records"])) +
          " records; " + str(count["ARCHIVED_SOURCE_EXACT"]) + " archived; " +
          str(count["PENDING_TRIAGE"]) + " pending; " +
          str(count["COLLISION_MANUAL_RECONCILIATION"]) + " collisions; " +
          str(len(duplicates)) + " duplicate-content candidate group(s).")
    print("NO SQL / no remote writes / no automatic clinical admission")
    return m

def stage(root: Path, source: Path, manifest: str, size: int, apply: bool) -> None:
    m = load(root, manifest)
    if git(source, "rev-parse", "HEAD") != m["source"]["sha"]:
        fail("source revision is not pinned")
    if source.resolve() == root.resolve():
        fail("source and target checkouts must be distinct")
    if apply and git(root, "status", "--porcelain"):
        fail("target checkout must be clean before --apply")
    rows = [r for r in m["records"]
            if r["status"] == "PENDING_TRIAGE" and
            r["path"].startswith("docs/") and r["path"].endswith(".md")]
    rows = sorted(rows, key=lambda r: r["path"])[:size]
    prepared = []
    for n, r in enumerate(rows, 1):
        original = r["path"]
        src = source_path(source, original)
        dest = target_path(root, ARCHIVE + original)
        if dest.exists() or dest.is_symlink():
            fail("destination exists; NO OVERWRITE: " + str(dest))
        blob = src.read_bytes()
        if len(blob) != r["bytes"] or git_sha(blob) != r["sourceBlobSha"]:
            fail("source SHA mismatch: " + original)
        if DANGER.search(blob):
            fail("secret-like string in source: " + original)
        if not blob.startswith(b"#"):
            fail("unexpected non-Markdown document: " + original)
        prepared.append((r, blob, dest))
        print(f"[{n:02}/{len(rows):02}] {'STAGING' if apply else 'WOULD STAGE'} {original}")
    if not prepared:
        print("NO eligible pending docs; nothing changed.")
        return
    if not apply:
        print("DRY-RUN only: add --apply to copy into archival intake; no git commit or push performed.")
        return
    for r, blob, dest in prepared:
        dest.parent.mkdir(parents=True, exist_ok=True)
        with dest.open("xb") as handle:
            handle.write(blob)
        r["status"] = "ARCHIVED_SOURCE_EXACT"
        r["archivePath"] = ARCHIVE + r["path"]
        r["sha256"] = hashlib.sha256(blob).hexdigest()
    count = Counter(r["status"] for r in m["records"])
    m["counts"] = {"total": len(m["records"]), **{key: count[key] for key in sorted(count)}}
    target_path(root, manifest).write_text(json.dumps(m, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
    verify(root, manifest, None)
    print(f"STAGED {len(prepared)} files only. Review Git diff, run CI, then commit manually.")

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["verify", "stage"])
    parser.add_argument("--target", type=Path, default=Path("."))
    parser.add_argument("--source", type=Path)
    parser.add_argument("--manifest", default=DEFAULT)
    parser.add_argument("--batch-size", type=int, default=10)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    try:
        root = args.target.resolve()
        source = args.source.resolve() if args.source else None
        if args.action == "verify":
            verify(root, args.manifest, source)
        else:
            if source is None:
                fail("stage requires --source (pinned Git checkout)")
            if args.batch_size < 1 or args.batch_size > 25:
                fail("batch size must be 1..25")
            stage(root, source, args.manifest, args.batch_size, args.apply)
        return 0
    except (ValueError, OSError, KeyError, json.JSONDecodeError) as exc:
        print("FAIL CE reconciliation: " + str(exc), file=sys.stderr)
        return 2

if __name__ == "__main__":
    sys.exit(main())
