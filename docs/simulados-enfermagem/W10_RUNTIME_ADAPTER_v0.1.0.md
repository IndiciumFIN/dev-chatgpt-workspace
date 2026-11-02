# W10 — Adaptador candidato de política de tentativas
Status: STATIC_IMPLEMENTED / TESTS_NOT_RUN / NO_SERVER_INTEGRATION

`src/lib/simulados/attempt-policy.ts` implementa uma política pura para avaliar autorização de revelação de respostas e estado de submissão. `attempt-policy.test.ts` registra casos de negativa por estado, dono, política e modo.

**Invariante de segurança:** `ownershipVerified` deve vir exclusivamente de uma camada de autorização server-side após consultar sessão e banco; nunca do cliente. Este adaptador NÃO realiza autenticação, checagem do token do convidado, locking/transação, idempotência, rate-limit ou isolamento do banco. Não é seguro expô-lo como endpoint isolado.

Faltam adaptadores concretos para as migrations originais, migrar os consumidores das RPCs `evaluate_question` e `evaluate_question_set`, bloquear caminhos legados, testar idempotência concorrente e executar E2E. A migration candidata de REVOKE permanece HOLD até fechar esses pontos.

W11 executará banco descartável e regressões. W12 tratará Kernel, QA e homologação.