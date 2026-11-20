# CE — Reconciliação do backup de 01/11/2026 (candidata / HOLD)

Fonte analisada: `ce-backup-completo-2026-11-01.tar.gz`; inventário e SHA256SUMS fornecidos pelo titular.
SHA-256 validado do TAR: `69e68a41021cf6683519a68f6cde768d6e65b150c1dbc537f12d6de4d756ee89`.
Backup gerado em 2026-11-01 09:30:07 UTC, no workspace externo `/home/z/my-project`.

## Achados do acervo
- TAR: 6.447 entradas (5.509 arquivos regulares, 897 diretórios, 41 links simbólicos internos), sem links quebrados após extração segura.
- A raiz do backup **não** contém `migrations/`, `contracts/` ou `registers/`; há versões históricas em `_archive/` e conteúdos em `upload/`. Portanto não é reposição integral da candidata.
- O backup contém um `.env` preenchido: conteúdo e hash não foram importados nem estão neste registro. Não publicar o TAR bruto. Revisar sigilos fora do repositório.
- Comparação de Git blobs amostrais: `_archive/AGENTS.md` e `_archive/migrations/0004_revisao_conteudo.sql` **iguais** aos arquivos existentes na branch; `package.json`, `package-lock.json`, `vite.config.ts`, metamodelos do painel e `README.md` **divergentes**.
- O backup contém 1.000 grupos de conteúdo duplicado em arquivos que não pertencem a `upload/` e nem ao `.env`, resultando em 1.008 ocorrências repetidas. Parte reflete replicação intencional de histórico/distribuição. Não apagar por deduplicação cega.
- O relatório interno `audit-report.md` do backup (31/10) registra 20/21 PASS, porém incorpora saídas de falhas de subverificações. Não equivaler a homologação atual.

## Reconciliadas 29 branches — histórico Git
- 21 branches divergentes da `canonical/local-20261101`.
- Cinco branches atrás da candidata sem commits exclusivos.
- Duas sem ancestral comum: `feat/projection-unica-f0-suite-real`, `grook_10_26`.
- A própria candidata completa a população.
**Limite:** são comparações de histórico, não prova de igualdade dos blobs e contratos; continuar o índice multilateral completo.

## Correções registradas nesta rodada
- `src/components/admin/admin-console.tsx`: consertado fechamento TSX da aba Publicação (commit `fde86f0`).
- `scripts/auditar-registro.mjs`: expressão regular restaurada para reconhecer números de migrations (commit `2bcc04c`); mantém duplicidades como falhas, não autoeleição.
- Renderer web CKO: JSDoc e HTML escaping com tipos; nomes de typedef isolados para não colidir globalmente (commits `3d2a96a`, `d1a0dc9`).
- Handler OAuth do popup: verifica em runtime presença do endpoint de plugin condicional, falha fechada quando ausente (commit `3340211`).
- CI: build/codegen do TanStack antes do typecheck, preservando execução de todos os portões (commit `d8e72a5`).

## CI/validações
- Run 41293138219, em SHA anterior: `FAIL` registro PMO, testes, TypeScript, build.
- Run 41294455068, em SHA anterior às correções mais recentes: `FAIL` no registro PMO, suíte e TypeScript; **build PASS**.
- As correções mais recentes requerem validação no SHA final. Nunca declarar PASS pelo código sem resultado do runner.
- A auditoria do registro PMO ainda detecta referências/reservas históricas inconsistentes e números concorrentes. Não renumerar migrations já executadas.

## Decisão
`HOLD_HUMAN / MERGE_NOT_RECOMMENDED_NOW`.
Não sobrescrever a árvore candidata com o backup, não apagar duplicados de histórico, não importar `.env`, não promover conteúdo clínico e não fazer deploy sem RLS/RBAC, Kernel, revisão de evidências, CI e E2E.
