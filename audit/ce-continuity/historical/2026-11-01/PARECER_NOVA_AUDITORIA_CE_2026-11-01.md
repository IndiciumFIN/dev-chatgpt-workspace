# Parecer complementar — auditoria conjunta das 28 branches e do novo backup

**Data de execução:** 2026-11-01. **Repositório:** `IndiciumFIN/dev-chatgpt-workspace`. **Estado:** `READ_ONLY / HOLD_HUMAN / NO_MERGE / NO_DB_WRITE`.

## 1. Insumos confrontados

- `PARECER_28_BRANCHES_E_BACKUP(1).md`, `MATRIZ_AUDITORIA_28_BRANCHES(1).xlsx` e o pacote de evidências `CE_AUDITORIA_28_BRANCHES_2026-11-01 (1).zip`.
- Novo backup `sandbox-completo (4).tar(2).gz`.
- GitHub conectado: inventário das 28 branches e consultas diretas às PRs #29, #30, #31.

## 2. Teste independente de integridade do novo TAR

Recálculo local de **SHA-256 de cada arquivo regular**, comparado com a coluna `sha256` de `archive_files.csv` da auditoria anterior, por caminho normalizado:

| Medida | Resultado |
|---|---:|
| Arquivos regulares na referência anterior | 16.433 |
| Arquivos regulares no novo TAR | 16.433 |
| SHA-256 idêntico no mesmo caminho | 16.433 |
| Caminhos adicionados | 0 |
| Caminhos modificados | 0 |
| Caminhos removidos | 0 |
| Bytes descompactados | 318.419.740 |

**Conclusão:** o novo backup é idêntico, em caminhos e conteúdo, ao TAR já inventariado na auditoria fornecida. Não constitui atualização funcional. A verificação não certifica metadados de TAR, ordem de entradas, permissões ou igualdade binária do arquivo `.tar.gz` em si.

## 3. Reconciliação GitHub em leitura direta

Consulta GitHub `/branches?per_page=100`: **28 branches atuais; os 28 SHA HEAD coincidem com o CSV `comparacao_28_branches.csv` do pacote anterior**. Não foram identificadas branches adicionais ou movimentos de HEAD nessa consulta. Também não foi recalculada aqui a árvore recursiva de cada branch: a verificação exaustiva de caminhos e blobs continua sendo a evidência anterior, agora amarrada aos mesmos commits.

- `main`: `e9f7fe66075ebe5d7346072dc3a1b4934678c6de`.
- `integration/structural-overlay-20261101`: `621f73b5abde2dbb65818645c00d4821cbd3d061`.
- `plan/ce-reconciliacao-v6-20261101`: `e162ae06faf3ae157c752b926f2ffc9a829969b0`.
- `feat/projection-unica-f0-suite-real`: `6d712dd47029286869f909a2014f42083f5db2a9`.

PR #30: aberta, não draft, não mesclada, 497 arquivos alterados, tecnicamente mergeable=true (não é autorização). PR #31: aberta, draft, não mesclada, 23 arquivos alterados, mergeable=true. PR #29: aberta, não mesclada, 128 arquivos alterados. Todos os três têm base `main` no HEAD `e9f7fe66...`.

## 4. Pendências preservadas, sem abertura artificial de tarefas

A última auditoria identifica: (a) 865 arquivos `src/families` e cinco módulos `src/core/experience` presentes apenas no TAR nesses caminhos; (b) seis contratos JSONC Workflows-NK-Guard presentes no Git, ausentes do TAR; (c) 149 colisões no relatório Wave 10, 57 equivalências candidatas e 92 não equivalências; (d) 57 migrations SQL locais sem prova de aplicação no Supabase; (e) 8.254 arquivos de `artifacts/fonte` preservados na branch de projeção, sem liberação editorial; (f) `.env` incluído no TAR e sujeito a revisão antes de redistribuição.

A PR #31 declara 16 violações de contrato e 0 erros de dado no gate revisado (conforme descrição do PR). Essa informação não substitui a execução independente de testes, nem a conferência de runtime OPA/KERNEL. O status atual de produção/Vercel/Supabase não foi auditado neste procedimento.

## 5. Parecer

**`NO_CHANGE_BACKUP / HEADS_UNCHANGED_28_OF_28 / RELEASE_HOLD`**.

A nova remessa não adiciona conteúdo: a reconciliação anterior continua atual para as 28 árvores já verificadas. A integração não está homologada para `main`. Priorizar a resolução dentro das WOs existentes das divergências Kernel/OPA/contratos e dos seis contratos ausentes do TAR; só depois reexecutar gates, revisões independentes, segurança/licenças, migrações em banco descartável e validação clínica. Reexaminar SHAs imediatamente antes de qualquer promoção.

**Ações não executadas:** commits, merge, alteração no Supabase, alteração no Vercel, deploy, novas WOs.