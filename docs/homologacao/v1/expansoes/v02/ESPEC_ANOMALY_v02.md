---
document_id: WUTRIB-DOC-EXP-V02-ANOMALY
version: 0.2.0
status: DRAFT
wo: WUTRIB-WO-PLAN-018
owner_role: DATA_SCIENCE_AND_RISK
reviewer_role: STATISTICAL_METHODS_AND_FISCAL
approver_role: PRODUCT_OWNER
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# EXP-011 — Identificação de anomalias com explicabilidade

## Definição e restrição
Anomalia é uma **observação que se afasta da distribuição/expectativa definida**, não um erro fiscal confirmado, indício de dolo ou fraude. A pontuação e o rótulo devem levar a investigação, sem autorizar retificação, cálculo de crédito ou divulgação de irregularidade.

## Métodos explicáveis candidatos
**Estatísticos:** IQR para extremos robustos, mediana e MAD para desvios, variação relativa com denominadores controlados, frequência de zeros/duplicidade, rupturas por janela temporal, percentis. **Contextuais:** comparação em grupos homogêneos de UF, regime, tributo, CFOP, NCM, produto, filial, período e natureza de operação. **Padrões de relacionamento:** combinações incomuns de TES, CST, alíquota, CFOP e produto, usando apenas combinações presentes em fonte autorizada.

Métodos de aprendizado de máquina ou LLM só serão considerados após inventário, teste independente, governança específica e avaliação de impactos; um método estatístico determinístico não se torna automaticamente sistema de IA.

## Requisitos do score futuro
Para um score proposto, registrar `methodId, version, cohortDefinition, eligibleN, excludedN, baselinePeriod, threshold, thresholdSource, featureValues, reasonCodes, score, uncertainty, reviewerFeedback`. Critérios de comparação de coortes e thresholds deverão ser aprovados antes da aplicação; não usar o mesmo limiar arbitrário para todas as contas, tributos ou clientes.

**MAD:** `median(|x_i - median(x)|)`. Divisão por escala zero/muito pequena exige `UNDEFINED/INSUFFICIENT_VARIATION`, não score infinito silencioso. **IQR:** `Q3 - Q1`, cuja interpolação de quantis precisa ser versionada, inclusive convenção para amostra pequena e valores repetidos.

## Exemplo ilustrativo
Um contribuinte registra alíquota efetiva significativamente diferente de seu grupo comparável. Explicações concorrentes: nova mercadoria, alteração de regime, operação não homogênea, estorno, mudança de TES, entrada de filial, erro de dado ou regra aplicável. O sistema apresenta **sinal e hipóteses ordenadas por evidência**, nunca uma sentença de irregularidade.

## Métricas e meta-validação futura
Matriz de confusão baseada em corpus independente quando for possível rotular casos; sensibilidade por tipo de anomalia, falsos positivos, falsos negativos, precisão, estabilidade entre períodos e variação por grupo. Medir drift da população e mudanças de parâmetros. Golden set não pode ser criado exclusivamente pelo mesmo algoritmo que está sendo testado. Reportar `UNKNOWN` quando não existir verdade de referência.

## Segurança, volume e sustentabilidade
Não usar dados sensíveis em prompts ou logs, impedir exploração de strings em campos, manter separação entre organizações. Planejar cálculo por agregados e janelas limitadas com orçamento de CPU/memória e possibilidade de cancelamento. Considerar custo por 1.000 documentos e conservação de energia como métrica futura, sem inventar gCO₂e.

## Interface proposta
Resultado acompanhado de explicação textual, fonte, grupo de comparação, gráfico acessível com equivalente tabular, cobertura, limiar e sugestões de investigação. Filtros, ordenação, explicação de confiança e comentários de revisor. Um botão de “Confirmar irregularidade” somente existiria em jornada específica com autorização e evidência suficientes, nunca em score automático.

## Casos previstos (NOT_RUN)
`ANM02-01` extremo óbvio; `ANM02-02` população pequena; `ANM02-03` base de comparação não homogênea; `ANM02-04` MAD zero; `ANM02-05` outlier legítimo; `ANM02-06` baseline com drift; `ANM02-07` distribuição sazonal; `ANM02-08` viés de seleção; `ANM02-09` explicação não rastreável → HOLD.

**Estado:** PLANNED / SEM MODELO TREINADO / SEM TESTES EXECUTADOS.
