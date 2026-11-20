# Matriz de Cobertura de Governança — NURSE-OS
**Data:** 03/09/2026 — auditoria respondendo: "temos as camadas horizontais e verticais devidamente governadas, de ponta a ponta?"

## 1. Camadas HORIZONTAIS (fabrics que atravessam tudo)

| # | Fabric horizontal | Antes da auditoria | Depois (hoje) | Política |
|---|---|---|---|---|
| H1 | Policy-as-code | ✓ governado | ✓ | POL-001..025 |
| H2 | Evidence (assinatura por gate) | ✓ governado | ✓ | POL-008 |
| H3 | Uncertainty | ✓ governado | ✓ | POL-007 |
| H4 | Temporal KG (validade dos fatos) | ✓ governado | ✓ | POL-011 |
| H5 | Human Governance / HITL | ✓ governado | ✓ | POL-002, POL-015 |
| H6 | Segurança agêntica (threat/colusão/behavioral) | ✓ governado | ✓ | POL-017..019 |
| H7 | Regulatory | ✓ governado | ✓ | POL-014 |
| H8 | Learning (sem automodificação) | ✓ governado | ✓ | POL-009 |
| H9 | Knowledge Evolution | ✓ governado | ✓ | POL-013 |
| H10 | **Identidade & Autorização** | ✗ **LACUNA** — quem executa? sob que papel? | ✓ fechada | **POL-022** |
| H11 | **Consentimento/Privacidade** | ✗ **LACUNA** — consent existia no twin mas nada o exigia no runtime | ✓ fechada | **POL-023** |
| H12 | **Observabilidade/Drift** | ~ parcial — perfis existiam, sem mandato de reavaliação | ✓ fechada | **POL-024** |
| H13 | **Completude vertical** | ✗ **LACUNA** — nada exigia que um vertical fluísse ponta a ponta para contar como "coberto" | ✓ fechada | **POL-025** |

**Veredito horizontal:** ponta a ponta de verdade somente após o fechamento de H10–H13. A auditoria transformou "achamos que está tudo coberto" em quatro políticas verificáveis.

## 2. Camadas VERTICAIS (fluxos de uso, da fonte ao outcome)

| # | Vertical | Missão → Delegação → Run → Outcome | Estado |
|---|---|---|---|
| V1 | SAE drafting | MIS-0001 → DR-0001 → RUN-0005 → OUT-0001 | **COVERED** — único vertical provado ponta a ponta |
| V2 | PEWS / early warning | (sem missão) → (sem delegação) → RUN-0002 → OUT-0002 | **PARTIAL** — executa e gera outcome, mas não nasce de missão nem passa pelo Negotiation |
| V3 | Educação ao paciente | MIS-0002 → DR-0002 (failed_no_provider) → — → — | **BLOCKED** — lacuna de fornecedor documentada (roadmap) |
| V4 | Workforce/dimensionamento | WorkforceTwin + UnitTwin existem, **sem fluxo agêntico** | **DATA_LEVEL** — dado governado, sem consumidor |
| V5 | Organização/capacidade | OrganizationTwin idem | **DATA_LEVEL** |
| V6 | Segurança de medicação | CKO dipirona (CON-0001, KCH-0001) | **KNOWLEDGE_LEVEL** — conhecimento governado, sem agente dedicado |

**Veredito vertical:** 1 de 6 provado ponta a ponta; 1 parcial; 1 bloqueado por design; 3 ainda são dado/conhecimento sem fluxo. A POL-025 agora **proíbe declarar um vertical como "covered" sem os quatro elos** — o estado de cada vertical é assertion, não opinião.

## 3. Consequência para o piloto
A Fase 0 do piloto deve exigir: V1 recalibrado com dados reais + V2 completado (missão + delegação para o PEWS Sentinel). V4/V5/V6 ficam como roadmap explícito — entrar no piloto como "data level" declarado é honesto; fingir cobertura vertical não é.
