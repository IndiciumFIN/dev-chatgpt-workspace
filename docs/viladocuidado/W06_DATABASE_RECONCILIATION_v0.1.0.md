# W06 — Reconciliação SQL/Supabase da Vila
Estado: STATIC_CHECKED / DATABASE_NOT_APPLIED / KERNEL_HOLD.

## Resultado observado
- SQL candidato v0.3.0: 22 tabelas, 26 referências de chave estrangeira, zero tabelas referenciadas ausentes. RLS/revogações declaradas (não verificadas em execução).
- Supabase Calculadoras-Smart (pgsybzggewhinaniybiy): `list_tables` para public, vila_candidate, vila_canonical_candidate não mostrou entidades nomeadas da Vila; 48 tabelas visíveis nos schemas consultados. Isso não prova ausência de todos os objetos ou equivalentes semânticos.
- Work Order original: HOLD_HUMAN / Kernel NOT_SUBMITTED. Não executar migration no Supabase compartilhado.

## FINDs de desenho antes do deploy
FIND-VILA-DB-01: `release_decisions` exige FK para revisões, mas não valida resultado PASS dessas revisões; fechamento precisa ser feito por trigger/transação controlada ou procedimento seguro com regras de negócio.
FIND-VILA-DB-02: `content_objects.version` e `slug UNIQUE` impedem múltiplas versões históricas do mesmo ID, contrariando requisito de lineage imutável — separar identidade do objeto e revisões, sem UPDATE destrutivo.
FIND-VILA-DB-03: armazenar Storage assets por ponteiro não garante hash nem direitos; requer verificador de artefatos.
FIND-VILA-DB-04: JSONB flexível exige schema/validator por mecânica e versão.
FIND-VILA-DB-05: RLS + REVOKE em SQL não é execução: faltam testes de privilégios e exposição API.
FIND-VILA-DB-06: payloads e missões de crianças devem continuar sem coleta identificável; preferir progressão local.

## Próximo gate
Corrigir esses FINDs na migration candidata ou camada de governança, homologar WO pelo Kernel e executar primeiro em staging autorizado. Nenhum PASS de runtime declarado.
