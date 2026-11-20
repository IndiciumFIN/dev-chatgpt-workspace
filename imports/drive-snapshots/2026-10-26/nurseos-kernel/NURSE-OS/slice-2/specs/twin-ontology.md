# Twin Ontology — Especificação (NOVO 22 + NOVO 23)

**Princípio:** o Digital Twin não é uma "ficha gigante de JSON". Ele é um estado operacional governado, ligado a uma ontologia formal, ligada ao Knowledge Graph — com tempo e proveniência como cidadãos de primeira classe.

## 1. A triade

```
TWIN (estado)  ↕  ONTOLOGIA (classes/formalismo)  ↕  KNOWLEDGE GRAPH (significado compartilhado)
```

Nada entra no twin sem classe ontológica, janela temporal e fonte.

## 2. Classes ontológicas do twin

| Classe | Representa | Exemplo | Entidade material |
|---|---|---|---|
| `Patient` | o sujeito do twin | fhir:Patient/88412 | PatientTwin |
| `Observation` | mensuração pontual | Morse 65 | TwinEvent (event_type=score) |
| `Condition` | condição clínica vigente | pneumonia comunitária | TwinEvent (event_type=condition) |
| `Medication` | exposição medicamentosa | varfarina 5mg/dia | TwinEvent (event_type=medication) |
| `Procedure` | intervenção realizada | fisioterapia respiratória | TwinEvent (event_type=procedure) |
| `Risk` | risco computado | queda (agravado por anticoagulante) | TwinEvent (event_type=risk) |
| `Event` | ocorrência | queda evitada / near-miss | TwinEvent + SafetyEvent |
| `State` | snapshot agregado e validado | PatientTwin v3 | PatientTwin (state_valid_from/to) |
| `Trajectory` | série temporal de estados | evolução do NEWS2 em 48h | TwinEvent (série) |
| `Intervention` | intervenção *planejada* | NIC 6490 prioritária | AgentRun.output |
| `Outcome` | resultado medido | sem quedas na internação | Outcome |

## 3. Temporalidade (regra dura — POL-011)

Todo fato do twin declara:

```json
{
  "valid_from": "…",        // obrigatório — quando passou a ser verdade
  "valid_to": null,          // null = vigente; preenchido quando deixa de ser verdade
  "source": "…",            // obrigatório — quem produziu (FHIR ref, CKO, escore, agente)
  "confidence": 0.9         // obrigatório — herda o Uncertainty Fabric
}
```

**Não existe fato atemporal no twin.** "Paciente tem risco de queda" sem janela temporal e fonte é exatamente o tipo de afirmação que apodrece o raciocínio clínico.

Consequências operacionais:
- Um escore com `valid_from` > 15 min atrás → `stale` → Context Integrity degrada autonomia (POL-006).
- Uma condição com `valid_to` preenchido não entra no Context Package como vigente.
- A pergunta "o que era verdade às 03h?" tem resposta computável — é a base de Trajectory e, depois, de Causal Intelligence (Fatia 4).

## 4. Evolução
- **v0 (Fatia 2, atual):** classes mapeadas em entidades; TwinEvent como registro temporal; PatientTwin carrega a janela de validade do snapshot (`state_valid_from/valid_to/source`).
- **v1 (Fatia 3+):** formalização em OWL/SHACL com validação de grafo no CI; binding CKO↔ontologia; Trajectory como consulta de primeira classe.
- **v2:** Causal Graph sobre Trajectory (NOVO 01) — o twin deixa de descrever o passado e passa a suportar "e se?".
