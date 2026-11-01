# CE — Aplicação candidata v0.6.4 — BASE FIRST

Este pacote é uma evolução local da v0.6.1 e usa as correções de fail-closed preparadas na v0.6.2. **Não há código aplicado na branch remota** e nenhuma migração de banco foi executada.

**Prioridade:** leia `docs/CE_ORDEM_INTEGRACAO_BASE_A_PUBLICACAO_v0.6.3.md`, `docs/CE_BASE_ESTRUTURAL_20261101.json` e execute a auditoria **read-only** da estrutura antes de qualquer correção em componentes, páginas ou serviços.

```sh
python3 apply_patch.py --verify-package
node --test scripts/governance/*.test.mjs
node scripts/governance/structural-base-gate.mjs
# Somente em clone Git completo, depois de git fetch --all --prune:
node scripts/governance/structural-base-gate.mjs --git-check
node scripts/governance/inventory-branch-candidates.mjs > ./relatorio-candidatos.json
```

`--git-check` não autoriza merge. O snapshot datado fica inválido se qualquer branch avançar. O script de inventário completo examina as refs e todos os blobs, sem eleger versão canônica. O instalador deliberadamente bloqueia `--apply` sem verificador independente do Kernel; `--work-order` textual não prova admissão.

**Destino futuro, não executado:** `integration/structural-overlay-20261101` (base SHA `081c61ac6c6ea674934d1cad3c310e96476fc9a1`). PR #30 é HOLD, não publicar ou fazer merge para `main` enquanto faltarem provas de admissão, CI full, resolução de conflitos e regras de proteção.


## Atualização v0.6.4 — inventário bidirecional de todas as branches

Adicionado o reconciliador determinístico `scripts/governance/structural-reconcile-all-branches.mjs` e o módulo de testes `scripts/governance/lib/structural-reconcile-core.test.mjs`. Em um clone Git integral, com refs remotas atualizadas e checkout exato da branch de integração, execute:

```sh
git fetch --no-tags --prune origin '+refs/heads/*:refs/remotes/origin/*'
node --test scripts/governance/lib/structural-reconcile-core.test.mjs scripts/governance/*.test.mjs
node scripts/governance/structural-reconcile-all-branches.mjs --output /tmp/ce-base-first/branch-structural-audit.json
```

A checagem cobre SOURCE_ONLY, CANDIDATE_ONLY, COLLISION, IDENTICAL e histórias sem ancestral comum, com reinspeção das refs remotas ao final. O script anterior `inventory-branch-candidates.mjs` é preservado como histórico, mas seu resultado unilateral **não é suficiente** para o gate BASE-00.

O SQL `scripts/governance/structural-db-inventory.readonly.sql` fornece inventário de tabelas, colunas, PK/FK, RLS e privilégios sem executar DDL. Não embutir credenciais no Git.

**Proibição mantida:** `--apply`, merge, produção, alteração de Supabase e aprovação Kernel não são executados nem habilitados pelo pacote.
