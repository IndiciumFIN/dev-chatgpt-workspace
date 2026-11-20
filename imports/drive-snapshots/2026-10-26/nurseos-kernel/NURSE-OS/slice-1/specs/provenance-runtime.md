# Provenance Runtime — Especificação (NOVO 11)

**Princípio:** proveniência não vive só no banco. Ela **acompanha a execução**. Cada passo do pipeline de execução de um agente carrega um bloco de proveniência fechado.

## A cadeia de passos instrumentada

```
INPUT → RETRIEVAL → MODEL → TOOL → OUTPUT
```

Cada passo emite:

```json
{
  "provenance_id": "string",
  "step": "input | retrieval | model | tool | output",
  "source": "o que foi consumido (context package, CKO, observation)",
  "version": "versão do que foi consumido (CKO 1.0.0, modelo v0, twin v3)",
  "timestamp": "ISO-8601 com timezone",
  "hash": "hash do conteúdo consumido/produzido",
  "actor": "quem executou (agent_slug, tool, model)",
  "policy": "POL-… sob a qual o passo foi autorizado",
  "context": "package_id do contexto vigente"
}
```

## Regras

1. **Nenhum passo sem provenance_id.** Um passo sem provenância não entra no AgentRun (runtime assertion do pipeline v1.1).
2. **O hash fecha o ciclo:** o output só é aceito se o hash do passo anterior bate com o que foi registrado.
3. **Context Package é auditável:** `input_state_digest` do Decision Record = hash do Context Package — sabemos exatamente o que o modelo viu, sem expor raciocínio interno.
4. **Provenance ≠ log:** log é telemetria de operação; provenance é a cadeia de custódia do raciocínio clínico. Ambos existem, mas só a segunda é evidência.
5. **STALE é estado explícito:** se a fonte consumida exceder a janela de validade (ex.: escore PEWS > 15 min), o passo registra `stale: true` e o Context Integrity Engine degrada a autonomia.

## Implementação atual (Fatia 1)
- Campo `provenance` (array de blocos) no `AgentRun`.
- Runtime assertion no `policy-engine/pipeline.py` v1.1: todo passo com provenance_id + actor + version + hash.
- O Decision Record (`slice-1/schemas/decision-record.schema.json`) referencia os provenance_ids dos tool_calls.

## Evolução (Fatia 2+)
- Provenance graph persistido (não apenas array): nós = passos, arestas = dependência de dados.
- Cross-run provenance: quando o output de um run vira input de outro (agente consome decisão de agente).
- OpenTelemetry com semântica clínica: trace por encontro FHIR, spans tipados por passo.
