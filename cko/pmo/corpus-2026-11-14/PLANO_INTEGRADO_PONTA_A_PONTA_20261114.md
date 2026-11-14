# Plano integrado ponta a ponta — CKO / Calculadoras de Enfermagem

**Corte de evidências:** 14/11/2026
**Versão de planejamento:** v0.1.0 — PROPOSTA DE CONCILIAÇÃO (não plano institucional aprovado).
**Fonte atual de atividades:** `PMO_WBS.csv` (59 tarefas) e `PMO_REPORT.json`, na branch `cko/pmo-corpus-canonical-20261114`; **PMO oficial**: [CORPUS & KNOWLEDGE PMO](https://docs.google.com/spreadsheets/d/1vi129pgXWMZPFddxlMd5YemMEohumxqk714yCoGCVOg/edit).
**Divergência:** três matrizes de gates coexistem: PMO Mestre Drive `PMO_EXECUTION_GATES_G0_G9` (10 gates); conservação `R04_GATES_G0_G12_DRAFT` (13 gates); candidata Git `GATES.md` (11 gates, G0–G10). IDs G0/G1/etc **não são intercambiáveis sem crosswalk**. Esta proposta define **fases PP00–PP13 como eixos operacionais de integração**, não substitui qualquer gate existente.

## 1. Objetivo final e definição operacional de terminado

Construir cadeia canônica que parta sempre de **fontes primárias normativas oficiais quando aplicáveis**, recebendo também fontes científicas e editoriais com identidade e finalidade próprias, e entregue:
- corpus preservado e rastreável, incluindo texto restrito somente no acervo autorizado;
- grafo de conhecimento fonte → documento → passagem/átomo → afirmação → knowledge atom → recurso editorial, com relação explícita a currículo, especialidade, ferramenta e biblioteca;
- motor **idempotente e auditável** que detecta mudanças de fonte, atualiza candidatos de ontologia, metamodelos, dicionários, aliases e versões, mas **bloqueia mutações inconsistentes** até gate;
- conteúdo único canonizado, reutilizado contextualmente em todas as frentes de Enfermagem (Urgência e Emergência, Saúde do Trabalhador, Cardiologia, Centro Cirúrgico, CME, demais especialidades), sem contaminar contextos clínicos;
- publicação nos hubs permitidos: artigos, guias, cursos, casos, escalas e calculadoras, protocolos, checklists, simulados, quizzes, flashcards, mapas mentais, infográficos, podcasts, slides, vídeos e materiais de referência, conforme contrato existente e direitos;
- CI, segurança, LGPD, acessibilidade, internacionalização, SEO, rollback, observabilidade, revisão normativa e handoff.

**Terminado não equivale a todos os átomos aprovados:** cada fonte, documento, tópico e atividade precisa ter destino explicitamente registrado (aprovado, substituído, rejeitado ou `HOLD_HUMAN` com justificativa/dono). Liberações clínicas só existem onde direitos, evidência, revisão e publicação estão completos. Escopo de contabilidade/tributos está **fora do projeto CE**.

## 2. Estado inicial confirmado, sem inferir cobertura total

- Corpus M03 recuperado, 6 ZIPs íntegros, 2 bancos SQLite OK, Foundation v1.7.7 213/213 hashes internos; **118 fontes**, 326 autoridades, 124 documentos, 1.055 tópicos (170 Urgência, 885 Trabalho), 28.001 átomos textuais, 80.261 referências e 9.102 links **candidatos**.
- PMO Mestre (Drive) tem os cadastros `SOURCE_REGISTER`, `DOCUMENT_REGISTER`, `EVIDENCE_ATOMS`, `CLAIM_LEDGER`, `RIGHTS_REGISTER`, `CONFLICT_REGISTER`, `HOLD_HUMAN`, `CHANGE_IMPACT`; lote M05 com **58 linhas adicionadas**, contagens não equivalentes às do corpus inteiro.
- **Piloto legado encontrado:** o `PMO-011` no Drive identifica o Supabase `SOT-10-09-2026` (ref `hcqukuotfwflmebjygam`) como ambiente do Corpus Acquisition Engine. Consulta atual: projeto ACTIVE_HEALTHY, **10 tabelas públicas de corpus, todas com 0 linhas na listagem**, RLS habilitada e Edge Functions implantadas (`deepseek-atomize`, `dou-inlabs`, `corpus-connectivity` e outras). Os projetos `SOT-10-09-2026` e `Calculadoras-Smart` estão na **mesma organização Supabase**. Isso não prova a exigência histórica de uma nova organização isolada, nem que as funções tenham sido homologadas; confirmar ownership, escopo, segredos e autorização antes de qualquer reutilização.
- Supabase ativo `Calculadoras-Smart`, leitura: 157 `cko_evidence.sources`, 84 snapshots, 103 fragments, 41 claims, 187 documents, 2 rights_records, 339 findings, 61 source_lineage. Os namespaces não coincidem com os da Foundation; 118×157 = 0 source_id exatos; **5 pares de URL** encontrados, 3 candidatos do mesmo ato, 2 de escopo parcial. Nenhum alias aprovado, nenhum UPSERT executado.
- Currículo Cardiologia: **10 UCs e 300 horas**, 51 módulos e 295 tópicos detalhados na retificação; a UC 08 tem **8 eixos e nenhum módulo próprio desdobrado**. O indicador antigo 58 módulos/326 tópicos no B20 é de versão anterior e **deve ser corrigido no próximo registro de decisão controlada**.
- Três claims ECG candidatos/4 átomos; **zero aprovações clínicas**. BLS tem lacuna de atomização examinável e SCM inclui falso positivo (80 vínculos de documento de hipertensão); direitos individuais pendentes.
- GitHub: PR #36 da Foundation (draft, 13.550 arquivos), #66 editorial/claims, #67 PMO, #68 evidências/direitos (todos draft); `main` não alterada. GitHub Actions dos candidatos M04/M05 passaram em escopo estrutural; Vercel possui falha de quota de builds.
- As 59 atividades do PMO se distribuem em 10 concluídas em escopos técnicos/editoriais, 20 em progresso, 23 não iniciadas e 6 em HOLD/rascunho/aguardando fonte. Esse resultado **não é taxa de validação científica**.

## 3. Fluxo de objetos e decisão canônica

```text
REGRA OFICIAL / EVIDÊNCIA CIENTÍFICA / FONTE EDITORIAL
      ↓ identificar emissão, jurisdição, versão, direitos
SOURCE (autoridade emissora referenciada, sem confundir com a fonte)
      ↓ snapshot, documento original, URI/DOI, hash, proveniência
DOCUMENT → SOURCE_SPAN → EVIDENCE_ATOM / NORMATIVE_ATOM
      ↓ extrair proposição com contexto, fidelidade e confiança
CLAIM (candidate → peer-reviewed → approved | rejected | HOLD)
      ↓ composição com validade clínica e eventuais conflitos
KNOWLEDGE_ATOM (governado, versionado, testável)
      ├── TOPIC ↔ SPECIALTY ↔ CURRICULUM / UC / MODULE
      ├── TOOL / CALCULATOR (objetos próprios; não são CONTENT)
      ├── LIBRARY / ENTRY (objetos próprios)
      ↓ composição editorial do conhecimento aprovado
CONTENT_MASTER → PROJECTIONS (HTML, PDF, quiz, simulado, mídia, i18n)
      ↓ gates de direitos, segurança, QA, arquitetura e revisão clínica
RELEASE_CANDIDATE → PUBLICATION → MONITORING → CHANGE_IMPACT
```

Relações many-to-many sem copiar o átomo fonte; versões e traduções apontam à mesma identidade lógico-semântica com aplicabilidade explícita. Não reutilizar automaticamente entre saúde ocupacional, pronto-socorro e centro cirúrgico.

**Cadeia de mudança obrigatória:** `FIND → política aplicável → validador → TASK → WO → Kernel → testes/auditoria → promoção`. Cada etapa grava event_id, ator, timestamp, versão de origem/destino, decisão e evidência; mudança não admitida não altera original. Links calculados por embeddings/lexical/busca são **apenas candidatos**.

## 4. Plano por fase, responsável, entregável e prova

| Fase | Escopo operacional completo | Saída única e rastreável | Gate de aceite | WBS existente |
|---|---|---|---|---|
| **PP00 — Escopo, portfólio e decisões** | Confirmar CE e fronteiras com apps satélites; registrar ownership, bases, branches e decisão da infraestrutura isolada vs compartilhada; reconciliar matrizes de gates e versões curriculares | charter/ADRs, decisão de ambiente, matriz de gates equivalentes e release map | Toda divergência tem dono e decisão ou HOLD, sem ambiente novo provisionado implicitamente | B01–B03, B07, B13–B16, B20–B23 |
| **PP01 — Inventário exaustivo** | Enumerar recursivamente TODOS os folders/subfolders do Drive primário e secundário, Library, GitHub branches/PRs, Supabase schemas/registries e anexos; contabilizar arquivos não acessíveis/truncamentos | `FILE_SOURCE_REGISTER`, folder closure, snapshot, owners, access ledger | Todos os objetos no escopo inventariados ou HOLD individual com localização/causa; sem alegar 100% a partir de amostra | B01, B02, B08, B09, B10, B13, B14 |
| **PP02 — Preservação, extração bruta e hash** | Manter originais intactos; validar ZIP slip/decompression, CRC e SHA; extrair texto e tabelas com página/linha/célula, codificação e revisão visual, preservar PDFs e metadados em acervo controlado | manifestos, `DocumentSnapshot`, `ExtractionRun`, `SourceSpan`, checksum/versão | Reexecução determinística, zero perda silenciosa; cada falha permanece em registry HOLD | B04–B06, B10, B12 |
| **PP03 — Identidade, direitos, vigência e universo** | Separar authority, source, document, platform; validar URLs/DOIs/PMIDs/PMCID; conciliar 15 Sheets/118 SQLite/157 Supabase; definir aliases sem fusão física; mapear direitos por operação, jurisdição e validade | registries oficiais completados, crosswalk ID, authority ledger, rights per action | `source_id`, tipo, título, URL, versão, licença e status explícitos, ou HOLD. Alias só com prova documental | B09–B12, B18, B25–B28, B58, B59 |
| **PP04 — Trilha de carreira e ontologia** | Consolidar tópicos, especialidades, UCs, objetivos de aprendizagem, ferramentas e bibliotecas existentes; incluir Urgência, Trabalho, Cardiologia, Centro Cirúrgico e CME; resolver colisão UC08/07/09 | grafo de IDs, alias/synonym/supersedes, matriz de Trilha de carreira com ementas-fonte preservadas | Sem equivalência presumida; UC conflitante só se resolve com origem institucional; FKs válidas | B17–B24, B35 |
| **PP05 — Aquisição governada de fontes** | Fontes oficiais BR por prioridade (COFEN, MS/CONITEC/SNT, Anvisa, MTE, DOU etc.) e sociedades científicas/estudos; adapters de APIs oficiais, metadata-only quando necessário; dedup/retrações; rotinas de atualização | `SourceAdapterRegistry`, `AcquisitionRun`, `DocumentSnapshot`, logs e direitos por documento | Download autorizado e completo quando permitido; URL, versão, hash, erro e política; sem texto proibido no Git público | B25–B28; ampliação proposta |
| **PP06 — Atomização e validação das provas** | Parsers tipados PDF/HTML/CSV, tabelas e passagens; normas identificadas pelo artigo/seção; proposições com localização, população, vigência e jurisdição; modelos de IA apenas sugerem, jamais são fonte | `NormativeAtom`, `EvidenceAtom`, `ClaimCandidate`, `ClaimEvidenceLink` | 100% das claims promovidas têm trecho/hash/página/versão/direitos verificáveis; sem citação inventada | B29–B34, B57 |
| **PP07 — Engenharia do conhecimento e metamodelos** | Versionar classes, relações, dicionários e terminologias, atualizar candidatos por mudança de fonte, validar graph links, chaves, tipos, cardinalidades, aliases, supersedes, bidirecionalidade, cross-table constraints, normativo vs editorial | `CKO Schema Registry`, dicionários/ontologia versionados, validation report, proposta de migração e changelog de impacto | `schema diff` testado; nenhum objeto órfão, relação impossível, semântica contraditória ou migração automática sem admission | B17–B19, B41–B45; ampliação proposta |
| **PP08 — Revisão científica e editorial independente** | Revalidar 29 claims e 29 knowledge atoms legados, avaliar 9.102 links candidatos; revisar AHA/ERC, dados ECG/SCM e normas vigentes; distinguir opinião editorial e conduta sustentada; humano aprova clínica e direitos | claim ledger, review decision, conflict/human HOLD, knowledge atom admitido | Sem `CLAIM_APPROVED` sem evidência primária vigente + revisor independente; falso positivo SCM bloqueado | B19, B28–B34, B47 |
| **PP09 — Content Factory canônica** | Identificar conteúdo de base única e adaptar para público e especialidade; compor article, case, quiz, flashcard, infographics, slides, podcasts, video scripts, checklists, cursos, provas, protocolos, calculadoras com contratos existentes | `ContentMaster`, projection request, references e release metadata por formato/idioma | Só renderizar claims aprovados e conteúdo próprio/permitido; links e citações funcionam; templates existentes reutilizados | B35–B40 |
| **PP10 — Plataforma, storage e runtime** | Auditar primeiro o piloto Supabase `SOT-10-09-2026` do PMO-011 e decidir em ADR humano entre reuso autorizado, projeto isolado em organização própria ou integração comprovadamente segura; preparar schema, RLS, storage, pipelines, jobs, APIs, event bus, backups, secrets, custos, conectores, rollback | ADR ratificado, migration/dry-run, RLS tests, deployment manifest, runbooks | Nenhuma alteração produção sem autorização, isolamento e revisão de segurança; migrations reversíveis/idempotentes | B41–B44, B46; ampliação proposta |
| **PP11 — QA 360 e auditorias** | Unit/contract/integration/E2E/regression; source-rights, provenance, schema/FK, safe failure, stress/performance, accessibility WCAG, SEO, multilíngue e publicação; revisão clínica/independente | `QA_REPORT`, audit 360, matriz de riscos e evidências de execução | CI obrigatório verde, 0 críticas abertas no release, cobertura por item, reexecução e auditoria independente; Vercel quota resolvida ou exceção formal | B45–B50 |
| **PP12 — Release e integração seletiva** | PRs pequenos para conteúdo/schemas/governança; cotejar PR #36 e branches legadas por arquivos; assinar direitos, clínica e arquitetura; criar RC por especialidade, deploy controlado, canary e rollback | `ReleaseManifest`, versão, aprovação, migration/rollback, PR review, publication registry | Merge apenas após gates aplicáveis e revisão humana, sem `force`; main intacta até autorização | B50–B53 |
| **PP13 — Handoff, observabilidade e revisão contínua** | Monitorar alteração de norma/DOI/licença, retratação, endpoints, drift dos metamodelos, erros, custos, uptime, consentimento e versões; regenerar conteúdos afetados **como candidatos** | handoff, dashboards PMO, source watchers, `ChangeImpact`, re-review queue, testes de restauração | Todas as mudanças têm diffs/eventos e retorno a gate pertinente; nenhum auto-release clínico | B54–B56; ampliação proposta |

**P0:** PP00–PP04, direitos, governança e prova da cadeia antes de ampliar clínica; **P1:** extração/evidências/knowledge/content e integração; **P2:** multiformato, internacionalização adicional e monitoramento aprofundado. Essas prioridades são de execução, não prazos prometidos.

## 5. Trilhas de carreira e conteúdo científico por especialidade

| Frente | Insumos identificados | Entrega mínima validável | Obstáculo |
|---|---|---|---|
| Urgência e Emergência | 170 tópicos; 80.261 referências de índice em M03 | normativos/algoritmos contextualizados, fontes, claims, especialidade e conteúdos por tópico | licenças, atomização e 9.102 links candidatos a triagem |
| Enfermagem do Trabalho | 885 tópicos históricos | normativa MTE/NR, saúde ocupacional, prevenção/saúde coletiva, conceitos reusáveis com contexto | fontes por tópico, direitos e atomização adicionais |
| Cardiologia | 10 UCs/300h; 51 módulos/295 tópicos; 8 eixos UC08 | ECG, SBV, SCM, perioperatório, transplante, recursos por UC | colisões UC08/07/09, ECG review, SBV sem texto, SCM falso positivo |
| Centro Cirúrgico | ementas específicas ainda não recuperadas | trilha de carreira com ementa-fonte, taxonomia, práticas, segurança perioperatória e conteúdo projetável | `HOLD_SOURCE` para grade institucional |
| CME | ementas específicas ainda não recuperadas | trilha de carreira com ementa-fonte, processamento/segurança/qualidade com normativos pertinentes | `HOLD_SOURCE` para grade institucional |
| Outras especialidades CE | escopo de hubs e ferramentas existente | matriz expansão por prioridade e cobertura | não presumir ementas nem mesclar apps distintos |

A priorização da Trilha de carreira é guiada por **documentação recebida e tema**, não pela presença de palavras parecidas em uma diretriz. Cada content master pode ter N relações a especialidades e N projeções, com rastreio de contexto.


## 5.1 Convenção funcional: **Trilha de carreira**

A interface de gestão, os cards do PMO, as frentes e as entregas antes rotuladas genericamente "Currículos" passam a usar **Trilha de carreira**. A mudança é **de nomenclatura e enquadramento funcional**, não uma reescrita das ementas. A fonte institucional continua descrita com sua terminologia original (`CURRICULUM/UC/MODULE`, "ementa", "carga horária" e "unidade curricular") nos dados de proveniência, schemas e identificadores legados. Não renomear FKs ou tabelas por substituição textual.

Objetos propostos: `CareerPath` (trilha), `CareerStage` (etapa de desenvolvimento), `Competency` (competência com origem), `LearningUnitRef` (UC/ementa fonte), `LearningObjective`, `CredentialRequirement` (quando comprovado), `Assessment`, `ContentMaster` e relacionamentos versionados. Estágios, progressão, competências, títulos profissionais, habilitações, certificações e pré-requisitos **não podem ser inferidos de ementas**; ficam como campos `PENDING_SOURCE`.

Para Cardiologia, a trilha candidata referencia 10 UCs/300h, 51 módulos e 295 tópicos detalhados e 8 eixos UC08 sem módulo próprio. Para Urgência/Trabalho/Centro Cirúrgico/CME, não inferir duração, formação exigida nem atribuições profissionais sem fonte oficial. Governar direitos e aplicabilidade clínica de forma independente.

**Contrato de compatibilidade**: `CareerPath → LearningUnitRef → CURRICULUM/UC/MODULE` por alias de apresentação, sem alterar os IDs `CARDIOLOGIA-UC-xx`, nem os tipos de `contracts/cko-schemas`. O modelo proposto está em `TRILHA_CARREIRA_CONTRATO_E_MIGRACAO.md`.

## 6. Motor de atualização automática e bloqueio de inconsistências

**Módulos lógicos a reutilizar ou construir somente onde faltar contrato existente:**
1. `Registry/SourceWatch`: inspeção periódica de fontes oficiais, ETag/Last-Modified/versão/hash e histórico imutável.
2. `Acquisition/Parsers`: captura conforme direitos, OCR **somente como último recurso**, tabelas e PDF com referência de página; jobs menores por lote com checkpoint.
3. `Atomizer/Classifier`: geração de candidatos via modelos especializados e regras, com provenance e confiança separados; política de rejeição se fonte ausente.
4. `SchemaRegistry/DictionaryCompiler`: gerar **propostas** de evolução de metamodelo, dicionário, ontologia, JSON Schemas/contratos, estrutura lógica e relações; nunca alterar schema diretamente a partir de texto de IA.
5. `RelationalIntegrityGuard`: regras de tipo, enum, PK/FK, unique, temporalidade, jurisdição, cardinalidade, proibição de conteúdo de fonte/área fora de escopo, colisões semânticas e controle de direitos; executar preflight antes de todo write.
6. `Rights/ClinicalSafetyVeto`: bloqueios independentes e decisão humana onde necessária; artefato `HOLD` é persistido.
7. `Projection/ContentFactory`: renderizações de um único `KnowledgeAtom/ContentMaster`, verificação de idioma/SEO/a11y.
8. `PMOController/EventBus`: logs por `FIND/TASK/WO`, cobertura, diffs, checkpoints, relatórios e propostas de PR.

**Ciclo:** detect change → diff imutável → atribuir IDs → executar regras de proveniência/direitos → validar contra schemas atuais → simular migração e impacto → revisão exigida → admission → CI e QA → atualizar registros e gerar candidatos editoriais → release aprovado. Uma falha cria `FIND` e `HOLD`, não modifica dados silenciosamente.

**Seleção de bibliotecas:** primeiro inventariar as bibliotecas e schemas já instalados (contracts/cko-schemas, contracts/cko-editorial, kernel, RLS/DB tools) e registrar ADR para qualquer dependência nova. Não presumir que SHACL, LinkML, migrator ou outro mecanismo esteja implantado. Encaminhar revisão de software e licença antes de introduzir dependência.

## 7. Sistemas de registro e princípio de não-duplicação

| Ambiente | Responsabilidade primária | O que NÃO fazer |
|---|---|---|
| Google Drive principal/corpus protegido | originais, snapshots autorizados, arquivos ZIP/SQLite/PDF e PMO Mestre com registries lógicos | apagar, mover ou sobrescrever originais antes de manifesto, direitos, movimento auditado |
| Supabase `SOT-10-09-2026` — piloto PMO-011 | dez tabelas de corpus com 0 linhas na listagem e funções implantadas; mesma organização do `Calculadoras-Smart` | presumir autorização de produção/reuso, alegar atomização concluída ou confundir projetos sem ADR |
| Supabase | fonte operacional DB-first — `cko_evidence.sources/snapshots/fragments/claims`, `cko_governance.documents/rights_records`, `cko_validation.findings`; **destino final sujeito a ADR de isolamento** | UPSERT por nome, criar fontes duplicadas ou alterar produção sem gate |
| GitHub | contratos, schemas, código/CI, PMO versionado, índices/hashes/metadados permitidos e PRs de mudanças | hospedar texto protegido em repo público, misturar domínio CE com contabilidade, merge massivo PR #36 |
| Kernel / NCOS | execução de tarefas admitidas, eventos, validação e políticas de promoção | autoaprovação clínica ou jurídica |
| Site e conteúdos educacionais | projeções HTML/PDF/questões/mídia, tradução, metadados e referências | publicar conteúdos sem rights/clinical QA |

**Inconsistências documentais identificadas:** os 59 itens do `PMO_WBS.csv` contêm em B20 o marco antigo 58 módulos/326 tópicos; a retificação registrada possui 51/295 e UC08 com 8 eixos. A matriz Git G0–G10 e o PMO Mestre G0–G9 diferem em quantidade e semântica. Documentar diferenças e abrir FIND para ratificação, sem apagá-las.

## 8. Controles de aprovação ("gates" sem confundir nomenclaturas)

| Controle de aceite | Evidência exigida | Bloqueio |
|---|---|---|
| Integridade documental | inventário completo, SHA256 e localização, snapshot/lote | arquivo faltante/não extraído sem exceção |
| Propriedade e identidade | source/document/authority/platform distinguidos, aliases versionados | colapsar IDs por URL/nome |
| Direitos | uso e licença por documento e operação, atribuição | licença desconhecida |
| Evidência científica | span/página/hash, claim e applicability, proveniência temporal | relação lexical sem conteúdo pertinente |
| Segurança clínica | revisão independente e conflitos resolvidos por item | qualquer claim crítica sem aprovação |
| Estrutura DB e metamodelo | schema drift, PK/FK, constraints, RLS, dry-run/rollback | migration não testada ou sem aprovação |
| Trilha de carreira | ementa rastreável e reconciliada por instituição/versão | UC08/UC07/UC09 sem decisão |
| Publicação | conteúdo derivado de claims liberados; UX/a11y/SEO, referências | divergência de renderização, direitos, acessibilidade ou CI |
| Handoff | logs, exceptions, dashboard PMO, controles e backups restauráveis | pendência omitida ou falsa conclusão |

### Ordem imediata de execução, orientada por dependências
1. **PP00:** conciliar formalmente os três modelos de gates e registrar ADR de isolamento de Supabase (exigência dos PMOs históricos), corrigindo o drift curricular B20 com nova versão, sem apagar o registro anterior.
2. **PP01–PP03:** completar B59 com crosswalk identidade (5 URLs candidatas), classificar 3 duplicidades Supabase e avançar B10/B11/B12, sem UPSERT.
3. **PP04:** resolver UC08 e buscar ementas Centro Cirúrgico/CME; expandir mapa U/E/Trabalho/CKO sem duplicar temas.
4. **PP05–PP08:** classificar direitos e versões oficiais por documento; auditar os 3 claims ECG e 29 legados, adquirir fontes pertinentes BLS/SCM e bloquear os 80 links incorretos.
5. **PP07:** testar SchemaRegistry/DictionaryCompiler/IntegrityGuard nos contratos já existentes, com simulação e testes por dados sintéticos.
6. **PP09–PP11:** dois pilotos editoriais com revisões, formatos e qualidade; CI completo (não só M04/M05), sem quota Vercel pendente.
7. **PP12–PP13:** PR seletivo para `main` depois de assinaturas e arquitetura aprovada; publication registry e monitoramento.

## 9. Critérios para finalizar a iniciativa

- [ ] Inventário de objetos no escopo totalmente fechado ou exceções individualizadas.
- [ ] 100% das fontes e versões utilizadas em publicações com direitos por operação comprovados.
- [ ] 100% dos claims publicados com evidência e revisão independente registrada.
- [ ] Metamodelos/dicionários com versão, histórico, testes de compatibilidade e bloqueio de inconsistências.
- [ ] Trilha de carreira e especialidade com IDs, cobertura e conflitos explicitados; nenhuma UC inventada.
- [ ] Content masters, reuso e projeções multiformato com paridade e referências.
- [ ] Política, Kernel, CI, RLS, segurança, a11y, SEO e rollback testados no ambiente aprovado.
- [ ] PRs integrados seletivamente, publication register auditável e monitoramento ativo.
- [ ] Auditoria 360 concluída e handoff com exceções não ocultadas.

**Bloqueio de arquitetura adicional:** o piloto `SOT-10-09-2026` já existe, mas sua finalidade e aderência ao isolamento pretendido devem ser homologadas. Estar vazio não autoriza excluir nem sobrescrever. 

**Sem cronograma absoluto neste momento:** falta decidir a infraestrutura isolada, existe volume ainda não revisado e dependências de licença/avaliação clínica/ementas. As estimativas devem ser por lote após fechamento de entradas e capacidade, não por promessa infundada.

**Atenção:** esta documentação é plano de trabalho versionado, não execução automática das fases pendentes nem autorização para alterar `Calculadoras-Smart`.

## Emenda de execução — Trilha de carreira e governança de ambiente (14/11/2026)

**Nomenclatura:** `D012` confirmou o novo nome funcional **Trilha de carreira**, com objetos `CURRICULUM/UC/MODULE` preservados como fonte. A entidade candidata `CKO-CAREER-PATH-CARDIO-20261114` referencia 10 UCs, 51 módulos e oito eixos UC08 sem distribuir suas 30 horas. O QA estrutural executou com sucesso em [GitHub Actions #43568372281](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/43568372281); não significa aprovação clínica nem profissional.

**Ambiente:** `ADR_CKO_002_CORPUS_INFRA_ISOLATION_PROPOSED.md` contém a auditoria somente leitura do piloto `SOT-10-09-2026`, o risco de organização compartilhada, as nove Edge Functions (três `verify_jwt=false`) e as alternativas. O ADR não está aprovado. Registrados `HOLD-CKO-SOT-INFRA-20261114` e `CONFLICT-CKO-SOT-ISOLATION-20261114` no PMO Mestre.

**Identidade de fontes:** `b59/B59_ALIAS_ADMISSION_QUEUE.csv` documenta cinco pares de URLs, todos `NOT_ADMITTED`. A página oficial COFEN 736/2024 foi verificada como identidade normativa; falta prova de hash e versão dos snapshots. Não houve escrita no Supabase nem admissão Kernel.

**PMO Mestre:** `PMO-013` renomeado para "CKO CE — Trilha de carreira e conhecimento canônico (PP00–PP13)" e vinculado à decisão ADR; `CHANGE_IMPACT` recebeu dois eventos novos (nomenclatura e arquitetura), `CONFLICT_REGISTER` um e `HOLD_HUMAN` um; todos com leitura de retorno verificada.

A estrutura de 59 tarefas e 16 propostas PXC continua preservada; aprovação de novas fases, migrações, rights e publicação permanece sujeita à cadeia `FIND → política → validador → TASK → WO → Kernel → QA → promoção`.


### PP07/PP10/PP11 — Extensão candidata de idempotência (M07)
Após CI PASS do PostgreSQL 16 descartável em #43572600708, persistem os problemas de reenvio e revogação transacional do outbound ao provedor externo. Novo pacote candidato **PXC-017**, não admitido, exige claim único persistido por documento/fragmento/provider/revisão, teste com sessões PostgreSQL simultâneas, política de retry, lease, eventos, proteção de dados e rollback. **Nenhum direito, migração ou implantação foi aprovado.**
