-- W06 regression for original SPE v1.4.0 assessment schema.
-- Run only on a disposable database after original migrations and pgTAP.
-- Authenticated role has no auth.uid() in this test; it must not have question.write.
BEGIN;
SET LOCAL search_path = public, extensions;
SELECT plan(5);
DO $$
DECLARE q uuid; a uuid;
BEGIN
 q:=private.upsert_seed_entity('QUESTION','TEST_RLS_NON_EDITOR','Questão RLS','pt-BR','questao-rls-non-editor','/questoes/questao-rls-non-editor');
 INSERT INTO assessment.questions(entity_id,question_type_code,difficulty_level) VALUES(q,'single_choice',1);
 INSERT INTO assessment.question_localizations(question_entity_id,locale,statement_text) VALUES(q,'pt-BR','Pergunta de validação RLS.');
 INSERT INTO assessment.question_options(question_entity_id,option_key,position) VALUES(q,'A',1) RETURNING id INTO a;
 INSERT INTO assessment.question_answer_keys(question_entity_id,option_id) VALUES(q,a);
 INSERT INTO assessment.question_explanations(question_entity_id,locale,explanation_text) VALUES(q,'pt-BR','Explicação privada de teste.');
END $$;
-- Setup controls: sample must exist (otherwise zero rows would be false assurance).
SELECT is((SELECT count(*)::bigint FROM assessment.question_answer_keys),1::bigint,'fixture contains one answer key');
SELECT is((SELECT count(*)::bigint FROM assessment.question_explanations),1::bigint,'fixture contains one explanation');
SELECT ok(NOT has_table_privilege('anon','assessment.question_answer_keys','SELECT'),'anon has no direct answer-key grant');
SET LOCAL ROLE authenticated;
-- Role without authenticated user session must NOT be equivalent to editor.
SELECT is((SELECT count(*)::bigint FROM assessment.question_answer_keys),0::bigint,'non-editor authenticated role cannot read answer keys');
SELECT is((SELECT count(*)::bigint FROM assessment.question_explanations),0::bigint,'non-editor authenticated role cannot read explanations');
RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
