#!/usr/bin/env python3
"""Read-only verification of CKO candidate intake ZIP against repository schema.

No extraction, no execution of untrusted archive scripts, no publication,
no data mutation and no clinical or rights verification. Standard JSON Schema
Draft 2020-12 rejects type violations that the imported hand-written validator
failed to notice (notably array items with type=string).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import zipfile
from collections import Counter
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker

MAX_FILES = 2000
MAX_BYTES = 80_000_000
MAX_FILE = 15_000_000
SKIP_GENERATED = {"MANIFEST.json", "validation/validation-report.json"}
OBJECT_SUFFIX = ".canonical.json"
ID_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._:/@-]*$")


def _secure_names(zf: zipfile.ZipFile, errors: set[str]) -> dict[str, zipfile.ZipInfo]:
    items: dict[str, zipfile.ZipInfo] = {}
    members = zf.infolist()
    if len(members) > MAX_FILES or sum(x.file_size for x in members) > MAX_BYTES:
        errors.add("ZIP_RESOURCE_LIMIT")
        return {}
    for entry in members:
        name = entry.filename
        parts = name.split("/")
        unix_mode = entry.external_attr >> 16
        if (
            name.startswith("/") or "\\" in name or ".." in parts
            or not name or "\x00" in name or (unix_mode & 0o170000) == 0o120000
        ):
            errors.add("ZIP_UNSAFE_PATH")
            continue
        if entry.file_size > MAX_FILE or entry.flag_bits & 1:
            errors.add("ZIP_OVERSIZED_OR_ENCRYPTED_ENTRY")
            continue
        if name in items:
            errors.add("ZIP_DUPLICATE_NAME")
            continue
        if not entry.is_dir():
            items[name] = entry
    return items


def _json_bytes(raw: bytes, kind: str, errors: set[str]) -> Any:
    try:
        return json.loads(raw)
    except (UnicodeDecodeError, ValueError):
        errors.add(kind + "_INVALID_JSON")
        return None


def audit_intake(package: Path, canonical_schema: dict[str, Any]) -> dict[str, Any]:
    """Inspect uploaded ZIP; return evidence, HOLD, and non-sensitive diagnostics."""
    Draft202012Validator.check_schema(canonical_schema)
    schema_validator = Draft202012Validator(
        canonical_schema, format_checker=FormatChecker()
    )
    errors: set[str] = set()
    diagnostics: list[dict[str, str]] = []
    summary = Counter()
    result = {
        "schema": "CKO-INTAKE-STRICT-AUDIT-1.0.0",
        "status": "HOLD",
        "publication_allowed": False,
        "clinical_approval": False,
        "rights_approval": False,
        "kernel_admission": False,
        "release_gate_exit_code": 2,
        "source_zip_sha256": None,
    }
    raw = Path(package).read_bytes()
    result["source_zip_sha256"] = hashlib.sha256(raw).hexdigest()
    with zipfile.ZipFile(package) as zf:
        members = _secure_names(zf, errors)
        # A candidate package must carry exactly one manifest and a bounded
        # number of content files; neither a directory name nor .json implies trust.
        manifests = sorted(n for n in members if n.endswith("/MANIFEST.json"))
        if len(manifests) != 1:
            errors.add("INTAKE_MANIFEST_MISSING_OR_AMBIGUOUS")
            prefix = ""
            listed: set[str] = set()
        else:
            manifest_name = manifests[0]
            prefix = manifest_name[:-len("MANIFEST.json")]
            obj = _json_bytes(zf.read(manifest_name), "MANIFEST", errors)
            rows = obj.get("files") if isinstance(obj, dict) else None
            if not isinstance(rows, list):
                errors.add("MANIFEST_FILES_INVALID")
                rows = []
            listed = set()
            for row in rows:
                if not isinstance(row, dict) or not isinstance(row.get("path"), str):
                    errors.add("MANIFEST_ENTRY_INVALID")
                    continue
                rel = row["path"]
                if not rel or ".." in rel.split("/") or rel.startswith("/"):
                    errors.add("MANIFEST_PATH_UNSAFE")
                    continue
                if rel in listed:
                    errors.add("MANIFEST_ENTRY_DUPLICATED")
                listed.add(rel)
                full = prefix + rel
                if full not in members:
                    errors.add("MANIFEST_REFERENCED_FILE_MISSING")
                    continue
                data = zf.read(full)
                digest = hashlib.sha256(data).hexdigest()
                if digest != row.get("sha256") or len(data) != row.get("size_bytes"):
                    errors.add("MANIFEST_HASH_OR_SIZE_MISMATCH")
                else:
                    summary["manifest_verified"] += 1
            actual = {n[len(prefix):] for n in members if n.startswith(prefix)}
            ignored = set(SKIP_GENERATED)
            if actual - listed - ignored:
                errors.add("UNMANIFESTED_PAYLOAD_FILE")
            summary["manifest_declared"] = len(listed)

        object_paths = [
            n for n in members
            if n.startswith(prefix + "canonical-objects/")
            and n.endswith(OBJECT_SUFFIX)
        ] if prefix else []
        if not object_paths:
            errors.add("INTAKE_NO_CANONICAL_OBJECTS")
        unique_ids: set[str] = set()
        for path in sorted(object_paths):
            obj = _json_bytes(zf.read(path), "CANONICAL_OBJECT", errors)
            if not isinstance(obj, dict):
                errors.add("CANONICAL_OBJECT_NOT_OBJECT")
                continue
            summary["objects_checked"] += 1
            object_id = obj.get("canonical_id")
            valid_id = isinstance(object_id, str) and bool(ID_PATTERN.fullmatch(object_id))
            # Always validate the entire object even when its identity is absent:
            # an early return here previously hid the schema's required-field
            # failure from diagnostics.
            for issue in schema_validator.iter_errors(obj):
                errors.add("JSON_SCHEMA_VIOLATION")
                location = "/".join(str(x) for x in issue.absolute_path)
                diagnostics.append({
                    "object_id": object_id if valid_id else "[invalid-id]",
                    "json_path": location or "<root>",
                    "validator": str(issue.validator),
                })
            if not valid_id:
                errors.add("CANONICAL_OBJECT_ID_INVALID")
                continue
            if object_id in unique_ids:
                errors.add("CANONICAL_OBJECT_ID_DUPLICATED")
            unique_ids.add(object_id)
            if obj.get("status") != "CANDIDATE" or obj.get("human_review") != "PENDING":
                errors.add("INTAKE_TRUST_STATE_ESCALATED")
            if obj.get("visibility") != "INTERNAL":
                errors.add("INTAKE_VISIBILITY_ESCALATED")
            if obj.get("clinical_claim_ids"):
                summary["candidate_claim_links"] += len(obj["clinical_claim_ids"])
            if obj.get("field_binding_ids"):
                summary["candidate_field_links"] += len(obj["field_binding_ids"])
            summary["relation_tokens"] += len(obj.get("relationship_ids", []))
            # "relationship_ids" are not proven target-bound graph edges.
        summary["objects_unique"] = len(unique_ids)
        if len(diagnostics) > 200:
            diagnostics = diagnostics[:200]
            errors.add("SCHEMA_DIAGNOSTIC_TRUNCATED")

    result["counts"] = dict(summary)
    result["technically_schema_conformant"] = not errors
    result["errors"] = sorted(errors)
    result["schema_diagnostics"] = diagnostics
    result["atomization_status"] = "HOLD_EVIDENCE_CLAIMS_RIGHTS"
    result["verified_clinical_claims"] = 0
    result["verified_graph_edges"] = 0
    return result


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Read-only strict CKO intake audit")
    parser.add_argument("--package", type=Path, required=True)
    parser.add_argument(
        "--schema", type=Path,
        default=Path("contracts/cko-schemas/canonical_object.schema.json"),
    )
    parser.add_argument(
        "--diagnostic-only", action="store_true",
        help="Return 0 only on structural correctness; G6 release stays 2",
    )
    args = parser.parse_args(argv)
    try:
        schema = json.loads(args.schema.read_text(encoding="utf-8"))
        if not isinstance(schema, dict):
            raise ValueError("Schema is not an object")
        result = audit_intake(args.package, schema)
    except (OSError, ValueError, zipfile.BadZipFile, RuntimeError) as exc:
        print("HOLD_SOURCE_OR_SCHEMA:" + type(exc).__name__, file=sys.stderr)
        return 2
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, indent=2))
    if args.diagnostic_only and result["technically_schema_conformant"]:
        return 0
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
