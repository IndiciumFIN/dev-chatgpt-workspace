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

## Adendo de 27/11/2026 — aposentadoria técnica de referências Git

**Regra:** `CE.BRANCH.RETIREMENT.v1` (adendo candidato à norma vigente, sujeito a integração G02).  
**Autoridade de desenvolvimento:** coordenação técnica, autorização expressa registrada em [issue #33, comentário 7231593810](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/33#issuecomment-7231593810). Não representa aprovação de release pelo proprietário.

A aposentadoria de uma referência Git histórica CE/CKO/NCOS do Workspace é independente da homologação funcional do módulo. O objetivo é manter o conteúdo preservado na main canônica e o trabalho pendente no ledger existente, não manter branches paralelas como fila de trabalho. Esta autorização específica substitui somente a vedação genérica de aposentadoria de refs CE quando os requisitos abaixo forem comprovados; até integração deste adendo, a norma anterior permanece vigente.

### Estados distintos e condições cumulativas

- `RETIREMENT_CANDIDATE`: prova preliminar de preservação, sem autorização operacional de exclusão.
- `RETIREMENT_ELIGIBLE`: recibo por ref no ledger de fechamento existente, versionado na main após G02 e CI pós-merge, com todos os requisitos de aposentadoria satisfeitos.
- `RETIRED_TECHNICAL`: operação de exclusão autorizada executada sobre a ref esperada, ausência confirmada no remoto e recibo final preservado no ledger/issue #33. Não equivale a `SEALED`, `SEALED_FOR_RELEASE`, `DEV_RECONCILED` funcional ou aprovação clínica. Não alterar `closure_status` para SEALED nem `no_revisit` para true por consequência automática. Revisitar somente pendência material ou mudança de baseline pertinente, sem repetir provas imutáveis.

Requisitos cumulativos para elegibilidade:

1. Fixar nome da ref, SHA de commit, SHA de árvore, main SHA e árvore, merge-base e universo completo não truncado. Para ref ancestral da main, provar ancestralidade e alcançabilidade do commit pelo histórico canônico; para árvore idêntica ou delta divergente, comprovar cada alteração (incluindo modos, tipos, renomes e exclusões) e destino por SHA. Ausência de commits exclusivos ou equivalência de árvore não prova direitos ou ausência de dependências.
2. Preservar integralmente conteúdo e proveniência necessários: caminhos ativos equivalentes, quarentena inerte na main para candidatos permitidos, e evidência de retenção em armazenamento privado autorizado para conteúdo que não pode ser publicado. Para commits não alcançáveis da main, provar recuperação integral do histórico exclusivo/objetos relevantes por mecanismo de retenção autorizado, verificável e com teste de restauração; hash isolado ou referência a objeto potencialmente coletável não basta. Não criar tags/refs permanentes paralelas sem autorização específica.
3. Verificar dependências de PRs abertas (head/base), GitHub Actions, referências de checkout, deploys e produção Vercel, automações, documentação, integrações externas e regras de proteção. Se qualquer dependência permanecer sem substituição comprovada, HOLD da ref. Não encerrar PRs por contagem.
4. Manter G00, segurança, PII/PHI, licenças, segregação WU-TRIB e proveniência. Conteúdo restrito não deve ser copiado para Git público. Se a segurança/retencão aplicável não puder ser provada, HOLD. Não usar aposentadoria para encobrir exposição de credenciais ou eliminar evidência de incidente.
5. Registrar pendências funcionais, cross Supabase/Drive, testes e homologação com WO/FIND, responsável e destino na main. Pendência exclusivamente funcional não impede aposentadoria se não comprometer preservação, direitos, dependências ou segurança; ausência de prova relevante a esses controles continua HOLD. Cross global permanece aberto enquanto incompleto.
6. Validar ledger na main protegida, CI aplicável e isolamento de produção. Antes da exclusão, revalidar SHA remoto e evidência; usar operação autorizada com precondição atômica do SHA esperado (falhar em caso de drift), sem force-push à main. Se a ferramenta não suportar a operação, encaminhar ao administrador autorizado com comando condicionado e registrar NOT_RUN até readback. Após exclusão, confirmar ausência da ref, preservação/recuperabilidade do conteúdo e atualizar o recibo. Não excluir main, WU-TRIB, repositórios de origem, tags de retenção ou PRs automaticamente.

O ledger histórico `registers/governance/ce-branch-completion-20261120.v1.json` permanece fonte única do fechamento; seus bytes são imutáveis pelo gate CE_LEDGER_DELTA_INVALID. A aposentadoria deve ser registrada na seção `technical_retirement` do controle live existente `registers/governance/ce-branch-live-cohort-20261121.v1.json`, com estado, SHA, provas, pendências e recibo, sem sobrescrever fatos históricos ou criar ledger concorrente. Atualizar os checkers de schema e cobertura quando necessário antes de promover mudanças. Nenhuma exclusão por este documento isolado. A homologação, publicação clínica, DDL/DML e produção mantêm seus gates integrais.
