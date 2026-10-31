# E2 — Repositório público, branches e repositório de referência

## Repositórios
| repo | visibilidade | papel |
|---|---|---|
| `kauesp0007/calculadoras-de-enfermagem` | **público** | produto/herança estática; 30 branches; 14 379 arquivos segundo registo do extrator |
| `IndiciumFIN/calculadorasdeenfermagem` | privado | app vivo da organização (branch main) |
| `IndiciumFIN/ce-bibliotecas-dev` | privado | desenvolvimento da biblioteca |
| `IndiciumFIN/dev-chatgpt-workspace` | **público** | governança PMO×Kernel + Experience Platform (24 branches) |

## Branches do repo público — **CORRIGIDO: 182, não 30** (31/10 22:10Z)
ERRO DO OWNER: a primeira listagem usou `per_page` (parametro invalido) e devolveu só a 1ª página de 30.
Com `perPage: 100` + `page`, a lista completa é **182 branches**. Distribuição por prefixo:
`fix` 61 · `codex` 52 · `copilot` 14 · `chatgpt` 12 · `refactor` 10 · `backup` 8 · `feat` 8 · `audit` 6 ·
`base44` 2 · `chore` 1 · `docs` 1 · `main` 1 · `pre-projetos` 1 · `rebuild` 1 ·
`fix-supabase-preview-migration-baseline-2026-09-20` 1 · `sanitize-premium-access-2026-09-20` 1 ·
`sync-premium-main-2026-09-20` 1 · `test` 1.
Lista completa com sha: **/workspace/evidence_pack/branches-todas.json** (repo `IndiciumFIN/dev-chatgpt-workspace`: 24 branches, confirmado).
Leitura: 152 das 182 são trabalho de correcção/refactor (fix+codex+copilot+refactor+feat) — um repositório com
**mucho churn e baselines**, não um espelho da produção. As 30 do pack são só a primeira página.

### Branches (primeira página, nomes = evidência de superfície)
`audit/billing-ads-final-20260914` · `audit/billing-ads-hardening-20260914-fix` · `audit/billing-ads-hardening-20260914` · `audit/billing-ads-hardening-clean-20260914` · `audit/billing-concurrency-fix-20260914` · `audit/cwv-mobile-a11y-2026-09` · `backup/acessibilidade-antes-revisao-20261026` · `backup/menu-global-antes-azul-20261026` · `backup/menu-raiz-antes-azul-20261026` · `backup/menu-global-antes-icone-rodape2-20261026` · `backup/menus-19-antes-75px-20261026` · `backup/menus-19-antes-ajustes-20261026` · `backup/menus-19-antes-scroll-20261026` · `backup/page-comments-20261012-0318` · `backup/pre-clinical-audit-2026-09-19` · `base44/setup-33f0e67e` · `base44/setup-ea01a537` · `chatgpt/assinatura-layout-20261004` · `chatgpt/desenvolvedor-funil-24h-20261004` · `chatgpt/desenvolvedor-refresh-order-20261004` · `chatgpt/guia-avancado-gotejamento-20261026` · `chatgpt/index-calculadoras-figma-20261004` · `chatgpt/index-extensoes-chrome-20261004` · `chatgpt/login-google-email-only-20261004` · `chatgpt/plano-acao-melhoria-simulados-20261004` · `chatgpt/simulados-etapa-01-fundacao-20261004` · `chatgpt/simulados-etapa-02-piloto-20261004` · `chatgpt/simulados-etapa-02-piloto-execucao-20261004` · `chatgpt/sync-menu-auth-layout-locales-20261004` · `chore/sync-asaas-checkout-v106` · `codex/admin-developer-premium`.

Leitura: o repositório público tem **31 commits de frente em `main` no momento da recolha** (branch mais recente `chore/sync-asaas-checkout-v106` @ `a6f90c53`), 6 branches `backup/` = snapshots de baseline antes de mudanças visuais, e um cluster `chatgpt/` = trabalho de produto por frente (simulados em 3 etapas, checkout, login, extensões, Figma). Ou seja: **o repositório público é simultaneamente o produto e o arquivo de baselines.**

## Branch da Experience Platform (no repo de governança)
`feat/career-youth-db-first-20261026` @ `ad4c683890` — PR **#21** (draft, `[CANDIDATE] Carreira + Portal do Jovem DB-first`), **146 commits**, **70 ficheiros** alterados. Contém:
- `registers/canonical/experience-capability-registry.candidate.v0.1.json` — **201 capabilities, 20 famílias, todas `CANDIDATE`**
- `registers/canonical/object-capability-binding.candidate.v0.1.json` — **16 tipos de objeto** (Article, Guide, LibraryEntity, ClinicalTool, Course, Trail, JobOpportunity, Competition, Residency, Question, Simulation, ResearchProject, Norm, CareerRole, Organization, MediaAsset)
- `docs/EXPERIENCE-PLATFORM-CANONICAL-PLAN-v0.1.0.md` (638 linhas, 28 secções) · `docs/EXPERIENCE-PLATFORM-MIGRATION-ROADMAP-v0.1.0.md` (14 waves) · `docs/EXPERIENCE-CAPABILITY-MATRIX-v0.1.0.md` · `docs/FIND-EXPERIENCE-CANONICALIZATION-v0.1.0.md` (**16 FINDs**) · `docs/EXPERIENCE-PLATFORM-DOC-WAVE-v0.1.0.json` (`runtimeChanged: false`).

Os 16 FINDs (resumo): template-contract mistura favorite/print/pdf/docx/listen/readingTime · PageTools e LibraryActions duplicam ações · Favorite é só estado de visita · ToolViewBar grava configuração em sessionStorage · Hint trata Tooltip como conteúdo+renderer · preview existente é infra de embed e não Product Preview · (mais 10 não discriminados neste pack — estão no ficheiro da branch).

## Onde estão as linhas de base que já existem (medido)
- `src/lib/locale-registry.ts` → **19 idiomas** (pt-BR, en, es, de, it, fr, hi, zh, ar, ja, ru, ko, tr, nl, pl, sv, id, vi, uk).
- Biblioteca de **243 ícones Font Awesome em SVG** (`scripts/icones-fa.json` + `scripts/gerar-biblioteca-icones.js`), 37 glifos clínicos usados, zero raster repetido.
- `src/lib/site-data.ts` → tokens canónicos (Navy `#1A3E74`, Sky `#4A90E2`, Ink `#0F2440`, foco `#FF0`, alvo 44 px).
- Playwright instalado; testes de a11y próprios (`test-country-icon-a11y.mjs`, `test-focus-colors-i18n.mjs`); **não existe axe-core no repo**.

## VERIFICAÇÃO DIRETA DO OWNER (31/10 22:05Z) — corrige a atribuição acima
Leitura direta via API GitHub:
- `kauesp0007/calculadoras-de-enfermagem` @ **main**: `README.md` (13 linhas) e `package.json` (67 linhas) **PRESENTES**; `scripts/icones-fa.json` **PRESENTE (991 linhas — a biblioteca de ícones FA)**; `src/lib/locale-registry.ts` **AUSENTE**; `src/lib/site-data.ts` **AUSENTE**.
  O `package.json` público tem dependências de pipeline de conteúdo (`@babel/generator`, `@babel/parser`, `@babel/traverse`, `cheerio`, `axios`, `canvas`, `@google-cloud/aiplatform`, `@google/generative-ai`) e scripts `biblioteca`, `blog`, `dev`, `build:protecao` → o repo público é também **pipeline de extração/geração de conteúdo**, não só o site.
- `IndiciumFIN/calculadorasdeenfermagem` @ **main**: `package.json` (28 linhas) e `README.md` (45 linhas) presentes; `src/lib/site-data.ts` **AUSENTE no main**.
⇒ **Correção**: o registo dos 19 idiomas e o array de tokens canónicos **não estão no `main` de nenhum dos dois repositórios** que verifiquei. Estão noutro ramo/árvore (candidatos: `codex/admin-developer-premium`, `feat/projection-unica-f0-suite-real` no repo de governança, ou `IndiciumFIN/ce-bibliotecas-dev`). **NÃO afirmes onde estão** — isso é NOT_RUN até ser medido.
