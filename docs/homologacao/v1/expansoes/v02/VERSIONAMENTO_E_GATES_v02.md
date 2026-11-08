---
document_id: WUTRIB-DOC-EXP-V02-GATES
version: 0.2.0
status: DRAFT
wo: WUTRIB-WO-PLAN-018
owner_role: PMO_DOCUMENT_CONTROL
reviewer_role: QA_AND_SECURITY_AND_FISCAL
approver_role: PRODUCT_OWNER
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# Controle de versões, admissibilidade e dependências — expansão v0.2.0

## Política de preservação

A v0.1.0 está no branch `wutrib/expansion-analytics-plan-20261108` e na PR Draft #45. A v0.2.0 é uma **extensão documental** em branch filha; os arquivos v0.1.0 não foram substituídos. Uma futura v0.3.0 deverá registrar explicitamente diff, motivo, compatibilidade e novo aceite.

| Objeto | Versão conservada | Versão candidata | Efeito |
|---|---|---|---|
| Catálogo de módulos | 22 capacidades v0.1.0 | 6 famílias aprofundadas v0.2.0 com 8 IDs de módulo | Não cria módulos adicionais |
| Testes futuros | 33 casos v0.1.0 | 68 casos v0.2.0 | Nenhum resultado foi executado |
| Estratégia de validadores | v0.3.0 — 28 candidatos | Reutilizada como orientação | Não cria validador executável |
| Sistema documental | 50 templates | Vinculação de 17 documentos candidatos na extensão v0.2.0 | Não altera templates ou sign-offs |
| Dados e ERP | Metamodelo físico existente e catálogo TOTVS candidato | Metamodelo **conceitual** e JSON Schemas de proposta | Não cria banco, campos ERP ou ingestão real |
| Design system | Piloto v0.3 público, conforme evidências anteriores | Requisitos funcionais e de UX propostos | Não redesenha a aplicação |

## Gate de admissão de documentação

**G00:** owner e objetivo do negócio; **G01:** contrato de fontes e edição aplicável; **G02:** metamodelo e autorização de acesso; **G03:** oráculo independente e dados de teste; **G04:** UAT e acessibilidade; **G05:** capacidade e impacto sustentável; **G06:** parecer fiscal competente; **G07:** aprovação formal da versão, commit e decisão Go/No-Go.

A ausência de um gate necessário bloqueia a promoção. Um controle *NOT_RUN* permanece assim até que a execução autorizada ocorra; PR Draft e criação de documentos não transformam planejamentos em validações concluídas.

## Protocolo de versionamento para futuros contratos

- **MAJOR:** mudança no significado de chave, temporalidade, precisão, campo obrigatório, condição de aprovação, autorização, regra fiscal ou compatibilidade de leiaute.
- **MINOR:** inclusão compatível de módulo, método ou campo opcional, após testes e revisão do impacto.
- **PATCH:** documentação editorial sem alteração de significado; exige revisor e registro.
- Todo release futuro deverá congelar `moduleId`, `contractVersion`, `schemaVersion`, `inputArtifacts`, `sourceHashes`, `ruleEffectiveAt`, `erpRelease`, `commitSHA`, `testEvidence`, `approvalAuthority` e `deploymentId` quando aplicáveis.

**Observação:** versionamento é uma política de proposta; não há release do software nem assinatura nessa branch.

## Independência e fechamento

Produto e Fiscal definem resultados esperados; Arquitetura de Dados revisa esquemas, chaves, precisão e cardinalidade; QA elabora negativos e meta-validadores; Segurança valida segregação e acesso; UX e especialista de acessibilidade fazem avaliação manual; Operações aprova capacidade e resiliência; Governança controla RCM e evidências; um aprovador humano autorizado assina o gate final.

## Evidência permitida agora

Histórico Git, caminhos individuais, metadados, fontes oficiais públicas, inventário documental e revisão manual de consistência. **Não** executar: scripts de engine, pipelines de CI, fixtures de produção, migrations, queries de dados empresariais ou deploy.

**Estado de saída:** DRAFT, HOLD_HUMAN para aceite, NO_GO para execução/produção.
