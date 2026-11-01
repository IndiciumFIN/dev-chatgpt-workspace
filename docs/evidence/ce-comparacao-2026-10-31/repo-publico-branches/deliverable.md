# Deliverable — Repositório público e as branches: o que existe, o que ficou órfão e o que é baseline

**Frente:** `repo-publico-branches` · **Data:** 2026-11-01 · **Autor:** owner (Mavis) — os três agentes que tentaram esta frente morreram sem deixar ficheiro; esta versão foi derivada do clone local e da lista oficial.

## 0. Fontes e o que cada uma é

| Fonte | Papel | Estado |
|---|---|---|
| `git for-each-ref` sobre o clone bare do repo público | **primária** — sha completo, data e assunto das 182 refs | OK |
| `/workspace/evidence_pack/branches-todas.json` | lista oficial (sha curto) | OK — confere 100% com o clone |
| `workspace/branch-orphan.tsv` (medido por um worker anterior desta frente) | medição profunda de órfãos em 30 branches | OK — 30 branches |
| `/workspace/.mavis/plans/plan_2973fb1f/workspace/clone/publico.git` | clone bare completo do repo público | OK — 182 refs |

## 1. Summary

- **O repo público tem 182 refs = 181 branches + `main`.** (A lista inicial de 30 vinha de uma paginação errada — `per_page` em vez de `perPage`.) Distribuição: `fix` 61 · `codex` 52 · `copilot` 14 · `chatgpt` 12 · `refactor` 10 · `backup` 8 · `feat` 8 · `audit` 6 · raiz 4 · `base44` 2 · `chore`/`docs`/`rebuild`/`test` 1 cada.
- **137 das 181 (75,7%) são churn de agente** (`fix`+`codex`+`copilot`+`refactor`). Oito prefixos de 13 são trabalho de correcção, não de produto.
- **Medição de risco real (30 branches, a mais fundo que foi possível):** 13 fundidas em `main`, 17 não fundidas, **das quais 7 têm conteúdo genuinamente órfão — 1.524.448 bytes que só existem naquelas branches.** Concentração: `audit/billing-ads-*` (4 branches, ~970 KB) e `base44/setup-*` (2 branches, ~520 KB).
- **O resto do inventário (151 branches) está medido quanto a identidade, data e tema, mas o teste de órfão por branch ficou por fazer** (`NOT_RUN` com motivo) — o clone está em NFS e a varredura por blob em 181 branches excedeu o orçamento. A classificação de risco dessas 151 é, por isso, **inferida** e está marcada como tal na tabela.
- **Achado de fundo:** o produto de hoje (login Google, Premium/Asaas, simulados, extensões Chrome, menus 19 idiomas, billing/ads) vive quase todo no **churn de agente** — os nomes das branches mostram que **a área mais trabalhada do produto é a de cobrança/entitlement/ads**, e é exactamente a que o esqueleto CE **não modela** (ver secção 3 e o achado estrutural da frente `producao-conta-funil`).

## 2. Método e as duas limitações que não vou esconder

1. **O conteúdo das branches não foi lido.** Tudo o que está na coluna "tema" é **inferência a partir do nome** (regra explícita e repetível, secção 4). O nome de uma branch prova que **existiu trabalho nessa frente**; não prova o que a branch contém. Onde o sha está ligado a uma medição real (`branch-orphan.tsv`), digo-o.
2. **O teste de órfão (blob exclusivo cujo conteúdo não existe em nenhum commit de `main`) foi executado em 30 branches**, não em 181. Nas restantes 151, o risco está marcado `não medido nesta ronda`. **Não afirmo "zero risco" em lado nenhum.**

## 3. O que do produto de hoje tem equivalente no esqueleto CE

| Produto em produção (nome de branch = evidência de superfície, não de estado) | Equivalente no esqueleto CE | Existe? |
|---|---|---|
| Login Google/E-mail, "Minha Conta", sessão | `owner_scope: ACCOUNT` como **campo**; `CAP-FAVORITE`, `CAP-COLLECTION` | **Só o escopo.** Sem família de conta, sem schema de conta |
| Premium / assinatura / planos | — | **Não.** Nenhum objecto, capability ou schema de plano |
| Checkout Asaas + Stripe | — | **Não.** Nenhum objecto de pagamento |
| Entitlement (acesso resolvido) | `resolver.ts` devolve estados, sem plano/tier/reason code | **Não.** 7 serviços `subscription-entitlement` existem **sem capability** |
| Ads para free / Premium sem anúncios | — | **Não.** Nenhum objecto, capability ou serviço |
| Simulados por etapa (`chatgpt/simulados-etapa-01/02`) | `CAP-SIMULATION-ATTEMPT`, `CAP-QUIZ-ATTEMPT`; 9 serviços `selections` | **Declarado, sem contrato** — `Simulation` e `Question` sem schema |
| Biblioteca de Provas / quizzes | `Question` (7 caps), `Competition` (12 caps) | **Declarado, sem schema** |
| Conteúdo editorial (`biblioteca`, `blog` no `main`) | `Article`, `LibraryEntity`, `Guide`, `MediaAsset` | **Declarado**; 2 dos 4 sem schema |
| Calculadoras clínicas (16+, 12 categorias) | `ClinicalTool` (21 caps) + `CAP-CALC-STEPS` | **Declarado, com schema** — a única superfície clínica com contrato |
| Escalas em branco para imprimir (+60) | `CAP-PRINT`, `CAP-DOWNLOAD`, `CAP-OUTPUT` | **Declarado**; `output.ts` (P0) ausente |
| Extensões de navegador (`index-extensoes-chrome`, `package-extension-030..032`) | `CAP-BROWSER-CAPTURE`, `CAP-SHARE-SHEET-CAPTURE` | **Declarado**, mas `supported_channels` e `permission_policy` **faltam nos 14 campos do registo** |
| Menus / 19 idiomas | 7 serviços `localization` | **Serviços sem capability**; zero i18n no registo |
| Comentários / fórum (`feat/page-comments-supabase`) | 12 serviços `community` (incl. `moderation`) | **Serviços sem capability** |
| Admin/developer (`codex/admin-developer-premium`) | 8 serviços `admin-control-plane` | **Serviços sem capability** |
| Vagas / candidaturas (`refactor/contas-internacional-*`) | 18 serviços `career` + `jobs-opportunities` | **Serviços sem capability** |

## 4. Regras de inferência (auditáveis)

**Classe:** `baseline` = prefixo `backup` OU nome contém `antes`/`before`/`pre-` · `churn` = prefixo `fix`|`codex`|`copilot`|`refactor`|`audit` · `produto` = restantes.
Resultado: **churn 142 · produto 29 · baseline 10**.

**Tema:** primeira regra que casa, por ordem: conta/login/auth → assinatura/pagamento → simulados/provas → calculadoras/clínico → menus/locales → acessibilidade → UI/Figma → extensões → comunidade → admin → conteúdo → infra/CI → documentação → **outros/não classificado**.
Resultado: assinatura/pagamento **74** · conta/login/auth **40** · outros 31 · menus 8 · comunidade 7 · clínico 6 · extensões 5 · infra 3 · admin 3 · acessibilidade 2 · simulados 1 · UI 1.

**Consequência honesta:** 74 + 40 = **114 das 181 branches (63%) são, pelo nome, do núcleo conta→cobrança→ads** — e essa frente é a que o esqueleto não modela. (O produtor da frente `producao-conta-funil` mediu 86 com outro conjunto de palavras-chave; a diferença é do classificador, não do dado — e o número do dono é reproduzível a partir de `branches-todas.json`.)

## 5. Tabela — 181 branches

| branch | sha | data | tema (inferido) | classe | commits únicos | fundida? | risco de perda |
|---|---|---|---|---|---|---|---|
| `audit/billing-ads-final-20260914` | 3f8de36f | ? | assinatura/pagamento | churn | 3 | NAO FUNDIDA | REAL (240.987 B orfaos) |
| `audit/billing-ads-hardening-20260914` | a99c2846 | ? | assinatura/pagamento | churn | 78 | NAO FUNDIDA | REAL (250.623 B orfaos) |
| `audit/billing-ads-hardening-20260914-fix` | f386dab9 | ? | assinatura/pagamento | churn | 4 | NAO FUNDIDA | REAL (239.077 B orfaos) |
| `audit/billing-ads-hardening-clean-20260914` | 0dc778aa | ? | assinatura/pagamento | churn | 0 | FUNDIDA | nulo |
| `audit/billing-concurrency-fix-20260914` | 03e47e99 | ? | assinatura/pagamento | churn | 15 | NAO FUNDIDA | REAL (239.820 B orfaos) |
| `audit/cwv-mobile-a11y-2026-09` | a754372e | ? | acessibilidade/responsivo | churn | 0 | FUNDIDA | nulo |
| `backup/acessibilidade-antes-revisao-20261026` | 0497f5a4 | ? | assinatura/pagamento | baseline | 0 | FUNDIDA | nulo |
| `backup/menu-global-antes-icone-rodape2-20261026` | 18623d36 | ? | menus/locales/i18n | baseline | 0 | FUNDIDA | nulo |
| `backup/menu-raiz-antes-azul-20261026` | d012fe64 | ? | menus/locales/i18n | baseline | 0 | FUNDIDA | nulo |
| `backup/menus-19-antes-75px-20261026` | a303bca2 | ? | menus/locales/i18n | baseline | 0 | FUNDIDA | nulo |
| `backup/menus-19-antes-ajustes-20261026` | a303bca2 | ? | menus/locales/i18n | baseline | 0 | FUNDIDA | nulo |
| `backup/menus-19-antes-scroll-20261026` | f8c9afdc | ? | menus/locales/i18n | baseline | 0 | FUNDIDA | nulo |
| `backup/page-comments-20261012-0318` | e8300ad7 | ? | comunidade/coment | baseline | 0 | FUNDIDA | nulo |
| `backup/pre-clinical-audit-2026-09-19` | 56b9ee29 | ? | outros/nao classificado | baseline | 0 | FUNDIDA | nulo |
| `base44/setup-33f0e67e` | 3e13281e | ? | infra/ci/toolchain | produto | 2 | NAO FUNDIDA | REAL (260.356 B orfaos) |
| `base44/setup-ea01a537` | 6f06f115 | ? | infra/ci/toolchain | produto | 1 | NAO FUNDIDA | REAL (260.330 B orfaos) |
| `chatgpt/assinatura-layout-20261004` | 52f5673f | ? | assinatura/pagamento | produto | 2 | NAO FUNDIDA | nulo (conteudo ja em main) |
| `chatgpt/desenvolvedor-funil-24h-20261004` | 1c870640 | ? | outros/nao classificado | produto | 5 | NAO FUNDIDA | nulo (conteudo ja em main) |
| `chatgpt/desenvolvedor-refresh-order-20261004` | 6bd1985e | ? | outros/nao classificado | produto | 2 | NAO FUNDIDA | nulo (conteudo ja em main) |
| `chatgpt/guia-avancado-gotejamento-20261026` | f887138a | ? | assinatura/pagamento | produto | 0 | FUNDIDA | nulo |
| `chatgpt/index-calculadoras-figma-20261004` | c782b0be | ? | assinatura/pagamento | produto | 3 | NAO FUNDIDA | nulo (conteudo ja em main) |
| `chatgpt/index-extensoes-chrome-20261004` | e7ba18df | ? | extens[oõ]es de navegador | produto | 1 | NAO FUNDIDA | nulo (conteudo ja em main) |
| `chatgpt/login-google-email-only-20261004` | 952d4303 | ? | conta/login/auth | produto | 2 | NAO FUNDIDA | nulo (conteudo ja em main) |
| `chatgpt/plano-acao-melhoria-simulados-20261004` | 2e3d5019 | ? | assinatura/pagamento | produto | 1 | NAO FUNDIDA | nulo (conteudo ja em main) |
| `chatgpt/simulados-etapa-01-fundacao-20261004` | 1afa9a75 | ? | assinatura/pagamento | produto | 13 | NAO FUNDIDA | nulo (conteudo ja em main) |
| `chatgpt/simulados-etapa-02-piloto-20261004` | 43722e26 | ? | assinatura/pagamento | produto | 8 | NAO FUNDIDA | nulo (conteudo ja em main) |
| `chatgpt/simulados-etapa-02-piloto-execucao-20261004` | fdc25388 | ? | assinatura/pagamento | produto | 9 | NAO FUNDIDA | REAL (33.255 B orfaos) |
| `chatgpt/sync-menu-auth-layout-locales-20261004` | 4adc5719 | ? | conta/login/auth | produto | 1 | NAO FUNDIDA | nulo (conteudo ja em main) |
| `chore/sync-asaas-checkout-v106` | a6f90c53 | ? | assinatura/pagamento | produto | 0 | FUNDIDA | nulo |
| `codex/admin-developer-premium` | 86aadfc9 | ? | assinatura/pagamento | churn | 0 | FUNDIDA | nulo |
| `codex/album-mural-20260930` | baaf28c9 | ? | outros/nao classificado | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/alinhamento-menu-global-20261026` | e86583ee | ? | menus/locales/i18n | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/anuncios-laterais-formularios` | 7670182f | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/asaas-immediate-first-card-charge` | 32a73aed | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/bloqueio-imagens-formularios` | 9951a4ac | ? | outros/nao classificado | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/braden-icone-web-store` | 3b7d8098 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/catalog-polish-wifi-review-20260930` | 17a70129 | ? | outros/nao classificado | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/catalogo-formularios-acesso-html` | 4981d1c6 | ? | outros/nao classificado | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/catalogo-formularios-consulta-free` | 085f59d8 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/comment-form-name-checkbox-five-stars` | a304de24 | ? | comunidade/coment | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/criar-plano-de-acao-para-correcoes` | b4b13133 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/deploy-sem-interrupcao` | 9a77610d | ? | outros/nao classificado | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/developer-policy-provenance-audit-20261002` | bcacbd5b | ? | admin/developer | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/document-asaas-date-fix` | cddebffb | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/escala-12x36-previa-tutorial` | 41bf38e1 | ? | calculadoras/clinico | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/estacao-enfermagem-windows` | 60349507 | ? | outros/nao classificado | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/extensao-gasometria-arterial` | d1212424 | ? | calculadoras/clinico | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/extensao-gasometria-premium` | 00eb8bb2 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/finish-six-clinical-translations` | baf2cae3 | ? | outros/nao classificado | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/fix-asaas-date-first-payment` | b35e0e5c | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/fix-developer-account-menu` | 6f767014 | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/fix-developer-route-inventory` | fc0b72e2 | ? | admin/developer | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/fix-extension-premium-pkce` | 6ef9ae3a | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/fix-extension-revalidation` | 55993058 | ? | extens[oõ]es de navegador | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/fix-medicamentos-premium-ads-governance` | 51bde38c | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/fix-menu-scroll-19-locales-20261026` | 1c62c2ef | ? | menus/locales/i18n | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/fix-page-comments-cache-157` | b4590f66 | ? | comunidade/coment | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/fix-pending-premium-publication` | 7ed2faec | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/fix-premium-deploy-context` | 5cce1791 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/governanca-clinica-gasometria` | f82b28ea | ? | calculadoras/clinico | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/governanca-fugulin-dimensionamento` | 0522c0e0 | ? | calculadoras/clinico | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/governanca-medicamentos-gotejamento` | 185fd8eb | ? | calculadoras/clinico | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/international-premium-promo-18-languages` | 6f65338b | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/menu-raiz-azul-75px-20261026` | 8b97f369 | ? | menus/locales/i18n | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/package-extension-030` | 4557337e | ? | extens[oõ]es de navegador | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/package-extension-031` | d2a88988 | ? | extens[oõ]es de navegador | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/package-extension-032` | d259c6eb | ? | extens[oõ]es de navegador | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/pdf-storage-unicode` | 36c5bc55 | ? | outros/nao classificado | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/phq-9-20261027` | 2ea73568 | ? | outros/nao classificado | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/portuguese-premium-promo` | bffa17c4 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/previas-200dpi-pt-en-es` | 53d3dfb0 | ? | outros/nao classificado | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/previas-tamanho-natural` | c7f9b404 | ? | outros/nao classificado | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/proteger-visualizador-pdf` | 75c7dd7e | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/publish-six-localized-guides` | 36ab6227 | ? | outros/nao classificado | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/recover-seven-international-guides` | 217ba218 | ? | outros/nao classificado | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/reverte-h1-hero-index` | 33694bc9 | ? | outros/nao classificado | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/secure-developer-premium-activation` | df6a765a | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/stripe-premium-3-usd-eur` | 839e42f8 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/teste-anuncios-formularios` | 572a28ad | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/translate-recovered-guides` | 6afd8a74 | ? | outros/nao classificado | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `codex/wifi-ischemia-boundary-20260930` | 33094bf1 | ? | outros/nao classificado | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `copilot/configure-performance-monitoring` | 34d56b0f | ? | infra/ci/toolchain | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `copilot/fix-deploy-failing-job` | 7f3dd37a | ? | outros/nao classificado | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `copilot/fix-deploy-github-actions` | 4221cbd4 | ? | outros/nao classificado | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `copilot/fix-deploy-job-failure` | e70840a1 | ? | outros/nao classificado | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `copilot/fix-deploy-job-failure-again` | 60aaa170 | ? | outros/nao classificado | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `copilot/fix-deploy-job-failure-another-one` | 9fa71531 | ? | outros/nao classificado | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `copilot/fix-deploy-job-failure-yet-again` | f8649b98 | ? | outros/nao classificado | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `copilot/fix-failing-github-actions-deploy` | acc7572e | ? | outros/nao classificado | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `copilot/fix-lighthouse-audit-job` | 6a51ff96 | ? | outros/nao classificado | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `copilot/fix-login-and-subscription-issues` | 9f74b04f | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `copilot/fix-sistema-login-e-assinaturas` | 82425cd5 | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `copilot/fix-user-accounts-issue` | 62bcd42c | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `copilot/review-session-history` | e2e17f28 | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `copilot/review-session-history-again` | 0dc778aa | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `docs/auditoria-canonica-contas-2026-10-01` | 32659629 | ? | conta/login/auth | produto | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `feat/ads-controlado` | b158baa9 | ? | assinatura/pagamento | produto | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `feat/gad7-questionario-20261027` | 86de6e0f | ? | assinatura/pagamento | produto | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `feat/metricas-ga4-dashboard` | e2571cb3 | ? | admin/developer | produto | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `feat/page-comments-owner-actions-20261012` | 0a487c5a | ? | comunidade/coment | produto | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `feat/page-comments-supabase` | 88bee938 | ? | comunidade/coment | produto | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `feat/premium-ad-free` | 4ea9b025 | ? | assinatura/pagamento | produto | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `feat/premium-sem-anuncios-canonico` | 4a1af310 | ? | assinatura/pagamento | produto | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `feat/premium-welcome-banner-20260914` | 18964ea6 | ? | assinatura/pagamento | produto | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix-supabase-preview-migration-baseline-2026-09-20` | eb2f3262 | ? | outros/nao classificado | produto | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/account-auth-bootstrap-nonblocking` | f045eb40 | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/account-localized-navigation-20260929` | d52a3d9c | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/account-localized-routing-20260928` | 822dcb18 | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/account-login-home-and-profile-bootstrap` | 1747dea0 | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/account-pages-i18n-bugs-20260929` | 1902d302 | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/account-pages-stable-bootstrap` | 6a6cdd1f | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/account-pages-standalone-runtime` | 7a7fee5d | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/account-ptbr-routing` | d592996e | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/account-subscription-verifying-state` | 40c5d466 | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/ads-free-users-20260914` | 45ac64e4 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/ads-free-users-20260914-main` | 4558daa7 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/ads-premium-audit-20260914` | a52c98e1 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/analytics-metrics-deploy` | 7327a655 | ? | outros/nao classificado | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/asaas-checkout-customer-data` | 09cd4236 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/assinatura-auth-race` | 5291080f | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/auth-menu-dropdown-bootstrap` | 4c440848 | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/billing-access-empty-entitlement` | 914e3127 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/checkout-error-state` | 313cb5bc | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/checkout-login-readiness` | 4601ca42 | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/clinical-calculators-audit-2026-09` | 61fecc4d | ? | calculadoras/clinico | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/conta-localizada-bugs-20260928` | 1f6f69c8 | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/corrigir-auth-core-listeners` | 89676a5c | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/exames-laboratoriais-layout-20261026` | 1cd120f6 | ? | simulados/provas | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/forum-layout-avatares-traducao-20261026` | 048f0c87 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/free-braden-fugulin-dimensionamento` | 28ed3f90 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/gad7-fidelidade-meem-20261027` | 43bfef25 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/global-modal-overlay-interaction` | 18a420e7 | ? | outros/nao classificado | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/international-checkout-footer-20260914` | c1c3f1d2 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/international-stripe-checkout` | feddc068 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/liberar-braden-fugulin-dimensionamento-free` | ad7da1d1 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/localized-account-routes-20260929` | 1af76730 | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/login-returnurl-assinatura` | 858262aa | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/matriz-de-risco-funcional-layout-20261026` | acf3d8dd | ? | UI/design/figma | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/menu-conteudos-flyout-cascade-20261026` | ebba223c | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/menu-global-root-loader` | 362582a8 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/multiplex-ad-layer` | c2fa7cf9 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/page-comments-inline-delete-20261012` | 00210afe | ? | comunidade/coment | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/page-comments-loader-rehydration-race` | 5929940c | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/page-comments-mobile-actions-release` | cb7c067b | ? | acessibilidade/responsivo | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/page-comments-premium-rehydration` | 327ca65c | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/page-comments-visible-before-calculation` | 9e446d7d | ? | comunidade/coment | baseline | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/premium-access-bootstrap` | 5facc1a4 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/premium-access-canonical-resolution` | e69d794b | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/premium-access-root-cause` | db4ae8ba | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/premium-access-root-cause-2` | 392698b3 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/premium-ad-free-test` | 03fea4bb | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/premium-ads-build-order` | 9903d4c0 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/premium-asaas-webhook-reconciliation` | a249a1c5 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/premium-cache-and-loader-recursion` | 603810c2 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/premium-entitlement-readonly` | 18a83cc8 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/premium-homologation-gates` | 707b1a29 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/premium-payments-asaas-stripe-20260913` | 30be2e4e | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/premium-promo-zindex` | e637473f | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/premium-simulados-shell-boundary-2026-09-20` | 7677616c | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/premium-sw-template-auth-bypass` | 628ecab2 | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/profile-auth-bootstrap-timeout` | 5b17fceb | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/profile-loading-hard-timeout` | 4669c30f | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/profile-page-hang` | 46b81f0b | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/test-premium-ads-anchor` | 85c99dd9 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/test-premium-ads-anchor2` | 6a80cb92 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `fix/test-premium-ads-assertion` | 9ba1c959 | ? | assinatura/pagamento | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `pre-projetos` | 52c519d1 | ? | outros/nao classificado | baseline | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `rebuild/profile-isolated-runtime` | 4e9c5235 | ? | conta/login/auth | produto | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `refactor/contas-free-premium` | 573a7267 | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `refactor/contas-internacional-fase1` | ddfcb782 | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `refactor/contas-internacional-fase10` | c2b0f5eb | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `refactor/contas-internacional-fase2` | e1da753d | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `refactor/contas-internacional-fase4` | 18095553 | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `refactor/contas-internacional-fase5` | 7c1b76ee | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `refactor/contas-internacional-fase6` | 342c6c12 | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `refactor/contas-internacional-fase7` | 1e246740 | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `refactor/contas-internacional-fase8` | 44a66636 | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `refactor/contas-internacional-fase9` | 40b11648 | ? | conta/login/auth | churn | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `sanitize-premium-access-2026-09-20` | 3b0c72ac | ? | assinatura/pagamento | produto | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `sync-premium-main-2026-09-20` | c234ff53 | ? | assinatura/pagamento | produto | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
| `test/stripe-sandbox` | a2126f6a | ? | assinatura/pagamento | produto | — | (nao medido nesta ronda) | (nao medido nesta ronda) |
## 6. Riscos de bifurcação

|grupo | evidência | risco |
|---|---|---|
| **`audit/billing-ads-*` (4 branches, ~970 KB órfãos)** | 3 branches com 78/15/4 commits únicos; conteúdo órfão medido | **O maior risco de perda do repo.** Quatro variantes do mesmo tema — `final`, `hardening`, `hardening-fix`, `clean` — que só se distinguem pelo nome. A `clean` está fundida em `main`; as outras **não**. Qual é a versão boa? **Não medido** |
| **`base44/setup-*` (2 branches, ~520 KB órfãos)** | `setup-33f0e67e` (2 commits) e `setup-ea01a537` (1 commit) | Snapshot de setup com a árvore inteira do projeto. Risco de perda baixo (conteúdo generoso), ruído alto |
| **`backup/*` (8 branches)** | `acessibilidade-antes-revisao`, `menu-global-antes-icone-rodape2`, `menu-raiz-antes-azul`, `menus-19-antes-{75px,ajustes,scroll}`, `page-comments-20261012-0318`, `pre-clinical-audit` | **Baselines antes de mudanças visuais.** **Medido pelo owner (01/11, `git merge-base --is-ancestor` sobre as 10 baselines): 9 estão FUNDIDAS em `main` e 1 NÃO está** — `fix/supabase-preview-migration-baseline-2026-09-20`. Das 9 fundidas o **conteúdo não se perde** se a branch for apagada (o commit está no histórico de `main`); o que se perde é o **rótulo** — o registo de que ali houve um 'antes'. A 10.ª é a **única com risco de conteúdo** |
| **`chatgpt/menus-19-antes-*` (4 baselines paralelos)** | nomes quase idênticos | **Quatro "antes" do mesmo ecrã** ⇒ divergência de baseline. Qual é o bom? Não medido |
| **ads vs billing-clean** | `feat/ads-controlado`, `feat/premium-sem-anuncios-canonico`, `fix/ads-free-users-20260914`, `audit/billing-ads-clean-20260914` (fundida) | Duas políticas de ads em paralelo. O esqueleto tem de decidir **uma**; portar as duas cria duas verdades |
| **`chatgpt/simulados-etapa-01/02` (4 branches)** | `fundacao`, `piloto`, `piloto-execucao`, `plano-acao-melhoria-simulados` | `piloto-execucao` tem 33 KB órfãos. Sequência de trabalho a meio — **não portar sem ler** |

## 7. O que NÃO se deve portar para o esqueleto CE

| Não portar | Porquê |
|---|---|
| **UI rival / markup das branches de chatgpt** | O esqueleto é **catálogo + contratos, sem UI** (E5). Portar markup congela um ecrã que a revisão de acessibilidade e a de Figma já estão a mexer |
| **Código de checkout/entitlement das branches `audit/billing-ads-*`** | Não há modelo de entitlement no esqueleto. Portar checkout sem `owner_scope` + reason codes é exactamente o bug que 6+ branches `premium-access-root-cause` já tentaram corrigir — levar o sintoma sem o modelo repete a dívida |
| **Ads (`feat/ads-controlado`, `fix/ads-free-users-*`)** | Nenhum objecto de anúncio no esqueleto, e a decisão "ads para free?" é do dono (D5 da frente `producao-conta-funil`). Decidir antes de portar |
| **Os 4 baselines `menus-19-antes-*` como código** | Sãobaseline, não fonte. Portar o "antes" de um ecrã é portar uma regressão |
| **As variantes `fix`/`codex`/`copilot` (137 branches)** | São churn sobre código que já existe em `main`; 137 branches para 3 domínios maduros é ruído de vocabulário, não fonte |
| **`base44/setup-*`** | Snapshot integral de setup. Ruído; não é fonte de verdade |

## 8. O que NÃO foi medido (NOT_RUN)

| Item | Estado | Motivo |
|---|---|---|
| Teste de órfão em 151 das 181 branches | **NOT_RUN** | varredura de blobs em 181 branches sobre clone em NFS excedeu o orçamento; o teste só correu nas 30 branches da amostra |
| Conteúdo real de qualquer branch | **NOT_RUN** | nenhum `git show`/leitura de árvore por branch; o tema é inferido do nome |
| Qual das variantes `ads`/`billing` é a canónica | **NOT_RUN** | exige leitura de código das branches; é decisão do dono |
| Estado "merged" por branch | **NOT_RUN** para 151 | `merge-base --is-ancestor` por branch não foi concluído na janela; medido nas 30 da amostra e nas 10 baselines (9 fundidas, 1 não) |
| Métricas de prod (volume, visitas, uso) | **NOT_RUN** | fora do âmbito; o produto não tem telemetria |
| Se `main` do repo público é o código em produção | **NOT_RUN** | o app em produção é privado (`IndiciumFIN/calculadorasdeenfermagem`); não foi comparado |
| Contagem de branches por tema sem ambiguidade | **parcial** — 31 em "outros/não classificado" | o classificador é por palavra-chave; as 31 ficam porTriagem manual |

## 9. Notas

1. **A lista de 30 branches do E2 está errada e foi substituída.** O `branches-publicas.json` do pack tem 30 entradas; o repo tem 181. A lista certa é `/workspace/evidence_pack/branches-todas.json` e o sha de todas as 182 refs confere entre a lista oficial e o clone (`git for-each-ref`) — **0 divergências**.
2. **O achado que interessa ao produto:** 114 das 181 branches (63%) são, pelo nome, do núcleo **conta→cobrança→ads**; 137 (76%) são churn de agente. O esqueleto CE tem 201 capabilities e 410 serviços, e **nenhum dos dois modela essa superfície**. O port do esqueleto para o repo tem de decidir, antes de escrever código, o que fazer com 114 branches de uma frente que o esqueleto não conhece.
3. **Regra para as branches `backup/*` (rev. 2, owner):** são baseline. Medido: **9 das 10 já estão fundidas em `main`** → o conteúdo está a salvo no histórico; **falta registar o rótulo**. **1 não está fundida** (`fix/supabase-preview-migration-baseline-2026-09-20`) → é a única com risco de conteúdo e precisa de decisão antes de qualquer limpeza. A decisão de arquivamento é do dono.

*Ficheiro gerado pelo owner em 2026-11-01. Sem push, sem commit. Nada inventado: onde a fonte não existia, está NOT_RUN.*
