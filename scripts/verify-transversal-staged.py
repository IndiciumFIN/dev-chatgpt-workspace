#!/usr/bin/env python3
"""Verifica no Git INDEX, após git add, os hashes originais preservados."""
import hashlib
import json
from pathlib import Path
import subprocess

ROOT=Path(__file__).resolve().parents[1]
relative="audit-evidence/transversal-acquisition/snapshots/20261024"
manifest=json.loads((ROOT/relative/"SNAPSHOT-MANIFEST.json").read_text("utf-8"))
files=manifest["files"]
assert len(files)>=24 and manifest["archivedDocuments"]==24
for record in files:
    repo_path=f"{relative}/{record['relativePath']}"
    raw=subprocess.run(["git","show",":"+repo_path],cwd=ROOT,check=True,capture_output=True).stdout
    assert hashlib.sha256(raw).hexdigest()==record["sha256"],f"Git blob changed source bytes: {repo_path}"
    assert len(raw)==record["sizeBytes"],f"Git blob size changed: {repo_path}"
print(f"PASS: {len(files)} staged source files match immutable snapshot checksums.")
