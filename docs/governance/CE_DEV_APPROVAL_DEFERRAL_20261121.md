# CE / NCOS — Adendo de governança DEV: aprovação diferida

**Regra:** `CE.GOV.DEV_APPROVAL_DEFERRED.v1`  
**Data de registro:** 2026-11-21 · **Fase:** `DEVELOPMENT`  
**Origem da instrução:** Leivis Lima, coordenação técnica, esclareceu que **Cauê Zipfel é o proprietário** e não participará de aprovações nesta fase.

## Identidades e autorização

- **Proprietário:** Cauê Zipfel. **Estado de aprovação do proprietário:** `NOT_REQUESTED_DEFERRED`. Não atribuir nem simular aprovação; não pressupor delegação para atos que exigem consentimento expresso.
- **Executor/coordenador técnico:** Leivis Lima. Pode preparar PRs, análises, testes, documentação, reconciliações e correções em desenvolvimento, dentro das permissões já existentes, com trilha GitHub.
- **Revisor independente para PRs de DEV:** `OPTIONAL_NOT_A_BLOCKING_GATE`. A antiga obrigatoriedade interna fica **suspensa exclusivamente** para PRs de desenvolvimento e registros preparatórios. Se o GitHub exigir aprovação por uma ruleset real, respeitar a ruleset; não forjar nem usar bypass.
- **Aprovação do proprietário para homologação, publicação, dados operacionais e releases:** `DEFERRED_UNTIL_RELEASE_GATE` e continua indispensável quando cabível; nunca preencher automaticamente como aprovado.

## Transições de estado permitidas nesta fase

`ISSUE_PLANNED → IMPLEMENTED_IN_PR → CI_VERIFIED → DEV_MERGED_VERIFIED` com diff por SHA, gates reais, testes, owner técnico e reversibilidade. A falta de revisão humana independente **não impede**, por si só, essas transições em desenvolvimento.

`DEV_RECONCILED` identifica uma **branch histórica tecnicamente reconciliada** com 100% dos objetos e divergências classificados e sem perda demonstrada, verificações pós-main e evidências versionadas. **Não equivale** a `SEALED_FOR_RELEASE`, `PRODUCTION_READY` ou autorização clínica. O estado `SEALED` em documentos antigos continua significando encerramento final e não deve ser atribuído falsamente até a transição de fase e suas evidências; os antigos HOLD por falta de revisão devem ser lidos como históricos, **não** como veto a novas tarefas DEV.

## O que NÃO foi dispensado

- CI exigida pela ruleset real da `main`, validação de SHA, histórico de PR e testes adversariais.
- G00 verificação de segredos/PII, revogação/rotação quando há exposição confirmada, autenticação/RBAC, isolamento entre usuários, RLS, licenças, direitos e proveniência clínica.
- Auditorias externas e gates que decorram de obrigação legal, norma aplicável ou segurança de pacientes.
- Controle de migração, dados remotos e operação de produção. **Não** executar DDL/DML, exclusão de branches, promoção ou publicação por causa desta dispensa.
- Confirmação do destino `main`: integrar em DEV apenas após garantir que não há deploy automático indevido para produção; se houver possibilidade, primeiro isolar o fluxo de publicação. Vercel Preview `ERROR` continua pendência própria, não motivo para falsificar sucesso.

## Saída de DEVELOPMENT

Ao iniciar homologação, distribuição a terceiros ou publicação clínica, abrir decisão explícita para Cauê Zipfel (proprietário), reavaliar requisitos de revisão e registrar consentimentos reais. Nunca converter retroativamente `NOT_REQUESTED_DEFERRED` em `APPROVED`; o histórico precisa mostrar a data e o SHA do ato.

## Compatibilidade com documentos históricos

Este adendo **substitui a exigência interna de revisão independente como bloqueio da fase DEV** em `CE_BRANCH_COMPLETION_STANDARD_20261120.md` e nos relatórios W2.5, sem reescrever a evidência histórica. Preserva as exigências integrais para `SEALED`/release até revisão formal na mudança de fase.

**Vínculos:** [Épico #90](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/90), [A11 #101](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/101), [PR #89](https://github.com/IndiciumFIN/dev-chatgpt-workspace/pull/89).
