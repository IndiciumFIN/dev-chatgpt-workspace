# Candidatos técnicos v0.1.5–v0.1.9 (não aplicados)
**Atenção:** Este arquivo arquiva a semântica dos patches; a versão byte-a-byte está nos ZIPs listados em `ARQUIVOS-LOCAIS.json`, não neste commit.

## Reparos em código
- `registers/governance/candidates/WO-RES-PART-001.json`: substituir `execution_status=VALIDATED_CANDIDATE` (inválido no enum) por `BLOCKED`; excluir campo `validation_evidence` não permitido e vincular run CI por `assurance_refs`/objeto `audit_evidence` canônico. Preservar `kernel_admission=NOT_SUBMITTED` e `HOLD_HUMAN`.
- `src/components/research/research-hub.tsx`: remover `useMemo` condicional do relatório, computar texto diretamente; revisar `useDraft` para não persistir dados sensíveis automaticamente.
- `src/lib/research-participation.functions.ts`: gate de laboratório estritamente servidor, LOCAL e opt-in, negando acesso por padrão; não declarar coleta pública ou identidade real a partir de UUID anônimo.
- `scripts/research-participation-e2e.mjs`: substituir teste de persistência automática por teste de rascunho efêmero e de limpeza consentida; preservar demais fluxos candidatos sem inferir segurança geral.
- `.github/workflows/research-participation-candidate.yml`: opt-in local/CI, contratos, policy tests negativos e hooks; executar com SHA de fonte efetivamente montado.
- `scripts/check-pmo-queue.mjs`: extrair somente reparo da PR #13 conferindo evento + autorização escopada de `WO-ADM-001=IN_PROGRESS`; preservar HOLD da `WO-HOM-001`.

## Novos artefatos propostos e não materializados como código ativo neste branch
- `src/lib/research-lab-policy.ts` e `src/lib/research-lab-gate.server.ts`, `tests/research-lab-policy.test.mjs`, `scripts/check-research-contract-parity.mjs`.
- `scripts/assemble-convergence.mjs` (v0.1.7); `scripts/verify-source-and-artifacts.mjs` (v0.1.9 substitui v0.1.8); scripts e testes correspondentes. São auxiliares locais a manter fora do runtime enquanto WO pendente.

## Evidência/testes e limites
v0.1.5: 9/9; v0.1.6: 29/29; v0.1.7: 13/13; v0.1.8: 17/17; v0.1.9: 16/16; reexecução declarada 84/84 testes de ferramentas isoladas, sem teste completo de aplicação integrada. Esses valores não equivalem a cobertura 100% nem autorização de release.
