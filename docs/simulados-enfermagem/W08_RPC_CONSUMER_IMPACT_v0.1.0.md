# W08 — Bloqueio de exposição de gabarito: impacto e gates

**Estado: CANDIDATE / STATIC / NOT_APPLIED / HOLD_KERNEL**

## Fontes examinadas
Pacote original `simulados-platform-next-cms-v1.4.0.zip`; paths abaixo relativos ao ZIP.

| Consumidor | Dependência identificada | Impacto de bloquear RPC |
|---|---|---|
| `src/app/(study)/simulados/actions.ts` | chama `evaluate_question_set` via supabase.rpc antes de persistir tentativa de usuário autenticado | **BREAKING**: correção do simulado deixa de funcionar |
| `supabase/migration_sources/0038_api_assessment_runtime.sql` | `evaluate_question_set` chama `evaluate_question` | requer revisão de privilégios/contratos e da exposição do resultado |
| `supabase/migration_sources/0039_api_learning_runtime.sql` | registra tentativa chamando `evaluate_question`, retorna resultado | pode divulgar gabarito pela própria RPC pública mesmo após revogar a anterior |
| `supabase/migration_sources/0043_guest_sync_runtime.sql` | sincroniza tentativa usando `evaluate_question` | preservar contabilização, impedir retorno prematuro |
| `supabase/tests/database/004_question_security.test.sql` | teste do contrato anterior | precisa ser atualizado |
| `supabase/tests/database/011_assessment_runtime_contract.test.sql` | valida o retorno anterior | precisa ser atualizado |

## Achado
Bloquear somente acesso direto às tabelas de gabarito NÃO basta. As RPCs `evaluate_question` e `evaluate_question_set` retornam informação de correção por `SECURITY DEFINER`; a RPC de tentativa pode dar vazamento adicional, dependendo de como expõe v_result.

## Ordem de remediação proposta
1. Contrato de ciclo da tentativa: criada → em_andamento → enviada → concluída; limite, ownership e idempotência.
2. Correção privada feita no servidor, resultado público antes de conclusão limitado por política — **nem boolean de correção como oráculo ilimitado**.
3. Resposta explicativa/gabarito apenas para tentativa concluída e autorizada; modo estudo opcional com política separada e explícita.
4. Trocar chamadas de `evaluate_question_set` no action server, reconciliar `record_question_attempt` e `guest_sync`.
5. Rever `SECURITY DEFINER`, search_path e GRANT de **todas** as RPCs de correção e de tentativa.
6. Rodar testes anon / authenticated / owner / editor com tentativas antes e depois do fechamento, inclusive chamadas diretas às RPCs.
7. Somente então adicionar migration aprovada ao pipeline original e habilitar CI. Não aplicar `0003_rpc_grade_gate_HOLD.sql` isoladamente.

## Estado dos testes
Inventário de consumidores: **PASS_STATIC**. Ambiente PostgreSQL original: **NOT_RUN**. Proteção em runtime: **NOT_VERIFIED**. Kernel: **HOLD**.

A migration 0003 é um *candidate break-glass design*, não uma alteração deployável isoladamente. Nenhum Supabase remoto foi alterado.
