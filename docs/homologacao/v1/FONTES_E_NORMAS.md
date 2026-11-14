---
document_id: WUTRIB-DOC-NORMS-001
version: 0.2.0
status: DRAFT
wo: WUTRIB-WO-PLAN-018
owner_role: GOVERNANCE
reviewer_role: LEGAL_AND_QUALITY
approver_role: PRODUCT_OWNER
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# Registro normativo, edições e aplicabilidade — proposta

O escopo do conjunto documental é **WUTRIB**, não a empresa como um todo. A referência oficial identificada por consulta à página pública **não** implica acesso ao conteúdo integral da norma ou certificação de conformidade. As correspondências abaixo são **diretrizes de desenho** do sistema de documentação, sujeitas a avaliação jurídica e técnica da aplicabilidade.

| Fonte | Edição | Uso neste pacote | Link oficial | Natureza |
|---|---|---|---|---|
| ISO/IEC/IEEE 12207 | 2026 | Processos do ciclo de vida | https://www.iso.org/standard/90219.html | Referência |
| ISO/IEC/IEEE 15289 | 2019 | Conteúdo de itens documentais | https://www.iso.org/standard/74909.html | Referência; mapeia edições anteriores de 12207/15288 |
| ISO/IEC/IEEE 29119-2 | 2021 | Processos de teste | https://www.iso.org/standard/79428.html | Referência |
| ISO/IEC/IEEE 29119-3 | 2021 | Modelos de documentação de teste | https://www.iso.org/standard/79429.html | Referência |
| ISO/IEC 25010 | 2023 | 9 características de qualidade do produto | https://www.iso.org/standard/78176.html | Referência |
| ISO/IEC 25040 | 2024 | Framework de avaliação de qualidade | https://www.iso.org/standard/83467.html | Referência |
| ISO 15489-1 | 2016 | Captura e gestão de registros e metadados | https://www.iso.org/standard/62542.html | Referência |
| ISO 10007 | 2017 | Gestão de configuração e baseline | https://www.iso.org/standard/70400.html | Referência |
| ISO/IEC 27001 | 2022 + Amd 1:2024 | SGSI; risco e segurança | https://www.iso.org/standard/27001 | Referência |
| W3C WCAG 2.2 | Recommendation 2024-12 | Critérios de acessibilidade | https://www.w3.org/TR/WCAG22/ | Referência técnica |
| W3C WCAG-EM 2.0 | W3C Group Note 2026-07 | Metodologia de avaliação | https://www.w3.org/WAI/test-evaluate/conformance/wcag-em/ | Recomendação metodológica |
| OWASP ASVS | 5.0.0 (2025-05) | Requisitos verificáveis de segurança | https://asvs.owasp.org/ | Referência técnica |
| The IIA Global Internal Audit Standards | 2024; eficácia 2025-01 | Evidências, supervisão, relatórios | https://www.theiia.org/en/content/standards/complete-global-internal-audit-standards/ | Referência profissional |
| ANPD RIPD | página orientativa consultada em 2026-11 | Avaliação de necessidade de RIPD | https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/relatorio-de-impacto-a-protecao-de-dados-pessoais-ripd | Diretriz oficial |
| SPED EFD ICMS/IPI | Guia Prático 3.2.4 | Especificações fiscais por período e versão | https://www.gov.br/sped/pt-br/assuntos/comunicados/efd-icms-ipi/nova-versao-do-guia-pratico-da-efd-icms-ipi-2 | Fonte oficial; compatibilidade não testada |
| TOTVS FISA170 | artigos/release a verificar | Referência de tabelas e modo híbrido | https://centraldeatendimento.totvs.com/hc/pt-br/articles/35314721022103-Cross-Segmento-TOTVS-Backoffice-Linha-Protheus-FIS-FISA170-Quais-tabelas-fazem-parte-do-Configurador-de-Tributos | Fornecedor; esquema cliente não confirmado |

**Notas de cautela:**
- A ISO/IEC/IEEE 15289:2019 se refere explicitamente, em seu abstract, à 12207:2017. A adoção da **12207:2026** exige uma matriz de compatibilidade entre edições; não afirmar que o mapeamento antigo é integralmente idêntico ao novo.
- ISO/IEC 25010:2023 possui **9** características, enquanto o texto anterior com oito é histórico.
- WCAG-EM é metodologia, não certificado automático. Scanner aprovado não substitui testes com pessoas.
- A ANPD recomenda RIPD conforme risco e situações específicas; decidir aplicabilidade, não criar aprovação genérica.
- Para fiscalização, regra vinculada a **data de fato, vigência, região, tipo de documento, módulo e release ERP**, não apenas ao link mais recente.
- Normas ISO e conteúdo de fornecedor podem ter direitos/licenças; não embutir sua íntegra sem licença.

**Registro de proveniência editorial:** URLs e edições confirmadas quando acessíveis. Versões internas do produto não herdam a edição de uma norma. Revisão formal de pertinência por Jurídico, Fiscal e Qualidade: **HOLD_HUMAN**.


## Adendo v0.2.0 — governança, controles e metadados de validadores

As referências abaixo são **fontes de desenho e avaliação**, não prova de certificação, exigência legal universal ou licença de reprodução da íntegra. A lista estruturada e canônica está em referencias-normativas.v1.json (37 entradas).

| Referência | Edição verificada | Uso na proposta |
|---|---|---|
| COSO Internal Control Integrated Framework | 2013 | Controles, riscos, informações e monitoramento |
| COSO ERM Integrating with Strategy and Performance | 2017 | Risco residual, resposta e apetite |
| COSO Achieving Effective Internal Control Over Generative AI | 2026 | Controles específicos de IA generativa, **quando houver** |
| COBIT | 2019 | Objetivos selecionados de governança/gestão I&T |
| IIA Global Internal Audit Standards | Edição 2024, efetiva 2025 | Auditoria independente e qualidade das evidências |
| OMG Meta Object Facility | 2.5.1 | Metamodelagem opcional; distinto de manuais fiscais |
| ISO/IEC 42001 | 2023 | Sistema de gestão de IA, se aplicável |
| ISO/IEC 23894 | 2023 | Riscos específicos de IA, se aplicável |
| ISO/IEC 5338 | 2023 | Ciclo de vida de sistemas IA, se aplicável |
| ISO/IEC 42005 | 2025 | Impacto de sistemas IA, se aplicável |
| NIST AI RMF e GenAI Profile | 1.0 (2023) / AI 600-1 (2024) | Govern, Map, Measure, Manage e riscos de GenAI |
| ISO/IEC 5259-2 / 5259-5 | 2024 / 2025 | Qualidade/governança de dados para IA, condicional |
| ISO/IEC 25012 | 2008 (confirmada 2025) | Qualidade de dados estruturados |
| ISO 8000-61 | 2016 | Modelo de processos de gestão da qualidade dos dados |
| ISO/IEC 38505-1 | **2026** (substitui edição 2017) | Governança de dados |
| ISO/IEC/IEEE 29119-4 | 2021 | Técnicas de projeto de testes |

**Não misturar:** (a) auditoria interna / IIA, (b) IA = inteligência artificial, (c) OMG MOF 2.5.1, (d) manuais fiscais SPED/MOC. A aplicabilidade de NBC TA 500/530 deve ser avaliada em função do tipo de trabalho profissional. O uso de referência COSO/COBIT não produz sozinho conformidade, eficácia de controle ou aceite fiscal.

**Conteúdo e direitos:** metadados públicos foram consultados; o texto integral licenciado e o mapeamento detalhado de princípios ainda exigem revisão/autorizações. Gate atual: HOLD_HUMAN.
