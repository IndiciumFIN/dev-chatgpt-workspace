---
document_id: WUTRIB-V1-GATE-001
version: 1.0.0-rc.0
status: HOLD_HUMAN
wo_lineage: WUTRIB-WO-PLAN-018
approver_role: AUTHORIZED_PRODUCT_OWNER
approved_by: NONE
approved_at: NONE
---

# Checklist de encerramento da definição de escopo da V1

**Dois atos diferentes:** (A) **congelamento de escopo e contratos**; (B) **homologação do produto e release de software**. Este checklist é para o primeiro ato. Nenhuma assinatura eletrônica nem migração é feita por um script.

| Checklist para fechar escopo | Evidência solicitada | Situação em 08/11/2026 |
|---|---|---|
| F01 — propósito, usuário e uso pretendido | Parecer de escopo, restrição de auditoria assistida | PROPOSTO |
| F02 — origem e reconciliação R1/R2 | Dois SHA originais, 39 macrotemas, decisões por função | DOCUMENTADO |
| F03 — inventário original saneado | Verificação humana da correção dos 21 campos deslocados | HOLD_HUMAN |
| F04 — fronteiras de V1 | 13 mínimos, 5 limitados, 4 posteriores, datas/UF/release | DOCUMENTADO / HOLD_HUMAN |
| F05 — modelo de cinco ledgers | Revisão de contratos, temporalidade e granularidade | HOLD_HUMAN |
| F06 — normas e fontes para requisitos V1 | EFD/NF-e/TOTVS por vigência/edição/licença | HOLD_HUMAN |
| F07 — segurança e privacidade | Contrato tenant/identidade, classificação, LGPD | HOLD_HUMAN |
| F08 — RCM, RTM e autorização de validadores | Revisão independente da PR47, riscos P0 e meta-validadores | HOLD_HUMAN |
| F09 — escopo de UX/a11y/SCI/capacidade | Planos mensuráveis, critérios de UAT e SLO antes de execução | HOLD_HUMAN |
| F10 — política de mudança e versões | WO/tarefa, análise de impacto, novas revisões, sign-off | DOCUMENTADO / HOLD_HUMAN |
| F11 — revisão cruzada de especialidades | Fiscal, Protheus, Arquitetura de Dados, QA, Segurança, Produto | NOT_COMPLETED |
| F12 — assinatura do freeze de escopo | owner habilitado, data, commit, escopo aceito e ressalvas | NOT_SIGNED |

**Se F03, F04, F05, F06, F08 ou F12 estiverem ausentes:** o documento permanece `1.0.0-rc.0`. Não emitir tag de escopo V1.0.0, não declarar “pronto”. Pontos não pertinentes exigem `N/A` fundamentado e aceito por pessoa com alçada.

## Gate separado de software — não executar agora

A homologação de produto seguirá os **30 grupos de testes futuros** e os sete gates de [MATRIZ_DE_TESTES_E_GATES_V1.json](MATRIZ_DE_TESTES_E_GATES_V1.json), em ambiente autorizado, com golden cases independentes, meta-validação, integração/segurança/tenancy, a11y e UAT manuais, capacidade e restauração, risco residual e termo Go/No-Go. **Todos os testes continuam NOT_RUN.**

## Termo de freeze de escopo — ainda não preenchido

- Versão candidata: 1.0.0-rc.0
- Git commit do pacote: **a registrar na aprovação**, não inventar hash antecipado.
- Autoridade decisória: **não identificada por assinatura nesta revisão**.
- Escopo: WU-TRIB somente; referência ao produto clínico apenas para isolamento.
- Aceite da versão: **NÃO EMITIDO**.
- Aprovação de testes/implantação/produção: **NÃO EMITIDA**.

## Impedimentos concretos

A correção do catálogo, embora logicamente reconstruível, não foi revisada por owner de domínio. Faltam corpus normativo e golden cases aprovados, autorização de eventual ERP real, medição de capacidade, acessibilidade e validação dos próprios auditores. Não usar o estado de documentos como percentual de software pronto.

**Saída:** SCOPE_FREEZE_CANDIDATE; NO-GO para execução e implantação.
