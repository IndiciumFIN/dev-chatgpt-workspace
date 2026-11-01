# RECIBO — exceção pontual para domínio candidato Research Hub

**Data:** 2026-11-01 · **Projeto real:** Calculadoras-Smart (Supabase `pgsybzggewhinaniybiy`) · **Execução:** concluída em duas migrações.

**Base de autorização:** instrução explícita do proprietário nesta conversa: “pode burlar neste caso”. Exceção técnica delimitada a DDL aditiva em um novo schema privado. **NÃO é aprovação, admissão ou assinatura do Kernel.** O estado de governança continua `EMERGENCY_LOCKDOWN` com `WO-RES-PART-001=HOLD_HUMAN / NOT_SUBMITTED` no fluxo da pesquisa.

## Migrações aplicadas com sucesso
| Nome de migração | Versão do histórico | Git blob fonte |
|---|---|---|
| `research_hub_private_delta_owner_exception_20261101` | `20261101220232` | `9ea92307307d5c4857dd4874e1a2c2f80f52bb6b` |
| `research_hub_candidate_missing_fk_indexes_20261101` | `20261101220413` | `bf490bcb6f76145590a8d6e8909668f8134174e3` |

O SQL original de 70 novas tabelas **não foi aplicado**: 3 reutilizações primárias, 26 adaptadores, 18 revisões de equivalência e 23 estruturas de domínio novas. A pesquisa existente no `ce_platform` e CKO global foram preservados.

## Readback pós-migração confirmado via SQL do Supabase
- Schema novo `ce_research_candidate`: **23 tabelas**, **54 índices** (inclui 23 PKs, 1 unique, 30 índices adicionais).
- **23/23** tabelas com `ENABLE RLS` e `FORCE RLS`; **0 grants** `anon`, `authenticated`, `service_role` ou `PUBLIC`; schema USAGE falso para esses roles.
- **30 FKs**, sendo **23** para relações em `ce_platform` (além de referências internas e uma de `cko_risk`).
- **23/23 tabelas vazias**, sem seeds nem dados pessoais reais.
- Todas as tabelas existentes `ce_platform.research_projects`, `research_instruments`, `research_participation` permanecem com zero registros; `ce_platform.capabilities` permanece com 201 registros.
- `cko_governance.change_control_state.mode=EMERGENCY_LOCKDOWN` e `baseline_promotion_guard=true`; trigger de emergência não foi desativado.

## Advisories (não confundidos com bugs de exposição)
- Supabase Security `rls_enabled_no_policy`: 23 avisos **deliberados** — em um schema sem grants/policies, o acesso permanece negado. Criar policies somente após contrato de identidade, RBAC, finalidade LGPD e autorização.
- Performance `unindexed_foreign_keys`: quatro avisos da primeira análise foram **corrigidos** pela segunda migração. Permanecem 30 avisos `unused_index`, esperados antes da carga, avaliar após uso real.

## LIMITES DA EXCEÇÃO
- Nenhuma alteração de `main`, nenhuma mudança de código runtime/web, nenhuma promoção de objetos canônicos e nenhuma habilitação do Data API.
- Não liberar coleta real de pesquisas, participantes, PII ou PHI sem revisão de ética/LGPD, ameaças e consentimento.
- Não tratar 23 tabelas como 36 ferramentas entregues; o crosswalk das 47 não criadas continua HOLD para equivalência campo a campo e adaptadores.
- Não marcar WO como ADMITTED. Registro documental do proprietário não substitui auditoria independente.

## Reversibilidade
A migração é estritamente aditiva. Rollback só por procedimento autorizado, **com snapshot real do banco e validação de dependências/contagens**, limitando-se ao novo schema enquanto vazio; não existe rollback automático e nenhum DROP foi executado.
