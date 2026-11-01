# P1 — Lacunas reais do dicionário e colisões de migrations (01/11/2026)

**Estado:** `HOLD_HUMAN`. **Origem verificada:** GitHub Actions [#41302195263](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/41302195263), SHA da candidata `d184d3f640ad07bf6e140e79ee6f350b3b6f3b7b`, artifact `ce-p1-foundation-reconciliation-evidence` (#13081178309), digest `sha256:056840ac2ff0b6c828223a90376de7b255a314a8859489c76efbd79f88c4f02d`. Arquivos originais no artifact: `db-indice.json`, `migration-collision-evidence.json`. Os dados são do banco **PGlite descartável**, não leitura de produção nem confirmação de Supabase.

## Contagens verificadas

- SQLs de migrations raiz: **60** arquivos; **48** números distintos; **10** números usados por mais de um arquivo.
- No PGlite criado com as migrations: **166** tabelas, **99** descritas em `schema_entity` e `src/lib/banco/indice.ts`; **67** sem metadados de dicionário. As 99 existentes têm label. O portão antigo classificava as 67 como achado sem reprovar. Foi corrigido para falhar fechado, sem inventar labels.
- Esta diferença é **cobertura de metadados**, não prova de tabela de produção ausente, nem autorização para acrescentar dicionário sintético.
- O migrador remoto `scripts/migrate.mjs` permanece explicitamente desabilitado: não usar esses arquivos para aplicação automática.

## Dez grupos reais de numeração duplicada

| Número | Arquivos SQL coexistentes |
|---|---|
| `0004` | `0004_career_youth_candidate.sql`, `0004_metamodel.sql`, `0004_research_participation_candidate.sql`, `0004_revisao_conteudo.sql` |
| `0005` | `0005_career_editorial_content_candidate.sql`, `0005_controls.sql` |
| `0006` | `0006_career_atomization_candidate.sql`, `0006_governance.sql` |
| `0007` | `0007_career_promotion_control_candidate.sql`, `0007_policies.sql` |
| `0036` | `0036_indice_do_banco.sql`, `0036_revisao_conteudo.sql` |
| `0037` | `0037_preencher_derby.sql`, `0037_revisao_idiomas.sql` |
| `0038` | `0038_canonical_divergence.sql`, `0038_processo_source.sql` |
| `0041` | `0041_canonical_suggestions.sql`, `0041_passa_de_aprovacao.sql` |
| `0042` | `0042_recuperar_fonte.sql`, `0042_suggestions_follow.sql` |
| `0043` | `0043_canonical_unreviewed.sql`, `0043_listas_viram_tabelas.sql` |

As duplicidades são de **nomeação/linhagem**; não eliminar, renomear ou executar por ordem numérica sem reconciliação do ledger remoto e da dependência de cada schema. O inventário completo do artifact contém SHA-256 de cada SQL e tabelas criadas.

## 67 tabelas sem dicionário, transcritas do artifact PGlite

- `blob_conflict`
- `canonical_asset`
- `canonical_auto_review`
- `canonical_conflict`
- `canonical_conflict_source`
- `canonical_divergence`
- `canonical_migration_gap`
- `canonical_migration_recovered`
- `canonical_suggestion`
- `career_application_candidate`
- `career_atomic_fact_candidate`
- `career_authority_binding_candidate`
- `career_capability_governance_candidate`
- `career_claim_candidate`
- `career_content_claim_binding_candidate`
- `career_credential_candidate`
- `career_document_template_candidate`
- `career_editorial_block_candidate`
- `career_editorial_candidate`
- `career_editorial_document_candidate`
- `career_evidence_bundle_candidate`
- `career_ingestion_run_candidate`
- `career_interview_scenario_candidate`
- `career_jurisdiction_requirement_candidate`
- `career_learning_resource_candidate`
- `career_learning_resource_type_candidate`
- `career_market_observation_candidate`
- `career_market_signal_candidate`
- `career_milestone_candidate`
- `career_module_candidate`
- `career_network_capability_candidate`
- `career_opportunity_candidate`
- `career_opportunity_type_candidate`
- `career_path_candidate`
- `career_path_step_candidate`
- `career_profile_candidate`
- `career_profile_credential_candidate`
- `career_profile_skill_candidate`
- `career_projection_candidate`
- `career_projection_contract_candidate`
- `career_projection_item_candidate`
- `career_publication_candidate`
- `career_reflection_question_candidate`
- `career_release_gate_candidate`
- `career_review_item_candidate`
- `career_role_candidate`
- `career_role_skill_candidate`
- `career_skill_candidate`
- `career_source_candidate`
- `career_source_fragment_candidate`
- `career_worklife_capability_candidate`
- `career_youth_activity_candidate`
- `historia_nao_mesclada`
- `kernel_coluna_citada`
- `mudanca_producao`
- `participation_consensus_vote_candidate`
- `participation_contribution_candidate`
- `participation_outcome_candidate`
- `participation_process_candidate`
- `participation_proposal_candidate`
- `participation_reaction_candidate`
- `participation_statement_candidate`
- `research_instrument_candidate`
- `research_project_candidate`
- `research_risk_candidate`
- `research_skill_need_candidate`
- `review_item`

## Encaminhamento canônico

1. Cruzar cada nome da lista com as migrations específicas, schema real e contratos de entidade já existentes; agrupar famílias (career, research/participation, canonical, review) **sem criar uma segunda fonte de verdade**.
2. Para cada tabela, mapear owner, nome de uso, finalidade, estrutura, relações, classificação LGPD, fonte e evidência. Proposta entra em FIND/WO e revisão antes de preencher `schema_entity`, `schema_column` e índice.
3. Resolver duplicidade de versão com ledger remoto verificado e migrações compensatórias **sem reescrever histórico aplicado**. Manter 10 grupos bloqueantes até isso.
4. Executar testes negativos e checks em PGlite isolado; testar PostgreSQL descartável e RBAC/RLS. Não fazer escrita Supabase, merge `main` ou deploy por este registro.

**Critério de aceite:** 0 colisões não reconciliadas em ledger auditável, 0 tabelas reais sem contrato e dicionário, governança OPA/Kernel e CI completo verde; hoje não atingido.
