# W2.6-G1 — grook_10_26: inventário Git integral e triagem preliminar

**Issue canônica:** [#104](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/104) · **Fase:** DEVELOPMENT · **Estado:** FULL_DELTA_INVENTORIED / TRIAGE_PENDING · **Fechamento da branch:** NÃO AUTORIZADO neste lote.

## Fixação da evidência

- Origem: `grook_10_26`, commit `2eacacafd95c106e58a33372ee96bc6a6442439f`, árvore `d8de6c9a983e9ad4ecb95fb5aec68bd2389d0b8b`.
- Baseline: `main`, commit `bee0cceb2561c31729e6a2345eae2b8fc199231d`, árvore `b416278d0bfaddcbe60ad2f54f6c147ca25d871e`.
- API GitHub: `git/trees/{tree_sha}?recursive=1` para ambas; `truncated=false` nas duas respostas; blobs/modes comparados por path, sem tomar PR diff/ancestralidade como paridade semântica.
- Origem **1.061** arquivos; **1.013** blobs e modos idênticos, **48** diferentes, **0** exclusivos ausentes na main. Baseline main **3.251** arquivos; **2.190** existem somente na main. Verificador de contagens e estados: `node --test scripts/ce-w26-grook-manifest.test.mjs`.
- Manifesto completo das 48 divergências com blobs Git e modos: [registers/governance/ce-w26-grook-full-delta-20261121.v1.json](../../registers/governance/ce-w26-grook-full-delta-20261121.v1.json). Os 1.013 exatos são comprovados pela leitura das duas árvores imutáveis, não por amostra de PR.

## Classificação preliminar (não é decisão de aceitação)

| Risco preliminar | Arquivos | Significado |
|---|---:|---|
| `P0_CLINICAL` | 6 | Triagem por caminho; exige revisão humana/automatizada pertinente antes de disposição |
| `P0_SECURITY` | 13 | Triagem por caminho; exige revisão humana/automatizada pertinente antes de disposição |
| `P1_RUNTIME` | 16 | Triagem por caminho; exige revisão humana/automatizada pertinente antes de disposição |
| `P1_TEST` | 3 | Triagem por caminho; exige revisão humana/automatizada pertinente antes de disposição |
| `P1_UI` | 10 | Triagem por caminho; exige revisão humana/automatizada pertinente antes de disposição |

| Caminho divergente | Risco preliminar | Origem Git SHA | Main Git SHA | Estado |
|---|---|---|---|---|
| `.gitignore` | `P1_UI` | `8f7fd077b4d8` | `ba41cb8913e0` | `PENDING_SEMANTIC` |
| `package-lock.json` | `P1_RUNTIME` | `b6432638b567` | `c2beea71660d` | `PENDING_SEMANTIC` |
| `package.json` | `P1_RUNTIME` | `844f8aad72fc` | `a6834d59c304` | `PENDING_SEMANTIC` |
| `public/sitemap.xml` | `P1_RUNTIME` | `b67be804cf79` | `08675cad3cda` | `PENDING_SEMANTIC` |
| `scripts/admin-catalog.test.mjs` | `P1_TEST` | `be35ebbebd7f` | `e3d3b818df2a` | `PENDING_SEMANTIC` |
| `scripts/alias-hook.mjs` | `P1_RUNTIME` | `4fcff75b3776` | `d23b5c1fbcb3` | `PENDING_SEMANTIC` |
| `scripts/check-auth-invariant.mjs` | `P0_SECURITY` | `b558378c35f8` | `52ea0bae1846` | `PENDING_SEMANTIC` |
| `scripts/check-auth-invariant.test.mjs` | `P0_SECURITY` | `4cc9b6faa28b` | `e41fbc72c773` | `PENDING_SEMANTIC` |
| `scripts/grok-pwa-plugin.test.mjs` | `P1_RUNTIME` | `30d01b79d8b7` | `317bd1be1aab` | `PENDING_SEMANTIC` |
| `scripts/grok-pwa-shared.mjs` | `P1_RUNTIME` | `b05a47d95e97` | `29bce8f98b4a` | `PENDING_SEMANTIC` |
| `scripts/migrate.mjs` | `P1_RUNTIME` | `7b3dc087119d` | `754b21a8e904` | `PENDING_SEMANTIC` |
| `scripts/migration-plan.test.mjs` | `P1_RUNTIME` | `ae2ffa74f0f7` | `8eb4736b4c72` | `PENDING_SEMANTIC` |
| `scripts/with-app-env.mjs` | `P0_SECURITY` | `e48dfafa69fa` | `cc1ec4b520a7` | `PENDING_SEMANTIC` |
| `src/components/admin/registry.tsx` | `P1_UI` | `9f068cc0ceb2` | `8602fede9a52` | `PENDING_SEMANTIC` |
| `src/components/site/areas.tsx` | `P1_UI` | `1b7fdc584d8a` | `7425ab275f1b` | `PENDING_SEMANTIC` |
| `src/components/site/related-content.tsx` | `P1_UI` | `a1270f39b0ab` | `c6a96f5524e4` | `PENDING_SEMANTIC` |
| `src/components/site/shell.tsx` | `P1_UI` | `ec9c61954bfb` | `d3a24f6267a1` | `PENDING_SEMANTIC` |
| `src/components/templates/contract-view.tsx` | `P1_UI` | `ee95cc2662bb` | `a60136229d47` | `PENDING_SEMANTIC` |
| `src/components/tools/clinical-tool.tsx` | `P0_CLINICAL` | `e0def64a8d58` | `ccdf2599d0dd` | `PENDING_SEMANTIC` |
| `src/lib/auth/client.ts` | `P0_SECURITY` | `d3b267d3de8b` | `3d7efba87c1c` | `PENDING_SEMANTIC` |
| `src/lib/auth/gate-identity.test.ts` | `P0_SECURITY` | `02cf0269fe3c` | `84aba93d9aa0` | `PENDING_SEMANTIC` |
| `src/lib/auth/popup.server.ts` | `P0_SECURITY` | `9e686ae29e2b` | `40adca02eaf0` | `PENDING_SEMANTIC` |
| `src/lib/auth/preview.ts` | `P0_SECURITY` | `b8822e87c83b` | `9346354e7510` | `PENDING_SEMANTIC` |
| `src/lib/auth/providers.ts` | `P0_SECURITY` | `cd53b6faf1bf` | `e82dfaecfd82` | `PENDING_SEMANTIC` |
| `src/lib/auth/server.ts` | `P0_SECURITY` | `66d94be9eb10` | `842ec9cd32dc` | `PENDING_SEMANTIC` |
| `src/lib/auth/verify.server.ts` | `P0_SECURITY` | `2bf5acc72dd1` | `5cc0e660c914` | `PENDING_SEMANTIC` |
| `src/lib/contract-index.generated.ts` | `P0_CLINICAL` | `9708b014d611` | `99255c97157d` | `PENDING_SEMANTIC` |
| `src/lib/contract.ts` | `P0_CLINICAL` | `e4775ae60914` | `f059f3d8fd41` | `PENDING_SEMANTIC` |
| `src/lib/db.ts` | `P0_SECURITY` | `d0a89f7ab082` | `2178a40c7fc0` | `PENDING_SEMANTIC` |
| `src/lib/desk-boundary.test.ts` | `P1_TEST` | `314ee405f8d8` | `1bbb89333dab` | `PENDING_SEMANTIC` |
| `src/lib/ecosystem-audit.test.ts` | `P1_TEST` | `23f9969b20f5` | `4e3c76b2b897` | `PENDING_SEMANTIC` |
| `src/lib/ecosystem-audit.ts` | `P1_UI` | `3376721a85fd` | `c36d7b7e1d3e` | `PENDING_SEMANTIC` |
| `src/lib/focus-color-i18n.ts` | `P1_UI` | `de43d9a4276c` | `e24aee8e4458` | `PENDING_SEMANTIC` |
| `src/lib/header-i18n.ts` | `P1_RUNTIME` | `65e9418cab58` | `58a0251cb093` | `PENDING_SEMANTIC` |
| `src/lib/kernel-admit.test.ts` | `P0_CLINICAL` | `0f1fb85ea9fd` | `d551f2869154` | `PENDING_SEMANTIC` |
| `src/lib/kernel-admit.ts` | `P0_CLINICAL` | `1ef3e1600e03` | `4251544045c7` | `PENDING_SEMANTIC` |
| `src/lib/locale-registry.ts` | `P1_RUNTIME` | `9b72fbc7593c` | `dac9eab10830` | `PENDING_SEMANTIC` |
| `src/lib/sections.ts` | `P1_UI` | `6ead8e9e3926` | `f7c08bdc6f20` | `PENDING_SEMANTIC` |
| `src/lib/seo.ts` | `P1_RUNTIME` | `ecc4e8693f20` | `d879d5e454da` | `PENDING_SEMANTIC` |
| `src/lib/source.functions.ts` | `P0_SECURITY` | `812f9dfecac5` | `b697a57a2b7b` | `PENDING_SEMANTIC` |
| `src/lib/template-catalog.ts` | `P1_RUNTIME` | `c3b3ec7574b0` | `8794e7428de8` | `PENDING_SEMANTIC` |
| `src/lib/template-contract.ts` | `P0_CLINICAL` | `d4f3908f43c8` | `84fd27e310b9` | `PENDING_SEMANTIC` |
| `src/router.tsx` | `P1_RUNTIME` | `fd662dabc327` | `49561b83ea09` | `PENDING_SEMANTIC` |
| `src/routes/login.tsx` | `P0_SECURITY` | `01de60dfb265` | `390247798436` | `PENDING_SEMANTIC` |
| `src/routeTree.gen.ts` | `P1_RUNTIME` | `d020d11d40ab` | `140ece4fff6e` | `PENDING_SEMANTIC` |
| `src/styles.css` | `P1_UI` | `84baefd59156` | `b8bd267f36fb` | `PENDING_SEMANTIC` |
| `vercel.json` | `P1_RUNTIME` | `1c00aa58be1f` | `935d5d78ad16` | `PENDING_SEMANTIC` |
| `vite.config.ts` | `P1_RUNTIME` | `f0aa67ddb6b5` | `39c0cd51ea5f` | `PENDING_SEMANTIC` |

## Limites e próxima decisão

- **0/48 divergências com disposição semântica final validada neste lote.** A classificação P0/P1 serve exclusivamente para priorizar revisão; não demonstra regressão nem comprova preservação funcional.
- Antes de `DEV_RECONCILED`, cada divergência exige comparação de conteúdo, decisão por objeto (ex.: SUPERSEDED_WITH_PROOF, INTEGRATED_VERIFIED, REJECTED_WITH_PROVENANCE), destino, teste/CI exato e verificação independente aplicável; inclusive autenticação, contratos, migrações, clínica, direitos e Drive/Supabase nos domínios respectivos.
- **Sem cópia de código histórico, DDL/DML, deploy, aprovação de Cauê, exclusão de branch, uso clínico ou selo release.** `grook_10_26` mantém HEAD original, sem force-push.
- A tarefa de inventário W2.6-G1 só pode ser marcada `DEV_MERGED_VERIFIED` depois de PR/CI e readback do SHA integrado na main. Isso **não** promove a branch de origem.

## Plano de rollback

Reverter exclusivamente os arquivos documentais/teste deste lote por PR e registrar a razão; nunca reescrever os commits da branch histórica. A evidência anterior permanece consultável na issue e nos objetos Git.
