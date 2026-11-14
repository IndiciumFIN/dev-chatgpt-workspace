# Branch canônica local — 2026-11-01

Estado: `LOCAL_ONLY / HOLD_HUMAN / NO_MERGE / NO_PUSH / NO_DB_WRITE`.

Esta branch não é release, não é `main` e não foi enviada ao remoto.

## O que foi comparado

| Fonte | Resultado |
|---|---|
| Repositório local `/workspace` | `grook_10_26` em `eb2d479`. 305 arquivos. Sem ancestral comum com `main`. |
| 28 branches no GitHub | Os 28 HEAD do parecer de 2026-11-01 conferem com `comparacao_28_branches.csv`, exceto a nota abaixo. |
| Backup novo | Delta do anexo: 16.433 arquivos, 0 adicionados, 0 modificados, 0 removidos. O TAR de 113 MB não estava no disco desta sessão; a conclusão usa o parecer e o JSON de delta. |
| `idioma/consolidado-19` | A matriz auditou `a325db7`. O remoto agora está em `3dc979a` (migração `0005_revisao_idiomas.sql`). Essa diferença não entra nesta árvore. |

## Por que esta árvore

Nenhuma das 28 branches é igual ao backup de 16.433 arquivos. A que mais coincide com o TAR é `feat/projection-unica-f0-suite-real` (8.567 caminhos iguais), mas ela não tem ancestral comum com `main`.

A base desta branch é `integration/structural-overlay-20261101` em `621f73b`: 2.332 arquivos, história ligada à `main`, 1.028 caminhos iguais ao TAR e 122 caminhos com hash diferente. É a candidata de integração já aberta na PR #30. Não foi mesclada com `grook_10_26` nem com a projeção.

## O que esta branch não faz

- Não promove `main`.
- Não grava no Supabase.
- Não publica no Vercel.
- Não aprova conteúdo clínico.
- Não incorpora `.env`.
- Não resolve as 92 não equivalências do Wave 10, os 865 arquivos de `src/families` nem os seis contratos JSONC que estão só na branch de importação.

## Banco canônico local

`0001` a `0003` são iguais aos de `grook_10_26`. `0004` a `0035` foram copiados dessa branch e aplicados num banco local. `0036` e `0037` acrescentam `review_item`. `0038` grava as divergências em `canonical_divergence`.

`scripts/baixar-tar.py` procura o TAR no disco, numa release do GitHub ou num `--url`. Nesta sessão não havia cópia. Sem o arquivo, a saída é 2. Se o conteúdo não tiver os 16.433 caminhos do inventário, nada é extraído e o `.env` nunca entra.

