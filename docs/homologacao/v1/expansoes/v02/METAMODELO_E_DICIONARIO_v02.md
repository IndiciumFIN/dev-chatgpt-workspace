---
document_id: WUTRIB-DOC-EXP-V02-METAMODEL
version: 0.2.0
status: DRAFT
wo: WUTRIB-WO-PLAN-018
owner_role: DATA_ARCHITECT
reviewer_role: ERP_AND_FISCAL_AND_SECURITY
approver_role: PRODUCT_OWNER
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# Metamodelo conceitual e dicionário de expansão — v0.2.0

## Fronteira com o banco existente

Os objetos abaixo são **conceitos candidatos**, não tabelas físicas no SOT, não migrations, não dados encontrados no Protheus. O metamodelo físico anterior de 41 tabelas no `wutrib` e o dicionário de 22 campos permanecem baselines históricos de escopo diferente. Um campo só poderá ser vinculado a SX3/FISA170 após snapshot oficial/autorizado do release e validação da semântica.

## Conceitos e relações propostas

| Objeto | Chave conceitual | Responsabilidade | Dependências |
|---|---|---|---|
| SourceContract | sourceContractId + version | Contrato de aquisição, leiaute e permissões | Norma/fornecedor e ambiente |
| SourceSnapshot | snapshotId | Bytes ou leitura imutável, hash, período, release, organização | SourceContract |
| DatasetManifest | datasetId + version | População, contagens, classificação, qualidade e linhagem | SourceSnapshot |
| DatasetField | datasetId + fieldId | Tipo, precisão, formato, nulidade, unidade, origem | DatasetManifest |
| MasterEntityVersion | entityId + validFrom + recordedAt | Cadastro mestre e história bitemporal | SourceSnapshot |
| JoinPlan | joinPlanId + version | Chaves, tipo de join, cardinalidade e tolerância | Dois ou mais Datasets |
| SelectionPlan | selectionPlanId + version | AST filtro, população, exclusões | DatasetManifest |
| SamplingPlan | samplePlanId + version | Método, unidade, seed, projeção permitida | SelectionPlan |
| OperationRun | runId | Executor, parâmetros, origem, status, custo e hashes | Operação + Dataset |
| DerivedDataset | datasetId + parentRunId | Saída imutável e linhagem das transformações | OperationRun |
| AnalysisSignal | signalId | Candidato de anomalia/variação com explicação e contexto | DerivedDataset |
| FindingOccurrence | occurrenceId | Evento técnico, divergência ou exceção específica | AnalysisSignal / Rule |
| InvestigationCase | caseId | Agrupamento de ocorrências por objeto e decisão humana | FindingOccurrence |
| FiscalRuleVersion | ruleId + version + effectiveFrom | Oráculo tributário aprovado, vigência e fontes oficiais | NormativeSource |
| NormativeSource | sourceId + edition | Evidência normativa, licença, validade e hash quando disponível | Repositório oficial |
| ERPConfigSnapshot | configSnapshotId | Parâmetros TES/FISA170 por filial e release | SourceSnapshot |
| TemporalComparison | comparisonId | Populações e diferenças por período e contribuição | DatasetManifest / FiscalRuleVersion |
| Workpaper | workpaperId + version | Procedimento, evidências, conclusão humana e aprovações | InvestigationCase / WO |

**Cardinalidades:** uma execução pode produzir muitos datasets; cada dataset derivado aponta a execução e aos datasets pais; um documento pode ter várias ocorrências; a investigação pode agrupar ocorrências preservando suas identidades; várias regras podem ser candidatas para um evento, mas conflito ou insuficiência de aplicabilidade implica HOLD.

## Dicionário técnico mínimo

| Campo conceitual | Tipo proposto | Restrições |
|---|---|---|
| orgCode / branchCode | string | Preservar zeros, identidade e escopo; autorização server-side |
| sourceHash / payloadSha256 | string hex SHA-256 | Calculado sobre bytes reais, nunca valor ilustrativo |
| fiscalPeriod | YYYY-MM | Separado de datetime de emissão e data de vigência |
| capturedAt / recordedAt | ISO8601 UTC | Meta de execução, não parte de digest semântico |
| validFrom / validTo | data civil | Intervalo semiaberto `[from,to)` como convenção proposta |
| amount / taxBase / taxAmount | decimal em string | Dinheiro exato, precisão/escala contratual; não JS float |
| effectiveRate | decimal em string | Unidade e denominador explícitos; zero = UNDEFINED |
| sourceKey / productCode / CFOP / CST / NCM | string | Preservar formatos, leading zeros; validar por fonte |
| eventType / status | enum | Valores definidos por contrato e camada |
| logicalRowId | string | Identificador estável de linha do snapshot, não index de UI |
| cardinality | enum 1:1 / 1:N / N:1 / N:M / UNKNOWN | Determinado por dados e contrato, não por suposição |
| selectionMethod | enum | FILTER / RISK / PROBABILITY_SAMPLE / CENSUS |
| resultSemanticHash | SHA-256 | Canonicalização e versão próprias, sem timestamp |
| fiscalConformity | `NOT_EVALUATED` em motor | Não autoriza resultado tributário |

## Transformações permitidas e proibidas por padrão

**Permitido apenas após contrato:** normalização de datas/formatos, projeção de campos, cast validado, união, filtro, seleção, agrupamento e cálculo com esquema de unidades. **Proibido implicitamente:** alterar dado bruto; inferir automaticamente correspondência fiscal por fuzzy matching; somar valores expandidos após join N:M; transformar `null` em zero; trocar regra por edição mais recente; descartar linhas rejeitadas sem log; misturar filiais sem escopo e origem.

## Regra de versionamento de contratos

Mudança de significado de campo, chave, cardinalidade, data, fonte, tipo, escala ou autorização requer versão compatível/incompatível conforme análise de impacto; transformar resultado antigo só com migração auditável. Se o release Protheus não estiver confirmado, `erpRelease=UNKNOWN` e módulos fiscais dependentes devem permanecer BLOCKED.

## Gates futuros

Aprovar tipagem, unidades, formalização de domínio, chaves, prevenção de ciclos, legalidade, controle de acesso, compatibilidade, exclusões e oráculos de todos os objetos antes de implementação ou banco.

**Status:** MODEL_PROPOSAL_ONLY, sem DDL e sem reclassificação dos metamodelos físicos existentes.
