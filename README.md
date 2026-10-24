# Calculadoras de Enfermagem

Este repositório é um workspace de publicação e auditoria para a base pública de conteúdo clínico e materiais educacionais da família "Calculadoras de Enfermagem".

Ele reúne:
- a aplicação web e roteamento principal em `src/`
- os contratos e invariantes gerados em `contracts/`
- os registros e evidências de decisões em `registers/`
- as auditorias e artefatos de execução em `audit/`, `audit-run/` e `audit-evidence/`
- os gates e validações em `scripts/`

## Visão geral

O objetivo deste projeto é manter uma base pública, auditável e governada para publicação de conteúdo e ferramentas educacionais, sem promover material clínico sem evidência e sem acionar infra de produção por padrão.

Este workspace opera com política explícita:
- autenticação desligada por padrão (`VITE_AUTH_ENABLED=false`)
- banco desligado por política do backup público (`DB_ENABLED = false`)
- conteúdo clínico fora do índice até ter fonte e validação humanas
- `md_gate` fechado para publicação/"release" formal

## Onde começar

- `COMO-USAR.md` — guia operacional e fluxo de uso do repositório
- `README.md` — visão geral e contexto do projeto
- `docs/PENDENCIAS.md` — pendências e itens em aberto

## Verificação e gates

Os gates e auditorias locais devem ser executados antes de qualquer publicação ou promoção:

```bash
npm ci
npm run typecheck
npm test
npm run build:spa
```

Os pontos relevantes incluem:
- `check-generated-fresh` para garantir contratos gerados em sincronia com o código
- `check-cko-packages` para verificar integridade de pacotes CKO
- `check-contract-coverage` para garantir cobertura completa de contratos e entidades

## Segurança e política

- O backup público não deve telegravar autenticação, banco ou infra de produção em modo padrão.
- Qualquer reativação de autenticação ou banco precisa ser uma decisão explícita de produto e governança.
- Conteúdo sem fonte validada fica em estado de candidato e foi removido do índice até revisão humana.

## Observações importantes

Este é um workspace de auditoria e publicação controlada, não um app final de produção homogênea. A intenção aqui é manter a cadeia de evidência, os contratos e a integridade do material em evolução, com a política de backup pública preservada.

Para detalhes de uso e execução, consulte `COMO-USAR.md`.
