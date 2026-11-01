# Pesquisa + Participação — modelo Supabase candidato (2026-11-01)

**Estado:** `MODELLED_NOT_APPLIED / HOLD_KERNEL`. **Não é uma migração executada nem uma homologação.**

Revisão técnica sobre `Calculadoras-Smart` (Supabase, São Paulo; Postgres 17.6). O projeto ativo já possui CKO Master, Evidence, Governance, Risk, Validation e Regulatory; não foram localizadas tabelas específicas chamadas `research_*` ou `participation_*` durante leitura dirigida ao catálogo. A consulta direcionada a `cko_governance.change_requests` não retornou admissão de WO de pesquisa. A WO candidata no GitHub permanece `HOLD_HUMAN / NOT_SUBMITTED`.

## Escopo do banco preparado (arquivo SQL integral entregável separadamente)
- Schema privado proposto: `ce_research_candidate`, **70 tabelas**, **61 índices**, relacionamentos internos e RLS habilitado em cada tabela.
- 30/30 capacidades principais e 6/6 experiências participativas com tabelas associadas; 9 contratos JSON reconciliados.
- Sem grants para `anon`, `authenticated` ou `service_role`; nenhuma policy permissiva. Não habilitar API, participante ou coleta pública.
- Não duplicar os registros canônicos existentes: usar referências para `cko_master`, `cko_evidence`, `cko_governance`, `cko_validation`, `cko_risk`.
- Seeds somente das 30 capacidades e seis experiências; sem pesquisa real, PHI/PII ou publicação.
- 15/15 testes estáticos aprovados. **Não executados contra PostgreSQL real.**

## Transferência pendente
SQL completo `research_hub_private_schema.sql`: SHA256 `4a4cb6190e5737a2a04cf64bf3bc6719760a8f93ae78983bd28aea3fe751c28e`. ZIP de 12 arquivos entregue na conversa: `CKO_RESEARCH_HUB_SUPABASE_CANDIDATE_20261101.zip`, SHA256 `912522fbd2c25063eb1cf9c447421025a777a01126762c0e0918420644cdca7e`. **Esses bytes ainda NÃO estão arquivados nesta branch GitHub**, portanto a documentação não deve ser confundida com backup integral do SQL.

## Condições antes da implantação
1. Admissão verificável pelo Kernel/PMO com escopo e autorização do ambiente; [Issue #23](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/23) é uma solicitação, não a aprovação.
2. Projeto Supabase **candidato independente**, distinto de Calculadoras-Smart produtivo; custo e organização precisam ser definidos.
3. Criação de migração pelo CLI oficial para evitar o conflito da antiga migração candidata `0004`.
4. Aplicar SQL e testar em banco isolado após autorização: contagem das 70 tabelas, 61 índices, RLS, roles, 30+6 registros, FKs e testes adversariais.
5. Desenvolver Auth/RBAC, RLS restritivo, moderação, anti-abuso, DPIA/RIPD quando aplicável, regras éticas e integração frontend. Sem homologar pela mera existência de tabelas.

**Cobertura de modelagem de dados não equivale a implementação de 36 ferramentas.** As pendências funcionais e regulatórias continuam abertas.