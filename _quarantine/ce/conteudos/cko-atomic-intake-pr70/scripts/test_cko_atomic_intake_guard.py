"""Independent negative tests for the CKO atomic-intake false-PASS regression.

All fixtures synthetic. No clinical source, credentials, patient information,
or imported ZIP is committed to the repository.
"""
from __future__ import annotations

import hashlib
import io
import json
import tempfile
import unittest
import zipfile
from contextlib import redirect_stdout
from pathlib import Path

from importlib.util import module_from_spec, spec_from_file_location

SCRIPT = Path(__file__).with_name("cko-atomic-intake-guard.py")
SPEC = spec_from_file_location("cko_atomic_intake_guard", SCRIPT)
assert SPEC and SPEC.loader
module = module_from_spec(SPEC)
SPEC.loader.exec_module(module)
audit_intake, main = module.audit_intake, module.main
SCHEMA = Path("contracts/cko-schemas/canonical_object.schema.json")
PREFIX = "repo-adapted/imports/intake-2026-11-14/"


def candidate(**changes):
    item = {
        "schema_version": "0.1.0",
        "canonical_id": "TEST-CKO-0001",
        "version": "0.0.1",
        "status": "CANDIDATE",
        "updated_at": "2026-11-14",
        "provenance_refs": ["src:synthetic-v1:sha256:0000"],
        "object_type": "condition",
        "localized_title_keys": {"pt-BR": "Exemplo inteiramente sintético"},
        "field_binding_ids": [],
        "relationship_ids": ["cko-rel:educational"],
        "clinical_claim_ids": [],
        "visibility": "INTERNAL",
        "human_review": "PENDING",
    }
    item.update(changes)
    return item


class StrictIntakeGuardTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema = json.loads(SCHEMA.read_text(encoding="utf-8"))

    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix="cko-intake-test-")
        self.addCleanup(self.directory.cleanup)
        self.path = Path(self.directory.name) / "synthetic.zip"

    def pack(self, objects=None, *,
             tamper_manifest=False, extra=None, add_manifest=True):
        if objects is None:
            objects = [candidate()]
        entries = {}
        for index, item in enumerate(objects):
            name = f"canonical-objects/object-{index:02d}.canonical.json"
            entries[name] = (json.dumps(item, ensure_ascii=False) + "\n").encode()
        manifest = {"package": "TEST-FIXTURE", "files": [
            {
                "path": path,
                "sha256": hashlib.sha256(data).hexdigest(),
                "size_bytes": len(data),
            }
            for path, data in entries.items()
        ]}
        if tamper_manifest and manifest["files"]:
            manifest["files"][0]["sha256"] = "0" * 64
        with zipfile.ZipFile(self.path, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
            for key, data in entries.items():
                zf.writestr(PREFIX + key, data)
            if add_manifest:
                zf.writestr(PREFIX + "MANIFEST.json", json.dumps(manifest))
            for key, data in extra or []:
                zf.writestr(key, data)
        return self.path

    def inspect(self, *args, **kwargs):
        self.pack(*args, **kwargs)
        return audit_intake(self.path, self.schema)

    def test_valid_synthetic_candidate_only_passes_structure(self):
        report = self.inspect()
        self.assertTrue(report["technically_schema_conformant"], report["errors"])
        self.assertEqual(report["counts"]["manifest_verified"], 1)
        self.assertEqual(report["status"], "HOLD")
        self.assertEqual(report["release_gate_exit_code"], 2)
        self.assertFalse(report["clinical_approval"])
        self.assertFalse(report["publication_allowed"])

    def test_original_intake_regression_provenance_objects_are_rejected(self):
        item = candidate(provenance_refs=[{"source_type": "drive_snapshot", "sha256": "0" * 64}])
        report = self.inspect([item])
        self.assertIn("JSON_SCHEMA_VIOLATION", report["errors"])
        self.assertIn("provenance_refs/0", [x["json_path"] for x in report["schema_diagnostics"]])
        self.assertFalse(report["technically_schema_conformant"])

    def test_absent_required_field_is_rejected(self):
        item = candidate()
        del item["canonical_id"]
        report = self.inspect([item])
        self.assertIn("JSON_SCHEMA_VIOLATION", report["errors"])

    def test_unknown_property_is_rejected(self):
        report = self.inspect([candidate(auth_field="self-approve")])
        self.assertIn("JSON_SCHEMA_VIOLATION", report["errors"])

    def test_self_declared_released_state_never_proves_admission(self):
        report = self.inspect([candidate(status="RELEASED", visibility="PUBLIC_RELEASED", human_review="APPROVED")])
        self.assertIn("INTAKE_TRUST_STATE_ESCALATED", report["errors"])
        self.assertIn("INTAKE_VISIBILITY_ESCALATED", report["errors"])
        self.assertFalse(report["kernel_admission"])

    def test_manifest_hash_mismatch_rejected(self):
        report = self.inspect(tamper_manifest=True)
        self.assertIn("MANIFEST_HASH_OR_SIZE_MISMATCH", report["errors"])

    def test_duplicate_canonical_id_rejected(self):
        report = self.inspect([candidate(), candidate()])
        self.assertIn("CANONICAL_OBJECT_ID_DUPLICATED", report["errors"])

    def test_path_traversal_is_not_extracted_and_blocks(self):
        report = self.inspect(extra=[("../../escape.json", "{}")])
        self.assertIn("ZIP_UNSAFE_PATH", report["errors"])

    def test_unmanifested_script_is_not_executed_and_blocks(self):
        report = self.inspect(extra=[(PREFIX + "script.py", "raise RuntimeError('must not execute')")])
        self.assertIn("UNMANIFESTED_PAYLOAD_FILE", report["errors"])

    def test_missing_manifest_blocks(self):
        report = self.inspect(add_manifest=False)
        self.assertIn("INTAKE_MANIFEST_MISSING_OR_AMBIGUOUS", report["errors"])

    def test_diagnostic_mode_is_not_clinical_release(self):
        self.pack()
        with io.StringIO() as output, redirect_stdout(output):
            code = main(["--package", str(self.path), "--schema", str(SCHEMA), "--diagnostic-only"])
            response = json.loads(output.getvalue())
        self.assertEqual(code, 0)
        self.assertEqual(response["release_gate_exit_code"], 2)
        self.assertEqual(response["atomization_status"], "HOLD_EVIDENCE_CLAIMS_RIGHTS")

    def test_release_mode_exits_two_even_for_valid_synthetic(self):
        self.pack()
        with io.StringIO() as output, redirect_stdout(output):
            code = main(["--package", str(self.path), "--schema", str(SCHEMA)])
            response = json.loads(output.getvalue())
        self.assertEqual(code, 2)
        self.assertFalse(response["rights_approval"])

    def test_invalid_schema_is_rejected(self):
        self.pack()
        with io.StringIO() as output, redirect_stdout(output):
            code = main([
                "--package", str(self.path),
                "--schema", str(Path(self.directory.name) / "nonexistent.json"),
            ])
        self.assertEqual(code, 2)


if __name__ == "__main__":
    unittest.main()
