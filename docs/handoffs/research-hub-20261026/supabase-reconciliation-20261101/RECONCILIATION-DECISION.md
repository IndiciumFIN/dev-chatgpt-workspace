# Research Hub — conciliação independente do Supabase Calculadoras-Smart

**Data:** 2026-11-01 · **Natureza:** READ_ONLY / CANDIDATE / SEM PROMOÇÃO · **Destino inspecionado:** `pgsybzggewhinaniybiy` (Calculadoras-Smart).

## FIND-P0: duplicação estrutural no SQL proposto
A análise anterior considerou 70 tabelas novas no schema `ce_research_candidate`, mas a inspeção do PostgreSQL 17.6 comprovou que **`ce_platform` já contém 96 tabelas**, incluindo `research_projects`, `research_methods`, `research_instruments`, `research_artifacts`, `research_participation` (5 relações com 0 registros atualmente). Cada relação específica possui suas chaves/constraints de identidade. Recriar no schema proposto originaria segunda raiz de projetos/instrumentos, uma duplicação inaceitável.

Outros elementos existentes: `ce_platform.capabilities` (201 registros), `ce_platform.canonical_objects` (271), `cko_master` (6 tabelas), `cko_evidence` (7), `cko_governance` (88), `ce_platform` (96). Não duplicar catalogação, Master Data, evidências, riscos ou decisões.

## Estado de controle verificado no banco
`cko_governance.change_control_state.mode = EMERGENCY_LOCKDOWN` · `destructive_writes_blocked=true` · `require_backup_ref=true` · `require_rollback_plan=true` · `baseline_promotion_guard=true`, incidente `SEV1-DATA-INTEGRITY-20260822`. Trigger `cko_emergency_ddl_guard_end` está habilitado. WO do Research `HOLD_HUMAN / NOT_SUBMITTED`. **Não foi executada qualquer DDL, DML, promoção ou alteração do status de controle.**

## Matriz para as 70 tabelas anteriormente propostas
- **3**: REUSE_PRIMARY_NO_NEW_TABLE
- **26**: ADAPTER_BEFORE_ADDING — aproveitar serviços/contratos existentes e analisar extensão antes de nova tabela
- **18**: REVIEW_SEMANTICS_NO_DDL — semelhança não significa equivalência; analisar campos e chaves
- **23**: NEW_DOMAIN_CANDIDATE_UNAPPROVED — potencial persistência específica, ainda sem homologação e sem decisão de DDL

Cada uma das 70 linhas consta em `CROSSWALK-70.json` com `ddl_authorized=false` e `promotion_authorized=false`. As **30 capacidades + 6 experiências** permanecem cobertas em nível de desenho pelo pacote anterior, não implantadas/homologadas.

## Reparação proposta sem duplicidade
1. Bloquear a aplicação indiscriminada de `research_hub_private_schema.sql` (SHA-256 `4a4cb6190e5737a2a04cf64bf3bc6719760a8f93ae78983bd28aea3fe751c28e`).
2. Reutilizar `ce_platform.canonical_objects` e as cinco relações de pesquisa como raiz; vincular via `cko_master` com contratos/linhagem, sem criar novos IDs canônicos pela interface.
3. Reutilizar `ce_platform.collections`, `saved_searches`, `consent_records`, `forms`, `output_requests`, `content_variants`, `community_*` **somente após compatibilidade campo-a-campo**; alguns fluxos de participação exigem modelo diferente dos perfis de equipe.
4. Preservar CKO Evidence/Risk/Governance como authoritative. Não criar `canonical_bindings`, `capability_catalog`, `research_audit_receipts` ou `research_risks` duplicados sem crosswalk aprovado.
5. Após WO admitida pelo serviço do Kernel, construir **migration delta-only** para os objetos de domínio ainda comprovadamente ausentes, com provas de RBAC/RLS, backup, rollback, CI e revisão ética/LGPD.
6. Manter Issue #23 e PR #19 em HOLD/Draft; GitHub backup é documentação de candidata, não acesso autorizado ao banco.

**Resultado desta atividade:** conciliação estrutural 70/70; modelo anterior REVISTO / NOT_SAFE_TO_APPLY_AS_IS; 0 alterações no Supabase; 0 capacidades promovidas. O status de correspondência é triagem técnica, não validação contratual definitiva.
