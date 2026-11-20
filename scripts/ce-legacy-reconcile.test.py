#!/usr/bin/env python3
"""Adversarial offline checks; no GitHub credential, SQL, network or production data."""
import importlib.util
from pathlib import Path
import json
import subprocess
import tempfile
import unittest
import hashlib
from contextlib import redirect_stdout
from io import StringIO

SCRIPT=Path(__file__).with_name("ce-legacy-reconcile.py")
spec=importlib.util.spec_from_file_location("ce_reconcile", SCRIPT)
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class ReconcileTests(unittest.TestCase):
    def test_live_workspace_inventory_is_byte_exact(self):
        with redirect_stdout(StringIO()):
            m=module.verify(SCRIPT.parent.parent, module.DEFAULT, None)
        self.assertEqual(len(m["records"]),m["counts"]["total"])
        self.assertGreaterEqual(m["counts"]["ARCHIVED_SOURCE_EXACT"],40)
        self.assertEqual(m["counts"]["COLLISION_MANUAL_RECONCILIATION"],6)

    def test_forbid_traversal(self):
        with tempfile.TemporaryDirectory() as folder:
            for candidate in ["../secret", "/etc/passwd", "intake/legacy-ce/../../etc", "intake\\other"]:
                with self.assertRaises(ValueError):
                    module.target_path(Path(folder), candidate)

    def test_blob_hash_matches_git_sha(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)
            path=root/"sample.md"
            path.write_bytes(b"# example\n")
            expected=subprocess.run(["git","hash-object",str(path)],capture_output=True,text=True,check=True).stdout.strip()
            self.assertEqual(module.git_sha(path.read_bytes()),expected)

    def test_stage_is_dry_run_by_default_and_rejects_overwrite(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);source=root/"source";target=root/"target"
            source.mkdir();target.mkdir()
            for repo in [source,target]:
                subprocess.run(["git","init","-q",str(repo)],check=True)
            file=source/"docs"/"file.md";file.parent.mkdir()
            file.write_bytes(b"# Historic guidance\n")
            subprocess.run(["git","-C",str(source),"add","."],check=True)
            subprocess.run(["git","-C",str(source),"-c","user.email=test@example.org","-c","user.name=Test","commit","-qm","fixture"],check=True)
            srcsha=module.git(source,"rev-parse","HEAD")
            record={"path":"docs/file.md","sourceBlobSha":module.git_sha(file.read_bytes()),"bytes":len(file.read_bytes()),"status":"PENDING_TRIAGE","admitted":False}
            m={"source":{"sha":srcsha},"counts":{"total":1,"PENDING_TRIAGE":1},"records":[record],"policy":{"overwriteConflicts":False,"archiveIsAdmission":False}}
            manifest=target/module.DEFAULT;manifest.parent.mkdir(parents=True)
            manifest.write_text(json.dumps(m))
            subprocess.run(["git","-C",str(target),"add","."],check=True)
            subprocess.run(["git","-C",str(target),"-c","user.email=test@example.org","-c","user.name=Test","commit","-qm","fixture"],check=True)
            with redirect_stdout(StringIO()):
                module.stage(target,source,module.DEFAULT,1,False)
            self.assertFalse((target/"intake/legacy-ce/docs/file.md").exists())
            with redirect_stdout(StringIO()):
                module.stage(target,source,module.DEFAULT,1,True)
            self.assertTrue((target/"intake/legacy-ce/docs/file.md").exists())
            self.assertEqual(json.loads(manifest.read_text())["counts"]["ARCHIVED_SOURCE_EXACT"],1)
            self.assertEqual(json.loads(manifest.read_text())["counts"].get("PENDING_TRIAGE",0),0)
            with self.assertRaises(ValueError):
                module.stage(target,source,module.DEFAULT,1,True) # dirty worktree guard

    def test_changed_source_digest_is_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);source=root/"source";target=root/"target"
            source.mkdir();target.mkdir()
            for repo in [source,target]:
                subprocess.run(["git","init","-q",str(repo)],check=True)
            f=source/"docs"/"file.md";f.parent.mkdir()
            f.write_bytes(b"# tampered content\n")
            subprocess.run(["git","-C",str(source),"add","."],check=True)
            subprocess.run(["git","-C",str(source),"-c","user.email=test@example.org","-c","user.name=Test","commit","-qm","fixture"],check=True)
            m={"source":{"sha":module.git(source,"rev-parse","HEAD")},
               "counts":{"total":1,"PENDING_TRIAGE":1},
               "records":[{"path":"docs/file.md","sourceBlobSha":"0"*40,"bytes":len(f.read_bytes()),"status":"PENDING_TRIAGE","admitted":False}],
               "policy":{"overwriteConflicts":False,"archiveIsAdmission":False}}
            dest=target/module.DEFAULT;dest.parent.mkdir(parents=True);dest.write_text(json.dumps(m))
            with self.assertRaisesRegex(ValueError,"source SHA mismatch"):
                with redirect_stdout(StringIO()):
                    module.stage(target,source,module.DEFAULT,1,False)

if __name__=="__main__":
    unittest.main(verbosity=2)
