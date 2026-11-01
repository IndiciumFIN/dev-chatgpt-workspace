# Deliverable — Camada federal: verificação das normas invocadas na API de Dados Abertos do Senado

**Frente:** Calculadoras de Enfermagem — verificação das normas federais citadas publicamente
**Fonte primária desta frente:** Senado Federal — Dados Abertos Legislativos (`https://legis.senado.leg.br/dadosabertos`)
**Data da ronda:** 2026-11-01 (UTC) · **Versão do serviço observada:** `DataVersaoServico 2017-02-01`, snapshot da base com normas até 20/07/2026 (vide `vides` da Lei 8.080/1990)

---

## 1. Summary

Reaproveitei o evidence pack da ronda anterior (`/workspace/evidence_pack/normativos-federais-raw/`, 45 ficheiros) e refiz apenas o que faltava: corrigi a sintaxe das consultas de catálogo (o parâmetro `tipo` da API é **sigla**, e a ronda anterior usava códigos numéricos inválidos — 441/222), baixei os catálogos integrais de 2024 (1.436 docs) e 2025 (1.293 docs) e varri o escopo do dataset por tipo. **Três das cinco normas foram confirmadas na API com duas rotas independentes cada** (sigla/número/ano e `id`): Lei 7.498/1986 (id 549374), Lei 8.080/1990 (id 549956) e Lei 5.905/1973 (id 547781). **Duas não são representadas no dataset do Senado**: a Resolução Cofen 736/2024 e a Portaria GM/MS 6.734/2025 — negativos demonstrados por 11 e 8 estratégias de consulta respetivamente, pelo catálogo integral dos anos de assinatura e por prova de escopo (o tipo `PRT` só tem 2 documentos em toda a base, ambos de 1821; o tipo `REG-n` tem 38, todos de 1838–1842). O texto integral dos artigos não é devolvido pela API em nenhum caso: **NOT_RUN** para as cinco, com o caminho oficial indicado.

---

## 2. Changed files

| Caminho | Conteúdo |
|---|---|
| `outputs/normativos-federais/deliverable.md` | Este documento (entregável) |
| `outputs/normativos-federais/normativos_federais.json` | Artefato estruturado consolidando as 3 confirmações, as 2 negativações e as normas adjacentes |
| `outputs/normativos-federais/extracao_confirmadas.json` | Extração FASE 2 das 3 leis (metadados, catálogo, indexação, publicações, vides, edivs, dispositivos alterados) |
| `outputs/normativos-federais/fase1_redo.sh` | Script reproduzível das consultas de catálogo (FASE 1) |
| `outputs/normativos-federais/raw/*.json` (41 ficheiros) | Respostas cruas da API desta ronda + `tiposNorma`/`apidocs` copiados da ronda anterior |
| `.mavis/plans/plan_2973fb1f/board.md` | Progresso da frente |

Nenhum ficheiro do `evidence_pack/` foi alterado (só leitura).

---

## 3. Notes para o verificador

1. **Ronda anterior vs. esta ronda.** As três leis já estavam confirmadas no pack anterior (extracao.json). Re-executei as consultas e os resultados são **byte-a-byte equivalentes** em identificacao/catalogo/indexacao/publicacoes — a base não mudou. Tudo o que é **novo** nesta ronda: (i) correção do uso do parâmetro `tipo`; (ii) catálogos integrais 2024/2025 com verificação de não-truncamento; (iii) prova de escopo do dataset; (iv) controlos positivos no endpoint URN; (v) prova negativa independente no LexML. Os ficheiros copiados da ronda anterior estão com sufixo `_ronda_anterior` em `raw/`.
2. **Sinalização da ronda anterior.** `tiposNorma_ronda_anterior.json` e `apidocs_openapi_ronda_anterior.json` vieram do pack anterior; todo o resto em `raw/` foi gerado agora.
3. **`catalogo` NÃO é sumário por artigo.** Para as três leis a API devolve **uma única linha de palavras-chave** (ex.: `" EXERCICIO PROFISSIONAL ."`). Não é sumário estruturado de capítulos/artigos. Qualquer tela que apresente isso como "sumário da lei" está errada.
4. **Limite técnico verificado, não suposto.** O campo `publicacoes[].temTexto` vale `"S"` para as três leis — sinaliza que existe texto publicado, **não** que o endpoint o devolve. O corpo dos artigos não veio em nenhuma resposta.
5. **Erro metodológico da ronda anterior, corrigido.** `tipo=441` / `tipo=222` não são siglas válidas; o `lista` ignorava o valor e devolvia zero. O resultado "vazio" não era prova de ausência. A prova de ausência agora é feita por catálogo integral + escopo, que é conclusiva.
6. **Duas leituras de DOU fora da API.** Os dados de identificação da Res. Cofen 736/2024 e da Portaria 6.734/2025 na secção (c) vêm do DOU (in.gov.br), **não** da API do Senado. Estão isolados e rotulados como tal. O sandbox não alcança `in.gov.br` via `curl` (HTTP 000); foram lidos por outro caminho de rede.
7. **Rate limit.** Todas as chamadas fizeram `sleep 0.35` (≈2,8 req/s), abaixo do teto de 10 req/s. Total desta ronda: 39 chamadas à API do Senado (mais leituras fora da API: LexML e DOU).

---

## 4. Escopo, método e limites da fonte

**Método (duas fases, conforme instrução):**
- **FASE 1 — catálogo:** `/legislacao/lista` com filtros `tipo` (sigla), `numero`, `ano`, `data`; leitura integral do catálogo do ano; sondagem de escopo por tipo.
- **FASE 2 — extração:** `/legislacao/{sigla}/{numero}/{ano}` e `/legislacao/{id}`, com controlo cruzado por `id`; `/legislacao/urn?urn=` para as URNs de `normas.leg.br`.

**Parâmetros reais do endpoint `lista` (OpenAPI v3 lido em `raw/apidocs_openapi_ronda_anterior.json`):**
`tipo` (sigla) · `numero` · `ano` · `data` (AAAAMMDD) · `seq` · `reedicao` · `ident` · `complemento` · `v`.
**Não existe `palavras`.** Parâmetros desconhecidos são silenciosamente ignorados — `palavras=...` devolve o catálogo do ano inteiro, não uma busca textual. Isso produziu falsos negativos na ronda anterior.

**Limite estrutural da fonte.** O dataset de legislação do Senado é alimentado pelo corpus LexML federal e cobre, na prática: atos do Congresso (leis, LCP, EMC, MPs, DLG, requerimentos, acórdãos do STF), decretos presidenciais e resoluções das Casas. **Não cobre normas infralegais de autarquias e portarias de ministérios.** Isto está provado na secção 9, não é suposição.

**O que a API devolve:** metadados de identificação, ementa, observações, `publicacoes` (DOU, com página/coluna e `temTexto`), `vides` (normas posteriores), `edivs` (normas anteriores correlatas), `disps` (quais dispositivos foram alterados e por qual norma — **sem o texto**), `catalogo` (linha de palavras-chave) e `indexacao` (assuntos).
**O que a API não devolve:** corpo dos artigos, capítulos, incisos, alíneas, redação vigente.

---

## 5. (a) Tabela das cinco normas

| # | Norma invocada | Tipo (na API) | Número | Ano | ID oficial Senado | Identificação oficial (`norma` / `normaNome`) | Data de assinatura | Sumário real devolvido (`catalogo`) | URL oficial | Estado |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Lei 7.498/1986 | `LEI-n` — Lei Numerada | 7498 | 1986 | **549374** | `LEI-7498-1986-06-25` / "Lei nº 7.498 de 25/06/1986" | **25/06/1986** (1986-06-25) | `" EXERCICIO PROFISSIONAL ."` (1 linha) | https://normas.leg.br/?urn=urn:lex:br:federal:lei:1986-06-25;7498 | **CONFIRMADO** (2 rotas) |
| 2 | Lei 8.080/1990 | `LEI-n` — Lei Numerada | 8080 | 1990 | **549956** | `LEI-8080-1990-09-19` / "Lei nº 8.080 de 19/09/1990" | **19/09/1990** (1990-09-19) | `" SAUDE ."` (1 linha) | https://normas.leg.br/?urn=urn:lex:br:federal:lei:1990-09-19;8080 | **CONFIRMADO** (2 rotas) |
| 3 | Lei 5.905/1973 | `LEI-n` — Lei Numerada | 5905 | 1973 | **547781** | `LEI-5905-1973-07-12` / "Lei nº 5.905 de 12/07/1973" | **12/07/1973** (1973-07-12) | `" CONSELHO FEDERAL ,  CONSELHO REGIONAL ,  ENFERMAGEM ."` (1 linha) | https://normas.leg.br/?urn=urn:lex:br:federal:lei:1973-07-12;5905 | **CONFIRMADO** (2 rotas) |
| 4 | Resolução Cofen 736/2024 | — | 736 | 2024 | **—** | — | — (API não devolve) | — | — (sem URN no corpus) | **NÃO CONFIRMADO — não representada no dataset** |
| 5 | Portaria GM/MS 6.734/2025 | — | 6.734 | 2025 | **—** | — | — (API não devolve) | — | — (sem URN no corpus) | **NÃO CONFIRMADO — não representada no dataset** |

Para os itens 4 e 5, os campos "tipo/número/ano" reproduzem **a invocação da produção**; a API do Senado não confirma nenhum deles. A identificação oficial que consta do DOU (fora desta fonte) está na secção (c), isolada e rotulada.

### 5.1 Sumário real devolvido — `catalogo.frase` (verbatim, integral)

```
Lei 7.498/1986  -> [" EXERCICIO PROFISSIONAL ."]
Lei 8.080/1990  -> [" SAUDE ."]
Lei 5.905/1973  -> [" CONSELHO FEDERAL ,  CONSELHO REGIONAL ,  ENFERMAGEM ."]
```

> **Alerta de leitura:** estes são índices de assunto, não sumários. A API devolveu **zero** títulos de capítulo/livro/artigo para estas três leis. Não é possível escrever "a Lei 7.498 tem os capítulos X, Y, Z" a partir desta fonte.

### 5.2 Ementas e indexação (verbatim, da API)

| Norma | Ementa (`ementa`) | Observação (`observacao`) | `indexacao` (n) | `classes` |
|---|---|---|---|---|
| Lei 7.498/1986 | "Dispõe sobre a regulamentação do exercício da enfermagem e dá outras providências." | "AUTOR: DEPUTADO NILSON GIBSON - PL. 3427 DE 1980." | 3 | — |
| Lei 8.080/1990 | "Dispõe sobre as condições para promoção, proteção e recuperação da saúde, a organização e o funcionamento dos serviços correspondentes e dá outras providências." | "AUTOR: EXECUTIVO - PL. 3110 DE 1989." | 5 | "Classificação Temática Unificada / Política Social / Saúde" |
| Lei 5.905/1973 | "Dispõe sobre a criação dos Conselhos Federal e Regionais de Enfermagem e dá outras providências." | "AUTOR: EXECUTIVO - PL. 1126 DE 1973." | 3 | — |

Assuntos indexados (verbatim):
- **7.498/1986:** `NORMAS , REGULAMENTAÇÃO , EXERCICIO PROFISSIONAL , ENFERMAGEM` · `REQUISITOS , AUTORIZAÇÃO , EXERCICIO PROFISSIONAL , ENFERMAGEM` · `DEFINIÇÃO , PROFISSÃO , ENFERMEIRO , TECNICO , ENFERMAGEM , AUXILIAR DE ENFERMAGEM , PARTEIRA`
- **8.080/1990:** `RECURSOS FINANCEIROS , SISTEMA UNICO DE SAUDE (SUS)` · `CRIAÇÃO , SISTEMA UNICO DE SAUDE (SUS)` · `NORMAS , REQUISITOS , PROMOÇÃO , PROTEÇÃO , RECUPERAÇÃO , SAUDE , ORGANIZAÇÃO , FUNCIONAMENTO , SERVIÇO , PESSOA JURIDICA , PESSOA FISICA , TERRITORIO NACIONAL` · `OBJETIVO , COMPETENCIA , ORGANIZAÇÃO ADMINISTRATIVA , DIREÇÃO , GESTÃO , SISTEMA UNICO DE SAUDE (SUS)` · `PROCEDIMENTO , PLANEJAMENTO , ORÇAMENTO , SISTEMA UNICO DE SAUDE (SUS)`
- **5.905/1973:** `ENFERMAGEM` · `CRIAÇÃO , CONSELHO FEDERAL , CONSELHO REGIONAL , ENFERMAGEM , AUTARQUIA FEDERAL , MINISTERIO DO TRABALHO E DA PREVIDENCIA SOCIAL (MTPS)` · `COMPETENCIA , RECEITA , COMPOSIÇÃO`

### 5.3 Publicação no DOU (campo `publicacoes`, com `temTexto`)

| Norma | Publicação Original | Página/coluna | `temTexto` |
|---|---|---|---|
| Lei 7.498/1986 | DOU de 26/06/1986 | p. 9273, col. 1 | `S` |
| Lei 8.080/1990 | DOU de 20/09/1990 | p. 18055, col. 1 | `S` |
| Lei 5.905/1973 | DOU de 13/07/1973 | p. 6825, col. 1 | `S` |

### 5.4 Normas posteriores / anteriores (`vides` e `edivs`)

- **Lei 7.498/1986** — `vides` (4): Decreto nº 94.406 de 08/06/1987 (id 517046) · Lei nº 8.967 de 28/12/1994 · Lei nº 14.434 de 04/08/2022 · Lei nº 14.602 de 20/06/2023. `edivs` (4, legislação correlata): D.L. 8.778/1946 · Lei 2.604/1955 · Lei 2.822/1956 · Lei 3.640/1959.
- **Lei 8.080/1990** — `vides` (**43**), da Lei nº 8.142 de 28/12/1990 (id 550018) até a Lei nº 15.471 de 20/07/2026 (id 43573921). `edivs` (4): Lei 2.312/1954, Decreto 47.970/1960, Lei 6.229/1975 (revogações) e a **Constituição Federal de 05/10/1988 (id 579494)** como "Declaração de Regulamentação Permanente".
- **Lei 5.905/1973** — `vides` (1): Decreto nº 79.137 de 18/01/1977 (id 501777). `edivs` (1): Lei 2.604/1955 (legislação correlata).

### 5.5 `disps` — mapa de dispositivos alterados (metadado, não texto)

| Norma | Dispositivos mapeados | Distribuição |
|---|---|---|
| Lei 7.498/1986 | 10 | 6 acréscimos · 1 alteração · 3 **acréscimos vetados** |
| Lei 8.080/1990 | 93 | 81 acréscimos · 11 alterações · 6 regulamentações · 4 **acréscimos vetados** · 2 renumerações · 1 revogação · 1 interpretação conforme a CF · 1 dispositivo correlato · 2 sem ref |
| Lei 5.905/1973 | — (`disps` vazio) | — |

> Ponto de atenção jurídico: a API rotula como **"Acréscimo Vetado"** os dispositivos art. 15-D caput e art. 15-E caput+PU da Lei 7.498/1986 (acréscimos das Leis 14.434/2022 e 14.602/2023) e os art. 19-E §§1º-2º e art. 19-G §§1º-A-1º-B da Lei 8.080/1990 (acréscimos da Lei 14.021/2020). A produção **não deve** afirmar vigência desses parágrafos com base nesta fonte; o rótulo deve ser transcrito com fidelity e a redação checada no DOU.

---

## 6. (b) O que a produção pode afirmar — e o que não pode

### 6.1 Lei 7.498/1986 — CONFIRMADO
**Pode afirmar, com esta fonte:**
- Existe e é a **Lei nº 7.498, de 25 de junho de 1986**, tipo *Lei Numerada*, id oficial do Senado **549374**, identificador `LEI-7498-1986-06-25`.
- **Ementa oficial:** "Dispõe sobre a regulamentação do exercício da enfermagem e dá outras providências." Autoria: PL 3.427/1980, Deputado Nilson Gibson.
- **Publicação original:** DOU de 26/06/1986, p. 9273, col. 1.
- **Assunto:** exerce regulação do exercício profissional de enfermagem; a indexação inclui "AUTORIZAÇÃO , EXERCICIO PROFISSIONAL" e "DEFINIÇÃO , PROFISSÃO , ENFERMEIRO , TECNICO , ENFERMAGEM , AUXILIAR DE ENFERMAGEM , PARTEIRA".
- **É alterada por** Decreto 94.406/1987, Lei 8.967/1994, Lei 14.434/2022 (piso salarial) e Lei 14.602/2023 (jornada/repouso) — identificando qual dispositivo cada uma tocou.
- **Regulamentador:** Decreto nº 94.406 de 08/06/1987 (**também confirmado na API**, id 517046, catálogo `" EXERCICIO PROFISSIONAL ."`).
- **Link oficial:** `https://normas.leg.br/?urn=urn:lex:br:federal:lei:1986-06-25;7498` (HTTP 200 verificado nesta ronda).

**Não pode afirmar com esta fonte:**
- O **texto de qualquer artigo** (inclusive o art. 15 sobre os profissionais de enfermagem) — a API não devolve corpo de artigo.
- **Lista/capacitação/salário mínimo, jornada, composição de equipe, responsabilidades** — nada disso está na API; o sumário é uma linha de palavras-chave.
- **Data de vigência** e **regime de revogação** — não há campo de vigência; a API só expõe `publicacoes`, `vides` e `edivs`.
- Que os arts. 15-D e 15-E estejam vigentes — a API os marca como "Acréscimo Vetado".

### 6.2 Lei 8.080/1990 — CONFIRMADO
**Pode afirmar:**
- Existe e é a **Lei nº 8.080, de 19 de setembro de 1990**, *Lei Numerada*, id **549956**, `LEI-8080-1990-09-19`. **Apelido oficial na base:** "Lei Orgânica da Saúde (1990)" — apelido esse, e não "Lei Orgânica do SUS", é o que a fonte registra.
- **Ementa oficial** e **autoria** (Executivo, PL 3.110/1989).
- **Publicação original:** DOU de 20/09/1990, p. 18055, col. 1.
- **Classificação temática:** "Classificação Temática Unificada / Política Social / Saúde".
- **Que institui e disciplina o SUS** — a indexação traz "CRIAÇÃO , SISTEMA UNICO DE SAUDE (SUS)", "OBJETIVO , COMPETENCIA , ORGANIZAÇÃO ADMINISTRATIVA , DIREÇÃO , GESTÃO , SISTEMA UNICO DE SAUDE (SUS)", "PROCEDIMENTO , PLANEJAMENTO , ORÇAMENTO , SISTEMA UNICO DE SAUDE (SUS)" e "RECURSOS FINANCEIROS , SISTEMA UNICO DE SAUDE (SUS)".
- **Que foi alterada por 43 normas posteriores**, com a lista nominal (da Lei 8.142/1990 à Lei 15.471/2026) e quais dispositivos foram tocados (93 dispositivos).
- **Que é regulamentada pela Constituição Federal** (regra de competência no art. 198, via `edivs`).

**Não pode afirmar:**
- **Princípios do SUS, ALC, integralidade, gratuidade, equidade, participação social, financiamento** — nenhum disso está na API.
- **Texto de artigo, capítulo ou princípio.**
- **Data de vigência**, situação de vigência atual, nem a redação consolidada (a base não expõe texto consolidado).
- O **escopo/objeto** da lei além da ementa — a API não devolve o artigo 1º.
- Quantas e quais são as "disposições alteradas" em termos de conteúdo: só se sabe *quais* dispositivos foram alterados e *por qual norma*, não *como ficaram*.

### 6.3 Lei 5.905/1973 — CONFIRMADO
**Pode afirmar:**
- Existe e é a **Lei nº 5.905, de 12 de julho de 1973**, *Lei Numerada*, id **547781**, `LEI-5905-1973-07-12`.
- **Ementa oficial:** "Dispõe sobre a criação dos Conselhos Federal e Regionais de Enfermagem e dá outras providências." Autoria: Executivo, PL 1.126/1973.
- **Publicação original:** DOU de 13/07/1973, p. 6825, col. 1.
- **Que cria o Conselho Federal e os Conselhos Regionais de Enfermagem**; a indexação qualifica o Conselho Federal como **"AUTARQUIA FEDERAL , MINISTERIO DO TRABALHO E DA PREVIDENCIA SOCIAL (MTPS)"** e abrange "COMPETENCIA , RECEITA , COMPOSIÇÃO".
- **Que foi regulamentada pelo Decreto nº 79.137 de 18/01/1977** (id 501777).
- **Link oficial:** `https://normas.leg.br/?urn=urn:lex:br:federal:lei:1973-07-12;5905` (HTTP 200 verificado).

**Não pode afirmar:**
- **Natureza jurídica (autarquia), composição, competência, receita ou estrutura do Cofen/Core** — a indexação nomeia os assuntos, a API não traz o dispositivo que os disciplina.
- **A enumeração de atribuições do Cofen, a relação entre Cofen e Core, nem o sistema de registro/inscrição** — nada disso está aqui.
- Texto de artigo e data de vigência.

### 6.4 Resolução Cofen 736/2024 — NÃO CONFIRMADO NA API
**Pode afirmar:** nada a partir da API do Senado — **a norma não existe no dataset**. Ver secção (c).
**Fora da API (fonte DOU, a marcar como tal):** identificação oficial, ementa e dados de publicação na secção (c).

### 6.5 Portaria GM/MS 6.734/2025 — NÃO CONFIRMADO NA API
**Pode afirmar:** nada a partir da API do Senado — **a norma não existe no dataset**. Ver secção (c).
**Fora da API (fonte DOU, a marcar como tal):** identificação oficial, ementa e dados de publicação na secção (c).

### 6.6 Regra geral aplicável às cinco
> A API do Senado é fonte de **existência, identificação oficial, ementa, publicação no DOU, indexação e mapa de alterações**. Não é fonte de **texto normativo, escopo dispositivo, vigência ou conteúdo** — para esses, o caminho oficial é `normas.leg.br` (leis), DOU/PDF (atos infralegais) e `planalto.gov.br` (CF/88).

---

## 7. (c) Não confirmado / NOT_RUN

### 7.1 Resolução Cofen 736/2024 — NÃO REPRESENTADA NO DATASET DO SENADO

**Motivo:** a API de Dados Abertos Legislativos do Senado **não indexa resoluções de conselhos profissionais**. Não há `id`, não há `catalogo`, não há `urlDocumento`. A ausência **não** decorre de erro de sintaxe — decorre de limite de escopo do corpus (prova na secção 9).

**Comandos exatos tentados** (todos HTTP 200; nos de catálogo, `ListaDocumento.documentos` veio vazio):
```bash
BASE='https://legis.senado.leg.br/dadosabertos'
curl -sL "$BASE/legislacao/lista?tipo=RES&numero=736&ano=2024"          -H 'Accept: application/json'   # -> 0 docs
curl -sL "$BASE/legislacao/lista?tipo=RES&ano=2024"                     -H 'Accept: application/json'   # -> 0 docs
curl -sL "$BASE/legislacao/lista?tipo=REG-n&numero=736&ano=2024"        -H 'Accept: application/json'   # -> 0 docs
curl -sL "$BASE/legislacao/lista?tipo=REG&numero=736&ano=2024"          -H 'Accept: application/json'   # -> 0 docs
curl -sL "$BASE/legislacao/lista?numero=736&ano=2024"                   -H 'Accept: application/json'   # -> 1 doc: MSVP-736 (Mensagem de Veto Parcial) — NÃO é a resolução
curl -sL "$BASE/legislacao/lista?data=20240117"                         -H 'Accept: application/json'   # -> 1 doc: DEC-11883-2024-01-17 — a resolução não está
curl -sL "$BASE/legislacao/urn?urn=urn:lex:br:federal:resolucao:2024-01-17;736"        -H 'Accept: application/json'  # -> 0 docs
curl -sL "$BASE/legislacao/urn?urn=urn:lex:br:federal:cofen.resolucao:2024-01-17;736"  -H 'Accept: application/json'  # -> 0 docs
curl -sL "$BASE/legislacao/urn?urn=urn:lex:br:federal:cofen:resolucao:2024-01-17;736"  -H 'Accept: application/json'  # -> 0 docs
# ronda anterior:
curl -sL "$BASE/legislacao/Resolução/736/2024" -H 'Accept: application/json'   # -> HTTP 404
curl -sL "$BASE/legislacao/RES/736/2024"        -H 'Accept: application/json'   # -> documentos vazio
```
**Controlo positivo do endpoint URN** (prova que o formato da consulta funciona): `urn=urn:lex:br:federal:lei:1986-06-25;7498` → 1 documento (Lei 7.498/1986); `urn=urn:lex:br:federal:lei:1990-09-19;8080` → 1 documento (Lei 8.080/1990).

**Prova negativa fora da API do Senado (LexML, mesmo corpus do normas.leg.br):**
`https://www.lexml.gov.br/urn/urn:lex:br:federal:resolucao:2024-01-17;736` → "Resolver de URN :: urn não encontrada"; idem para a variante `cofen.resolucao`. **A própria base LexML não tem o registro** — por isso o Senado não o expõe.

**Identificação oficial (FONTE: DOU — fora da API do Senado):**
- Título: **Resolução Cofen nº 736, de 17 de janeiro de 2024**
- Órgão emissor: Conselho Federal de Enfermagem (Cofen) — DOU, seção "Entidades de Fiscalização do Exercício das Profissões Liberais/Conselho Federal de Enfermagem"
- Ementa: "Dispõe sobre a implementação do Processo de Enfermagem em todo contexto socioambiental onde ocorre o cuidado de enfermagem."
- Publicação: **DOU de 23/01/2024, Edição nº 16, Seção 1, p. 74**
- URL oficial: `https://www.in.gov.br/web/dou/-/resolucao-cofen-n-736-de-17-de-janeiro-de-2024-539060363`
- Revoga a Resolução Cofen nº 358/2009 (consta da ronda anterior — **não reconfirmado** nesta ronda)
- PDF do Cofen (caminho alternativo registado na ronda anterior): `https://www.cofen.gov.br/wp-content/uploads/2024/01/Resolucao-Cofen-no-736-2024-Dispoe-sobre-a-implementacao-do-Processo-de-Enfermagem-em-todo-contexto-socioambiental-onde-ocorre-o-cuidado-de-enfermagem.pdf`
- **Texto integral: NOT_RUN.** Para o conteúdo dos dispositivos (etapas do Processo de Enfermagem, obrigatoriedade, responsabilidade) é obrigatório ler o PDF do DOU ou do Cofen. **A produção não pode derivar o conteúdo das cláusulas a partir do sumário/título.**

### 7.2 Portaria GM/MS 6.734/2025 — NÃO REPRESENTADA NO DATASET DO SENADO

**Motivo:** a API **não indexa portarias de ministérios** (ver secção 9: tipo `PRT` tem 2 documentos em toda a base, ambos de 1821). A Portaria de Consolidação GM/MS nº 4/2017, que é o ato consolidado que contém a Lista Nacional, **também não está** na API (`/legislacao/Portaria/4/2017` → 0 docs; `lista?tipo=PRT&numero=4&ano=2017` → 0 docs).

**Comandos exatos tentados** (todos HTTP 200; documentos vazio nos de catálogo):
```bash
BASE='https://legis.senado.leg.br/dadosabertos'
curl -sL "$BASE/legislacao/lista?tipo=PRT&numero=6734&ano=2025"      -H 'Accept: application/json'   # -> 0 docs
curl -sL "$BASE/legislacao/lista?tipo=PRT&ano=2025"                   -H 'Accept: application/json'   # -> 0 docs
curl -sL "$BASE/legislacao/lista?tipo=PRT&numero=6734"                -H 'Accept: application/json'   # -> 0 docs
curl -sL "$BASE/legislacao/lista?data=20250318"                       -H 'Accept: application/json'   # -> 3 docs: ADI-7739, DEC-12412, LEI-15113 — nenhuma portaria
curl -sL "$BASE/legislacao/urn?urn=urn:lex:br:federal:portaria:2025-03-18;6734"                       -H 'Accept: application/json'  # -> 0 docs
curl -sL "$BASE/legislacao/urn?urn=urn:lex:br:federal:saude.portaria:2025-03-18;6734"                 -H 'Accept: application/json'  # -> 0 docs
curl -sL "$BASE/legislacao/urn?urn=urn:lex:br:federal:ministerio.da.saude.portaria:2025-03-18;6734"   -H 'Accept: application/json'  # -> 0 docs
# ronda anterior:
curl -sL "$BASE/legislacao/Portaria/6734/2025" -H 'Accept: application/json'   # -> documentos vazio
```

**Identificação oficial (FONTE: DOU — fora da API do Senado):**
- Título: **Portaria GM/MS nº 6.734, de 18 de março de 2025**
- Órgão: Ministério da Saúde — Gabinete do Ministro (assina o Ministro de Estado da Saúde Alexandre Rocha Santos Padilha)
- Ementa: "Altera o Anexo 1 do Anexo V da Portaria de Consolidação GM/MS nº 4, de 28 de setembro de 2017, para incluir a esporotricose humana na Lista Nacional de Notificação Compulsória de Doenças, Agravos e Eventos de Saúde Pública nos serviços de saúde públicos e privados em todo o território nacional."
- Publicação: **DOU de 31/03/2025, Edição nº 61, Seção 1, p. 82**
- Entrada em vigor: na data da publicação (art. 3º) — **NOT_RUN quanto ao texto**, mas confirmado na página do DOU
- URL oficial: `https://www.in.gov.br/web/dou/-/portaria-gm/ms-n-6.734-de-18-de-marco-de-2025-620767223`
- **Texto integral: NOT_RUN.** O **Anexo 1 do Anexo V da Portaria de Consolidação GM/MS nº 4/2017** é onde está a lista propriamente dita (frequência, prazo de notificação por doença). Para a produção, a fonte primária é o DOU/PDF do MS: `https://www.gov.br/aids/pt-br/central-de-conteudo/portarias/2025/portaria-gm-ms-no-6-734-de-18-de-marco-de-2025.pdf` e `https://bvsms.saude.gov.br/bvs/saudelegis/doc_tec/ago_25/Portaria_Tecnica_6734_de_2025.pdf` (ambos confirmados por leitura nesta ronda, **fora da API**).
- Alterações posteriores (Portaria GM/MS nº 10.175/2026 e nº 11.211/2026): constam do registo da ronda anterior — **NÃO reconfirmadas nesta ronda**; verificar no DOU antes de as citar.

### 7.3 Texto integral — NOT_RUN para as cinco normas

| Norma | Caminho oficial para o texto integral | Estado |
|---|---|---|
| Lei 7.498/1986 | `https://normas.leg.br/?urn=urn:lex:br:federal:lei:1986-06-25;7498` (HTTP 200) | NOT_RUN |
| Lei 8.080/1990 | `https://normas.leg.br/?urn=urn:lex:br:federal:lei:1990-09-19;8080` (HTTP 200) | NOT_RUN |
| Lei 5.905/1973 | `https://normas.leg.br/?urn=urn:lex:br:federal:lei:1973-07-12;5905` (HTTP 200) | NOT_RUN |
| Res. Cofen 736/2024 | DOU 23/01/2024, Ed. 16, Seç. 1, p. 74 → `https://www.in.gov.br/web/dou/-/resolucao-cofen-n-736-de-17-de-janeiro-de-2024-539060363` | NOT_RUN |
| Portaria GM/MS 6.734/2025 | DOU 31/03/2025, Ed. 61, Seç. 1, p. 82 → `https://www.in.gov.br/web/dou/-/portaria-gm/ms-n-6.734-de-18-de-marco-de-2025-620767223` | NOT_RUN |

*(Para a CF/88, quando aplicável: `http://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm`.)*

---

## 8. Normas adjacentes (úteis para a produção)

| Norma | id Senado | Estado | Nota |
|---|---|---|---|
| Decreto nº 94.406 de 08/06/1987 | 517046 | **CONFIRMADO** | Regulamentador da Lei 7.498/1986; catálogo `" EXERCICIO PROFISSIONAL ."`; URL `https://normas.leg.br/?urn=urn:lex:br:federal:decreto:1987-06-08;94406` |
| Lei nº 14.434 de 04/08/2022 | 36214460 | CONFIRMADO (ronda anterior) | Altera a Lei 7.498/1986 (acréscimos art. 15-A a 15-D; 15-D marcado "Acréscimo Vetado") |
| Lei nº 14.602 de 20/06/2023 | 37246583 | CONFIRMADO (ronda anterior) | Altera a Lei 7.498/1986 (acréscimos art. 15-E; marcado "Acréscimo Vetado") |
| Lei nº 8.142 de 28/12/1990 | 550018 | CONFIRMADO (ronda anterior) | Altera a Lei 8.080/1990 (as duas leis são o marco do SUS) |
| Portaria de Consolidação GM/MS nº 4/2017 | — | **NÃO no dataset** | Contém o Anexo V (Lista Nacional de Notificação Compulsória) |

---

## 9. Anexo A — Prova de escopo do dataset (por que as duas normas não estão lá)

| Teste | Resultado | Leitura |
|---|---|---|
| `lista?tipo=PRT` (todos os anos) | **2 documentos**, ambos de **1821** (Portaria de 05/05/1821 e de 23/03/1821) | O dataset praticamente não contém portarias |
| `lista?tipo=REG-n` (todos os anos) | **38 documentos**, todos de **1838–1842** (Império) | O dataset não contém regulamentos/resoluções de autarquias modernas |
| `lista?ano=2024` | **1.436 docs**; soma dos tipos por ano = 1.436 (= total, **sem truncamento**) | Tipos presentes: ADCon, ADI, ADO, ADPF, AILEI, APN-n, DEC-n, DLG, DPN, EMC-n, LCP, LEI-n, MPV-ss, MSVP, RCN, RSF. **Nem "Resolução" nem "Portaria"**. |
| `lista?ano=2025` | **1.293 docs**; soma dos tipos = 1.293 | Tipos presentes: ADI, ADO, ADPF, AILEI, APN-n, DEC-n, DLG, EMC-n, LCP, LEI-n, MPV-ss, MSVP, RCN, RSF |
| `lista?ano=2026` | 1.293 docs; 0 portarias | Idem |
| Busca textual por "Portaria"/"notificação"/"Cofen" no ementa e nome dos anos 2024/2025/2026 | **0 ocorrências** relevantes (1 falso positivo: ADI 5.161/2026) | Nenhum rastro |
| `lista?numero=736&ano=2024` | 1 doc: **MSVP-736** (Mensagem de Veto Parcial) | O número 736 em 2024 pertence a outro ato |
| `lista?data=20250318` | 3 docs: ADI 7.739, Decreto 12.412, Lei 15.113 | Nada de portaria em 18/03/2025 |
| `lista?tipo=RSF` / `RCD` / `RCN` | 6.578 / 1.885 / 88 | Só resoluções das Casas do Congresso (Senado, Câmara, Congresso Nacional) — nunca de conselho profissional |

**Conclusão:** o dataset do Senado cobre o Congresso, o Executivo federal (decretos presidenciais) e as normas das casas congressuais. Resoluções de Cofen e portarias de ministérios estão fora do corpus LexML ingerido — a omissão é **estrutural**, não sintática.

---

## 10. Anexo B — Reprodução

```bash
# FASE 1 — catálogo
BASE='https://legis.senado.leg.br/dadosabertos'
curl -sL "$BASE/legislacao/lista?ano=2024" -H 'Accept: application/json' > cat_2024.json
curl -sL "$BASE/legislacao/lista?ano=2025" -H 'Accept: application/json' > cat_2025.json
curl -sL "$BASE/legislacao/lista?tipo=PRT"   -H 'Accept: application/json' > prt_todos.json
curl -sL "$BASE/legislacao/lista?tipo=REG-n" -H 'Accept: application/json' > regn_todos.json

# FASE 2 — extração
curl -sL "$BASE/legislacao/LEI/7498/1986" -H 'Accept: application/json' > lei7498.json   # id 549374
curl -sL "$BASE/legislacao/LEI/8080/1990" -H 'Accept: application/json' > lei8080.json   # id 549956
curl -sL "$BASE/legislacao/LEI/5905/1973" -H 'Accept: application/json' > lei5905.json   # id 547781
curl -sL "$BASE/legislacao/549374"        -H 'Accept: application/json' > lei7498_porid.json
curl -sL "$BASE/legislacao/549956"        -H 'Accept: application/json' > lei8080_porid.json
curl -sL "$BASE/legislacao/547781"        -H 'Accept: application/json' > lei5905_porid.json
curl -sL "$BASE/legislacao/DEC/94406/1987" -H 'Accept: application/json' > dec94406.json

# Negativos (com controlo positivo)
curl -sL "$BASE/legislacao/urn?urn=urn:lex:br:federal:lei:1986-06-25;7498" -H 'Accept: application/json'  # -> 1 (controlo)
curl -sL "$BASE/legislacao/urn?urn=urn:lex:br:federal:resolucao:2024-01-17;736" -H 'Accept: application/json' # -> 0
curl -sL "$BASE/legislacao/urn?urn=urn:lex:br:federal:portaria:2025-03-18;6734"  -H 'Accept: application/json' # -> 0
```
> **Não usar `palavras=` no `lista`:** o parâmetro não existe no OpenAPI v3 e é silenciosamente ignorado, devolvendo o catálogo do ano inteiro.

---

## 11. Anexo C — Artefatos

- `normativos_federais.json` — Consolidado: 3 normas confirmadas (metadados completos) + 2 normas não confirmadas (com comandos tentados e identificação externa rotulada) + adjacentes.
- `extracao_confirmadas.json` — Extração FASE 2 das três leis.
- `raw/` — 41 respostas cruas da API + `tiposNorma`/`apidocs` da ronda anterior.
- `fase1_redo.sh` — Script das consultas de catálogo.

**Fonte:** Senado Federal — Dados Abertos Legislativos (legis.senado.leg.br/dadosabertos). Dados externos de apoio (DOU/LexML/MS), explicitamente rotulados como fora da API.
