# Plano de Execução — Piloto Real da NURSE-OS
**Versão:** 1.0 (03/09/2026) — derivado do `architecture/nursing-intelligence-os-v2.md` (Fatias 0–4 + Nurse-PaLM v0 + NurseBench v0/v0.1 completos)

## 1. Pré-requisitos de entrada (GO/NO-GO)

| # | Pré-requisito | Status | Responsável |
|---|---|---|---|
| P1 | Champion clínico (enfermeiro com autoridade) aprovando o Safety Case SC-2026-0001 | **pendente** — bloqueia produção (POL-015, intencional) | Leivis |
| P2 | Licença comercial NANDA-I | **pendente** — bloqueio legal do piloto com SAE real (KnowledgeLicense: required) | Leivis |
| P3 | Enquadramento ANVISA (software de saúde, TEC/REBLA) — análise antes de qualquer instituição real | monitoring (REG-BR-ANVISA-SW-SAÚDE) | Leivis + jurídico |
| P4 | RIPD (LGPD art. 11) quando houver dados reais de pacientes | pendente | Leivis + DPO da instituição |
| P5 | Instituição parceira: 1 unidade, consentimento tripartite (care/twin/research) no PatientTwin | pendente | Leivis |
| P6 | LLM real no slot do Model Router (API ou local) — dentro das mesmas asserções | pendente | engenharia |
| P7 | ckoLookup HTTP (bug da plataforma Base44) ou fallback local | pendente | engenharia |

## 2. Fases do piloto

**Fase 0 — Setup (2 semanas):** P1, P2, P5 resolvidos; Corpus CKO validado pelo champion; Model Router v0.2 com LLM real; baseline do NurseBench recalibrado (N ≥ 100 casos adversariais).

**Fase 1 — Shadow Mode (4 semanas):** o SAE Copilot roda em paralelo ao fluxo real, **sem saída visível** à equipe; enfermeiros independentes avaliam rascunhos cegos (agent vs. humano); coleta: taxa de admissão (NurseBench), desvios clínicos, falsos positivos do detector. Critério de saída: ≥ 95% dos rascunhos citando corretamente + zero violação POL-001 não detectada.

**Fase 2 — Draft Assistido (8 semanas):** L1 visível ao enfermeiro da unidade (rascunho para revisão, HITL em toda saída); tudo dentro do envelope: Context Package, provenance, uncertainty, behavioral profile, threat screening. Critério de saída: outcome de safety (quedas evitadas / near-misses capturados) + aceitação do enfermeiro ≥ 70%.

**Fase 3 — Expansão:** PEWS Sentinel sai do sandbox (safety case próprio + champion), WorkforceTwin com dados reais de dimensionamento, contrapressão regulatória (COFEN).

## 3. Critérios de aborto (não negociáveis)
- Qualquer violação de POL-001 em produção → desligamento imediato + SafetyEvent + RCA.
- Queda do champion clínico → pausa (a governança humana é pré-requisito, não acessório).
- Incidente de privacidade (LGPD) → congelamento do twin + comunicação ao titular.

## 4. O que já está pronto e não precisa ser refeito
Pipeline v1.5 (21 políticas, evidência assinada por gate), contratos dos agentes, schemas de Context/Uncertainty/Decision, Temporal KG, org/workforce twins, Contradiction/Knowledge Evolution/Regulatory/Safety Case engines, Threat + Collusion + Behavioral Firewall, Negotiation, Mission Assurance, Nurse-PaLM v0 com recusa comprovada, NurseBench v0 (tese provada) e v0.1 (10/10 adversarial, detector adotado em produção pela POL-001 v1.1).
