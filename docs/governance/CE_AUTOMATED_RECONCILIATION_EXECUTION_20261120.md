# CE.CROSS.AUTO.v1 — Reconciliação recorrente do ecossistema

**Data:** 20/11/2026. **Destino canônico:** IndiciumFIN/dev-chatgpt-workspace@main. **Estado:** candidato, não aprovado para merge/release.

## Fluxo automatizado e limites

1. `.github/workflows/ce-live-branch-reconciliation.yml` usa GitHub Actions, GITHUB_TOKEN com `contents: read`, checkout sem credencial persistida, `git fetch` das refs do repositório público e `git ls-tree -rz` por SHA imutável. Com isso não sofre o limite de 300 arquivos na comparação REST de commits. Execução sob PR, manual e duas vezes ao dia após integração legítima à main. Cron GitHub é best effort, não SLA.
2. O ledger de 63 entradas é a fonte de escopo: 48 branches CE, 14 WU-TRIB isoladas, 1 main histórica. Nunca atualizar SHAs históricos em silêncio; registrar branches ausentes, HEAD movimentado, nova branch não classificada e objetos Git não mais disponíveis.
3. O reconciliador `scripts/ce-live-branch-reconcile.mjs` compara todas as árvores Git completas contra a `main` corrente usando (path, blob SHA, file mode, object type). Classifica EXACT, SOURCE_ONLY, DIFFERENT_BLOB, MODE_OR_TYPE_CHANGED, CANONICAL_ONLY. Gera fila por prioridade P0/P1/P2 e ID SHA-256 determinístico do candidato, com todas as origens/branches, sem mesclar códigos.
4. `scripts/lib/ce-live-branch-reconcile-core.mjs` contém parser NUL de árvores e lógica de comparação; `scripts/ce-live-branch-reconcile.test.mjs` testa perda de cobertura, SHAs alterados, refs ausentes, duplicados, isolamento do WU-TRIB e controles de HOLD. O mesmo runner produz progresso por árvores e resumo no GitHub Actions.
5. Artefato Git-only guarda caminho e SHA de blobs do **repositório público** e fila de revisão, por 14 dias. Não exporta conteúdo original, binários, segredos, PHI nem documentos/IDs de Drive ou tabelas privadas. Não executa arquivos recuperados de branches históricas.

## Correções de interpretação obrigatórias

- `git ls-tree -r` cobre completamente árvores de commits acessíveis, mas **não prova a lista histórica completa de alterações da PR**. Os dois casos com PR API truncada continuam HOLD até reconciliação do diff próprio da PR.
- `git_blob_sha` identifica objeto Git (SHA-1), não é o SHA-256 dos bytes originais nem prova equivalência semântica.
- Igualdade exata de blobs não equivale a admissão funcional; divergência não prova perda. Classificações P0/P1/P2 são triagens; decisões semânticas e de licença continuam humanas/verificáveis.
- `auto_merge=false`, `release_eligible=false`, `source_branches_sealed=false`; nenhum status de `SEALED` é promovido. Não chamar GitHub Actions de motor clínico.

## Supabase e Google Drive (cross multiorigem ainda separado)

- **Supabase:** coletar via conector ou cliente SQL somente leitura o catálogo de schema, tabelas, chaves, grants, RLS, policies, migrations e relações de ferramentas clínicas. Excluir dados pessoais, credenciais e conteúdo clínico confidencial; registrar contagem e revisão do snapshot no ambiente privado.
- **Drive:** em cada conta e escopo, paginar até cursor exaurido, registrar revisão/MIME/pai/tamanho, calcular SHA-256 só quando bytes e direitos de acesso forem comprovados. Nomes iguais não são duplicatas provadas. Arquivos privados nunca devem virar artefatos públicos do GitHub.
- **Cross N-vias:** alimentar o motor existente `scripts/ce-cross-reconcile.py` com snapshots padronizados de GitHub, Supabase e Drive; validar `complete` e `cursor_exhausted` com logs, identidade canônica, hashes e direitos. Nenhum conector ChatGPT cede automaticamente credenciais a GitHub Actions. Sem as três fontes, `HOLD_MULTISOURCE_AND_REVIEW` é obrigatório.

## Etapas de conclusão e critérios de saída

1. Executar workflow da PR candidata e registrar SHA, execução, totais de 48 branches, distinção de 2 PRs API truncadas e todos os objetos de revisão. Detectar nova branch/HEAD alterado antes de comparar delta.
2. Produzir snapshots externos completos e privados, comparar N-vias e separar SAME_BYTES, SEMANTIC_CANDIDATE, SOURCE_ONLY, MISSING, CONFLICT, RIGHTS_HOLD, sem auto-admissão.
3. Aplicar revisão de segurança/clínica/licença e resolução de conflitos para cada candidato, com razão, prova primária, testes e owner/revisor independente.
4. Submeter microPR elegível à main protegida e exigir check `verify` e demais gates, sem bypass. Após merge, conferir o SHA e repetir cross; só então considerar `SEALED` com prova íntegra.

**Nota de implantação:** o agendamento de GitHub Actions só ativa na `main` após PR aprovada. Em PR, o workflow demonstra a execução Git-only, sem promoção para produção. CKO, CE, WU-TRIB e Cânone continuam com fronteiras de domínio explícitas.

## Reconciliação integral de PRs gigantes (incremento da própria PR)

O passo `scripts/ce-large-pr-native-diff.mjs` usa `git merge-base` + `git diff --name-status -z --no-renames` para obter o **diff nativo inteiro** das PRs históricas #32 e #36, cujas listagens REST estavam truncadas em 500 registros. Registra status/caminho/total/SHA-256 da lista, marca mismatch e HEAD drift em HOLD, e preserva o estado `PR_FILES_INCOMPLETE_API_LIMIT` até revisão independente. Um diff Git contra merge-base pode diferir da contagem de changed-files do GitHub em casos de renames e não se converte sozinho em decisão semântica, admissão ou merge. Teste unitário com casos negativos incluído. O arquivo sai somente no artefato Git-only da execução.
