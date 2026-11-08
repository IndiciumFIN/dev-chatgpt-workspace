---
document_id: WUTRIB-DOC-EXP-V02-RCM
version: 0.2.0
status: DRAFT
wo: WUTRIB-WO-PLAN-018
owner_role: RISK_AND_CONTROLS
reviewer_role: INTERNAL_AUDIT_AND_SECURITY_AND_FISCAL
approver_role: PRODUCT_OWNER
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# Matriz RCM × RTM da expansão analítica v0.2.0

**ESTADO:** mapeamento candidato, ainda não avaliado nem aprovado. Os IDs abaixo são propostos nesta expansão e não substituem identificadores já existentes na WU-TRIB. Um controle será considerado **desenhado** após revisão e **operacional** somente após execução/evidência independente.

## Objetivos e riscos

| Risk ID | Risco | Impacto potencial | Criticidade proposta | Engine |
|---|---|---|---|---|
| R-EXP-01 | Extração truncada não detectada | Perda de população, falsas ausências ou falsa reconciliação | P0 | EXP-001 |
| R-EXP-02 | Acesso entre organizações/filiais | Exposição de dados e decisões cruzadas | P0 | Todos |
| R-EXP-03 | Join N:M multiplica montantes | Distorção financeira/fiscal por dupla contagem | P0 | EXP-004 |
| R-EXP-04 | Conversão de chave/decimal gera correspondência falsa | Diferenças incorretas e perda de evidência | P0 | EXP-001/004 |
| R-EXP-05 | População/amostragem enviesada | Conclusão não representativa ou projeção imprópria | P0 | EXP-005/007 |
| R-EXP-06 | Evento classificado como infração sem causa confirmada | Parecer fiscal indevido ou excesso de alertas | P0 | EXP-010/011/012 |
| R-EXP-07 | Norma ou regra fora de vigência | Cálculo e comparação tributária incorretos | P0 | EXP-012/015 |
| R-EXP-08 | Diferença de mix tratada como mudança legal | Conclusão causal falsa | P1 | EXP-012 |
| R-EXP-09 | Falha de algoritmo/runner gera PASS indevido | Decisão com base em evidência inexistente | P0 | Todos |
| R-EXP-10 | Log incompleto ou hash errado | Não reproduz a análise e não se sustenta em auditoria | P0 | Todos |
| R-EXP-11 | Sobreconsumo de CPU/memória em datasets grandes | Indisponibilidade e custos imprevisíveis | P1 | EXP-001/004/011 |
| R-EXP-12 | UX inacessível/erro de interpretação da tela | Decisão humana sobre dados enganosos | P0 | Todos |
| R-EXP-13 | Retenção indevida ou dados reais em fixture | Risco de privacidade e confidencialidade | P0 | Todos |
| R-EXP-14 | Configuração ERP comparada sem release/snapshot | Diferencial fiscal não verificável | P0 | EXP-012/015 |

## Controles RCM candidatos

| Control ID | Desenho proposto do controle | Natureza | Dono por função | Evidência prevista | Teste futuro |
|---|---|---|---|---|---|
| C-EXP-01 | Manifesto íntegro, contagens, hash real e quarentena | Preventivo/detectivo | Data Steward | Source snapshot + rejects | EXT02-01/02/03 |
| C-EXP-02 | Autorização server-side por organização, filial, propósito e escopo | Preventivo | Segurança | Deny + logs de acesso | EXT02-06/JOIN02-06 |
| C-EXP-03 | Estimativa e bloqueio de explosão de cardinalidade | Preventivo | Arquitetura de Dados | Join plan + counts por chave | JOIN02-04/08 |
| C-EXP-04 | Dicionário tipado e preservação de raw/decimal/chave | Preventivo | Data Architect | Schema/version + diff | JOIN02-05/09 |
| C-EXP-05 | População, seed, método e eligibility de projeção | Preventivo | QA/Auditoria | Sampling plan + seleção reproduzida | SEL02-04/05/06 |
| C-EXP-06 | Taxonomia de ocorrências, causa e decisão separadas | Detectivo | Risco/Fiscal | Finding occurrence + reviewer | ERR02-01/02/03 |
| C-EXP-07 | Norma, vigência e release ERP validados antes de conclusão | Preventivo | Fiscal/ERP | Normative source + config snapshot | TMP02-02/03/10 |
| C-EXP-08 | Coortes comparáveis e decomposição controlada com resíduo | Detectivo | Fiscal/Analytics | Calculation bridge + baseline | TMP02-05/09 |
| C-EXP-09 | Fail-closed runner, negativa e oráculo independente | Preventivo | QA/Security | Independent golden fixtures | META-EXP-01/02 |
| C-EXP-10 | Linhagem, SHA, revisão e baseline imutável | Detectivo | Governança | Workpaper + run manifest | META-EXP-03 |
| C-EXP-11 | Orçamento e limites de recursos antes de executar | Preventivo | Operações | Resource budget + capacity logs | META-EXP-04 |
| C-EXP-12 | Acessibilidade, estados e UAT de tarefas críticas | Preventivo/detectivo | UX/A11Y | Laudo humano + tarefas | UX02-01..08 |
| C-EXP-13 | Minimização, retenção, não usar dados reais em CI | Preventivo | Privacidade | Classification + retention decisions | META-EXP-05 |
| C-EXP-14 | Comparação bitemporal por versão/release | Detectivo | Fiscal/ERP | Two effective/recorded times | TMP02-04/11 |

**Conceito de MRC:** *Management Review Control* — controle de revisão gerencial; não confundir a sigla com a matriz de riscos e controles `RCM`. Uma eventual aprovação humana de resultado compõe o MRC e requer evidência de competência, independência, precisão dos dados, limiar, investigação e assinatura.

## RTM — requisito, engine e controle

| Requirement ID | Resultado de negócio verificável | Módulo | Risco | Controle | Critério para futura aprovação |
|---|---|---|---|---|---|
| REQ-EXP-01 | Extração reproduz origem, versão e população | EXP-001 | R-EXP-01 | C-EXP-01 | Linha/bytes/hash e rejects conciliados |
| REQ-EXP-02 | Nenhum dado cross-tenant | Todos | R-EXP-02 | C-EXP-02 | Negativas de autorização e isolamento |
| REQ-EXP-03 | Join não infla total sem regra de alocação | EXP-004 | R-EXP-03 | C-EXP-03 | N:M sinalizado e agregado protegido |
| REQ-EXP-04 | Chave/valor preservam semântica física | EXP-004 | R-EXP-04 | C-EXP-04 | Decimal exato e zeros preservados |
| REQ-EXP-05 | Amostra e exclusões são reproduzíveis | EXP-005/007 | R-EXP-05 | C-EXP-05 | Mesmo seed e universo; sem projeção dirigida |
| REQ-EXP-06 | Erro/anomalia não se torna infração automaticamente | EXP-010/011 | R-EXP-06 | C-EXP-06 | `NOT_EVALUATED`, revisão humana |
| REQ-EXP-07 | Norma e parâmetro aplicáveis à data/release | EXP-012/015 | R-EXP-07 | C-EXP-07 | Vigência e fonte comprovadas |
| REQ-EXP-08 | Mudança de alíquota decompõe causas e resíduo | EXP-012 | R-EXP-08 | C-EXP-08 | Ponte reconcilia e explica não identificado |
| REQ-EXP-09 | Falha de executor não vira PASS | Todos | R-EXP-09 | C-EXP-09 | Testes negativos e meta-validação |
| REQ-EXP-10 | Resultado pode ser reconstruído por hash/versão | Todos | R-EXP-10 | C-EXP-10 | Manifest e workpaper reproduzíveis |
| REQ-EXP-11 | Limite de uso evita indisponibilidade | Engines caros | R-EXP-11 | C-EXP-11 | Carga e degradação em sandbox autorizado |
| REQ-EXP-12 | Jornadas críticas acessíveis e compreensíveis | UI | R-EXP-12 | C-EXP-12 | Teste WCAG manual e UAT |
| REQ-EXP-13 | Dados utilizados são adequados à finalidade | Todos | R-EXP-13 | C-EXP-13 | Retenção, classificação, autorização |
| REQ-EXP-14 | Comparação histórica mantém contexto original | EXP-012/015 | R-EXP-14 | C-EXP-14 | Bitemporalidade e release ERP |

## Mapeamento normativo — somente referência de desenho

COSO ICIF: ambiente de controle, avaliação de riscos, atividades de controle, informação/comunicação e monitoramento orientam a definição de proprietários, evidências e revisão. COSO ERM orienta risco residual/decisão, e COBIT 2019 orienta governança de dados, mudanças, controles e segurança. IIA GIAS orienta o trabalho profissional de auditoria quando aplicável. ISO/IEC/IEEE 29119-2/-3/-4, ISO 25010 e ISO 25012 orientam técnicas e qualidade. OWASP ASVS e WCAG 2.2 fornecem verificações de segurança e acessibilidade.

**Não interpretar** o quadro como mapeamento definitivo de todos os 17 princípios COSO, 40 objetivos COBIT ou cumprimento de uma norma. Os mapeamentos específicos dependem de acesso licenciado, escopo e revisão por competência.

## Gate de aceitação futuro

Cada requisito crítico deve ter owner nominal, risco e controle formalizados, caso positivo/negativo, oráculo independente, ambiente, evidência, revisor e decisão de alçada. C-EXP em estado DRAFT não é controle operacional nem comprovadamente eficaz. **Nenhum teste desta matriz foi executado.**
