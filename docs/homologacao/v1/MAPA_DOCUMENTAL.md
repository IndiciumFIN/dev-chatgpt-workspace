# Mapa documental completo — WU-TRIB

**Versão do mapa:** 0.1.0 · **WO:** `WUTRIB-WO-PLAN-018` · **Estado:** DRAFT, sem assinatura · **Fonte da verdade:** [manifesto](registro-documental.v1.json).

O objetivo deste inventário é **não deixar documentos ausentes sem identificação**. `TEMPLATE` = modelo existente com conteúdo por produzir; não significa que a auditoria, o teste ou a homologação foram realizados. O conjunto mínimo de cada trilha é selecionado conforme risco, uso e normas aplicáveis; itens condicionais exigem decisão formal. A ausência de revisão, evidência ou assinatura mantém HOLD.

## Cobertura por fase e gate

| Gate | Documentos previstos | Significado |
|---|---:|---|
| G00 | 3 | Abertura e WO |
| G01 | 3 | Escopo, RCM e requisitos |
| G02 | 15 | Arquitetura e contratos |
| G03 | 4 | Preparação dos testes |
| G04 | 10 | Execução e evidência |
| G05 | 4 | UAT e qualidade em uso |
| G06 | 3 | Encerramento dos testes |
| G07 | 2 | Homologação |
| G08 | 2 | Implantação e rollback |
| G09 | 2 | Operação e hypercare |
| G10 | 2 | Arquivo e revisão |

## Catálogo individual de 50 modelos

| ID | Documento versionado | Gate | Abrangência | Estado |
|---|---|---|---|---|
| WUTRIB-DOC-001 | [Termo de abertura, finalidade e escopo](artefatos/D001_TERMO_ABERTURA.md) | G00 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-002 | [Business case, benefícios e decisão de investimento](artefatos/D002_BUSINESS_CASE.md) | G00 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-003 | [WO canônica e checklist homólogo por fase](artefatos/D003_WO_CICLO.md) | G00 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-004 | [Matriz de riscos e controles RCM](artefatos/D004_RCM.md) | G01 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-005 | [Especificação de requisitos e limites do produto](artefatos/D005_REQUISITOS_NEGOCIO.md) | G01 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-006 | [Matriz de rastreabilidade de requisitos RTM](artefatos/D006_RTM.md) | G01 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-007 | [Matriz de aplicabilidade e precedência de normas](artefatos/D007_APLICABILIDADE_NORMATIVA.md) | G02 | ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-008 | [Arquitetura lógica, física e modelo de implantação](artefatos/D008_ARQUITETURA.md) | G02 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-009 | [Metamodelos e catálogo de entidades](artefatos/D009_METAMODELO.md) | G02 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-010 | [Dicionário canônico de campos, tipos e proveniência](artefatos/D010_DICIONARIO_CAMPOS.md) | G02 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-011 | [Política de qualidade de dados, completude e linhagem](artefatos/D011_QUALIDADE_DADOS.md) | G02 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-012 | [Registro normativo e versionamento de regras fiscais](artefatos/D012_REGRAS_FISCAIS.md) | G02 | ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-013 | [Contrato e dicionário TOTVS TES/FISA170 híbrido](artefatos/D013_TOTVS_TES_FISA170.md) | G02 | ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-014 | [Contratos de APIs e integrações externas](artefatos/D014_CONTRATOS_INTERFACES.md) | G02 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-015 | [Inventário de dados e decisão de RIPD](artefatos/D015_LGPD_RIPD.md) | G02 | CONDITIONAL_DECISION | `TEMPLATE` |
| WUTRIB-DOC-016 | [Modelo de ameaças, fronteiras e abuso](artefatos/D016_THREAT_MODEL.md) | G02 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-017 | [Matriz IAM RBAC, MFA e segregação](artefatos/D017_IAM_RBAC.md) | G02 | ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-018 | [SBOM, proveniência de dependências e licenças](artefatos/D018_SBOM_LICENCAS.md) | G02 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-019 | [Catálogo de fontes e evidências de autenticidade](artefatos/D019_CATALOGO_FONTES.md) | G02 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-020 | [Inventário de ambientes, releases e segredos](artefatos/D020_AMBIENTES_CONFIGURACAO.md) | G02 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-021 | [Plano mestre de testes MTP](artefatos/D021_MASTER_TEST_PLAN.md) | G03 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-022 | [Estratégia das 14 famílias e técnicas de testes](artefatos/D022_ESTRATEGIA_TESTES.md) | G03 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-023 | [Casos de teste detalhados e oráculos](artefatos/D023_CASOS_TESTE.md) | G03 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-024 | [Plano de fixtures sintéticos e proteção de dados](artefatos/D024_DADOS_TESTE.md) | G03 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-025 | [Diário de execução, resultados e evidências](artefatos/D025_EXECUCAO_TESTES.md) | G04 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-026 | [Registro de defeitos FIND, severidade e RCA](artefatos/D026_DEFEITOS.md) | G04 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-027 | [Registro de retestes, regressão e cobertura](artefatos/D027_REGRESSOES.md) | G04 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-028 | [Relatório funcional e validação de processos](artefatos/D028_RELATORIO_FUNCIONAL.md) | G04 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-029 | [Relatório de validação fiscal e legal](artefatos/D029_RELATORIO_FISCAL.md) | G04 | ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-030 | [Relatório de precisão e reconciliação dos dados](artefatos/D030_RELATORIO_DADOS.md) | G04 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-031 | [Relatório de integração e E2E autenticado](artefatos/D031_INTEGRACAO_E2E.md) | G04 | ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-032 | [Relatório SAST DAST SCA e testes de acesso](artefatos/D032_SEGURANCA_TESTES.md) | G04 | ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-033 | [Plano e relatório de carga/estresse/capacidade](artefatos/D033_PERFORMANCE_CAPACIDADE.md) | G04 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-034 | [Relatório continuidade, backup, restore e RTO/RPO](artefatos/D034_RESILIENCIA_DR.md) | G04 | ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-035 | [Plano e relatório de acessibilidade WCAG-EM](artefatos/D035_WCAG_EM.md) | G05 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-036 | [Plano e relatório de experiência e UAT](artefatos/D036_UX_HCD.md) | G05 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-037 | [Plano e relatório de sustentabilidade digital SCI](artefatos/D037_SUSTENTABILIDADE.md) | G05 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-038 | [Matriz browsers mobile i18n e formatos](artefatos/D038_COMPATIBILIDADE_I18N.md) | G05 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-039 | [Plano de monitoramento, eventos e suporte](artefatos/D039_OBSERVABILIDADE.md) | G06 | ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-040 | [Relatório de encerramento e cobertura de testes](artefatos/D040_ENCERRAMENTO_TESTES.md) | G06 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-041 | [Exceções, riscos residuais e tratamento de desvios](artefatos/D041_EXCECOES_RISCOS.md) | G06 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-042 | [Ata Go/No-Go e parecer de homologação](artefatos/D042_GO_NO_GO.md) | G07 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-043 | [Termo de aceite e assinaturas independentes](artefatos/D043_TERMO_ACEITE.md) | G07 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-044 | [Plano de implantação e controle de mudanças](artefatos/D044_RELEASE_RUNBOOK.md) | G08 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-045 | [Plano e ensaio de rollback e restauração](artefatos/D045_ROLLBACK.md) | G08 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-046 | [Plano de estabilização e revisão de incidentes](artefatos/D046_HYPERCARE.md) | G09 | ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-047 | [Revisão pós-implantação e lições aprendidas](artefatos/D047_POS_IMPLANTACAO.md) | G10 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-048 | [Manual de operação, treinamento e transferência](artefatos/D048_TREINAMENTO.md) | G09 | ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-049 | [Registro de ADRs, decisões e gestão de mudanças](artefatos/D049_ADR_MUDANCAS.md) | G02 | PILOT_SYNTHETIC, ENTERPRISE_FISCAL | `TEMPLATE` |
| WUTRIB-DOC-050 | [Plano de arquivo, retenção, legal hold e descarte](artefatos/D050_RETENCAO_DESCARTE.md) | G10 | CONDITIONAL_DECISION | `TEMPLATE` |

## Documentos superiores do sistema
- [Política documental](POLITICA_GESTAO_DOCUMENTAL.md) — DRAFT 0.1.0.
- [Plano mestre](PLANO_MESTRE_DO_CICLO.md) — DRAFT 0.1.0.
- [RACI e segregação](RACI_E_SEGREGACAO.md) — DRAFT 0.1.0.
- [Fontes e normas](FONTES_E_NORMAS.md) — DRAFT 0.1.0.
- [Registro JSON de referências](referencias-normativas.v1.json) — 18 fontes, status de aplicabilidade ainda sujeito a revisão.
- [Verificação de integridade](../../../scripts/check-wutrib-docs.mjs) — apenas consistência documental.

## Conciliação dos documentos legados do Supabase (14 linhas)

O `project_documents` existente não deve ser reescrito retroativamente nem transformado em aprovação.

| Código original | Versão | Estado | Tratamento |
|---|---|---|---|
| `AUDITOR_DB_ARCHITECTURE` | 1.1.0 | DRAFT_EXISTING | Não sobrescrever; conciliar conteúdo antes de aproveitamento |
| `AUDITOR_DB_OPEN_ITEMS` | 1.1.0 | DRAFT_EXISTING | Não sobrescrever; conciliar conteúdo antes de aproveitamento |
| `AUDITOR_DB_SECOND_PASS_AUDIT` | 1.1.0 | DRAFT_EXISTING | Não sobrescrever; conciliar conteúdo antes de aproveitamento |
| `AUDITOR_DB_VALIDATION` | 1.1.0 | DRAFT_EXISTING | Não sobrescrever; conciliar conteúdo antes de aproveitamento |
| `LEGACY_BASELINE_REPORT` | 1.0.0 | DRAFT_EXISTING | Não sobrescrever; conciliar conteúdo antes de aproveitamento |
| `LEGACY_DATA_COUNTS` | 1.0.0 | DRAFT_EXISTING | Não sobrescrever; conciliar conteúdo antes de aproveitamento |
| `PLANNING_WO_REGISTRY` | 1.0.0 | DRAFT_EXISTING | Não sobrescrever; conciliar conteúdo antes de aproveitamento |
| `PROJECT_CHARTER` | 1.0.0 | DRAFT_EXISTING | Não sobrescrever; conciliar conteúdo antes de aproveitamento |
| `SECURITY_AUDIT_INITIAL` | 1.0.0 | DRAFT_EXISTING | Não sobrescrever; conciliar conteúdo antes de aproveitamento |
| `SOT_LEGACY_SCOPE` | 1.0.0 | DRAFT_EXISTING | Não sobrescrever; conciliar conteúdo antes de aproveitamento |
| `WUTRIB_WEB_PILOT_DEPLOYMENT` | 0.1.0 | DRAFT_EXISTING | Não sobrescrever; conciliar conteúdo antes de aproveitamento |
| `WUTRIB_WEB_PILOT_QA` | 0.2.0 | DRAFT_EXISTING | Não sobrescrever; conciliar conteúdo antes de aproveitamento |
| `WUTRIB_WEB_RELEASE` | 0.2.1 | DRAFT_EXISTING | Não sobrescrever; conciliar conteúdo antes de aproveitamento |
| `WUTRIB_WEB_RELEASE` | 0.3.0 | DRAFT_EXISTING | Não sobrescrever; conciliar conteúdo antes de aproveitamento |

## Fonte GitHub anterior

- `README.md`: EXISTING_NOT_REVALIDATED; apenas vínculo ao inventário, sem migração semântica.
- `docs/ARCHITECTURE.md`: EXISTING_NOT_REVALIDATED; apenas vínculo ao inventário, sem migração semântica.
- `docs/WOS.md`: EXISTING_NOT_REVALIDATED; apenas vínculo ao inventário, sem migração semântica.
- `docs/AUDITORIA_INTEGRAL_WUTRIB_20261108.md`: EXISTING_NOT_REVALIDATED; apenas vínculo ao inventário, sem migração semântica.
- `docs/WAVE_044_REMEDIATION_EVIDENCE.md`: EXISTING_NOT_REVALIDATED; apenas vínculo ao inventário, sem migração semântica.
- `docs/SECURITY_v0.4.1.md`: EXISTING_NOT_REVALIDATED; apenas vínculo ao inventário, sem migração semântica.
- `docs/WAVE_042_EVIDENCE_AND_REMAINING_STAGES.md`: EXISTING_NOT_REVALIDATED; apenas vínculo ao inventário, sem migração semântica.
- `docs/DETERMINISTIC_AGENTS.md`: EXISTING_NOT_REVALIDATED; apenas vínculo ao inventário, sem migração semântica.
- `contracts/functional-requirements.v1.json`: EXISTING_NOT_REVALIDATED; apenas vínculo ao inventário, sem migração semântica.
- `contracts/official-source-registry.v1.json`: EXISTING_NOT_REVALIDATED; apenas vínculo ao inventário, sem migração semântica.
- `contracts/physical-field-dictionary.audit.v1.json`: EXISTING_NOT_REVALIDATED; apenas vínculo ao inventário, sem migração semântica.
- `contracts/physical-metamodel.audit.v1.json`: EXISTING_NOT_REVALIDATED; apenas vínculo ao inventário, sem migração semântica.
- `contracts/totvs-fisa170-table-registry.candidate.json`: EXISTING_NOT_REVALIDATED; apenas vínculo ao inventário, sem migração semântica.

## Lacunas que o mapa não oculta

- 50 templates estruturalmente presentes; preenchimento, revisão e assinaturas **pendentes**.
- Quatro políticas/planos estruturantes em **DRAFT**, aguardando aprovação.
- Nenhuma prova nova de execução de testes de ferramenta é gerada por este pacote.
- Homologação fiscal, acesso real a Protheus, qualidade dos dados empresariais, capacidade de produção, WCAG manual, sustentabilidade SCI e GO/NO-GO permanecem **HOLD**.
- O resultado do controle automático, mesmo positivo, não altera esses estados.

**Condição de congelamento da baseline:** registrar commit, hash real do conjunto, evidências, revisões e aceite humano. Sem isso não se promoverá artefato à produção.
