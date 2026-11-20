# W2.1 — Inventário exaustivo por arquivo das PRs #32 e #36

**Data:** 2026-11-20  
**Escopo:** CE/CKO/NCOS, `IndiciumFIN/dev-chatgpt-workspace`; somente análise estrutural de Git.  
**Baseline canônico fixado:** `main@d977c6ef1e142d4a5c9dd3dfc528912b44f3b031`, tree `e72c4f34d6f2265d79992502ea4c2fca5c5fe8ce`.  
**Origem #32:** `8c0c4b6f9c049bb5bf13de260074b5020b08a07d`, tree `7ef0814dd98acaa0428325c2cfcbaa4d5ad9b231`.  
**Origem #36:** `65486491dece96e107a1f3f5172a473d7421f14d`, tree `e112786bc917a99b50bc41f45718118d6d1289c8`.

## Resultado comprovado da enumeração recursiva

Para cada árvore raiz, foi consultado o endpoint Git de árvores com `?recursive=1`. As três respostas retornaram `truncated=false`; os diretórios foram contabilizados separadamente dos blobs, links simbólicos e demais entradas não-tree. A comparação é a união ordenada de paths, com SHA de blob e modo de arquivo, persistida em registro integral na `main`.

| Contagem | PR #32 | PR #36 |
| --- | ---: | ---: |
| Arquivos/entradas não-tree na origem | 15.595 | 16.022 |
| Arquivos/entradas não-tree na main fixada | 3.133 | 3.133 |
| Paths na união exaustiva | 16.216 | 16.242 |
| Mesmo SHA Git e modo (E) | 2.072 | 2.450 |
| SHA divergente e modo igual (D) | 140 | 163 |
| Somente origem (S) | 13.083 | 13.109 |
| Somente main (C) | 621 | 220 |
| Tipo ou modo diferente (T) | 300 | 300 |

**Manifestos completos, um registro para cada path**:

- [PR #32](../../registers/governance/ce-w2-1-pr32-full-tree-union-20261120.v1.json); Git blob `8d570f45bc953860d798d09caac123bb9c54ab6d`.
- [PR #36](../../registers/governance/ce-w2-1-pr36-full-tree-union-20261120.v1.json); Git blob `ebdd0bb3a43c2ccf3b8873fe2644f72253c2b5b0`.

O teste `scripts/ce-w2-1-full-tree.test.mjs`, incluído automaticamente em `npm test`, valida identidade dos blobs por hash Git, ordenação/ausência de duplicações, contagens por categoria e raiz, integridade formal, vínculo aos SHAs fixados e vedação de `SEALED` prematuro.

## Interpretação e limites

**Esta etapa satisfaz a enumeração completa das árvores de origem e main fixadas; não prova que todas as diferenças estão classificadas semanticamente ou integradas.** O W2 histórico permanece imutável: a lista de arquivos alterados nas PRs #32/#36 continuou limitada a 500 entradas na API de changed-files. As 13.770 e 13.550 alterações declaradas pelo GitHub são o delta histórico contra a base de cada PR e **não equivalem** à união de árvores atual feita no W2.1.

Os principais volumes exclusivos da origem, em ambas as PRs, concentram-se em `artifacts/` (8.267), `src/` (2.121), `_archive/` (948), `upload/` (879), `audit/` (280/285), `imports/` (235) e `bibliotecas-corpus/` (105). Presença em `intake/` ou `artifacts/` não significa funcionalidade aprovada. Os 300 casos de `T` por origem exigem inspeção de modo, symlinks, LFS e licenciamento antes de movimentação.

**Pendências:** analisar todos os `D/S/T` por semântica e risco; decidir retenção de `C` sem sobrescrever a main; conciliar migrations, Kernel e executáveis; confirmar direitos e normas oficiais; relacionar Supabase/Drive; testar e obter revisão independente. A PR #72 permanece em NO-GO até revogação/rotação da credencial OAuth comprometida, prova do emissor e homologação de auth. Não executar merge, deploy, DDL remoto ou exclusão com base neste inventário.

## Próximo gate

- **W2.2:** agrupar conteúdo idêntico entre PR #32 e #36 e órfãs por SHA/objeto, para revisar uma única vez.
- **W2.3:** fazer triagem por objeto, distinguindo `INTEGRATED_VERIFIED`, `EXACT_IN_CANONICAL`, `SUPERSEDED_WITH_PROOF`, `REJECTED_WITH_PROVENANCE` e `ARCHIVED_INERT_WITH_PROOF`.
- **W2.4:** cross GitHub × Supabase × Drive com rastreabilidade e direitos, sem expor metadados privados.
- **W2.5:** lotes independentes de até 25 mudanças na main após gates.
- **W2.6:** exigir prova independente para `SEALED`, caso a caso.

**Estado:** `FULL_TREE_FILE_UNION_INVENTORIED` para as duas PRs no baseline fixado; `TRIAGED=false`, `INTEGRATED_OR_DISPOSED=false`, `SEALED=false`, `no_revisit=false`. Reabrir somente os trechos afetados por mudanças futuras, respeitando a norma de closure.
