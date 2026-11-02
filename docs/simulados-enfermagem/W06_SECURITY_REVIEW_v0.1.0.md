# Auditoria de segurança da fonte original v1.4.0 — W06
Status: STATIC_REVIEW / RUNTIME_NOT_RUN / NOT_APPROVED

Source archive: simulados-platform-next-cms-v1.4.0.zip (Google Drive file 1O2drLtDpNoSl5Lk-GeOPRdaKzpsOJ2i9).

## Evidência concreta
- migration_sources/0027_grants.sql: authenticated tem SELECT em assessment.question_answer_keys e question_explanations.
- migration_sources/0025_rls_core_content.sql: RLS habilitado nessas tabelas; política answerkeys_editor_read usa private.has_permission('question.write'); política de editor geral também exige essa permissão.
- tests/database/004_question_security.test.sql: confirma ausência de SELECT direto para anon; não testa explicitamente usuário authenticated sem permissão.

## Avaliação
RLS condicionado a permissão é barreira potencialmente adequada. Um GRANT não comprova exposição. Estado: INCONCLUSIVE_UNTIL_RUNTIME_AND_PERMISSION_FUNCTION_AUDIT.
Verificar search_path, SECURITY DEFINER e a fonte de autorização da private.has_permission antes de qualquer liberação.

## Teste novo
contracts/simulados-enfermagem/tests/answer-key-rls.regression.sql: prova de regressão fail-closed; role authenticated sem claim/permission deve observar zero gabaritos e explicações. Teste preparado, não executado.

## Restrições
W01 candidata spe_candidate continua HOLD por duplicação com os 47 SQLs originais. Nenhuma migration foi aplicada ao Supabase. O site ao vivo não foi inspecionado com sucesso.