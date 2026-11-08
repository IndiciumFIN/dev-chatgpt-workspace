---
document_id: WUTRIB-DOC-PLAN-AGENTS-NORM-001
version: 0.1.0
status: DRAFT
wo: WUTRIB-WO-PLAN-018
owner_role: QUALITY_ASSURANCE
reviewer_role: GOVERNANCE
aprover_role: PRODUCT_OWNER
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# Plano de Agentes Especializados Normativos — WU-TRIB

**Natureza:** PLANEJAMENTO. Não constitui execução, homologação ou aprovação.
**Premissa absoluta:** Tudo nasce com base em normativo ou em documentação que suporta o normativo (quando a norma possui direitos autorais). Nada é promovido para a próxima fase sem evidência normativa ou de suporte. Status permanece DRAFT/HOLD até revisão humana.
**Base:** Findings anteriores (FIND-PLAN-01 a FIND-PLAN-04) e inventário normativo completo.

## 1. Objetivo

Criar um time de agentes especializados (determinísticos, Node.js, exit code + JSON) que executem no GitHub (Actions) as pendências necessárias: geração de engines, schemas, validadores, dicionários, metamodelos e artefatos de suporte, sempre ancorados em normativo ou documentação de suporte. Demonstrar aderência a COSO, COSO ERM, COBIT e demais frameworks citados, com estudo de especializações, provas e testes comprovados antes de qualquer operação.

## 2. Time de agentes e qualificações

| Agente | Especialização | Normativos / Frameworks de suporte | Qualificação mínima exigida | Prova antes de operação |
|--------|----------------|-------------------------------------|-------------------------------|-------------------------|
| **normative-catalog.mjs** | Catálogo e aplicabilidade normativa | ISO 15489, 12207, FONTES_E_NORMAS | Conhecimento de inventário de fontes oficiais e status TO_ASSESS | Teste de estrutura de catálogo + ausência de cópia integral de norma proprietária |
| **metamodel-generator.mjs** | Geração de metamodelo e MOF | MOF, tabelas estruturais (SF1/SF2/SFT, SX2/SX3/SIX), D009 | Especialização em modelagem de entidades fiscais e versionamento | Schema JSON gerado + validação de integridade referencial |
| **dictionary-generator.mjs** | Dicionário canônico e master data | D010, field-dictionary, CFOP/NCM/CST/TES | Especialização em proveniência e vigência de campos | Dicionário com tipo, escala, vigência e fonte |
| **layout-engine.mjs** | Engines de leiaute SPED e XML | Guia Prático EFD, XSD NF-e, MOC | Especialização em parsers versionados por COD_VER / pacote | Parser de estrutura + testes positivos/negativos de layout |
| **crosscheck-engine.mjs** | Motor de cruzamento fiscal | SPED × XML × ERP, regras de vigência | Especialização em cruzamentos determinísticos sem conclusão fiscal | Testes de diferença, ausência e fail-closed |
| **security-controls.mjs** | Controles de segurança | ISO/IEC 27001:2022, 27002:2022, OWASP ASVS | Especialização em controles aplicáveis a dados fiscais | Checklist de controles + evidência de fail-closed |
| **coso-cobit-mapper.mjs** | Mapeamento de controles | COSO Internal Control, COSO ERM, COBIT 2019 | Especialização em princípios e objetivos de controle | Matriz de mapeamento agente → princípio COSO / objetivo COBIT |
| **sampling-planner.mjs** | Planejamento de amostragem | NBC TA 530 / ISA 530 | Especialização em amostragem estatística e não estatística | Plano de amostragem com critério e risco residual |
| **meta-validator.mjs** (existente, estendido) | Meta-validação dos agentes | IIA, COSO Monitoring, ISO 42001 (se aplicável) | Especialização em determinismo e ausência de aprovação automática | Auto-validação + testes de regressão |
| **governance-gate.mjs** | Gates de promoção | Política documental, HOLD_HUMAN | Especialização em segregação e rastreabilidade | Verificação de status DRAFT e ausência de APPROVED automático |

**Estudo de especializações:** Cada agente deve documentar em seu cabeçalho a norma de referência, o princípio COSO ou objetivo COBIT que implementa, e a evidência de teste antes de ser marcado como operacional.

## 3. Aderência a COSO, COSO ERM, COBIT e demais

| Framework | Como o time demonstra aderência |
|-----------|-------------------------------------|
| COSO Internal Control | Cada agente implementa atividades de controle verificáveis (Control Activities). Mapeamento explícito. |
| COSO ERM | Registro obrigatório de risco residual e tratamento em todo artefato gerado. |
| COBIT 2019 | Alinhamento a objetivos de TI (integridade, rastreabilidade, segurança). |
| IIA Standards | Evidências reproduzíveis, independência e disclaimers. |
| ISO 27001/27002 | Controles de segurança aplicáveis documentados pelo agente de segurança. |
| NBC TA 530 | Planejamento de amostragem formal quando aplicável. |

## 4. Processo de criação e operação

1. Agente gera artefato (schema, engine, dicionário, validador) **somente** a partir de normativo ou documentação de suporte.
2. Artefato nasce com status TEMPLATE ou DRAFT e `approved_by: NONE`.
3. Meta-validador e governance-gate executam testes comprovados.
4. Somente após PASS do meta-validador + revisão humana o artefato pode ser considerado candidato.
5. Nada é promovido automaticamente. HOLD_HUMAN permanece.

## 5. Gates obrigatórios antes de operação

- **G-AG-01**: Agente criado, documentado com especialização e mapeamento COSO/COBIT.
- **G-AG-02**: Testes comprovados (positivos, negativos, fail-closed) executados e versionados.
- **G-AG-03**: Meta-validação PASS.
- **G-AG-04**: Revisão humana de QA + Governança.
- **G-AG-05**: Autorização explícita para uso em operação.

## 6. Premissa de direitos autorais

Normas proprietárias (ISO, IIA, TOTVS, etc.) não são copiadas integralmente. Agentes utilizam apenas metadados, sínteses originais e referências. Documentação de suporte é gerada de forma original.

## 7. Riscos residuais e tratamento

- Risco de geração incompleta: tratado por meta-validação e gate humano.
- Risco de aprovação automática: bloqueado por governance-gate e disclaimers.
- Risco residual registrado segundo COSO ERM em cada artefato.

**Status:** DRAFT / HOLD_HUMAN. Execução dos agentes não autorizada até aprovação deste plano e dos gates.
