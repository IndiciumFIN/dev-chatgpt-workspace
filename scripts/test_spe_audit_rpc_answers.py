#!/usr/bin/env python3
"""Regression tests for the read-only legacy RPC answer exposure audit."""
import importlib.util
import tempfile
import unittest
import zipfile
from pathlib import Path

SCRIPT = Path(__file__).with_name("spe_audit_rpc_answers.py")
spec = importlib.util.spec_from_file_location("spe_audit_rpc_answers", SCRIPT)
audit_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit_module)

def sql(name, vulnerable=True):
    fn = "api.evaluate_question_set" if name.startswith("0038") else "api.evaluate_question"
    grant = f"grant execute on function {fn}(jsonb,text) to anon, authenticated;" if vulnerable else ""
    payload = "select api.evaluate_question('id');" if name.startswith("0038") else "select correct_option_ids;"
    return f"create function {fn}(jsonb,text) returns jsonb as $$ {payload} $$ language sql;\n{grant}"

class RpcExposureAuditTests(unittest.TestCase):
    def run_audit(self, overrides=None):
        names = ("0024_api_functions.sql", "0031_cms_working_copies_option_lifecycle.sql", "0038_api_assessment_runtime.sql")
        with tempfile.TemporaryDirectory() as d:
            archive = Path(d) / "legacy.zip"
            with zipfile.ZipFile(archive, "w") as z:
                for name in names:
                    z.writestr("archive/supabase/migration_sources/" + name, (overrides or {}).get(name, sql(name)))
            return audit_module.audit(archive)

    def test_detects_legacy_public_answer_exposure(self):
        result = self.run_audit()
        self.assertEqual(result["finding"], "SPE-RPC-ANSWER-EXPOSURE")
        self.assertTrue(result["confirmed_static"])

    def test_missing_public_grant_does_not_confirm_full_chain(self):
        result = self.run_audit({"0038_api_assessment_runtime.sql": sql("0038_api_assessment_runtime.sql", False)})
        self.assertFalse(result["confirmed_static"])

    def test_missing_answer_payload_does_not_confirm_full_chain(self):
        name = "0024_api_functions.sql"
        result = self.run_audit({name: sql(name).replace("correct_option_ids", "redacted")})
        self.assertFalse(result["confirmed_static"])

    def test_missing_original_migration_does_not_confirm(self):
        result = self.run_audit({"0031_cms_working_copies_option_lifecycle.sql": ""})
        self.assertFalse(result["confirmed_static"])

if __name__ == "__main__":
    unittest.main()
