---
document_id: WUTRIB-DOC-004
document_type: ARTIFACT_TEMPLATE
version: 0.1.0
status: TEMPLATE
wo: WUTRIB-WO-PLAN-018
gate: G01
owner_role: RISK_CONTROLS
reviewer_role: INTERNAL_AUDIT
approver_role: DOMAIN_APPROVER_TO_ASSIGN
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# Matriz de riscos e controles RCM

**ID:** `WUTRIB-DOC-004` · **Versão:** `0.1.0` · **Gate:** `G01` · **Estado:** `TEMPLATE` · **Escopo de aplicação:** PILOT_SYNTHETIC, ENTERPRISE_FISCAL.

> **Controle:** modelo documental criado, porém **NÃO PREENCHIDO, NÃO VERIFICADO, NÃO ASSINADO**. Cada dado, classificação e decisão deve ser comprovado. É proibido converter placeholders em `PASS` ou `APPROVED` por automação.

## 1. Objetivo e fronteira

Matriz de riscos e controles RCM no projeto **WU-TRIB**, com preservação de origem, histórico e prova de decisões. O escopo atual abrange uma demonstração sintética no navegador e uma plataforma fiscal corporativa futura **somente onde explicitamente aplicável**. Não transferir aceites entre essas duas trilhas. Critério de aplicação: `PILOT_SYNTHETIC / ENTERPRISE_FISCAL`.

## 2. Entradas e precedências obrigatórias

- WO `WUTRIB-WO-PLAN-018`, gate `G01` e registro em `registro-documental.v1.json`.
- [Política documental](../POLITICA_GESTAO_DOCUMENTAL.md) e [plano mestre](../PLANO_MESTRE_DO_CICLO.md), com controle de versões.
- Requisito/risco/controle/caso de teste correspondente: **PENDENTE DE MAPEAMENTO**.
- Autor nominal, revisor independente, aprovação por alçada e data: **PENDENTES**.
- Classificação dos dados, fontes, período/vigência e responsabilidade legal: **PENDENTES**.

## 3. Conteúdo mínimo e checklist verificável

| # | Item obrigatório | Estado | Evidência necessária |
|---:|---|---|---|
| 1 | Processo objetivo e risco inerente | **PENDENTE** | Referência, autor, versão, hash e data a registrar |
| 2 | risco de distorção fiscal e vazamento | **PENDENTE** | Referência, autor, versão, hash e data a registrar |
| 3 | controle preventivo ou detectivo e executor | **PENDENTE** | Referência, autor, versão, hash e data a registrar |
| 4 | frequência evidência e método de teste | **PENDENTE** | Referência, autor, versão, hash e data a registrar |

Para cada item: definir procedimento, dados de entrada, oráculo/critério quando aplicável, exceções, risco, revisor, data/hora, versão, commit imutável e evidência SHA-256 calculada sobre arquivo real. Uma referência sem verificação não deve ser classificada como fato.

## 4. Critério de aceitação específico

Todo risco P0 tem controle, plano e responsável ou HOLD. **Estado inicial: HOLD_HUMAN** até comprovação e revisão formal. Falha ou evidência ausente bloqueia a etapa pertinente; `N/A` exige justificativa e aprovador.

## 5. Material preexistente a reconciliar, sem sobrescrever

- Nenhuma evidência preexistente formalmente reconciliada; preencher após inventário.

Esses vínculos não representam conteúdo migrado, versão reconciliada ou aceitação. A documentação antiga é mantida por sua trilha original.

## 6. Referências de desenho e responsabilidade normativa

- `IIA_GIAS_2025` — metadados em [registro normativo](../referencias-normativas.v1.json); aplicabilidade e edição a confirmar pelo dono da norma.

Normas e guias externos são metadados de referência. Não copiar integralmente material licenciado e não atribuir a um guia um requisito que não foi conferido na edição.

## 7. Controle de evidência e rastreabilidade

| Campo | Situação |
|---|---|
| WO e tarefa homóloga | `WUTRIB-WO-PLAN-018` / **TASK_ID_PENDENTE** |
| Requisito e controle | **REQ_ID_PENDENTE / CTRL_ID_PENDENTE** |
| Identificador de teste e execução | **CASE_ID_PENDENTE / RUN_ID_PENDENTE** |
| Fontes e versões | **PENDENTE DE HOMOLOGAÇÃO** |
| Ambiente, build e Git commit SHA | **PENDENTE** |
| Link de evidência com hash de conteúdo real | **PENDENTE** |
| Achado, exceção e reteste | **PENDENTE** |
| Parecer, alçada e assinatura verificável | **PENDENTE** |

## 8. Histórico, revisão e decisão

| Versão | Situação | Descrição | Autor da revisão |
|---|---|---|---|
| 0.1.0 | TEMPLATE | Criação do modelo para planejar e registrar futuras avaliações | PMO documental (papel, não assinatura) |

**Próxima decisão:** preenchimento, análise de aplicabilidade e revisão independente. **Sem autorização de produção e sem homologação.**
