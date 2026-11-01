# Knowledge Evolution Engine — Especificação (NOVO 04)

**Princípio:** conhecimento clínico muda. O sistema descobre automaticamente o que uma mudança afeta, revalida, retesta, recertifica e só então publica. Conhecimento que muda sem impact graph é passivo de erro clínico silencioso.

## 1. O ciclo

```
NEW EVIDENCE / GUIDELINE UPDATE
        ↓
NEW CLAIM (validada pelo Contradiction Engine)
        ↓
KNOWLEDGE CHANGE (cko://… v1.0.0 → v1.1.0)
        ↓
IMPACT GRAPH (descoberta automática)
        ↓
Affected:
  ├── Knowledge Objects (CKOs que citam o CKO alterado)
  ├── Rules & Policies (que dependem do conteúdo)
  ├── Calculators (que usam parâmetros)
  ├── Protocols
  ├── Agents (que citam o CKO em knowledge_refs)
  ├── Models & Learning Candidates (treinados com o conteúdo)
  ├── Training Material / Educação ao paciente
  ├── Simulations & Twin Logic (que usam o conhecimento)
  └── Safety Cases (que argumentam sobre o comportamento)
        ↓
REVALIDATE → RETEST (evidência nova) → RECERTIFY → PUBLISH
```

## 2. Regras duras (POL-013)

1. **Nenhuma mudança de versão de CKO que afeta produção é publicada sem impact graph computado** (lista de afetados não vazia).
2. Todo objeto afetado em produção precisa de `revalidation_status = completed` + evidência de reteste + `recertified = true`.
3. Agents que citam o CKO alterado **suspendem asserções baseadas na versão antiga** — a provenance runtime (Fatia 1) diz exatamente quais runs usaram qual versão, então o impacto é rastreável por decisão.

## 3. Por que isso casa com o resto da arquitetura
- **Evidence Graph:** o decision_id registra a versão do CKO usado → o impact graph encontra todas as decisões que tocaram a versão antiga.
- **Safety Case:** material novo pode invalidar argumento → safety case entra em revisão.
- **Regulatory Intelligence:** mudança regulatória dispara o mesmo ciclo (a diferença é a origem do gatilho).

## 4. Implementação atual (Fatia 3)
- Entidade `KnowledgeChange` com impact graph materializado (`affected_objects[]` tipado), revalidação, evidência de reteste e recertificação.
- POL-013 com asserção no pipeline: mudança aplicada a produção exige impact graph + revalidação concluída + recertificado.
