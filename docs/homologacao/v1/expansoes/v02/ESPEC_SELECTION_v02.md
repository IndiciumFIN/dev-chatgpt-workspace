---
document_id: WUTRIB-DOC-EXP-V02-SELECT
version: 0.2.0
status: DRAFT
wo: WUTRIB-WO-PLAN-018
owner_role: AUDIT_METHODS
reviewer_role: INTERNAL_AUDIT_AND_FISCAL
approver_role: PRODUCT_OWNER
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# EXP-005/007 — Selection Builder, população e amostragem

## Três operações com autoridade distinta

**FILTER** é subconjunto por expressão tipada sobre uma população definida, e não constitui amostragem. **RISK_SELECTION** é seleção dirigida por materialidade, regra ou características de risco, sem atribuição automática de inferência estatística. **PROBABILITY_SAMPLE** requer população-alvo completa, identificação da unidade amostral, método, probabilidade de inclusão, critérios de tamanho e avaliação de risco; somente sua concepção pode admitir inferência, conforme método profissional aprovado.

## Contrato do filtro
`populationManifestId`, `datasetSchemaVersion`, `expressionAST`, `nullPolicy`, `dateBoundary`, `timezone`, `exclusions`, `previewCount`, `resultDigest`, `purpose`. Operadores: eq/ne, set membership, range, string/decimal/date, condições AND/OR/NOT com precedência legível. Não permitir `eval`, SQL livre não parametrizado ou regex sem limites de tempo/complexidade.

**Demonstração:** filtro CFOP em conjunto X e competência de janeiro, sem atribuir estatística à amostra resultante. Guardar a população antes e depois e as razões de exclusão.

## Contrato de seleção e amostragem
`populationId`, `populationHash`, `unitKey`, `stratumId`, `samplingMethod`, `seed`, `sizeBasis`, `targetSize`, `selectionProbability`, `replacementPolicy`, `selectedUnitIds`, `nonSamplingRisk`, `projectionEligibility`.

Métodos candidatos: censo/100%; seleção dirigida por risco e valor; aleatória simples; sistemática com primeiro elemento aleatório e intervalo declarado; estratificada com alocação explícita; seleção monetária/MUS quando método profissional adequado. Não projetar resultados de seleção dirigida para 100% da população.

**Controle de amostragem:** documentar frame completo, itens fora do escopo, unidades excluídas, método, seed, probabilidades, limitações, substituições e revisor. Método não definido → `BLOCKED`; `projectionEligibility=false` para risk-targeted.

## Casos de risco
- População incompleta: não alegar cobertura total ou extensão estatística.
- Sampling sem seed reproduzível: reexecução não poderá ser comprovada.
- Seleção sistemática com periodicidade conhecida: avaliar risco de viés por padrão de ordenação.
- Agrupamento por CNPJ sem considerar filial/competência: mistura indevida de populações.
- Reutilizar parâmetros de materialidade de outro cliente sem autorização: risco de omissão de ocorrências.

## Experiência futura
Interface com contagem de população, filtros salvos e versionados, visão de incluídos/excluídos, painel “**Tipo de seleção**” que diferencia filtro, seleção dirigida e amostra probabilística; mostrar claramente unidade, método, semente, tamanho, revisão e se projeção é permitida. Exportar a lista de IDs de unidades com trilha e versão.

## Testes planejados NOT_RUN
`SEL02-01` precedência AND/OR e null; `SEL02-02` intervalo de datas/TZ; `SEL02-03` revisão da população; `SEL02-04` seed e reprocessamento; `SEL02-05` seleção dirigida sem projeção; `SEL02-06` frame incompleto bloqueia; `SEL02-07` estratos vazios/raros; `SEL02-08` sampling sistemático e periodicidade; `SEL02-09` massa grande e limite de recursos.

**Referência profissional candidata:** NBC TA 530, quando metodologia e natureza do trabalho permitirem; IIA GIAS para planejamento e documentação de amostras, sem alegar que uma ferramenta executa auditoria independente automaticamente.

**Estado:** DRAFT / NOTHING_EXECUTED.
