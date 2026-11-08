---
document_id: WUTRIB-DOC-043
document_type: ARTIFACT_TEMPLATE
version: 0.1.0
status: TEMPLATE
wo: WUTRIB-WO-PLAN-018
gate: G07
owner_role: PRODUCT_OWNER
reviewer_role: INTERNAL_AUDIT
approver_role: PRODUCT_OWNER_AND_REQUIRED_DOMAIN_APPROVERS
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# Termo de aceite e assinaturas independentes

**Documento** `WUTRIB-DOC-043` · **Versão** `0.1.0` · **Gate** `G07` · **Estado** `TEMPLATE`. **Trilha:** PILOT_SYNTHETIC / ENTERPRISE_FISCAL. O conteúdo é um modelo ainda **não preenchido**; não comprova testes, conformidade, autorização ou produção.

## 1. Objeto e escopo
Formalizar **Termo de aceite e assinaturas independentes** para o WU-TRIB, com identificação da trilha (demonstração sintética versus uso fiscal corporativo), responsáveis, normas, versões, critérios aprovados e evidências. Os objetivos do produto, usuários afetados e riscos reais devem ser ratificados pela WO.

## 2. Entradas e vínculos
- WO: `WUTRIB-WO-PLAN-018`; tarefa homóloga `PENDENTE`; marco de aprovação `G07`.
- Dono do conteúdo `PRODUCT_OWNER`; revisão independente `INTERNAL_AUDIT`; autoridade `PRODUCT_OWNER_AND_REQUIRED_DOMAIN_APPROVERS` (pessoa ainda não designada).
- Requisitos, riscos/controles RCM, metamodelo/contrato e versão dos recursos: **PENDENTES**.
- Uso de fixtures fictícias até autorização expressa para processar dados corporativos. Nenhum dado pessoal, token ou segredo neste Git.

## 3. Componentes e checklist específicos
| Requisito documental | Conteúdo a elaborar | Estado | Evidência |
|---:|---|---|---|
| 1 | Produto versão artefato e baseline | PENDENTE | ID, fonte, dado verificável, versão e hash |
| 2 |  autoridade e assinatura verificável | PENDENTE | ID, fonte, dado verificável, versão e hash |
| 3 |  âmbito fiscal versus demo | PENDENTE | ID, fonte, dado verificável, versão e hash |
| 4 |  riscos aceitos e ressalvas | PENDENTE | ID, fonte, dado verificável, versão e hash |
| 5 |  data/hora e revogação | PENDENTE | ID, fonte, dado verificável, versão e hash |

Sign-off só é válido com pessoa/autorização verificáveis, versão exata, escopo, riscos, data e hash. Campo 'PENDENTE' proíbe promoção.

## 4. Plano de validação e critérios
**Critério proposto:** Nenhum sign-off sem aprovador humano e prova autenticável. A definir previamente: cenário de teste ou tarefa, dados, oráculo, condições de reprovação, métrica, responsável, prazo e plano de correção. Medição não executada ou insuficiente tem status `NOT_RUN`/`HOLD_HUMAN`, nunca `PASS`.

## 5. Evidências já existentes a conciliar
- `docs/WAVE_042_EVIDENCE_AND_REMAINING_STAGES.md` — histórico existente, não substitui verificação formal deste documento.
Verificar identidade, integridade, compatibilidade de versões e baseline antes de aproveitar registros históricos. Preservar a fonte original sem sobrescrita.

## 6. Fontes de referência
- `ISO15489_2016` — consultar [registro normativo](../referencias-normativas.v1.json) e confirmar edição, vigência e relevância por análise humana.
Referência normativa indica escopo de planejamento, não conformidade ou obrigatoriedade legal universal.

## 7. Controle de execução, riscos e decisões
| Campo exigido para aceitação | Valor atual |
|---|---|
| Requisito e controle | PENDENTE |
| Casos de teste e resultado | NOT_RUN |
| Evidência íntegra, link, SHA-256 | PENDENTE |
| Build/release/ambiente/dados | PENDENTE |
| Desvios, FIND, reteste e riscos | PENDENTE |
| Revisor independente | PENDENTE |
| Parecer e assinatura com alçada | PENDENTE |

## 8. Controle de versões
| Edição | Motivo | Status |
|---|---|---|
| 0.1.0 | Modelo canônico para documentação futura | TEMPLATE |

**Decisão formal:** nenhuma. Antes da promoção, registrar aprovação humana, commit SHA imutável, hash de evidência calculado e ligação à WO. Qualquer insuficiência mantém `HOLD_HUMAN`.
