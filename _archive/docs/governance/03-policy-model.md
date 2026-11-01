# Modelo de política

## Definição

A política ativa define as regras mínimas de validação e governança. O kernel só
avança se a política exigir e a atividade atender.

## Estrutura

- id
- code
- description
- version
- active
- scope

## Escopos

- global
- content
- template
- preview
- deploy

## Regras

- política ativa é obrigatória
- regra atômica e versionada
- política só vale quando explicitamente ativa
- qualquer falha de política bloqueia a continuação
