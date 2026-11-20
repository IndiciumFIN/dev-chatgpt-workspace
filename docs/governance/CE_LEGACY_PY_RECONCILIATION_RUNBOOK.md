# CE — reconciliação histórica Python com CI-first

**Destino canônico:** IndiciumFIN/dev-chatgpt-workspace, branch main. **Origem somente leitura:** IndiciumFIN/calculadorasdeenfermagem, SHA e0f62491b104f4a97c6025a6393cabc2e7ada30e.

Este procedimento usa dois checkouts Git locais e não depende de Supabase, Neon, API key, conexão de banco ou serviço externo na execução. Nenhum comando abaixo publica ou substitui arquivos ativos sem revisão.

## Estados

- ARCHIVED_SOURCE_EXACT: bytes históricos preservados em intake/legacy-ce/<caminho original>, sem ativar código, conteúdo clínico ou normas.
- PENDING_TRIAGE: identificado no inventário, pendente de preservação.
- COLLISION_MANUAL_RECONCILIATION: mesmo caminho no Workspace, blob divergente; nunca sobrescrever.
- ALREADY_IDENTICAL: somente quando o blob original coincide com a versão canônica.
- DEDUP_SEMANTIC_EXACT: alias histórico da pasta obsoleta contracts/fonts; é reconstruído byte a byte do contrato já preservado em contracts/fontes sem duplicar arquivos, eliminando apenas o atributo final source_contract.

O inventário contém 176 arquivos; após esta onda: 82 históricos arquivados, 20 aliases deduplicados reversivelmente, 68 pendentes, seis colisões. Inventário 100%; preservação 46,6%; origens tratadas 58,0%; publicação clínica e banco remoto NÃO aprovados.

## Pré-requisitos

Python 3.10+, Git e dois checkouts locais limpos. Não registrar credenciais nem arquivos de ambiente real. O reconciliador recusa symlink, path traversal, revisão histórica divergente, alteração de conteúdo, cópia sobre arquivo existente e escrita fora da área de quarentena.

## Comandos Linux / Codespaces

    git clone https://github.com/IndiciumFIN/calculadorasdeenfermagem.git ../calculadorasdeenfermagem
    git -C ../calculadorasdeenfermagem switch --detach e0f62491b104f4a97c6025a6393cabc2e7ada30e

    # Dentro do checkout de dev-chatgpt-workspace na branch main:
    python3 scripts/ce-legacy-reconcile.py verify --target .
    python3 scripts/ce-legacy-reconcile.test.py

    # Confrontar também os 176 arquivos com a árvore imutável da origem:
    python3 scripts/ce-legacy-reconcile.py verify --target . --source ../calculadorasdeenfermagem

    # Prévia em lotes de dez documentos de docs/ (nenhuma escrita):
    python3 scripts/ce-legacy-reconcile.py stage --target . --source ../calculadorasdeenfermagem --batch-size 10

    # Cópia local explícita (NÃO executa git commit/push):
    python3 scripts/ce-legacy-reconcile.py stage --target . --source ../calculadorasdeenfermagem --batch-size 10 --apply

    # Testes após a cópia, antes de qualquer commit:
    python3 scripts/ce-legacy-reconcile.py verify --target .
    python3 scripts/ce-legacy-reconcile.test.py
    git diff --check
    git status --short

Para PowerShell, substituir python3 por py -3 e ../calculadorasdeenfermagem por ..\calculadorasdeenfermagem. A fonte deve estar no SHA fixado e o destino sem alterações para aplicar. A rotina mostra progresso [NN/TT], detecta grupos de SHA duplicado e mantém histórico do caminho original. Por padrão stage é DRY-RUN; só --apply grava a cópia local, limitado a lotes de 1 a 25.

A seleção automática aceita docs/*.md com status PENDING_TRIAGE e cabeçalho Markdown válido. Com --category metadata aceita apenas nove arquivos JSON na allowlist do código, com parsing de JSON e verificação de hash, nunca migrations ou fluxos CI. Ambos os modos bloqueiam indicadores de chaves privadas. Os demais tipos (SQL, workflows, scripts, tokens, assets, front, banco de dados) exigem reconciliação específica e critérios adicionais; não são executados nem ativados automaticamente.

## CI e evidências

O workflow .github/workflows/verify-bibliotecas.yml executa antes de remover o escopo de deploy e antes de npm ci:

    python3 scripts/ce-legacy-reconcile.py verify --target .
    python3 scripts/ce-legacy-reconcile.test.py

O gate verifica SHA Git original, SHA-256 quando disponível, bytes, contadores, caminho e ausência de ativação automática. Os testes negativos cobrem adulteração, cópia sem --apply, revisão de origem, sobreposição de arquivos e traversal. O CI não permite migrations automáticas no build. Nunca confundir teste estrutural PASS com aprovação de normas, direitos, licenciamento, RBAC/RLS, publicação clínica ou migração de banco.

## Próxima etapa

Examinar o registro registers/governance/ce-origin-reconciliation-20261120.v1.json; continuar em lotes pequenos, revisar cada delta e registrar commit, resultado GitHub Actions e bloqueios na issue #33. Para colisões, preservar a configuração ativa do Workspace e abrir reconciliação semântica com evidência; nunca forçar merge ou substituir por conteúdo antigo.

### Dados JSON históricos (somente quarentena)

    python3 scripts/ce-legacy-reconcile.py stage --target . --source ../calculadorasdeenfermagem --category metadata --batch-size 9
    python3 scripts/ce-legacy-reconcile.py stage --target . --source ../calculadorasdeenfermagem --category metadata --batch-size 9 --apply

Se a allowlist estiver toda preservada, o programa informa que nada mudou; não habilitar templates/tokens históricos como fontes operacionais.

## Checkpoint — segundo lote curado de documentos e evidências inertes (20/11/2026)

- Dez caminhos adicionais do commit fixado `e0f62491b104f4a97c6025a6393cabc2e7ada30e` foram preservados apenas em `intake/legacy-ce/`.
- A entrada de cada arquivo é conferida por tamanho, Git blob SHA e SHA-256; arquivos históricos continuam excluídos do deploy e não recebem admissão automática.
- Manifesto: 92 arquivados, 20 aliases deduplicados, 58 pendentes, 6 colisões — 112/176 (63,6%) tratados documentalmente.
- Aprovações, designações e políticas legadas são registros históricos sujeitos a revalidação, não substituem gates clínicos, jurídicos ou de segurança.
- Próximos 58 arquivos incluem aplicações, CLI, workflows e SQL, sujeitos a triagem e gates específicos; não ampliar a allowlist de execução automaticamente.
