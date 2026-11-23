# CE / CKO / NCOS — PR única de reconciliação (23/11/2026)

## Base e alcance
- Repositório: IndiciumFIN/dev-chatgpt-workspace.
- Base inicial da PR unificada: `main` em `a6304d437413cb41f9b64f3aa088582f78d7906b`.
- Censo live: **36 PRs abertas** e **70 branches (incluindo main)**.
- PRs CE/correlatas: **25**, PRs WU-TRIB/governança correlata: **11** (classificação preliminar por título).
- WU-TRIB: **fora do merge CE**; preservação e reconciliação em trilha isolada.
- Este commit cria **apenas o controle de reconciliação**. Não afirma que o código das PRs históricas foi importado.

## PRs de origem — CE/CKO/NCOS e satélites
`#78 #77 #74 #72 #71 #70 #68 #67 #66 #52 #40 #38 #37 #36 #32 #31 #29 #27 #24 #22 #21 #20 #19 #13 #1`.

## PRs WU-TRIB/afins segregadas
`#51 #50 #49 #48 #47 #46 #45 #44 #43 #42 #41`.

## Invariantes de reconciliação
1. Comparar cada HEAD de PR e cada branch com `main` por merge-base, árvore, SHA de blob e diff semântico; manter rastreabilidade `origem → destino → decisão → teste`.
2. Classificar cada caminho como `EXACT_IN_MAIN`, `INTEGRATED_VERIFIED`, `SUPERSEDED_WITH_PROOF`, `QUARANTINED_INERT`, `CONFLICT` ou `HOLD`. Não confundir existência com equivalência funcional.
3. Resolver colisões por arquivo, preservando alterações mais recentes da `main`, RBAC, fail-closed, i18n e direitos. Nunca usar `force push` para substituir `main`.
4. Candidatos históricos não homologados somente em `_quarantine/ce/`, fora de imports, rotas públicas, bundles, migrations e jobs ativos; a mera presença na pasta não significa aprovação.
5. Para a PR #78: 486 diferenças históricas = 469 equivalentes e 17 divergentes; 8 P0, 7 P1, 2 P2; 0/17 homologados no relatório de origem. HEAD `4d5e22f5b144d83da455b108a0293b2c1785210e`, `mergeable=false` na consulta. Main está 138 commits à frente e branch #78 tem 52 commits exclusivos na comparação.
6. Não realizar deploy clínico, DDL/DML Supabase, publicação editorial ou `SEALED` por consequência automática de merge documental.
7. Testes por camada: integridade Git e cobertura de origem; auth/RBAC; contratos e gerados; calculadoras e gates clínicos; rotas e E2E; i18n/acessibilidade; build e preview; GitHub Actions no HEAD final.
8. Fechar PRs históricas **somente** depois de decisão por arquivo, evidência na PR unificada e verificação de que não restou delta exclusivo relevante. Não excluir branches por contagem.
9. Reconciliar também Supabase e Drive com snapshots read-only e evidência de proveniência, sem incluir segredos/PHI em repositório público.
10. A PR unificada deve permanecer DRAFT até código efetivamente consolidado, CI final verde, conflitos resolvidos e gates não bloqueantes para o escopo aprovado.

## Progresso e critérios
- Censo PR: 36/36 identificadas no momento do snapshot.
- Censo branches: 70/70 nomes retornados no snapshot (69 além de main).
- Conciliação semântica PR × branch × main: **não concluída**; nenhum percentual global inventado.
- PRs históricas fechadas por esta atividade: 0.
- Branches `SEALED` por esta atividade: 0.
- Publicação de produção por esta atividade: nenhuma.

## Sequência de integração
A. Congelar inventário de HEAD SHA e merge-base de cada PR e branch; registrar duplicações e conflitos.
B. Reconciliar segurança, autenticação, contratos e workflows primeiro; testes negativos.
C. Reconciliar módulos, páginas, conteúdo e migrations candidatas com quarentena.
D. Reconciliar evidências CKO, Research e satélites; direitos e proveniência.
E. Validar cruzamento Supabase/Drive, testes e preview.
F. Integrar **uma PR consolidada** na main via regraset e SHA fixado; registrar commit e pós-merge; encerrar origens comprovadamente absorvidas.

**Aprovação do coordenador para corrigir e realizar o merge já foi concedida.** A aprovação não converte controles clínicos, de segurança e direitos pendentes em PASS.
