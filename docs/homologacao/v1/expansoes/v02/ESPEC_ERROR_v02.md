---
document_id: WUTRIB-DOC-EXP-V02-ERROR
version: 0.2.0
status: DRAFT
wo: WUTRIB-WO-PLAN-018
owner_role: QA_AND_RISK
reviewer_role: FISCAL_AND_INTERNAL_AUDIT
approver_role: PRODUCT_OWNER
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# EXP-010 — Error, Exception e gestão de achados

## Definições independentes

**Erro técnico**: violação comprovada de contrato técnico de dados, sistema ou execução. **Exceção analítica**: divergência contra uma expectativa documentada, que pode ter causa legítima. **Anomalia**: observação estatisticamente ou contextualmente incomum. **Possível erro fiscal**: hipótese em avaliação, cuja conclusão depende de norma válida, evidência e profissional autorizado. **Falha do sistema**: erro do motor, rede, credencial ou execução, não é desvio fiscal.

A taxonomia não deve apagar a diferença entre **tipo do evento**, **causa provável**, **nível de confiança** e **status da investigação**.

## Taxonomia versionada sugerida
`SOURCE_ERROR`, `STRUCTURE_ERROR`, `DATA_QUALITY_ISSUE`, `ARITHMETIC_MISMATCH`, `CROSS_SOURCE_EXCEPTION`, `TEMPORAL_CHANGE_CANDIDATE`, `RULE_CONFLICT_OR_MISSING_SOURCE`, `ANOMALY_SIGNAL`, `AUTHORIZED_EXCEPTION`, `ENGINE_ERROR`, `ACCESS_CONTROL_VIOLATION`, `EVIDENCE_INSUFFICIENT`.

Um `RULE_CONFLICT_OR_MISSING_SOURCE` que inviabilize interpretar resultado fiscal produz `BLOCKED`, não `PASS`. `ENGINE_ERROR` gera `ERROR` e não entra na estatística de documentos fiscais incorretos. `ACCESS_CONTROL_VIOLATION` gera alerta de segurança separado do laudo tributário.

## Contrato de evento
`findingId, occurrenceId, objectId, datasetId, sourceRowIds, ruleId, ruleVersion, eventType, status, proposedSeverity, impactValue, impactCurrency, expected, observed, tolerance, evidenceRefs, causeStatus, owner, createdAt, reviewedAt, reviewDecision, fiscalConformity`.

**Ocorrência ≠ documento:** uma mesma NF-e pode ter dois achados técnicos e uma anomalia, mas só uma chave fiscal distinta. Painéis precisarão oferecer separadamente `count_issues`, `count_distinct_documents`, `amount_at_risk` (com método e sem dupla contagem) e `count_confirmed`. O total de achados não pode ser apresentado como total de irregularidades.

## Ciclo de investigação — máquina de estados proposta
`OPEN` → `UNDER_REVIEW` → `EXPLAINED` / `CORRECTION_REQUESTED` / `ESCALATED` → `RESOLVED_CONFIRMED` ou `CLOSED_WITH_RISK_ACCEPTANCE`; `REOPENED` guarda o histórico de versão anterior. Em qualquer fase, `BLOCKED_BY_EVIDENCE` e `REJECTED_BY_REVIEWER` mantêm o registro aberto para resolução, sem autoaprovação.

Ações de mudança de status exigirão usuário autenticado, papel, organização, alçada, motivo opcional conforme política (não obrigar justificativas em triagem preliminar), evidência quando decisão exigir, timestamp, versão anterior e versão nova. Respostas técnicas nunca podem produzir assinaturas humanas.

## Gestão de criticidade
Prioridade derivada de impacto, possibilidade de exploração fiscal/segurança, integridade, repetição, prazo legal e confiança da detecção, preservando os fatores. Sem materialidade e base de cálculo aprovadas, impacto é `ESTIMATE_NOT_APPROVED`; não apresentar valor como multa, crédito ou imposto devido.

## Experiência prevista
Fila de investigação com filtros por fonte, período, filial, criticidade, classe, estado, regra e usuário; seleção múltipla, decisões em lote com confirmação e segregação; painel de evidências por item; classificação de causas; relatórios distintos de pendências, exceções justificadas e riscos. A interface não deve depender de cards de “etapas” sem comportamento real.

## Cenários de teste futuros (NOT_RUN)
`ERR02-01` mesma chave com duas ocorrências preserva 1 documento distinto e 2 eventos; `ERR02-02` falha de rede vira ERROR, não irregularidade; `ERR02-03` fonte normativa ausente bloqueia parecer; `ERR02-04` reabertura preserva decisão anterior; `ERR02-05` ação de lote não troca status de outra organização; `ERR02-06` falha de aprovação sem alçada; `ERR02-07` contagem e exportação reproduzem a população íntegra.

**Riscos e controles:** dupla contagem, fechamento indevido e perda de evidência. Estado DRAFT / NÃO EXECUTADO.
