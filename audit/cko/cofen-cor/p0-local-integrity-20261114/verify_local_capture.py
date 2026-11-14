#!/usr/bin/env python3
"""Reconcile legacy COFEN/COR claim IDs against a pinned LOCAL ZIP capture.

The result confirms internal byte/offset integrity only. External primary
source authenticity, independent semantic review, legal rights, and clinical
admission remain HOLD; this tool cannot issue any reviewer receipts.

No network, no source-text output, no claim approval, no repository writes.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import re
import stat
import sys
import zipfile
from collections import Counter
from pathlib import Path, PurePosixPath

PREFIX = "cko-pilot-cofen-cor/"
SOURCE_DOCS = {
    "DOC-BR-COFEN-RES-429-2012": "https://www.cofen.gov.br/resoluo-cofen-n-4292012/",
    "DOC-BR-COFEN-RES-514-2016": "https://www.cofen.gov.br/resolucao-cofen-no-05142016/",
    "DOC-BR-COFEN-RES-736-2024": "https://www.cofen.gov.br/resolucao-cofen-no-736-de-17-de-janeiro-de-2024/",
    "DOC-BR-COFEN-RES-754-2024": "https://www.cofen.gov.br/resolucao-cofen-no-754-de-16-de-maio-de-2024/",
}
SHA256 = re.compile(r"^[a-f0-9]{64}$")
MAX_ARCHIVE_BYTES = 20_000_000
MAX_FILES = 1000
MAX_MEMBER_BYTES = 8_000_000


class IntegrityHold(Exception):
    pass


def _sha(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def _json(blob: bytes, name: str):
    try:
        return json.loads(blob.decode("utf-8-sig"))
    except (UnicodeError, ValueError) as exc:
        raise IntegrityHold(f"invalid JSON in {name}") from exc


def _jsonl(blob: bytes, name: str, id_field: str) -> dict:
    try:
        rows = [json.loads(line) for line in blob.decode("utf-8-sig").splitlines() if line.strip()]
    except (UnicodeError, ValueError) as exc:
        raise IntegrityHold(f"malformed JSONL in {name}") from exc
    if not rows or any(not isinstance(row, dict) or not isinstance(row.get(id_field), str)
                       or not row[id_field] for row in rows):
        raise IntegrityHold(f"bad JSONL rows/IDs in {name}")
    ids = [row[id_field] for row in rows]
    if len(ids) != len(set(ids)):
        raise IntegrityHold(f"duplicate {id_field} in {name}")
    return dict(zip(ids, rows))


def _csv(blob: bytes, name: str, delimiter: str) -> list[dict]:
    try:
        reader = csv.DictReader(io.StringIO(blob.decode("utf-8-sig"), newline=""),
                                delimiter=delimiter, strict=True)
        if reader.fieldnames is None or len(reader.fieldnames) != len(set(reader.fieldnames)):
            raise IntegrityHold(f"invalid CSV header in {name}")
        rows = list(reader)
        if not rows or any(None in row or any(value is None for value in row.values()) for row in rows):
            raise IntegrityHold(f"invalid CSV row in {name}")
        return rows
    except (UnicodeError, csv.Error) as exc:
        raise IntegrityHold(f"malformed CSV {name}") from exc


def _read(z: zipfile.ZipFile, name: str) -> bytes:
    try:
        info = z.getinfo(name)
    except KeyError as exc:
        raise IntegrityHold(f"missing archive member: {name}") from exc
    if info.is_dir() or info.file_size > MAX_MEMBER_BYTES or info.file_size < 0:
        raise IntegrityHold(f"unsafe member size: {name}")
    return z.read(info)


def inspect(archive: bytes, crosswalk: bytes, expected_archive_sha256: str,
            expected_crosswalk_sha256: str) -> tuple[list[dict], dict]:
    for label, digest, raw in [("archive", expected_archive_sha256, archive),
                               ("crosswalk", expected_crosswalk_sha256, crosswalk)]:
        if not isinstance(digest, str) or not SHA256.fullmatch(digest):
            raise IntegrityHold(f"{label}: pinned SHA-256 required")
        if _sha(raw) != digest:
            raise IntegrityHold(f"{label}: external SHA-256 pin mismatch")
    if len(archive) > MAX_ARCHIVE_BYTES:
        raise IntegrityHold("archive exceeds permitted size")
    rows = _csv(crosswalk, "crosswalk", ";")
    if len(rows) != 23:
        raise IntegrityHold(f"expected 23 original claims, found {len(rows)}")
    if len({r.get('claim_candidate_id') for r in rows}) != len(rows):
        raise IntegrityHold("duplicate legacy claim IDs")
    if any(r.get("clinical_release_allowed") != "false" or
           r.get("publication_decision") != "HOLD" or
           r.get("canonical_claim_id") not in ("", None) for r in rows):
        raise IntegrityHold("legacy crosswalk contains apparent release or fabricated canonical ID")

    with zipfile.ZipFile(io.BytesIO(archive)) as z:
        members = z.infolist()
        names = [f.filename for f in members]
        if not members or len(members) > MAX_FILES or len(names) != len(set(names)):
            raise IntegrityHold("ZIP empty, over file count or duplicate-name archive")
        for member in members:
            path = PurePosixPath(member.filename)
            if (path.is_absolute() or ".." in path.parts or "\\" in member.filename or
                    ":" in member.filename or stat.S_ISLNK(member.external_attr >> 16) or
                    member.flag_bits & 1 or member.file_size > MAX_MEMBER_BYTES):
                raise IntegrityHold("unsafe ZIP member/path/size")
        registries = _csv(_read(z, PREFIX+"registros/00_source_registry.csv"),
                          "source registry", ",")
        by_act = {r.get("act_id"): r for r in registries}
        if len(by_act) != len(registries):
            raise IntegrityHold("duplicate source registry act")
        doc_cache = {}
        outcomes = []
        for claim in rows:
            cid = claim["claim_candidate_id"]
            doc_id = claim.get("document_version_ids", "")
            refs = claim.get("evidence_refs", "").split("|")
            if doc_id not in SOURCE_DOCS or not refs or not all(refs) or len(set(refs)) != len(refs):
                raise IntegrityHold(f"unknown document or malformed evidence refs: {cid}")
            act = doc_id.removeprefix("DOC-")
            if doc_id not in doc_cache:
                root = PREFIX+"dados/"+act+"/"
                acquired = _json(_read(z,root+"acquisition.json"), "acquisition.json")
                extracted = _json(_read(z,root+"extraction.json"), "extraction.json")
                reg = by_act.get(act)
                if not reg:
                    raise IntegrityHold(f"registry entry missing for {act}")
                if (acquired.get("http_status") != 200 or acquired.get("error") or
                    acquired.get("official_primary_url") != SOURCE_DOCS[doc_id] or
                    extracted.get("official_primary_url") != SOURCE_DOCS[doc_id] or
                    reg.get("official_primary_url") != SOURCE_DOCS[doc_id]):
                    raise IntegrityHold(f"capture metadata inconsistent for {act}")
                raw_path = PREFIX+extracted["raw_file"]
                text_path = PREFIX+extracted["derived_text_file"]
                raw_bytes = _read(z,raw_path)
                derived = _read(z,text_path)
                raw_sha = _sha(raw_bytes)
                text_sha = _sha(derived)
                if any(raw_sha != item for item in (
                    reg.get("raw_sha256"), acquired.get("raw_sha256"), extracted.get("raw_sha256"))):
                    raise IntegrityHold(f"raw captured HTML hash chain broken: {act}")
                if text_sha != extracted.get("derived_text_sha256") or len(derived) != extracted.get("derived_text_bytes"):
                    raise IntegrityHold(f"derived text hash/length broken: {act}")
                ev = _jsonl(_read(z,root+"atoms/evidence_atoms.jsonl"), "evidence atoms", "evidence_atom_id")
                offset = _jsonl(_read(z,root+"atoms/evidence_offsets.jsonl"), "evidence offsets", "evidence_atom_id")
                claim_objects = _jsonl(_read(z,root+"atoms/clinical_claims_candidates.jsonl"), "claim objects", "claim_id")
                doc_cache[doc_id] = (raw_sha,text_sha,derived,ev,offset,claim_objects)
            raw_sha,text_sha,derived,ev,offset,claim_objects = doc_cache[doc_id]
            if cid not in claim_objects:
                raise IntegrityHold(f"claim missing from archive: {cid}")
            obj = claim_objects[cid]
            if (obj.get("clinical_release_allowed") is not False or obj.get("status") != "CANDIDATE" or
                 sorted(obj.get("source_evidence_atom_ids",[])) != sorted(refs)):
                raise IntegrityHold(f"claim evidence/approval mismatch: {cid}")
            for eid in refs:
                atom = ev.get(eid)
                location = offset.get(eid)
                if not atom or not location or atom.get("document_version_id") != doc_id:
                    raise IntegrityHold(f"orphan evidence or document mismatch: {cid}/{eid}")
                first,last = location.get("utf8_byte_start"),location.get("utf8_byte_end")
                if not isinstance(first,int) or not isinstance(last,int) or not (0 <= first < last <= len(derived)):
                    raise IntegrityHold(f"invalid offsets: {eid}")
                fragment = derived[first:last]
                if _sha(fragment) != atom.get("fragment_sha256"):
                    raise IntegrityHold(f"fragment sha mismatch: {eid}")
                try:
                    fragment_text = fragment.decode("utf-8")
                except UnicodeError as exc:
                    raise IntegrityHold(f"fragment invalid UTF-8: {eid}") from exc
                locator = atom.get("locator")
                if not isinstance(locator,str) or not locator.strip() or (
                    not locator.startswith("PREÂMBULO/") and locator not in fragment_text):
                    raise IntegrityHold(f"fragment locator mismatch: {eid}")
            historical = doc_id == "DOC-BR-COFEN-RES-429-2012"
            outcomes.append({
                "legacy_claim_id": cid,
                "document_version_id": doc_id,
                "evidence_atom_ids": refs,
                "local_capture_sha256": raw_sha,
                "local_derived_text_sha256": text_sha,
                "raw_acquisition_hash_consistent": True,
                "derived_hash_consistent": True,
                "claim_evidence_refs_consistent": True,
                "evidence_fragment_hash_and_locator_consistent": True,
                "source_origin_independently_authenticated": False,
                "primary_source_semantics_independently_reviewed": False,
                "historical_revoked_norm": historical,
                "independent_primary_receipt_id": None,
                "clinical_review_receipt_id": None,
                "rights_operation_review_receipt_id": None,
                "canonical_claim_id": None,
                "publication_allowed": False,
                "clinical_release_allowed": False,
                "status": "HOLD_PRIMARY_SEMANTICS_RIGHTS_REVIEW" if not historical else "HOLD_HISTORICAL_REVOKED_429_2012",
            })
    hist_count = sum(r["historical_revoked_norm"] for r in outcomes)
    if hist_count != 4:
        raise IntegrityHold("expected exactly 4 legacy claims from revoked 429/2012")
    summary = {
        "schema": "CKO-LOCAL-CAPTURE-CONSISTENCY-v1.0.0",
        "archive_sha256": _sha(archive),
        "crosswalk_sha256": _sha(crosswalk),
        "claims": len(outcomes),
        "unique_evidence_ids": len({e for o in outcomes for e in o["evidence_atom_ids"]}),
        "source_versions": len(doc_cache),
        "local_raw_acquisition_integrity": len(outcomes),
        "local_derived_text_integrity": len(outcomes),
        "claim_to_evidence_references": len(outcomes),
        "fragment_bytes_and_locator_consistency": len(outcomes),
        "primary_semantic_independent_verifications": 0,
        "source_origin_independent_authentications": 0,
        "claims_historical_revoked_norm": hist_count,
        "rights_review_approvals": 0,
        "clinical_review_approvals": 0,
        "canonical_claims_approved": 0,
        "technical_local_capture_pass": True,
        "global_admission_pass": False,
        "clinical_release_allowed": False,
        "publication_allowed": False,
        "note": "Local capture is reproducible within pinned ZIP; origin authentication and semantic applicability are external HOLDs.",
    }
    return outcomes,summary


def main() -> int:
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--archive",type=Path,required=True)
    p.add_argument("--crosswalk",type=Path,required=True)
    p.add_argument("--archive-sha256",required=True)
    p.add_argument("--crosswalk-sha256",required=True)
    p.add_argument("--output-dir",type=Path,required=True)
    args=p.parse_args()
    try:
        rows,report=inspect(args.archive.read_bytes(),args.crosswalk.read_bytes(),
                            args.archive_sha256,args.crosswalk_sha256)
    except (IntegrityHold,zipfile.BadZipFile,OSError,ValueError) as exc:
        print(json.dumps({"status":"HOLD","reason":str(exc),"publication_allowed":False}),file=sys.stderr)
        return 2
    args.output_dir.mkdir(parents=True,exist_ok=True)
    (args.output_dir/"local_integrity_summary.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    (args.output_dir/"claim_local_integrity.json").write_text(json.dumps(rows,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    with (args.output_dir/"claim_local_integrity.csv").open("w",encoding="utf-8-sig",newline="") as fh:
        cols=["legacy_claim_id","document_version_id","local_capture_sha256","local_derived_text_sha256","raw_acquisition_hash_consistent","derived_hash_consistent","claim_evidence_refs_consistent","evidence_fragment_hash_and_locator_consistent","source_origin_independently_authenticated","primary_source_semantics_independently_reviewed","historical_revoked_norm","publication_allowed","status"]
        writer=csv.DictWriter(fh,fieldnames=cols,extrasaction="ignore",delimiter=";")
        writer.writeheader()
        writer.writerows(rows)
    print(json.dumps(report,ensure_ascii=False,sort_keys=True))
    return 0  # local integrity only; report.global_admission_pass is always False

if __name__=="__main__":
    raise SystemExit(main())
