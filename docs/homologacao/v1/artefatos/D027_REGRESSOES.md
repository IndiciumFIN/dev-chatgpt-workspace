---
document_id: WUTRIB-DOC-027
document_type: ARTIFACT_TEMPLATE
version: 0.1.0
status: TEMPLATE
wo: WUTRIB-WO-PLAN-018
gate: G04
owner_role: QUALITY_ASSURANCE
reviewer_role: SYSTEM_ARCHITECT
approver_role: DOMAIN_APPROVER_TO_ASSIGN
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# Registro de retestes, regressão e cobertura

**ID:** `WUTRIB-DOC-027` · **Versão:** `0.1.0` · **Gate:** `G04` · **Estado:** TEMPLATE. **Aplicabilidade:** PILOT_SYNTHETIC / ENTERPRISE_FISCAL.

> O presente arquivo é um **modelo preenchível, não uma evidência executada ou aprovada**. A execução das verificações do WU-TRIB permanece NÃO AUTORIZADA nesta WO documental. Não existe sign-off.

## 1. Objetivo e critério de pertinência
Formalizar registro de retestes, regressão e cobertura no âmbito do WU-TRIB: o piloto demonstrativo somente com fixtures e, quando aplicável, a plataforma fiscal empresarial dependente de fontes normativas e dados autorizados. No manifesto, este documento pertence ao `G04` e à WO `WUTRIB-WO-PLAN-018`. Decisão sobre aplicabilidade do produto, empresa e release: **PENDENTE**.

## 2. Condições de entrada
- WO e tarefa homóloga, owner nominal, revisor independente, autoridade de aceite e justificativa: **PENDENTES**.
- [Plano mestre](../PLANO_MESTRE_DO_CICLO.md), [política](../POLITICA_GESTAO_DOCUMENTAL.md), requisito e risco associado.
- Delimitar origem/proveniência, versões, vigência, ambientes e dados permitidos; **não importar dados reais em demonstração sintética**.
- Documentar `FATO`, `HIPÓTESE`, `INFERÊNCIA`, `CONFLITO` e `HOLD_HUMAN` separadamente.

## 3. Matriz mínima de conteúdo verificável
| Item | Elemento específico do artefato | Estado | Critério de prova |
|---:|---|---|---|
| 1 | Caso anterior e baseline | PENDENTE | Fonte/versão/evidência/assinatura a registrar |
| 2 |  teste de correção e efeitos colaterais | PENDENTE | Fonte/versão/evidência/assinatura a registrar |
| 3 |  métricas de alteração por commit | PENDENTE | Fonte/versão/evidência/assinatura a registrar |
| 4 |  status do CI e análise de drift | PENDENTE | Fonte/versão/evidência/assinatura a registrar |

A preencher por elemento: entrada e método; resultado/decisão esperados antes da verificação; identificadores de caso/controle; arquivo e hash íntegros; executor; timestamp; ambiente; versão de ferramenta/norma; resultado observado; exceção e reteste. Resultados não executados são `NOT_RUN`, jamais `PASS`.

## 4. Critério proposto de aceite
**Reteste no mesmo escopo e versão exigido para passar FAIL a PASS.** Não marcar como concluído sem revisão humana dos critérios, evidência reprodutível e vínculo à baseline imutável. Em caso de conteúdo insuficiente ou normativos conflitantes, classificar `HOLD_HUMAN` e abrir ou vincular um FIND na WO.

## 5. Baseline e documentos existentes (não sobrescrever)
- `tests/regression_v021.test.mjs` — referência histórica, não homologação.
A conciliação entre documento herdado e modelo canônico requer registro de versão, diferenças semânticas, owner, riscos, evidências de aceitação e justificativa de substituição. Nenhum documento histórico é renomeado ou apagado automaticamente.

## 6. Fontes externas registradas
- `ISO29119_3_2021` — referência por metadados em [normativos](../referencias-normativas.v1.json); edição e uso sujeitos a confirmação do dono do controle.

Não reproduzir conteúdo de norma licenciada, nem presumir que sua simples citação caracteriza conformidade.

## 7. Cadeia de evidências e homologação
| Campo | Valor atual |
|---|---|
| WO/tarefa | `WUTRIB-WO-PLAN-018` / TASK_PENDENTE |
| Risco/requisito/controle | PENDENTE |
| Casos de teste/executor/ambiente | NOT_RUN |
| Build e commit SHA imutáveis | PENDENTE |
| Evidência/URL/hash calculado | PENDENTE |
| Defeitos/retestes | PENDENTE |
| Revisão técnica independente | PENDENTE |
| Aprovador, assinatura e data/hora | PENDENTE |

## 8. Histórico de versão e decisões
| Versão | Registro | Estado |
|---|---|---|
| 0.1.0 | Instanciação documental na branch de planejamento | TEMPLATE |

**Estado de saída:** HOLD até preenchimento, revisão, confirmação de aplicabilidade e aceite, sem liberação da aplicação.
