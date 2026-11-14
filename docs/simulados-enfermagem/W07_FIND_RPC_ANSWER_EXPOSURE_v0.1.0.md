# W07 — Achado de segurança: exposição de gabarito via RPC

Estado: **CONFIRMED_STATIC / REMEDIATION_PENDING / NO_LIVE_TEST**. Fonte: arquivo histórico `simulados-platform-next-cms-v1.4.0.zip` (Drive ID `1O2drLtDpNoSl5Lk-GeOPRdaKzpsOJ2i9`).

## Evidência verificável

- `supabase/migration_sources/0024_api_functions.sql`: `api.evaluate_question(uuid,uuid[],text)` retorna `correct_option_ids`, `explanation` e `correct`; EXECUTE concedido a `anon, authenticated`.
- `supabase/migration_sources/0031_cms_working_copies_option_lifecycle.sql`: redefine a mesma RPC, conserva os campos e o GRANT; confere somente se a questão está publicada e se alternativas estão ativas.
- `supabase/migration_sources/0038_api_assessment_runtime.sql`: `api.evaluate_question_set(jsonb,text)` chama `evaluate_question` e é concedida a `anon, authenticated`.
- `supabase/migration_sources/0025_rls_core_content.sql`: RLS das tabelas de respostas exige autorização editorial, mas RPC `SECURITY DEFINER` não segue necessariamente a RLS do chamador.

## Impacto

A API retorna explicitamente IDs das alternativas corretas de questões públicas. Isso contorna a intenção de sigilo dos gabaritos **se** o produto exige revelação apenas após submissão válida. É achado no código, não afirmação sobre o deploy atual.

## Remediação candidata — ainda não autorizada

1. Distinguir *correção*, *resultado* e *revelação de gabarito* em contratos independentes.
2. Para simulado ativo: persistir respostas, validar tentativa, limite/estado, computar resultado no servidor e só revelar gabarito pela política de conclusão.
3. Não manter RPC pública que retorna `correct_option_ids` antes da conclusão; analisar o caso de estudo livre como política específica, sem misturar com simulado.
4. Testar a impossibilidade de acesso para anônimos e autenticados sem tentativa concluída; verificar ambos os caminhos de API, inclusive chamadas diretas.
5. **Não aplicar um REVOKE isolado em produção** sem antes atualizar os consumidores `api.evaluate_question_set`, fluxos de quiz e clientes; isso poderia interromper correções.

## Gates

| Gate | Estado |
|---|---|
| Fonte SQL inspecionada | PASS_STATIC |
| Inventário de chamadores | PARTIAL |
| Correção de contratos / nova API | NOT_STARTED |
| SQL original executado em DB descartável | NOT_RUN |
| Testes com anon/authenticated | NOT_RUN |
| Kernel WO / homologação | HOLD |

Nenhuma alteração no banco remoto ou na `main`.
