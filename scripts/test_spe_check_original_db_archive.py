#!/usr/bin/env python3
"""Synthetic-only source-integrity tests; never includes private SQL."""
import importlib.util
import tempfile
import unittest
import zipfile
from pathlib import Path

spec = importlib.util.spec_from_file_location("spe_archive", Path(__file__).with_name("spe_check_original_db_archive.py"))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class SourceArchiveTests(unittest.TestCase):
    def fixture(self, *, migrations=47, tests=17, plan=True, rollback=True, plan_sql=None, rollback_sql=None):
        temporary = tempfile.TemporaryDirectory()
        path = Path(temporary.name) / "synthetic.zip"
        with zipfile.ZipFile(path, "w") as archive:
            for n in range(1, migrations + 1):
                archive.writestr(f"synthetic/supabase/migration_sources/{n:04d}_fixture.sql", "SELECT 1;")
            for n in range(1, tests + 1):
                statements = (plan_sql if plan_sql is not None else ("SELECT plan(1);" if plan else "SELECT 1;")) + "\n"
                statements += rollback_sql if rollback_sql is not None else ("ROLLBACK;" if rollback else "SELECT 2;")
                archive.writestr(f"synthetic/supabase/tests/database/{n:03d}_fixture.test.sql", statements)
        return temporary, path

    def test_complete_source_does_not_authorize_release(self):
        tmp, path = self.fixture()
        with tmp:
            report = module.inspect(path)
            self.assertTrue(report["source_integrity_pass"])
            self.assertEqual(report["postgres_execution"], "NOT_RUN")
            self.assertEqual(report["release_decision"], "HOLD_HUMAN")

    def test_missing_migration_fails_closed(self):
        tmp, path = self.fixture(migrations=46)
        with tmp:
            self.assertFalse(module.inspect(path)["source_integrity_pass"])

    def test_missing_test_fails_closed(self):
        tmp, path = self.fixture(tests=16)
        with tmp:
            self.assertFalse(module.inspect(path)["source_integrity_pass"])

    def test_missing_plan_fails_closed(self):
        tmp, path = self.fixture(plan=False)
        with tmp:
            self.assertFalse(module.inspect(path)["source_integrity_pass"])

    def test_missing_rollback_fails_closed(self):
        tmp, path = self.fixture(rollback=False)
        with tmp:
            self.assertFalse(module.inspect(path)["source_integrity_pass"])


    def test_comment_only_plan_is_not_executable(self):
        tmp, path = self.fixture(plan_sql="-- SELECT plan(1);")
        with tmp:
            self.assertFalse(module.inspect(path)["source_integrity_pass"])

    def test_comment_only_rollback_is_not_executable(self):
        tmp, path = self.fixture(rollback_sql="/* ROLLBACK; */")
        with tmp:
            self.assertFalse(module.inspect(path)["source_integrity_pass"])

    def test_nested_comment_cannot_fake_rollback(self):
        tmp, path = self.fixture(rollback_sql="/* outer /* ROLLBACK; */ still comment */")
        with tmp:
            self.assertFalse(module.inspect(path)["source_integrity_pass"])

    def test_quoted_literal_cannot_fake_plan(self):
        tmp, path = self.fixture(plan_sql="SELECT 'SELECT plan(1);';")
        with tmp:
            self.assertFalse(module.inspect(path)["source_integrity_pass"])

    def test_dollar_quoted_literal_cannot_fake_rollback(self):
        tmp, path = self.fixture(rollback_sql="SELECT $tag$ROLLBACK;$tag$;")
        with tmp:
            self.assertFalse(module.inspect(path)["source_integrity_pass"])

    def test_unclosed_block_comment_fails_closed(self):
        tmp, path = self.fixture(rollback_sql="/* ROLLBACK;")
        with tmp:
            report = module.inspect(path)
            self.assertFalse(report["test_sql_lexical_pass"])
            self.assertFalse(report["source_integrity_pass"])

    def test_real_tokens_with_comments_still_pass_lexically(self):
        tmp, path = self.fixture(plan_sql="SELECT /* valid */ plan(1);",
                                 rollback_sql="ROLLBACK; -- safe trailing comment")
        with tmp:
            report = module.inspect(path)
            self.assertTrue(report["test_sql_lexical_pass"])
            self.assertTrue(report["source_integrity_pass"])

if __name__ == "__main__":
    unittest.main()
