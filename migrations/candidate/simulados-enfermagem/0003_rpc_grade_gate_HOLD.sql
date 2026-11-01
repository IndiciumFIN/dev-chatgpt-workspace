-- CANDIDATE ONLY — HOLD. Do NOT deploy without caller migration and Kernel WO.
-- Original v1.4.0 migration 0031/0038 expose answer-bearing SECURITY DEFINER RPCs.
-- This patch revokes direct invoker execution. It is NOT sufficient as a full solution:
-- internal owner/definer calls may continue; frontend RPC calls will break.
BEGIN;
REVOKE EXECUTE ON FUNCTION api.evaluate_question(uuid,uuid[],text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION api.evaluate_question_set(jsonb,text) FROM PUBLIC, anon, authenticated;
-- Verify via has_function_privilege('anon', ...) and 'authenticated' BEFORE COMMIT.
-- If callers still depend on these RPCs, do not apply this migration.
COMMIT;
