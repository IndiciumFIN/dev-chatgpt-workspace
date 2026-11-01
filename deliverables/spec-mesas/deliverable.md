# Entrega — `spec-mesas`

**Tarefa:** `spec-mesas` · **Data:** 2026-10-26 (UTC) · **Árvore:** `/workspace/workspace-repo` · branch `feat/projection-unica-f0-suite-real` (base `4c17fe7`)
**Especificação completa:** `docs/admin/especificacao-mesas-novas.md`
**Registro por chave canônica:** `deliverables/spec-mesas/entrega.json` (14 chaves)

---

## Summary

Escrevi a especificação das três mesas novas — **SEO**, **Idioma** e **País/jurisdição** — com a lista de campos de cada uma (campo a campo, com a tabela de origem), a regra de escrita, o que vira `DERBY` e o gate que a mesa tem que recusar. Medi o estado real de hoje rodando as migrations `0001`–`0035` num PGLite e medindo o head do site publicado: **31 idiomas** na tabela `locale` (27 deles com **0 conteúdo publicado**), **3.925** linhas em `content_text` (1.767 publicadas), **47** endereços públicos contra **24** no sitemap, **94** tabelas de aplicação, e um head servido em que **16/16 rotas** devolvem o **mesmo** `title`, o **mesmo** `og:title` e o **mesmo** `canonical` apontando para a home. Nenhum código de produto foi alterado: os arquivos criados são documento.

## Changed files

| Arquivo | Tipo | O que é |
|---|---|---|
| `docs/admin/especificacao-mesas-novas.md` | **novo** | A especificação completa (529 linhas): 3 mesas × (estado medido · campos com tabela de origem · regras · DERBY · gate), as tabelas novas propostas, o contrato com as `policy_rule` e o contrato visual |
| `deliverables/spec-mesas/deliverable.md` | **novo** | Este resumo: as três especificações em forma curta, os números medidos e o `NOT_RUN` |
| `deliverables/spec-mesas/entrega.md` | **novo** | O registro por chave canônica em prosa (formato de `docs/entregas/FORMATO-DE-ENTREGA.md`) |
| `deliverables/spec-mesas/entrega.json` | **novo** | O mesmo registro em JSON, 14 chaves |

**Nada mais foi tocado.** `git status` mostra apenas esses quatro arquivos novos. Nenhuma migration, nenhum `src/`, nenhum `scripts/`.

---

## As três especificações em resumo

### MESA SEO — "o que o buscador lê desta rota"

**Estado medido.** O SEO hoje está em **constantes de código**, não em dado:

| Peça | Onde | Medido |
|---|---|---|
| Host canônico | `src/lib/seo.ts` → `siteOrigin` | constante; o backup registra `www.calculadorasdeenfermagem.com.br` (com `www`) — **host divergente** |
| Idiomas do `hreflang` | `src/lib/seo.ts` → `locales` | **4** (`pt-BR`, `en`, `es`, `fr`) — a tabela `locale` tem **31** |
| Conjunto de links | `languageLinks()` | 1 canonical + 4 alternates + 1 x-default = **6** por rota |
| Cartão social | `scripts/grok-pwa-shared.mjs` | `stripShareMetaTags()` **remove** `og:title`/`twitter:title`/`og:image`/`og:url`/`og:site_name` e `grokOgHeadTags()` só reinjeta `twitter:card`, `og:title`, `og:image` (+`width`/`height`) |
| Imagem do cartão | `public/og.jpg` | JPEG **1200×630**, 44.569 bytes — **1 arquivo** para 47 rotas e 31 idiomas |
| Identidade do app | `src/lib/og/site.json` | `{"title":"Calculadoras de Enfermagem","card":"custom"}` — **sem `description`** |
| Sitemap | `sitemap_url` + `public/sitemap.xml` | **24** `<loc>` (os dois iguais) contra **47** endereços em `publicPaths()` → **23 rotas públicas fora do sitemap** |
| `<title>` servido acima de 70 caracteres | a rota acrescenta ` · Calculadoras de Enfermagem` (29) a **todas** as 47 rotas | **8 das 47** passam de 70; o pior é `/ferramentas/gotejamento`, com **107**; o menor é `/secao/entrar`, com **35** |
| Títulos duplicados | `content_text` pt-BR publicado: 1.764 linhas, 1.534 distintos | **229** títulos distintos repetidos, em **459** linhas; **0** duplicidade entre as 47 rotas indexáveis; o pior é `"ESCALA DE APACHE"` ×3 |
| Título da ferramenta | `source_tool.title` (banco) = `content_text.title` (view `calculadora`) = o que a rota serve; **fallback em código** `src/lib/tools/catalog.ts` tem outro ("Escala de Braden", "Cálculo de IMC"…) | **duas fontes** para o mesmo título |
| `robots.txt` | `crawl_rule` (5 linhas) + `public/robots.txt` | **2** `Disallow` (`/sistema`, `/pacote`); não bloqueia `/admin`, `/conta`, `/sessao`, `/assinante`, `/login` |
| `sitemapXml()` | `src/lib/contract.ts` | **sem consumidor** nesta árvore |

**Divergências medidas no site publicado (v271, 26/10/2026, 16 rotas):**

| Verificação | Resultado |
|---|---|
| `twitter:title` | **ausente** em 16/16 (está em `SHARE_META_KEYS`, é removido e não é reinjetado) |
| `og:title` vs `<title>` | **divergem**: `og:title` = "Calculadoras de Enfermagem" (identidade do app), `<title>` = o título da rota — em 16/16 |
| `og:description` / `og:url` / `og:site_name` / `og:image` | **ausentes** em 16/16 |
| `canonical` | **o mesmo** (`https://calculadorasdeenfermagem.com.br/`, a home) em 16/16 |
| `hreflang` | 5 links, o mesmo conjunto em 16/16 |
| JSON-LD | `["WebSite"]` em 16/16 — nem `Article`, nem `WebApplication` |
| `/nao-existe` | **HTTP 200** com o head da home |

**Campos (com a tabela de origem).** `content_text.title` (≤70, é o **mesmo** texto de `<title>`/`og:title`/`twitter:title` — **sem coluna duplicada**), `content_text.lead` (≤160), `seo_page.canonical_path` (nova), `seo_page.og_image_path` + `seo_page.og_image_alt` (novas), `seo_page.robots` (nova), `seo_page.jsonld_type` (nova), `sitemap_url.loc`, `crawl_rule.directive`, `media_asset.note`.

**Regras.** Uma fonte por fato; a página vence o app; canonical por rota+idioma, com `og:url` igual ao canonical; um cartão 1200×630 por idioma, mesma URL em `og:image` e `twitter:image`; sitemap = indexável ∩ publicado, nas duas direções; `hreflang` derivado do que está **publicado e revisado**, nunca da lista de idiomas.

**Gate (10 recusas).** Título > 70; cartão que não seja 1200×630; `alt` vazio ou > 125; canonical de outro idioma; canonical para rota `noindex`; linha de sitemap para rota `noindex` ou sem publicação; `crawl_rule` liberando área restrita; **head renderizado com `title ≠ og:title ≠ twitter:title`**; `hreflang` para idioma sem publicação; escrita por perfil ≠ `admin`.

**DERBY.** `og_image_path` e `og_image_alt` por idioma (não há cartão por idioma: o `fase1/PENDENCIAS.md` registra "Cartão OG 1200×630 por locale… As 19 peças citadas respondem 404"); `jsonld_type` de seção institucional; `media_asset.note` (hoje é só o nome do arquivo, sem hash nem dimensão). **`DERBY` nunca entra em `content_text.title`** — um `DERBY` no `<title>` vai ao buscador.

### MESA IDIOMA — "qual é o estado real deste idioma"

**Estado medido (31 linhas de `locale`).**

| Medida | Número |
|---|---|
| Idiomas em `locale` | **31** (só `pt-BR` com `source=true`) |
| Com `label` igual ao `id` | **26** de 31 — nome real em apenas 5 (`pt-BR`, `en`, `es`, `fr`, `pt`) |
| Com linhas em `content_text` | **19** · sem nenhuma linha: **12** |
| Com **0 conteúdo publicado** | **27 de 31** (dos 19 com conteúdo, **15** têm 0) |
| `content_text` | **3.925** linhas — **1.767 publicadas** / **2.158 rascunho** |
| `content_alias` | **3.942** linhas, **1.768** publicadas (1.765 em pt-BR + 1 em cada um de en/es/fr) |
| Cobertura de `chrome_label` (7.797 linhas) | `chrome` **4** idiomas (49 chaves) · `footer` **30** (26) · `home` **19** (352; 344 em `pt`, 355 em `id`/`uk`/`vi`) · `menu` **3** (44) |
| Idiomas aceitos pelo código de publicação | **18** (`src/lib/locale-publish.ts`) contra **31** na tabela |

**Estados.** 1 publicado (`pt-BR`), 3 rascunho (`en`, `es`, `fr` — só a home publicada), **27 pendentes**.

**Campos.** `locale.id`, `locale.label` (nome do idioma em pt-BR — **fato ISO 639-1**, nunca `DERBY`, nunca o id), `locale.source`, `locale_state.direction` (nova; `ar` = `rtl`), `locale_state.status` (nova), `locale_state.seo_eligibility` (nova), `locale_state.country_code` (nova), `locale_state.reviewed_by` / `reviewed_at` (novas), `chrome_label.text`, `content_text.status`.

**Regras.** Três estados; `publicado` exige nome real + direção + chrome completa + ≥ 1 conteúdo publicado; **um idioma sem país declarado não publica conteúdo que dependa de jurisdição**; rótulo duplicado é erro, não update; o `label` é o nome **em português** (para o administrador ler), não a autotradução; `DERBY` continua visível na tela.

**Gate (8 recusas).** Publicar idioma com `label` vazio/igual ao id/`DERBY`; publicar sem direção; publicar conteúdo dependente de jurisdição sem país; gravar `chrome_label` com chave já existente; declarar `hreflang` para idioma com 0 publicado; `locale.id` fora do conjunto aceito (o gate lê a **tabela**, não a constante de 18); marcar revisado sem revisor; publicar com chrome incompleta.

**DERBY.** `country_code` dos 12 idiomas sem mapeamento; `direction` fora dos 19 com registro; `reviewed_by`/`reviewed_at` dos 30 não-fonte (tradução automática **não** é revisão); `seo_eligibility` derivado. **`locale.label` nunca é `DERBY`** — é fato.

### MESA PAÍS/JURISDIÇÃO — "de onde vem a norma, em que país, com que unidade"

**Estado medido (quase nada existe).** `country`/`jurisdiction`: **0 ocorrências** em `src/`, `scripts/` e `migrations/`. `src/lib/country-icon-policy.ts` **não existe nesta árvore** (está no commit `1ede48c`, branch-bibliotecas — leitura, sem checkout). **Nenhuma** das 94 tabelas tem `country`, `jurisdiction`, `measure_system`, `currency` ou `country_code`. O host canônico é constante de código; o país por idioma **não existe**; a unidade de medida está em `tool_field.unit` (**5** valores: `min`, `mL`, `kg`, `h`, `cm`) e `tool_output.unit` (**3**: `gotas/min`, `mL/h`, `kg/m²`) — **sem coluna de país**; a origem das normas está em `content_object.kind='norma'` (**24** objetos), `fundamento` (**43** linhas) e `source_tool` (**82** capas, 5 publicadas, com `evidence`/`version`/`band_from` nulas em **82/82** e **sem coluna de fonte**).

**Regra de unidade (do material de origem, `fase1/revisao_seo_bloqueios.md`):** "Só `en-US` deve oferecer lb, in e °F, e a conta interna continua em kg, cm e °C. Trocar a fórmula por locale muda o resultado. O script só troca o rótulo marcado com `data-unidade`." As 5 ferramentas publicadas **já são métricas** — a regra muda o **rótulo** e a **alternativa oferecida**, nunca a conta.

**Campos.** `jurisdiction.canonical_host`, `.country_code`, `.country_name`, `.measure_system`, `.weight_unit`, `.length_unit`, `.temperature_unit`, `.currency`, `.locale_variant` (novos); `locale_state.country_code` (idioma → país); `tool_field.unit`/`tool_output.unit` (a unidade **da conta**, imutável por país); `source_tool` (origem da norma — **dependência**: não há coluna de fonte).

**Regras.** Um host, uma canônica; país por idioma 1:1; **idioma sem país não publica conteúdo que dependa de jurisdição**; a unidade *oferecida* não é a unidade *da conta*; **a norma é do país de origem** — editar em inglês não torna a norma britânica; ícone/controle de país é **referência, não autorização**.

**Gate (8 recusas).** 2 hosts canônicos; `country_code` inexistente; publicar conteúdo dependente de jurisdição sem país; sistema imperial sem as 3 unidades; escrita de unidade disparada por troca de país; ativar ícone sem aprovação humana e licença verificada; mudar o país de origem de uma norma ao editar a edição; jurisdição para idioma inexistente.

**DERBY.** `country_code` dos 12 sem mapeamento; `country_code` do `en` (**1**: o registro diz "Reino Unido" e o material de origem fala de `en-US` — a distinção não está gravada em lugar nenhum); unidades/moeda de países além do `BR`; `source_tool.evidence`/`version`/`band_from` (82/82 nulas).

**O registro de ícones por país (outra linhagem, lido em 26/10/2026).** `registers/i18n/country-icon-contract.v1.json`: **19** itens, um por idioma com edição de rota, com `referenceCountry` (Brasil, Reino Unido, Japão, China, Indonésia, Arábia Saudita…); **19/19** com `reuseLicense=NOT_VERIFIED`, `verifiedArtwork=false`, `outcome=REFERENCE_ONLY_NO_NATIONAL_ARTWORK`, `approval=HOLD_HUMAN`; `canActivateCountryIcon()` e `iconArtworkPermitted()` retornam `false` para todos. `registers/i18n/locale-register.v1.json`: **19** locales com `direction` (`ar` = `rtl`), `content: not_verified` em **19/19** e `seoEligibility` = `legacy_declared_requires_review` (pt-BR/en/es/fr) ou `blocked_pending_verified_localization` (os outros 15). `docs/ICON_COUNTRY_DECISIONS.md`: aprovação visual **0/19**, 5 gates bloqueantes. **Os 12 idiomas que só existem na tabela `locale` não têm entrada em nenhum dos dois registros.**

---

## O que ficou `NOT_RUN`

| # | O quê | Status |
|---|---|---|
| N1 | Head do **build desta árvore** (o publicado medido é o v271, outra árvore) | `NOT_RUN` — `npm run build` não foi executado nesta tarefa |
| N2 | `twitter:title` no build desta árvore | `NOT_RUN` — a leitura de `grok-pwa-shared.mjs` mostra que não é reinjetado, mas o HTML não foi gerado aqui |
| N3 | Colisão de título entre as **47** rotas indexáveis | **MEDIDO — 0** (os 47 títulos base são distintos) |
| N4 | Peso real de um cartão 1200×630 **por idioma** | `NOT_RUN` — não há cartão por idioma; o único mede 44.569 bytes |
| N5 | `og:url` e `og:site_name` no site inteiro | `NOT_RUN` — ausentes nos 16 head medidos; 16 rotas é amostra |
| N6 | `hreflang` **por rota** no site publicado | `NOT_RUN` — as 16 rotas devolvem o head do shell; o head por rota só aparece depois do client-side render |
| N7 | Contagem de tabelas **com** as 3 tabelas novas | `NOT_RUN` — medido **94** de aplicação (+1 `_migrations` = 95) com as migrations 0001–0035; o "98" do pedido de origem (26/10) provavelmente inclui 0036–0039, que ainda não existem nesta árvore |
| N8 | `npm test` / `npm run build` / `tsc --noEmit` | `NOT_RUN` — tarefa de consultoria, sem alteração de código |

**Fora do escopo, por decisão do dono (não são `NOT_RUN`):** nenhuma afirmação de volume de busca, posição ou métrica de mercado foi feita; nenhum conteúdo clínico foi escrito; nenhum código de produto foi alterado.

---

## Notes (para o verificador)

1. **A especificação é implementável sem ambiguidade:** para cada uma das três mesas há a lista de campos **com a tabela de origem** (15 + 14 + 14 campos), e onde a tabela **não existe** ela é nomeada como nova (`seo_page`, `locale_state`, `jurisdiction`) com a migration proposta (`0040_mesas_seo_idioma_jurisdicao.sql`, já que 0036–0039 estão reservados). Os campos que já existem citam a tabela e a coluna pelo nome.
2. **A regra do SEO confere com o que o dono pediu e com o código.** O dono: "title / og:title / twitter:title — mesmo texto" e "o título da página vence a identidade do app". O código: `resolveShareTitle()` **prefere** o `documentTitle` (o `<title>` da rota) ao `site.json` — ou seja, a página **já** vence o app em código, mas **`twitter:title` não é emitido** e, **no build publicado, o `og:title` é o do app**. A especificação não inventa regra nova: ela torna explícito o que o código já faz, fecha o `twitter:title` e cria a forma de gravar o metadado que hoje só existe em constante.
3. **Não há promessa de ranking nem dado de mercado.** Os únicos números externos ao repo são: o `country-icon-contract.v1.json` e o `locale-register.v1.json` (commit `1ede48c`, outra linhagem, lidos em 26/10/2026, com o número de aprovação 0/19 **do próprio registro**) e `fase1/revisao_seo_bloqueios.md` + `fase1/METADADOS-HOME-19.md` (material de origem do dono, que fixa os limites 70/160/80/125 e a regra de unidade). Ambos com arquivo e data.
4. **Nenhuma cor nova.** As três mesas reusam `.paper`, `.field`, `.btn-navy`, `.btn-line`, `.btn-danger`, `.btn-sm`, `.admin-table`, `.badge`, `.cmd-band`, `.swatch-grid`, `.phase-list`, `.contract-list`, `.tool-help` e os tokens `--color-navy #1a3e74`, `--color-sky #4a90e2`, `--color-ink #0f2440`, `--color-line #dbe3ec`, `--color-canvas #f9fafb`, com Inter e Nunito Sans. A cor de estado vem de `statusTone()`, que já existe.
5. **Achei uma divergência que o pedido não esperava e que muda a leitura do número de rotas:** o `site_route` — que era a fonte de `path/locale/title/lead/canonical_path` — é **dropada** pela migration `0029_retire_duplicates.sql`. A mesa de SEO **não pode** editar `site_route`: hoje a rota mora em `content_alias` e o texto em `content_text`. Quem implementar precisa saber disso antes de procurar colunas de SEO numa tabela que não existe mais.
6. **A segunda divergência é a de `hreflang`:** o pedido fala em "19 idiomas" e o código de SEO (`src/lib/seo.ts`) declara **4**; o código de publicação (`src/lib/locale-publish.ts`) aceita **18**; a tabela `locale` tem **31**; e o `fase1/PENDENCIAS.md` diz, do próprio material do dono: "Dimensionamento segue só em pt-BR. **Hreflang das outras línguas não deve ser publicado.**" A especificação amarra as três: o `hreflang` é **derivado do que está publicado e revisado** — publicar um idioma é o que acrescenta um `alternate`, e é por isso que a Mesa de Idioma e a Mesa de SEO compartilham a mesma regra.
7. **A árvore alvo precisa ser decidida pelo dono (D7):** o repo desta tarefa tem `sitemap.xml` com **24** URLs e `robots.txt` com **2** `Disallow`; o build publicado (v271) tem **41** URLs e **6** `Disallow`. Os dois números são verdadeiros, de árvores diferentes. A medição de head é do v271 e serve como evidência do *padrão* de falha (head único de shell em todas as rotas), não como medição desta árvore.
8. **O `DERBY` foi aplicado com a regra do dono:** onde a verdade é verificável, o valor real vai (`locale.label` = nome ISO 639-1 em português; direção; país por idioma nos 19 com registro); onde não é, `DERBY`. E em nenhum caso o `DERBY` entra num campo que o buscador lê (`content_text.title` fica de fora de propósito).
9. **A contagem de tabelas não bate com o número do pedido, e eu não arredondei:** medi **94** tabelas de aplicação (+1 `_migrations` = 95) aplicando as migrations `0001`–`0035`. O pedido diz 98 (medido em 26/10). A diferença de 4 cabe exatamente nas migrations 0036–0039, que estão reservadas para outros workers desta rodada e ainda não existem nesta árvore. **Não afirmei 98**: afirmei o que medi, e registrei a reconciliação como `NOT_RUN` (N7).
10. **Reprodução da medição.** Os scripts de medição ficaram fora do repo (em `/workspace/.mavis/plans/plan_c3e3995f/workspace/`): `measure-db.mjs` e `measure-db2.mjs` aplicam as migrations num PGLite com `dataDir` e escrevem `dump.json`/`dump2.json`; `measure-live-head.py` lê o head das 16 rotas do site publicado. Nenhum deles altera o repo.
