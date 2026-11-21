# CE / W2.6-G2/R1 — Reconciliação automatizada dos 16 objetos de runtime

**Data:** 2026-11-21 · **Issue:** #118 · **Pai:** #106 · **Fase:** DEVELOPMENT, sem release.
**Proprietário:** Cauê Zipfel, aprovação diferida. **Coordenação técnica:** Leivis Lima.

## Integridade da origem e ganho de velocidade

- Fonte histórica `grook_10_26` @ `2eacacafd95c106e58a33372ee96bc6a6442439f` / tree `d8de6c9a983e9ad4ecb95fb5aec68bd2389d0b8b`.
- Fonte canônica pré-lote `main` @ `f49496b050b77c366d7614a717fdf29f97d47346` / tree `f3817b340ae517f2fb32dfcf7dceae5311b4ca2b`.
- Comparação de conteúdo das 16 diferenças entre **duas versões Git**, incluindo diff semântico em JS por arquivo, comparação de todas as 469 entradas do lockfile, rotas geradas e enumeração de 19 locales; sem cherry-pick cego, extração de segredos, alteração do código runtime ou novos branches.
- **Um lote, uma PR**: ledger JSON, testes, validador e este relatório. `scripts/ce-w26-grook-runtime-r1-verify.mjs` revalida os 48 objetos históricos, sem dupla contagem dos 20 já registrados, usando Git blob SHA byte a byte dos arquivos ativos. `scripts/ce-w26-grook-runtime-r1.test.mjs` inclui mutações adversariais dos estados, teste de CLI de migração em CI e asserções PWA/i18n/roteamento. Integração apenas após checks no mesmo HEAD e `verify` pós-merge.
- Evidência de `npm ci`, typecheck, npm test e build aplica-se ao **SHA exato** do GitHub Actions, não a deploy ou banco produtivo.

## 14 diferenças técnicas classificadas em DEV

| Origem do diff | Evidência objetiva na main | Limite explícito |
|---|---|---|
| `package-lock.json` | lock v3 mantém grafo de dependências reprodutível; Better Auth 1.7.15, Zod 4.6.7; instalação CI | OAuth real, licenses e CVEs não homologados |
| `package.json` | `build` não executa migração; `db:migrate` explícita | operacionalizar SQL requer aprovação externa |
| `public/sitemap.xml` | 17 URLs adicionais, inclusive política/aviso clínico | sem indexação, sitemap vivo ou validação clínica |
| `scripts/alias-hook.mjs` | resolve caminho pelo arquivo atual em vez de fixar `/workspace` | ambientes externos não testados integralmente |
| `scripts/grok-pwa-plugin.test.mjs` | fixtures genéricas isoladas da marca CE; teste da identidade do site | OG real e Preview não comprovados |
| `scripts/grok-pwa-shared.mjs` | `rel` de manifest e apple-touch-icon reconhecido semanticamente | PWA offline/installability não homologada |
| `scripts/migrate.mjs` | exige `CE_DB_MIGRATION_APPROVED=true` e `--approved`; recusa CI e target ausente | nenhum DDL remoto autorizado |
| `scripts/migration-plan.test.mjs` | testa SQL na raiz e separação da pasta auth real | sem migração aplicada ou RLS validado |
| `src/lib/header-i18n.ts` | seletor restringe a quatro idiomas com dicionários parciais | não são quatro interfaces completas |
| `src/lib/locale-registry.ts` | 15 `header_only`, quatro `partial_existing` de 19; `content=not_verified` | nenhuma tradução clínica homologada |
| `src/lib/seo.ts` | canonical e hreflang derivados do Route Registry | indexação/crawl não comprovados |
| `src/lib/template-catalog.ts` | adaptador compatível `templateCatalogo` com fonte canônica por tela | faltam E2E de telas/assinante e campos |
| `src/router.tsx` | checa existência da rota inicial em contrato na inicialização | não prova RBAC/fluxos completos |
| `src/routeTree.gen.ts` | três imports adicionais; 50 originais preservados | sem teste de navegador, artefato gerado |

**Classificação:** `SUPERSEDED_WITH_PROOF` apenas para a diferença **de código em DEV**. Ela não prova que runtime em produção esteja funcional nem permite `SEALED`.

## Duas diferenças de runtime permanecem em HOLD

1. `vercel.json` — `HOLD_PREVIEW_RUNTIME_SMOKE`: `framework: tanstack-start`, antigo override `npm install --omit=dev` removido. Falta readback operacional da configuração de projetos, Preview READY, HTTP smoke e verificação de que `main` não causa build produtivo indevido; issue relacionada #96.
2. `vite.config.ts` — `HOLD_SERVERLESS_PGLITE_ASSET_SMOKE`: hook Nitro `compiled()` copia `pglite.data`, `pglite.wasm` e `initdb.wasm` ao pacote de função Vercel. Falta verificação do pacote gerado real e smoke em Preview sem DB operacional; issue #96, identidade de runtime #100.

A documentação oficial da [Vercel sobre TanStack Start com Nitro](https://vercel.com/docs/frameworks/full-stack/tanstack-start) confirma a arquitetura disponível, mas não testa este repositório ou as configurações de projetos existentes. A orientação [W3C WCAG 2.2, 3.1.1](https://www.w3.org/WAI/WCAG22/Understanding/language-of-page.html) exige que o idioma real da página seja determinável; não se pode declarar idiomas parciais como traduções completas. Não há alegação de conformidade WCAG global.

## Saldo do inventário de 48 divergências da grook

- **20/48** dispostas antes deste lote (testes, segurança, código clínico DEV).
- **+14/48** dispostas no presente lote, somente DEV.
- **34/48 = 70,83%** com decisão técnica de código; **14/48 = 29,17% não concluídas**: **4 HOLD** (credencial OAuth #91/#92; catálogo de 78 identificadores #116; Vercel Preview #96; Nitro PGlite Preview #96) e **10 divergências de UI** sem decisão semântica.
- A pendência de **78 identificadores históricos do catálogo** está contada uma única vez no item clínico `contract-index.generated.ts`, não como 78 objetos de runtime.
- Nenhuma branch histórica `SEALED`. Não confundir percentual de uma única branch com conclusão funcional de toda a plataforma nem com o denominador V3–V6 (1/44).

## Critérios de fechamento e retomada

- Só fechar #118 após CI com testes adversariais, `verify` e `ce-integration-gate` no mesmo head e `verify` pós-merge; registrar SHA e link em #118/#106/#90.
- Não alterar/remover HOLDs por passar em build nem usar `force` nos refs. Qualquer solução real da Vercel exige inspeção específica das configurações e teste Preview autorizável, sem promover produção.
- Próximo lote: dez objetos `P1_UI`, com contratos por tela, dados, vínculos e navegação; cruzar também #116/78 ferramentas com outros fontes antes de homologar conteúdo.
- Nenhuma alteração em Supabase operacional, emissão de autorização clínica, exclusão de fontes, segredo literal ou licença de terceiros nesta PR.
