# Auditoria Git de branches existentes — 2026-11-14

Repository: `IndiciumFIN/dev-chatgpt-workspace` (acesso GitHub App; **público**).

| Branch | Ahead | Behind | Relação de conteúdo | Decisão |
|---|---:|---:|---|---|
| staging/bibliotecas-corpus-20261026 | 4 | 364 | Arquivos de bibliotecas e handoffs | CROSSWALK_ONLY |
| work/editorial-canonical-learning-20261026 | 42 | 363 | DB-first, schemas, piloto editorial, CI | REUSE_EXISTING_CONTRACTS |
| import/drive-cko-nurseos-20261026 | 24 | 363 | imports de conteúdo e schemas CKO/NurseOS | HASH_ID_COMPARISON |
| canonical/foundation-20261101 | 52 | 9 | fundação/contratos, PR #36 (13550 arquivos) | DO_NOT_MERGE_BULK |
| audit/ce-wave1-evidence-20261101 | 0 | 72 | auditoria histórica | HISTORICAL_REFERENCE |
| plan/ce-reconciliacao-v6-20261101 | — | — | PR #31, mergeable false no momento | HOLD_CONFLICT_REVIEW |

Os dados são resultados da comparação com `main` no momento da inspeção; o estado pode mudar. Esta branch PMO e a branch editorial são **novos deltas controlados** com caminhos `cko/` para evitar choque. PRs novos devem ser draft, sem auto-merge e sem aprovação automática.
