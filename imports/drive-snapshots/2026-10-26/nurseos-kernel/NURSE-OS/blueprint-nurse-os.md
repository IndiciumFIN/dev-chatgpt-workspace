> **SUPERSEDED** — este blueprint v1 foi consolidado em `architecture/nursing-intelligence-os-v2.md` (02/09/2026). Mantido como apêndice histórico.

# Blueprint — Plataforma de Excelência Mundial
## Planejamento, Controle e Execução de Agentes, IA Agêntica, Digital Twin e Nurse-PaLM

**Autor:** Leivis Lima · **Data:** 02/09/2026 · **Versão:** 1.0

> Nota técnica: o Med-PaLM (e Med-PaLM 2, 86,5% no MedQA) é do **Google Research**, não da Meta. A Meta trabalhou com variantes clínicas de Llama (ex.: Meditron-like). O correto seria dizer "equivalente ao Med-PaLM do Google". Este blueprint assume esse posicionamento como referência de excelência.

---

## 1. Visão

Uma plataforma de sistema operacional clínico agêntico — **"NURSE-OS"** (nome de trabalho) — que registra, orquestra, governa, avalia e executa agentes de IA em enfermagem e saúde, ancorada em:

1. **CKO (Clinical Knowledge Objects)** como substrato de conhecimento canônico (já existente).
2. **Nurse-PaLM** — LLM clínico de raciocínio de enfermagem (NANDA-I, NIC, NOC, SBAR, PEWS/NEWS2, SAE = Sistematização da Assistência de Enfermagem).
3. **Digital Twins** — paciente, profissional de enfermagem e unidade/leito, baseados em FHIR R4/R5.
4. **Orquestração aberta** — MCP (ferramentas/contexto) + A2A (agente-a-agente) + FHIR (dados clínicos).
5. **Governança clínica e regulatória de classe mundial** — ANVISA, LGPD, GDPR/HIPAA, EU AI Act (high-risk), ONC HTI-1.

Princípio central: **nenhum agente age sem identidade, permissão, guardrail, trilha de auditoria e avaliação contínua.** "Agente sem governance é liabilidade clínica."

---

## 2. Arquitetura — 7 Camadas

```
┌─────────────────────────────────────────────────────────────┐
│ L7. EXPERIÊNCIA — Painéis, copiloto clínico, apps do paciente │
├─────────────────────────────────────────────────────────────┤
│ L6. GOVERNANÇA — Consentimento, audit, model cards, risk      │
├─────────────────────────────────────────────────────────────┤
│ L5. AVALIAÇÃO — Benchmarks, red-teaming, drift, safety events │
├─────────────────────────────────────────────────────────────┤
│ L4. ORQUESTRAÇÃO — Planner, workflows, HITL, A2A/MCP          │
├─────────────────────────────────────────────────────────────┤
│ L3. AGENTES — Registry, runtime, guardrails, memória          │
├─────────────────────────────────────────────────────────────┤
│ L2. DIGITAL TWIN — Paciente, enfermeiro, unidade (FHIR)       │
├─────────────────────────────────────────────────────────────┤
│ L1. CONHECIMENTO — CKO + FHIR + terminologias + Nurse-PaLM    │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Camada 1 — Conhecimento (CKO como substrato)

O CKO já segue **Core Schema (70-80%) + módulos de domínio (20-30%)**. A plataforma consome CKOs como "ferramentas de conhecimento" via MCP:

- Cada CKO exposto como **MCP resource** (`cko://medications/dipirona`, `cko://microorganisms/mrsa`).
- Agentes citam CKOs em cada afirmação clínica → **grounding rastreável** (anti-alucinação).
- Terminologias: SNOMED CT, LOINC, ICD-11, ATC, GMDN, NANDA-I, NIC, NOC, UCUM.
- Padrões de intercâmbio: FHIR R4/R5 (resources: Patient, Observation, MedicationRequest, Procedure, DiagnosticReport, ServiceRequest, Encounter, Consent), HL7 FHIR Clinical Guidelines (CPG-on-FHIR), OHDSI/OMOP CDM para pesquisa.

### Campos a adicionar no Core Schema do CKO (extensão "agent-ready")
```json
"agent_integration": {
  "mcp_resource_uri": "string",
  "a2a_agent_card_ref": "string (nullable)",
  "confidence_weight": "number 0-1 — peso do dado no raciocínio",
  "contraindications_refs": ["CKO id"],
  "nursing_relevance": "enum: critical | high | medium | low",
  "humanization_note": "string — orientação de comunicação ao paciente"
}
```

---

## 4. Camada 2 — Digital Twin

### 4.1 PatientTwin (gêmeo do paciente)
Sincronizado por FHIR; simula evolução clínica e resposta a intervenções de enfermagem.

```json
{
  "identity": { "id": "string", "twin_type": "patient", "fhir_patient_ref": "string", "version": "int" },
  "state": {
    "vitals_stream": ["FHIR Observation ref — NEWS2, PEWS, MEWS"],
    "risk_scores": {
      "falls": "Morse Fall Scale",
      "pressure_injury": "Braden Scale",
      "deterioration": "NEWS2 + tendência 24h",
      "sepsis": "SIRS/qSOFA + lactato",
      "delirium": "CAM-ICU"
    },
    "medications": ["FHIR MedicationRequest ref + ATC"],
    "allergies": ["CKO ref"],
    "care_plan": { "nanda": ["string"], "nic": ["string"], "noc_targets": ["string"] }
  },
  "simulation": {
    "scenarios": ["string — ex.: 'queda com anticoagulante'"],
    "model_refs": ["string — preditores (Early Warning, sepsis ML)"],
    "last_calibration": "datetime"
  },
  "consent": { "fhir_consent_ref": "string", "twin_purposes": ["care", "research", "simulation"], "revoked_at": "datetime nullable" },
  "governance": { "data_residency": "string", "retention_policy": "string", "audit_refs": ["string"] }
}
```

### 4.2 NurseTwin (gêmeo do profissional)
Carga de trabalho, competências, fadiga, alocação (dados pseudonimizados — sensível à LGPD):

```json
{
  "identity": { "id": "string", "role": "enum: RN | TECH | NURSE_MANAGER", "pseudonymized": true },
  "workload": { "patient_ratio": "number", "NAS_score": "Nursing Activities Score", "hours_shift": "number", "overtime_30d": "number" },
  "competencies": { "certifications": ["string"], "skills_matrix": ["CKO procedure ref"], "last_training": "datetime" },
  "safety": { "fatigue_index": "number", "medication_error_rate_contextual": "number", "burnout_indicator": "enum" }
}
```

### 4.3 UnitTwin (gêmeo da unidade/leito)
Simulação de capacidade, dimensionamento (COFEN Res. 671/2025 como referência normativa brasileira), fluxo de leitos, surto de microorganismos (link com CKO de microrganismos, ex.: MDRO).

---

## 5. Camada 3 — Agentes (Registry + Runtime)

### Entidade `Agent` (registro central — "cadastro de agentes")
Seguindo a filosofia do CKO (Core + módulos):

```json
{
  "identity": {
    "name": "string", "slug": "string", "version": "semver",
    "agent_type": "enum: clinical_reasoning | safety_monitor | administrative | patient_facing | educator | orchestrator | twin_simulator",
    "model_ref": "string — Nurse-PaLM vX / outro modelo",
    "description": "string"
  },
  "classification": {
    "domain": ["CKO domain — medications, procedures, microorganisms…"],
    "care_settings": ["ICU", "ER", "ward", "home_care", "telehealth"],
    "autonomy_level": "enum: L0 suggest | L1 draft+review | L2 act with HITL | L3 autonomous (compliance-required)"
  },
  "capabilities": {
    "tools": ["MCP tool refs"], "knowledge_refs": ["CKO refs"],
    "protocols": ["SBAR", "handoff", "medication reconciliation", "discharge planning"],
    "input_schema": "JSON Schema", "output_schema": "JSON Schema",
    "a2a_agent_card": "string URL — descoberta A2A"
  },
  "guardrails": {
    "hard_limits": ["ex.: nunca prescrever; nunca alterar dose sem farmacêutico/enfermeiro aprovando"],
    "requires_human_approval_for": ["array de ações"],
    "refusal_policy": "string", "guardrail_refs": ["AgentPolicy id"]
  },
  "clinical_safety": {
    "risk_class": "enum: I | II | III (ANVISA / EU AI Act high-risk mapping)",
    "intended_use": "string", "contraindications_use": "string",
    "validation_refs": ["EvaluationRun id"], "model_card_ref": "string"
  },
  "lifecycle": {
    "status": "enum: draft | sandbox | pilot | production | deprecated",
    "approval_refs": ["ApprovalRecord id"], "deployed_at": "datetime", "rollback_plan": "string"
  },
  "observability": {
    "success_rate_7d": "number", "safety_events_30d": "int",
    "drift_flags": ["enum"], "cost_per_task": "number"
  },
  "governance": {
    "owner": "string", "clinical_champion": "string",
    "review_cadence": "enum: continuous | monthly | quarterly",
    "references": ["string"], "audit_log_ref": "string"
  }
}
```

### Entidades de suporte
- **`AgentRun`** — cada execução: inputs, outputs, confidence, reasoning trace, tokens, latência, human_review_status, parent_run (para sub-agentes/A2A).
- **`AgentPolicy`** — políticas reutilizáveis de guardrail (ex.: "política de medicação segura", "política de comunicação ao paciente em pt-BR/leitura fácil").
- **`AgentMemory`** — memória declarada: escopo (por encontro/paciente/equipe), TTL, LGPD basis.
- **`HandoffRecord`** — transferências humano↔agente↔agente (SBAR estruturado, obrigatório em toda troca de responsabilidade).

---

## 6. Camada 4 — Orquestração

- **Planner** de workflows clínicos: decompõe objetivos ("preparar alta segura do paciente X") em tarefas para agentes.
- **Padrões**: supervisor, pipeline clínico (evite conselho caótico de agentes), HITL em todo ponto de decisão de risco.
- **Protocolos**: MCP para ferramentas/dados; A2A para agentes remotos de outras instituições (Agent Cards com credenciais verificáveis = trust).
- **Semântica de execução**: TAREFA → plano → execução paralela/coletada → verificação clínica → handoff registrado.
- **Dead-man switch**: todo workflow tem timeout + escalation para humano; nenhum loop de agente sem limitador.

### Campos do `Workflow` (espelho do que já existe em automações)
```json
{
  "identity": { "name": "string", "version": "semver", "trigger": "enum: event | cron | fhir_subscription | manual" },
  "plan": { "steps": ["AgentRun refs com condição, paralelismo, fallback"] },
  "safety": { "max_runtime_s": "int", "escalation_target": "string", "kill_switch": "bool" },
  "clinical_context": { "fhir_encounter_ref": "string", "requires_nurse_signoff": "bool" }
}
```

---

## 7. Nurse-PaLM — o LLM de enfermagem

### 7.1 Posicionamento
O Med-PaLM prova que um LLM pode passar em exames médicos. **O gap mundial é raciocínio de ENFERMAGEM**: ninguém dominou NANDA-I + NIC + NOC + PEWS + SAE em escala. O Nurse-PaLM ataca exatamente isso.

### 7.2 Estratégia (ordem pragmática)
1. **Não treinar do zero.** Fine-tuning/RAG sobre base aberta (Llama, Gemma, ou Mistral) + **todos os CKOs como corpus de grounding** — seu CKO é o diferencial competitivo.
2. **Estágios**: (a) RAG puro sobre CKO → (b) fine-tune com SAEs reais anonimizados (NANDA→NIC→NOC) → (c) RLHF/DPO com enfermeiros avaliadores → (d) benchmark público.
3. **Saída estruturada sempre**: JSON com diagnóstico NANDA + intervenções NIC + metas NOC + *citação do CKO/fonte* + nível de confiança.

### 7.3 Exemplo de schema de saída
```json
{
  "patient_snapshot_ref": "FHIR Encounter ref",
  "nursing_diagnoses": [{ "nanda_code": "00047", "label": "Risco de queda", "related_factors": ["..."], "confidence": 0.86 }],
  "interventions": [{ "nic_code": "6490", "label": "Prevenção de quedas", "source_cko_refs": ["cko://procedures/fall-prevention"], "priority": 1 }],
  "outcomes": [{ "noc_code": "1902", "target": "paciente não sofre queda durante internação" }],
  "safety_flags": ["anticoagulante em uso — agravante de queda"],
  "human_review_required": true,
  "explanation": "string — raciocínio em linguagem natural para o enfermeiro"
}
```

### 7.4 Benchmark próprio — **NurseBench** (recurso de excelência mundial)
Publique um benchmark aberto (como o MedQA foi para medicina):
- Casos clínicos de enfermagem com gabarito de especialistas (NANDA/NIC/NOC, PEWS, SBAR, medicação segura);
- Métricas: acurácia de diagnóstico, segurança (taxa de dano potencial), completude da SAE, legibilidade para paciente, taxa de alucinação com citação inválida;
- Split pt-BR / en / es (multi-idioma — seu diferencial de alcance global, LatAm-first).

---

## 8. Camada 5 — Avaliação e Segurança

- **EvaluationRun**: suíte de regressão obrigatória a cada mudança de modelo/prompt/guardrail — "unit tests clínicos".
- **SafetyEvent**: near-misses e eventos adversos atribuídos a agentes (taxonomia alinhada à OMS — Classificação Internacional para Segurança do Paciente, ICPS).
- **Red-teaming clínico periódico** + adversarial probes.
- **Drift monitoring**: distribuição de confiança, taxa de handoff para humano, latência clínica.
- **Model cards** obrigatórios: dados de treino, limitações, populações excluídas, desempenho por subgrupo (equidade).

---

## 9. Camada 6 — Governança e Regulatório

| Norma | Aplicação |
|---|---|
| **ANVISA** | Software como dispositivo médico (gerenciamento de risco, RDC 660/2022 IVD se aplicável), ANVISA/REBLA para software de saúde |
| **LGPD** | Dados de saúde = dado sensível (art. 11), DPO, RIPD, base legal por consentimento/risco |
| **EU AI Act** | IA em saúde = **high-risk** → gestão de risco, dados de qualidade, log automático, supervisão humana |
| **HIPAA/GDPR** | arquitetura multirregional, data residency |
| **ONC HTI-1 (EUA)** | critérios de TPS/DSI para funcionar em hospitais americanos |
| **COFEN / Coren** | Resolução de dimensionamento, competências do enfermeiro — o agente nunca substitui o registro profissional |

**Consentimento em 3 camadas**: uso assistencial (care) → gêmeo/simulação (twin) → pesquisa (research) — cada um com FHIR Consent próprio e revogável.

---

## 10. Camada 7 — Experiência

Casos de uso de entrada (quick wins, valor clínico imediato):
1. **Sugestor de SAE** (NANDA/NIC/NOC) — draft para o enfermeiro revisar.
2. **SBAR automático** a partir do PatientTwin para handoff e comunicação médica.
3. **Vigilância de deterioração** — agente monitora PEWS/NEWS2 e alerta com priorização.
4. **Educação ao paciente** multilíngue (pt-BR/en/es), nível de leitura adequado, citando CKOs.
5. **Dimensionamento de equipe** com UnitTwin + previsão de demanda.

---

## 11. Stack de referência

- **Orquestração**: LangGraph / Temporal (workflows duráveis) + MCP servers por CKO.
- **Dados clínicos**: HAPI FHIR / Google FHIR Store; OMOP para analítica.
- **LLM**: base aberta fine-tunável (Gemma/Llama/Mistral) + vLLM para servir; RAG sobre base vetorial dos CKOs.
- **A2A**: Agent Cards assinados (DID/VC) para confiança entre instituições.
- **Avaliação**: promptfoo/Ragas + NurseBench; MLflow para rastreio de modelos.
- **Observabilidade**: OpenTelemetry com semântica clínica (trace por encontro).

---

## 12. Roadmap

| Fase | Período | Entrega |
|---|---|---|
| 0. Fundação | Mês 1–2 | Schemas `Agent`, `AgentRun`, `AgentPolicy`, `SafetyEvent`; CKO → MCP resources |
| 1. Nurse-PaLM v0 (RAG) | Mês 2–4 | RAG sobre CKOs + saída estruturada NANDA/NIC/NOC; piloto SAE |
| 2. PatientTwin v1 | Mês 3–6 | Twin FHIR + escores (NEWS2, Morse, Braden); agente de deterioração em sandbox |
| 3. Orquestração | Mês 5–8 | Planner + HITL + handoffs; piloto em 1 unidade hospitalar parceira |
| 4. NurseBench público | Mês 6–10 | Publicação científica + benchmark open source (posicionamento global) |
| 5. Escala | Mês 10+ | A2A entre instituições, UnitTwin, certificações regulatórias |

---

## 13. Métricas de excelência mundial

- Segurança: **zero dano atribuído a agente** não detectado por guardrail; taxa de near-miss capturada (quanto maior a detecção, melhor o sistema).
- Clínico: acurácia NurseBench ≥ referência de especialistas; tempo de SAE reduzido ≥ 40% com aprovação do enfermeiro.
- Confiança: ≥ 90% de aceitação dos drafts por enfermeiros após 90 dias de uso.
- Alcance: 3 idiomas nativos, latência p95 < 2s para sugestões à beira do leito.

---

*Próximo passo sugerido: materializar `Agent`, `AgentRun`, `AgentPolicy`, `SafetyEvent`, `DigitalTwin` como entidades Base44 com dados-exemplo, e criar o primeiro MCP server de um CKO (Dipirona) como prova de conceito.*

---

## 14. Pipeline de Governança — Policy-as-Code (implementado)

```
policy-as-code → schemas → graph constraints → CI gates → runtime assertions → automatic evidence
```

**Implementação (02/09/2026):**
- Entidades criadas no Base44: `Agent`, `AgentPolicy`, `AgentRun`, `SafetyEvent`, `PolicyEvidence` (13 registros-exemplo).
- Engine executável em `policy-engine/pipeline.py` — 6 estágios como gates bloqueantes; falha → deploy BLOCKED + evidência assinada (sha256) gerada automaticamente.
- Políticas inaugurais: POL-001 (sem alteração de medicação), POL-002 (HITL obrigatório L2/L3), POL-003 (gate de deploy: NurseBench ≥ 0.80 + model card), POL-004 (confiança < 0.70 → handoff), POL-005 (guardrail ativo vinculado).
- Demonstração: RUN-2026-0002 (confiança 0.55) foi escalada automaticamente por POL-004 e virou SafetyEvent near-miss + evidência EV-2026-0003 — o ciclo completo detectar→bloquear→documentar sem intervenção humana.

**Regra de ouro:** deploy de agente sem evidência assinada de gate PASSED é proibido. A evidência é o insumo direto de auditoria (ANVISA RDC, EU AI Act Art. 12, LGPD art. 37).
