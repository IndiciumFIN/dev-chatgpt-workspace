# Especificação das três mesas novas — SEO, idioma e país/jurisdição

> **Status:** especificação (consultoria). Não é código. Quem implementa lê este documento e escreve as mesas.
> **Árvore medida:** `/workspace/workspace-repo`, branch `feat/projection-unica-f0-suite-real` (base `4c17fe7`).
> **Banco medido:** PGLite com as migrations `0001`–`0041` aplicadas em ordem — as **39** da árvore (mesmo caminho de `src/lib/db.ts`).
> **Data da medição:** 26/10/2026. **A primeira redação mediu `0001`–`0035`; as 0037, 0038 e 0041 entraram depois e mudaram os números.** Tudo que mudou está marcado **[atualizado]** — o número antigo está ao lado, para ninguém comparar com o rascunho e achar que regrediu.
> **Site publicado medido:** `https://20itbcndi7b8r.space.minimax.io` (build **v271**, que é uma árvore diferente da que este documento especifica — ver §0.3). **Re-verificação a partir deste sandbox: `NOT_RUN`** (a URL não respondeu em 26/10 — §7, N1).
> **Como remedir:** §0.5 (comandos prontos, para o número nunca ser de memória).

---

## 0. Como ler este documento

### 0.1 O que as três mesas são

| Mesa | Pergunta que responde | Dono da escrita |
|---|---|---|
| **SEO** | "O que o buscador lê desta rota?" | `content_text` (título/description), `seo_page` (novo), `sitemap_url`, `crawl_rule`, `media_asset` |
| **Idioma** | "Qual é o estado real deste idioma?" | `locale`, `chrome_label`, `locale_state` (novo), `content_text.status` |
| **País/jurisdição** | "De onde vem a norma, em que país, com que unidade?" | `jurisdiction` (novo), `locale_state.country_code`, `fundamento`, `source_tool` |

As três mesas **não** são três telas isoladas: elas escrevem em tabelas que o site já lê. Nenhuma delas despeja em `ops_record` (texto livre). Onde hoje não existe dado, a mesa **cria a linha** na tabela de verdade ou marca `DERBY` — nunca inventa valor.

### 0.2 Princípios que valem para as três

1. **Uma fonte por fato.** O título da página vive em `content_text.title` e em mais lugar nenhum. A mesa SEO não cria uma coluna `og_title` paralela: ela declara a regra "`title` = `og:title` = `twitter:title`" e o render usa a mesma string três vezes. Duas colunas para o mesmo texto são duas verdades — e a segunda sempre vence a errada.
2. **A identidade do app não é o título da página.** `src/lib/og/site.json` (`{"title":"Calculadoras de Enfermagem","card":"custom"}`) descreve o **app** (PWA, manifesto, appName). O `og:title` de uma página é o **título da página**. A identidade do app entra em `og:site_name`, nunca em `og:title`.
3. **O buscador só é what's no ar.** Se a mesa escreve uma regra, a regra tem que estar num arquivo que o build consome (`public/robots.txt`, `public/sitemap.xml`, `src/lib/og/site.json`, `src/lib/seo.ts`) — não num registro que ninguém lê.
4. **`DERBY` é pendência visível, não valor.** `DERBY` = marcador de pendência humana. Não é conteúdo, não é resposta, não é resposta inventada. Onde a verdade é conhecida e verificável, o valor real vai. Onde não é, `DERBY` — e a linha **continua pendente** na tela, nunca mascarada.
5. **O gate recusa; a tela explica.** Cada mesa tem uma lista de escritas que ela **tem que recusar** (§1.5, §2.5, §3.5). A recusa nomeia a regra e o campo, no formato do `policy_rule` (§4).
6. **Design system do site, não um admin paralelo.** As três mesas usam as classes que já existem em `src/styles.css`: `.paper`, `.field`, `.btn-navy`, `.btn-line`, `.btn-danger`, `.btn-sm`, `.admin-table`, `.badge`, `.cmd-band`, `.swatch-grid`, `.phase-list`, `.contract-list`, `.tool-help`; tokens `--color-navy #1a3e74`, `--color-sky #4a90e2`, `--color-ink #0f2440`, `--color-line #dbe3ec`, `--color-canvas #f9fafb`; fontes `--font-sans` (Inter) e `--font-display` (Nunito Sans). **Nenhuma cor nova.**

### 0.3 Duas árvores, dois números de rota — leia antes de medir de novo

O site publicado em `20itbcndi7b8r.space.minimax.io` é o build **v271**, com o `sitemap.xml` de **41 URLs** e um `robots.txt` com **6** `Disallow`. A árvore que este documento especifica (`feat/projection-unica-f0-suite-real`) tem `public/sitemap.xml` com **24 URLs** e `public/robots.txt` com **2** `Disallow`, e o código declara **47** endereços públicos (§1.6.3).

Os dois números são verdadeiros, de árvores diferentes. **Quem implementar precisa decidir qual é a árvore alvo** e dizer isso no deliverable. A medição do head publicado (§1.6.4) é do v271 e vale como evidência do *padrão* de falha — não como medição desta árvore.

> **[atualizado]** A medição do site publicado **não pôde ser repetida** em 26/10 a partir deste sandbox: `web_fetch` em `https://20itbcndi7b8r.space.minimax.io/` e em `/ferramentas/braden` devolveu "file load failed" nas duas tentativas. Os números de §1.6.4 são da rodada anterior (v271) e estão marcados como `NOT_RUN` na re-verificação (§7, N1). **O que é medido nesta árvore é o código e o banco** — e o código já mostra o mesmo defeito que o build publicado mostra (§1.6.1).

### 0.5 Como remedir (os comandos, não o número de memória)

O número de tabelas, de idiomas e de rotas **se conta**. Quem implementa precisa contar de novo, no banco que vai ler, e não copiar o número deste documento.

```bash
# 1. Banco vivo: aplica as migrations da árvore num PGlite em memória e conta
node scripts/audit-indice-banco.mjs --json      # portão: dicionário × índice
#    ou o caminho que o próprio app usa:
#    getSql() -> PGlite -> aplica migrations/ em ordem

# 2. Tabelas (sem número fixo no código — o gate conta sozinho)
select count(*) from information_schema.tables
 where table_schema='public' and table_type='BASE TABLE';

# 3. As três fontes de verdade do SEO
select count(*) from sitemap_url;    -- mapa do site
select count(*) from crawl_rule;     -- robots.txt
select count(*) from content_alias;  -- endereços publicados

# 4. Estado por idioma (o que a Mesa de Idioma tem que mostrar)
select locale, count(*) filter (where status='publicado') as publicadas,
              count(*) filter (where review_state='DERBY') as pendentes
  from content_text group by locale order by 2 desc;

# 5. A lista de idiomas que o código usa (hoje são três listas diferentes)
grep -n "locales\s*=" src/lib/seo.ts          # 4 idiomas
grep -n "languages\s*=" src/lib/page-links.ts  # 19 idiomas
grep -n "locales = new Set" src/lib/locale-publish.ts  # 18 idiomas
```

### 0.6 O número de tabelas: **96**, e ele se conta

| Origem do número | Valor | Estado |
|---|---|---|
| Medido nesta árvore (39 migrations, `information_schema`) | **96** | **é o número** |
| `schema_entity` (dicionário) | **96** | bate com o físico |
| `src/lib/banco/indice.ts` (índice em código) | **96** | bate com o físico |
| Briefing desta rodada | 94 | **obsoleto** — contava `0001`–`0035`; as 0038 e 0041 criaram tabelas |
| Regra de entrega desta rodada | 98 | **não confere com a árvore** — contava outra coisa (ou outra lista de migrations) |
| Exemplo do `FORMATO-DE-ENTREGA.md` | 102 | **exemplo de texto**, não medição |

`0029_retire_duplicates.sql` **dropou** `site_route` (e mais 6 tabelas legadas): por isso a contagem **cai** quando uma migration nova chega. Com as 3 tabelas novas desta especificação (§4.1), o total passa a **99** — **contado, nunca escrito no código**.


### 0.4 O que este documento **não** faz

- Não escreve conteúdo clínico e não sugere texto de página.
- Não inventa volume de busca, posição, tráfego ou qualquer métrica de mercado. Onde aparece um número, ele é **contagem de linha/arquivo medido em 26/10/2026**, e a origem está escrita ao lado.
- Não altera código. Onde falta dado, o documento diz **qual arquivo tem que mudar** e **quem tem o escopo** — e registra isso como dependência, não como fait accompli.

---

## 1. MESA SEO

### 1.1 O que existe hoje para SEO (medido)

| # | Peça | Onde está | Medido |
|---|---|---|---|
| 1 | Host canônico | `src/lib/seo.ts` → `siteOrigin = "https://calculadorasdeenfermagem.com.br"` | constante em **código**, não em tabela |
| 2 | Lista de idiomas do `hreflang` | `src/lib/seo.ts` → `const locales = ["pt-BR","en","es","fr"]` | **4** idiomas |
| 3 | `absoluteUrl(path, lang)` | `src/lib/seo.ts` | põe `?lang=` quando `lang ≠ "pt-BR"`; `pt-BR` = sem parâmetro |
| 4 | `languageLinks(path, lang)` | `src/lib/seo.ts` | devolve **1 canonical + 4 alternates + 1 x-default = 6 links** |
| 5 | JSON-LD da home | `src/lib/seo.ts` → `websiteJsonLd()` | `WebSite`, `inLanguage: ["pt-BR","en","es","fr"]` |
| 6 | JSON-LD de ferramenta | `src/lib/seo.ts` → `toolJsonLd(tool)` | `WebApplication` + `FAQPage` + `BreadcrumbList` |
| 7 | JSON-LD de artigo | `src/routes/blog.mary-eliza-mahoney.tsx` | `Article`, `inLanguage: "pt-BR"` fixo, `dateModified: "2026-10-10"` fixo |
| 8 | Cartão social | `scripts/grok-pwa-shared.mjs` → `grokOgHeadTags()` + `stripShareMetaTags()` | reinjeta `twitter:card`, `og:title`, `og:image`, `og:image:width/height` |
| 9 | Identidade do app | `src/lib/og/site.json` | `{"title":"Calculadoras de Enfermagem","card":"custom"}` — **sem `description`** |
| 10 | Cartão em disco | `public/og.jpg` | JPEG **1200×630**, 44.569 bytes — **1 arquivo para todas as rotas e todos os idiomas** |
| 11 | Regras de rastreio | `crawl_rule` (5 linhas) e `public/robots.txt` | `User-agent: *`, `Allow: /`, `Disallow: /sistema`, `Disallow: /pacote`, `Sitemap: …` |
| 12 | Mapa do site | `sitemap_url` (24 linhas) e `public/sitemap.xml` (24 `<loc>`) | os dois têm o **mesmo** conteúdo |
| 13 | Ativos de mídia | `media_asset` (20 linhas) | inclui `/og.jpg`, `/robots.txt`, `/sitemap.xml` |
| 14 | Rótulos de interface | `chrome_label` (7.797 linhas, 4 grupos) | `chrome` 196 · `footer` 780 · `home` 6.689 · `menu` 132 |
| 15 | Endereços públicos | `src/lib/contract.ts` → `publicPaths(pages)` | "/" + "/blog/mary-eliza-mahoney" + `/secao/<slug>` (40) + `/ferramentas/<slug>` (5) = **47** |
| 16 | Sitemap materializado | `src/lib/contract.ts` → `sitemapXml(pages)` | **nenhum consumidor**: não existe `scripts/materialize-static-routes.mjs` nesta árvore |
| 17 | Arquivos de rota | `src/routes/*.tsx` | **22** arquivos de rota; **15** declaram `head:`; **7** não declaram (`conta`, os 4 `institucional*`, `modelos.tsx`) — e portanto herdam o `title` global da raiz |
| 18 | `og:` / `twitter:` no código | `grep -rn "og:title\|og:description\|og:image\|og:url\|og:site_name\|twitter:" src/` | **0 ocorrências**. A única meta OG escrita em rota é `og:type` (artigo). `src/lib/og/site.json` tem **só** `title` e `card` — sem `description` |
| 19 | Onde o `og:title` nasce | `scripts/grok-pwa-shared.mjs` → `grokOgHeadTags()` / `stripShareMetaTags()` | o **build** injeta `og:title`/`og:image`; o que a rota escreve não é o que sai. `stripShareMetaTags()` remove `og:title`, `twitter:title`, `og:image`, `og:url`, `og:site_name` do HTML da rota |
| 20 | `noindex` por rota | 8 arquivos de rota | `admin`, `login`, `sessao`, `assinante`, `pacote`, `sistema`, `modelos.index`, `modelos.$id` — **hardcoded no código**, não em dado |
| 21 | Catálogo do admin | `src/lib/admin-catalog.ts` | **21** módulos (`M02`–`M22`), **9** com `desk: null` (`M02, M03, M13, M14, M15, M18, M20, M21, M22`), **11** com mesa. **`M13` "Marketing e inteligência" tem o submódulo "SEO" e `desk: null`** — é a lacuna que a Mesa SEO fecha. **`M11` "Idioma e acessibilidade" abre `desk: "conteudo"`** (não tem mesa própria). **Nenhum** módulo cobre país/jurisdição |
| 22 | Lista de idiomas no código | 6 lugares | `seo.ts` **4** · `chrome.tsx` (`Locale`) **4** · `translate.ts` (MyMemory) **3** · `page-links.ts` **19** · `locale-publish.ts` **18** · banco (`locale`) **31** |

**Achado estrutural:** a tabela `site_route` — que era a fonte de `path/locale/title/lead/canonical_path` — é **dropada** pela migration `0029_retire_duplicates.sql`. Hoje a rota mora em `content_alias` (3.942 linhas) e o texto em `content_text` (3.925 linhas). A mesa SEO **não pode** editar `site_route`: ela não existe mais.

**Segundo achado estrutural (medido):** o acervo tem **3.942 endereços** e **todos os 3.942** têm texto publicado (`content_alias` órfão = **0**). O sitemap tem **24**. Ou seja: **3.918 endereços publicados e indexáveis por padrão não estão no sitemap** — a maior parte é o acervo em `/<slug>.html` e nas variantes de idioma `/<idioma>/<slug>.html` (2.162 endereços). A mesa SEO não precisa inventar rotas: ela precisa **ler `content_alias`** e decidir, endereço a endereço, o que entra no mapa.

### 1.2 A rota como chave (medido, 47 linhas)

`publicPaths()` produz 47 endereços. A mesa SEO tem uma linha por **rota × idioma publicado** — não por rota × idioma possível.

| # | Rota | Origem do título | No `sitemap_url`? | Renderizador (`head`) | `canonical` hoje | `hreflang` hoje | JSON-LD hoje | `robots` hoje |
|---|---|---|---|---|---|---|---|---|
| 1 | `/` | `content_text` (`home`, `pt-BR`) | sim | `src/routes/index.tsx` | `absoluteUrl("/", lang)` → **por idioma**, em forma `?lang=` | 5 links (4 idiomas + x-default) | `WebSite` | — |
| 2 | `/blog/mary-eliza-mahoney` | `content_text` (`mary-eliza-mahoney`) | **não** | `src/routes/blog.mary-eliza-mahoney.tsx` | `absoluteUrl(path, lang)` → por idioma | idem | `Article` | — |
| 3–20 | `/secao/<18 slugs de `section_page`>` | `section_page.title` | sim (18/18) | `src/routes/secao.$slug.tsx` | por idioma | idem | **nenhum** | — |
| 21–42 | `/secao/<22 slugs de `inst_page kind='page'`>` | `inst_page.title` | **não** | `src/routes/secao.$slug.tsx` | por idioma | idem | **nenhum** | — |
| 43–47 | `/ferramentas/{braden,morse,apgar,gotejamento,imc}` | `src/lib/tools/catalog.ts` → `tool.title` | sim (5/5) | `src/routes/ferramentas.$slug.tsx` | por idioma | idem | `WebApplication`+`FAQPage`+`BreadcrumbList` | — |
| — | `/modelos`, `/modelos/$id` | hardcoded | não | `src/routes/modelos*.tsx` | **nenhum** | **nenhum** | **nenhum** | `noindex` |
| — | `/sistema` | hardcoded | não | `src/routes/sistema.tsx` | **nenhum** | **nenhum** | **nenhum** | `noindex` |
| — | `/pacote` | hardcoded | não | `src/routes/pacote.tsx` | **nenhum** | **nenhum** | **nenhum** | `noindex` |
| — | `/admin` | hardcoded | não | `src/routes/admin.tsx` | **nenhum** | **nenhum** | **nenhum** | `noindex` |
| — | `/login` | hardcoded | não | `src/routes/login.tsx` | **nenhum** | **nenhum** | **nenhum** | `noindex` |
| — | `/sessao` | hardcoded | não | `src/routes/sessao.tsx` | **nenhum** | **nenhum** | **nenhum** | `noindex` |
| — | `/assinante` | hardcoded | não | `src/routes/assinante.tsx` | **nenhum** | **nenhum** | **nenhum** | `noindex` |
| — | `/conta`, `/institucional*` (5) | — | não | sem `head:` no arquivo | **nenhum** | **nenhum** | **nenhum** | **nenhum** |
| — | qualquer `/$` (catch-all) | `content_text` | **n/a** | `src/routes/$.tsx` | `absoluteUrl(loaderData.canonical_path)` — **sem idioma, sempre pt-BR** | alternates calculados sobre o **path atual**, não sobre o canônico | **nenhum** | — |

**Contagem de rotas com `head` que emite `canonical`+`hreflang`: 5 de 22 arquivos de rota** (`index`, `secao.$slug`, `ferramentas.$slug`, `blog.mary-eliza-mahoney`, `$.tsx`). As outras 17 não emitem nenhum dos dois. A mesa SEO precisa cobrir **22**, não 5.

**O `canonical` de hoje aponta para uma forma de URL que não existe.** `absoluteUrl(path, lang)` põe `?lang=xx`; mas o acervo é endereçado por **prefixo de idioma** (`/en/aldrete.html`, `/ar/aldrete.html` — 2.162 endereços em `content_alias`). Nenhum dos 2.162 endereços prefixados tem um `canonical` que aponte para ele: o `canonical` fala `?lang=`, o endereço fala `/en/`. São duas formas de dizer a mesma coisa — e o buscador não sabe qual é a canônica.

Os 18 `section_page`: `acessibilidade, assinatura, biblioteca, calculadoras, compromisso, concurso, contato, conteudos, emprego, entrar, escalas, glossario, mapa, nanda, politicas, simulados, sobre, termos`.
Os 22 `inst_page kind='page'`: `declaracao-de-acessibilidade, cancelamento-e-reembolso, condicoes-da-assinatura, conta-e-exclusao-de-dados, perguntas-frequentes, planos, termos-de-uso, auditoria-governanca-regulatoria, aviso-clinico, correcoes-e-erratas, fontes-e-evidencias, politica-editorial, uso-responsavel-de-ia, cookies-e-consentimento, politica-de-privacidade, equipe-e-autores, fale-conosco, missao-visao-valores, objetivos-do-site, compromisso-e-praticas, metodologia-de-medicao, relatorios-de-sustentabilidade`.

**Fora da tabela:** as rotas do catch-all `/$` (o acervo de `content_alias`: **3.942 aliases, 3.942 publicados** [atualizado — antes 1.768]). Essas rotas são páginas de acervo: **não entram no sitemap** por decisão editorial, mas **precisam** de canonical, de título e de `noindex` coerente. A mesa SEO mostra as duas famílias: as 47 indexáveis e as demais marcadas como "acervo".

### 1.3 Campos da mesa SEO

Cada campo diz **onde mora hoje** (ou que tabela nova precisa existir), **quem edita** e **a regra**.

| id | Campo | Onde mora | Tabela de origem | Quem edita | Regra |
|---|---|---|---|---|---|
| SEO-01 | Título da página | `content_text.title` (`slug`,`locale`,`view`) | `content_text` | Mesa de Conteúdo (M09); a Mesa SEO **exibe e valida** | ≤ **70** caracteres **já com o sufixo ` · Calculadoras de Enfermagem`** (29) que a rota acrescenta — ou seja, ≤ **41** no campo, para as 46 rotas que usam o sufixo. É o **mesmo** texto de `<title>`, `og:title` e `twitter:title`. A página vence o app. Para os 5 instrumentos, o título em `source_tool.title` e o fallback em `src/lib/tools/catalog.ts` são **duas** fontes: o banco manda (§1.6.2.b). |
| SEO-02 | Description | `content_text.lead` | `content_text` | Conteúdo | ≤ **160** caracteres. |
| SEO-03 | `og:description` / `twitter:description` | derivado de SEO-02 | `content_text` | automático | ≤ **80** caracteres. Se SEO-02 passar de 80, **o render corta** — não inventa. |
| SEO-04 | Canonical por rota+idioma | `seo_page.canonical_path` | **`seo_page` (nova)** | Mesa SEO | Caminho **HTTPS absoluto**, mesmo idioma da variante. `og:url` = canonical. Nunca a raiz por engano (o erro medido em zh/ar). |
| SEO-05 | `og:title` / `twitter:title` | derivado de SEO-01 | `content_text` | automático | **Nenhum campo próprio.** A regra é a identidade das três strings. |
| SEO-06 | `og:image` / `twitter:image` | `seo_page.og_image_path` + `media_asset.path` | **`seo_page` (nova)** + `media_asset` | Mesa SEO | **1200×630 JPEG**, **mesma URL** nas duas meta, **1 por idioma**. Alvo ≤100 KB, teto 300 KB. |
| SEO-07 | `og:image:alt` / `twitter:image:alt` | `seo_page.og_image_alt` | **`seo_page` (nova)** | Mesa SEO | ≤ **125** caracteres, **no idioma do locale** (não a marca em português). |
| SEO-08 | `robots` | `seo_page.robots` | **`seo_page` (nova)** | Mesa SEO | `index` \| `noindex`. Default `index`. `noindex` ⇒ fora do sitemap. |
| SEO-09 | Tipo do JSON-LD | `seo_page.jsonld_type` | **`seo_page` (nova)** | Mesa SEO | `WebSite` (home) · `Article` (artigo) · `WebApplication` (ferramenta) · `MedicalWebPage` (seção institucional). |
| SEO-10 | Conjunto `hreflang` | **derivado** de `content_text.status='publicado'` + `locale` | `content_text` + `locale` | automático | Só entra idioma **publicado e revisado** (§2.4). `x-default` = `pt-BR`. |
| SEO-11 | Linha do sitemap | `sitemap_url.loc` | `sitemap_url` | Mesa SEO | 1 linha por rota×idioma **publicado** e **indexável**. Ordem estável. |
| SEO-12 | Regra de rastreio | `crawl_rule.directive` | `crawl_rule` | Mesa SEO | Ordem preservada (`position`). Proibido `Allow` para as áreas restritas (§1.5 G7). |
| SEO-13 | Ativo do cartão | `media_asset` (`path`,`kind`,`note`) | `media_asset` | Mesa SEO | `note` = hash + dimensões verificadas. `DERBY` se o arquivo não existir. |
| SEO-14 | Autor e data de atualização | `seo_page.updated_by`, `seo_page.updated_at` | **`seo_page` (nova)** | automático | `meta name="author"` obrigatório; `article:modified_time` / `og:updated_time` em `YYYY-MM-DD`. |
| SEO-15 | Identidade do app (separada do título) | `src/lib/og/site.json` → `title`, `description` | **arquivo**, não tabela | Mesa SEO | Vai para `og:site_name` e `og:description` de fallback. **Nunca** para `og:title` de uma página. |

> **Por que `seo_page` é nova e não uma coluna em `content_text`:** `content_text` é chaveada por `(slug, locale, view)` e guarda **texto de leitura**. Canonical, cartão, `robots` e tipo de JSON-LD são **metadado de rota** — a mesma rota pode ter 1 `view` de leitura e 1 de cálculo, e as duas compartilham o mesmo canonical. Uma coluna em `content_text` duplicaria o metadado por view.

### 1.4 Regras de escrita da mesa SEO

1. **Título único por rota.** Antes de gravar, a mesa recusa um `content_text.title` que já exista em outra linha **publicada** da mesma rota lógica (hoje existem colisões: ver §1.6.2).
2. **Título = og:title = twitter:title.** O render emite a mesma string nas três meta. A mesa de SEO tem um botão "reemitir" que reescreve o head a partir da linha — não um campo para divergence.
3. **Canonical por rota+idioma.** `canonical_path` é derivado de `content_alias.path` da variante, nunca digitado à mão. Digitar um caminho que não existe é recusado.
4. **Canonical e `og:url` são o mesmo endereço.** `og:url` nunca aponta para a raiz quando a rota não é a raiz.
5. **Cartão por idioma.** Um idioma sem cartão próprio **não** recebe a imagem de outro idioma: ou recebe a sua, ou fica `DERBY` e a mesa mostra a pendência. A imagem é única no site hoje (`public/og.jpg`) e serve a 31 idiomas — isso é o estado medido a corrigir.
6. **Sitemap = indexável ∩ publicado.** Toda linha de `sitemap_url` tem de corresponder a uma rota com `robots='index'` e conteúdo publicado. Toda rota indexável e publicada tem de estar no sitemap. As duas direções são verificadas.
7. **`robots.txt` e `crawl_rule` são a mesma verdade.** A mesa edita `crawl_rule` e o build materializa `public/robots.txt` a partir dela; enquanto o build não fizer isso, a mesa **mostra as duas colunas lado a lado** e denuncia a divergência.
8. **O `hreflang` segue o conteúdo, não a lista de idiomas.** O conjunto de alternates é derivado do que está publicado e revisado (§2.4). Declarar alternates para um idioma sem conteúdo publicado é duplicação de conteúdo declarada ao buscador.

### 1.5 Gate da mesa SEO — o que ela tem que recusar

| id | O gate recusa | Como prova |
|---|---|---|
| G1 | `content_text.title` cujo `<title>` **servido** (título + ` · Calculadoras de Enfermagem`) passe de **70** caracteres | o gate monta o título servido antes de medir; erro nomeando rota, idioma e comprimento |
| G2 | `og_image_path` que não aponte para um arquivo **1200×630 JPEG** no disco | leitura das dimensões do arquivo; erro nomeando o caminho e a dimensão achada |
| G3 | `og_image_alt` vazio ou com mais de **125** caracteres | erro nomeando o comprimento |
| G4 | `canonical_path` de **outro idioma** que o da linha | comparação com o `locale` da linha; erro nomeando os dois idiomas |
| G5 | `canonical_path` apontando para rota com `robots='noindex'` | consulta de `seo_page` |
| G6 | Linha em `sitemap_url` para rota `noindex` **ou** sem versão publicada | consulta cruzada `seo_page` × `content_text` |
| G7 | `crawl_rule` que libere `/admin`, `/conta`, `/sessao`, `/assinante`, `/login`, `/oficina-local` (a lista do `robots.txt` publicado) | comparação da diretiva com a lista restrita |
| G8 | Um head renderizado em que `title ≠ og:title ≠ twitter:title` | teste de render: as três strings extraídas do HTML têm que ser iguais |
| G9 | Um `hreflang` apontando para idioma sem versão **publicada** | consulta `content_text` por idioma |
| G10 | Escrita por perfil diferente de `admin` | `assertAdminRole` (`src/lib/publish-guard.ts`) + `policy_rule` do pacote `acesso` |

O gate G8 é o único que **não** é de escrita: é de render. Ele prova que a regra do dono ("mesmo texto") é cumprida no HTML, e não só na intenção.

### 1.6 O que está divergente hoje (medido)

#### 1.6.1 Título, `og:title` e `twitter:title`

**Medido nesta árvore (código-fonte, 26/10):**

| Verificação | Resultado medido |
|---|---|
| `og:title` / `og:description` / `og:image` / `og:url` / `og:site_name` / `twitter:*` em `src/` | **0 ocorrências** (`grep -rn "og:title\|og:description\|og:image\|og:url\|og:site_name\|twitter:" src/`). A única meta OG escrita numa rota é `og:type` (artigo) |
| `<title>` da rota | **12 dos 15** arquivos de rota com `head:` escrevem `` `${…title} · Calculadoras de Enfermagem` `` (`$.tsx`, `admin`, `assinante`, `blog`, `ferramentas.$slug`, `login`, `modelos.$id`, `modelos.index`, `pacote`, `secao.$slug`, `sessao`, `sistema`). A **identidade do app entra dentro do título da página** |
| `index.tsx` (a home) | `loaderData?.title ?? "Calculadoras de Enfermagem, Simulados e Escalas Clínicas"` — **aqui** o título da página vence. **A regra do dono está valendo em 1 rota de 15** |
| `twitter:title` emitido pelo build | **ausente** em todas as rotas. `twitter:title` está em `SHARE_META_KEYS` (`scripts/grok-pwa-shared.mjs`), então `stripShareMetaTags()` **remove** o que a página tinha e `grokOgHeadTags()` **não** recoloca. |
| `og:title` no build | emitido a partir do `<title>` do documento (`resolveShareTitle` prefere `documentTitle`) — ou seja, **o título da página vence o app** no *build*, mas o `<title>` que ele carrega **já vem com o sufixo do app** |
| `og:title` **no site publicado (v271)** | **"Calculadoras de Enfermagem"** (identidade do app) em **16/16** rotas medidas — diferente do `<title>` da rota. **Divergência medida no ar.** Re-verificação desta rodada: `NOT_RUN` (§7, N1) |
| `og:description` | **ausente**: `src/lib/og/site.json` não tem `description`, e `grokOgHeadTags()` só emite `og:description` se `site.description` existir |
| `og:url` | **ausente** (está em `SHARE_META_KEYS`, é removido, e não é reinjetado) |
| `og:site_name` | **ausente** |
| `og:image` | ausente no HTML servido; o valor efetivo é o `public/og.jpg` (1200×630), **um só**, para 31 idiomas e 47 rotas |
| `og:image:alt` | **ausente** |

**A regra do dono ("title / og:title / twitter:title — mesmo texto") tem hoje dois desvios, e os dois precisam ser fechados pela mesa:**

1. **O `og:title` não existe no código** — ele é injetado pelo build a partir do `<title>`. A mesa não pode garantir "mesmo texto" por um caminho que ela não controla: a igualdade tem que ser **do dado** (uma coluna, uma string, três usos).
2. **O `<title>` não é o título da página em 12 rotas** — é o título da página **+ a identidade do app**. Se a mesa mostrar `content_text.title` e o site servir `título + " · Calculadoras de Enfermagem"`, a tela mente sobre o que o buscador lê. A correção é do render (uma string, sem sufixo no campo) — e a regra de escrita da mesa passa a ser: **o campo gravado é o título servido**.

**E há um terceiro desvio, medido no dado:** 15 linhas de `content_text` estão **publicadas com `title = 'DERBY'`** (§1.6.2) — páginas no ar cujo `<title>` é a string `DERBY`. A Mesa SEO precisa de um gate que recuse `title = 'DERBY'` na linha publicada, e precisa listar essas 15 linhas como pendência.

#### 1.6.2 Títulos duplicados

`content_text` publicado (estado de 26/10, **depois** da migration 0037): **3.925** linhas, **3.658** títulos distintos → **267** linhas repetem o título de outra: **238** grupos de colisão cobrindo **505** linhas. **[atualizado — antes: 1.764 linhas pt-BR publicadas, 229 grupos, 459 linhas.]**

| Colisão | Linhas |
|---|---|
| `Instrumentais Cirúrgicos: Relação Completa para Centro Cirúrgico` | **17** |
| **`DERBY`** — marcador de pendência no campo de título, em página **publicada** | **15** |
| `ESCALA DE APACHE` | 3 |
| demais grupos (2 linhas cada) | 470 |

**As 15 linhas com `title = 'DERBY'` são todas `pt-BR`, view `leitura`, e todas têm alias** — ou seja, **são páginas servidas agora** com `<title>DERBY</title>`. São as páginas de especialidade sem texto (rotas `/escalas-de-enfermagem/<especialidade>/`); as 15 linhas têm também `body = 'DERBY'` (15 corpos). O marcador de pendência vaza para o `<title>` **publicado**. A Mesa SEO tem que ver essas linhas primeiro: são as únicas em que o buscador já pode ter visto o marcador. O gate tem que recusar `title = 'DERBY'` em linha publicada.

**As colisões de título do acervo** (238 grupos) estão concentradas em `biblioteca/*` (páginas de acervo), não nas 47 rotas indexáveis — mas a mesa precisa mostrá-las, porque o acervo também é consultado. **[atualizado] A colisão de maior volume é o título de uma página de biblioteca repetido 17 vezes.** A coluna `title` não tem restrição de unicidade.

#### 1.6.2.b O título servido passa de 70 caracteres em 8 das 47 rotas

O `<title>` é montado pela rota como `` `${title} · Calculadoras de Enfermagem` `` — ou seja, **29 caracteres de sufixo em todas as 47 rotas**, somados ao título da linha. Medido sobre os títulos reais (`content_text`, `section_page`, `inst_page`, `source_tool`):

| Rota | `<title>` servido | Caracteres |
|---|---|---|
| `/ferramentas/gotejamento` | "Calculadora de Gotejamento de Soro: Gotas e Microgotas por Minuto \| Enfermagem · Calculadoras de Enfermagem" | **107** |
| `/ferramentas/morse` | "Escala de Queda de Morse - Risco de Quedas - Calculadoras de Enfermagem · Calculadoras de Enfermagem" | **100** |
| `/ferramentas/braden` | "Calculadora da Escala de Braden - Prevenção de Lesões por Pressão · Calculadoras de Enfermagem" | **94** |
| `/ferramentas/imc` | "Calculadora de IMC: Índice de Massa Corporal \| Enfermagem · Calculadoras de Enfermagem" | **86** |
| `/ferramentas/apgar` | "Escala de Apgar - Avaliação do Recém-Nascido - Enfermagem · Calculadoras de Enfermagem" | **86** |
| `/secao/compromisso-e-praticas` | "Compromisso e Práticas · Calculadoras de Enfermagem" | **78** |
| `/blog/mary-eliza-mahoney` | "Mary Eliza Mahoney: biografia e linha do tempo · Calculadoras de Enfermagem" | **75** |
| `/secao/uso-responsavel-de-ia` | "Uso Responsável de IA · Calculadoras de Enfermagem" | **71** |

**8 das 47 rotas** passam do limite de 70 do dono (`fase1/METADADOS-HOME-19.md`). O menor título servido é de **35** caracteres (`/secao/entrar`).

**Achado de uma fonte por título — a ferramenta tem título em dois lugares.** Para os 5 instrumentos publicados, `source_tool.title` (banco) e `content_text.title` (view `calculadora`) são a **mesma** string, e é ela que a rota serve (`readTool` → `src/lib/source.functions.ts`). Mas o **fallback em código** (`src/lib/tools/catalog.ts`) tem outro título, curto: `"Escala de Braden"`, `"Escala de Morse"`, `"Escala de Apgar"`, `"Calculadora de gotejamento"`, `"Cálculo de IMC"`. Enquanto a folha gravada existir, o banco manda; se faltar, o código manda — e o título muda. A Mesa de SEO precisa saber qual dos dois está no ar antes de medir comprimento.

#### 1.6.3 Sitemap e robots

| Verificação | Resultado medido |
|---|---|
| `publicPaths()` (código) | **47** endereços (1 home + 1 artigo + 40 `/secao/<slug>` + 5 `/ferramentas/<slug>`) |
| `public/sitemap.xml` / `sitemap_url` | **24** `<loc>` — **23 rotas públicas fora do sitemap**: `/blog/mary-eliza-mahoney` + as 22 `inst_page` |
| Endereços **publicados** no acervo | **3.942** (`content_alias` com texto publicado) — órfão = **0**. **3.918** deles fora do sitemap |
| `sitemapXml()` em `src/lib/contract.ts` | **sem consumidor** nesta árvore |
| `public/robots.txt` `Disallow` | **2** (`/sistema`, `/pacote`) — não bloqueia `/admin`, `/conta`, `/sessao`, `/assinante`, `/login` |
| `robots.txt` publicado (v271) | **6** `Disallow` |
| `robots` por rota | **8** rotas declaram `noindex` (`/admin`, `/login`, `/sessao`, `/assinante`, `/pacote`, `/sistema`, `/modelos`, `/modelos/$id`), hardcoded no código. **[atualizado — a primeira redação contava 3]** |
| Rotas **sem** `head:` (nem `robots`, nem `canonical`) | **7**: `/conta`, `/institucional`, `/institucional/index`, `/institucional/$hub`, `/institucional/$hub/index`, `/institucional/$hub/$page`, `/modelos` |
| `media_asset` | **20** linhas; `note` é só o nome do arquivo — **sem hash, sem dimensão** |

#### 1.6.4 Head servido (site publicado v271, 16 rotas medidas em 26/10/2026)

> **[atualizado] Re-verificação desta rodada: `NOT_RUN`.** `web_fetch` em `https://20itbcndi7b8r.space.minimax.io/` e em `/ferramentas/braden` devolveu "file load failed" nas duas tentativas. Os números abaixo são da rodada anterior (v271) e valem como evidência do **padrão** de falha, não como medição desta árvore. O que é medido nesta árvore é o **código** (§1.6.1) e o **banco** (§1.6.2, §1.6.3) — e o código já mostra os mesmos desvios: 0 `og:title` no código, 5 de 22 rotas com `canonical`, 4 idiomas de `hreflang` para 19 publicados.

Todas as 16 rotas medidas (`/`, 2 seções, 3 ferramentas, o artigo, 4 variantes com `?lang=`, `/modelos`, `/pacote`, `/sistema`, `/admin` e `/nao-existe`) devolveram **HTTP 200** e o **mesmo head**:

- `title` = "Calculadoras de Enfermagem, Simulados e Escalas Clínicas" (título da home) — **em todas**
- `og:title` = "Calculadoras de Enfermagem" (identidade do app) — **em todas**
- `twitter:title`, `og:description`, `og:image`, `og:url`, `og:site_name` — **ausentes em todas**
- `canonical` = `https://calculadorasdeenfermagem.com.br/` — **a home, em todas as rotas**
- `hreflang` = 5 links (`pt-BR`, `en`, `es`, `fr`, `x-default`) — **em todas**
- JSON-LD = `["WebSite"]` — **em todas**

Leitura: o head servido é o do **shell**, não o da rota. Consequência direta: **um buscador recebe 16+ URLs diferentes com o mesmo título, o mesmo `og:title` e o mesmo canonical apontando para a home** — é um convite para a home e um sinal de duplicação. `/nao-existe` também devolve 200 (o bloqueio conhecido da materialização estática): o buscador pode indexar o 404, e o `robots` não distingue nada porque o head é o mesmo.

### 1.7 DERBY na mesa SEO

| Onde | O que vira `DERBY` | Por quê |
|---|---|---|
| `seo_page.og_image_path` | 1 linha por idioma **sem** cartão próprio | não há 19+ cartões no ar; o `fase1/PENDENCIAS.md` registra "Cartão OG 1200×630 por locale. No ar só há ícone 128×192. As 19 peças citadas respondem 404" |
| `seo_page.og_image_alt` | idem | o alt depende do cartão |
| `seo_page.jsonld_type` | rota de seção institucional sem tipo decidido | `MedicalWebPage` é a escolha de schema.org para página médica; a decisão é editorial e fica registrada |
| `media_asset.note` | 20 linhas | hoje é só o nome do arquivo; hash e dimensão não são verificáveis sem ler o disco |
| `crawl_rule` / `sitemap_url` | **nada** | são listas fechadas, sem campo pendente |

`DERBY` **não** entra em `content_text.title`: o título é editável agora, e um `DERBY` no `<title>` seria publicado ao buscador.

---

## 2. MESA IDIOMA

### 2.1 As 31 linhas de `locale` (medido)

`locale` tem **31** linhas. `source = true` só em `pt-BR`. **[atualizado] Os 31 `label` são o nome real do idioma** — a migration `0037_preencher_derby.sql` (tarefa `derby`) trocou o id pelo nome: `locale` com `label = id` = **0** linhas (antes: **26**). Ex.: `ar` → "Árabe", `bn` → "Bengali", `cs` → "Tcheco", `da` → "Dinamarquês", `de` → "Alemão", `el` → "Grego", `en` → "Inglês", `es` → "Espanhol", `fi` → "Finlandês", `fr` → "Francês", `he` → "Hebraico", `hi` → "Hindi", `id` → "Indonésio", `it` → "Italiano", `ja` → "Japonês", `ko` → "Coreano", `ms` → "Malaio", `nb` → "Norueguês bokmål", `nl` → "Holandês", `pl` → "Polonês", `pt` → "Português", `pt-BR` → "Português do Brasil", `ro` → "Romeno", `ru` → "Russo", `sv` → "Sueco", `th` → "Tailandês", `tr` → "Turco", `uk` → "Ucraniano", `ur` → "Urdu", `vi` → "Vietnamita", `zh` → "Chinês".

O nome do idioma em português é **fato verificável** (ISO 639-1) — o dono foi explícito: nome real, **nunca** o id, **nunca** `DERBY`. **Já feito** (tarefa `derby`, migration 0037). A Mesa de Idioma é onde esse valor é lido e exibido; o gate G1 (§2.5) impede que volte a ser o id.

### 2.2 Estado medido por idioma (31 linhas)

Chrome = linhas em `chrome_label` por grupo (`chrome` / `menu` / `footer` / `home`). Conteúdo = linhas em `content_text` publicadas, das quais as **revisadas** (`review_state = 'revisado'`). Alias = endereços publicados.

**[atualizado]** A migration 0037 publicou as traduções que estavam em rascunho: hoje `content_text` tem **3.925/3.925 linhas publicadas** e **0 em rascunho**. O que sobra como pendência é a **revisão humana**, marcada por `review_state = 'DERBY'` (2.158 linhas). Por isso a coluna de estado abaixo distingue **publicado** de **publicado e revisado** — ler só `status` (como fazia a mesa atual) dá a resposta errada.

| # | idioma | `label` | chrome (c/m/f/h) | conteúdo (pub · revisadas) | alias | **estado** |
|---|---|---|---|---|---|---|
| 1 | `pt-BR` | Português do Brasil | 49 / 0 / 0 / 0 | 1.779 · **1.764** | 1.780 | **publicado e revisado** (idioma-fonte) |
| 2 | `en` | Inglês | 49 / 44 / 26 / 352 | 177 · **1** | 185 | **publicado, sem revisão** — só a home revisada |
| 3 | `es` | Espanhol | 49 / 44 / 26 / 352 | 174 · **1** | 182 | **publicado, sem revisão** |
| 4 | `fr` | Francês | 49 / 44 / 26 / 352 | 111 · **1** | 111 | **publicado, sem revisão** |
| 5 | `pt` | Português | 0 / 0 / 26 / 344 | 0 · 0 | 0 | **pendente** — sem `pt-BR`, é ambiguo |
| 6 | `ar` | Árabe | 0 / 0 / 26 / 352 | 110 · 0 | 110 | **publicado, sem revisão** |
| 7 | `de` | Alemão | 0 / 0 / 26 / 352 | 110 · 0 | 110 | **publicado, sem revisão** |
| 8 | `hi` | Hindi | 0 / 0 / 26 / 352 | 110 · 0 | 110 | **publicado, sem revisão** |
| 9 | `id` | Indonésio | 0 / 0 / 26 / 355 | 111 · 0 | 111 | **publicado, sem revisão** |
| 10 | `it` | Italiano | 0 / 0 / 26 / 352 | 109 · 0 | 109 | **publicado, sem revisão** |
| 11 | `ja` | Japonês | 0 / 0 / 26 / 352 | 110 · 0 | 110 | **publicado, sem revisão** |
| 12 | `ko` | Coreano | 0 / 0 / 26 / 352 | 111 · 0 | 111 | **publicado, sem revisão** |
| 13 | `nl` | Holandês | 0 / 0 / 26 / 352 | 116 · 0 | 116 | **publicado, sem revisão** |
| 14 | `pl` | Polonês | 0 / 0 / 26 / 352 | 116 · 0 | 116 | **publicado, sem revisão** |
| 15 | `ru` | Russo | 0 / 0 / 26 / 352 | 111 · 0 | 111 | **publicado, sem revisão** |
| 16 | `sv` | Sueco | 0 / 0 / 26 / 352 | 116 · 0 | 116 | **publicado, sem revisão** |
| 17 | `tr` | Turco | 0 / 0 / 26 / 352 | 111 · 0 | 111 | **publicado, sem revisão** |
| 18 | `uk` | Ucraniano | 0 / 0 / 26 / 355 | 117 · 0 | 117 | **publicado, sem revisão** |
| 19 | `vi` | Vietnamita | 0 / 0 / 26 / 355 | 116 · 0 | 116 | **publicado, sem revisão** |
| 20 | `zh` | Chinês | 0 / 0 / 26 / 352 | 110 · 0 | 110 | **publicado, sem revisão** |
| 21 | `bn` | Bengali | 0 / 0 / 26 / 0 | 0 · 0 | 0 | **pendente** — só rodapé |
| 22 | `cs` | Tcheco | 0 / 0 / 26 / 0 | 0 · 0 | 0 | **pendente** |
| 23 | `da` | Dinamarquês | 0 / 0 / 26 / 0 | 0 · 0 | 0 | **pendente** |
| 24 | `el` | Grego | 0 / 0 / 26 / 0 | 0 · 0 | 0 | **pendente** |
| 25 | `fi` | Finlandês | 0 / 0 / 26 / 0 | 0 · 0 | 0 | **pendente** |
| 26 | `he` | Hebraico | 0 / 0 / 26 / 0 | 0 · 0 | 0 | **pendente** |
| 27 | `ms` | Malaio | 0 / 0 / 26 / 0 | 0 · 0 | 0 | **pendente** |
| 28 | `nb` | Norueguês bokmål | 0 / 0 / 26 / 0 | 0 · 0 | 0 | **pendente** |
| 29 | `ro` | Romeno | 0 / 0 / 26 / 0 | 0 · 0 | 0 | **pendente** |
| 30 | `th` | Tailandês | 0 / 0 / 26 / 0 | 0 · 0 | 0 | **pendente** |
| 31 | `ur` | Urdu | 0 / 0 / 26 / 0 | 0 · 0 | 0 | **pendente** |

**Números que fecham [atualizado]:**
- **31** idiomas na tabela · **19** com linhas de `content_text` · **12** sem nenhuma linha (`bn`, `cs`, `da`, `el`, `fi`, `he`, `ms`, `nb`, `pt`, `ro`, `th`, `ur`). **Não são 27 nem 30** — o número de idiomas sem conteúdo é **12**.
- `content_text` = **3.925** linhas, **3.925 publicadas**, **0 em rascunho**; por revisão: **1.767 revisadas** + **2.158 com `review_state = 'DERBY'`**.
- `content_alias` = **3.942** linhas; **3.942 publicadas** (órfão = **0**). Por idioma: `pt-BR` 1.780 · `en` 185 · `es` 182 · `uk` 117 · `nl`/`pl`/`sv`/`vi` 116 · `fr`/`id`/`ko`/`ru`/`tr` 111 · `ar`/`de`/`hi`/`ja`/`zh` 110 · `it` 109.
- Cobertura de `chrome_label` (7.797 linhas, 31 idiomas): grupo `chrome` = **4** idiomas (pt-BR, en, es, fr) · `menu` = **3** (en, es, fr) · `footer` = **30** · `home` = **19**.
- **O idioma-fonte é o mais pobre de chrome no banco:** `pt-BR` tem **49** linhas (só o grupo `chrome`) e **0** de `footer` e de `home` — o texto da home e do rodapé em português vive no **código** (`src/lib/chrome.tsx` → `copy`), não em `chrome_label`. Quem editar rótulo pela mesa precisa saber que **em pt-BR a fonte é o código**: ou a migration passa a gravar `pt-BR` no banco, ou a mesa mostra os dois.
- **A lista de idiomas no código são seis listas diferentes** (§1.1, linha 22): `seo.ts` 4 · `chrome.tsx` 4 · `translate.ts` 3 · `page-links.ts` 19 · `locale-publish.ts` 18 · banco 31. A mesa tem que ler o banco e apontar onde o código discorda.

### 2.3 Campos da mesa idioma

| id | Campo | Onde mora | Tabela de origem | Quem edita | Regra |
|---|---|---|---|---|---|
| IDI-01 | Identificador | `locale.id` | `locale` | não editável | BCP-47. Único. |
| IDI-02 | Nome do idioma em pt-BR | `locale.label` | `locale` | Mesa de Idioma | **Nunca** igual ao `id`; **nunca** `DERBY` (é fato ISO 639-1). |
| IDI-03 | Idioma-fonte | `locale.source` | `locale` | não editável | `true` só em `pt-BR` (hoje 1). |
| IDI-04 | Direção de escrita | `locale_state.direction` | **`locale_state` (nova)** | Mesa de Idioma | `ltr` \| `rtl`. Fato: `ar` = `rtl`; os outros 18 = `ltr` (registro i18n v1, §3.4). |
| IDI-05 | Estado | `locale_state.status` | **`locale_state` (nova)** | Mesa de Idioma | `publicado` \| `rascunho` \| `pendente`. Derivado do §2.2, mas **gravado** para que a tela não recalcule regra em dois lugares. |
| IDI-06 | Cobertura de chrome | derivado de `chrome_label` | `chrome_label` | automático | contagem por grupo + lista de chaves faltantes. |
| IDI-07 | Cobertura de conteúdo | derivado de `content_text` | `content_text` | automático | publicadas / rascunhos / ausentes. |
| IDI-08 | Elegibilidade para SEO | `locale_state.seo_eligibility` | **`locale_state` (nova)** | Mesa de Idioma | `publicado` \| `blocked_pending_verified_localization`. Precedente: `registers/i18n/locale-register.v1.json` (outra linhagem). |
| IDI-09 | País do idioma | `locale_state.country_code` | **`locale_state` (nova)** → §3 | Mesa de Jurisdição | ISO 3166-1. **Obrigatório** para publicar conteúdo dependente de jurisdição. |
| IDI-10 | Texto do rótulo | `chrome_label.text` | `chrome_label` | Mesa de Idioma | 1 texto por `(locale, group_id, key)`. Chave duplicada = recusada. |
| IDI-11 | Quem revisou | `locale_state.reviewed_by` | **`locale_state` (nova)** | Mesa de Idioma | `DERBY` enquanto não revisado. A tradução automática (MyMemory) **não** é revisão: `remoteTranslationIsNotProof`. |
| IDI-12 | Data da revisão | `locale_state.reviewed_at` | **`locale_state` (nova)** | automático | `YYYY-MM-DD`. `DERBY` se nunca revisado. |
| IDI-13 | Chave de interface por idioma | `chrome_label` (4 grupos: `chrome`, `footer`, `home`, `menu`) | `chrome_label` | Mesa de Idioma | `chrome` = 49 chaves (4 idiomas: pt-BR, en, es, fr) · `footer` = 26 (30 idiomas) · `home` = 352 (344 em `pt`, 355 em `id`/`uk`/`vi`) · `menu` = 44 (3 idiomas: en, es, fr). **[atualizado] `pt-BR` não tem `footer` nem `home` no banco: o texto da home e do rodapé em português está no código (`src/lib/chrome.tsx` → `copy`). A mesa mostra as duas fontes.** |
| IDI-14 | Publicação de conteúdo | `content_text.status` | `content_text` | Mesa de Idioma (via `publishObjectLocale`) | `rascunho` → `publicado`. O executor é `src/lib/locale-publish.functions.ts`; a validação é `assertLocalePublish`. **[atualizado] Hoje não há linha em rascunho: a 0037 publicou todas. A mesa nova não publica — ela revisa.** |
| IDI-15 | Revisão humana do texto | `content_text.review_state` | `content_text` | Mesa de Idioma | `revisado` \| `DERBY`. **2.158** linhas com `DERBY` (todas as traduções, menos 1.767). A tradução automática (MyMemory) **não** é revisão |
| IDI-16 | Publicar o idioma no site | `locale_state.status` + `locale_state.country_code` | **`locale_state` (nova)** | Mesa de Idioma | Substitui o executor atual: `publishObjectLocale` só trabalha com rascunho e só aceita **18** idiomas fixos. A mesa nova decide pelo **estado gravado** |

### 2.4 Regras de escrita da mesa idioma

1. **Três estados, um só por idioma.** `publicado` exige: nome real (IDI-02), direção declarada (IDI-04), chrome completo nos grupos obrigatórios e **conteúdo publicado ≥ 1**. `rascunho` = tem conteúdo, não publicado. `pendente` = o resto.
2. **O idioma que publica é o idioma que o buscador enxerga.** A mesa de idioma e a mesa de SEO compartilham a mesma verdade: `hreflang` só declara idioma `publicado` (§1.4, regra 8). Publicar um idioma **acrescenta** um `alternate`; despublar **retira**.
3. **Um idioma sem país declarado não publica conteúdo que dependa de jurisdição** (§3.3, regra J3). A mesa de idioma mostra, para cada idioma, a coluna "jurisdição" e recusa a publicação enquanto ela estiver `DERBY`.
4. **Rótulo duplicado é erro, não update.** `chrome_label` tem chave `(locale, group_id, key)`; a mesa **edita** a linha existente e **recusa** criar uma segunda.
5. **O nome do idioma é fato, não tradução.** "Traduzir" o label para o próprio idioma é errado: o label é o nome **em português**, para o administrador ler.
6. **`DERBY` continua visível.** Um idioma com `DERBY` em qualquer campo aparece na mesa com o marcador e com a pendência nomeada — a linha publica, o campo não.

### 2.5 Gate da mesa idioma — o que ela tem que recusar

| id | O gate recusa | Como prova |
|---|---|---|
| G1 | Publicar idioma com `label` vazio, igual ao `id`, ou `DERBY` | comparação com `locale.id` |
| G2 | Publicar idioma sem `direction` declarada | `locale_state.direction` nulo |
| G3 | Publicar **conteúdo dependente de jurisdição** em idioma sem `country_code` | consulta de `locale_state` |
| G4 | Gravar `chrome_label` com `(locale, group_id, key)` já existente | violação da chave primária → erro nomeando a chave |
| G5 | Declarar `hreflang` para idioma com **0** conteúdo publicado | contagem de `content_text` por idioma |
| G6 | `locale.id` fora do conjunto aceito | hoje o código aceita **18** idiomas (`src/lib/locale-publish.ts`) e a tabela tem **31**: o gate tem que ler a tabela, não a constante |
| G7 | Marcar idioma como revisado com `reviewer` vazio | `reviewed_by` nulo |
| G8 | Publicar idioma cuja chrome obrigatória está incompleta | contagem por grupo contra o esperado do grupo (`chrome` 49, `footer` 26, `home` 352, `menu` 44) |
| G9 | Declarar idioma como **revisado** com linha em `review_state = 'DERBY'` | a contagem de `DERBY` por idioma tem que cair para 0 antes do estado virar `publicado e revisado` |
| G10 | Declarar `hreflang` para idioma **publicado mas não revisado** | §1.4 regra 8: o `hreflang` segue conteúdo **publicado e revisado** — os 15 idiomas com 100% do texto em `DERBY` ficam de fora |

**Sobre G6:** a divergência entre **18** (código) e **31** (tabela) é a razão de o gate ler dado e não constante. Um idioma que a tela mostra e o código recusa é exatamente o tipo de mentira que a área admin não pode contar. **[atualizado] Há uma segunda recusa no mesmo caminho:** o filtro de idioma do `LocaleDesk` valida `^[a-z]{2}$` (`src/lib/locale-publish.functions.ts`), então **`pt-BR` não pode ser selecionado** na tela — a fonte do site não aparece no seletor de idioma.

**A mesa de idioma que existe hoje não mostra nada [atualizado]:** `listLocaleDrafts` consulta `content_text.status = 'rascunho'` e devolve **0 linhas** (medido: 3.925 publicadas, 0 rascunho). O seletor de idioma lista os idiomas **com rascunho** — ou seja, uma lista vazia. O botão "Publicar este idioma" **nunca pode disparar**: `publishObjectLocale` só atualiza linhas em rascunho, e `assertLocalePublish` só aceita os 18 idiomas da constante. A mesa nova não é uma extensão dessa: ela lê o estado gravado (§2.2) e age sobre a **revisão**, que é o que está pendente.

### 2.6 DERBY na mesa idioma

| Onde | O que vira `DERBY` | Por quê |
|---|---|---|
| `locale_state.country_code` | **12** idiomas sem mapeamento (os que só têm rodapé) | não há fonte de país para eles; o contrato de ícones cobre 19 idiomas (§3.4) e esses 12 estão fora |
| `locale_state.direction` | idiomas sem dado | direção é fato, mas o registro i18n v1 só cobre 19 (§3.4) |
| `locale_state.reviewed_by` / `reviewed_at` | todos os 30 não-fonte | tradução automática não é revisão |
| `locale_state.seo_eligibility` | idiomas com 0 publicado | derivado, mas gravado para a tela |
| `locale.label` | **nada** | é fato ISO 639-1 — entra o nome real **[atualizado: já entrou — os 31 labels são o nome real]** |
| `content_text.review_state` | **2.158** linhas | **[atualizado]** a migration 0037 publicou as traduções e marcou `review_state = 'DERBY'` nas que não têm revisão humana. A Mesa de Idioma não publica: ela **revisa**. A pendência já está marcada no dado — a mesa só a mostra |
| `locale_state.status` | **15** idiomas (os publicados sem revisão) + **12** pendentes | derivado do §2.2, gravado para a tela não recalcular a regra em dois lugares |

---

## 3. MESA PAÍS / JURISDIÇÃO

### 3.1 O que existe hoje (medido: quase nada)

| # | O que se procura | Resultado da busca no repo |
|---|---|---|
| 1 | `country` / `jurisdiction` em `src/` | **0 ocorrências** |
| 2 | `country` / `jurisdiction` em `scripts/` | **0 ocorrências** |
| 3 | `country` / `jurisdiction` em `migrations/` | **0 ocorrências** |
| 4 | `src/lib/country-icon-policy.ts` | **não existe nesta árvore**. Existe no commit `1ede48c` (branch-bibliotecas) — leitura, sem checkout |
| 5 | Tabela de país / jurisdição | **não existe**. Nenhuma tabela das **96** tem `country`, `jurisdiction`, `measure_system`, `currency` ou `country_code` **[atualizado: 94 → 96, §0.6]** |
| 6 | Host canônico | `src/lib/seo.ts` → `siteOrigin` (constante de código). O backup em `fase1/canonico_locales.corrigido.json` registra `https://www.calculadorasdeenfermagem.com.br` — **com `www`**, diferente do código (sem `www`) |
| 7 | País por idioma | **não existe**. O mapeamento mais próximo está no registro de ícones da outra linhagem (§3.4) |
| 8 | Unidade de medida | `tool_field.unit` tem **5** valores distintos (`min`, `mL`, `kg`, `h`, `cm` — 1 linha cada); `tool_output.unit` tem **3** (`gotas/min`, `mL/h`, `kg/m²`). **Não há coluna de país** |
| 9 | Origem das normas | `content_object.kind='norma'` tem **24** objetos; `fundamento` tem **43** linhas (`id, name, domain, right_name, priority`); `source_tool.sourceIds` referencia `SRC-CFM-PARECER-28-2020` |
| 10 | Regra de unidade por país | não está no código. Está no material de origem: `fase1/revisao_seo_bloqueios.md` — "Só `en-US` deve oferecer lb, in e °F, e a conta interna continua em kg, cm e °C. Trocar a fórmula por locale muda o resultado. O script só troca o rótulo marcado com `data-unidade`." |
| 11 | **Jurisdição da fonte preservada** | **existe, mas fora do banco**: os **25** registros em `audit-evidence/transversal-acquisition/registry/source/*.json` têm `jurisdiction` (**22** "Brasil", **3** "Internacional"), `canonical_id` (= `sourceCanonicalId`), `source_type` (`OFFICIAL_LAW` 18, `REGULATOR` 3, `STANDARD` 3, `GUIDELINE` 1), `rights` (`LICENSED` 4, `UNKNOWN` 21), `status` (`CANDIDATE` 25/25) e `integrity.sha256` + `snapshot_ref`. É o único lugar da rodada em que "a norma é de um país" já está escrito |
| 12 | Moeda | **1 única ocorrência em todo o `src/`**: `priceCurrency: "BRL"` em `toolJsonLd` (`src/lib/seo.ts`). Não há campo de moeda, nem por país, nem por idioma |
| 13 | Vazamento de jurisdição já registrado | achado **FND-FERIAS-LOCALE-JURISDICTION-LEAKAGE-20260902** (severidade **HIGH**), citado em `deliverables/derby/entrega.md`: "publicar em pt-BR não significa que o texto é de jurisdição brasileira". **Continua aberto** — e a Mesa de Jurisdição é onde ele se fecha |
| 14 | Módulo de admin que abriria esta mesa | **nenhum**. O catálogo tem 21 módulos; nenhum trata de país, jurisdição, unidade ou moeda (§1.1, linha 21). A Mesa de Jurisdição precisa de módulo novo (ou de encaixe em `M17` "Gestão normativa") |

**Achado:** as 5 ferramentas publicadas **já são métricas** (`kg`, `cm`, `mL`, `h`, `min`) e `imc` produz `kg/m²`. A regra do país, portanto, **não** muda fórmula: muda o **rótulo** (`data-unidade`) e a unidade **oferecida** (só `en-US` oferece lb/in/°F). Trocar a fórmula por locale muda o resultado — e isso está registrado como errado no material de origem.

**Achado sobre a origem da norma (a regra que o dono pediu):** a **fonte** já tem jurisdição declarada nos 25 registros preservados (`jurisdiction`), e `fundamento` (43 linhas) diz a **natureza do direito** (`right_name` = "Só metadado" · "Família mista" · "Fonte aberta" · "Uso interno") e a **prioridade** (`P0`–`P3`). O que falta é a **coluna no banco** que ligue `content_object.kind='norma'` (24 objetos) ao `sourceCanonicalId` da fonte preservada. Sem essa coluna, a Mesa de Jurisdição mostra a jurisdição da fonte mas **não mostra qual norma é de qual fonte** — e o "pode ser usado em outro país; a fonte continua sendo a de origem" fica sendo texto, não dado.

### 3.2 Campos da mesa país/jurisdição

| id | Campo | Onde mora | Tabela de origem | Quem edita | Regra |
|---|---|---|---|---|---|
| JUR-01 | Host canônico | `jurisdiction.canonical_host` | **`jurisdiction` (nova)** | Mesa de Jurisdição | **1** host canônico para o site. Todo `canonical` e todo `og:url` derivam dele. Sem `www` duplicado: um host, uma variante canônica. |
| JUR-02 | Código do país | `jurisdiction.country_code` | **`jurisdiction` (nova)** | Mesa de Jurisdição | ISO 3166-1 alfa-2 (`BR`, `US`, `GB`…). |
| JUR-03 | Nome do país em pt-BR | `jurisdiction.country_name` | **`jurisdiction` (nova)** | Mesa de Jurisdição | Fato verificável; nunca `DERBY`. |
| JUR-04 | Sistema de medida | `jurisdiction.measure_system` | **`jurisdiction` (nova)** | Mesa de Jurisdição | `metric` \| `imperial`. Default do site: `metric`. |
| JUR-05 | Unidade de massa | `jurisdiction.weight_unit` | **`jurisdiction` (nova)** | Mesa de Jurisdição | `kg` \| `lb` |
| JUR-06 | Unidade de comprimento | `jurisdiction.length_unit` | **`jurisdiction` (nova)** | Mesa de Jurisdição | `cm` \| `in` |
| JUR-07 | Unidade de temperatura | `jurisdiction.temperature_unit` | **`jurisdiction` (nova)** | Mesa de Jurisdição | `°C` \| `°F` |
| JUR-08 | Moeda | `jurisdiction.currency` | **`jurisdiction` (nova)** | Mesa de Jurisdição | ISO 4217 (`BRL`, `USD`…). |
| JUR-09 | País por idioma | `locale_state.country_code` | **`locale_state` (nova)** | Mesa de Jurisdição | 1 país por idioma. 19 idiomas têm mapeamento (§3.4); os outros 12 ficam `DERBY`. |
| JUR-10 | Rótulo de unidade exibida | `tool_field.unit`, `tool_output.unit` | `tool_field`, `tool_output` | Mesa de Jurisdição | **A conta interna não muda.** Só o rótulo (`data-unidade`) muda, e só para o país/idioma cujo sistema é imperial. |
| JUR-11 | País de origem da norma | `jurisdiction.country_code` (da jurisdição de origem) | **`jurisdiction` (nova)** | Mesa de Jurisdição | A norma tem **um** país de origem. A ferramenta pode ser usada em outro país: **a fonte continua sendo a do país de origem**. A edição em outro idioma **não** muda a origem. |
| JUR-12 | Identificador da fonte da norma | **não existe coluna** — `source_tool` tem 12 colunas e nenhuma guarda a fonte; o `sourceIds` está no **código** (`src/lib/tools/catalog.ts`, ex.: `SRC-CFM-PARECER-28-2020`) | `source_tool` (código, não banco) | (fora do escopo desta mesa) | A fonte da norma **precisa** de coluna no banco para a Mesa de Jurisdição mostrar a origem. Hoje ela vive no catálogo do código — **dependência D10**. **[atualizado] `source_tool.evidence` e `.version` passaram a existir com o marcador `DERBY` (82/82) — são pendência marcada, não origem declarada: o `DERBY` não diz de que país veio a norma.** |
| JUR-13 | Metadado do fundamento | `fundamento` (`id`,`name`,`domain`,`right_name`,`priority`) | `fundamento` | (fora do escopo desta mesa) | 43 linhas; `right_name` diz o que o fundamento **não** guarda (ex.: "Só metadado"). |
| JUR-14 | Referência de controle por país | `registers/i18n/country-icon-contract.v1.json` (outra linhagem) | **arquivo** | Mesa de Jurisdição | **Referência, nunca autoridade.** `approval=HOLD_HUMAN` e `reuseLicense=NOT_VERIFIED` em 19/19 itens. |
| JUR-15 | **Jurisdição da fonte preservada** | `source_registry.jurisdiction` | **arquivo** (`audit-evidence/transversal-acquisition/registry/source/*.json`) + **coluna nova** em `jurisdiction` | Mesa de Jurisdição | 25 fontes: **22** "Brasil", **3** "Internacional". A mesa mostra a jurisdição **da fonte**, ao lado do objeto que a usa — e mostra também que a fonte é `CANDIDATE` 25/25 (ainda não homologada) e que o direito é `UNKNOWN` em 21 delas |

### 3.3 Regras de escrita da mesa país/jurisdição

1. **Um host, uma canônica.** `jurisdiction.canonical_host` é único no site. O `canonical` de toda rota é `<host><path da variante de idioma>`. Enquanto houver dois hosts (`com www` e `sem www`, como no material de origem), existe uma variante duplicada por rota — e o buscador não sabe qual é a verdadeira.
2. **País por idioma é 1:1.** Um idioma pertence a um país. O país define sistema de medida, moeda e regras de jurisdição. O `en` do site é **Reino Unido** (`en-GB`) pelo registro de referência; o material de origem fala de `en-US` para unidades imperiais — são **dois** mercados e o campo `country_code` + `locale_variant` precisam separar isso. **Enquanto essa distinção não for gravada, `en` fica `DERBY` no país.**
3. **Um idioma sem país declarado não publica conteúdo que depende de jurisdição.** Conteúdo que depende de jurisdição = o que cita norma, lei, norma técnica ou regra de exercício profissional. A Mesa de Jurisdição marca quais objetos são desse tipo (`content_object.kind='norma'` — **24** objetos —, mais os objetos que citam `fundamento`). A regra é recusada na escrita, não alertada depois.
4. **A unidade offered não é a unidade da conta.** O sistema de medidas do país define o que se **oferece** (`lb`, `in`, `°F` — só para `en-US`); a fórmula interna continua em `kg`, `cm`, `°C`. Trocar a fórmula por idioma muda o resultado numérico — proibido.
5. **A norma é do país de origem, sempre.** Editar a página em inglês não torna a norma britânica. O país de origem é propriedade do **objeto**, não da edição. A Mesa de Jurisdição mostra, ao lado de cada norma, o país de origem e o aviso: "pode ser usada em outro país; a fonte continua sendo a de origem".
6. **Ícone/controle de país é referência, não autorização.** O registro de ícones da outra linhagem tem **19/19** itens em `HOLD_HUMAN`, `reuseLicense=NOT_VERIFIED` e `verifiedArtwork=false`; `canActivateCountryIcon()` retorna `false` para todos e `iconArtworkPermitted()` retorna `false` para todos. A Mesa de Jurisdição **não ativa** nenhum ícone: ela mostra o contrato como fonte de referência e mantém a decisão humana.
7. **Três países, uma unidade interna.** O `unit` gravado em `tool_field`/`tool_output` é **a unidade da conta** e não muda por país. O que muda por país é o **rótulo** e a **alternativa oferecida**.
8. **A jurisdição da fonte é um fato da fonte, não uma escolha da mesa.** As 25 fontes preservadas já declaram `jurisdiction` (22 "Brasil", 3 "Internacional") e `source_type`. A Mesa de Jurisdição **lê** esse dado (via `sourceCanonicalId`) e **não permite que a edição em outro idioma o mude**. Onde a fonte é "Internacional", a mesa mostra "sem jurisdição nacional" — em vez de atribuir um país por conveniência.
9. **Direito `UNKNOWN` não é direito verificado.** 21 das 25 fontes têm `rights: "UNKNOWN"`. A mesa mostra esse campo como pendência (`DERBY` no `jurisdiction.rights`), e **não** como "livre para uso" — a diferença é o que impede a mesa de prometer o que a fonte não promete.

### 3.4 O registro de ícones por país (outra linhagem — leitura)

Origem: commit `1ede48c` (branch-bibliotecas), arquivos `registers/i18n/country-icon-contract.v1.json`, `registers/i18n/locale-register.v1.json`, `src/lib/country-icon-policy.ts`, `src/lib/country-icon-rendering.ts`, `docs/ICON_COUNTRY_DECISIONS.md`. **Data da leitura: 26/10/2026.** Nenhum desses arquivos existe nesta árvore.

`country-icon-contract.v1.json` — 19 itens, um por idioma com edição de rota:

| idioma | país de referência | evidência | licença | obra verificada | desfecho |
|---|---|---|---|---|---|
| `pt-BR` | Brasil | `documented_use` | `NOT_VERIFIED` | não | `REFERENCE_ONLY_NO_NATIONAL_ARTWORK` |
| `en` | Reino Unido | `official_guidance` | `NOT_VERIFIED` | não | idem |
| `ja` | Japão | `official_guidance` | `NOT_VERIFIED` | não | idem |
| `zh` | China | `documented_use` | `NOT_VERIFIED` | não | idem |
| `id` | Indonésia | `documented_controls` | `NOT_VERIFIED` | não | idem |
| `ar` | Arábia Saudita (referência) | `hold_visual_evidence` | `NOT_VERIFIED` | não | idem |
| `de` | Alemanha | `hold_visual_evidence` | `NOT_VERIFIED` | não | idem |
| `es` | Espanha | `hold_visual_evidence` | `NOT_VERIFIED` | não | idem |
| `fr` | França | `hold_visual_evidence` | `NOT_VERIFIED` | não | idem |
| `hi` | Índia | `hold_visual_evidence` | `NOT_VERIFIED` | não | idem |
| `it` | Itália | `hold_visual_evidence` | `NOT_VERIFIED` | não | idem |
| `ko` | Coreia do Sul | `needs_screenshot` | `NOT_VERIFIED` | não | idem |
| `nl` | Países Baixos | `hold_visual_evidence` | `NOT_VERIFIED` | não | idem |
| `pl` | Polônia | `hold_visual_evidence` | `NOT_VERIFIED` | não | idem |
| `ru` | Rússia | `hold_visual_evidence` | `NOT_VERIFIED` | não | idem |
| `sv` | Suécia | `hold_visual_evidence` | `NOT_VERIFIED` | não | idem |
| `tr` | Turquia | `hold_visual_evidence` | `NOT_VERIFIED` | não | idem |
| `uk` | Ucrânia | `hold_visual_evidence` | `NOT_VERIFIED` | não | idem |
| `vi` | Vietnã | `hold_visual_evidence` | `NOT_VERIFIED` | não | idem |

`locale-register.v1.json` — 19 locales com `direction` (`ar` = `rtl`, os outros 18 = `ltr`), `interfaceDictionary` (`partial_existing` em pt-BR/en/es/fr, `missing` nos outros 15), `content: not_verified` em **19/19**, e `seoEligibility`:
- `legacy_declared_requires_review` — pt-BR, en, es, fr
- `blocked_pending_verified_localization` — os outros **15**

As políticas do registro são: `neverMarkCompleteWithoutReview: true`, `seoAlternatesRequireApprovedTranslation: true`, `remoteTranslationIsNotProof: true`. O `docs/ICON_COUNTRY_DECISIONS.md` registra **aprovação visual 0/19** e **5 gates bloqueantes** (captura/licença/testes/aprovação humana por idioma).

**Isto alimenta a Mesa de Jurisdição como fonte de referência e a Mesa de Idioma como precedente de estados** — e **não** como autorização. Os 12 idiomas que existem só na tabela `locale` **não têm** entrada em nenhum dos dois registros.

### 3.5 Gate da mesa país/jurisdição — o que ela tem que recusar

| id | O gate recusa | Como prova |
|---|---|---|
| G1 | **2** hosts canônicos para o site | `unique` em `jurisdiction.canonical_host` + verificação de que o `canonical` de toda rota começa pelo host declarado |
| G2 | `country_code` de idioma que não existe em `jurisdiction` | FK |
| G3 | Publicar conteúdo dependente de jurisdição com `country_code = DERBY`/nulo | consulta de `content_object.kind='norma'` × `locale_state` |
| G4 | Sistema `imperial` sem as 3 unidades declaradas (`lb`, `in`, `°F`) | validação do trio |
| G5 | Alterar `tool_field.unit`/`tool_output.unit` como efeito de troca de país | o gate recusa escrita de unidade disparada por país; a unidade é da conta |
| G6 | Ativar ícone/controle de país sem `approval` humano e licença verificada | o gate lê o registro e recusa enquanto `approval != 'APPROVED'` ou `reuseLicense == 'NOT_VERIFIED'` |
| G7 | Mudar o país de origem de uma norma ao editar a edição em outro idioma | o país de origem é do objeto, não da edição |
| G8 | Gravar `jurisdiction` para um idioma que o `locale` não tem | FK inversa |

### 3.6 DERBY na mesa país/jurisdição

| Onde | O que vira `DERBY` | Por quê |
|---|---|---|
| `locale_state.country_code` | **12** idiomas sem mapeamento | o registro cobre 19 idiomas; os 12 não têm entrada |
| `locale_state.country_code` do `en` | **1** idioma | o registro diz "Reino Unido" e o material de origem fala de `en-US` para unidades — a distinção não está gravada em lugar nenhum |
| `jurisdiction.*` (unidades, moeda) | países além do `BR` | só `BR` é verificável a partir do site; o resto depende de decisão do dono |
| `jurisdiction.measure_system` | idem | idem |
| `source_tool.evidence` / `.version` / `.band_from` | **82/82** linhas com `DERBY` (a 0037 preencheu o que era nulo) **[atualizado]** | o marcador diz "não sei", não "é do Brasil". A coluna que liga a norma ao `sourceCanonicalId` **não existe** (JUR-12) |
| `source_tool.category` / `.nanda_mode` | **77/82** com `DERBY` | as 5 publicadas (`apgar`, `braden`, `gotejamento`, `imc`, `morse`) têm categoria e modo NANDA reais; as outras 77 têm marcador |
| `jurisdiction.rights` | **21** das 25 fontes preservadas | `rights: "UNKNOWN"` nos registros de fonte; só 4 (`emag`, `trv-010`, `w3c-shacl`, `wcag-2-2`) têm `LICENSED` |
| `media_asset` / `content_object` | — | não é campo de jurisdição |

---

## 4. Tabelas novas propostas e o contrato com o resto da rodada

### 4.1 As três tabelas novas

As três mesas precisam de tabelas que **não existem**. Quem tem `migrations/**` no escopo é a tarefa `indice-banco` (0036), `derby` (0037), `source-processo` (0038) e `doutrina` (0039). **Os números 0036–0039 estão reservados.** O propose:

| Tabela | Colunas | Chave |serve |
|---|---|---|---|
| `seo_page` | `path`, `locale`, `canonical_path`, `og_image_path`, `og_image_alt`, `robots`, `jsonld_type`, `updated_by`, `updated_at` | `(path, locale)` | Mesa SEO |
| `locale_state` | `locale` (FK→`locale.id`), `direction`, `status`, `seo_eligibility`, `country_code`, `reviewed_by`, `reviewed_at` | `locale` | Mesa de Idioma |
| `jurisdiction` | `id`, `canonical_host`, `country_code`, `country_name`, `measure_system`, `weight_unit`, `length_unit`, `temperature_unit`, `currency`, `locale_variant` | `id` (=`country_code`) | Mesa de Jurisdição |

Proposta de migration: **`0042_mesas_seo_idioma_jurisdicao.sql`** (idempotente, sem tocar em migration existente). **[atualizado] A 0040 está reservada para a tarefa de atomização e a 0041 é do dono (fecha os rascunhos de aprovação) — a próxima livre é a 0042. Quem implementa o admin não pode criá-la: o escopo da tarefa `admin-area` exclui `migrations/**`.** Esta é uma dependência que precisa ser resolvida antes (ver §6).

**[atualizado] O número de tabelas depois disso: 96 + 3 = 99 — e ele se conta.** O portão `scripts/audit-indice-banco.mjs` compara as tabelas do banco com `schema_entity` e com `src/lib/banco/indice.ts`: as três tabelas novas precisam entrar **nos três lugares** (schema, dicionário, índice em código) ou o portão acusa tabela sem índice. O portão **não** tem número fixo — ele conta. Quem escrever "99" no código está fazendo exatamente o que o briefing proíbe.

> `locale_state.status` e `locale_state.seo_eligibility` são **derivados** (§2.4) e gravados. A alternativa — derivar na consulta — deixa dois lugares com a regra e o admin contorna a regra. Gravado, a tela e o render leem a mesma linha.

### 4.2 As `policy_rule` de que as mesas precisam

O `src/lib/policy-decision.ts` decide por `(package_id, action, subject_role)` e **lança** quando o efeito é `deny`. Os pacotes `idioma` e `jurisdicao` estão no escopo da tarefa `doutrina` (migration 0039). O pacote **`seo` não está** em nenhum escopo — precisa ser criado.

| Pacote | `action` | `subject_role` | Efeito esperado | Regra |
|---|---|---|---|---|
| `seo` | `salvar_seo` | `admin` | `allow` | gravação de metadado de rota |
| `seo` | `salvar_seo` | `*` ≠ `admin` | `deny` | escrita restrita |
| `seo` | `publicar_sitemap` | `admin` | `deny` se a rota for `noindex` ou não tiver conteúdo publicado | regra do sitemap |
| `seo` | `publicar_hreflang` | `admin` | `deny` se o idioma não tiver versão publicada | regra do `hreflang` |
| `idioma` | `publicar_idioma` | `admin` | `allow` com pré-condições (label, direção, país) | §2.4 |
| `idioma` | `publicar_conteudo_jurisdicao` | `admin` | `deny` sem país declarado | §3.3 regra 3 |
| `jurisdicao` | `salvar_jurisdicao` | `admin` | `allow` | |
| `jurisdicao` | `salvar_jurisdicao` | `*` ≠ `admin` | `deny` | |
| `jurisdicao` | `ativar_icone_pais` | `admin` | `deny` (0/19 aprovados) | §3.3 regra 6 |
| `derby` | `marcar_derby` | `admin` | `allow` | marcador de pendência |

**As regras `allow`/`deny` acima são o que as mesas consultam; as pré-condições (limite de 70, 1200×630, país declarado) são validações de campo, implementadas na função de gravação da mesa, e cada uma precisa de um teste que prove a recusa.**

### 4.3 O que a mesa NÃO faz

- Não traduz. A Mesa de Idioma edita rótulos e decide estado; a tradução automática continua fora (e não é revisão).
- Não cria nem apaga rota. A rota vem de `content_alias` / `publicPaths()`.
- Não decide ranking, não lê busca, não lê analytics. Nenhuma das três mesas tem leitura de terceiro.
- Não escreve conteúdo clínico.

---

## 5. A tela (contrato visual, sem inventar nada)

Cada mesa é uma `DeskModule` nova em `src/lib/normative-desk.ts` (`"seo"`, `"idioma"`, `"jurisdicao"`), com entrada em `adminContracts` (`src/lib/admin-contract.ts`), layout `"registro"`, regiões `["toolbar","list","detail","form"]`.

| Mesa | Lista (colunas) | Detalhe | Formulário |
|---|---|---|---|
| SEO | rota · idioma · título (≤70, com contador) · canonical · cartão · robots · JSON-LD · estado | o head renderizado da rota: `<title>`, `og:title`, `twitter:title`, `canonical`, `og:url`, `hreflang` (conjunto), JSON-LD, imagem | título/description (via `content_text`), canonical, cartão + alt, robots, tipo de JSON-LD, linha do sitemap |
| Idioma | idioma · nome em pt-BR · direção · estado · chrome (n/esperado) · conteúdo (publicados/rascunhos) · país · elegibilidade SEO | os 4 grupos de `chrome_label` com as chaves faltantes; as rotas do idioma | nome, direção, país, revisor; publicação de conteúdo idioma a idioma |
| Jurisdição | país · host canônico · sistema · unidades · moeda · idiomas que usam | as 24 normas com país de origem; os 5 instrumentos com a unidade da conta e a alternativa oferecida | host, país, sistema, unidades, moeda; país por idioma |

**Comportamento comum das três:**
- `DERBY` aparece **visível** em todas as telas, com a pendência nomeada (nunca mascarado, nunca estilizado como valor normal).
- Estados usam a paleta de `statusTone()` já existente em `src/lib/normative-desk.ts` (`ok`/`stop`/`wait`/`muted`), sem cor nova.
- Teclado, foco visível, rótulo acessível por campo, alvo de toque 44 px — o admin é onde o conteúdo é escrito; se o admin é inacessível, o site acessível nasce inacessível.
- `.admin-table` com `<th>` real (o `thead` é visualmente oculto no mobile, não semanticamente) e `data-label` em cada `td` (o CSS já exige).

---

## 6. Dependências (o que precisa ser resolvido por outro)

| # | Dependência | Quem resolve | Por que bloqueia |
|---|---|---|---|
| D1 | **Criar as 3 tabelas** (`seo_page`, `locale_state`, `jurisdiction`) | quem tem `migrations/**` (0036–0039 reservados → 0040) | sem elas, as três mesas não têm onde gravar |
| D2 | **Pacote de políticas `seo`** | tarefa `doutrina` (0039) — os pacotes `idioma` e `jurisdicao` já estão no escopo dela | o gate do SEO não tem regra para consultar |
| D3 | **`src/lib/seo.ts` passa a ler dado** (o host, a lista de idiomas, o JSON-LD) em vez de constante | quem implementa | enquanto `locales` for uma constante de 4 e o banco tiver 31, a tela e o site discordam |
| D4 | **`public/sitemap.xml` passa a ser materializado** de `sitemap_url` (hoje `sitemapXml()` não tem consumidor) | quem implementa | 23 rotas públicas estão fora do sitemap |
| D5 | **`public/robots.txt` passa a ser materializado** de `crawl_rule` | quem implementa | hoje são dois lugares que podem divergir |
| D6 | **O catch-all `/$` emite canonical do idioma da variante** (hoje `absoluteUrl(canonical_path)`, sem idioma) | quem implementa | o canonical de uma edição aponta para o original em português |
| D7 | **Decidir a árvore alvo** (repo `feat/projection-unica-f0-suite-real` × build v271) | o dono | 47 × 41 rotas, 2 × 6 `Disallow`, 2 arquivos `robots.txt` |
| D8 | **`locale.label` com o nome real dos 26 idiomas** | tarefa `derby` (0037) | fato ISO 639-1; nunca `DERBY` |
| D9 | **Decidir `en` = `en-GB` ou `en-US`** para unidade e jurisdição | o dono | o registro de referência diz Reino Unido; o material de origem fala de `en-US` |
| D10 | **Coluna de origem da norma no banco** (`source_tool.source_ids` ou equivalente) | quem tem `migrations/**` | hoje o identificador da fonte vive só no código (`src/lib/tools/catalog.ts`); sem coluna, a Mesa de Jurisdição não mostra a origem |

---

## 7. O que **não** foi verificado (NOT_RUN)

| # | O que | Status | Por quê |
|---|---|---|---|
| N1 | Comportamento do head no **build desta árvore** (v271 é outra árvore) | `NOT_RUN` | o `npm run build` desta árvore não foi executado nesta tarefa; a medição de head é do site publicado (v271) e da leitura do código |
| N2 | `twitter:title` no build desta árvore | `NOT_RUN` | mesma razão; a leitura de `grok-pwa-shared.mjs` mostra que ele **não** é reinjetado, mas o HTML não foi gerado aqui |
| N3 | Colisão de título **entre as 47 rotas indexáveis** | **MEDIDO — 0** | os 47 títulos base são **todos distintos**; as 229 colisões (459 linhas) são do acervo, e nenhum título de rota indexável colide com ele. O que **não** foi medido: se o `<title>` servido (com o sufixo) continua distinto — o sufixo é igual, então a distinção se mantém |
| N4 | Peso real de um cartão 1200×630 por idioma | `NOT_RUN` | não há cartão por idioma; o único (`public/og.jpg`) mede 44.569 bytes |
| N5 | `og:url` e `og:site_name` no site publicado | `NOT_RUN` | ausentes nos 16 head medidos; a medição de 16 rotas é amostra, não o site inteiro |
| N6 | Comportamento de `hreflang` por **rota** no site publicado | `NOT_RUN` | as 16 rotas medidas devolvem o mesmo head do shell; o head por rota só aparece depois do client-side render, que não foi medido |
| N7 | As 94 tabelas do banco **com** as 3 novas | `NOT_RUN` | a contagem medida é **94** de aplicação (+1 `_migrations` = 95) com as migrations 0001–0035; o número **98** citado no pedido de origem (medido em 26/10) provavelmente inclui as tabelas das migrations 0036–0039, que ainda não existem nesta árvore |
| N8 | `npm test` / `npm run build` / `tsc --noEmit` | `NOT_RUN` | esta tarefa é de consultoria e não altera código |
