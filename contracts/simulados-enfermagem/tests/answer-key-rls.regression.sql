-- Candidate pgTAP test, run only in disposable original v1.4.0 database.
-- Requires migrations 0001..0047, pgTAP extension and test seed permissions.
BEGIN;
SET LOCAL search_path = public, extensions;
SELECT plan(3);
DO $$
DECLARE q uuid; a uuid;
BEGIN
 q:=private.upsert_seed_entity('QUESTION','TEST_RLS_NON_EDITOR','Questão RLS','pt-BR','questao-rls-non-editor','/questoes/questao-rls-non-editor');
 INSERT INTO assessment.questions(entity_id,question_type_code,difficulty_level) VALUES(q,'single_choice',1) ON CONFLICT DO NOTHING;
 INSERT INTO assessment.question_localizations(question_entity_id,locale,statement_text) VALUES(q,'pt-BR','Pergunta de validação RLS.') ON CONFLICT DO NOTHING;
 INSERT INTO assessment.question_options(question_entity_id,option_key,position) VALUES(q,'A',1) RETURNING id INTO a;
 INSERT INTO assessment.question_answer_keys(question_entity_id,option_id) VALUES(q,a);
 INSERT INTO assessment.question_explanations(question_entity_id,locale,explanation_text) VALUES(q,'pt-BR','Explicação privada de teste.');
END $$;
-- Verify access is not granted directly to anonymous.
SELECT ok(NOT has_table_privilege('anon','assessment.question_answer_keys','SELECT'),'anon lacks direct grant');
SET LOCAL ROLE authenticated;
-- No application auth JWT => no question.write. Authenticated role alone must not read answers.
SELECT is((SELECT count(*)::bigint FROM assessment.question_answer_keys),0::bigint,'authenticated with no question.write cannot read answer keys');
SELECT is((SELECT count(*)::bigint FROM assessment.question_explanations),0::bigint,'authenticated with no question.write cannot read explanations');
RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
