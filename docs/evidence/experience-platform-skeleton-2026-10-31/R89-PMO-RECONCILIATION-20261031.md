# R89 — Recertificação técnica do plano de 112 tarefas e referência de capability ausente

Data de observação: 31/10/2026. **READ_ONLY_CANDIDATE / HOLD_HUMAN**. Não é aprovação, decisão de WO, revisão clínica nem liberação.

## Fato reproduzido

O plano `docs/PLAN-TASKS-PMOKERNEL-v0.1.0.json` chegou a 112 tarefas; os validadores R78/R79/R87 ainda tinham a expectativa de 92. O snapshot pré-reconciliação foi preservado pelo blob Git **`b1fadfcb68717d5086ca4630498d0b6dddf9fbf5`**, HEAD `35f603277ec3dde4f7de703ad0f870f4f2dae065`.

Populações distintas, sem reescrever origens: **37 tarefas base + 31 candidatos R79 + 24 candidatos R87 + 20 novas T0.114–133 = 112**. As cinco alterações aos candidatos antigos **T0.090, 091, 092, 107, 113** foram registradas separadamente, e não reinterpretadas como novas tarefas. Somente T0.092 pode ficar `DELIVERED_PENDING_GATE` (não DONE) e T0.113 foi alterada de BLOCKED para PROPOSTO após localizar documentação candidata; isso **não** atesta autoria do DOCX ou eleição canônica. Os seis pares de escopos potencialmente duplicados permanecem à revisão humana.

## Correção testável

- `r89ScopedTaskReconciliation` anexo ao plano, contendo 20 linhas completas, cinco emendas explícitas, IDs/WO/status/origem e flags `HOLD_HUMAN`, `NOT_VERIFIED`.
- `scripts/validate-r89-task-reconciliation.mjs` confere SHA do snapshot histórico, ordem, população fechada, conteúdo e status; veta falsos DONE/ADMITTED, WOs inventadas, perda de seis divergências e alterações não documentadas.
- `scripts/validate-r87-task-extension.mjs` continua conferindo **somente** os 24 candidatos originais, com cinco emendas restritas e anexo R89. `scripts/check-r78-gap-register.mjs` e `scripts/audit-domain-wo-candidates.mjs` reconhecem as 20 adicionais apenas quando o ledger R89 é íntegro. A prova original dos 31 vínculos R79 não é enfraquecida.
- `scripts/validate-r89-task-reconciliation.test.mjs`: 9 regressões de falha fechada. A suíte do projeto roda em CI, não substitui E2E e aprovação humana.

## Achado separado da PR #21

A fonte candidata original da PR #21 foi relida: `registers/canonical/experience-capability-registry.candidate.v0.1.json`, Git blob **`ab610115cf4ef8bd9544cf562215efcfe941e86e`**, tem 201 IDs; `registers/canonical/object-capability-binding.candidate.v0.1.json`, blob **`eb4fe2d1119af3fa85cbdedf4e17562c56cbd4f2`**, tem 16 tipos de objeto. **Exatamente uma** referência é inexistente: **`LibraryEntity → CAP-RELATED-CONTENT`**, `PROPOSED`.

`CAP-CLINICAL-RELATED` existe, mas suas semânticas não foram provadas equivalentes. `registers/governance/r89-capability-reference-find.candidate.v1.json` documenta **FIND-EXP-CAP-REF-001**, OPEN_HOLD, apenas como candidato não admitido e sem mutação da fonte da PR #21; `scripts/validate-r89-capability-find.mjs` + 5 regressões proíbem falso alias ou liberação. Exige decisão de fonte e revisor independente: criar uma capability com fonte/contrato, justificar equivalência com rastreabilidade ou retirar referência sem suporte.

## Limites

O esqueleto R88 completo permanece arquivo ZIP local, **não** portado à main nem ao runtime. O gate R88 original de integridade do esqueleto segue 11/12, bloqueado pela referência real; o CI da branch PMO pode ficar verde sem atestar fechamento deste FIND. Sem rotação OAuth, tests RPC Simulados, E2E/acessibilidade, auth/RBAC, promoção de mais WOs ou eleição de fila.

**Verificar no mesmo HEAD os três workflows**: `verify`, `verify-candidate-regressions`, `canonical-inventory`. PASS dos três significa somente integridade técnica dos candidatos; o release gate permanece `HOLD_HUMAN`.
