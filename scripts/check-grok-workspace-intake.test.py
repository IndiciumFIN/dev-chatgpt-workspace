#!/usr/bin/env python3
"""Adversarial CI checks for the 102-file Grok workspace migration manifest."""
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = Path("registers/governance/grok-workspace-intake.v1.json")
GATE = ROOT / "scripts/check-grok-workspace-intake.py"

class GrokIntakeGateTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="grok-intake-ci-")
        self.root = Path(self.temp.name)
        self.manifest = json.loads((ROOT / MANIFEST).read_text(encoding="utf8"))
        (self.root / MANIFEST).parent.mkdir(parents=True)
        (self.root / MANIFEST).write_text(json.dumps(self.manifest), encoding="utf8")
        paths = [p for p, v in self.manifest["files"].items() if v[2] == "R"]
        paths.append(".grok/app-env.json")
        for name in paths:
            target = self.root / name
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / name, target)
        subprocess.run(["git", "init", "-q"], cwd=self.root, check=True)
        subprocess.run(["git", "add", "-f", *paths], cwd=self.root, check=True)
        self.restored = [p for p in paths if p != ".grok/app-env.json"]

    def tearDown(self):
        self.temp.cleanup()

    def check_gate(self, *flags):
        return subprocess.run(["python3", str(GATE), "--root", str(self.root), *flags],
                              text=True, capture_output=True, check=False)

    def test_exact_documents_pass(self):
        result = self.check_gate()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("102/102", result.stdout)
        self.assertIn("7/7", result.stdout)

    def test_byte_drift_fails(self):
        with (self.root / self.restored[0]).open("ab") as stream:
            stream.write(b"\nchanged without approved migration\n")
        result = self.check_gate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("checksum drift", result.stderr)

    def test_missing_document_fails(self):
        (self.root / self.restored[0]).unlink()
        result = self.check_gate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("missing or untracked", result.stderr)

    def test_unknown_tracked_file_fails(self):
        path = ".grok/unreviewed-secret.txt"
        (self.root / path).write_text("not approved", encoding="utf8")
        subprocess.run(["git", "add", "-f", path], cwd=self.root, check=True)
        result = self.check_gate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("unclassified tracked", result.stderr)

    def test_runtime_config_cannot_be_overwritten_by_source(self):
        (self.root / ".grok/app-env.json").write_text('{"deploy":{"database":true}}')
        result = self.check_gate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("canonical auth-off", result.stderr)

    def test_unclassified_source_file_fails(self):
        name = self.restored[0]
        self.manifest["files"][name][2] = "?"
        (self.root / MANIFEST).write_text(json.dumps(self.manifest), encoding="utf8")
        result = self.check_gate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("invalid size or disposition", result.stderr)

    def test_release_is_blocked_while_review_pending(self):
        result = self.check_gate("--release-gate")
        pending = sum(v[2] not in ("R", "C", "X")
                      for v in self.manifest["files"].values())
        if pending:
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("release not eligible", result.stderr)
        else:
            self.assertEqual(result.returncode, 0, result.stderr)

if __name__ == "__main__":
    unittest.main(verbosity=2)
