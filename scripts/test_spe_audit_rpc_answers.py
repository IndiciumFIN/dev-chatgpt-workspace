#!/usr/bin/env python3
"""Negative and positive regressions for legacy answer-key RPC scan."""
import importlib.util
import tempfile
import unittest
import zipfile
from pathlib import Path

spec = importlib.util.spec_from_file_location("spe_audit_rpc_answers", Path(__file__).with_name("spe_audit_rpc_answers.py"))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
NAMES = ("0024_api_functions.sql", "0031_cms_working_copies_option_lifecycle.sql", "0038_api_assessment_runtime.sql")

def sql(name, roles="anon, authenticated", answer=True):
    indirect = name.startswith("0038")
    fn = "api.evaluate_question_set" if indirect else "api.evaluate_question"
    payload = "select api.evaluate_question('id');" if indirect else ("select correct_option_ids;" if answer else "select redacted;")
    grant = f"grant execute on function {fn}(jsonb,text) to {roles};" if roles else ""
    return f"create function {fn}(jsonb,text) returns jsonb as $$ {payload} $$ language sql;\n{grant}"

class RpcExposureAuditTests(unittest.TestCase):
    def scan(self, overrides=None):
        with tempfile.TemporaryDirectory() as directory:
            archive = Path(directory) / "legacy.zip"
            with zipfile.ZipFile(archive, "w") as z:
                for name in NAMES:
                    z.writestr("archive/supabase/migration_sources/" + name, (overrides or {}).get(name, sql(name)))
            return module.audit(archive)

    def test_full_original_pattern_is_exposed(self):
        result = self.scan()
        self.assertTrue(result["confirmed_static"])
        self.assertEqual(result["exposed_migrations"], list(NAMES))

    def test_one_public_grant_is_enough_for_exposure(self):
        result = self.scan({NAMES[0]: sql(NAMES[0], "authenticated"), NAMES[1]: "", NAMES[2]: ""})
        self.assertTrue(result["confirmed_static"])
        self.assertEqual(result["exposed_migrations"], [NAMES[0]])

    def test_reversed_grants_and_split_grants(self):
        name = NAMES[0]
        source = sql(name, "authenticated, anon")
        result = self.scan({name: source, NAMES[1]: "", NAMES[2]: ""})
        self.assertEqual(result["checks"][name]["public_roles"], ["anon", "authenticated"])
        split = sql(name, "anon") + "\ngrant execute on function api.evaluate_question(jsonb,text) to authenticated;"
        result = self.scan({name: split, NAMES[1]: "", NAMES[2]: ""})
        self.assertEqual(result["checks"][name]["public_roles"], ["anon", "authenticated"])

    def test_postgresql_public_role_exposes_anonymous_and_authenticated(self):
        name = NAMES[0]
        result = self.scan({name: sql(name, "PUBLIC"), NAMES[1]: "", NAMES[2]: ""})
        self.assertTrue(result["confirmed_static"])
        self.assertEqual(result["exposed_migrations"], [name])
        self.assertTrue(result["checks"][name]["anon_grant"])
        self.assertTrue(result["checks"][name]["authenticated_grant"])

    def test_schema_wide_execute_grant_exposes_rpc(self):
        name = NAMES[2]
        source = sql(name, "") + "\nGRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA api TO PUBLIC;"
        result = self.scan({NAMES[0]: "", NAMES[1]: "", name: source})
        self.assertTrue(result["confirmed_static"])
        self.assertEqual(result["exposed_migrations"], [name])
        self.assertEqual(result["checks"][name]["public_roles"], ["public"])

    def test_schema_grant_to_other_schema_does_not_count(self):
        name = NAMES[2]
        source = sql(name, "") + "\nGRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA private TO PUBLIC;"
        result = self.scan({NAMES[0]: "", NAMES[1]: "", name: source})
        self.assertFalse(result["confirmed_static"])

    def test_grant_option_does_not_hide_public_grantee(self):
        name = NAMES[0]
        source = sql(name, "anon WITH GRANT OPTION")
        result = self.scan({name: source, NAMES[1]: "", NAMES[2]: ""})
        self.assertEqual(result["exposed_migrations"], [name])
        self.assertTrue(result["checks"][name]["anon_grant"])

    def test_missing_grant_excludes_only_that_migration(self):
        result = self.scan({NAMES[2]: sql(NAMES[2], "")})
        self.assertTrue(result["confirmed_static"])
        self.assertNotIn(NAMES[2], result["exposed_migrations"])

    def test_missing_answer_field_excludes_only_direct_migration(self):
        result = self.scan({NAMES[0]: sql(NAMES[0], answer=False)})
        self.assertNotIn(NAMES[0], result["exposed_migrations"])
        self.assertTrue(result["confirmed_static"])

    def test_no_exposure_is_not_confirmed(self):
        result = self.scan({name: sql(name, "") for name in NAMES})
        self.assertFalse(result["confirmed_static"])

    def test_missing_migrations_does_not_confirm(self):
        result = self.scan({name: "" for name in NAMES})
        self.assertFalse(result["confirmed_static"])

if __name__ == "__main__":
    unittest.main()
