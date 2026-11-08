---
document_id: WUTRIB-DOC-PLAN-VALIDATORS-001
version: 0.2.0
status: DRAFT
wo: WUTRIB-WO-PLAN-018
owner_role: QUALITY_ASSURANCE
reviewer_role: GOVERNANCE
aprover_role: PRODUCT_OWNER
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# Plano de Auditoria com Validadores Determinísticos — WU-TRIB

**Natureza:** PLANEJAMENTO. Não constitui execução de auditoria, homologação ou aprovação.
**Base de leitura exclusiva:** branches `wutrib/docs-governance-20261108` (PR #43), `wutrib/audit-integral-20261108` (PR #42), `wutrib/demo-persistence-v04-20261108` (PR #41) e `wutrib/web-pilot-20261108`.
**Status:** DRAFT / HOLD_HUMAN. Execução da auditoria integral **não autorizada** até aprovação explícita.

## 1. Objetivo

Planejar, criar e **validar os validadores** (auditores determinísticos) que serão usados em futura auditoria de governança documental e conformidade técnica, garantindo que eles próprios atendam aos critérios normativos técnicos aplicáveis **antes** de qualquer execução de auditoria de conteúdo ou sistema.

## 2. Critérios normativos técnicos aplicáveis

### 2.1 Normas de ciclo de vida, qualidade e documentação (baseline)

- **ISO/IEC/IEEE 12207:2026** e **15289:2019**: processos de ciclo de vida e conteúdo de itens de informação.
- **ISO 15489-1:2016** e **ISO 10007:2017**: gestão de registros, configuração e baseline.
- **ISO/IEC/IEEE 29119-2/-3:2021**: processos e documentação de testes.
- **ISO/IEC 25010:2023** e **25040:2024**: características de qualidade e framework de avaliação.
- **ISO/IEC 27001:2022**: segurança da informação.
- **W3C WCAG 2.2** + **WCAG-EM**: acessibilidade.
- **OWASP ASVS 5.0**: requisitos verificáveis de segurança.
- **IIA Global Internal Audit Standards (2024)**: evidências, independência, relatórios rastreáveis.
- **NBC TA 530 / ISA 530**: amostragem em auditoria (quando aplicável).
- **SPED / TOTVS / MOF / dicionários (SX2/SX3/SIX)**: referências fiscais (validadores **não** concluem conformidade fiscal).

### 2.2 Frameworks de controles, risco e governança de TI/IA (suporte aos validadores)

Os validadores devem ser desenhados e avaliados com suporte explícito dos seguintes frameworks:

| Framework | Edição / Referência | Como suporta os validadores |
|-----------|-------------------|-----------------------------|
| **COSO Internal Control – Integrated Framework** | 2013 | Estrutura de 5 componentes e 17 princípios para desenho e avaliação de controles internos. Validadores implementam atividades de controle verificáveis. |
| **COSO ERM – Enterprise Risk Management** | 2017 | Integração de risco com estratégia e performance. Validadores devem registrar riscos residuais e tratamentos. |
| **COSO para Auditoria Interna** | Aplicação do framework COSO pela função de IA | Suporte à avaliação independente de controles. Validadores produzem evidências reproduzíveis para o auditor. |
| **COBIT** (Control Objectives for Information and Related Technologies) | 2019 | Governança e gestão de TI. Alinhamento de controles de TI aos objetivos de negócio. Validadores cobrem processos de TI relevantes (integridade, rastreabilidade, segurança). |
| **ISO/IEC 42001:2023** | AI Management System | (Quando agentes forem considerados sistemas de IA) Requisitos de gestão de sistemas de IA. Validadores determinísticos priorizam transparência e controle humano. |
| **NIST AI Risk Management Framework (AI RMF)** | 1.0 (2023) | Funções Govern, Map, Measure, Manage. Vocabulário de risco para sistemas automatizados. |

**Regra absoluta:** validadores não reproduzem normas proprietárias, não decidem conformidade fiscal, não assinam homologação e não alteram status de documentos para APPROVED. PASS de validador = evidência estrutural apenas.

## 3. Validadores existentes (baseline)

| Validador | Escopo | Atende critérios? | Observação |
|-----------|--------|-------------------|------------|
| `scripts/check-wutrib-docs.mjs` | Integridade documental (IDs, frontmatter, paths, hashes, status TEMPLATE/DRAFT, approved_by NONE) | Parcial (estrutura) | Alinhado a ISO 15489/10007 e COSO (atividades de controle). Não valida conteúdo semântico. |
| Agentes em `agents/` | Contratos, segurança, UX, release do piloto | Parcial | Determinísticos, exit code 1, JSON; alinhados a COBIT/ASVS em aspectos de TI. |

## 4. Novos validadores propostos (a criar e validar)

1. **doc-governance.mjs** — Extensão de integridade: política de status, segregação de funções, fontes, ausência de sign-off fictício. (Suporte COSO – Control Activities)
2. **normative-applicability.mjs** — Catálogo de normas: URLs HTTPS, status TO_ASSESS, verifiedDocumentBody=false. (Suporte COSO ERM – Risk Assessment)
3. **traceability.mjs** — Cadeia WO → documento → gate → dependências. (Suporte COSO – Information & Communication + COBIT)
4. **meta-validator.mjs** — Valida os próprios auditores: determinismo, ausência de rede/segredos/IA generativa, estrutura de checks, exit codes, evidência reproduzível. (Suporte IIA + COSO Monitoring + ISO 42001 se aplicável)

Todos devem:
- Ser scripts Node puros (sem dependências externas).
- Retornar JSON estruturado com IDs estáveis.
- Exit code 0 = PASS, 1 = FAIL.
- Não fazer chamadas de rede.
- Incluir testes de auto-validação.
- Mapear explicitamente para pelo menos um princípio COSO ou objetivo COBIT.

## 5. Processo de validação dos auditores (antes da auditoria)

1. Criar os scripts e um runner `scripts/validate-validators.mjs`.
2. Executar: `node scripts/validate-validators.mjs`.
3. Critérios de aceite do validador:
   - Passa seus próprios checks de meta-validação.
   - Não contém strings de aprovação automática ("APPROVED", "CONFORME", "PASS FISCAL").
   - Produz evidência de hash e timestamp.
   - Documentado em este plano e mapeado a COSO/COBIT.
   - Risco residual registrado.
4. Somente após PASS do meta-validador e revisão humana, os validadores podem ser usados em auditoria futura.

## 6. Escopo da futura auditoria (não executar agora)

- Integridade do catálogo de modelos + documentos de governança.
- Conformidade estrutural com política documental.
- Cobertura de gates.
- Ausência de aprovações fictícias.
- Rastreabilidade de fontes.
- Avaliação de controles segundo COSO / COBIT (estrutural).
- **Fora de escopo:** execução de testes de software, validação fiscal real, deploy, preenchimento de templates, homologação humana, conclusão de conformidade.

## 7. Gates e autorização

- **G-VAL-01**: Validadores criados e auto-validados → HOLD até revisão.
- **G-VAL-02**: Revisão humana dos validadores (QA + Governança).
- **G-AUD-01**: Autorização explícita do usuário para executar auditoria documental.
- **NO MERGE / NO PROD / HUMAN SIGN-OFF REQUIRED** permanece.

## 8. Evidências e registro

Este documento e os scripts serão versionados nesta branch. Hash do conjunto será calculado após criação.

**Condição:** Nenhuma auditoria de conteúdo será executada sem autorização explícita. Este plano e os validadores são artefatos de planejamento.

**Mapeamento residual:** Os validadores implementam atividades de controle (COSO) e objetivos de TI (COBIT). Eles não substituem a avaliação de risco (COSO ERM) nem o julgamento profissional do auditor interno.
