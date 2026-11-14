# Modelo de Work Order

## Definição

A Work Order (WO) representa a atividade governada, desde o planejamento até a produção.

## Campos mínimos

- id
- type
- title
- objective
- scope
- owner
- approver
- sourceRef
- policySet
- riskLevel
- dataClassification
- securityImpact
- environment
- status
- manifestId
- evidence
- approvals

## Tipos

- planning
- pilot
- development
- test
- production
- rollback

## Estados

- draft
- planned
- pilot
- approved_for_development
- in_development
- ready_for_test
- in_test
- approved_for_production
- in_production
- closed
- rejected
- revoked

## Regras

- toda WO tem política ativa
- toda WO tem manifest
- toda WO tem evidência
- sem WO: operação inválida
- sem manifesto: não há promoção
