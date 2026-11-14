# Fatia 4 — Causal Intelligence + Segurança Agêntica (Specs NOVO 01, 07, 27, 28, 29, 30)

## 1. Causal & Counterfactual Intelligence (NOVO 01)

A diferença que importa:

```
Prediction:      "O que pode acontecer?"
Simulation:      "O que acontece no cenário X?"
Causal:          "O que CAUSOU X?"
Counterfactual:  "O que teria acontecido se X não tivesse ocorrido?"
```

**Regras (POL-016):**
1. Toda asserção causal declara **método** (temporal_precedence, counterfactual_simulation, observational_study, rct_evidence, expert_elicitation) e evidências.
2. **Counterfactual é simulação, nunca fato.** Toda saída contrafactual carrega o rótulo "simulação sobre o twin" e entra no Context Package como uncertainty.state=uncertain.
3. Hipótese causal sem método declarado não pode atravessar nem o CI nem o runtime — é o mesmo princípio do Contradiction Engine: nada é afirmado sem protocolo.
4. O twin é o substrate: causalidade sobre Trajectory (TwinEvent temporal) — por isso a Fatia 2 foi construída com valid_from/valid_to.

Caso exemplar registrado: "a hipotensão ortostática de 01/09 contribuiu para o Morse 65?" → método temporal_precedence sobre TwinEvents (ortostática 10:30→18:00, Morse computado 20:00) → supported. Contrafactual registrado como hipótese em teste: "se o reposicionamento NIC 0840 tivesse iniciado 2h antes, o Braden seria >14?" → inconclusive — e é exatamente assim que deve ficar até haver evidência.

## 2. Agentic Threat Intelligence (NOVO 27)

Superfície de ataque monitorada: prompt injection, tool abuse, memory poisoning, RAG poisoning, data exfiltration, privilege escalation, identity spoofing, model manipulation, agent collusion, supply chain.

**Regras (POL-017):**
1. Todo input de run passa por triagem de injeção/ameaça antes de entrar no Context Package.
2. Ameaça detectada => execução **bloqueada** + ThreatEvent + SafetyEvent (a tríade detectar→bloquear→documentar já é herança da Fatia 0).
3. Ameaça crítica sem resposta bloqueada/contida/ou em investigação = gate bloqueado — ameaça não pode existir em status "detected" solto.

## 3. Collusion Detection (NOVO 28)

```
AGENT A (ação individual: PERMITIDA)
AGENT B (ação individual: PERMITIDA)
A + B combinados: PADRÃO NÃO PERMITIDO  →  detecção
```

**Regras (POL-018):**
1. Sequências multiagente são validadas como **comportamento combinado**, não só ação a ação.
2. Todo evento do tipo agent_collusion é `is_multi_agent` por definição — e exige análise registrada.
3. Falso positivo é resultado legítimo — o valor está em fechar o evento com a análise (não em nunca alertar).

Caso exemplar: sae-copilot consultou histórico completo de medicações (permitido para SAE) + pews-sentinel puxou série de sinais vitais de 72h (permitido para monitoramento) — volume combinado disparou o envelope. Contido, investigado, fechado como falso positivo com a análise registrada.

## 4. Behavioral Firewall (NOVO 29)

Não olha só WHO — olha WHAT, HOW, WHEN, HOW FAST, HOW OFTEN, WITH WHOM, USING WHICH TOOLS.

**Regras (POL-019):**
1. Todo agente em pilot/production tem um `BehaviorProfile` com baseline e **envelope** (limites máximos de ações/hora, tool calls/hora, volume de dados, ferramentas permitidas).
2. Ação fora do envelope = bloqueada pendente de revisão — mesmo que a ação individual pareça legítima (é o complemento do firewall de colusão).
3. O perfil é recalibrado quando o contrato muda; anomalias contam e nunca são zeradas silenciosamente.

## 5. Agent Negotiation (NOVO 07)

```
"I need wound-analysis capability"
   → AGENT DISCOVERY (Capability Registry)
   → ELIGIBILITY → POLICY → TRUST → RISK → COST → AVAILABILITY
   → SELECTION → AUTHORIZATION → DELEGATION → EXECUTION
```

**Regras (POL-020):**
1. Delegação de capacidade **só** existe via Capability Registry — chamada direta agente-a-agente fora da negociação é violação.
2. Seleção registra o motivo (trust/risk/cost/availability) e as políticas satisfeitas.
3. **Falhar graciosamente é parte do protocolo:** capacidade sem fornecedor elegível termina em `failed_no_provider` com gap reportado — não em improvisação.

Caso exemplar duplo: CAP-001 → candidato elegível (sae-copilot, trust 0.84 ≥ min 0.80) → authorized/executed. CAP-005 → zero candidatos → failed_no_provider — a negociação falha de forma audível e o gap vira insumo de roadmap (é o mesmo gap que o WorkforceTwin já apontava).

## 6. Mission Assurance (NOVO 30)

```
MISSION → OBJECTIVE → SUCCESS CRITERIA → SAFETY CRITERIA
       → POLICY → TASKS → EXECUTION → OUTCOME
       → "MISSION COMPLETE" só quando os critérios estão EVIDENCIADOS
```

**Regras (POL-021):**
1. Missão não termina porque o plano acabou — termina porque os critérios foram verificados **com outcomes vinculados** (herança da POL-010).
2. Critérios de segurança têm o mesmo peso que os de sucesso.
3. Missão bloqueada registra o motivo — bloqueio é estado de primeira classe, não falha.

Caso exemplar: "plantão sem quedas para a paciente 88412" → critérios [0 quedas, NIC 6490 aplicada] + segurança [sem eventos adversos por anticoagulação] → OUT-2026-0001 evidencia → complete. Contraponto: missão de educação ao paciente → blocked — CAP-005 sem fornecedor, o Mission Assurance e o Agent Negotiation se enxergam.
