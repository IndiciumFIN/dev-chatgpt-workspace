# Manifesto e evidência

## Definição

O manifesto é a prova formal do estado da atividade. Ele documenta o que foi
executado, por quê, com qual política, com qual hash e com qual aprovação.

## Campos mínimos

- id
- serviceOrderId
- version
- state
- hash
- validators
- policySet
- status
- approvedBy
- approvedAt

## Evidência

Toda ação precisa gravar:
- hora
- ator
- hash
- origem
- decisão
- validadores
- motivo
- referências para o artefato

## Regras

- sem manifesto: não há validação
- sem evidência: não há governança
- marca de decisão precisa ser imutável
