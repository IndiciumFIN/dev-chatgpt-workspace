# SPE — Status de transferência e inventário consolidado

Branch: `simulados-enfermagem-db-canonico`. A branch é derivada de `main`, não é release homologada.

## No GitHub
Código/contratos da W01–W11, W02 source lineage, W03 validador e testes, inventário parcial W04, decisões W05–W08, schema e adaptador W09/W10, checker W11 e workflow estático. Verificar diferenças com `main` para arquivo a arquivo.

## Fora da branch, conservados separadamente
- Fonte histórica original `simulados-platform-next-cms-v1.4.0.zip`, Drive file `1O2drLtDpNoSl5Lk-GeOPRdaKzpsOJ2i9` — não copiar íntegro sobre o workspace independente.
- Legado `simulados-para-enfermagem.zip`, Drive file `1ZBMcoqG-y_C3ls1Sbptz09Rdx15oJIpO`.
- W05 crosswalk completo `SPE_DB_CROSSWALK_v0.4.0.json` (local, não transferido), com nomes e fingerprints dos 47 SQLs/17 testes; o registro de decisão resumida já está no GitHub.

## Segurança, autorização e publicação
PR deve permanecer DRAFT. `main` e Supabase de produção intactos. W01/W02/0003 SQL em HOLD e não devem ser aplicados automaticamente. Testes unitários e inventário estático não comprovam segurança real de RPCs nem integridade do banco.

Pendências detalhadas: `docs/simulados-enfermagem/PENDENCIAS_CONSOLIDADAS_v0.2.0.json`.
