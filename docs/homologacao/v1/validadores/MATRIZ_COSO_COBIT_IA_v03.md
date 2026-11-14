# Matriz de rastreabilidade — Riscos, controles, validadores e normas

**Versão:** 0.3.0 · **Situação:** DRAFT · **WO:** WUTRIB-WO-PLAN-018 · **Escopo:** somente planejamento.

Este quadro deriva do catálogo versionado JSON. As referências normativas são resolvidas pelo registro canônico [referencias-normativas.v1.json](../referencias-normativas.v1.json), agora com 33 entradas. A lista de fontes embutida no catálogo de validadores é uma fotografia de elaboração descontinuada, não segunda fonte de autoridade. **COSO P e COBIT objetivos são MAPEAMENTOS CANDIDATOS**, não certificação nem interpretação literal do texto integral das normas. Revisar a aplicabilidade e o licenciamento antes de descrever um princípio como controle adotado.

## Objetivos de controle e evidência, sem confundir a função dos frameworks

- COSO ICIF 2013: objetivo de controles internos, riscos, desenho/monitoramento (referência ao conjunto de cinco componentes/17 princípios).
- COSO ERM 2017: riscos residuais, apetite e tratamento; a decisão de aceitar risco pertence a autoridade humana.
- COSO GenAI 2026: orientação suplementar para riscos de IA generativa (não é substituto da governança de software tradicional).
- COBIT 2019: objetivos selecionados da governança TI; um ID no registro não comprova processo operando.
- IIA Global Internal Audit Standards: independência, julgamento e prova do trabalho de auditoria, quando realizado por função de auditoria.
- AI: ISO/IEC 42001 e ISO/IEC 23894 e 42005, NIST AI RMF 1.0 e AI 600-1, apenas se existir componente de IA identificado no inventário; scripts Node determinísticos não se tornam IA por sua finalidade.

## Mapeamento proposto por validador

| ID | Validador | Camada | COSO ICIF (candidato) | COBIT 2019 (candidato) | Fontes complementares | Gate |
|---|---|---|---|---|---|---|
| WUTRIB-VAL-001 | WO admission and lifecycle states | GOVERNANCE | P5, P12, P16 | BAI06, MEA02 | COSO_ICIF_2013, COBIT_2019, ISO29119_3_2021 | PLANEJADO / HOLD |
| WUTRIB-VAL-002 | Normative provenance and version applicability | GOVERNANCE | P7, P13 | MEA03, APO12 | COSO_ICIF_2013, SPED_EFD_324, NFE_MOC | PLANEJADO / HOLD |
| WUTRIB-VAL-003 | RCM risk-to-control completeness | GOVERNANCE | P6, P7, P10 | EDM03, APO12, MEA02 | COSO_ICIF_2013, COSO_ERM_2017, COBIT_2019 | PLANEJADO / HOLD |
| WUTRIB-VAL-004 | Versioned document integrity | GOVERNANCE | P13, P16 | BAI10, MEA04 | ISO29119_3_2021, COBIT_2019 | PLANEJADO / HOLD |
| WUTRIB-VAL-005 | Evidence custody and independent review | GOVERNANCE | P13, P16, P17 | MEA04, MEA02 | IIA_GIAS_2025, NBC_TA_500, COSO_ICIF_2013 | PLANEJADO / HOLD |
| WUTRIB-VAL-006 | OMG MOF metamodel compatibility | DATA | P11, P13 | APO14, BAI10 | OMG_MOF_251, COBIT_2019, ISO38505_1_2026 | PLANEJADO / HOLD |
| WUTRIB-VAL-007 | Protheus SX2/SX3/SIX dictionary mapping | DATA | P11, P13 | APO14, BAI10 | TOTVS_FISA170, COBIT_2019 | PLANEJADO / HOLD |
| WUTRIB-VAL-008 | Master data validity and effective dates | DATA | P10, P13 | APO14, DSS06 | COBIT_2019, ISO25010_2023, ISO8000_61_2016, ISO25012_2008, ISO38505_1_2026 | PLANEJADO / HOLD |
| WUTRIB-VAL-009 | Fiscal structural tables and keys | DATA | P10, P11 | APO14, BAI10 | TOTVS_FISA170, COBIT_2019, ISO25012_2008 | PLANEJADO / HOLD |
| WUTRIB-VAL-010 | End-to-end lineage provenance | DATA | P13, P16 | APO14, MEA04 | COSO_ICIF_2013, COBIT_2019, ISO25012_2008 | PLANEJADO / HOLD |
| WUTRIB-VAL-011 | EFD layout and COD_VER | FISCAL | P10, P13 | MEA03, DSS06 | SPED_EFD_324, COSO_ICIF_2013 | PLANEJADO / HOLD |
| WUTRIB-VAL-012 | NF-e MOC XSD and key check digit | FISCAL | P10, P13 | MEA03, DSS06 | NFE_MOC, COSO_ICIF_2013 | PLANEJADO / HOLD |
| WUTRIB-VAL-013 | Rule validity and precedence by date | FISCAL | P7, P10 | MEA03, APO12 | SPED_EFD_324, TOTVS_FISA170, COSO_ERM_2017 | PLANEJADO / HOLD |
| WUTRIB-VAL-014 | XML EFD ERP and master data reconciliation | FISCAL | P10, P13 | DSS06, MEA04 | SPED_EFD_324, NFE_MOC, TOTVS_FISA170 | PLANEJADO / HOLD |
| WUTRIB-VAL-015 | Sampling design and reproducibility | AUDIT | P7, P10 | MEA04, APO12 | NBC_TA_530, IIA_GIAS_2025, ISO29119_4_2021 | PLANEJADO / HOLD |
| WUTRIB-VAL-016 | Audit methodology and findings | AUDIT | P13, P16 | MEA04, MEA02 | IIA_GIAS_2025, NBC_TA_500, ISO29119_4_2021 | PLANEJADO / HOLD |
| WUTRIB-VAL-017 | IAM RBAC tenant isolation | SECURITY | P10, P11 | APO13, DSS05 | OWASP_ASVS_5, COSO_ICIF_2013 | PLANEJADO / HOLD |
| WUTRIB-VAL-018 | Ingestion threat and malicious inputs | SECURITY | P10, P11 | DSS05, APO13 | OWASP_ASVS_5, COBIT_2019 | PLANEJADO / HOLD |
| WUTRIB-VAL-019 | Supply chain and safe changes | SECURITY | P11, P16 | BAI06, BAI10 | OWASP_ASVS_5, COBIT_2019 | PLANEJADO / HOLD |
| WUTRIB-VAL-020 | Data protection and retention | SECURITY | P12, P13 | APO14, APO13 | OWASP_ASVS_5, COBIT_2019 | PLANEJADO / HOLD |
| WUTRIB-VAL-021 | Capacity and resource limits | QUALITY | P10, P16 | DSS01, MEA01 | ISO25010_2023, COBIT_2019 | PLANEJADO / HOLD |
| WUTRIB-VAL-022 | Accessibility automated and manual | QUALITY | P12, P16 | MEA04, APO11 | WCAG22, ISO25010_2023 | PLANEJADO / HOLD |
| WUTRIB-VAL-023 | Software sustainability and carbon method | QUALITY | P7, P13 | EDM03, APO11 | COSO_ERM_2017, COBIT_2019 | PLANEJADO / HOLD |
| WUTRIB-VAL-024 | Continuity backups and recoverability | QUALITY | P10, P16 | DSS04, DSS01 | COBIT_2019, ISO25010_2023 | PLANEJADO / HOLD |
| WUTRIB-VAL-025 | AI use-case and model inventory | AI_OPTIONAL | P7, P13 | APO12, APO14 | ISO_42001_2023, NIST_AIRMF_1, ISO_42005_2025 | CONDICIONAL / HOLD |
| WUTRIB-VAL-026 | Grounding and factual claim validator | AI_OPTIONAL | P10, P13 | APO11, MEA04 | ISO_23894_2023, ISO_5259_2_2024, NIST_AIRMF_1 | CONDICIONAL / HOLD |
| WUTRIB-VAL-027 | Prompt injection and model abuse | AI_OPTIONAL | P10, P11 | APO13, DSS05 | COSO_GENAI_2026, NIST_AI_600_1, OWASP_ASVS_5 | CONDICIONAL / HOLD |
| WUTRIB-VAL-028 | AI impact drift and human veto | AI_OPTIONAL | P7, P16, P17 | EDM03, MEA04 | ISO_42001_2023, ISO_42005_2025, ISO_5338_2023 | CONDICIONAL / HOLD |

## Requisitos de conexão real com a WO e RCM

Cada entrada deve receber, antes de ser considerada válida: RISK-ID, CONTROL-ID, REQ-ID, proprietário, justificativa de princípio COSO/objetivo COBIT, regra e oráculo independente, fonte e edição, versão de schema/ERP, casos positivos e adversariais, evidência assinável, risco residual e revisor. Esses IDs ainda não estão preenchidos: não se pode alegar que os validadores cobrem o framework.

## Exceções e atualização de escopo

- Se alguma norma não for aplicável, registrar N/A com justificativa e aprovação humana. Não inventar exigência legal para padrões de boas práticas.
- Para qualquer validador fiscal, a norma tributária específica aplicável por vigência e leiaute é referência para verificação de conteúdo; COSO/COBIT fornecem o quadro de controle, não o cálculo.
- 'MOF' deve estar qualificado como OMG Meta Object Facility versus Manual de Orientação Fiscal (nome informal no texto do anexo); não compartilhar metadados normativos entre eles.
- Os quatro documentos D051 lógica, D052 métodos, D053 amostragem e D054 matriz de métodos permanecem PROPOSTOS, não cadastrados no registro de 50 templates até validação da extensão do catálogo.

## Status da revisão

Responsável: papel QUALITY_ASSURANCE. Revisão por GOVERNANCE/INTERNAL_AUDIT e especialistas fiscal e IA por aplicabilidade. Aprovação: NÃO REALIZADA. Versão 0.3.0 sem execução de scripts, testes fiscais ou publicação.
