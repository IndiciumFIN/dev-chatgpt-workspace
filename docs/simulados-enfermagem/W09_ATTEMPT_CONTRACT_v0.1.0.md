# W09 — Contrato de tentativa e revelação de respostas
Status: CANDIDATE / NOT_DEPLOYED / NOT_KERNEL_ADMITTED.

## Estados e invariantes
CREATED → IN_PROGRESS → SUBMITTED → GRADED → CLOSED. VOID só mediante regra auditável.
- SIMULADO não revela alternativas corretas, explicações nem um oráculo ilimitado de acerto antes de GRADED.
- ESTUDO pode revelar explicação por política explícita, sem herdar a permissão de SIMULADO.
- Submit é idempotente, com ownership e nonce; relançamento não reinicia tempo ou muda a prova.
- Server grade é privativo, gabarito nunca via payload pré-submissão.
- Resultados e gabaritos após conclusão dependem de autorização vinculada à tentativa. A autenticação por si só não autoriza leitura de tentativas de terceiros.
- Para GUEST_EPHEMERAL: definir token de posse assinado, prazo e vínculo com servidor antes de qualquer endpoint. Não confiar em IDs fornecidos pelo cliente como autorização.

## Contratos de API candidatos
POST /attempts -> {attempt_id,state,deadline_at,question_public_projection}; ocultar chaves.
PUT /attempts/{id}/answers -> {accepted,version}; sem correção ou IDs certos.
POST /attempts/{id}/submit -> {attempt_id,state,score_summary}; idempotente.
GET /attempts/{id}/answers-review -> review somente com GRADED/CLOSED + proof of ownership + release policy.
O formato é desenho de API, NÃO implementação ou rota pública.

## Impacto
Substituir consumidores de evaluate_question e evaluate_question_set; revisar record_question_attempt, guest_sync e a política para estudo. Migration 0003 continua HOLD; jamais revogá-la isoladamente.

## Testes obrigatórios
1. anon sem token não lê tentativa ou respostas.
2. authenticated A não lê tentativa de B.
3. antes de SUBMITTED/GRADED nenhuma RPC revela correct_option_ids, explanation ou grade oracle.
4. duas submissões simultâneas preservam uma correção e idempotência.
5. chamadas diretas às RPCs antigas não contornam o gate.
6. pós-GRADED só o titular recupera review permitido.
7. tentativas guest não podem ser enumeradas/reaproveitadas.
8. RLS não é contornada por SECURITY DEFINER sem authorization check.
Todos NOT_RUN até ambiente descartável e migração dos consumidores.
