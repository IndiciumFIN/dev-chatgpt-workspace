---
document_id: CROSS-DOC-VALQUAL-001
version: 0.1.0
status: DRAFT
wo_lineage: WUTRIB-WO-PLAN-018
owner_role: INDEPENDENT_QA
reviewer_role: GOVERNANCE_SECURITY_FISCAL_CLINICAL
approver_role: DOMAIN_AUTHORITIES
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# Estratégia de qualificação independente dos validadores — v0.1.0

**Decisão atual:** REDESENHAR/REQUALIFICAR ANTES DE QUALQUER AUDITORIA. Este documento não é um programa, não executa testes e não certifica qualquer validador. Há **28 candidatos** no catálogo de WU-TRIB v0.3.0, três scripts de “auditores” antigos e scripts preexistentes de integridade; não são equivalentes.

## 1. Diagnóstico baseado no código realmente consultado

| Componente examinado | O que verifica no código | Limitação material | Status de admissão |
|---|---|---|---|
| `agents/doc-governance.mjs` | status `DRAFT/TEMPLATE`, aprovações NONE, existência e frontmatter | não verifica conteúdo, cobertura WO→controle→evidência, coerência semântica, histórico ou efetividade | STRUCTURAL_ONLY / HOLD |
| `agents/normative-applicability.mjs` | URLs HTTPS, metadados e `verifiedDocumentBody=false` | não lê o conteúdo da fonte, não resolve escopo/vigência; a condição false proíbe inferir que verificou norma | METADATA_ONLY / HOLD |
| `agents/meta-validator.mjs` | regex proibindo certas palavras, exigindo JSON.stringify/process.exit | bypass por alias/import/transpilação; exclui a própria lógica; self-tests com `true`; não testa erros/falsos negativos, hashes ou efeitos de execução | META_INSUFFICIENT / HOLD |
| `scripts/validate-validators.mjs` | inicia três processos Node, retorna PASS se exit code 0 | exit 0 pode ser falso positivo; executar um script com resultado verde não prova o oráculo; sem qualificação independente | RUNNER_ONLY / HOLD |
| `scripts/check-wutrib-docs.mjs` | verificações de arquivo, ID, metadados e referências na baseline documental | fornece evidência de integridade de inventário, não conteúdo e não conformidade fiscal/clínica | DOCUMENT_INTEGRITY_ONLY |

**Regra:** `PASS` do script antigo é fato sobre checks delimitados, **não** prova que “todos os erros foram capturados”. Nenhum destes quatro scripts foi executado novamente neste planejamento.

## 2. Arquitetura futura por camadas — separando funções e autoridade

| Camada | Objetivo | Método e oráculo | Falha que bloqueia |
|---|---|---|---|
| LV-0 | Integridade e procedência do próprio validador | commit, conteúdo SHA-256 real, SBOM, build reproducível, assinatura quando adotada, política de runtime por capacidade | script desconhecido, assinatura inválida, dependência não aprovada |
| LV-1 | Estrutura documental e modelagem | JSON/YAML Schema, IDs, versão, formato, chaves, domínio e validação de metadados | ausência, colidência ou sintaxe inválida |
| LV-2 | Aplicabilidade normativa e semântica | corpus primário permitido + edition, effective date, release e applicability record revisados | norma não localizada, revogada ou fora de período, oráculo ausente |
| LV-3 | Exatidão do conteúdo e transformação | golden fixtures independentes; propriedades, oráculos externos NF-e/EFD ou cálculo clínico publicado | valores fora de tolerância, schema incompatível, decisão sem fonte |
| LV-4 | Reconciliação e auditoria contextual | duas ou mais fontes, chaves, cardinalidade, cobertura e trilha de transformação | diferença não resolvida, cross-tenant, dupla contagem |
| LV-5 | Segurança, UX, acessibilidade, capacidade e sustentabilidade | OWASP ASVS, WCAG-EM, UAT, p95/p99 e SCI com limites declarados | falha crítica, medição inexistente ou barreira essencial |
| LV-6 | Eficácia do validador e risco residual | *meta-validation* independente, mutantes, falsos positivos/negativos por classe, failure injection e replay | falsa aprovação, defeito conhecido não detectado, autocertificação |
| LV-7 | Admissão humana e autorização de uso | revisão especializada, segregação de funções, versão exata, risco aceito e escopo permitido | assinaturas ausentes, HOLD crítico, escopo indefinido |

**Dependência formal:** LV-0 a LV-2 precisam estar elegíveis antes que LV-3/LV-4 tenham sentido normativo. LV-6 é independente do executor LV-3. LV-7 não pode ser representado por código.

## 3. Especificidade por domínio

**WU-TRIB:** `VAL-FISCAL` exige EFD por COD_VER, guia e ato vigente, NF-e MOC/NT/XSD por evento, DV, cancellation/rectification, TES/FISA170 por tributo e release, SX2/SX3/SIX e tipos. Um parser C100 que passa sintaxe não equivale a todo o arquivo EFD homologado. Compare com PVA oficial quando compatível, sem assumir que o PVA é o mesmo artefato do guia.

**Calculadoras de Enfermagem:** `VAL-CLINICAL` exige finalidade e regulamentação de cada ferramenta, referências científicas originais, validação do instrumento/adaptação, população alvo, unidades, limites físicos, arredondamento, variação fisiológica, alertas de segurança, seleção correta de escala/corte e revisão por profissional qualificado. Uma execução aritmética correta pode ser clinicamente inadequada para determinada população. Se classificado como SaMD, aplicar gate regulatório próprio.

**Documentação/projeto:** `VAL-GOVERNANCE` confere linha completa WO→REQ→RISK→CTRL→TEST→EVIDENCE→FIND→REVIEW→DECISION→RELEASE, comparando com permissões. O conteúdo de uma norma protegida não deve ser reproduzido sem licença; verificação de fonte e autorização normativa são gates separados.

**IA:** `VAL-AI` somente para capacidades que usem modelo; prompt injection, grounding, deriva, privacidade e revisão humana. A existência de validadores Node determinísticos não autoriza alegar certificação ISO 42001.

## 4. Matriz mínima de meta-testes antes da admissão

| ID futuro | Técnica | Falha induzida | Resultado esperado |
|---|---|---|---|
| MV-01 | Positivo independente | Dados corretos e oráculo separado | PASS específico, nunca conformidade global |
| MV-02 | Mutação estrutura | Remover campo, trocar tipo, desordenar record aplicável | FAIL com referência e campo |
| MV-03 | Mutação norma | Trocar versão, data de vigência, UF, tipo de operação ou release | BLOCKED/FAIL conforme contrato |
| MV-04 | False negative | Alterar valor tributário/escala conhecida e manter formato válido | Identificar erro sem depender de regex textual |
| MV-05 | False positive | Goldens válidos, outlier legítimo, exceção autorizada | Não apresentar irregularidade confirmada |
| MV-06 | Self-bypass | Validador tenta excluir a si mesmo ou usa constantes `true` | Meta-teste externo detecta lacuna de cobertura |
| MV-07 | Runtime escape | import/alias/exec/file system/network inesperados | Bloqueio pelo sandbox e relatório, não só busca por string |
| MV-08 | Unauthorized side effects | escrita em DB, arquivo, API, aprovação, deploy | Sem efeito, status ERROR/DENY e evidência |
| MV-09 | Completeness | eliminar fonte ou parte da população | BLOCKED; não aceitar lote truncado |
| MV-10 | Precision | float incorreto, zero à esquerda removido, divisor zero | FAIL/UNDEFINED sem manipular oráculo |
| MV-11 | Replay | mesma entrada, regra, versão e hash; nova hora | Mesmo resultado semântico, envelope temporal distinto |
| MV-12 | Multi-tenancy | cruzar dados entre dois tenants | DENY sem vazamento, com auditoria |
| MV-13 | Availability | timeout, OOM controlada, interrupção e cancelamento | ERROR/BLOCKED, sem documento fiscal/parecer falso |
| MV-14 | Accessibility | fluxo com teclado/leitor de tela falha apesar do scanner verde | Encontra barreira por revisão humana |
| MV-15 | Admissibility | usuário ou IA tenta forçar `APPROVED`/sign-off | Gate humano recusa e preserva histórico |
| MV-16 | AI conditional | fonte fraudulenta e instruções injetadas | Quarentena, fundamentação e veto humano |

**Métricas futuras:** cobertura de classes de risco, proporção de defeitos conhecidos detectados, mutantes elegíveis eliminados, taxa FP/FN nos conjuntos rotulados, latência e consumo por operação, reincidência de falhas e profundidade da fonte normativa. Limiares e orçamento de falso negativo devem ser aprovados por domínio **antes** da execução. Uma taxa única para saúde/fiscal é injustificável.

## 5. Contrato de evidência futuro (não implementado)

Campos mínimos: `validatorId, validatorVersion, validatorSourceSHA256, buildCommit, sourceSnapshotId, normativeSourceId, sourceEdition, effectiveAt, erpRelease, clinicalInstrumentEdition, requirementId, riskId, controlId, woId, caseId, runId, inputDigest, semanticDigest, executionEnvelope, outcome, reason, positiveNegativeClass, detectedMutants, eligibleMutants, falsePositiveCount, falseNegativeCount, evidences, blindSpots, residualRisks, reviewer, approvalStatus`.

Estados: `PASS | FAIL | BLOCKED | ERROR | NOT_RUN | NOT_APPLICABLE` (este último condicionado a justificativa por escopo). `fiscalConformity=NOT_EVALUATED` nos verificadores técnicos e `clinicalApproval=NOT_GRANTED` sem profissional autorizador; não apagar falha nem ocultar risco. Cada evidence hash representa **bytes computados**, não string decorativa.

## 6. Pontos cegos, residualRisks e tratamento

Um registro de risco residual deve conter `riskId, domain, consequence, likelihood, impact, detectionLimits, treatmentAction, ownerRole, dueDateDecision, status, affectedGates, evidenceGap, acceptedBy`. **A existência da linha não equivale a risco aceito.** `acceptedBy` permanece `null`; `dueDateDecision` não será inventado.

Categorias obrigatórias: ausência de cobertura semântica, conteúdo de norma não lido, testes com oráculo circular, subdetecção de erros, autoaprovação, incerteza de versão fiscal, risco clínico com validação inadequada, incompletude de fonte, autorização/segurança, capacidade máxima não medida, a11y manual não executada, carbono estimado sem dados e cross-domain coupling.

O arquivo [MATRIZ_RISCOS_RESIDUAIS_v01.json](MATRIZ_RISCOS_RESIDUAIS_v01.json) especifica as ações e os owners com status HOLD.

## 7. Etapas e autoridade

1. **Revisão de conceito:** decisão por domínio e aceitação de escopo dos 28 candidatos; nenhum executável.
2. **Contratos e fontes:** oráculos externos e edição licitamente acessível; versionamento do corpus.
3. **Desenho de testes independentes:** golden cases, mutantes, fontes de risco, limites e aceites.
4. **Ambiente isolado:** projeto de sandbox sem rede/escrita quando necessário; aquisição de fontes separada e autorizada.
5. **Qualificação dos validadores:** somente após autorização expressa de execução, medir taxas e registrar falsos negativos.
6. **Risco residual:** avaliação por RCM, segurança, clínica e fiscal.
7. **Admissão humana:** assinatura específica do conjunto versionado, propósito e ambiente.
8. **Auditoria do produto:** **outra autorização**; a admissão de um validador não constitui autorização geral de auditoria.

**Conclusão:** os agentes antigos são candidatos de verificação estrutural, não auditores profissionais e não validadores abrangentes. A única decisão segura antes de implantá-los é **HOLD_HUMAN**. Nenhuma implementação, execução ou homologação nesta etapa.
