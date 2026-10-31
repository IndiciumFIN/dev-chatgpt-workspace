#!/usr/bin/env python3
"""Read-only static scan for exposed legacy grading RPCs. Exit 0=exposure, 2=no evidence."""
import json
import re
import sys
import zipfile

FILES = (
    "0024_api_functions.sql",
    "0031_cms_working_copies_option_lifecycle.sql",
    "0038_api_assessment_runtime.sql",
)
PUBLIC_ROLES = {"anon", "authenticated", "public"}

def public_grants(source, function):
    """Detect any public role, including independent or reversed-order GRANTs."""
    pattern = (
        r"\bgrant\s+execute\s+on\s+function\s+"
        + re.escape(function)
        + r"\s*\([^;]*?\)\s*to\s+([^;]+);"
    )
    # PostgreSQL also permits schema-wide grants on all *existing* functions.
    # This is a conservative static signal, not a substitute for live ACL checks.
    schema = function.split(".")[0]
    schema_pattern = (
        r"\bgrant\s+execute\s+on\s+all\s+functions\s+in\s+schema\s+"
        + re.escape(schema)
        + r"\s+to\s+([^;]+);"
    )
    found = set()
    for grant_pattern in (pattern, schema_pattern):
        for match in re.finditer(grant_pattern, source, re.I | re.S):
            grantees = re.split(r"\s+with\s+grant\s+option\b", match.group(1), maxsplit=1, flags=re.I)[0]
            roles = {role.strip().lower().strip('"') for role in grantees.split(",")}
            found.update(roles & PUBLIC_ROLES)
    return sorted(found)

def audit(archive):
    with zipfile.ZipFile(archive) as z:
        sources = {
            p.split("/")[-1]: z.read(p).decode("utf-8")
            for p in z.namelist()
            if "/supabase/migration_sources/" in p and p.endswith(".sql")
        }
    checks = {}
    exposed = []
    for name in FILES:
        source = sources.get(name, "")
        indirect = name.startswith("0038")
        fn = "api.evaluate_question_set" if indirect else "api.evaluate_question"
        has_rpc = bool(re.search(r"\bfunction\s+" + re.escape(fn) + r"\s*\(", source, re.I))
        roles = public_grants(source, fn)
        answer_ids = "correct_option_ids" in source if not indirect else None
        calls_grading = bool(re.search(r"\bapi\.evaluate_question\s*\(", source, re.I)) if indirect else None
        risk = has_rpc and bool(roles) and (calls_grading if indirect else answer_ids)
        if risk:
            exposed.append(name)
        checks[name] = {
            "has_rpc": has_rpc,
            "anon_grant": "anon" in roles or "public" in roles,
            "authenticated_grant": "authenticated" in roles or "public" in roles,
            "public_roles": roles,
            "answer_ids": answer_ids,
            "calls_grading": calls_grading,
            "exposed": bool(risk),
        }
    return {
        "finding": "SPE-RPC-ANSWER-EXPOSURE",
        "confirmed_static": bool(exposed),
        "exposed_migrations": exposed,
        "checks": checks,
        "limitations": "Static evidence only; SQL comments, grant/revoke ordering, default PUBLIC EXECUTE privileges, role inheritance, and live DB behavior require independent verification.",
    }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: python scripts/spe_audit_rpc_answers.py original-v1.4.0.zip")
    result = audit(sys.argv[1])
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["confirmed_static"] else 2)
