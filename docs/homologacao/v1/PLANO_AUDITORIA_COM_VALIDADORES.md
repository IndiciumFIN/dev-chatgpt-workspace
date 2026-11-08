---
document_id: WUTRIB-DOC-PLAN-VALIDATORS-001
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

# Plano de Auditoria com Validadores Determinísticos — WU-TRIB

**Natureza:** PLANEJAMENTO. Não constitui execução de auditoria, homologação ou aprovação.
**Base de leitura exclusiva:** branches `wutrib/docs-governance-20261108` (PR #43), `wutrib/audit-integral-20261108` (PR #42), `wutrib/demo-persistence-v04-20261108` (PR #41) e `wutrib/web-pilot-20261108`.
**Status:** DRAFT / HOLD_HUMAN. Execução da auditoria integral **não autorizada** até aprovação explícita.

## 1. Objetivo

Planejar, criar e **validar os validadores** (auditores determinísticos) que serão usados em futura auditoria de governança documental e conformidade técnica, garantindo que eles próprios atendam aos critérios normativos técnicos aplicáveis **antes** de qualquer execução de auditoria de conteúdo ou sistema.

## 2. Critérios normativos técnicos aplicáveis (extraídos das branches)

Fontes catalogadas em `docs/homologacao/v1/FONTES_E_NORMAS.md` e política em `POLITICA_GESTAO_DOCUMENTAL.md`:

- **ISO/IEC/IEEE 12207:2026** e **15289:2019**: processos de ciclo de vida e conteúdo de itens de informação (identificação, versionamento, rastreabilidade).
- **ISO 15489-1:2016** e **ISO 10007:2017**: gestão de registros, configuração e baseline imutável.
- **ISO/IEC/IEEE 29119-2/-3:2021**: processos e documentação de testes (oráculos, evidências, cobertura).
- **ISO/IEC 25010:2023** e **25040:2024**: características de qualidade e framework de avaliação.
- **ISO/IEC 27001:2022**: segurança da informação (menor privilégio, integridade).
- **W3C WCAG 2.2** + **WCAG-EM**: acessibilidade (já parcialmente coberta por agentes existentes).
- **OWASP ASVS 5.0**: requisitos verificáveis de segurança.
- **IIA Global Internal Audit Standards (2024)**: evidências, independência, relatórios rastreáveis.
- **ANPD / LGPD**: tratamento de dados (não aplicável a validadores documentais puros).
- **SPED / TOTVS**: referências fiscais (validadores **não** concluem conformidade fiscal).

**Regra absoluta:** validadores não reproduzem normas proprietárias, não decidem conformidade fiscal, não assinam homologação e não alteram status de documentos para APPROVED.

## 3. Validadores existentes (baseline)

| Validador | Escopo | Atende critérios? | Observação |
|-----------|--------|-------------------|------------|
| `scripts/check-wutrib-docs.mjs` | Integridade documental (IDs, frontmatter, paths, hashes, status TEMPLATE/DRAFT, approved_by NONE) | Parcial (estrutura) | Já implementado; alinhado a ISO 15489/10007. Não valida conteúdo semântico. |
| Agentes em `agents/` (`fiscal-contract`, `security`, `ux-accessibility`, `triage`, `release`, `persistence`, `requirements`) | Contratos, segurança, UX, release do piloto | Parcial | Determinísticos, exit code 1, JSON; não cobrem governança documental completa. |

## 4. Novos validadores propostos (a criar e validar)

1. **doc-governance.mjs** — Extensão de integridade: verifica política de status, segregação de funções (autor ≠ aprovador), presença de fontes, ausência de sign-off fictício.
2. **normative-applicability.mjs** — Confere catálogo de normas: URLs HTTPS, status TO_ASSESS, verifiedDocumentBody=false, ausência de cópia integral.
3. **traceability.mjs** — Verifica cadeia WO → documento → gate → dependências no registro.
4. **meta-validator.mjs** — Valida os próprios auditores: determinismo, ausência de rede/segredos/IA generativa, estrutura de checks, exit codes, alinhamento a IIA (evidência reproduzível).

Todos devem:
- Ser scripts Node puros (sem dependências externas).
- Retornar JSON estruturado com IDs estáveis.
- Exit code 0 = PASS, 1 = FAIL.
- Não fazer chamadas de rede.
- Incluir testes de auto-validação.

## 5. Processo de validação dos auditores (antes da auditoria)

1. Criar os scripts e um runner `scripts/validate-validators.mjs`.
2. Executar localmente ou em CI: `node scripts/validate-validators.mjs`.
3. Critérios de aceite do validador:
   - Passa seus próprios checks de meta-validação.
   - Não contém strings de aprovação automática ("APPROVED", "CONFORME", "PASS FISCAL").
   - Produz evidência de hash e timestamp.
   - Documentado em este plano.
4. Somente após PASS do meta-validador e revisão humana, os validadores podem ser usados em auditoria futura.

## 6. Escopo da futura auditoria (não executar agora)

- Integridade do catálogo de 50 modelos + 4 documentos de governança.
- Conformidade estrutural com política documental.
- Cobertura de gates G00–G10.
- Ausência de aprovações fictícias.
- Rastreabilidade de fontes.
- **Fora de escopo:** execução de testes de software, validação fiscal, deploy, preenchimento de templates, homologação humana.

## 7. Gates e autorização

- **G-VAL-01**: Validadores criados e auto-validados → HOLD até revisão.
- **G-VAL-02**: Revisão humana dos validadores (QA + Governança).
- **G-AUD-01**: Autorização explícita do usuário para executar auditoria documental.
- **NO MERGE / NO PROD / HUMAN SIGN-OFF REQUIRED** permanece.

## 8. Evidências e registro

Este documento e os scripts serão versionados nesta branch. Hash do conjunto será calculado após criação.

**Condição:** Nenhuma auditoria de conteúdo será executada sem autorização explícita. Este plano e os validadores são artefatos de planejamento.
