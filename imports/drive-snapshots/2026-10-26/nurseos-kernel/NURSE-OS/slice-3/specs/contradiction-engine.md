# Contradiction Engine — Especificação (NOVO 03)

**Princípio:** o sistema não pode simplesmente fazer RAG e escolher uma frase. Quando Fonte A sustenta X e Fonte B sustenta ¬X, a contradição é um objeto de primeira classe — detectada, protocolizada e resolvida com método declarado.

## 1. O protocolo de resolução

```
CLAIM X (fonte A)          CLAIM ¬X (fonte B)
        \                     /
         CONTRADICTION DETECTED
                   │
     1. SOURCE AUTHORITY    — quem tem mais autoridade para este domínio?
     2. DATE / RECENCY      — qual afirmação é mais fresca?
     3. EVIDENCE QUALITY     — qual suporte probatório é mais forte?
     4. JURISDICTION         — valem para qual contexto regulatório/país?
     5. CONTEXT              — as duas podem ser verdade em contextos distintos?
                   │
              RESOLUTION
     (source_authority | date_recency | jurisdiction | context_specific
      | both_true | human_adjudicated | unresolved)
```

## 2. Regras duras (POL-012)

1. **Contradição não resolvida entra no Context Package como `uncertainty.state = conflicting`** — e a autonomia do agente é degradada (POL-006).
2. **Nenhum RAG escolhe frase vencedora silenciosamente.** A escolha sem protocolo é violação de política.
3. Contradições com risco clínico (`requires_human_review = true`) só são fechadas por `human_adjudicated`.
4. A resolução registra o **método** e a **nota** — "resolvido" sem método declarado não conta como resolvido.

## 3. Caso exemplar registrado (real)

Estimativas de risco de agranulocitose por dipirona divergem por ordens de magnitude entre estudos europeus (~1:1.000.000) e latino-americanos (até ~1:1.439 em algumas séries). Isso não é erro de dados: é conflito metodológico genuíno. Resolução correta: `both_true` + `context_specific` — o CKO carrega a faixa com incerteza explícita, e o agente **nunca** apresenta uma das pontas como certeza. É exatamente o tipo de nuance que um RAG ingênuo destrói.

## 4. Implementação atual (Fatia 3)
- Entidade `Contradiction` com claims (fonte, texto, autoridade, data), protocolo, método de resolução e status.
- POL-012 com asserção no pipeline: toda contradição tem método declarado; não-resolvida exige revisão humana.
- Ligação com Uncertainty Fabric: `uncertainty.conflicts[]` (Fatia 1) referencia o `contradiction_id`.

## 5. Evolução
- Detecção automática na ingestão de CKOs (comparação de claims entre fontes — Fatia 3+: NLP de extração).
- Grafo de contradições: quais CKOs compartilham conflitos, e quem foi afetado por cada resolução.
