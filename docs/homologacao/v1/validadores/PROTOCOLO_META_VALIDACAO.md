---
document_id: WUTRIB-DOC-VALMETA-001
version: 0.3.0
status: DRAFT
wo: WUTRIB-WO-PLAN-018
owner_role: QUALITY_ASSURANCE
reviewer_role: INTERNAL_AUDIT_AND_SECURITY
approver_role: PRODUCT_OWNER
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# Protocolo de meta-validação independente dos validadores

**Natureza:** planejamento v0.3.0. Sem execução de testes, acesso a dados corporativos, alteração do SOT ou autorização de homologação.

## 1. Separação de responsabilidades

O desenvolvedor implementa o verificador; o owner de domínio define o requisito e o oráculo; QA independente desenha os testes positivos, negativos e adversariais; Segurança inspeciona acesso e privacidade; Fiscal/Auditoria revisam a evidência e suas limitações; a autoridade humana de negócio decide admissão. Um agente automatizado não aprova seu próprio código.

## 2. Entradas da meta-validação

ID e versão de validador; digest de código; schema e versão de entrada/saída; fonte oficial e vigência; release ERP; WO; requisito; risco; controle; seed/fixture; golden oracle independente; executor; ambiente autorizado; limites de tempo/memória; critérios de aceite pré-aprovados.

## 3. Casos obrigatórios de teste futuro

| Cenário | Falha injetada ou comportamento | Oráculo esperado |
|---|---|---|
| Positivo | Dados e fontes corretos, versão aplicável | PASS limitado ao controle avaliado |
| Campo | Tipo/precisão/obrigatoriedade inválidos | FAIL com campo, tipo, origem e regra |
| Integridade | FK quebrada, hash adulterado, dados de outro tenant | FAIL, proteção de evidência e nenhuma divulgação |
| Versão | XSD/NT/COD_VER ou FISA170 incompatível com o período | FAIL/BLOCKED, nunca aplicar regra da versão mais recente |
| Completude | Lote truncado ou origem obrigatória ausente | BLOCKED com cobertura desconhecida |
| Falso positivo | Golden set válido com dados completos | Sem achado espúrio na regra coberta |
| Falso negativo | Valor, chave, DV, período ou regra intencionalmente alterados | Detecta o defeito injetado, com evidência |
| Metamorfismo | Reordenação, reprocessamento, duplicação, particionamento | Propriedade especificada preservada ou exceção explicada |
| Idempotência | Mesma entrada/contrato duas vezes | Mesmo resultado semântico, sem duplicação persistente |
| Identidade | JWT revogado, org diferente, usuário sem alçada | Deny e ausência de acesso inter-tenant |
| Erro | Timeout, exceção, JSON inválido, recurso indisponível | ERROR/BLOCKED; nunca PASS |
| Amostragem | Universo incompleto, seed não fixada, estrato omitido | BLOCKED e sem projeção para a população |
| IA condicional | Prompt injection, fonte falsa, viés, deriva, exfiltração | Bloqueio/revisão; nenhuma autorização fiscal |
| Limites | Upload extremo, memory budget, volume cumulativo | Degradação conforme SLO autorizado; falha segura |
| Licenciamento | Norma proprietária sem autorização de reprodução | Apenas metadados; uso integral bloqueado |

## 4. Métricas futuras a definir ANTES da execução

Taxa de defeitos detectados por classe; mutantes eliminados sobre mutantes elegíveis; falso positivo; falso negativo; cobertura requisito/controle/condição; reprodutibilidade; latência p95/p99 em massa sintética; memória e proteção de sigilo; cobertura de cenários adversariais. Não inventar percentuais obrigatórios com base somente nos frameworks.

## 5. Oráculo independente e amostragem

Não aceitar a saída do verificador como seu próprio golden oracle. Usar, quando cabível, XSD oficial, PVA, especificação contratual aprovada, resultado manual independente e mocks com defeitos conhecidos. Separar seleção deliberada por risco, teste integral e amostragem estatística; seleção dirigida não autoriza extrapolação estatística. NBC TA 530 é destinada à auditoria independente; sua aplicabilidade à revisão fiscal de empresas privadas exige justificativa de método.

## 6. Mapeamento de controles COSO, ERM, COBIT e IIA

Para cada VAL: objetivo → risco → controle RCM → COSO componente/princípio relevante → COBIT objetivo de TI → teste/oráculo → evidência → falha/riscos residuais → revisor. Os IDs incluídos no catálogo são candidatos, sujeitos a validação por especialista e licenciamento da fonte. Os resultados não demonstram, isoladamente, cumprimento integral dos 17 princípios COSO nem dos 40 objetivos COBIT.

## 7. Contrato e status técnico

Identificadores estáveis de execução e check; expected/observed; evidência e digest; controle; fonte/edição/vigência; período; ambiente; revisor e razão. Status possíveis: PASS, FAIL, BLOCKED, ERROR, NOT_APPLICABLE (com justificativa formal), NOT_RUN. Campos obrigatórios: fiscalConformity = NOT_EVALUATED; humanApproval = false; productionAuthorized = false.

Digest semântico não incorpora timestamps arbitrários; runId, capturedAt e executor ficam no envelope de evidência. A ausência de um oráculo ou fonte indispensável é BLOCKED, não PASS.

## 8. Gates de admissão planejados

| Gate | Critério futuro | Situação agora |
|---|---|---|
| GVAL-00 | Política, WO, responsabilidades e escopo definidos | DRAFT |
| GVAL-01 | Contrato/versionamento/oráculo independente aprovado | HOLD |
| GVAL-02 | Positivos, negativos, mutation e replay documentados | NOT_RUN |
| GVAL-03 | Segurança, limites e controles de erro demonstrados | NOT_RUN |
| GVAL-04 | QA + Segurança + domínio avaliam riscos e eficácia | HOLD_HUMAN |
| GVAL-05 | Aprovação humana vinculada à versão e commit exatos | HOLD_HUMAN |
| GVAL-06 | Autorização de ambiente e dados para execução futura | NOT_AUTHORIZED |

## 9. Histórico e conclusão

Versão 0.3.0 (2026-11-08): protocolo proposto e não executado. Cada revisão posterior deve criar nova versão, preservando base, diff, fonte, autor/revisor e parecer. Não alterar o histórico nem promover automaticamente arquivos TEMPLATE.

**Parecer:** DRAFT / NO EXECUTION / NO HOMOLOGATION.
