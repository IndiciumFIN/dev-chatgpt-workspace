# Relatório de teste vertical — DB-first CKO / Apgar × Fugulin
**Data de execução:** 2026-10-26  
**Projeto consultado:** Supabase `Calculadoras-Smart` (`pgsybzggewhinaniybiy`)  
**Ramo de documentação:** `work/editorial-canonical-learning-20261026`  
**Natureza:** diagnóstico técnico *live read-only* + inspeção estática do frontend + verificações offline do snapshot  
**Decisão:** **HOLD_INCOMPLETE_GRAPH** para as duas ferramentas; não comprova nem autoriza cálculo clínico ou publicação.

## Atualização executada na segunda rodada — 26/10/2026

**A ligação dos seis evidence_refs de Apgar foi encontrada.** A primeira consulta verificava somente as chaves de `cko_evidence.sources/fragments/snapshots` e não resolvia a convenção `NDE-APGAR-AAP-ACOG-2015-CAND:REG-...`. Nova consulta `docs/audits/sql/CKO_APGAR_REQUIREMENT_BRIDGE_20261026.sql` percorreu `cko_governance.normative_document_extractions.extracted_requirements.requirements[]` e obteve **6/6 referências localizadas**. **Todas as seis** continuam associadas à extração `CANDIDATE_UNCHECKED`, requisitos `CANDIDATE`, sem checker, e claims sem revisão clínica. Corrigir a inferência de "sem referências no banco": havia linkage recuperável, mas ainda não homologado. Veja `FIND-CKO-DB-FIRST-EVIDENCE-20261026` atualizado.

**Teste puramente matemático, no próprio Supabase:** `docs/audits/sql/CKO_APGAR_SYNTHETIC_ENUM_REPLAY_20261026.sql` percorreu os cinco campos pontuáveis candidatos, todos com enum `[0,1,2]`, e avaliou **243 combinações sintéticas** (3⁵); menor soma 0, maior 10, onze somas distintas, todas no intervalo. É apenas conferência aritmética de estrutura candidata, não teste clínico nem substituição de motor governado. `cko_governance.b6_clinical_train_v1_candidate.object_engine_ref` e `rule_pack_ref` continuam NULL. Em Fugulin, a consulta revelou 10 campos candidatos, **nenhum** com domínio enumerado de pontuação.

**Reaproveitamento de histórico:** `cko_governance.object_versions.OV-APGAR-SUCCESSOR-0.2.0` registra `engine_test="1215/1215 PASS"`, `runtime_local="PASS"`, mas `release_authority=false`, `production_http_proof=false` e estado `CANDIDATE_AUDIT_PASS_WITH_SCOPED_HOLDS`. Esses valores são evidências declaradas do pacote anterior e requerem reexecução/verificação independente — não atribuir a elas execução na rodada atual.

**Novos ativos verificáveis:** `audit-evidence/cko/db-first/20261026/apgar-requirement-bridge-replay.json`, `apgar-field-domains-from-db.json` e `scripts/cko-db-first-replay.test.mjs` (suíte versionada; sem execução de CI comprovada). Todas as conclusões de bloqueio abaixo permanecem válidas. 

## 1. Hipótese testada
> Um único objeto canônico de ferramenta, nascido e governado no Supabase, deve resolver versão de escala, fontes primárias, claims, norma/contexto, campos/critério, regra de pontuação, cálculo determinístico, casos de teste e projeção editorial. O frontend não pode promover um conteúdo clínico independentemente do Kernel.

Foi executada a consulta `docs/audits/sql/CKO_VERTICAL_SLICE_APGAR_FUGULIN_20261026.sql` e gravado seu resultado bruto reduzido a campos diagnósticos em `audit-evidence/cko/db-first/20261026/apgar-fugulin-live-readback.json`. O teste não modificou linhas, schema, permissões, controles do Kernel nem estado de publicação.

### Estado do pipeline por ferramenta
| Etapa/elo | Apgar | Fugulin | Consequência |
|---|---|---|---|
| Identidade em `cko_master.entities` | `CONTROLLED_CANDIDATE`; `source_of_truth=false` | Idem | Identidade localizada; ainda não promovida |
| Versão em `cko_governance.object_versions` | 1 versão candidata encontrada | 1 versão candidata encontrada | Identidade da versão não equivale a algoritmo validado |
| Dossiê em `cko_closure.tool_dossiers` | `HOLD` | `HOLD` | Release formalmente bloqueado |
| Campos `md_tool_field_contract_v2_candidate` | 9 registrados | 10 registrados | Não estabelece por si só a completude da escala |
| Claims `cko_evidence.claims` por `subject_ref` | 3, todos `CANDIDATE`, revisão requerida | 0 pelo ID exato | Claims clínicos não homologados; possível material fora dessas chaves |
| Evidências diretamente resolvíveis | 6 refs sem correspondência **direta** em `sources` / `fragments` / `snapshots`; **6/6 recuperadas** via `normative_document_extractions.requirements[]` na atualização | Não aplicável à seleção: nenhum claim direto | Resolver lineage/identificadores antes de prosseguir |
| Normativos por campo | 25 overlays ativos | 63 overlays ativos | Apenas contexto aplicável; não validar pontos/fórmulas por inferência |
| Ligações master da ferramenta (`relationships`) | 0 por ID exato | 0 por ID exato | Não há grafo de relações diretas provado nesta consulta |
| Motor específico B6 | `object_engine_ref=null` | `object_engine_ref=null` | Motor objeto não materializado nesta camada |
| Rule pack específico B6 | `rule_pack_ref=null` | `rule_pack_ref=null` | Regras de pontuação não materializadas nesta camada |
| Validador específico B6 | HOLD, não materializado | HOLD, não materializado | Validador genérico não basta |
| Catálogo/runs de teste via busca por slug | 0/0 | 0/0 | Descoberta limitada a ID/nome; pode haver testes indiretos |
| Runtime/deploy B6 | HOLD | HOLD | Nenhum E2E DB→engine→UI demonstrado |
| Direitos/revisão clínica | Pendentes | Pendentes | Publicação bloqueada |

**Importante:** o banco possui `45` testes catalogados e `254` registros globais de execução em `cko_validation`. O zero na tabela acima significa *nenhum vínculo encontrado por nome/slug neste recorte*, não ausência de testes em toda a plataforma. Do mesmo modo, há `7.558` relacionamentos master globais; zero em `relationships` é estritamente para os IDs diretos escolhidos.

## 2. O elo real de execução no frontend foi inspecionado
O fluxo encontrado no repositório de backup público é:

`src/lib/tools/catalog.ts` (catálogo TypeScript)
→ `src/components/tools/clinical-tool.tsx` (`calculate`)
→ `src/lib/tools/engine.ts` (`evaluateScale` ou `evaluateFormula`)
→ `src/lib/tools/formulas.ts` (fórmulas locais para `gotejamento` e `imc`).

- O cálculo de escalas soma os valores de opções do próprio `ClinicalTool` recebido, não consulta comprovadamente a versão governada no Supabase.
- `catalog.ts` contém Apgar com `status="EVIDENCE_BOUND"` e `publicacao="publicada"`; entretanto o banco reporta `publication_state=HOLD`, `canonical_promotion=false`, `source_of_truth=false`. **Esta é uma contradição documental/runtime potencial; não foi executado browser nem verificada a versão atualmente implantada.**
- `catalog.ts` **não inclui Fugulin no array `tools`** verificado no commit-base; o guia editorial de Fugulin e o dossiê canônico são outros artefatos.
- O arquivo `src/lib/tools/governance.ts` inclui uma ficha de fonte Apgar 1953 com `HASH_ZERO` e `snapshot_ref="PENDING_SNAPSHOT"`; a classificação textual `SOURCE_QUALIFIED` nessa ficha não deve servir como comprovação de integridade física ou licença.
- `cko_governance.b6_clinical_train_v1_candidate` já registra `HOLD_OBJECT_ENGINE_NOT_MATERIALIZED`, `HOLD_SCORING_RULE_PACK_NOT_MATERIALIZED`, `HOLD_FORMAL_CLINICAL_HOMOLOGATION` para ambos.

**Conclusão operacional:** o frontend pode executar um algoritmo estático, mas o teste não verificou um caminho em que a definição de score seja resolvida do banco, imutabilizada e entregue ao motor sob o gate clínico. Não se deve conectar a fonte CKO candidata ao site como forma de contornar o HOLD.

## 3. Integridade relacional ≠ campos com IDs textuais
No Supabase, `cko_master.relationships.source_id/target_id` usam foreign keys para `cko_master.entities`. Também existem FKs para versões/artefatos em `cko_governance.artifact_normative_bindings` e para `cko_validation.test_runs.test_id`. Isso comprova partes do controle relacional.

Entretanto:
- `cko_evidence.claims` possui chave primária mas **não foi identificada FK** para `subject_ref` ou para os identificadores guardados em `evidence_refs` (JSONB). Seis referências diretas de Apgar não foram resolvidas nas três tabelas CKO testadas.
- `cko_governance.md_tool_field_contract_v2_candidate.tool_slug` e `b6_clinical_train_v1_candidate.canonical_object_id` não exibiram FK de relacionamento com `cko_closure.tool_dossiers`/`cko_master.entities` no inventário de constraints inspecionado.
- `PASS_REG_CONTEXT`, `PASS_EVIDENCE_CONTEXT` e `PASS_FIELD_BINDING_PRESENT` são **estados declarados daquela etapa**, não testes de integridade ponta a ponta de cálculo.
- Não acrescentar FKs a posteriori sem avaliar contratos existentes, registros órfãos, impacto histórico, migração, testes e Kernel.

## 4. Testes efetivamente executados e limites

**Executados:**
1. SQL read-only diretamente no Supabase: Apgar/Fugulin; flags retornadas `HOLD_INCOMPLETE_GRAPH`.
2. SQL para vínculos e constraints físicas das tabelas; distinção de linkage por FK, JSONB ou ID textual.
3. SQL de reconciliação de evidence_refs: seis referências de Apgar sem match direto CKO; dois objetos B6 em HOLD.
4. Leitura do frontend com identificação das funções que executam soma/expressão e da ausência de vínculo DB canônico demonstrado.
5. **8 verificações de consistência e negativos** em JavaScript sobre o snapshot real extraído; **8/8 PASS de bloqueio esperado** (não aprovação clínica). Resultado: `audit-evidence/cko/db-first/20261026/offline-integrity-checks.json`.

**Preparado no branch, não executado na CI nesta etapa:** `scripts/cko-db-first-evidence.test.mjs` com suíte `node:test` para revisão automática do snapshot. Não existia workflow run da branch no instante consultado. O sucesso das verificações locais de dados não deve ser rotulado de `E2E PASS`.

**Não realizados:** alteração/migração no Supabase, importação de fontes ou regras, execução de pontuação Apgar/Fugulin com fonte governada, validação numérica dos pontos, browser E2E, aprovação clínica, nova publicação, promoção Kernel, integrações em produção, manipulação de dados pessoais.

## 5. Achados candidatos (sem admissão)
| Candidato | Foco | Política de contenção |
|---|---|---|
| `FIND-CKO-DB-FIRST-RUNTIME-20261026` | Catálogo estático/atributo `publicada` desconectado da autoridade CKO e Fugulin fora do runtime inspecionado | Não promover frontend a fonte clínica nem publicar por flag local |
| `FIND-CKO-DB-FIRST-RULE-20261026` | Motor, rule pack, validador e testes de escala não materializados na trilha B6 | Não derivar score clínico de metadados/capa/overlays |
| `FIND-CKO-DB-FIRST-EVIDENCE-20261026` | Referências claims Apgar não resolvidas diretamente e lacunas de claims/critério Fugulin | HOLD até reconciliar fontes com direitos e comprovação |

As três peças são objetos candidatos no formato `contracts/cko-schemas/find.schema.json`, em `registers/governance/candidates`. **Não foram adicionadas à fila PMO de produção, não têm WO formal e não foram admitidas no Kernel.** Relacionar com `FIND-CTR-013` já existente (auditoria de contrato clínico só por slug) para não reabrir problema equivalente.

## 6. Próximo teste isolado: implantação DB-first governada
**Fase A — Fonte e master (read-only agora):** localizar snapshots duráveis e seus hashes, licenças, vínculo canônico com edição/versão/variante, revisão dos claims e cadeia até cláusula ou trecho específico. Para Fugulin, representar separadamente as versões de 9 e 12 áreas (não misturar tabelas de pontos).

**Fase B — Modelagem, sem duplicar contratos:** avaliar preenchimento de `formula.schema.json`, `clinical_rule.schema.json`, `interpretation.schema.json`, `tool.schema.json`, `runtime_test.schema.json` e `source.schema.json` mediante os registros existentes. Se a persistência do AST e vetores de teste não tiver estrutura adequada, abrir FIND de SCHEMA_GAP e especificar migração sem executá-la.

**Fase C — Admissão e transação (depende Kernel):** política aplicável, validador de fonte/autoridade/precisão/versão, WO, registro no PMO e autorização de escrita; somente depois materializar versão e vínculos em banco por migração controlada (idealmente staging), mantendo as candidatas legadas intactas.

**Fase D — Teste de execução real:** consultar versões imutáveis no DB; resolver os campos/critério; executar motor determinístico tipado sem eval nem código arbitrário armazenado; confrontar casos-ouro aprovados, valores inválidos, bordas, troca de variante, tradução e assinaturas. Gerar relatório `DB source → rule version → input → computed result → trace of evidence/claim → display`. Exigir resultado clínico independente e revisão do especialista.

**Fase E — Renderer e release:** conectar cada projeção a versões resolvidas, inclusive guia com capa já existente; SEO/i18n sem duplicação de fatos; gate de direitos, evidências, acessibilidade, fidelidade e segurança; Kernel/homologação humana; somente então publicar.

## 7. Decisão de controle
A arquitetura DB-first está **formalizada como proposta**, o diagnóstico live está **executado**, mas o grafo de pontuação está **HOLD**. Esta evidência **não** justifica alterar o `main`, elevar `source_of_truth`, conectar o website ao Supabase, excluir o catálogo legado, refatorar sem casos-ouro, declarar `PASS` clínico ou subir versões novas.
