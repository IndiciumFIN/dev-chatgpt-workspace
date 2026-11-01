# CE — Registro canônico de continuidade dos backups auditados

**Data-base:** 2026-11-01. **Estado:** RECOVERED_FOR_AUDIT / CANDIDATE_HOLD / NO_MERGE / NO_DEPLOY / NO_DB_WRITE.

## Fonte da verdade e prevenção de perda de contexto

Este registro REFERENCIA os backups auditados e seus pareceres anteriores. A exportação mais recente NÃO substitui os históricos, não elege versões canônicas e não comprova aplicação de SQL no Supabase ou homologação clínica. O acervo original deve permanecer preservado. Antes de implementar ou integrar, reconciliar todas as branches, PRs, contratos e SHAs; registrar FIND → política → validador → tarefa → WO → Kernel → testes → auditoria → homologação.

## Fontes anteriores conferidas diretamente (TAR SHA-256)

| Fonte | Regulares | SHA-256 |
|---|---:|---|
| `sandbox-backup-completo.tar.gz` | 6.632 | `e642be5765089f47e060e69765bdc889637d5ec824f5d1f44a3b8f34f00fe935` |
| `sandbox-backup-completo (1).tar.gz` | 5.203 | `146353b81ea68f52cbec25468b8c235c62fd203d5824058737895329e1829edd` |
| `sandbox-backup-completo (2).tar.gz` | 5.221 | `bc2e60fa2e820dc90bc12aab383ea0275d1381dfc054fef0142e2b47a0e50564` |
| `sandbox-completo.tar.gz` | 4.518 | `644345d8c029a1accd33fa7a487e8c56d28863f05e674e1be22089841c307274` |
| `sandbox-completo (1).tar.gz` | 5.768 | `99680ecac588d152fb7e50130182cacdd02b5b563845f820a8cc09cd2041eda1` |
| `sandbox-completo (2).tar.gz` | 5.746 | `cc4989ac56e2e0d2911ac45d440c01d01f52d11e321e8e712fdb01821eb97100` |
| `sandbox-canonico-completo.tar.gz` | 16.433 | `3f8dc1170401dde7ccff07f72faa628ac29cd7db57692c03a173dd0cecdc7e42` |
| `itens-alterados.tar.gz` | 11 | `34d08ccc0aa8d2f76a1ff911f65fc7df70402dff4589d44c65689c03bea3c77d` |
| `ce-backup-completo-2026-11-01.tar.gz` | 5.509 | `69e68a41021cf6683519a68f6cde768d6e65b150c1dbc537f12d6de4d756ee89` |

Todas essas fontes foram materializadas da Biblioteca privada e os SHA-256 recalculados. Os arquivos sensíveis (incluindo `.env`) foram excluídos dos inventários exportáveis; não publicar TARs brutos no Git.

### Verificação adicional de duplicidade binária

O arquivo histórico `sandbox-completo (4).tar(2).gz` foi recuperado da Biblioteca e teve SHA-256 recalculado: `3f8dc1170401dde7ccff07f72faa628ac29cd7db57692c03a173dd0cecdc7e42`, **idêntico byte a byte** ao TAR `sandbox-canonico-completo.tar.gz` (mesmo hash e tamanho de 112.999.926 bytes). Mantê-los como aliases de uma mesma carga, preservando ambos os nomes/proveniências.

## Achados cumulativos e NÃO DESFAZER

- **865/865** arquivos de `src/families/` do primeiro TAR reaparecem byte a byte em `upload/ce-skeleton/ce-skeleton/src/families/` do TAR de 01/11. Isso é recuperação física, **não** 865 serviços implementados. Os 410 serviços do catálogo de esqueleto são candidatos.
- **Cinco** módulos `src/core/experience/` (`metamodel.ts`, `module-status.ts`, `profile-contracts.ts`, `resolver.ts`, `state.ts`) estavam no TAR canônico, mas não no TAR de 01/11 nem nos mesmos caminhos da branch candidata Git. São stubs `CANDIDATE_HOLD` (sem execução aprovada).
- **8.254** entradas `artifacts/fonte/` estavam no TAR canônico e não no TAR de 01/11; a pasta existe no Git da branch candidata. **57** migrations SQL do TAR canônico também não constam da raiz do TAR recente, mas a pasta `migrations/` existe no Git. Ausência no TAR recente NÃO é perda no Git.
- **10.933** caminhos do TAR canônico não aparecem no TAR recente. Desses, **9.519** conteúdos não aparecem nele nem por SHA-256 em outra pasta. **Esse é um delta entre EXPORTAÇÕES**, não uma afirmação de perda da árvore Git.
- Parecer e matriz histórica das **28 branches** (`CE_AUDITORIA_28_BRANCHES_2026-11-01.zip`) têm HEADs auditados em data-base anterior. **29 branches** foram observadas agora; recalcular SHAs e blobs antes de eleição/promover.
- Fontes anteriores apontam **seis JSONC Workflows-NK-Guard** ausentes do TAR, porém versionados no Git; não criar contratos substitutos arbitrariamente.
- Auditorias de esqueleto/CKO documentam **54** problemas de faixas etárias, **78** fórmulas sem source_binding_refs, **1.031** bindings HOLD sem validadores/bundles, e um gate de **20/21** com MST-04 pendente. Esses são achados HISTÓRICOS; requerem novo read-back, não podem ser declarados sanados nem atuais sem execução.
- Snapshot PMO com **137** tarefas (incluindo 22 do arquivo de novas tasks); não duplicar tarefas nem WOs automaticamente. Não substituir baseline/decisões anteriores por este índice.
- O TAR dividido de 01/11 foi verificado **4/4 partes SHA idênticos**, incluindo `part-01` reconstruída em ambiente local a partir do original autenticado.

## Restrições de retomada

1. Preservar históricos e comparar arquivos reais por caminho normalizado + SHA-256/Git blob; **não** adotar "última versão" como autoridade.
2. Reutilizar catálogos estruturais, dicionários, metamodelos, policies, WOs e PRs já existentes.
3. Não migrar direto para `main`, Supabase ou produção; não usar arquivos de ambiente ou placeholders como licença, revisão, aprovação ou admissão Kernel.
4. Manter estados `HOLD_HUMAN` ou `CANDIDATE_HOLD` em todo código e conteúdo não homologado.
5. Reconciliar a população vigente de 29 branches de forma multilateral; trabalhos de 28 branches são baseline, não validação do HEAD atual.

**Evidências detalhadas:** pacote privado `CE_RECUPERACAO_HISTORICA_CUMULATIVA_20261101.zip` contém índices SHA256+Git blob, deltas, 28 branches, relatórios originais e 870 arquivos candidatos em staging. Não incluiu TARs brutos nem segredos. As fontes originais permanecem na Biblioteca do ChatGPT.

## Handoff mais antigo recuperado — 18/10/2026

Fonte: `CE_MASTER_CONTINUITY_20261018.zip` na Biblioteca privada, SHA-256 `d306c356ff8e670ee64ef29c28b85f6d226994b982e9cca9e06314897d193b53`, 350 entradas (347 artefatos anteriores + três arquivos de continuidade). Seu `STATE.json` indica 14 branches em **outro repositório**, `IndiciumFIN/calculadorasdeenfermagem` (18/10), que **não** devem ser somadas às 29 de `IndiciumFIN/dev-chatgpt-workspace` (01/11). Preservar o handoff anterior e reconciliar entidades, blobs, WOs e decisões entre esses repositórios sem equiparar históricos por nome. Históricos ainda sem revalidação: 22 conflitos, 65 hashes CE04, 1.020 rastreabilidades estruturais, 303 outbox e 61 proveniências. O pacote original está preservado na Biblioteca; suas cópias não autorizam release.
