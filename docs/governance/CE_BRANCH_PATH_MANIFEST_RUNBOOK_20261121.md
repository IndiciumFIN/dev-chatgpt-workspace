# CE/NCOS — Manifesto integral por branch × main

**Norma operacional:** CE.BRANCH.PATH.MANIFEST.v1. **Issue:** #122. **Repositório:** IndiciumFIN/dev-chatgpt-workspace. **Proprietário:** Cauê Zipfel, aprovação diferida; **coordenação:** Leivis Lima. **Destino único para commits aprovados:** main.

## 1. Escopo e métricas

O arquivo registers/governance/ce-branch-live-cohort-20261121.v1.json fixa a coorte observada: 69 refs = **54 branches CE/CKO/NCOS**, 14 branches WU-TRIB isoladas e main. A baseline principal é o commit 5a5455ebf0a4f6a9f0dde643cfa622d43adc108c. A coorte é um snapshot temporal: seu source SHA e main SHA podem mudar; o reconciliador marca head_drift e, com --strict-heads, falha em vez de fingir que o snapshot foi mantido.

**Contadores que NÃO podem ser confundidos:** 54 branches da coorte; 42/48 divergências já decididas em código DEV no lote histórico específico grook_10_26; 1/44 ações V3–V6 formalmente concluídas em outro programa. Um manifesto que compara a união de toda a árvore histórica com a main corrente terá inclusive paths MAIN_ONLY, portanto seu denominador pode ser maior que 48; não se soma ao 42/48.

## 2. Funcionamento e formato

O motor scripts/ce-branch-diff-manifest.py é Python 3.10+ com stdlib e Git; não faz checkout, cherry-pick, branch deletion, push, merge, DDL/DML ou chamada a Supabase/Drive.

Para cada ref:
1. Resolve source commit SHA e main commit SHA e fixa os respectivos tree SHAs e merge-base. Registra commits exclusivos de cada lado apenas como contexto.
2. Usa git ls-tree -r -z --full-tree nas duas versões, com NUL para nomes contendo espaços, acentos ou tabs; inclui todos os paths rastreados, sem limite de 3.000 arquivos da API de PRs.
3. Compara path, Git object SHA, blob SHA quando tipo blob, mode e type. Submódulos têm objeto type=commit e não são falsamente classificados como blobs.
4. Produz EXACT_BLOB_MODE_TYPE, SOURCE_ONLY, MAIN_ONLY, BLOB_DIFFERENT, MODE_DIFFERENT, BLOB_AND_MODE_DIFFERENT ou TYPE_DIFFERENT. Executa git diff --numstat -z --no-renames com direção source -> main e registra linhas adicionadas/removidas e binário, sem incluir o conteúdo dos arquivos no manifesto público.
5. Para identidade exata, decisão EXACT_IN_MAIN_PROVEN com justificativa e evidência GIT_LS_TREE_IDENTITY PASS. Para qualquer outra alteração, decisão HOLD_SEMANTIC_REVIEW, justificativa e SEMANTIC_TEST_AND_PR_SHA NOT_EXECUTED.
6. Recebe revisões opcionais pinadas aos dois commits e dois Git blobs/modes de cada path. Uma proposta SUPERSEDED_WITH_PROOF, INTEGRATE_WITH_PR ou REJECTED_WITH_PROOF, mesmo com URL de teste fornecida, permanece HOLD_EXTERNAL_EVIDENCE_VERIFICATION até verificação externa da CI, direitos, normativa e aprovação aplicável. Revisões desatualizadas viram HOLD_STALE_REVIEW.
7. NUNCA habilita auto_merge, seal_branch, delete_branch, clinical_release nem remote_db_write; Drive/Supabase constam NOT_EXECUTED.

## 3. Saídas, hashes e segurança

O diretório de saída DEVE estar fora do checkout Git e ser privado, modo 0700. Cada branch usa um slug estável, com nome sanitizado + SHA256 do nome para não colidir. Os arquivos são:

- <slug>.manifest.json.gz — todas as linhas (inclusive idênticas), source/main SHA/tree, path, blob/object SHA, mode/type, diff class, decisão, justificativa, testes/evidências.
- <slug>.summary.json — contagem, estado de drift, source/main SHA/tree e SHA256 do JSON descomprimido.
- <slug>.diff-summary.md — apenas os paths diferentes, classificação e estado; nenhum trecho de código/segredo.
- index.json — resumo integral de 54 branches, contadores, hashes e detecção de branches fora do escopo ou ausentes.
- <slug>.PRIVATE.patch — **somente com --private-diff**: patch real com conteúdo e binários; pode conter credenciais históricas. Permissão 0600, SOMENTE LOCAL, nunca adicionar ao Git nem publicar em artifact da Actions.

No modo --jobs 4, até quatro consultas Git read-only são executadas em paralelo, com nomes de saída únicos e índice final ordenado. Não depende de biblioteca Python externa. O workflow em .github/workflows/ce-branch-diff-manifest.yml refaz diariamente e ao entrar esta rotina na main, também aceita workflow_dispatch; ele faz fetch integral de refs, audita 54/54 manifests e SHA256 e mantém somente metadados por 7 dias em artefato GitHub Actions.

## 4. Execução Linux / Codespaces

Use checkout do repositório com histórico completo e acesso autorizado:

    git clone --no-single-branch https://github.com/IndiciumFIN/dev-chatgpt-workspace.git ce-workspace
    cd ce-workspace
    git fetch --no-tags origin '+refs/heads/*:refs/remotes/origin/*'

Apenas uma branch:

    python3 scripts/ce-branch-diff-manifest.py --repo . --main refs/remotes/origin/main --branch grook_10_26 --jobs 4 --out "$(mktemp -d)"

A coorte completa de 54 branches:

    python3 scripts/ce-branch-diff-manifest.py --repo . --main refs/remotes/origin/main --cohort registers/governance/ce-branch-live-cohort-20261121.v1.json --jobs 4 --out "$(mktemp -d)"

Para barrar execução com qualquer source ou main SHA diferente do snapshot, acrescente --strict-heads. Logo após merge, essa opção pode falhar corretamente porque a main atual mudou. Para ver conteúdo real das diferenças, use --private-diff somente numa máquina privada, jamais nas Actions/PRs; o output fica em arquivo 0600.

## 5. Execução PowerShell no Windows

Dentro do checkout já clonado:

    git fetch --no-tags origin "+refs/heads/*:refs/remotes/origin/*"
    $saida = Join-Path $env:TEMP ("CE-Branch-Reconcile-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
    py -3 scripts/ce-branch-diff-manifest.py --repo . --main refs/remotes/origin/main --cohort registers/governance/ce-branch-live-cohort-20261121.v1.json --jobs 4 --out $saida
    Get-Content (Join-Path $saida "index.json")

Usar Python 3.10+; se o comando py não existir, usar python. Não usar paths de saída em diretórios compartilhados. O script rejeita um output dentro do repositório ou com permissões de leitura/escrita fora do usuário (em Windows, a proteção adicional depende das ACLs NTFS do usuário).

## 6. Decisão individual, rastreabilidade e fechamento

O revisor deve preencher um arquivo de proposta correspondente ao slug da branch e finalizado em .decisions.json, contendo branch, source_sha, main_sha e o array decisions com um registro por path. Cada registro exige path, source_blob_sha, main_blob_sha, source_mode, main_mode, decision, justification e tests_evidence (tipo e ref para cada teste/PR). O programa só aceita a PROPOSTA vinculada a SHA e modo atuais; não afirma que os links foram abertos ou que foram suficientes. Testes externos precisam provar o resultado no commit exato, com norma/licença, segurança e fontes primárias quando aplicável.

Antes de SEALED_FOR_RELEASE, a rotina existente scripts/ce-branch-closure.py exige evidência de completude, sem conflitos, inventário final, CI no SHA de merge, direitos, segurança, runtime, clínica, Supabase, Drive e aprovações exigidas para a fase. CI verde de testes estruturais não satisfaz os demais gates.

**Fechamento seguro:** repetir censo GitHub com paginação completa, tratar cada branch/path, reaplicar a main aprovada, rodar o novo diff com source e main SHAs frescos, registrar recibo de PR e CI pós-merge; não marcar SEALED enquanto uma diferença semântica ou um HOLD externo permanecer. Reaproveitar hashes iguais para acelerar a comparação, mas registrar destino/decisão individual por path/branch. Nenhuma alteração em 54 refs é executada pelo script.

## 7. Limitações explícitas

Este script compara **apenas objetos Git** em refs disponíveis no clone. Não comprova que o fetch viu branches remotas apagadas, direitos de uso, backend no Supabase, Google Drive, Vercel operacional, validação clínica, E2E visual nem revogação de segredos. Esses controles continuam como gates próprios. O workflow deve ser verificado no SHA concreto e seus artefatos inspecionados; documentação ou arquivo preparado sem execução não é prova de 54/54 manifestações produzidas.
