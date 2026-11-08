---
document_id: WUTRIB-DOC-AUD-SYS-001
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

# Auditoria de Sistemas e Auditorias Complementares — WU-TRIB

**Natureza:** Diagnóstico independente READ_ONLY. Não utiliza validadores. Não constitui homologação, aprovação ou conclusão de conformidade fiscal.
**Escopo:** branches `wutrib/docs-governance-20261108`, `wutrib/audit-integral-20261108`, `wutrib/demo-persistence-v04-20261108`, `wutrib/web-pilot-20261108`.
**Data de referência:** 2026-11-08.
**Status:** DRAFT / HOLD_HUMAN.

## 1. Objetivo

Avaliar se a lógica do sistema reflete os normativos fiscais pertinentes (SPED, XML/NF-e, MOF/metamodelos, dicionários, tabelas estruturais e master data), além de auditorias complementares de segurança, acessibilidade, controles e rastreabilidade.

## 2. Auditoria de Sistemas — Lógica fiscal

### 2.1 Motor de cruzamento (`src/audit.js`)

| Elemento | Implementado | Normativo exigido | Aderência |
|----------|--------------|-------------------|-----------|
| XML NF-e | Parse sintático (chave, nNF, vNF, itens básicos). Bloqueio DTD. | XSD oficial + MOC + regras de negócio por pacote | Baixa |
| EFD ICMS/IPI | Extração parcial de C100 + verificação de 0000 | Guia Prático completo por COD_VER, blocos e validações | Baixa |
| Cruzamento | Chave + valor (tolerância R$ 0,01) | XML × EFD × ERP com vigência, CFOP, CST, TES/FISA170 | Baixa |
| Conformidade | `fiscalConformity: NOT_EVALUATED` em todos os findings | — | Correto |

**Conclusão:** Cruzamento estrutural de demonstração. Não reflete leiautes oficiais.

### 2.2 Metamodelos, dicionários e MOF

- Snapshot físico do schema `wutrib` existe (`physical-metamodel.audit.v1.json`), com semântica `NOT_HOMOLOGATED`.
- Dicionário de campos físicos parcial; mapeamento TOTVS ausente.
- Templates D009 (Metamodelo) e D010 (Dicionário) existem, conteúdo PENDENTE.
- **MOF / tabelas estruturais (SF1/SF2/SF3/SFT, SX2/SX3/SIX, FISA170):** não mapeados, sem versionamento por vigência.

### 2.3 Master data

Ausentes: CFOP, NCM, CST/CSOSN, TES, naturezas, participantes, produtos, alíquotas por vigência/UF.

## 3. Auditorias complementares

| Domínio | Situação | Status |
|---------|----------|--------|
| Segurança / Isolamento | RLS sem políticas públicas, SECURITY INVOKER, fail-closed, isolamento por organização | Parcial / HOLD |
| Acessibilidade (WCAG 2.2) | Falhas graves de contraste documentadas (AUD-017) | Não aderente |
| Controles (COSO / COBIT / ERM) | Ausentes nas branches de escopo | Não aderente |
| Rastreabilidade | Findings com ID estável; `runId` usa Date.now() (não determinístico) | Parcial |
| Capacidade | Testada sinteticamente até 35k C100; UI sem virtualização | HOLD |

## 4. Matriz de aderência consolidada

| Domínio | Reflete o normativo? | Risco residual |
|---------|----------------------|----------------|
| SPED (leiaute completo) | Não | Alto |
| XML NF-e (XSD + MOC) | Não | Alto |
| MOF / Tabelas estruturais / Dicionários | Não | Alto |
| Master data | Não | Alto |
| Cruzamento fiscal real | Não | Alto |
| COSO / COBIT | Não | Alto |
| WCAG 2.2 | Não | Médio |
| Segurança (piloto) | Parcial | Médio |
| Governança documental | Sim (estrutural) | Baixo |

## 5. Conclusões e recomendações

1. A lógica atual **não reflete** os normativos fiscais pertinentes. É um cruzamento estrutural de demonstração.
2. Os disclaimers e o status `NOT_EVALUATED` estão corretos e devem ser mantidos.
3. **Recomendação principal:** Formalizar metamodelo semântico versionado (MOF + dicionários + master data + leiautes oficiais por vigência) antes de qualquer evolução do motor.
4. Manter modo `DEMONSTRATION_CLIENT_ONLY` até que os gaps P0 sejam endereçados com evidência e revisão humana.

**Condição:** Nenhuma conformidade fiscal foi concluída. Nenhuma aprovação foi registrada. Este documento é DRAFT.
