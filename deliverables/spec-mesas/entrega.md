# Entrega — `spec-mesas`

**Tarefa:** `spec-mesas` · **Data:** 2026-10-26 (UTC) · **Árvore:** `/workspace/workspace-repo` · branch `feat/projection-unica-f0-suite-real`, base `4c17fe7`
**Especificação:** `docs/admin/especificacao-mesas-novas.md` · **Resumo:** `deliverables/spec-mesas/deliverable.md` · **Registro JSON:** `deliverables/spec-mesas/entrega.json` (14 chaves)

---

## O que foi feito

Especifiquei as três mesas novas — **SEO**, **Idioma** e **País/jurisdição** — que outra task vai implementar na área admin. Para cada uma: a **lista de campos com a tabela de origem**, a **regra de escrita**, o que vira **`DERBY`** e o **gate** (a lista do que a mesa tem que recusar).

A medição foi feita no banco real (PGLite com as migrations `0001`–`0035` aplicadas em ordem, mesmo caminho de `src/lib/db.ts`) e no site publicado (16 rotas, 26/10/2026). Nenhum número é de impressão.

**Números que sustentam a especificação:**

- `locale`: **31** linhas · **26** com `label` igual ao `id` · **27** com **0 conteúdo publicado**
- `content_text`: **3.925** linhas (**1.767** publicadas / **2.158** rascunho) · `content_alias`: **3.942** linhas (**1.768** publicadas)
- `chrome_label`: **7.797** linhas em 4 grupos — `chrome` **4** idiomas · `footer` **30** · `home` **19** · `menu` **3**
- `publicPaths()`: **47** endereços públicos · `sitemap_url` e `public/sitemap.xml`: **24** `<loc>` → **23 rotas fora do sitemap**
- `crawl_rule` / `public/robots.txt`: **2** `Disallow` · **94** tabelas de aplicação (+1 `_migrations` = **95**)
- `public/og.jpg`: **1200×630**, 44.569 bytes — **1** cartão para 47 rotas e 31 idiomas
- Site publicado: **16/16** rotas com o **mesmo** `title`, o **mesmo** `og:title`, o **mesmo** `canonical` (a home), `twitter:title`/`og:description`/`og:image`/`og:url`/`og:site_name` **ausentes**, JSON-LD só `WebSite`, e `/nao-existe` em **HTTP 200**

**Dois achados que mudam a implementação e que não estavam no pedido:**

1. **`site_route` foi dropada** pela migration `0029_retire_duplicates.sql`. A mesa de SEO não pode editá-la: a rota mora em `content_alias` e o texto em `content_text`.
2. **O `hreflang` está em três números diferentes** — 4 em `src/lib/seo.ts`, 18 em `src/lib/locale-publish.ts`, 31 em `locale` — e o material de origem do dono diz que hreflang de idioma sem conteúdo **não deve ser publicado**. A especificação amarra os três: o `hreflang` é derivado do que está **publicado e revisado**.

**Nada de código de produto foi alterado.** Os 4 arquivos criados são documento (1 especificação + 3 de entrega).

---

## Registro por chave canônica

| chave_canonica | contrato_aplicado | evidencia_produzida | dependencia_a_revalidar |
|---|---|---|---|
| `tabela:content_text` | `src/lib/content-object.functions.ts` (readPublishedContent) + `src/lib/locale-publish.ts` (assertLocalePublish) + `migrations/0020_content_object.sql` | `docs/admin/especificacao-mesas-novas.md` §1.3 (SEO-01/SEO-02), §1.6.2 e §1.6.2.b e §2.3 (IDI-14) — **3.925** linhas, **1.767** publicadas; `title` **≤70 no título servido** (o campo ≤ 41, porque a rota acrescenta ` · Calculadoras de Enfermagem`) é a **única** fonte de `<title>`/`og:title`/`twitter:title`; **8 das 47** rotas passam de 70 (máx. **107** em `/ferramentas/gotejamento`); **229** títulos distintos repetidos em **459** linhas, **0** colisão entre as 47 rotas indexáveis | o `title` da rota passa a ser a fonte única do head: quem vier depois tem que responder se a mesa de conteúdo (M09) e a mesa de SEO escrevem no **mesmo** campo, e não em duas colunas paralelas — e se o sufixo ` · Calculadoras de Enfermagem` continua no `<title>` ou passa a viver no campo |
| `tabela:content_alias` | `src/lib/content-object.functions.ts` + `migrations/0020_content_object.sql` | `docs/admin/especificacao-mesas-novas.md` §1.2 — **3.942** aliases, **1.768** publicados; é a **fonte da rota** depois do drop de `site_route` | o canonical por idioma tem que ser derivado do alias da variante: quem vier depois tem que responder se a rota `/<idioma>/…` do acervo continua fora do sitemap (decisão editorial) ou entra |
| `tabela:chrome_label` | `src/lib/chrome.tsx` (o `t()` lê a tabela) + `migrations/0030_stored_files.sql` | `docs/admin/especificacao-mesas-novas.md` §2.2 e §2.3 (IDI-10/IDI-13) — **7.797** linhas, 4 grupos, cobertura `chrome` **4** idiomas / `footer` **30** / `home` **19** / `menu` **3** | `chrome_label` tem chave `(locale, group_id, key)`: quem vier depois tem que responder se a edição é da **mesa de idioma** ou da **mesa de SEO** — a especificação põe na mesa de idioma (rótulo é chrome, não SEO) |
| `tabela:locale` | `migrations/0012_intake.sql` + `src/lib/locale-publish.ts` + `migrations/0033_cross_keys.sql` (insere os 31 a partir de `chrome_label`/`content_text`/`content_alias`/`intake_file`) | `docs/admin/especificacao-mesas-novas.md` §2.1 e §2.2 — **31** linhas, **26** com `label` = `id`, **27** com 0 conteúdo publicado; código de publicação aceita **18** contra **31** na tabela | `locale.label` é o nome do idioma em pt-BR (fato ISO 639-1): a tarefa `derby` (0037) tem que gravar o nome real dos 26 — **nunca** `DERBY`, **nunca** o id. Quem vier depois tem que responder se o gate de publicação passa a ler a tabela em vez da constante de 18 |
| `tabela:sitemap_url` | `public/sitemap.xml` + `src/lib/contract.ts` (`sitemapXml()`, hoje **sem consumidor**) | `docs/admin/especificacao-mesas-novas.md` §1.3 (SEO-11) e §1.6.3 — **24** `<loc>` contra **47** endereços em `publicPaths()`; **23** rotas públicas fora do sitemap | `sitemapUrl` não é materializado de `sitemap_url` nesta árvore: quem vier depois tem que responder se o sitemap passa a ser gerado do banco (e qual o gerador) — **D4** |
| `tabela:crawl_rule` | `public/robots.txt` + `migrations/0032_public_files.sql` | `docs/admin/especificacao-mesas-novas.md` §1.3 (SEO-12) e §1.5 (G7) — **5** linhas, **2** `Disallow` (`/sistema`, `/pacote`); o publicado tem **6** | `crawl_rule` e `public/robots.txt` são **dois** lugares que podem divergir: quem vier depois tem que responder se o build materializa um do outro — **D5** |
| `tabela:media_asset` | `migrations/0032_public_files.sql` + `public/og.jpg` | `docs/admin/especificacao-mesas-novas.md` §1.3 (SEO-13) e §3.1 — **20** linhas; `note` é só o nome do arquivo (sem hash, sem dimensão); **1** cartão 1200×630 para 47 rotas e 31 idiomas | a nota precisa de hash e dimensão verificados: quem vier depois tem que responder se a verificação lê o disco no build ou se o `note` é gravado por quem produz o cartão |
| `tabela:seo_page` **(nova — proposta)** | `src/lib/policy-decision.ts` (decide por `policy_rule`) + `migrations/0026_control_plane.sql` (padrão de `policy_package`/`policy_rule`) + `docs/admin/especificacao-mesas-novas.md` §4.1 | `docs/admin/especificacao-mesas-novas.md` §1.3 (SEO-04, SEO-06, SEO-07, SEO-08, SEO-09, SEO-14) e §4.1 — 9 colunas, chave `(path, locale)` | **a tabela não existe e a migration proposta (`0040_mesas_seo_idioma_jurisdicao.sql`) está fora do escopo de quem implementa o admin** (`migrations/**` é de outro worker): quem vier depois tem que responder **quem cria a tabela** e se ela entra antes ou depois de 0039 — **D1** |
| `tabela:locale_state` **(nova — proposta)** | `src/lib/policy-decision.ts` + `migrations/0026_control_plane.sql` + `docs/admin/especificacao-mesas-novas.md` §4.1 | `docs/admin/especificacao-mesas-novas.md` §2.3 (IDI-04, IDI-05, IDI-08, IDI-09, IDI-11, IDI-12) e §4.1 — 7 colunas, chave `locale` | idem `seo_page`: **D1**. Além disso, `status` e `seo_eligibility` são **derivados** e gravados: quem vier depois tem que responder onde fica a regra que os deriva, para não haver dois lugares com ela |
| `tabela:jurisdiction` **(nova — proposta)** | `src/lib/policy-decision.ts` + `migrations/0026_control_plane.sql` + `docs/admin/especificacao-mesas-novas.md` §4.1 | `docs/admin/especificacao-mesas-novas.md` §3.2 (JUR-01 a JUR-08, JUR-11) e §4.1 — 10 colunas, chave `id` (= `country_code`) | idem `seo_page`: **D1**. E: **`en` está em `DERBY`** porque o registro de referência diz "Reino Unido" e o material de origem fala de `en-US` — quem vier depois tem que responder qual dos dois entra (**D9**) |
| `componente:src/lib/seo.ts` | `src/lib/contract.ts` (publicPaths/sitemapXml) + `docs/admin/especificacao-mesas-novas.md` §1.1 | `docs/admin/especificacao-mesas-novas.md` §1.1 e §1.4 — `siteOrigin` é **constante**; `locales` tem **4** idiomas; `languageLinks()` devolve **6** links por rota | o `hreflang` passa a ser **derivado do conteúdo publicado** e não da constante: quem vier depois tem que responder se `src/lib/seo.ts` continua sendo a fonte do `hreflang` ou se passa a ler `locale_state` — **D3** |
| `componente:scripts/grok-pwa-shared.mjs` | `scripts/grok-pwa-plugin.test.mjs` (fixa `twitter:card`/`og:title` e a não-duplicação) + `docs/admin/especificacao-mesas-novas.md` §1.5 (G8) | `docs/admin/especificacao-mesas-novas.md` §1.6.1 — `stripShareMetaTags()` remove `twitter:title`/`og:url`/`og:site_name` e `grokOgHeadTags()` **não** os reinjeta: `twitter:title` **ausente**; `og:description` ausente porque `src/lib/og/site.json` não tem `description` | o gate G8 (head renderizado com as três strings iguais) **não é de escrita**, é de render: quem vier depois tem que responder onde esse teste roda (build ou suíte) e se ele substitui ou complementa `scripts/grok-pwa-plugin.test.mjs` |
| `componente:src/lib/og/site.json` | `scripts/grok-pwa-shared.mjs` (`readOgSite`, `snapshotOgIdentity`) + `docs/admin/especificacao-mesas-novas.md` §1.3 (SEO-15) | `docs/admin/especificacao-mesas-novas.md` §1.1 e §1.6.1 — `{"title":"Calculadoras de Enfermagem","card":"custom"}`, **sem `description`**; a identidade do app é o que **não** pode ir no `og:title` de uma página | o `title` do `site.json` é identidade de **app** (PWA/manifesto): quem vier depois tem que responder se ele passa a alimentar `og:site_name` e se a identidade continua fora do `og:title` de rota |
| `documento:docs/admin/especificacao-mesas-novas.md` | `docs/entregas/FORMATO-DE-ENTREGA.md` + `docs/admin/especificacao-mesas-novas.md` §0.2 (princípios 1–6) | o próprio documento — **3** mesas × (**campos com tabela de origem** · **regras** · **DERBY** · **gate** de **10**, **8** e **8** recusas) + §4 (3 tabelas propostas, 10 `policy_rule`) + §6 (**10** dependências) + §7 (**8** `NOT_RUN`) | o documento descreve o **alvo**; o estado real do build desta árvore só é conhecido depois que alguém rodar o build: os itens **N1**, **N2** e **N6** continuam `NOT_RUN` |

---

## O que ficou `NOT_RUN`

`N1` head do build desta árvore · `N2` `twitter:title` no build desta árvore · `N3` colisão de título nas 47 rotas indexáveis · `N4` peso de um cartão 1200×630 por idioma · `N5` `og:url`/`og:site_name` no site inteiro (16 rotas é amostra) · `N6` `hreflang` por rota no site publicado · `N7` contagem de tabelas **com** as 3 novas (medi **94** + `_migrations`; o "98" do pedido de origem não foi afirmado) · `N8` `npm test` / `npm run build` / `tsc --noEmit`.

Sem afirmação de volume de busca, posição ou métrica de mercado. Sem conteúdo clínico. Sem alteração de código de produto.
