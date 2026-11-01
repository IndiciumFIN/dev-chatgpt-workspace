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

## R9 — Confronto remoto somente leitura e diagnóstico dos portões (01/11/2026)

**Escopo e proteção:** referência da candidata `799d308fa0801a339d9842963cd824c6eb2c26d9` (PR #32, DRAFT/HOLD). A comparação usou a conexão Supabase para **SELECT de metadados**, sem DDL/DML, sem abertura de gate, sem deploy nem modificação da `main`.

### Ledger real do projeto Supabase `Calculadoras-Smart`

- Consulta `supabase_migrations.schema_migrations`: **240** registros; menor versão `20260816174704`; maior versão `20261011082439` (`curiosidades_pmo_gate_status_constraint_20261011`).
- Nenhum registro do ledger contém os identificadores numéricos curtos locais `0004`, `0005`, `0006`, `0007`, `0036`, `0037`, `0038`, `0041`, `0042`, `0043` como segmento delimitado do nome. Duas migrations remotas contêm a palavra genérica `canonical`: `b3_canonical_object_crosswalk_v1` e `xlf_align_canonical_statuses_v1_0_1`; **homonímia não constitui identidade de DDL**.
- `information_schema.tables`: **nenhuma tabela física** com prefixos `career_`, `canonical_`, `research_`, `participation_` ou nomes `blob_conflict`, `review_item`, `historia_nao_mesclada`, `kernel_coluna_citada`, `mudanca_producao` em schemas acessíveis à consulta. Isso abrange os 67 nomes pendentes no PGlite, sem demonstrar que o conteúdo não exista em outros objetos/modelos, nem que deva ser implantado.
- **Decisão:** NÃO mapear automaticamente `0004`→ledger remoto por prefixo, nome aproximado ou ordinal; NÃO executar as 60 migrations SQL na base remota. Exigir confronto DDL/colunas/FKs/RLS/contratos e manifesto de dependências com SHA, assinatura e aprovação identificável.

### Branches e PRs conferidas em GitHub

- Busca GitHub retornou **29 branches**, incluindo a candidata; feita comparação Git `canonical/local-20261101...<branch>` para as **28 outras**. Resultado: **21 divergentes**, **5 atrás sem commits exclusivos**, **2 sem ancestral comum** (`feat/projection-unica-f0-suite-real` e `grook_10_26`).
- Encontradas **12 PRs abertas**. O comparador GitHub limita a listagem de arquivos em certos diffs (por exemplo, `idioma/consolidado-19` retornou 300), logo essas comparações atuais de commits **NÃO são uma auditoria full-tree de blobs**. Reutilizar a evidência full-tree auditada de [Actions #41297971388](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/41297971388) e [auditoria federada #41299470363](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/41299470363) antes de qualquer escolha estrutural.

### CI encerrado: falhas observadas, não apenas pendências

- [OPA #41303129853](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/41303129853): **SUCCESS**. [Portões #41303129856](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/41303129856): **FAILURE**, no mesmo SHA.
- Passos reprovados: **Índice do banco** (67 lacunas deliberadamente bloqueantes), **Registro PMO** (10 duplicidades + reservas `0039/politicas` vs `0039_kernel_anchors.sql` e `0040/atomos` vs `0040_kernel_candidate_local.sql`), **Suíte** e **Tipos**. Build e verificações OPA independentes concluíram com sucesso.
- Suíte: **818 testes** = **790 PASS**, **10 FAIL**, **18 SKIP**. Scripts: 549 = 526 PASS / 5 FAIL / 18 SKIP; src: 269 = 264 PASS / 5 FAIL.
- Entre as falhas: cobertura estrutural do dicionário; `scripts/governance-continuity.test.mjs` detecta ausência das exigências de **testes reais OPA e verificação de assinatura do bundle** na forma checada pelo contrato; três testes de metadados OG/PWA esperam título específico do documento, mas recebem título fixo; 1FN de `0004_research_participation_candidate.sql`; segunda aplicação de migrations falha em `work_order_admission_requests` (`42P07`); teste de acessibilidade do formulário procura label de busca; prova 2FN/3FN não cobre `career_projection_candidate`. Não relaxar testes nem equiparar expectativa desatualizada a bug sem exame do contrato.
- TypeScript reportou exatamente: `src/data/contracts/cko-editorial/renderer/web/universal_renderer.js:33` **TS2304** (`CEUniversalRendererAPI` fora do escopo do JSDoc) e `src/lib/source.functions.ts:96` **TS2367** (comparação com `true` após guarda que já rejeita `true`).
- **Próximas decisões controladas:** FIND/WO para correções por responsável, com validação de invariante OPA antes de tocar workflow; corrigir defeitos não controversos na candidata com testes; confrontar 10 grupos de migrations com conteúdo e ledger sem reescrever histórico; documentar 67 entidades a partir dos contratos e suas relações antes de preencher o dicionário.

**Gate final:** `HOLD_HUMAN / MERGE_NOT_RECOMMENDED_NOW`. Esta seção é evidência de reconciliação e diagnóstico, **não autorização técnica/clínica nem execução remota**.

## R11 — Reconciliação canônica de templates, contratos, schemas e arquivos históricos (01/11/2026)

**Escopo:** leitura recursiva das árvores Git de **29 branches** (29 refs, consultas sem truncamento), incluindo as duas árvores com histórico desconexo, e recuperação selecionada por **blob SHA Git exato**, sem reinterpretação de conteúdo. Base inicial da candidata: `44baab440211b0ec80b1105c757b9af02bee5eac` com **15.582 arquivos blob** (16.881 entradas incluindo árvores). A referência da main permanece `e9f7fe66075ebe5d7346072dc3a1b4934678c6de`.

### Reconciliação de identidade (não copiar conteúdos já presentes)
- **31 schemas de carreira** em `feat/career-youth-db-first-20261026` ausentes no caminho antigo `schemas/career-*.schema.json`, mas **31/31 hashes idênticos** na candidata, majoritariamente em `_archive/schemas/`. Classificação `ALIAS_IDENTICAL_BLOB/HOLD`; não duplicar nem ativar automaticamente.
- **9 schemas de pesquisa e participação** em `feat/research-participation-layer-20261026`: **9/9 hashes idênticos** em `_archive/schemas/`; mesma classificação.
- **i18n**: dos 1.092 arquivos sem caminho correspondente em `registers/i18n/incoming/` da branch `idioma/consolidado-19`, **1.091 hashes já existem** na candidata, sobretudo em `src/data/registers/i18n/incoming/` ou `registers/i18n/candidates/`. Os 60 arquivos antigos da origem `idioma/pt-PT-v1` também possuem equivalentes por blob SHA. Não confundir a existência de traduções `DRAFT` com aprovação, qualidade, SEO ou ativação de idioma.
- **865 arquivos `src/families` e cinco módulos `src/core/experience`** foram localizados sob `upload/ce-skeleton/ce-skeleton/`. Permanecem `CANDIDATE_HOLD`, fora do runtime; não são 410 serviços concluídos.
- A candidata já tem representações de templates em `src/components/templates/`, `src/lib/admin-form-template-registry.ts`, `contracts/cko-editorial/`, `contracts/cko-skeleton/catalog/profiles/` e seus registros; variações com mesmo caminho e SHA diferente em branches de origem **não foram sobrescritas**.

### Blobs de fato exclusivos fisicamente recuperados (somente evidência, sem ativação)
- **Seis JSONC originais** de `import/drive-cko-nurseos-20261026`, sob `imports/drive-snapshots/2026-10-26/nurseos-kernel/Workflows-NK-Guard/`: `DictionaryTerm`, `ExtractionRun`, `NormAtom`, `NormDocument`, `NormSource`, `ServiceOrder`. Todos parseáveis como JSON na versão inspecionada, chamam `normKernelIntake` como contrato histórico, **não possuem integração operacional ou aprovação inferida**. Preservação via blob Git original; nenhuma execução, agendamento ou ativação Base44.
- **`registers/i18n/incoming/sugestoes.json`** original, SHA `da8f97a25572a80ff908687128a35b2a638e3cdd`, registra `aprovado:false`, `REVIEW_REQUIRED` e `DRAFT`; preservar como candidato e não interpretar o número de itens como aprovados.

### Contratos exclusivos mantidos em fonte de origem, sob HOLD, sem import runtime
- `feat/projection-unica-f0-suite-real@6d712dd47029286869f909a2014f42083f5db2a9` possui os blobs independentes `src/components/admin/registry.tsx`, `src/core/registry/source-registry.ts`, `src/core/registry/source-registry.test.ts`. O registro administrativo histórico importa `saveClinicalSheet`, contrato ausente na interface endurecida atual; o `SourceRegistry.admitir` altera diretamente status em memória, sem autoridade Kernel independente. **Não integrar esses arquivos diretamente**. Permanecem recuperáveis no SHA original, com decisão/WO pendente e reaproveitamento semântico controlado.
- O histórico `norm_kernel_v1.0.0_backup_2026-09-29.zip` da importação Drive permanece na branch-fonte e não foi expandido nem incorporado cegamente. Segredos e TARs brutos não entram na árvore ativa.

### Invariantes pós-recuperação
`CANDIDATE_HOLD` · `NO_MAIN_MERGE` · `NO_REMOTE_DB_WRITE` · `NO_DEPLOY` · `NO_AUTOMATIC_APPROVAL`. Essa seção registra proveniência e localização dos objetos, **não uma nova autoridade, dicionário ou catálogo paralelo**. Validação de CI, FIND/WO, admissão Kernel, revisão clínica e reconciliação dos blobs divergentes continuam obrigatórias.
