---
document_id: WUTRIB-DOC-EXP-V02-INDEX
version: 0.2.0
status: DRAFT
wo: WUTRIB-WO-PLAN-018
owner_role: PRODUCT_ARCHITECTURE
reviewer_role: FISCAL_AND_QUALITY
approver_role: PRODUCT_OWNER
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# WU-TRIB | Aprofundamento funcional v0.2.0

**Alcance:** somente documentação, estudo e definição de contratos para futura engenharia. Nenhuma mudança no runtime, nos validadores, no banco, na interface, nos testes ativos ou no Vercel. Sem homologação, sem aprovação e sem uso de dados reais.

## Relação com a versão anterior

O conjunto [v0.1.0](../README.md) continua íntegro e referenciável no commit `b2f953aa92cf068a39286271da93e2ff060cb0bd` e na PR #45. Este pacote **acrescenta profundidade**, não altera os 22 módulos planejados nem os 33 cenários históricos e não substitui o design system existente.

## Documentos v0.2.0

- [Plano diretor aprofundado](PLANO_DIRETOR_v02.md) — contratos, dependências, fronteiras entre motor, validador e regra fiscal, fases e critérios de admissão.
- [Extractor](ESPEC_EXTRACTOR_v02.md) — fontes, ingestão, erro, quarentena, idempotência e snapshot.
- [Join Studio](ESPEC_JOIN_v02.md) — cardinalidades, semântica, N:M, matching, null, temporalidade e estatísticas.
- [Selection e Sampling](ESPEC_SELECTION_v02.md) — população, filtros, amostragem probabilística e dirigida, replay.
- [Error & Exception](ESPEC_ERROR_v02.md) — taxonomia, máquina de estados, agrupamento e decisão.
- [Anomaly](ESPEC_ANOMALY_v02.md) — estatística robusta, grupos comparáveis, calibração e explicabilidade.
- [Temporal Tax Intelligence](ESPEC_TEMPORAL_v02.md) — decomposição de variação, bitemporalidade e legislação.
- [Experiência e requisitos UX](UX_STUDIO_v02.md) — journeys, tarefas, filtros, revisões, acessibilidade.
- [RCM e rastreabilidade](RCM_E_RTM_v02.md) — riscos, controles, validações e evidências por módulo.
- [Matriz de testes futuros](MATRIZ_TESTES_v02.json) — cenários **NOT_RUN**, testes positivos/negativos/metamórficos, gates.
- [Metamodelo e dicionário candidatos](METAMODELO_E_DICIONARIO_v02.md) — objetos, chaves lógicas e significado.
- [Contratos de dados](CONTRATO_DATASET_v02.schema.json) e [de execução](CONTRATO_EXECUCAO_v02.schema.json) — JSON Schema *de planejamento*, sem migração de banco.
- [Registro de fontes técnicas](FONTES_OFICIAIS_v02.json) — links oficiais e limites de evidência.
- [Manifesto de revisão](MANIFESTO_EXPANSAO_v02.json) — IDs, estados, referências, checkpoints, próximos gates.

## Fronteiras e versões

- Fonte primária do documento: GitHub, sob `docs/homologacao/v1/expansoes/v02/`; preservação por commit e PR Draft.
- Controle documental: `WUTRIB-WO-PLAN-018` (já existente). Nova WO executiva de módulos **não criada**; dependerá de aprovação e admissão da estratégia.
- As 50 peças da documentação v0.1, os 28 validadores candidatos v0.3, 22 engines v0.1 e 33 cenários históricos permanecem separados e inalterados em sua origem.
- Nenhum arquivo deste pacote tem autorização para aprovar imposto, editar obrigações acessórias, gerar crédito tributário, mudar configuração Protheus ou realizar deploy.

**PARECER:** DRAFT / NOT_EXECUTED / NO_FISCAL_CONFORMITY / NO_RELEASE.
