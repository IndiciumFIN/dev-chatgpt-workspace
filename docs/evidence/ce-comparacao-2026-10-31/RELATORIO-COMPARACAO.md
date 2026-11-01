# Síntese comparativa — esqueleto CE × produção × repo público × normativos × plataformas

**Frente:** `sintese-comparativa` · **Agente:** General · **Data:** 2026-11-01
**Entregáveis lidos (6/6, nenhum em falta):** `producao-conta-funil` · `producao-superficie-busca` · `repo-publico-branches` · `normativos-enfermagem` · `normativos-federais` · `benchmarks-plataformas`
**Packs primários verificados:** `/workspace/evidence_pack/E1-producao.md` · `E2-repo-branches.md` · `E3-normativos.md` · `E4-benchmarks.md` · `E5-esqueleto.md` · `branches-publicas.json` · `branches-todas.json`

---

## 0. Como ler este relatório

### 0.1 Marcação de origem

| Marca | Significado |
|---|---|
| `[E1]`…`[E5]` | `evidence_pack/`, porção original do briefing. É a fonte de referência primária; quando um entregável upstream a contradiz, isso é registado como contradição (secção 7), não absorvido. |
| `[P-CF]` | `outputs/producao-conta-funil/deliverable.md` (rev. 3, 01/11) |
| `[P-SB]` | `outputs/producao-superficie-busca/deliverable.md` (01/11) |
| `[P-RP]` | `outputs/repo-publico-branches/deliverable.md` (01/11) |
| `[P-NE]` | `outputs/normativos-enfermagem/deliverable.md` (rev. 2, 01/11) + `capturas-2026-11-01/` |
| `[P-NF]` | `outputs/normativos-federais/deliverable.md` (01/11) + `raw/`, `normativos_federais.json`, `extracao_confirmadas.json` |
| `[P-BP]` | `outputs/benchmarks-plataformas/deliverable.md` (rev. 3, 01/11) |
| `[V]` | **Verificação própria desta síntese**, 2026-11-01, contra ficheiros locais e capturas com hash. É o nível mais forte de evidência deste relatório quando `[V]` está presente. |
| `NOT_RUN` | Medição não executada. Sempre acompanhada do motivo. Ausência de medição **não** é prova de ausência. |

### 0.2 Escala de confiança

| Nível | Critério |
|---|---|
| **Alta** | Verificável por hash (SHA-256 conferido), por leitura directa do código/JSON local, ou por texto de página real com registo de integridade. |
| **Média** | Inferência forte a partir de nome de branch ou de registo canónico; ou texto de página real sem hash verificável no repositório comum. |
| **Baixa** | Heurística por classificador (contagem por palavra-chave), ausência não verificada, ou extrapolação. |

### 0.3 Regras duras aplicadas neste relatório

1. **Guest-first e Clinical Safety são requisitos**, não sugestões. Onde um eixo os contradiz, o veredito diz isso, não o suaviza.
2. **Nenhum `promotion`, `ADMITTED` ou `WO` é prometido** por este relatório. Promoção exige FIND → política → validador → WO → OPA → Kernel → testes → auditoria → decisão humana `[E5]`.
3. **Nenhum número aparece sem fonte.** Onde a fonte não existia, a linha está `NOT_RUN`.
4. **Divergência gera FIND**, nunca substituição silenciosa `[E3]`.
5. **Nome de branch prova que existiu trabalho nessa frente**; não prova o que a branch contém nem que o problema foi resolvido.

---

## 1. Resumo executivo

O esqueleto CE está **sub-especificado em entrega e sobre-especificado em vocabulário**, e a produção está **o exacto oposto**: cobre quase tudo o que o esqueleto declara e não cobre nada do que o esqueleto ainda não declarou. Os dois extremos não se encontram em lado nenhum.

Três números sustentam o veredito, todos verificados por mim contra os ficheiros locais `[V]`:

- **201 capabilities em 20 famílias, 100 % `CANDIDATE`**; **16 tipos de objecto, 190 ligações capability↔objecto, 190 com `support: PROPOSED`** — nenhuma relação capability↔objecto está aprovada `[V]`.
- **410 entradas de catálogo de serviço** (45 famílias; 274 DOMAIN · 97 PLATFORM · 39 CROSS_CUTTING) — das quais **305 são `LOGICAL_SERVICE` e 105 são `EXPERIENCE_CAPABILITY_GROUP`**; 100 % `CANDIDATE_HOLD`. **2 dos 10 módulos canónicos existem** (`resolver.ts`, `state.ts`); 3 dos 16 tipos de objecto têm schema; **`Norm` não tem schema** `[V]`.
- **182 refs no repositório público** (181 branches + `main`) `[P-RP]`; **137 (76 %) são churn de agente** (`fix`+`codex`+`copilot`+`refactor`) `[P-RP]`; na amostra de 30 branches, **17 não fundidas, 7 com conteúdo órfão, 1.524.448 bytes** `[P-RP]` (medido pelo owner com `git for-each-ref` e `merge-base --is-ancestor` — 9 das 10 baselines fundidas em `main`, 1 não).

O eixo clínico é o mais grave e o mais bem documentado: a **divergência Aldrete (corte de 9 pontos no site contra "8 pontos ou mais" do Parecer CFM 28/2020) está provada com fonte primária e SHA-256 em mãos** `[P-NE]` `[V]`; a **Lista Nacional de Notificação Compulsória é servida em versão superada** (as páginas ancoram em 10.175/2026; a última alteração é 11.211/2026, que renumera os itens: item 4 = Anomalias Congénitas, item 5 = Botulismo) `[P-NE]` `[V]`. O esqueleto não tem, em schema nenhum, onde colocar `edition`, `effectiveFrom`/`effectiveUntil`, `pinpoint` ou `rights` por campo.

O eixo de conta/monetização é o mais volumoso e o menos modelado: **a frente mais trabalhada do produto (conta→login→cobrança→entitlement→ads) não tem uma única família transversal no esqueleto** — só existe `owner_scope: ACCOUNT` como campo de estado `[P-CF]` `[P-SB]`. E a frente do repo mostra que essa superfície está em churn pesado **não fundido** — 4 variantes de `audit/billing-ads-*` e 2 de `base44/setup-*` carregam 970 KB + 520 KB de órfãos, e o conteúdo órfão é precisamente o directório `SISTEMA_DE_LOGIN_DO_SITE/` `[V]`.

Duas frentes mediram a mesma coisa com números diferentes: **86/182 (47 %)** `[P-CF]` contra **114/181 (63 %)** `[P-RP]` de branches no núcleo conta→cobrança→ads. É diferença de classificador, não de dado (secção 7, C-01).

**Veredito em uma linha:** o esqueleto não está errado — está **incompleto nas duas pontas que a produção já provou** (identidade/monetização e autoridade normativa), e **excesso na ponta que ninguém provou** (12 capabilities de colaboração, sync multi-dispositivo, TTS); corrigir isso agora exige **20 alterações estruturais** (a-01…a-20) e **zero mudança de oferta comercial**.

### 1.1 O veredito por eixo

> Contagem de deltas por eixo: cada delta é classificado numa categoria **(a)/(b)/(c)/(d)** e pode ser cortado por mais de um eixo. Os totais por categoria são (a) 20 · (b) 17 · (c) 13 · (d) 6 — ver §8.

| Eixo | Estado do esqueleto face à produção | Risco dominante | Deltas que o tocam |
|---|---|---|---|
| Conta / monetização / ads | **Ausente** — só `owner_scope` como campo | Dark pattern: cliente paga e não acede (6+ branches de `premium-access-root-cause`) | a-01…a-07 · b-01…b-04 · c-01…c-06 · d-01, d-02 |
| Superfície clínica e de conteúdo | **Declarada, sem contrato** — 13 dos 16 objectos sem schema | Clinically misleading: forma canónica sem versão, fonte nem disclaimer | a-08…a-10, a-16, a-17 · b-05…b-10, b-17 · c-07, c-08 |
| Autoridade normativa | **Incapaz de suportar** — sem `Norm`, sem `edition`, sem `vigência` | Divergência Aldrete e lista de notificação servida em versão superada | a-09…a-15 · b-11…b-16 · c-09, c-10, c-11 |
| Repo público / branches | **Não é fonte para o esqueleto** — 76 % churn, 7 branches órfãs | Perda de conteúdo: 1.524.448 B órfãos | a-18, a-19 · c-12 · d-01, d-02, d-04, d-05 |
| Plataformas de referência | **100 % em nome, 0 % em código** | Construir vocabulário antes de ter conteúdo | b-01…b-05, b-17 · c-06 · d-03, d-06 |

---

## 2. Matriz de cobertura: as 6 frentes → as secções deste relatório

> Requisito do contrato: cada frente upstream tem de estar representada por secções identificáveis do relatório final. A tabela é o mapa; a coluna "linhas da TABELA-MESTRE" diz onde o conteúdo de cada frente entra.

| # | Frente upstream | Entregável | Evidência primária que ela produziu | Secções deste relatório que a absorvem | Linhas da TABELA-MESTRE | Achados que só ela viu |
|---|---|---|---|---|---|---|
| **F1** | `producao-conta-funil` | `outputs/producao-conta-funil/deliverable.md` (rev. 3) | Texto renderizado de 5 rotas `.html` por `web_fetch` + indexação de busca de `/politica.html`, `/politicaapp.html`, `/termos.html`, `/reembolso.html`, `/downloads.html`, `/objetivo.html`, `/mapa-do-site.html`; `branches-todas.json` (182) | §4 (linhas **A-1…A-9**, **B-7**), §5 (L-05, L-06, L-13, L-14), §6.1, §7 (C-01, C-05, C-09, C-13), §8 (a-01…a-07, b-01…b-04, c-01…c-06), §9.1 | 10 | Guest-first **por camada** (L1 conteúdo vs. L2/L3 identidade/dinheiro); 3 tensões reais entre promessa publicada e comportamento; o registo **anterior** da conta como *escopo* mas não como *entrada*; a produção já tem taxonomia de eventos GA4 que o esqueleto não conhece |
| **F2** | `producao-superficie-busca` | `outputs/producao-superficie-busca/deliverable.md` | Leitura directa de `catalog/capability-registry.candidate.v0.1.json`, `object-capability-binding.candidate.v0.1.json`, `service-catalog.v1.json`, `schemas/` | §4 (linhas **B-1…B-8**), §5 (L-03, L-04, L-15, L-16), §6.2, §7 (C-02, C-03, C-07), §8 (a-08, a-10, b-06…b-10, b-17), §9.1 | 8 | **Não existe campo `service_ref` em nenhuma camada**: 236/410 serviços (57 %) sem capability mapeável, 49/201 capabilities (24 %) sem serviço, por heurística de tokens; as famílias `evidence-claims` (9 serviços, com `authority-binding` e `contradiction-detection`) e `community` (12 serviços, com `moderation` e `abuse-report`) estão **inteiras sem capability**; a máquina de simulados de concurso (9 serviços `selections`) existe e não é alcançável |
| **F3** | `repo-publico-branches` | `outputs/repo-publico-branches/deliverable.md` | `git for-each-ref` sobre o clone bare (182 refs); `branch-orphan.tsv` (30 branches) | §4 (linhas **D-6**, **D-7**), §5 (L-05, L-06, L-11), §6.3, §6.6, §7 (C-01, C-04, C-12), §8 (a-18, a-19, c-12, d-01, d-02, d-04, d-05) | 2 | 137/181 branches (76 %) são churn de agente; **7 branches com 1.524.448 bytes órfãos** (970 KB em `audit/billing-ads-*`, 520 KB em `base44/setup-*`) cujo conteúdo é `SISTEMA_DE_LOGIN_DO_SITE/`; 8 branches `backup/*` são baseline e **não podem ser apagadas**; 4 variantes de ads/billing em paralelo (dois "últimos" concorrentes) |
| **F4** | `normativos-enfermagem` | `outputs/normativos-enfermagem/deliverable.md` (rev. 2) + `capturas-2026-11-01/` (36 ficheiros, SHA-256) | 6 fontes primárias capturadas (PN COFEN 1/2024, Res. 736/2024, Res. 564/2017 + Anexo, Res. 545/2017, Parecer CFM 28/2020, Portaria GM/MS 6.734/2025) + 4 HTML oficiais + capturas da produção | §4 (linhas **C-1…C-7**), §5 (L-01, L-02, L-07, L-08, L-11, L-17), §6.4, §7 (C-04, C-06, C-10, C-13, C-16), §8 (a-09…a-16, b-11…b-16, c-09…c-11), §9.2 | 7 | Divergência Aldrete **provada** com a fonte primária; lista de notificação em versão superada (11.211/2026 remove covid-19, inclui caxumba e oropouche, renumera itens); NANDA/NIC sem edição e **direitos protegidos (Thieme) → HOLD**; Anexo do Código de Ética é PDF de imagem pura (OCR sem revisão); `tool-sources.v1.json` (6 fontes) e `tool-bindings.v1.json` (78 itens) **não validam** contra os enums canónicos (6/6 e 46/78 fora) e todos os `sha256` são 64 zeros |
| **F5** | `normativos-federais` | `outputs/normativos-federais/deliverable.md` + `raw/` (41 respostas) | API de Dados Abertos do Senado: catálogos integrais 2024 (1.436 docs) e 2025 (1.293 docs), 2 rotas por lei, 11 + 8 estratégias negativas | §4 (linhas **C-2**, **C-6** — partilhadas com F4), §5 (L-09, L-10), §6.5, §7 (C-06, C-12), §8 (a-10, b-13), Anexo B.3 | 2 | O dataset do Senado **cobre o Congresso e o Executivo federal e não cobre normas infralegais de autarquia** — prova de escopo: tipo `PRT` = 2 documentos em toda a base (ambos de 1821), tipo `REG-n` = 38 (1838–1842); o `catalogo` devolvido **é uma linha de palavras-chave, não sumário**; Lei 8.080/1990 tem 43 `vides` e 93 dispositivos alterados (a edição vigente em 2026 não é a de 1990); parágrafos marcados "Acréscimo Vetado" não podem ser afirmados como vigentes |
| **F6** | `benchmarks-plataformas` | `outputs/benchmarks-plataformas/deliverable.md` (rev. 3) | 20 capacidades de benchmark (Raindrop, Readwise, Zotero, Airtable, Linear, Notion, Figma) + 6 fontes de concorrência BR, todas com URL e data | §4 (linhas **D-1…D-5**, **B-2**, **B-6**), §5 (L-12, L-13, L-14), §6.5, §6.6, §7 (C-07, C-08, C-14), §8 (b-01…b-05, b-17, c-12, d-03, d-06), §9.1, §9.2 | 5 | **0 das 20 capacidades de benchmark têm implementação**; o valor para o enfermeiro não está em "coleções" mas em **ficha impressa com versão, faixa e corte adoptada**; 4 capacidades **não transferíveis** (TTS, collaboration/shared views, sync multi-dispositivo, web-archive) por colidirem com a promessa "sem cadastro"; 19 eventos canónicos já definidos no plano + 4 propostos; concorrência BR já entrega referência + disclaimer + gratuidade |

### 2.1 Linhas transversais sem dono exclusivo

| Linha | Conteúdo | Frentes que alimentam |
|---|---|---|
| T-1 | Guest-first é do **escopo do conteúdo** (L1), não do produto inteiro (L2/L3) | F1 (medição) + F6 (arquitetura) + F4 (safe defaults) |
| T-2 | `owner_scope: ACCOUNT` é o único ponto de contacto real entre produção e esqueleto | F1 + F2 + F3 |
| T-3 | Ausência de `service_ref` é a **causa-raiz comum** de 236 serviços inalcançáveis, 8 objectos sem schema e 9 serviços de concurso órfãos | F2 (medição) + F4 (consequência clínica) + F6 (consequência de plataforma) |
| T-4 | "Favorito" significa três coisas diferentes (visita / atalho /colecção persistida) | F1 + F2 + F6 |
| T-5 | O produto **já tem telemetria** (GA4 + Edge Function, 11 famílias de eventos) mas o esqueleto não conhece nenhum nome de evento | F1 + F6 |
| T-6 | Conteúdo órfão real no repo = o sistema de login/pagamentos que o esqueleto não modela | F3 + F1 |

---

## 3. Estado de evidência das 6 frentes (o que existe, o que não existe)

| Frente | Base de evidência | Integridade | Cobertura | Lacuna estrutural |
|---|---|---|---|---|
| F1 `producao-conta-funil` | Texto renderizado de 5 rotas por `web_fetch` + indexação de busca de 8 rotas | **Sem hash.** Não há SHA-256 nem registo de captura partilhado | 15 linhas de Tabela 1 + 9 elos de cadeia | `/login`, `/assinatura`, `/premium` devolveram `file load failed` → conteúdo da conta e preço **NOT_RUN** `[P-CF]` |
| F2 `producao-superficie-busca` | Leitura directa dos 3 catálogos + 3 schemas | N/A (ficheiros locais versionados) | 8 categorias de superfície + 15 capabilities de valor | Mapeamento serviço↔capability **não existe**; a medição 236/49 é heurística de tokens, declarada como tal `[P-SB]` |
| F3 `repo-publico-branches` | `git for-each-ref` sobre clone bare + `branch-orphan.tsv` | Clone local; **conferência de 0 divergências** entre lista oficial e clone | 182 refs, 181 branches, tema e classe por nome | Teste de órfão **só em 30 de 181**; conteúdo de branch **não lido**; estado "merged" das 151 restantes **NOT_RUN** `[P-RP]` |
| F4 `normativos-enfermagem` | 36 ficheiros capturados | **`sha256sum -c SHA256SUMS.txt` → 36/36 OK** `[V]` | 15 afirmações normativas × 4 perguntas da doutrina | `tool-sources.v1.json` e `tool-bindings.v1.json` **não existem neste sandbox** → as medições 6/6 e 46/78 são **reportadas, não re-verificadas aqui** `[V]` |
| F5 `normativos-federais` | 41 respostas cruas da API + 2 artefactos JSON | Re-execução byte-a-byte equivalente à ronda anterior `[P-NF]` | 5 normas + 8 adjacentes + prova de escopo | Texto integral das 5 leis: **NOT_RUN** (a API não devolve corpo de artigo) `[P-NF]` |
| F6 `benchmarks-plataformas` | 20 capacidades de benchmark + 6 concorrentes BR | URL + data em cada afirmação de mercado | 20 linhas × 6 colunas + 6 gaps ordenados | `npm test` / `npm run build` / gate **não executados** por esta frente `[P-BP]`; a11y e uso em produção **NOT_RUN** |

**Achado de rastreabilidade que nenhum dos seis entregáveis isolou:** as duas frentes de produção **não partilham base de evidência**. F1 leu `/politica.html`, `/termos.html`, `/forum-enfermagem.html`, `/news.html`, `/conteudos_da_pagina.html`, `/metricas.html`; F4 capturou com hash `prod_*.html` das páginas normativas e `prod_sitemap.xml` — **mas nenhuma página de F1 está no pacote de capturas de F4** `[V]`. As duas capturas da produção são **disjuntas**. Consequência: as tensões T1–T3 de F1 (`[P-CF]` §7) **não têm hash verificável** e as afirmações normativas de F4 **não têm leitura directa do conteúdo legal do site**. Isto é um delta (**a-20**).

---

## 4. TABELA-MESTRE comparativa

> **Nota sobre o contrato de colunas.** O briefing pede "4 colunas" mas enumera sete campos. Leitura adoptada: a **tabela 4.1** é a TABELA-MESTRE com os **7 campos enumerados** (elemento + 5 eixos de comparação + veredito/ação). A **tabela 4.2** é a **versão de 4 colunas** exigida, que agrupa os eixos: `Elemento | Estado real (produção + repo) | Declara/obriga (esqueleto + normativos) | Referência + veredito + ação`. Nenhuma informação da 4.1 é perdida na 4.2; a 4.2 é a leitura de 4 colunas, a 4.1 é a evidência.
>
> **Três blocos:** A = conta, identidade e monetização · B = superfície clínica e de conteúdo · C = autoridade normativa e segurança clínica · D = experiência, plataforma e governança do repo.

### 4.1 TABELA-MESTRE (7 campos)

| # | Elemento | Produção `www.calculadorasdeenfermagem.com.br` | Repo público / branches | Esqueleto CE — o que declara | Normativos — o que obriga | Plataformas — referência | Veredito + ação |
|---|---|---|---|---|---|---|---|
| **A-1** | **Acesso guest sem login** (usar a calculadora, ler, imprimir a própria escala) | **Confirmado.** `/objetivo.html`: "o usuário insere os dados solicitados e a calculadora realiza automaticamente as fórmulas"; `/politicaapp.html`: "não exige a criação de contas, login" `[P-CF]` | Nenhum ramo Guest; a branch mais próxima é `chatgpt/login-google-email-only-20261004` @ `952d4303` `[V]` | `owner_scope: SESSION` / `LOCAL_DEVICE`; `state.ts` com `GUEST_SCOPES = [SESSION, LOCAL_DEVICE]`; `resolver.ts` **nunca devolve PASS** `[E5]` `[V]` | Doutrina canónica: 4 perguntas separadas, uso proporcional; `authorityBinding` por campo para conteúdo clínico `[E3]` `[P-NE]` §5 | Zotero/Raindrop: objeto persistido por conjunto; Notion: Home sem conta; Readwise: login opcional | **Coincide — o guest-first está certo no núcleo clínico.** Manter. É a decisão de arquitetura que sustenta o posicionamento "sem cadastro" `[P-BP]` §3. **Nenhuma ação de estrutura.** Guest-first é requisito duro: proibido introduzir login no caminho L1. |
| **A-2** | **Minha Conta** (login Google + e-mail, favoritos, histórico, "recursos exclusivos") | **Existe.** Promessa: "Acesse sua conta para salvar favoritos, acompanhar seu histórico e desbloquear recursos exclusivos"; campos "Entrar com Google" / "Entrar com E-mail" + "Nome completo" `[P-CF]` T1.4 | 40 branches de tema conta/login/auth; `fix/corrigir-auth-core-listeners` @ `89676a5c`, `fix/auth-menu-dropdown-bootstrap` @ `4c440848`, `fix/profile-page-hang` @ `46b81f0b`, `fix/premium-sw-template-auth-bypass` @ `628ecab2` `[V]` | **Só o escopo**: `owner_scope: ACCOUNT` como campo. Sem família de serviço, sem schema de conta, sem `Identity` `[P-CF]` T1.5, `[P-SB]` §2.1 | Não obriga nada sobre autenticação; obriga que qualquer dado de conta tenha base legal e retenção (LGPD art. 5 II, art. 11) `[P-BP]` §7 | Airtable/Notion: identidade só quando o valor é partilhado ou institucional | **Divergência de UUa** — o esqueleto tem o *escopo* e não tem a *entrada*. **a-01** (declarar `Identity/Account` transversal) + **b-01** (nunca admitir `ACCOUNT` sem backend) + **c-01** (a promessa da conta é vinculante?) |
| **A-3** | **Assinatura Premium / paywall** | **Existe.** "Para baixar e imprimir, assine o plano Premium"; CTA "Assine já" `[P-CF]` T1.2 | `chatgpt/assinatura-layout-20261004` @ `52f5673f`; `feat/premium-sem-anuncios-canonico` @ `4a1af310`; `refactor/contas-free-premium` @ `573a7267`; `fix/premium-simulados-shell-boundary-2026-09-20` @ `7677616c` `[V]` | **Ausente.** Nenhum objecto, capability, schema ou família para plano/tier `[P-SB]` Tabela 1 | Sem obrigação; o simulado de notificação é "gratuito" mas o conteúdo dos simulados premium **não foi lido** `[P-NE]` §7.6 | N/A — não há benchmark de paywall entre os 7 estudados | **Ausente.** `Entitlement` como família transversal é **a-02**. Preço e conteúdo do plano são **NOT_RUN** (`/assinatura` → `file load failed`) e são **c-02** |
| **A-4** | **Checkout / pagamento** (Asaas BR + Stripe internacional) | **Dois PSPs activos** `[P-CF]` T1.6 | `chore/sync-asaas-checkout-v106` @ `a6f90c53`; `fix/asaas-checkout-customer-data` @ `09cd4236`; `fix/international-stripe-checkout` @ `feddc068`; `codex/stripe-premium-3-usd-eur` @ `839e42f8`; `fix/premium-payments-asaas-stripe-20260913` @ `30be2e4e`; `codex/asaas-immediate-first-card-charge` @ `32a73aed`; `codex/fix-asaas-date-first-payment` @ `b35e0e5c` `[V]` | **Ausente.** Nenhum objecto de pagamento `[P-CF]` T1.6 | Sem obrigação | N/A | **Ausente.** Duas ordens canónicas de cobrança = risco de dupla cobrança. **c-03** (uma só ordem canónica) + **d-01** (portar código de checkout sem modelo de entitlement é proibido) |
| **A-5** | **Entitlement** (acesso resolvido) | **Existe e já falhou 6+ vezes:** ramos `fix/premium-access-{bootstrap,canonical-resolution,root-cause,root-cause-2}`, `fix/billing-access-empty-entitlement` @ `914e3127`, `fix/premium-entitlement-readonly` @ `18a83cc8`, `fix/premium-asaas-webhook-reconciliation` @ `a249a1c5`, `fix/premium-homologation-gates` @ `707b1a29`, `sanitize-premium-access-2026-09-20` @ `3b0c72ac` `[V]` | Idem — a lista de ramos acima é a evidência de repo | `resolver.ts` devolve estados, **sem plano, sem tier, sem reason code** `[P-CF]` T2.8 | Sem obrigação directa | N/A | **Divergência máxima.** É o conceito central do produto e não existe no modelo. **a-03** (reason codes: `guest`/`sem_plano`/`pagamento_pendente`/`verificando`/`ativo`/`expirado` — o estado "verificando" está provado em produção por `fix/account-subscription-verifying-state` @ `40c5d466`) + **a-04** (regra dura: entitlement só com `owner_scope = ACCOUNT`) |
| **A-6** | **Ads** (free vê anúncio, Premium "sem anúncios") | **Existe.** `[P-CF]` T1.7 | `feat/ads-controlado` @ `b158baa9`; `fix/ads-free-users-20260914` @ `45ac64e4`; `codex/fix-medicamentos-premium-ads-governance` @ `51bde38c`; `fix/premium-ads-build-order` @ `9903d4c0`; `feat/premium-ad-free` @ `4ea9b025`; `codex/teste-anuncios-formularios` @ `572a28ad` `[V]` | **Ausente.** Nenhum objecto, capability ou serviço `[P-SB]` §2.1 | Sem obrigação; risco de dark pattern se o entitlement vier vazio | N/A | **Ausente.** Se o entitlement resolver vazio, o cliente pago vê anúncio. **c-04** (ads para free: aceitável junto de conteúdo clínico?) + **d-02** (não portar as duas políticas de ads em paralelo — há duas: `audit/billing-ads-hardening-clean-20260914` fundida vs. `feat/ads-controlado`) |
| **A-7** | **Sessão / device / persistência local** | "Armazenados apenas no cache do seu computador" (`/fugulin.html`); "descartados assim que o aplicativo é fechado" (`/politicaapp.html`) `[P-CF]` T1.10 | `chatgpt/sync-menu-auth-layout-locales-20261004` @ `4adc5719`; `fix/localized-account-routes-20260929` @ `1af76730`; `refactor/contas-internacional-fase1..10` | `owner_scope: SESSION` / `LOCAL_DEVICE` canónicos; **FIND: `ToolViewBar` grava configuração em `sessionStorage`** (volátil, por aba) `[E2]` `[P-CF]` T2.2 | LGPD: estado local não sai do device — é o activo de posicionamento `[P-BP]` §3 | Readwise/Figma: sessão e estado local como primeiro nível | **Coincide na semântica, divergente na prática.** `SESSION` (aba) ≠ `LOCAL_DEVICE` (máquina). **a-05** (desambiguar `SESSION` vs `LOCAL_DEVICE` no metamodelo) |
| **A-8** | **"Sync"** | "sync" em produção = **reconciliação de webhook / entitlement**, não dados de utilizador `[P-CF]` T2.4 | `chore/sync-asaas-checkout-v106` @ `a6f90c53`; `sync-premium-main-2026-09-20` @ `c234ff53` | `sync_support` declarado; sync de dados de utilizador é gap P1/P2 não implementado | Sem obrigação | Readwise: sync multi-dispositivo | **Divergência de vocabulário — perigosa.** A mesma palavra, dois objectos. **a-06** (`sync_entitlement` vs `sync_user_data`) + **c-05** (o CE local terá backend?) + **d-03** (sync multi-dispositivo fora de âmbito agora: colide com a promessa "sem cadastro" e transforma estado local em dado de saúde) |
| **A-9** | **Telemetria / métricas / eventos** | **Já existe.** `/metricas.html`: GA4 `522498030` via **Supabase Edge Function**, 11 famílias de eventos (`page_view`, `session_start`, `first_visit`, `user_engagement`, `scroll`, `click_menu_*`, `click_calcular_*`, `tempo_permanencia`, `subscription_checkout_*`, `subscription_payment_*`), auto-refresh 60 s `[P-CF]` T1.8 | `feat/metricas-ga4-dashboard` @ `e2571cb3`; `fix/analytics-metrics-deploy` @ `7327a655`; `copilot/configure-performance-monitoring` @ `34d56b0f` `[V]` | `telemetry_contract` é **string**, não contrato; Event Backbone P1 ausente `[E5]` item 7 | LGPD art. 5 II: evento correlacionado com checkout é identidade `[P-CF]` T1.8 | Linear/Notion: telemetria é pré-requisito de decisão | **Divergência de UUa.** O produto já tem os nomes de evento e o esqueleto não conhece nenhum. **a-07** (reescrever `telemetry_contract` como contrato, usando os nomes já em produção) + **b-02** (`events.ts` P1→**P0**, com o desvio justificado em `[P-BP]` G1) + **c-06** (o dashboard público de país/cidade é compatível com a política de privacidade?) |
| **B-1** | **Biblioteca "+400 conteúdos"** | **Existe.** Protocolos, artigos, PDFs, materiais clínicos `[E1]` | Pipeline de conteúdo no `main` público: `package.json` tem scripts `biblioteca`, `blog` e dependências `@babel/*`, `cheerio`, `axios`, `canvas`, `@google-cloud/aiplatform` `[E2]` | `Article` (20 caps), `LibraryEntity` (17), `Guide` (14), `MediaAsset` (7); schemas para **só 2** (`Article`, `LibraryEntity`) `[V]` `[P-SB]` Tabela 1 | Todo objecto com afirmação normativa precisa de `authorityBinding`; `Article` só tem `sourceRefs: string[]` e `rights` de status livre `[P-NE]` §5.1 `[V]` | Readwise: inbox unificado com imports | **Coberto na forma, contrato parcial.** **a-08** (`Article.sourceRefs` → `reference.schema.json` com `pinpoint`/`accessed_at`/`rights_status`) + **b-03** (schema `Guide` e `MediaAsset`) |
| **B-2** | **Escalas assistenciais em branco para imprimir ("+60")** | **Existe** — a **única superfície offline já em produção** `[P-BP]` G2 | `codex/escala-12x36-previa-tutorial` @ `41bf38e1`; `codex/previas-200dpi-pt-en-es` @ `53d3dfb0`; `codex/previas-tamanho-natural` @ `c7f9b404`; `codex/proteger-visualizador-pdf` @ `75c7dd7e` `[V]` | `CAP-PRINT`, `CAP-DOWNLOAD`, `CAP-OUTPUT` declarados; `output.ts` (P0) **ausente**; `profile-contracts.output` **vazio por decisão** `[P-SB]` `[P-BP]` | Todo PDF de saída tem de exibir versão, faixa e **fonte do corte** `[P-BP]` G2 | Airtable/Notion: output como objecto, não como efeito colateral | **Gap de runtime.** **b-04** (`output.ts` = ficha imprimível com versão + faixa + fonte do corte). Diferenciador comprovado contra `educapes.capes.gov.br` e `rosaclinica.com.br` `[P-BP]` §6 |
| **B-3** | **Calculadoras clínicas (16+, 12 categorias)** | **Existe.** Balanço Hídrico, Gotejamento, Gasometria, IMC, Insulina, Fármacos, Idade Gestacional, NEWS, SAEP, SBAR…; 12 hubs (Medicamentos, Gotejamento, Hemodinâmica, Ventilação, Pediatria, Neonatologia, Obstetrícia, Nefrologia, Nutrição, Queimaduras, UTI, Emergência) `[E1]` | `codex/governanca-clinica-gasometria` @ `f82b28ea`; `codex/governanca-fugulin-dimensionamento` @ `0522c0e0`; `codex/governanca-medicamentos-gotejamento` @ `185fd8eb`; `fix/clinical-calculators-audit-2026-09` @ `61fecc4d` `[V]` | `ClinicalTool` (21 caps) — **único tipo com `authorityBinding` no schema**; `CAP-CALC-STEPS`, `CAP-LAST-INPUTS`, `CAP-SAVE-RESULT` | `authorityBinding` por **campo** (fonte + pinpoint + edição + direitos) — hoje `authorityBinding` é um objeto de 5 chaves com `rule` em texto livre `[P-NE]` §5.2 `[V]` | — | **Coberto na forma, insuficiente no contrato.** **a-09** (`authorityBinding` estruturado: `sourceIds[]`, `pinpoint`, `edition`, `rights`, `decision`, `effectiveFrom/Until`, `normativeAssertions[]`) + **b-05** (contrato de saída reconciliado com o `template-contract` de produção) |
| **B-4** | **Simulados e quiz (12+)** | **Existe.** 1º/2º Simulado Enfermeiros (50q), Segurança do Paciente (50q), Notificação Compulsória, Vacinas (30q), PCR (30q), Quiz interativo, Biblioteca de Provas, simulados por banca (IBAM Bebedouro 2024, Guarulhos 2024, Japaratuba/SE 2014) `[E1]` | `chatgpt/simulados-etapa-01-fundacao-20261004` @ `1afa9a75`; `-02-piloto` @ `43722e26`; `-02-piloto-execucao` @ `fdc25388` (33.255 B órfãos: `transformar_piloto_simulado_de_enfermagem.sql`) `[V]` | `Simulation` (6 caps), `Question` (7 caps) — **sem schema**; `CAP-SIMULATION-ATTEMPT`, `CAP-QUIZ-ATTEMPT` | Simulado que responde sobre norma desatualizada é dano de prova e de serviço `[P-NE]` R2 | Readwise: import + tentativa como objecto | **Coberto por enquanto, contratos ausentes.** **b-06** (schema `Simulation` e `Question`) + **d-04** (não portar `piloto-execucao` sem ler) |
| **B-5** | **Simulados de concurso por banca** (ciclo completo) | **Existe** (3 bancas citadas) | `fix/premium-simulados-shell-boundary-2026-09-20` @ `7677616c` | 9 serviços `selections` (edital, cargo, prova, gabarito, recurso, resultado, convocação) — **todos sem capability**; `Competition` (12 caps) **sem schema** | A lista de notificação compulsória muda de versão → gabarito fica obsoleto `[P-NE]` A8/R2 | Zotero/Airtable: pipeline de dados separado do objecto | **Gap real: 8 contratos + 1 camada de ligação.** Não faltam serviços — falta a ligação. **b-07** (expor os 9 serviços `selections` por capability, começando por `Question`) |
| **B-6** | **Busca / hub por categoria clínica** (SOFA, APACHE II, PaO2/FiO2, Parkland, NIHSS, Glasgow, FAST, CURB-65) | **Existe** (12 hubs) | `codex/catalog-polish-wifi-review-20260930` @ `17a70129`; `codex/catalogo-formularios-acesso-html` @ `4981d1c6` | 13 capabilities `DISCOVERY` (`CAP-GLOBAL-SEARCH`, `CAP-SEMANTIC-SEARCH`, `CAP-SAVED-SEARCH`…); **falta o objecto "categoria clínica"** e o objecto "fator de cálculo" | N/A | Zotero: **Saved Search é objecto distinto** e guarda critérios, não resultados | **Coberto na intenção, não no objecto.** **b-08** (`Saved Search` como objecto, Wave 1 do roadmap já pede o schema) |
| **B-7** | **Favoritos / coleções / histórico** | **Existe mas vazio.** A Minha Conta promete "salvar favoritos, acompanhar seu histórico" `[P-CF]`; FIND: *"Favorite é só estado de visita"* `[E2]` | `copilot/review-session-history` @ `e2e17f28`; `copilot/review-session-history-again` @ `0dc778aa` `[V]` | `CAP-FAVORITE`, `CAP-COLLECTION`, `CAP-SMART-COLLECTION`, `CAP-BASKET`, `CAP-PERSONAL-TAG` (9 caps `ORGANIZATION`); `CAP-HISTORY`, `CAP-LEARNING-HISTORY` (8 caps `CONTINUITY`) — **sem schema de Collection**; `scopeFor()` existe em `state.ts` e é o único | Estado local não pode guardar identificador de paciente (LGPD art. 5 II) `[P-BP]` §7 | Zotero: Coleções e Saved Searches são **objectos distintos**; Linear/Notion: favoritos como atalho | **UUa — três sentidos de "favorito"** (visita / atalho / coleção). **a-10** (criar schema `Collection`/`CollectionItem` **antes** de ligar `CAP-COLLECTION`) + **c-07** (colecção guarda conteúdo, nunca paciente — regra a fixar por WORK ORDER) |
| **B-8** | **Fórum / comentários UGC** | **Existe e pede identificação real.** Nome/apelido, país, profissão, **local de trabalho**; 19 idiomas; 150+ países; **sem moderação, denúncia ou aprovação** `[P-CF]` T1.14 | `feat/page-comments-supabase` @ `88bee938`; `feat/page-comments-owner-actions-20261012` @ `0a487c5a`; `fix/page-comments-premium-rehydration` @ `327ca65c`; `fix/page-comments-inline-delete-20261012` @ `00210afe`; `codex/fix-page-comments-cache-157` @ `b4590f66` (11 branches) `[V]` | 12 serviços `community` — incluindo `moderation`, `abuse-report`, `identity-aware-profile` — **com 0 capability** `[P-SB]` Tabela 5 | Sem obrigação directa; a política de privacidade **nega** coleta de dados identificáveis `[P-CF]` T1.3 | Readwise/Airtable: collaboration | **O esqueleto tem o motor que a produção precisa e não o expõe.** **a-11** (modelar `moderation_state` + `report` + pseudónimo obrigatório) + **c-08** (o fórum entra no CE? com que moderação?) |
| **C-1** | **Parecer Normativo COFEN 01/2024** (dimensionamento) | Afirmado na produção: "Dimensionamento de Enfermagem (Carga de Trabalho — Parecer Cofen 01/2024)" `[P-NE]` A1 | `codex/governanca-fugulin-dimensionamento` @ `0522c0e0` | `ClinicalTool.authorityBinding` **parcial**: `{sourceId, authority, rule, interpretation, result}`, `sourceId` obrigatório, restantes `null`; `rule` é **texto livre** `[V]` `[P-NE]` §5.1 | **Fonte capturada**: PN COFEN 1/2024, 35 p., SHA-256 `7155c480a442fb2c…`; pinpoints 1.1, 1.2, 1.5, 2.2, 2.8, 3.0, Anexo I, Anexo II. **O Parecer tem erros aritméticos próprios** ("82,5" vs 83; "15 + 19 = 33") | — | **O único caso em que a fonte foi obtida e o esqueleto não a tem.** **a-12** (`authorityBinding.pinpoint` obrigatório por campo) + **b-09** (reexecutar as fórmulas contra os vectores do Anexo II, registando as divergências do próprio acto) |
| **C-2** | **Resolução COFEN 736/2024** (Processo de Enfermagem, 5 etapas) | Afirmado na produção `[P-NE]` A2 | — | Sem schema para `Norm`; `Norm` é 1 dos 16 `object_type` sem schema `[P-NE]` §6 | **Fonte capturada**: SHA-256 `8a8a9ecb5987a308…`; art. 4º §1º–§5º (5 etapas); art. 14 revoga a Res. 358/2009 | — | **Sustentado, não registado.** `Norm` tem 14 capabilities ligadas (`support: PROPOSED`) e **zero schema** `[V]`. **a-13** (criar schema `Norm` com `normType`, `issuingAuthority`, `officialIdentifier`, `publication`, `effectiveFrom/Until`, `viges`, `revokes[]`, `amendedBy[]`, `source`, `rightTexts[]`, `atoms[]`) |
| **C-3** | **Parecer CFM 28/2020 — escala de Aldrete (corte)** | **O site publica corte de 9 pontos.** `prod_aldrete.html` contém `if (calcScore >= 9)` e `else if (calcScore >= 7)`; `lastmod 2026-10-27` `[V]` `[P-NE]` A14 | `fix/clinical-calculators-audit-2026-09` @ `61fecc4d` | `authorityBinding` por **faixa** não existe; `ClinicalTool.status` ∈ {`CANDIDATE_HOLD`, `ADMITTED`, `RETIRED`} — que **não** é o `status` canónico do CKO `[P-NE]` §5.1 | **Fonte capturada**: SHA-256 `089dba1488ac8ee0…`; frase verbatim: *"com a escala, o paciente poderia ter alta da SRPA quando somasse **8 pontos ou mais**"* `[V]` | Figma: version history; Raindrop: source changed | **DIVERGÊNCIA PROVADA — severidade ALTA.** O site cita a fonte que ele contradiz. **a-14** (regra: `ADMITTED` não pode coexistir com `authorityBinding.decision = HOLD_HUMAN`, `rights ≠ comprovado`, `sha256` de 64 zeros ou `snapshot_ref = PENDING_SNAPSHOT`) + **c-09** (corrigir o corte no site ou manter a ferramenta em HOLD — decisão clínica do dono) |
| **C-4** | **Lista Nacional de Notificação Compulsória** | **Servida em versão superada.** `prod_lista-de-doencas-...html` e `prod_notificacao-compulsoria.html` ancoram em **10.175/2026** e declaram **"73 entradas"** `[V]` `[P-NE]` A8 | — | **Nenhum campo de vigência** em schema algum; `Norm` não existe | A última alteração é a **Portaria GM/MS 11.211/2026** (13 mai. 2026): remove covid-19, inclui **caxumba** e **febre do oropouche**, altera nomenclaturas e periodicidades. **Item 4 = Anomalias Congénitas, item 5 = Botulismo** (na 6.734/2025, item 4 = Botulismo) `[V]` | Zotero/Raindrop: **stale detection** e **source changed** | **DIVERGÊNCIA PROVADA — severidade ALTA.** A numeração dos itens muda entre versões. **a-15** (`effectiveFrom`/`effectiveUntil` por item e por afirmação) + **b-10** (rotina de vigência: `CAP-SOURCE-CHANGE`, `CAP-STALE-DETECTION`, `CAP-EXPIRATION`) + **c-10** (qual versão é a canónica para os simulados?) |
| **C-5** | **Código de Ética da Enfermagem** (Res. COFEN 564/2017 + Anexo) | Afirmado na produção (página, guia, simulado) `[P-NE]` A3 | — | `Article`/`LibraryEntity` sem `authorityBinding`; `LibraryEntity` **sem campo `rights`** `[V]` | Ato capturado (SHA-256 `09bd6ab2ea4cef05…`): vigência **120 dias** após 06/12/2017, revoga a Res. 311/2007. O **Anexo (o Código, 16 p.) é imagem pura** — `pdftotext` devolve 0 linhas `[P-NE]` F3 | — | **Metadado do acto; texto do Código não verificado.** **a-16** (`ocrMethod` + `ocrReviewedBy` no modelo; `OCR_UNREVIEWED` → `HOLD_HUMAN`) + **b-11** (OCR do Anexo com revisão humana e double-check) |
| **C-6** | **Leis federais** (7.498/86, 8.080/90, 5.905/73) | Afirmadas na produção `[E1]` | — | Nenhum schema que transporte `officialIdentifier`, `publication`, `viges` | Confirmadas na API do Senado por **2 rotas cada**: id **549374** / **549956** / **547781**; ementa, DOU (26/06/1986 p. 9273 · 20/09/1990 p. 18055 · 13/07/1973 p. 6825), `vides` 4/43/1, `disps` 10/93/0. **`catalogo` = 1 linha de palavras-chave, não sumário** `[P-NF]` | — | **Confirmadas como existência e identificação; texto de artigo NOT_RUN.** A **8.080/1990 tem 43 `vides`** — a edição vigente em 2026 não é a de 1990. **a-17** (o `Norm` tem de trazer `edition` e `viges`; 15.471/2026 é a última alteradora) + **b-12** (capturar texto consolidado; NOT_RUN com comandos prontos) |
| **C-7** | **NANDA-I (2018) / NIC** | Calculadora "Diagnósticos NANDA (2018)"; a página declara **"apenas 90% do total"** `[V]` | `codex/braden-icone-web-store` @ `3b7d8098`; `fix/gad7-fidelidade-meem-20261027` @ `43bfef25` | `terminology.schema.json` previsto, não implementado; `LibraryEntity.terminologyRefs: string[]` (sem versão, sem direitos) `[V]` | `banco_nanda.json`: **281 itens**, `ano_inclusao` preenchido em **2/281**, **25 rótulos de `dominio`** com variantes duplicadas do mesmo domínio ("Segurança / proteção" 55× vs "Domínio 11. Segurança / proteção" 5×); `banco_nic_completo.json`: **593 itens** com `definicao` + `atividades` `[V]`. **Direitos: obra protegida (Thieme) → HOLD de redistribuição** | — | **NÃO VERIFICADA + HOLD de direitos.** O esqueleto não tem onde meter edição nem direitos de terminologia. **a-18** (`terminologyBindings[]` com `codeSystem`, `codeSystemVersion`, `conceptCode`, `canonicalLabelKey`, `rights`) + **c-11** (obtener licença escrita de reprodução, ou publicar apenas códigos) |
| **D-1** | **Views / Saved View / Saved Search / Coleções** (Airtable, Zotero, Notion) | Home com 4 blocos; "Mapa do Site"; 19 menus `[E1]` | `fix/matriz-de-risco-funcional-layout-20261026` @ `acf3d8dd`; `codex/alinhamento-menu-global-20261026` @ `e86583ee` | 14 caps `VIEWS`; **`views.ts` (P1) ausente**; `profile-contracts.ts` tem `SETTINGS_SCOPES`/`OUTPUT_FORMATS`/`PREVIEW_PROFILES` **vazios** e `PROFILE_REGISTRY_STATUS = 'CANDIDATE_HOLD'` `[P-BP]` | N/A | Airtable: múltiplas views sobre o mesmo dado; Zotero: Coleções ≠ Saved Searches | **Total.** **b-13** (`views.ts` limitado a **2 tipos**: `ClinicalTool` e `Article` — o resto é casa sem cidade) |
| **D-2** | **Command palette / ⌘K** (Linear) | Não medido — `NOT_RUN` `[P-BP]` linha 7 | — | 6 caps `COMMAND_ACTION` (`CAP-COMMAND-PALETTE`, `CAP-ACTION-BAR`, `CAP-CONTEXT-MENU`, `CAP-KEYBOARD-SHORTCUTS`…); **`action-bar.tsx` (P0) ausente** | N/A | Linear: favoritos + command access | **Total.** **b-14** (`capabilities.ts` + `action-bar.tsx` são pré-requisito técnico, não valor — não devem preceder output/help) |
| **D-3** | **Help contextual = "de onde veio este corte"** | A produção mostra fontes no rodapé (`IBSP`, `ISMP`, `ANVISA`, `AHA/SBC`) `[E1]` | `codex/publish-six-localized-guides` @ `36ab6227`; `codex/finish-six-clinical-translations` @ `baf2cae3` | 13 caps `HELP`; **`help.ts` (P0) ausente**; FIND: *"Hint trata Tooltip como conteúdo+renderer"* `[E2]` | **O `pinpoint` é a resposta**: a fonte do corte tem de ser exibida ao pé do valor | Readwise: um único lugar para o texto | **P0 sem desvio.** **b-15** (`help.ts` como **único** lugar onde o texto clínico vive — 19 idiomas multiplicam o custo de tradução) |
| **D-4** | **Preview "conferir sem sair da lista"** | Hub de 12 categorias; 400+ conteúdos `[E1]` | — | 14 caps `PREVIEW`; **`preview.ts` (P0) ausente**; FIND: *"preview existente é infra de embed, não Product Preview"* `[E2]` | N/A | Notion Home: composição de projeções | **P0.** **b-16** (`preview.ts`; cuidado: não reimplementar embed como preview) |
| **D-5** | **Lifecycle / Recovery / versionamento / undo** (Figma) | "Memória da Avaliação" (parâmetro, gravidade, escore, total) por página `[P-CF]` T1.12 | `backup/pre-clinical-audit-2026-09-19` @ `56b9ee29` (baseline) | 9 caps `LIFECYCLE` + `CAP-UNDO`/`CAP-REDO` em `WORKSPACE`; **Wave 9 do roadmap inteira por fazer** | `authorityBinding.edition` + `effectiveFrom/Until` — sem eles, versionar é versionar rumor | Figma: checkpoint a cada 30 min, restore não destrutivo | **P1, só objectos pessoais.** "Archive pessoal ≠ Retired canónico". **b-17** (lifecycle pessoal primeiro; conteúdo canónico segue release/governança) |
| **D-6** | **Branches `backup/*` como baseline** | N/A | 8 branches `backup/*` + `pre-projetos` + `fix-supabase-preview-migration-baseline-2026-09-20` = **10 baselines** — **9 estão fundidas em `main`** e **1 NÃO está**: `fix-supabase-preview-migration-baseline-2026-09-20` (medido pelo owner com `git merge-base --is-ancestor` sobre as 10, 01/11). Consequência: o **conteúdo** das 9 fundidas não se perde se a branch for apagada (o commit está no histórico de `main`); o que se perde é o **rótulo** — o registo de que ali houve um 'antes'. A 10.ª é a única baseline com risco de conteúdo `[V]` | O esqueleto não tem registo de baseline nem `find-register` com os 16 FINDs da PR #21 | N/A | Figma: checkpoints antes de merge | **Não são código: são prova do estado anterior.** **d-05** (não apagar sem registo — pelo menos o nome; e a `fix-supabase-preview-migration-baseline-2026-09-20` é a única com conteúdo em risco) + **a-19** (criar o `divergence register` FIND a partir da Tabela-MESTRE) |
| **D-7** | **Órfãos do repo** | N/A | **7 branches não fundidas com 1.524.448 bytes órfãos** — `audit/billing-ads-final-20260914` 240.987 B · `audit/billing-ads-hardening-20260914` 250.623 B · `audit/billing-ads-hardening-20260914-fix` 239.077 B · `audit/billing-concurrency-fix-20260914` 239.820 B · `base44/setup-33f0e67e` 260.356 B · `base44/setup-ea01a537` 260.330 B · `chatgpt/simulados-etapa-02-piloto-execucao-20261004` 33.255 B. Conteúdo órfão = **`SISTEMA_DE_LOGIN_DO_SITE/`** (catálogo de contas/pagamentos, `firestore.rules`, `proximas_etapas_construcao_sistema_login.txt`) `[V]` | O esqueleto tem **0** modelo de entitlement para onde portar isto | N/A | — | **O maior risco de perda do repo é exactamente a frente que o esqueleto não modela.** **c-12** (qual das 4 variantes `audit/billing-ads-*` é a canónica?) + **d-01** (não portar código de checkout sem modelo) + **d-02** (não portar as duas políticas de ads) |

### 4.2 Leitura de 4 colunas (versão condensada exigida pelo briefing)

| Elemento | Estado real (produção + repo) | Declara / obriga (esqueleto + normativos) | Referência + veredito + ação |
|---|---|---|---|
| Acesso guest sem login | **Presente e correcto** (L1) | `SESSION`/`LOCAL_DEVICE` canónicos; `authorityBinding` por campo obrigatório | **Manter.** Guest-first é requisito duro: sem login no caminho L1. Sem ação de estrutura. |
| Minha Conta / login | **Presente**; 4 branches de bootstrap/listeners | Só `owner_scope: ACCOUNT`; nenhum schema de conta | **a-01** + **b-01** + **c-01** — `Identity/Account` transversal, nunca `ACCOUNT` sem backend. |
| Assinatura / checkout / entitlement | **Presente**; 2 PSPs; 6+ branches de `premium-access-root-cause` | Nada: nem objecto, nem capability, nem schema | **a-02/03/04** + **c-02/03** — Entitlement com reason codes; regra dura `owner_scope = ACCOUNT`. |
| Ads | **Presente**; duas políticas em paralelo | Nada | **c-04** + **d-02** — decidir uma política; não portar as duas. |
| Telemetria / eventos | **Presente** (GA4 + Edge Function, 11 famílias) | `telemetry_contract` é string; `events.ts` ausente | **a-07** + **b-02** + **c-06** — contrato de evento; `events.ts` P1→P0. |
| Biblioteca / calculadoras / escalas | **Presentes** (+400, 16+, +60) | `Article`/`LibraryEntity`/`ClinicalTool` com schema; `ClinicalTool` com `authorityBinding` parcial | **a-08/09** + **b-03/04** — output com versão, faixa e fonte. |
| Simulados / concurso | **Presentes** (12+; 3 bancas) | 9 serviços `selections` sem capability; `Simulation`/`Question`/`Competition` sem schema | **b-06/07** — 8 contratos + 1 camada de ligação. |
| Autoridade normativa | **Afirmada** — o E1 lista 17 normativos visíveis; 15 afirmações auditadas (A1–A15) | `Norm` sem schema; sem `edition`, `pinpoint`, `vigência`, `rights` | **a-12/13/15/18** — schema `Norm`, `authorityBinding` estruturado, `effectiveFrom/Until`. |
| Aldrete / lista de notificação | **Divergência provada** (9 vs 8; 10.175 vs 11.211) | Nenhum campo de vigência ou faixa por fonte | **a-14/15** + **c-09/10** — HOLD até correcção; decisão clínica do dono. |
| NANDA / NIC / Código de Ética | **Publicados** (281 / 593 itens; 90 % declarados) | Sem edição, sem `rights`, sem `ocrMethod` | **a-16/18** + **b-11** + **c-11** — HOLD de direitos; OCR revisto. |
| Favoritos / coleções / histórico | **Prometido e vazio** (favorito = visita) | 9 caps `ORGANIZATION` sem schema de Collection | **a-10** + **c-07** — schema primeiro; coleção nunca guarda paciente. |
| Views / help / preview / lifecycle | **Não implementados** | 14 caps `VIEWS`, 13 `HELP`, 14 `PREVIEW`, 9 `LIFECYCLE`; 4 módulos P0 ausentes | **b-13…b-17** — ordem: eventos → output+help → views(2 tipos) → lifecycle → preview. |
| Repo's órfãos e baselines | **1.524.448 B órfãos** em 7 branches; 10 baselines das quais **9 já fundidas** em `main` e **1 não fundida** (risco de conteúdo) | 0 modelo de entitlement; nenhum registo de FIND | **c-12** + **d-01/02/05** + **a-19** — não apagar baselines; não portar código sem modelo. |

---
## 5. Cadeia de evidência por linha crítica

> Formato exigido: **evidência → condição/gatilho → impacto → confiança → como verificar**.
> Cada linha é uma cadeia auditável: se alguém contestar a linha, sabe exactamente qual comando ou ficheiro desfaz a contestedão. Nenhuma linha aqui é uma opinião; a opinião é a coluna "impacto" e está assinalada como tal.

### 5.1 Linhas críticas (12)

| # | Evidência (fonte primária) | Condição / gatilho | Impacto | Confiança | Como verificar |
|---|---|---|---|---|---|
| **L-01** | O site publica **corte de 9 pontos** na Aldrete: `prod_aldrete.html` contém `if (calcScore >= 9) { … } else if (calcScore >= 7) { … }`; `lastmod 2026-10-27` `[V]` | Qualquer enfermeiro usa a escala e aplica o corte publicado; a fonte que o site declara (Parecer CFM 28/2020) fixa **"somasse 8 pontos ou mais"** `[V]` | **Dano assistencial evitável:** um paciente com 8 pontos (critério atingido segundo o CFM) é exibido como "Manter em Observação" em vez de elegível para alta. A decisão final de alta é do médico responsável, mas o score orienta a decisão `[P-NE]` R1/R8 | **Alta** — texto de página real com SHA-256 `089dba1488ac8ee0…` e frase verbatim verificada por mim | `grep -oE "calcScore >= [0-9]+" capturas-2026-11-01/prod_aldrete.html` e `grep -n "8 pontos" capturas-2026-11-01/cfm28.txt` → já executado `[V]` |
| **L-02** | As páginas da lista de notificação compulsória ancoram em **10.175/2026** e declaram **"73 entradas"**; a Portaria **11.211/2026** (13 mai. 2026) é a última alteração e **renumera os itens** (item 4 = Anomalias Congénitas, item 5 = Botulismo; na 6.734/2025 item 4 = Botulismo) `[V]` | Simulado de notificação compulsória responde sobre a lista; a numeração é usada como referência de item | **Erro em prova de concurso e erro em serviço** (notificar/notificar errado é dano). O simulado ancora na **6.734/2025** pelo `meta description` ao vivo — **três versões em circulação, uma só lista em vigor** `[P-NE]` §2.4 e nota 7 | **Alta** — três ficheiros com hash, conteúdo verificado por mim | `grep -oE "10\.175/2026\|73 entradas" capturas/prod_lista-*.html capturas/prod_notificacao-compulsoria.html`; e desnumerar `bvsms_prt11211_2026.html` (verificado: "4 Anomalias congênitas X 5 Botulismo") |
| **L-03** | **190 de 190** ligações capability↔objecto estão a `support: PROPOSED`; 16 object types; **3 com schema**; **`Norm` sem schema** `[V]` | Qualquer capability é "promovida" sem que a relação com o objecto esteja aprovada, e sem que o objecto tenha contrato de dados | **O gate não apanha**: valida a *forma* do registo, não a *existência de payload* `[P-SB]`. Uma `Norm` admitida sem schema pode transportar qualquer coisa | **Alta** — leitura directa de `catalog/object-capability-binding.candidate.v0.1.json` | `python3 -c "…"` sobre o ficheiro (contador por `support`) — executado `[V]` |
| **L-04** | **Nenhum `service_ref` existe em nenhuma camada**: 14 campos na capability, 6 no binding, nenhum aponta para serviço `[V]` `[P-SB]` §6 | Um gate ou um consumidor tenta ligar uma capability a um serviço | **236/410 serviços (57 %) sem capability mapeável** e **49/201 capabilities (24 %) sem serviço** — por heurística de tokens, declarada como heurística. As famílias `evidence-claims` (9, com `authority-binding` e `contradiction-detection`) e `community` (12, com `moderation`) estão **inteiras do lado sem capability** | **Média** — o ficheiro é lido com certeza (Alta); a **contagem** 236/49 é heurística por sobreposição de tokens, reproduzível mas não canónica | `python3` sobre `catalog/service-catalog.v1.json` + `catalog/capability-registry.candidate.v0.1.json` com a regra de tokens do entregável `[P-SB]` §6 |
| **L-05** | 7 branches não fundidas com **1.524.448 bytes órfãos**, cujo conteúdo é `SISTEMA_DE_LOGIN_DO_SITE/` (catálogo de contas/pagamentos, `firestore.rules`, `proximas_etapas_construcao_sistema_login.txt`) `[V]` | A branch é apagada, o clone é recriado, ou o `git gc` perde os blobs não alcançáveis | **Perda do único artefacto que documenta o sistema de contas/pagamentos** — a frente mais trabalhada e mais instável do produto, e a que o esqueleto não modela | **Alta** — soma conferida linha a linha em `branch-orphan.tsv` (30 linhas, 13 `MERGED_IN_MAIN`, 17 `UNMERGED`, 7 com `orphan_bytes > 0`); 0 divergências entre a lista oficial (`branches-todas.json`) e o clone (`git for-each-ref`) `[P-RP]` nota 1 | `awk -F'\t' 'NR>1 && $9>0 {print $1, $9}' workspace/branch-orphan.tsv` → soma 1.524.448 — executado `[V]` |
| **L-06** | **137 das 181 branches (76 %)** `[P-RP]` são `fix`+`codex`+`copilot`+`refactor`; **151** incluindo `feat`+`audit`; a lista do `E2` com "30 branches" vem de paginação errada (`per_page` em vez de `perPage`) `[V]` `[P-RP]` nota 1 | Alguém planear o port do esqueleto a partir do "repositório do produto" | **Risco de plano**: tratar 181 branches de churn como 181 fontes de verdade. A lista do pack (30) é **errada** e foi substituída pela oficial | **Alta** — contagem directa sobre `branches-todas.json` (182 refs, incluindo `main`) | `python3` com `collections.Counter` sobre as chaves — executado `[V]` |
| **L-07** | `sha256sum -c SHA256SUMS.txt` → **36/36 OK**; 36 ficheiros capturados; **o manifesto não se inclui a si próprio** (a versão anterior tinha 22 linhas e uma auto-referência inválida) `[V]` `[P-NE]` §2.3 | Uma captura é usada como fonte sem verificação de integridade | **Sem integridade não há prova.** O hash atesta os *bytes comparados*, não a correcção do conteúdo nem a licitude da fonte | **Alta** — verificação executada por mim | `cd capturas-2026-11-01 && sha256sum -c SHA256SUMS.txt` → 36 OK — executado `[V]` |
| **L-08** | `prod_banco_nanda.json`: **281 itens**, `ano_inclusao` preenchido em **2/281**, **25 rótulos de `dominio`** com variantes duplicadas ("Segurança / proteção" 55× vs "Domínio 11. Segurança / proteção" 5×); `prod_banco_nic_completo.json`: **593 itens**; a página declara **"apenas 90% do total"** `[V]` | O motor de cálculo NANDA sugere um diagnóstico indexado num domínio que não existe na taxonomia canónica | **Diagnóstico indexado fora da taxonomia** + **reprodução de obra protegida (Thieme)** sem licença comprovada → HOLD de redistribuição `[P-NE]` R4/R6 | **Alta** — contagem directa sobre os JSON capturados com hash | `python3 -c "len(json.load(open('prod_banco_nanda.json')))"` e `len(set(dominio))` — executado `[V]` |
| **L-09** | O dataset do Senado: tipo `PRT` = **2 documentos em toda a base** (ambos de 1821); tipo `REG-n` = **38** (1838–1842); catálogos 2024 = **1.436 docs**, 2025 = **1.293 docs**, soma dos tipos = total (sem truncamento) `[P-NF]` §9 | O produto tentar "validar" a Res. COFEN 736/2024 ou a Portaria 6.734/2025 contra a API do Senado | **Falso negativo por ausência de escopo, não por inexistência do acto.** A omissão é estrutural: o corpus LexML ingerido não cobre normas infralegais de autarquia nem portarias de ministério | **Alta** — prova de escopo com controlo positivo no endpoint URN e prova negativa independente no LexML | `curl -sL "$BASE/legislacao/lista?tipo=PRT" -H 'Accept: application/json'` → 2 docs; `…tipo=REG-n` → 38 — comandos em `[P-NF]` §9 e `fase1_redo.sh` |
| **L-10** | A API do Senado devolve `catalogo` = **uma linha de palavras-chave** (" EXERCICIO PROFISSIONAL .") e **zero** títulos de capítulo/artigo para as 3 leis; `temTexto: "S"` **sinaliza** que existe texto publicado, **não** que o endpoint o devolve `[P-NF]` §5.1 e nota 4 | Uma tela mostrar "sumário da Lei 7.498" a partir deste campo | **Erro de leitura de fonte apresentado como sumário.** O `catalogo` é índice de assunto | **Alta** — a API foi reconsultada e o resultado é byte-a-byte equivalente à ronda anterior `[P-NF]` nota 1 | `raw/lei7498.json` → `catalogo.frase`; comparar com `raw/lei8080.json`, `raw/lei5905.json` |
| **L-11** | `tool-sources.v1.json`: **6/6** com `source_type` fora do enum canónico e `integrity.sha256` = **64 zeros**; `tool-bindings.v1.json`: **46/78** com `authority_class` e `decision` fora do enum; **32** sem `source_ids` `[P-NE]` §5.4 | Qualquer `ADMITTED` tentado por um binding que "aponta" para uma fonte | **O hash não atesta nada** e as decisões registadas (`BOUND`) não são decisões do CKO (`ALLOW`/`HOLD_HUMAN`/`REJECT`/`NOT_APPLICABLE_JUSTIFIED`) | **Alta** — **re-verificada pelo owner em 01/11** contra `/workspace/repo/contracts/entities/` (os ficheiros **existem**; o `[P-NE]` acertou nos números, o relatório anterior deste ficheiro estava errado ao dizer que não existiam): `tool-sources.v1.json` → **6/6** com `source_type` fora do enum canónico (valores no ficheiro: `NORMATIVA`, `VALIDACAO`, `GUIA`) e **6/6** com `integrity.sha256` = 64 zeros; `tool-bindings.v1.json` → **78/78** com `authority_class` e `decision` fora do enum canónico **ou ausentes** (46 com `decision: BOUND`, 32 sem o campo; `authority_class`: `CLINICAL` 36, `TECHNICAL` 6, `INTERNAL_CONFIG` 4, ausente 32). Enums canónicos lidos de `contracts/cko-skeleton/catalog/cko-data.json`: `source_type` = 11 valores, `authority_class` = 5, `decision` = HOLD/REJECTED/APPROVED | reexecutar no repo canónico |
| **L-12** | **2 dos 10** módulos canónicos `PRESENT` (`resolver.ts`, `state.ts`); 8 `MISSING_PENDING_WAVE`; `profile-contracts.ts` com os 3 arrays vazios e `PROFILE_REGISTRY_STATUS = 'CANDIDATE_HOLD'`; **410/410** serviços lançam `NOT_IMPLEMENTED_CANDIDATE_HOLD` `[V]` `[E5]` | Uma capability ser tratada como entregue porque está declarada | **Cobertura nominal 100 %, cobertura executável 0 %.** As 201 capabilities são declarações, não implementações | **Alta** — leitura de `src/core/experience/module-status.ts`, `profile-contracts.ts` e `grep` dos 410 `index.ts` gerados | `grep -c "NOT_IMPLEMENTED_CANDIDATE_HOLD" src/families/*/*/index.ts \| …` |

### 5.2 Linhas de risco médio (5) — registadas para não perderem-se

| # | Evidência | Condição / gatilho | Impacto | Confiança | Como verificar |
|---|---|---|---|---|---|
| **L-13** | **3 tensões reais** entre promessa publicada e comportamento: (T1) política do site nega coleta e nega login vs. login Google/E-mail + checkout; (T2) Termos dizem "gratuitamente" vs. assinatura cobrada com reembolso em 7 dias; (T3) home anuncia "+60 escalas para imprimir" vs. paywall, e fórum pede identificação vs. promessa de não coletar `[P-CF]` §7 | O texto legal é lido como se descrevesse o produto actual | **Risco jurídico e de confiança.** Isto **não é parecer jurídico** — a qualificação (LGPD/ANPD, CDC) é de outra frente | **Média** — texto lido de páginas reais (via `web_fetch` e indexação), **sem hash no repositório comum** (§3) | `curl` das três rotas e registo com SHA-256; rever `/politica.html`, `/termos.html`, `/reembolso.html`, `/forum-enfermagem.html` |
| **L-14** | A **política do app** (`/politicaapp.html`) promete sem ads, sem cookies e "nenhum dado é enviado aos nossos servidores"; a plataforma web tem ads, GA4, Supabase Edge Function e comentários | O CE local herdar o modelo web | **Tensão app×web** — escopos diferentes, **não é contradição provada**. Torna-se contradição se o app/CE herdar ads/GA4/conta | **Baixa** (condicional) — depende de herança de modelo, não medida | Decisão **c-13**; verificar o `main` do app privado `IndiciumFIN/calculadorasdeenfermagem` |
| **L-15** | **8 dos 9 serviços `selections`** e **12 dos 12 serviços `community`** existem **sem objecto de dados** `[P-SB]` §8 nota 4 | O gate passar porque valida a forma, não o payload | Um serviço sem schema pode devolver qualquer coisa; a máquina de simulados de concurso e o motor de moderação são inalcançáveis | **Média** — contagem declarada no entregável; confirmável sobre os catálogos | `python3` sobre `catalog/service-catalog.v1.json`, filtrando `family in {selections, community}` |
| **L-16** | `metamodel.ts` exige 15 campos de capability e 5 de binding (`CAPABILITY_REQUIRED`/`BINDING_REQUIRED`); o registo candidato traz **14** e **6**; o tipo declara 20 e 10 `[V]` | O registo for validado contra o metamodelo | **6 campos de capability e 4 de binding em falta**, incluindo `supported_channels`, `permission_policy`, `audiences`, `policy_refs` — exactamente onde vivem consentimento, canal (extensão Chrome) e audiência | **Alta** — leitura directa dos três ficheiros | `grep -A3 "CAPABILITY_REQUIRED" src/core/experience/metamodel.ts` |
| **L-17** | `ClinicalTool.status` ∈ {`CANDIDATE_HOLD`, `ADMITTED`, `RETIRED`}; o `status` canónico do CKO tem 10 valores (`CANDIDATE`…`RELEASED`); `decision` canónico = {`ALLOW`, `HOLD_HUMAN`, `REJECT`, `NOT_APPLICABLE_JUSTIFIED`} `[P-NE]` §5.1 `[V]` | Uma promoção usar o vocabularário do schema de piloto | **Promoção com `status: ADMITTED` sem `decision` válido** — exactamente o bypass que a doutrina proíbe | **Alta** — enum lido do schema | `python3 -c "json.load(open('schemas/clinical-tool.v1.json'))['properties']['status']['enum']"` |

---

## 6. Achados estruturais transversais

> Nenhum destes achados é novo de uma frente isolada: cada um emerge de pelo menos duas, e é o que a síntese acrescenta.

### 6.1 Guest-first é uma decisão de **escopo**, não de produto

A produção é guest-first **no núcleo clínico** e **não** guest-first em identidade, dinheiro, comunidade e telemetria `[P-CF]` §3. O esqueleto é guest-first **por completo** e não tem como representar o resto. O único ponto de contacto real entre os dois é `owner_scope`.

**Consequência de arquitetura (a-04, regra dura):** `entitlement` só pode existir com `owner_scope = ACCOUNT`. `SESSION` e `LOCAL_DEVICE` **nunca** podem ser fonte de autorização. A regra é testável e o esqueleto é fail-closed, portanto é barata de implementar. O cenário que ela impede é o pior de todos: Premium liberado no device, revogável em qualquer device, sem servidor — que é a classe de bug que 6+ branches `fix/premium-access-root-cause` já tentaram corrigir.

**Consequência de conteúdo:** `ACCOUNT` e `WORKSPACE` devem ser declarados **reservados e sem backend**, com o mesmo `NOT_IMPLEMENTED_CANDIDATE_HOLD` dos 410 serviços `[P-CF]` A10. Simular entitlement local é pior do que não ter.

### 6.2 O motor de segurança clínica existe e está desligado

A família `evidence-claims` (9 serviços) contém `authority-binding`, `applicability-service`, `contradiction-detection`, `lineage-service` — exactamente o que o `FIND-CTR-010` (Aldrete 8 vs 9) e o `contracts/entities/tool-sources.v1.json` exigem. **Nenhuma das 201 capabilities a expõe** `[P-SB]` §2.1.

O mesmo se passa com `community` (12 serviços, incluindo `moderation` e `abuse-report`) face a um fórum vivo sem moderação, e com `selections` (9 serviços) face à máquina de simulados de concurso.

**Consequência:** o problema do esqueleto **não é falta de serviço**. É que **os serviços que protegem o produto estão desligados de tudo o que um utilizador ou um gate consiga alcançar**. A ligação capability↔serviço é o delta de maior retorno de toda a lista.

### 6.3 A divergência Aldrete é um teste de arquitectura, não um bug isolado

A escala tem uma fonte declarada (Parecer CFM 28/2020), um valor publicado que contradiz essa fonte (9 vs 8), uma implementação no repo que segue a fonte (8/7/0–6) e um registo canónico que não tem onde colocar "em que ponto da fonte está este valor".

Isto repete-se em pelo menos mais dois sítios já medidos: a **Lista de Notificação Compulsória** (versão e numeração de itens) e a **NANDA/NIC** (edição e vocabulário canónico). E o benchmark acende exactamente o mesmo mecanismo: `CAP-SOURCE-CHANGE`, `CAP-STALE-DETECTION`, `CAP-RIGHTS-CHECK` estão declarados e não estão expostos `[P-BP]` §7.

**Consequência:** a **Clinical Safety** é, neste produto, um problema de *esquema*, não de conteúdo. A resposta não é corrigir o Aldrete e pronto: é dar ao modelo um sítio para `pinpoint`, `edition`, `effectiveFrom`/`effectiveUntil` e `rights` por campo, e uma regra de `HOLD` que seja executada por um validador, não por um documento.

### 6.4 O produto já tem telemetria; o esqueleto não sabe os nomes

`/metricas.html` publica 11 famílias de eventos GA4 incluindo a escada `subscription_checkout_*` → `subscription_payment_*` `[P-CF]` T1.8. O esqueleto tem `telemetry_contract` como **string** e `events.ts` como P1 ausente `[E5]`.

Há aqui uma assimetria que vale registar: o produto **tem** instrumentação (com um dashboard público de utilizadores, sessões, 15 países e 20 cidades) e **não tem** consentimento modelado. O `telemetry_contract` ser string e não contrato é, por si só, um problema de **Clinical Safety adjacente**: um evento correlacionado com checkout é identidade.

### 6.5 O vocabulário do esqueleto está calibrado para um produto institucional que não existe

12 capabilities em `SHARING_COLLAB` = **6,0 %** das 201, mais `sync_support`, mais 13 caps `PREVIEW`, mais `CAP-SEMANTIC-SEARCH` (P2). Em troca, o público-alvo é individual: enfermeiro em plantão e estudante em concurso são **o mesmo utilizador com dois modos** `[P-BP]` §2.

**Consequência:** `SHARING_COLLAB`, sync multi-dispositivo, TTS e web-archive devem ficar **HOLD por decisão**, não construir. Três motivos convergentes: colidem com a promessa publicada de "sem cadastro/login e sem dados pessoais"; transformam estado local em dado de saúde (LGPD art. 5 II e art. 11); e a demanda é `NOT_RUN`.

### 6.6 Os 4 "últimos" concorrentes do repo são uma decisão pendente, não um acidente

`audit/billing-ads-final-20260914`, `audit/billing-ads-hardening-20260914`, `audit/billing-ads-hardening-20260914-fix`, `audit/billing-ads-hardening-clean-20260914` — quatro variantes do mesmo tema, distinguíveis **só pelo nome**; a `clean` está fundida, as outras três **não**, e cada uma carrega ~240–250 KB de órfãos com o mesmo conteúdo `SISTEMA_DE_LOGIN_DO_SITE/` `[V]`.

**Consequência:** há **dois "últimos" em simultâneo** — o de billing (`clean`, fundido) e o de ads (`feat/ads-controlado`, não fundido). Portar ambos para o esqueleto criaria duas verdades. A decisão de qual é a canónica é do dono (**c-12**) e **tem de preceder** qualquer port.

---

## 7. Contradições e incertezas — explicitadas, não resolvidas em silêncio

> Requisito do contrato: contradições e incertezas têm de aparecer, não ser harmonizadas. Estado possível: **RESOLVIDA** (com a base da resolução) · **ABERTA** (diz-me o que falta para fechar) · **NÃO RESOLVIDA** (a fonte não decide; registada para decisão do dono) · **NOT_RUN** (não medido).

| # | Contradição / incerteza | Tensão | Estado | Base / o que falta |
|---|---|---|---|---|
| **C-01** | **Quantas branches estão no núcleo conta→cobrança→ads.** `86/182 (47 %)` `[P-CF]` vs `114/181 (63 %)` `[P-RP]` | Mesmo dado (`branches-todas.json`), classificadores diferentes (conjunto de palavras-chave). A diferença é do classificador, não do dado | **RESOLVIDA** | O número do dono é reproduzível a partir de `branches-todas.json` `[P-RP]` §4. **Regra para este relatório:** citar 137/181 (76 %) como churn — que é reprodutível por prefixo — e tratar a fatia "conta→ads" como **faixa de 47–63 %**, com o classificador explícito |
| **C-02** | **"P1/P2 não implementados" (E5) vs "declarados"** — o E5 lista Saved Views, Saved Search, Collections/Basket, Lifecycle/Recovery, Event Backbone, Capture/Inbox, Follow/Alerts, Collaboration, search semântico, sync como "não implementados", o que se lê como "não declarados" | O registo **declara** essas capabilities (`CAP-SAVED-VIEW`, `CAP-SAVED-SEARCH`, `CAP-COLLECTION`, `CAP-BASKET`, `CAP-INBOX`, `CAP-SEMANTIC-SEARCH`, `CAP-SHARE`, `CAP-COMMENT`) — existem, em `CANDIDATE_HOLD` | **RESOLVIDA** | Distinção: **"não implementada" ≠ "não declarada"** `[P-SB]` §8 nota 1. O E5 misturava as duas. O que falta é **implementação** e **ligação ao serviço** |
| **C-03** | **Contagem de serviços.** "410 serviços lógicos" (E5 e README) vs. o catálogo que tipa **305 `LOGICAL_SERVICE` + 105 `EXPERIENCE_CAPABILITY_GROUP`** `[V]` | O número 410 está certo; a **designação** não. 105 entradas são grupos de capability, não serviços | **RESOLVIDA** | `catalog/service-catalog.v1.json` → `summary.services = 410`; `kind` distingue os dois. **Regra:** citar "410 entradas de catálogo, 305 serviços lógicos" |
| **C-04** | **Testes e gate.** E5: "70/72 testes verdes (45 família + 20 capability + 5 piloto)" e "gate 11/11". README local: "70/70 verdes (45+20+5)" e "gate 8/8". Árvore real: **73** declarações `test(` (45 + 20 + **8** piloto) e **11** checks no gate `[V]` | Três contagens diferentes para o mesmo objecto | **ABERTA — NOT_RUN** | O gate tem 11 checks (E5 acertou; o README está desatualizado em "8/8"). A contagem de testes não bate com nenhuma das duas versões. **Nenhum comando foi executado nesta ronda**: `npm test`, `npm run build`, `generate-skeleton.mjs --check` e `check-skeleton.mjs` ficam por correr. `NOT_RUN` com motivo: a execução de build/teste não foi parte do mandato desta frente de síntese, e o `[P-BP]` §8 já registou que também não os correu |
| **C-05** | **O briefing diz que a produção exercita "alerts".** A produção só tem **"Alerta Clínico Precoce"** — nome de protocolo do NEWS — e **nenhum evento de notificação** medido `[P-CF]` T3.5 | Um pressuposto errado do briefing gera uma capability "já existe em produção" que não existe | **RESOLVIDA** | `CAP-ALERT`/`CAP-DEADLINE-ALERT`/`CAP-CHANGE-ALERT`/`CAP-DIGEST`/`CAP-REMINDER` estão **declarados** mas **não exercitados** → divergência de *exercício*, não de vocabulário. `CAP-SAFETY-ALERT` é o único que é clínico. `[P-BP]` linha 15 confirma ("sem alarme pessoal") |
| **C-06** | **"NOT_RUN para as 5 normas" (federal) vs. "texto integral capturado" (enfermagem)** | Parece contraditório: `Res. Cofen 736/2024` e `Portaria 6.734/2025` têm texto integral NOT_RUN na frente federal | **RESOLVIDA** | Os NOT_RUN da frente federal são **do escopo da API do Senado** (que não devolve corpo de artigo e não indexa normas infralegais). A frente de enfermagem capturou os textos por **outro caminho** (Cofen/DOU/MS), com SHA-256. **Nenhuma das duas afirmações está errada.** Regra: o texto existe; o que **não** existe é texto na API do Senado |
| **C-07** | **"Concorrência / collaboration / sync" no registo vs. promessa "sem cadastro"** | 12 caps `SHARING_COLLAB` (6,0 %) + `sync_support` contra uma política que promete uso sem cadastro, login e sem dados pessoais | **NÃO RESOLVIDA — decisão do dono** | Decisões **c-01** (a promessa é vinculante?), **d-03** (sync) e **d-06** (collaboration/TTS). Enquanto não houver decisão, o registo e a promessa não podem coexistir como ambos válidos. Nota: a promessa é do *site*; o esqueleto é um *espelho local*. A divergência é de **escopo de produto**, não de contrato |
| **C-08** | **Conclusão de mercado (concorrência) obtida por `web_fetch` falhado.** `healthcalculum.com` foi lida por **extracção do motor de busca**; `rosaclinica.com.br` foi lida por fetch directo (71 escores, "abertas, sem login") `[P-BP]` §6 | Afirmação de mercado sem fetch directo tem confiança diferente | **RESOLVIDA (com ressalva explícita)** | `[P-BP]` nota 5 já o declara. **Regra:** `healthcalculum` é **confiança média**; `rosaclinica`, `escolaedti` e `educapes` são **confiança alta** (fetch directo, URL e data) |
| **C-09** | **"19 idiomas"** é tratado como estado de produção em `[P-CF]` T1.15 e `[P-SB]`, mas o E2 regista que `src/lib/locale-registry.ts` **não existe no `main`** de nenhum dos dois repositórios verificados `[E2]` | O número dos 19 vem do registo do repo de governança e de nomes de branch, não de medição de produção | **ABERTA — NOT_RUN** | **Não afirmar 19 idiomas como estado de produção.** Estado correcto: "há trabalho de localização em 19 idiomas *e* um registo de locales no repo de governança; **a sua existência no `main` do repo público não está verificada**". `NOT_RUN` com motivo: `src/lib/locale-registry.ts` ausente no `main` (verificação do owner, E2) |
| **C-10** | **NANDA/NIC: "a produção declara NANDA-I (2018)"** vs. **`ano_inclusao` preenchido em 2 de 281 registos** e **25 rótulos de domínio duplicados** `[V]` | A edição declarada na página não está no dado | **RESOLVIDA** | A edição é uma **afirmação da página**, não um metadado do ficheiro. O esqueleto não pode herdar a afirmação: precisa de `code_system_version` por item. `CANDIDATE_HOLD` + HOLD de direitos (Thieme) |
| **C-11** | **`find-register.v1.json` não existe no esqueleto local**; os 16 FINDs da PR #21 vivem só no ficheiro da branch `feat/career-youth-db-first-20261026` @ `ad4c683890` `[E2]` | Sem registo de FIND não há baseline de não-regressão: cada achado perde-se | **ABERTA** | **a-19**: criar o *divergence register* a partir da TABELA-MESTRE, com dono, evidência e decisão por linha. Nota: `src/families/audit-assurance/finding-registry` existe **como família de serviço**, mas sem schema de registo `[V]` |
| **C-12** | **Qual das 4 variantes `audit/billing-ads-*` é a canónica** | Quatro nomes, uma fundida, três não; ~970 KB de órfãos | **NÃO RESOLVIDA — decisão do dono** | **c-12**. Requer leitura de código das branches. `NOT_RUN` com motivo: "conteúdo real de qualquer branch — NOT_RUN; nenhum `git show` por branch" `[P-RP]` §8 |
| **C-13** | **Escopo app × web** (`/politicaapp.html` × plataforma web) | Promessa do app sem ads/servidores vs. web com ads/GA4/Supabase | **NÃO RESOLVIDA — por apurar** | **c-13**. **Não é contradição provada**: escopos diferentes. Torna-se contradição se o app/CE herdar o modelo web. `NOT_RUN`: nenhuma árvore de build do app foi inspecionada nesta frente |
| **C-14** | **Contagem de "33 secções" e "87 slots de artigo"** circulou em versões anteriores do `[P-BP]` e foi removida na rev. 3 | Números sem fonte | **RESOLVIDA** | O plano canónico tem **28 secções**; o esqueleto tem **45 famílias de serviço** e **3 de 16 objectos com schema**. Nenhum dos números removidos é usado neste relatório |
| **C-15** | **A fonte de `tool-sources.v1.json` e `tool-bindings.v1.json` não existe neste sandbox** `[V]` → **CORRIGIDO (owner, 01/11): os ficheiros EXISTEM** em `/workspace/repo/contracts/entities/` (e no repo canónico `IndiciumFIN/dev-chatgpt-workspace`) | Medições **re-verificadas pelo owner** em 01/11 (L-11): 6/6 `source_type` fora do enum + 6/6 `sha256` de 64 zeros; **78/78** bindings com `authority_class`/`decision` fora do enum ou ausentes (**46** com `decision: BOUND` + 32 sem o campo) — o número **46/78** que circulava contava só os com valor, não os ausentes | **FECHADA — CONFIRMADA** | Nenhuma acção: a contradição estava no relatório, não no repo. Corrigido em L-11, C-15 e A-21. |
| **C-16** | **A secção 3.3 do `[P-NE]` reintroduz os rótulos `SUSTENTADA` / `METADADO APENAS` / `NÃO VERIFICADA` / `DIVERGENTE`, que a secção 2.2 do mesmo documento diz proibir** (doutrina `CKO-AI-INS-LIC-001` rev 1.1.0: "proibido inventar enums para classificar evidência") | O mesmo entregável afirma e nega o uso de um enum transversal | **NÃO RESOLVIDA — método** | A doutrina proíbe enums **novos**; os rótulos do `[P-NE]` são pré-existentes no vocabulário do repo e a §2.2 reescreve a classificação como FIND. Mas a **contagem** da §3.3 ("4 sustentadas, 4 metadado, 6 não verificadas, 2 divergentes") é uma enum de facto. **Regra deste relatório:** uso as **4 perguntas** (fonte / material / direitos / o que prova) como forma de leitura, e não os rótulos; a classificação canónica fica FIND (secção 6 do `[P-NE]`) |

---

## 8. Deltas acionáveis classificados

> Classificação obrigatória: **(a) corrigir o esqueleto agora** — alteração estrutural, sem tocar em oferta comercial, sem criar promessa; **(b) implementar no roadmap** — entra em wave, com momento; **(c) decisão do dono** — não é minha; **(d) fora de âmbito** — não fazer agora, com o motivo.
> **Totais: (a) 20 · (b) 17 · (c) 13 · (d) 6 = 56 deltas.**
> **Nenhum item de (a) ou (b) implica promoção, `ADMITTED` ou WORK Order.** Promoção exige FIND → política → validador → WO → OPA → Kernel → testes → auditoria → decisão humana `[E5]`.

### (a) Corrigir o esqueleto agora — 20 itens, estruturais, sem oferta comercial

| ID | Delta | Onde exactamente | Porque (produção / repo / normativos / benchmark) | Bloqueado por |
|---|---|---|---|---|
| **a-01** | Declarar **4 eixos transversais ausentes**: `Identity/Account`, `Billing`, `Entitlement`, `Telemetry/Consent` — como famílias transversais, **não** como capabilities de domínio | `catalog/capability-registry.candidate.v0.1.json` + as 45 famílias | 114/181 branches (63 %) são, pelo nome, do núcleo conta→cobrança→ads `[P-RP]`; nenhuma família correspondente existe | Decisão **c-01** (a promessa "sem cadastro" é vinculante?) — **o delta estrutural não depende da decisão** |
| **a-02** | Declarar `Entitlement` como **estado resolvido com *reason codes***: `guest` · `sem_plano` · `pagamento_pendente` · `verificando` · `ativo` · `expirado` — nunca booleano | `src/core/experience/resolver.ts` + `profile-contracts.ts` | `fix/account-subscription-verifying-state` @ `40c5d466` prova o estado "verificando" em produção; `resolver.ts` devolve estados mas sem plano/tier/reason code | — |
| **a-03** | **Regra dura no metamodelo:** *entitlement só existe com `owner_scope = ACCOUNT`*; `SESSION`/`LOCAL_DEVICE` nunca são fonte de autorização | `src/core/experience/metamodel.ts` (fail-closed) + `state.ts` | 6+ branches `fix/premium-access-root-cause` e `fix/billing-access-empty-entitlement` — a lição já foi paga em produção | — |
| **a-04** | Declarar `ACCOUNT`/`WORKSPACE` como **reservados e sem backend**, com o mesmo fail-closed dos 410 serviços — **não simular** | `state.ts` + `module-status.ts` | `policy_refs`/`audiences` dependem de servidor; simular entitlement local é o pior desfecho possível | Decisão **c-05** (o CE local terá backend?) |
| **a-05** | **Desambiguar `SESSION` (aba) de `LOCAL_DEVICE` (máquina)** no modelo; e desambiguar **"sync"**: `sync_entitlement` (produção) vs `sync_user_data` (blueprint) | `state.ts` + glossário do registo | FIND: *"ToolViewBar grava configuração em `sessionStorage`"* — por aba, não por máquina `[E2]`; produção usa "sync" para reconciliação de webhook `[P-CF]` T2.4 | — |
| **a-06** | **Preencher os campos em falta do registo** — `supported_channels`, `permission_policy`, `audiences`, `policy_refs`, `help_profile_ref`, `preview_profile_ref`, `output_profile_refs`, `storage_policy`/`sync_policy` (renomear), `accessibility_contract_ref`/`telemetry_contract_ref` (renomear) | `catalog/capability-registry.candidate.v0.1.json` (14 campos → 20) | São exactamente os campos onde vivem consentimento, canal (extensão Chrome `chatgpt/index-extensoes-chrome-20261004` @ `e7ba18df`) e audiência. Metamodelo já os declara `[V]` | Passagem por FIND (doutrina §6) |
| **a-07** | **Reescrever `telemetry_contract` como contrato**, com os nomes de evento **já em produção** (`subscription_checkout_*`, `subscription_payment_*`, `page_view`, `session_start`, `first_visit`, `user_engagement`, `scroll`, `click_menu_*`, `click_calcular_*`, `tempo_permanencia`) | `telemetry_contract` (hoje string) → contrato com `privacy_class` e `retention_policy_ref` | `/metricas.html` já publica esses eventos; o esqueleto não conhece nenhum. E evento correlacionado com checkout é identidade (LGPD art. 5 II) | — |
| **a-08** | **Criar schema `Collection` / `CollectionItem`** — com `owner_scope` explícito, `privacy_class`, `retention_policy_ref` | `schemas/` (novo) | `CAP-COLLECTION` e `CAP-SMART-COLLECTION` estão declarados e não têm contract; o FIND "Favorite é só estado de visita" mostra que o objecto real não é o modelado | — |
| **a-09** | **`authorityBinding` estruturado** no `ClinicalTool`: `sourceIds[]` (lista, não escalar), `pinpoint` por campo, `edition`, `effectiveFrom`/`effectiveUntil`, `rights` (com `scope`), `decision` (`ALLOW`/`HOLD_HUMAN`/`REJECT`/`NOT_APPLICABLE_JUSTIFIED`), `authorityClass` (enum canónico), `evidenceRefs[]`, `observedMaterial`, `normativeAssertions[]`, `terminologyBindings[]` | `schemas/clinical-tool.v1.json` (hoje: 5 chaves, `rule` em texto livre) | PN COFEN 1/2024, Res. 736/2024 e Portaria 6.734/2025 **já têm texto capturado com SHA-256** e não têm onde ser declaradas `[P-NE]` §5.2 | Passagem por FIND |
| **a-10** | **Criar schema `Norm`** — `normType`, `issuingAuthority`, `officialIdentifier`, `edition`, `jurisdiction`, `publication` (DOU: data, edição, secção, página, código), `effectiveFrom`, `effectiveUntil`, `viges`, `revokes[]`, `amendedBy[]`, `relatedActs[]`, `source`, `rightTexts[]` (com `pinpoint`, `quote`, `ocrMethod`, `ocrReviewedBy`), `atoms[]`, `claims[]` | `schemas/norm.v1.json` (novo) | `Norm` é 1 dos 16 `object_type` com **14 capabilities ligadas e zero schema** `[V]`; sem isto não há onde meter a Res. 736/2024, o PN 01/2024, a Lei 5.905/1973 ou a Portaria 6.734/2025 | — |
| **a-11** | **Regras de `CANDIDATE_HOLD` executáveis**, não documentais: `ADMITTED` não pode coexistir com `decision = HOLD_HUMAN`, `rights ≠ comprovado`, `sha256` de 64 zeros, `snapshot_ref = PENDING_SNAPSHOT`, conteúdo `OCR_UNREVIEWED`, ou fonte de vigência sem `effectiveFrom` | validador (gate) | `[P-NE]` §5.3; hoje o esqueleto tem `CANDIDATE_HOLD` por omissão mas **não tem o validador que recusa a promoção** | — |
| **a-12** | **Modelo de vigência** por item e por afirmação (`effectiveFrom`/`effectiveUntil`, `viges`, `amendedBy`) e **`notifiableListVersion`** | `schemas/norm.v1.json` + `clinical-tool.v1.json` | Lista de Notificação: item 4 = Botulismo (6.734/2025) → item 4 = Anomalias Congénitas / item 5 = Botulismo (11.211/2026) `[V]` | — |
| **a-13** | **`ocrMethod` + `ocrReviewedBy`** no modelo; `OCR_UNREVIEWED` ⇒ `HOLD_HUMAN` | `schemas/norm.v1.json` (`rightTexts[]`) | Anexo do Código de Ética (16 p.) e Res. 545/2017 (4 p.) são **imagem pura**; `FND-COFEN-003` já registado | — |
| **a-14** | **`terminologyBindings[]`** com `codeSystem`, `codeSystemVersion`, `conceptCode`, `canonicalLabelKey`, `rights`; e `terminologyRefs` de `LibraryEntity` a passar de `string[]` a objectos | `schemas/library-entity.v1.json`, `schemas/clinical-tool.v1.json` | `banco_nanda.json`: 281 itens, `ano_inclusao` em 2/281, 25 rótulos de domínio duplicados `[V]`; `terminology.schema.json` previsto e não implementado | Decisão **c-11** (licença de reprodução) |
| **a-15** | **`Article.sourceRefs` → `reference.schema.json`** (`source_id`, `citation_style`, `locator` com `pinpoint`, `accessed_at`, `rights_status`); `rights.status` deixa de ser string livre; `body` exige `bodyRights` **distinto** de `rights` | `schemas/article.v1.json` | `reference.schema.json` **já existe** no repo e o `Article` **não o usa** `[P-NE]` §5.2 | — |
| **a-16** | **Corrigir o contrato de saída antes de escrever `output.ts`**: reconciliar `print`/`pdf`/`docx`/`listen` com o `template-contract` de produção | `profile-contracts.output` + `output.ts` (P0) | FIND: *"template-contract mistura favorite/print/pdf/docx/listen/readingTime"* `[E2]` → risco de duas verdades para a mesma saída | — |
| **a-17** | **Modelar o par guest × conta no fórum**: pseudónimo obrigatório + `moderation_state` + `report` + `retention_policy_ref`, mesmo sem backend | `Capture/Inbox` + `Collaboration` (P1/P2) | O fórum já pede nome/profissão/local de trabalho **sem moderação**; 12 serviços `community` (incluindo `moderation`) existem sem capability | Decisão **c-08** (o fórum entra no CE?) |
| **a-18** | **Criar o *divergence register*** produção↔esqueleto: cada linha da TABELA-MESTRE vira FIND com dono, evidência, impacto e decisão | junto ao `find-register.v1.json` | Os 16 FINDs da PR #21 não estão num registo de FIND `[E5]` item 9; sem baseline de não-regressão, cada achado perde-se | — |
| **a-19** | **Regra de integridade das capturas**: nenhuma fonte usada sem `sha256` real + `snapshot_ref` preenchido; o manifesto de hashes **não se inclui a si próprio** | procedimento de captura + `tool-sources.v1.json` | `tool-sources.v1.json` tem `sha256` = 64 zeros e `snapshot_ref = PENDING_SNAPSHOT` em **6/6** `[P-NE]` §5.4; e o `SHA256SUMS.txt` anterior tinha uma auto-referência inválida `[P-NE]` §2.3 | — |
| **a-20** | **Regra de rastreabilidade partilhada**: nenhuma afirmação sobre a produção entra num relatório sem **captura com SHA-256** no repositório comum; as capturas das duas frentes de produção passam a ser **disjuntas** (F1 e F4 não partilham ficheiro) | procedimento de captura + `outputs/*/capturas-*/` | As tensões T1–T3 de F1 (`[P-CF]` §7) **não têm hash verificável**; as afirmações normativas de F4 **não têm leitura directa do conteúdo legal do site** (§3) | — |

### (b) Implementar no roadmap — 17 itens, com momento

> Momento canónico = matriz de prioridade do `EXPERIENCE-PLATFORM-MIGRATION-ROADMAP-v0.1.0.md` (14 waves) `[E5]`. Momento recomendado = o que a síntese propõe; desvios estão assinalados e justificados.

| ID | Delta | Momento canónico | Momento recomendado | Justificação do momento |
|---|---|---|---|---|
| **b-01** | **Event Backbone + instrumentação mínima** (`events.ts`): contrato de evento canónico (19 eventos do plano §21 + 4 propostos: `CALCULATOR_COMPLETED`, `SIMULATION_ATTEMPT_STARTED`, `SIMULATION_ATTEMPT_COMPLETED`, `PRINT_REQUESTED`); append-only, first-party, sem dado clínico no evento (só `object_type`, `object_id`, `capability_id`, timestamp, locale) | **P1** (Wave 11) | **P0 — desvio justificado** | Sem telemetria nenhuma escolha de capability é defensável por dado. O produto **já tem** instrumentação (GA4 + Edge Function) — o que falta é o contrato, não a Recolha. É o item mais barato e o único que reduz incerteza de todos os outros `[P-BP]` G1 |
| **b-02** | **`output.ts`** — ficha imprimível com **versão da escala, faixa de risco adoptada e a fonte do corte** | **P0** (Wave 7) | **P0 — sem desvio** | É a **única superfície offline já em produção** ("+60 escalas"). É o diferencial contra `educapes.capes.gov.br` (gratuito) e `rosaclinica.com.br` (71 escores, sem login): nenhum dos dois entrega versão + corte + registo `[P-BP]` G2, §6 |
| **b-03** | **`help.ts`** — Help contextual = "de onde veio este corte"; o `pinpoint` e a edição à vista | **P0** (Wave 5) | **P0 — sem desvio, emparelhado com b-02** | Responde à divergência Aldrete; e Help deve ser o **único** lugar onde o texto clínico vive, para não traduzir o mesmo texto em 19 idiomas `[P-BP]` G3 |
| **b-04** | **`preview.ts`** — "conferir sem sair da lista": preview de `ClinicalTool` = tabela de pontuação + faixas + fonte + aviso de versão | **P0** (Wave 5) | **P0 — sem desvio** | Objectivo literal do plano §9. Cuidado: o preview existente é **infra de embed**, não Product Preview `[FIND]-005` |
| **b-05** | **`capabilities.ts` + `action-bar.tsx`** | **P0** (Wave 1 / 4) | **P0, mas depois de b-01/b-02/b-03** | São **pré-requisito técnico, não valor** — não mudam nada para a enfermeira até haver conteúdo e um action bar que resolva algo `[P-BP]` §2 |
| **b-06** | **`views.ts` limitado a 2 tipos**: `ClinicalTool` e `Article` (grid/list/gallery, filtro, sort, saved view pessoal, coleção, cesta) | **P1** (Wave 8) | **P1, limitado a 2 tipos** | 16 tipos de objecto, 13 sem schema → construir casa sem cidade. Materializa a "Área" como composição de projeções (Notion) mas só quando há conteúdo por trás `[P-BP]` G5 |
| **b-07** | **Lifecycle / Recovery + higiene** (duplicados, link quebrado, stale, source changed), **só objectos pessoais** | **P1** (Wave 9) | **P1, com a ressalva** | "Archive pessoal ≠ Retired canónico". Conteúdo canónico segue release/governança. Sem `authorityBinding` (a-09/a-12), versionar é versionar rumor `[P-BP]` G4 |
| **b-08** | **Saved Search como objecto distinto** (guarda critérios, não resultados) + `CAP-SAVED-SEARCH` exposto | Wave 1 do roadmap pede o schema | **P1, dentro de b-06** | Zotero: coleção é associação persistida, Saved Search é consulta persistida, SmartCollection é projecção dinâmica — **três objectos, não um** `[E4]` |
| **b-09** | **Expor os 9 serviços `selections`** (edital→convocação) por capability, começando por `Question` | — (não está no roadmap) | **P1 — gap real do roadmap** | A máquina de simulados de concurso existe e não é alcançável. **8 dos 9** têm serviço sem objecto nem capability `[P-SB]` §4 |
| **b-10** | **8 contratos de dados** para os elementos do ciclo de concurso (Selection Process, Edital, Cargo, Exam, Answer Key, Appeal, Result, Convocation) | — | **P1 — com b-09** | Mesma fonte. Não faltam serviços; faltam contratos |
| **b-11** | **`evidence-claims` exposto**: `authority-binding`, `contradiction-detection`, `applicability-service`, `lineage-service` ligados a capabilities | — (não está no roadmap) | **P1 — com b-02/b-03** | É o motor que responde ao `FIND-CTR-010`. **Nenhuma das 201 capabilities o expõe** `[P-SB]` §2.1 |
| **b-12** | **`community` exposto**: `moderation`, `abuse-report`, `identity-aware-profile` ligados a capabilities | — | **P2 — condicionado a c-08** | 12 serviços com 0 capability; o fórum de produção não tem moderação. Não construir antes da decisão |
| **b-13** | **Capturar texto consolidado das 3 leis** (`normas.leg.br` / LexML / Planalto) e abrir `Norm` para as 3 | — (não está no roadmap) | **P1 — dependente de NOT_RUN resolvido** | Confirmadas como existência e identificação; **texto de artigo NOT_RUN**. Comandos prontos em `[P-NE]` §7.1 e `[P-NF]` §7.3 |
| **b-14** | **OCR do Anexo da Res. COFEN 564/2017** (Código de Ética, 16 p.) com revisão humana e double-check | — | **P1 — dependente de revisor humano** | `OCR_UNREVIEWED` ⇒ `HOLD_HUMAN`. Não é automatizável |
| **b-15** | **Fixar a edição NANDA-I / NIC** e obter **direitos de reprodução** (ou publicar apenas códigos) | — | **P2 — dependente de c-11** | `banco_nanda.json` (281) e `banco_nic_completo.json` (593) sem edição; Thieme tem direitos |
| **b-16** | **Rotina de vigência** da Lista Nacional: `CAP-SOURCE-CHANGE`, `CAP-STALE-DETECTION`, `CAP-EXPIRATION` ligados a uma rotina que verifica a versão em vigor | — | **P1 — com b-07** | Três versões em circulação (6.734/2025, 10.175/2026, 11.211/2026); uma só lista em vigor |
| **b-17** | **Schemas de `Guide`, `MediaAsset`, `Question`, `Simulation`, `Competition`, `Course`, `Trail`** | Wave 1 do roadmap (parcial) | **P1/P2, pela ordem de uso** | 13 dos 16 objectos sem schema. Prioridade: `Question`/`Simulation` (produção viva), depois `Competition`, depois o resto |

### (c) Decisão do dono — 13 itens, com alternativas e custo de erro

| ID | Decisão | Alternativas | Impacto se mal decidida | Deltas que ficam bloqueados |
|---|---|---|---|---|
| **c-01** | A promessa "sem cadastro e sem dados pessoais" da política é **vinculante**? | (a) manter política → sem login/ads/GA4/fórum; (b) manter produto → reescrever política | Passivo jurídico + perda de confiança | a-01 (parcial), a-17, b-12, d-03, d-06 |
| **c-02** | **Preço e conteúdo do plano** Premium — o que destrava além das escalas em branco? | — | Plano opaco: "desbloquear recursos exclusivos" sem lista. **NOT_RUN**: `/assinatura` devolveu `file load failed` | a-02 |
| **c-03** | **Um ou dois PSPs?** Asaas + Stripe em simultâneo é a ordem canónica? | (a) Asaas só; (b) Asaas BR + Stripe internacional; (c) adiar checkout | Dupla cobrança, entitlement ambíguo | a-02, a-03 |
| **c-04** | **Ads para utilizador free** junto de conteúdo clínico? Premium "sem anúncios" é requisito ou benefício? | ads controlados / ads removidos / ads só em não-clínico | **Dark pattern**: cliente pago vê anúncio | d-02 |
| **c-05** | **O CE local terá backend algum dia?** | sim / não | Se não, `ACCOUNT`/`WORKSPACE` ficam permanentemente reservados e a produção **não pode** ser espelhada localmente | a-04, d-03 |
| **c-06** | **O dashboard público de métricas (país/cidade/utilizadores) é compatível com a política de privacidade?** | manter / anonimizar / remover | Privacy | a-07, b-01 |
| **c-07** | **Coleções guardam conteúdo ou paciente?** | conteúdo apenas / conteúdo + identificador | Colecção com identificador de paciente entra no art. 5 II da LGPD | a-08 |
| **c-08** | **O fórum entra no CE?** Com moderação? Identidade real ou pseudónimo? | (a) sim, com `moderation_state`; (b) sim, sem UGC; (c) fora do escopo do CE | UGC sem moderação é passivo de saúde | a-17, b-12 |
| **c-09** | **Aldrete: corrigir o corte no site (9→8) ou manter a ferramenta em HOLD?** | corrigir / HOLD / publicar com aviso explícito | **Dano assistencial** até decidir | a-09, a-11, b-02, b-03, b-11 |
| **c-10** | **Qual é a versão canónica da Lista de Notificação** para os simulados? | 11.211/2026 (mais recente) / versão da data do simulado / manter 6.734/2025 com aviso | Erro em prova e em serviço; numeração de itens engana | a-12, b-16 |
| **c-11** | **NANDA/NIC: obter licença de reprodução, ou publicar apenas códigos?** | licença / só códigos / retirar | Reprodução de obra protegida (Thieme) sem autorização | a-14, b-15 |
| **c-12** | **Qual das 4 variantes `audit/billing-ads-*` é a canónica?** | — | Perder ~970 KB de órfãos ou portar duas verdades | d-01, d-02 |
| **c-13** | **O escopo do app (e do CE local) herda ads/GA4/conta da plataforma web?** | (a) app 100 % local e anónimo; (b) app igual ao web | Se (b), nasce a tensão app×web | — |

### (d) Fora de âmbito — 6 itens, com o motivo explícito

| ID | Item | Motivo |
|---|---|---|
| **d-01** | **Portar código de checkout/entitlement** das branches `audit/billing-ads-*` e `base44/setup-*` para o esqueleto | Não há modelo de entitlement. Portar checkout sem `owner_scope` + reason codes é exactamente o bug que 6+ branches `premium-access-root-cause` já tentaram corrigir — levar o sintoma sem o modelo repete a dívida `[P-RP]` §7 |
| **d-02** | **Portar as duas políticas de ads** (`audit/billing-ads-hardening-clean-20260914`, fundida, vs. `feat/ads-controlado`, não fundida) | Duas políticas em paralelo. O esqueleto tem de decidir **uma**; portar as duas cria duas verdades `[P-RP]` §6 |
| **d-03** | **Sync multi-dispositivo** (Readwise) | Requer base legal (consentimento ou tutela da saúde), encarregado, retenção, export/delete. Transforma estado local em dado pessoal sensível de saúde. O `owner_scope` já canónico dá a resposta: Guest → Session → Local Device. Wave 12 do roadmap; **não agora** `[P-BP]` §3 |
| **d-04** | **Portar `chatgpt/simulados-etapa-02-piloto-execucao-20261004` @ `fdc25388`** (33.255 B órfãos: `transformar_piloto_simulado_de_enfermagem.sql`) | Sequência de trabalho a meio — **não portar sem ler** `[P-RP]` §6 |
| **d-05** | **Apagar ou arquivar as branches `backup/*`** (10 baselines) | **Medido:** 9 das 10 **já estão fundidas em `main`** (`git merge-base --is-ancestor`, 01/11) → o conteúdo está a salvo no histórico e o que se perde é o **rótulo**; **1 NÃO está fundida** (`fix-supabase-preview-migration-baseline-2026-09-20`) → é a **única com risco de conteúdo** e precisa de decisão antes de qualquer limpeza. **Não apagar sem registo** — registar como baseline com dono `[P-RP]` §6, §9 nota 3 |
| **d-06** | **TTS / read aloud, collaboration/shared views, web-archive** | Colidem com a promessa "sem cadastro/login e sem dados pessoais"; `listen` está diluído em `pageToolIds` junto de `pdf`/`docx` — capability e formato no mesmo nível; web-archive exige direito de armazenamento e redistribuição provado (HOLD). Demanda `NOT_RUN` `[P-BP]` §3 |

---

## 9. Riscos duros: guest-first e Clinical Safety

> O briefing é explícito: guest-first e Clinical Safety são **requisitos duros**, não sugestões. Esta secção existe para que nenhuma revisão os tratasse como negociação.

### 9.1 Guest-first — requisitos

| # | Requisito | Como está | Onde está violado hoje | Garantia |
|---|---|---|---|---|
| **G-1** | Nenhuma **barreira de login** no caminho L1: calcular, ler, imprimir a própria escala, sem cadastro | Confirmado na produção (`/objetivo.html`, `/politicaapp.html`) e no esqueleto (`GUEST_SCOPES = [SESSION, LOCAL_DEVICE]`) | Em nenhum ponto medido | Regra do registo: `CAP-PRINT`, `CAP-DOWNLOAD`, `CAP-COPY-RESULT`, `CAP-CALC-STEPS` têm de continuar a admitir `guest_support` |
| **G-2** | O estado do cliente **não sai do device** por via do esqueleto | `LOCAL_DEVICE` declarado; produção: "nenhum dado é enviado aos nossos servidores" (`/politicaapp.html`) | Se `ACCOUNT`/`WORKSPACE` forem simulados localmente | **a-04** — `ACCOUNT`/`WORKSPACE` reservados e sem backend |
| **G-3** | **Entitlement nunca local** | `owner_scope` tem `ACCOUNT` | Nenhum — mas a regra não está escrita | **a-03** — regra dura no metamodelo, fail-closed |
| **G-4** | **Nenhum objecto de sincronização** de estado clínico | Wave 12 do roadmap é P2 | Nenhum | **d-03** + **b-01** (evento sem dado clínico: só `object_type`, `object_id`, `capability_id`, timestamp, locale) |
| **G-5** | A **promessa publicada** é ou vinculante ou reescrita — não pode ficar ambígua enquanto o registo declara 12 caps de colaboração | Política do site nega coleta e nega login; o site tem login, checkout, GA4, fórum | **T1, T2, T3** `[P-CF]` §7 | **c-01** — decisão do dono, com prazo |
| **G-6** | **Ausência de medição não é prova de ausência** | O briefing tratava "alerted" como exercitado pela produção | Pressuposto corrigido | Regra editorial desta síntese e dos 6 entregáveis |

### 9.2 Clinical Safety — requisitos

| # | Requisito | Como está | Onde está violado hoje | Garantia |
|---|---|---|---|---|
| **S-1** | **Nenhum valor de escore, faixa, dosagem ou classificação diagnóstica sem fonte preservada e pinpoint** | `ClinicalTool.authorityBinding` tem `sourceId` obrigatório; **restantes `null`**, `rule` em texto livre `[V]` | Todas as ferramentas que não tenham a fonte capturada | **a-09** (`pinpoint` por campo) + **a-11** (validador que recusa `ADMITTED`) |
| **S-2** | **Nenhuma fonte com `sha256` de 64 zeros ou `snapshot_ref = PENDING_SNAPSHOT`** | 6/6 em `tool-sources.v1.json` `[P-NE]` §5.4 | Todo o registo de fontes | **a-19** |
| **S-3** | **Conteúdo de OCR sem revisão ⇒ `HOLD_HUMAN`** | Anexo do Código de Ética e Res. 545/2017 são imagem pura | Qualquer átomo extraído desses PDFs | **a-13** + **b-14** |
| **S-4** | **Direitos de reprodução provados, por acto (ler ≠ extrair ≠ redistribuir ≠ enviar a terceiro)** | NANDA/NIC são obra protegida (Thieme); Definitions, Defining Characteristics e Activity Lists são texto protegido | A publicação de `banco_nanda.json` (281) e `banco_nic_completo.json` (593) | **a-14** + **c-11** + `CANDIDATE_HOLD` |
| **S-5** | **Toda a afirmação sobre norma leva versão e vigência** | 3 versões da Lista Nacional em circulação; Lei 8.080/1990 com 43 `vides` | Lista de Notificação, NANDA/NIC, PN 01/2024 | **a-12** + **b-16** + **c-10** |
| **S-6** | **Nenhum parágrafo marcado "Acréscimo Vetado" afirmado como vigente** | Arts. 15-D e 15-E da Lei 7.498/86 (Leis 14.434/2022 e 14.602/2023) e arts. 19-E §§1º-2º e 19-G §§1º-A-1º-B da Lei 8.080/90 (Lei 14.021/2020) estão marcados "Acréscimo Vetado" `[P-NF]` §5.5 | Qualquer tela que os afirme | Regra editorial; a redacção tem de ser checada no DOU |
| **S-7** | **Nenhum ficheiro de saída sem versão, faixa e fonte do corte**; e nenhum PDF de prontuário com identificador de paciente sem aviso | `/news.html` pede "Nome do paciente", "Setor/Leito", "Profissional/Avaliador" e sai "Salvar PDF"/"Imprimir" `[P-CF]` T1.12 | Todos os outputs | **b-02** + **a-16** |
| **S-8** | **Divergência fonte ↔ valor publicado gera FIND e HOLD, nunca correcção silenciosa** | FIND-CTR-010 (Aldrete) confirmado com fonte primária `[P-NE]` nota 5 | A divergência está **aberta** desde antes desta ronda | **a-11** + **a-18** + **c-09** |

---

## 10. Anexos

### Anexo A — Inventário de evidência (o que existe, com estado de integridade)

> **Convenção de referências na coluna "Usada em":** `B-1`, `C-2`, `D-6` (um dígito) são **linhas da TABELA-MESTRE** (§4) · `L-01`…`L-17` são **linhas da cadeia de evidência** (§5) · `C-01`…`C-16` (dois dígitos) são **contradições e incertezas** (§7) · `A-01`…`A-21` são **linhas deste Anexo A** · `a-xx`/`b-xx`/`c-xx`/`d-xx` são **deltas** (§8).

| # | Evidência | Ficheiro / origem | Integridade | Usada em |
|---|---|---|---|---|
| **A-01** | `E1` Superfície de produção (texto extraído) | `evidence_pack/E1-producao.md` | Pacote, sem hash | L-13, L-14, B-1…B-7 |
| **A-02** | `E2` Repo público e branches (30, corrigido para 182) | `evidence_pack/E2-repo-branches.md` | Pacote | L-05, L-06, C-09 |
| **A-03** | `E3` Camada normativa e doutrina | `evidence_pack/E3-normativos.md` | Pacote | C-1…C-7, secção 9 |
| **A-04** | `E4` Plataformas de referência | `evidence_pack/E4-benchmarks.md` | Pacote | D-1…D-6 |
| **A-05** | `E5` Esqueleto CE (estado medido) | `evidence_pack/E5-esqueleto.md` | Pacote | L-12, L-16, D-2…D-6 |
| **A-06** | Lista oficial de branches (182 refs, sha) | `evidence_pack/branches-todas.json` | 0 divergências vs. clone (`git for-each-ref`) | L-05, L-06, TABELA-MESTRE |
| **A-07** | Lista original de branches (30) — **substituída** | `evidence_pack/branches-publicas.json` | **Superada** por A-06 | nota em L-06 |
| **A-08** | Registo de 201 capabilities | `ce-skeleton/catalog/capability-registry.candidate.v0.1.json` | Leitura directa `[V]` | L-03, L-04, D-1…D-7 |
| **A-09** | Bindings (16 object types, 190 ligações) | `ce-skeleton/catalog/object-capability-binding.candidate.v0.1.json` | Leitura directa `[V]` | L-03, C-2 |
| **A-10** | Catálogo de 45 famílias / 410 entradas | `ce-skeleton/catalog/service-catalog.v1.json` | Leitura directa `[V]` | L-03, L-04, C-03 |
| **A-11** | 3 schemas de piloto | `ce-skeleton/schemas/{article,clinical-tool,library-entity}.v1.json` | Leitura directa `[V]` | C-2, B-3, 9.2 |
| **A-12** | Estado dos 10 módulos canónicos | `ce-skeleton/src/core/experience/module-status.ts` | Leitura directa `[V]` | L-12 |
| **A-13** | Metamodelo (20/10/11 campos) | `ce-skeleton/src/core/experience/metamodel.ts` | Leitura directa `[V]` | L-16, L-17 |
| **A-14** | Gate de estrutura (11 checks) | `ce-skeleton/scripts/check-skeleton.mjs` | **Não executado nesta ronda** — `NOT_RUN` | C-04 |
| **A-15** | Testes (73 declarações `test(`) | `ce-skeleton/src/**/*.test.ts` + `tests/pilot.test.ts` | **Não executados** — `NOT_RUN` | C-04 |
| **A-16** | Medição de órfãos (30 branches) | `plan.../workspace/branch-orphan.tsv` | Leitura directa `[V]`; soma 1.524.448 conferida | L-05, D-6, D-7 |
| **A-17** | 36 capturas normativas e de produção | `outputs/normativos-enfermagem/capturas-2026-11-01/` | **`sha256sum -c` → 36/36 OK** `[V]` | L-01, L-02, L-08, L-07 |
| **A-18** | Respostas cruas da API do Senado (41) | `outputs/normativos-federais/raw/` | Re-execução byte-a-byte equivalente `[P-NF]` | L-09, L-10 |
| **A-19** | Extracção das 3 leis | `outputs/normativos-federais/extracao_confirmadas.json` | Artefacto da frente | C-6 |
| **A-20** | Texto do site lido pela frente de conta | não existe como ficheiro no repositório comum | **Sem hash** — lacuna de rastreabilidade | L-13, §3 |
| **A-21** | `tool-sources.v1.json` / `tool-bindings.v1.json` / `find-register.v1.json` | **CORRIGIDO (owner, 01/11): `tool-sources.v1.json` e `tool-bindings.v1.json` EXISTEM** em `/workspace/repo/contracts/entities/` e foram re-verificados (6/6 e 78/78). O `find-register.v1.json` **não foi encontrado** nesse caminho — a sua localização é `NOT_RUN` | `[P-NE]` confirmado quanto aos dois contratos; `find-register` por localizar | L-11, C-11, C-15 |

### Anexo B — Índice de fontes

> Formato: **URL com data** · **branch + sha** · **caminho de ficheiro** · **registo**.

#### B.1 Fontes primárias da produção (texto lido de páginas reais)

| Fonte | Data | Registo |
|---|---|---|
| `https://www.calculadorasdeenfermagem.com.br/` (raiz) | 2026-11-01 | `web_fetch` directo, HTTP 200 `[P-CF]` |
| `…/conteudos_da_pagina.html` (paywall Premium) | 2026-11-01 | `web_fetch` directo `[P-CF]` |
| `…/metricas.html` (GA4 + Supabase Edge Function) | 2026-11-01 | `web_fetch` directo `[P-CF]` |
| `…/news.html` (campos de paciente, PDF/Imprimir) | 2026-11-01 | `web_fetch` directo `[P-CF]` |
| `…/forum-enfermagem.html` (UGC, campos de identificação) | 2026-11-01 | `web_fetch` directo `[P-CF]` |
| `…/politica.html` · `…/politicaapp.html` · `…/termos.html` · `…/reembolso.html` · `…/downloads.html` · `…/fugulin.html` · `…/objetivo.html` · `…/mapa-do-site.html` | 2026-11-01 | Indexação de busca (texto real da página) `[P-CF]` |
| `…/balancohidrico.html` | 2026-11-01 | Indexação de busca; rótulo "Entrar", breadcrumb "Início › Minha Conta" `[P-CF]` |
| `…/prod_sitemap.xml` | 2026-11-01 | SHA-256 no manifesto; **1.804 `<loc>`** `[V]` |
| `…/aldrete.html` | `lastmod 2026-10-27` | SHA-256 no manifesto; `calcScore >= 9` `[V]` |
| `…/lista-de-doencas-de-notificacao-compulsoria.html` · `…/notificacao-compulsoria.html` | 2026-11-01 | SHA-256; `10.175/2026`, "73 entradas" `[V]` |
| `…/banco_nanda.json` · `…/banco_nic_completo.json` | 2026-11-01 | SHA-256; 281 e 593 itens `[V]` |
| `…/diagnosticosnanda.html` | 2026-11-01 | SHA-256; "apenas 90% do total" `[V]` |
| `…/codigo_de_etica_enfermagem.html` · `…/dimensionamento.html` · `…/guia_rapido_dimensionamento_de_enfermagem.html` · `…/guia_rapido_lei5905-73_criacao_cofen_coren.html` | 2026-11-01 | SHA-256 no manifesto `[P-NE]` |

#### B.2 Fontes normativas primárias (com SHA-256)

| Fonte | URL | Data | SHA-256 (prefixo) |
|---|---|---|---|
| Parecer Normativo COFEN nº 1/2024 (35 p.) | `cofen.gov.br/wp-content/uploads/2024/03/Parecer-Normativo-1-2024.pdf` | 2026-11-01 | `7155c480a442fb2c…` |
| Resolução COFEN nº 736/2024 (4 p.) | `cofen.gov.br/wp-content/uploads/2024/01/Resolucao-Cofen-no-736-2024-…pdf` | 2026-11-01 | `8a8a9ecb5987a308…` |
| Resolução COFEN nº 564/2017 (página DOU) | `cofen.gov.br/wp-content/uploads/2017/12/Resolução-564-17.pdf` | 2026-11-01 | `09bd6ab2ea4cef05…` |
| Anexo (Código de Ética, 16 p., **imagem pura**) | `cofen.gov.br/wp-content/uploads/2017/12/ANEXO-RESOLUÇÃO-COFEN-Nº-564-2017.pdf` | 2026-11-01 | `2e11e82bb80952af…` |
| Resolução COFEN nº 545/2017 (4 p., **sem camada de texto**) | `cofen.gov.br/wp-content/uploads/2017/05/RES.-545-17.pdf` | 2026-11-01 | `7b4dbdbecba0378b…` |
| Parecer CFM nº 28/2020 (5 p.) | `sistemas.cfm.org.br/normas/arquivos/pareceres/PR/2020/2806_2020.pdf` | 2026-11-01 | `089dba1488ac8ee0…` |
| Portaria GM/MS nº 6.734/2025 | `gov.br/aids/…/portaria-gm-ms-no-6-734-de-18-de-marco-de-2025.pdf/@@display-file/file` | 2026-11-01 | `cf645bbdbc299874…` |
| Portaria GM/MS nº 11.211/2026 (HTML) | `bvsms.saude.gov.br/bvs/saudelegis/gm/2026/prt11211_14_05_2026.html` | 2026-11-01 | `f55d931a16688297…` |
| `normas.leg.br` — Lei 7.498/1986 (**SPA, sem texto**) | `normas.leg.br/?urn=urn:lex:br:federal:lei:1986-06-25;7498` | 2026-11-01 | `ac27de17b1214543…` |

#### B.3 Fontes federais (API do Senado) — identificadores

| Norma | ID Senado | URL | Data |
|---|---|---|---|
| Lei nº 7.498, de 25/06/1986 | **549374** | `https://normas.leg.br/?urn=urn:lex:br:federal:lei:1986-06-25;7498` | 2026-11-01 |
| Lei nº 8.080, de 19/09/1990 | **549956** | `https://normas.leg.br/?urn=urn:lex:br:federal:lei:1990-09-19;8080` | 2026-11-01 |
| Lei nº 5.905, de 12/07/1973 | **547781** | `https://normas.leg.br/?urn=urn:lex:br:federal:lei:1973-07-12;5905` | 2026-11-01 |
| Decreto nº 94.406, de 08/06/1987 (regulamentador da 7.498) | **517046** | `https://normas.leg.br/?urn=urn:lex:br:federal:decreto:1987-06-08;94406` | 2026-11-01 |
| Decreto nº 79.137, de 18/01/1977 (regulamentador da 5.905) | **501777** | — | 2026-11-01 |
| Resolução Cofen nº 736/2024 | **não existe no dataset** | `https://www.in.gov.br/web/dou/-/resolucao-cofen-n-736-de-17-de-janeiro-de-2024-539060363` | 2026-11-01 |
| Portaria GM/MS nº 6.734/2025 | **não existe no dataset** | `https://www.in.gov.br/web/dou/-/portaria-gm/ms-n-6.734-de-18-de-marco-de-2025-620767223` | 2026-11-01 |
| Portaria de Consolidação GM/MS nº 4/2017 (contém a Lista) | **não existe no dataset** | — | 2026-11-01 |

#### B.4 Repositório público — branches e sha (de `branches-todas.json`, conferidas contra o clone)

| Branch | sha | Papel na síntese |
|---|---|---|
| `main` | `63b4e130` (sha curto em `branches-todas.json`) | 31 commits de frente na recolha `[E2]` |
| `chatgpt/login-google-email-only-20261004` | `952d4303` | A-2 |
| `chatgpt/assinatura-layout-20261004` | `52f5673f` | A-3 |
| `chore/sync-asaas-checkout-v106` | `a6f90c53` | A-4, A-8 |
| `codex/admin-developer-premium` | `86aadfc9` | A-9/admin |
| `fix/premium-access-root-cause` / `-2` | `db4ae8ba` / `392698b3` | A-5 |
| `fix/billing-access-empty-entitlement` | `914e3127` | A-5 |
| `fix/premium-entitlement-readonly` | `18a83cc8` | A-5 |
| `fix/premium-asaas-webhook-reconciliation` | `a249a1c5` | A-5 |
| `fix/premium-homologation-gates` | `707b1a29` | A-5 |
| `fix/account-subscription-verifying-state` | `40c5d466` | A-5 (estado "verificando") |
| `fix/asaas-checkout-customer-data` | `09cd4236` | A-4 |
| `fix/international-stripe-checkout` | `feddc068` | A-4 |
| `codex/stripe-premium-3-usd-eur` | `839e42f8` | A-4 |
| `fix/premium-payments-asaas-stripe-20260913` | `30be2e4e` | A-4 |
| `codex/asaas-immediate-first-card-charge` | `32a73aed` | A-4 |
| `codex/fix-asaas-date-first-payment` | `b35e0e5c` | A-4 |
| `feat/ads-controlado` | `b158baa9` | A-6, d-02 |
| `feat/premium-sem-anuncios-canonico` | `4a1af310` | A-6 |
| `feat/premium-ad-free` | `4ea9b025` | A-6 |
| `fix/ads-free-users-20260914` | `45ac64e4` | A-6 |
| `codex/fix-medicamentos-premium-ads-governance` | `51bde38c` | A-6 |
| `fix/premium-ads-build-order` | `9903d4c0` | A-6 |
| `codex/teste-anuncios-formularios` | `572a28ad` | A-6 |
| `feat/metricas-ga4-dashboard` | `e2571cb3` | A-9 |
| `fix/analytics-metrics-deploy` | `7327a655` | A-9 |
| `fix/corrigir-auth-core-listeners` | `89676a5c` | A-2 |
| `fix/auth-menu-dropdown-bootstrap` | `4c440848` | A-2 |
| `fix/profile-auth-bootstrap-timeout` | `5b17fceb` | A-2 |
| `fix/account-auth-bootstrap-nonblocking` | `f045eb40` | A-2 |
| `fix/profile-page-hang` | `46b81f0b` | A-2 |
| `fix/premium-sw-template-auth-bypass` | `628ecab2` | A-2 |
| `copilot/review-session-history` | `e2e17f28` | B-7 |
| `fix/localized-account-routes-20260929` | `1af76730` | A-7 |
| `chatgpt/sync-menu-auth-layout-locales-20261004` | `4adc5719` | A-7, C-09 |
| `chatgpt/index-extensoes-chrome-20261004` | `e7ba18df` | a-06 |
| `codex/fix-extension-premium-pkce` | `6ef9ae3a` | a-06 |
| `codex/extensao-gasometria-premium` | `00eb8bb2` | a-06 |
| `feat/page-comments-supabase` | `88bee938` | B-8 |
| `feat/page-comments-owner-actions-20261012` | `0a487c5a` | B-8 |
| `fix/page-comments-premium-rehydration` | `327ca65c` | B-8 |
| `fix/page-comments-inline-delete-20261012` | `00210afe` | B-8 |
| `codex/fix-page-comments-cache-157` | `b4590f66` | B-8 |
| `chatgpt/simulados-etapa-01-fundacao-20261004` | `1afa9a75` | B-4 |
| `chatgpt/simulados-etapa-02-piloto-20261004` | `43722e26` | B-4 |
| `chatgpt/simulados-etapa-02-piloto-execucao-20261004` | `fdc25388` | B-4, d-04 |
| `refactor/contas-free-premium` | `573a7267` | A-3 |
| `fix/premium-simulados-shell-boundary-2026-09-20` | `7677616c` | B-4 |
| `audit/billing-ads-final-20260914` | `3f8de36f` | D-7 (240.987 B órfãos) |
| `audit/billing-ads-hardening-20260914` | `a99c2846` | D-7 (250.623 B) |
| `audit/billing-ads-hardening-20260914-fix` | `f386dab9` | D-7 (239.077 B) |
| `audit/billing-ads-hardening-clean-20260914` | `0dc778aa` | D-7 (fundida) |
| `audit/billing-concurrency-fix-20260914` | `03e47e99` | D-7 (239.820 B) |
| `base44/setup-33f0e67e` | `3e13281e` | D-7 (260.356 B) |
| `base44/setup-ea01a537` | `6f06f115` | D-7 (260.330 B) |
| `backup/pre-clinical-audit-2026-09-19` | `56b9ee29` | D-5 |
| `fix-supabase-preview-migration-baseline-2026-09-20` | `eb2f3262` | D-6 — **a única baseline das 10 que NÃO está fundida em `main`** (risco de conteúdo) |
| `pre-projetos` | `52c519d1` | D-5 — baseline |
| `backup/page-comments-20261012-0318` | `e8300ad7` | D-5 |
| `backup/acessibilidade-antes-revisao-20261026` | `0497f5a4` | D-5 |
| `backup/menu-global-antes-icone-rodape2-20261026` | `18623d36` | D-5 |
| `backup/menu-raiz-antes-azul-20261026` | `d012fe64` | D-5 |
| `backup/menus-19-antes-75px-20261026` | `a303bca2` | D-5 |
| `backup/menus-19-antes-ajustes-20261026` | `a303bca2` | D-5 (mesmo sha: baseline duplicado) |
| `backup/menus-19-antes-scroll-20261026` | `f8c9afdc` | D-5 |
| `codex/governanca-clinica-gasometria` | `f82b28ea` | B-3 |
| `codex/governanca-fugulin-dimensionamento` | `0522c0e0` | B-3, C-1 |
| `codex/governanca-medicamentos-gotejamento` | `185fd8eb` | B-3 |
| `fix/clinical-calculators-audit-2026-09` | `61fecc4d` | B-3, C-3 |
| `codex/escala-12x36-previa-tutorial` | `41bf38e1` | B-2 |
| `codex/previas-200dpi-pt-en-es` | `53d3dfb0` | B-2 |
| `codex/previas-tamanho-natural` | `c7f9b404` | B-2 |
| `codex/proteger-visualizador-pdf` | `75c7dd7e` | B-2 |
| `docs/auditoria-canonica-contas-2026-10-01` | `32659629` | A-2 (auditoria interna) |

#### B.5 Repo de governança e caminho de ficheiro

| Fonte | Caminho / branch + sha | Data |
|---|---|---|
| Plano canónico (638 linhas, 28 secções) | `docs/EXPERIENCE-PLATFORM-CANONICAL-PLAN-v0.1.0.md` na branch `feat/career-youth-db-first-20261026` @ `ad4c683890` | 2026-10 |
| Roadmap (14 waves) | `docs/EXPERIENCE-PLATFORM-MIGRATION-ROADMAP-v0.1.0.md`, mesma branch | 2026-10 |
| 16 FINDs | `docs/FIND-EXPERIENCE-CANONICALIZATION-v0.1.0.md`, mesma branch | 2026-10 |
| Registo de 201 capabilities | `registers/canonical/experience-capability-registry.candidate.v0.1.json`, mesma branch | 2026-10 |
| Bindings (16 object types) | `registers/canonical/object-capability-binding.candidate.v0.1.json`, mesma branch | 2026-10 |
| PR #21 (draft, 146 commits, 70 ficheiros) | `IndiciumFIN/dev-chatgpt-workspace` | 2026-10 |
| Doutrina canónica | `agents/normativos-licenciados.md` (ID `CKO-AI-INS-LIC-001` rev 1.1.0) | — |
| Contrato de fontes de ferramenta | `contracts/entities/tool-sources.v1.json` (175 linhas, 6 fontes) | 2026-11-01 (owner) |
| Contrato de bindings de ferramenta | `contracts/entities/tool-bindings.v1.json` (78 itens) | 2026-11-01 |
| API do Senado — OpenAPI v3 | `raw/apidocs_openapi_ronda_anterior.json` (parâmetros: `tipo`, `numero`, `ano`, `data`, `seq`, `reedicao`, `ident`, `complemento`, `v`; **`palavras` não existe**) | 2026-11-01 |

#### B.6 Plataformas de referência e concorrência

| Fonte | URL | Data |
|---|---|---|
| Raindrop — Coleções | `help.raindrop.io/collections` | 2026-11-01 |
| Zotero — Coleções e tags | `zotero.org/support/collections_and_tags` | 2026-11-01 |
| Zotero — Saved searches | `zotero.org/support/searching` ("saved searches only store the search criteria, not the search results") | 2026-11-01 |
| Airtable — Views | `support.airtable.com/articles/5189551686` | 2026-11-01 |
| Airtable — Permissões de base | `support.airtable.com/articles/5450095623` | 2026-11-01 |
| Linear — Favoritos / command access | `linear.app/docs/favorites`, `linear.app/docs/custom-views` | 2026-11-01 |
| Notion — Barra lateral / projeções | `notion.com/help/customize-your-sidebar`, `notion.com/help/navigate-with-the-sidebar` | 2026-11-01 |
| Figma — Version history / checkpoints | `help.figma.com/hc/en-us/articles/360038006754` | 2026-11-01 |
| Readwise Reader | `docs.readwise.io/reader`, `readwise.io/pricing` | 2026-11-01 |
| Concorrente — Rosa Clínica | `rosaclinica.com.br/calculadoras` (71 escores; "abertas, sem login") | 2026-11-01 |
| Concorrente — Health Calculum | `healthcalculum.com/pt-BR/calculators/nursing/braden` (**extracção por motor de busca**; `web_fetch` falhou 2×) | 2026-11-01 |
| Concorrente — Escola EDTi | `escolaedti.com.br/escala-de-braden` (faixas brasileiras, Paranhos & Santos 1999) | 2026-11-01 |
| Concorrente — CAPES | `educapes.capes.gov.br` (Manual de Consulta Rápida em Enfermagem, PDF gratuito) | 2026-11-01 |
| LGPD | `gov.br/saude/lgpd` (art. 5 II, art. 11) | 2026-11-01 |

### Anexo C — NOT_RUN consolidado (o que não foi medido, e como medir)

| # | Item | Motivo | Comando / caminho |
|---|---|---|---|
| **N-01** | `npm test`, `npm run build`, `generate-skeleton.mjs --check`, `check-skeleton.mjs` | Execução de build/teste fora do mandato desta frente de síntese; o `[P-BP]` §8 também não os executou. A **contagem** foi feita por leitura de ficheiro; o **resultado** não | `cd /workspace/ce-skeleton && node scripts/generate-skeleton.mjs --check && node scripts/check-skeleton.mjs && node --experimental-strip-types --test $(find src tests -name '*.test.ts' \| sort)` |
| **N-02** | Conteúdo real de qualquer branch (181) | Nenhum `git show` por branch; a varredura por blob excedeu o orçamento (clone em NFS) | `git --git-dir=clone/publico.git log --oneline <branch> --name-only` |
| **N-03** | Teste de órfão em 151 das 181 branches | Idem N-02 | `workspace/orphan-analysis.py` (executado só nas 30) |
| **N-04** | Qual das variantes `audit/billing-ads-*` é a canónica | Exige leitura de código das branches | `git --git-dir=clone/publico.git diff main..audit/billing-ads-hardening-20260914 --stat` |
| **N-05** | Página de login (`/login`, `/conta.html`, `/minha-conta.html`) | `file load failed` em todas as tentativas | `curl -sSL https://www.calculadorasdeenfermagem.com.br/login.html` |
| **N-06** | Página de assinatura/Premium — planos, preço, o que destrava | `/assinatura`, `/assinatura.html`, `/premium` → `file load failed`. **A coerência do CTA de assinatura não pode ser afirmada nem negada** | idem, com `curl -L -A 'Mozilla/5.0'` |
| **N-07** | Taxa de conversão do checkout, ads→assinatura, rejeição de entitlement | Só existe instrumentação; não há números públicos lidos | Requer `/metricas.html` autenticado ou acesso ao backend |
| **N-08** | Dados gravados pelo checkout e pelo fórum | Nenhum código lido; as tensões T1/T3 estão provadas **no texto publicado**, não no armazenamento | Inspecção do código do checkout/comentários no repo privado |
| **N-09** | Existência de backend de sync de dados de utilizador | Idem | — |
| **N-10** | Medição em browser: a11y, layout, performance, funil real | Sem browser no sandbox | Playwright instalado no repo (`test-country-icon-a11y.mjs`, `test-focus-colors-i18n.mjs`); **não existe axe-core** `[E2]` |
| **N-11** | Existence/uso real dos "19 idiomas" | `src/lib/locale-registry.ts` ausente no `main` dos dois repositórios verificados `[E2]` | `git ls-tree -r main --name-only \| grep locale` em cada repo |
| **N-12** | Texto de artigo das 3 leis federais | A API do Senado devolve metadados, não corpo; `planalto.gov.br` bloqueado; `in.gov.br` com `Disallow: /`; `normas.leg.br` é SPA | Comandos prontos em `[P-NE]` §7.1 (LexML com `Crawl-delay 5`, Planalto de rede não bloqueada) |
| **N-13** | Texto do Anexo da Res. COFEN 564/2017 (Código de Ética) | PDF de imagem pura, `pdftotext` devolve 0 linhas | `pdftoppm -r 400 -png … && tesseract … -l por` + revisão humana (double-check) |
| **N-14** | Lista Nacional consolidada **em vigor** | O DOU está fora de `robots.txt` para captura automática | `bvsms.saude.gov.br/bvs/saudelegis/gm/2026/prt11211_14_05_2026.html` + Portaria de Consolidação 4/2017 (Anexo V, Anexo 1) |
| **N-15** | NANDA-I / NIC: edição em vigor e direitos de reprodução | Obra protegida (Thieme); leitura ≠ redistribuição | Identificação editorial apenas; **não extrair nem redistribuir** definições/atividades sem licença escrita |
| **N-16** | PNAB, SINAN, AHA/SBC, IBSP, ISMP, ANVISA | Nenhuma fonte preservada no repo | Comandos prontos em `[P-NE]` §7.5 |
| **N-17** | Conteúdo dos simulados (gabaritos) | Carregado por `/js/access/premium-content-loader.js`; **não foi contornado o controlo de acesso** | Via legítima (subscrição ou acesso interno do dono) |
| **N-18** | Re-verificação de `tool-sources.v1.json`, `tool-bindings.v1.json`, `find-register.v1.json` | **Ficheiros ausentes deste sandbox** `[V]` | Executar no repo canónico |
| **N-19** | Comparação `main` do repo público ↔ código em produção | O app em produção é privado (`IndiciumFIN/calculadorasdeenfermagem`) | `git ls-remote` / leitura no repo privado |
| **N-20** | Procura de uso/volume; demanda por coleção, alerta, TTS, colaboração | O produto não tem telemetria no esqueleto | Instrumentação primeiro (b-01) |
| **N-21** | Classificação jurídica das políticas vs. comportamento (LGPD/ANPD, CDC) | **Fora de competência** desta frente | Parecer jurídico |

### Anexo D — Verificação contra os packs E1–E5

> Requisito do contrato: "correcção factual contra as fontes originais dos packs". Resultado por pack.

| Pack | O que o pack afirma | Verificação desta síntese | Estado |
|---|---|---|---|
| **E1** | Produção: 16+ calculadoras, 12 categorias, 12+ simulados, "+400 conteúdos", "+60 escalas em branco", 19 idiomas, CTA "Assine já", login Google-only, política "sem cadastro", normativos visíveis | Confirma-se o texto das páginas normativas capturadas com hash; a `web_fetch` do E1 **falhou por timeout em 3 tentativas**, mas noutra frente funcionou intermitentemente em 5 rotas `.html` `[P-CF]` §2 | **Confirmado com ressalva de método.** E1 tem um erro de leitura: diz "30q" para o simulado de notificação compulsória; o `meta description` ao vivo diz **"50 questões"** `[P-NE]` §2.4 |
| **E2** | Repo público "30 branches"; depois corrigido para 182; 15 FINDs na PR #21 (o pack diz 16); 19 idiomas em `src/lib/locale-registry.ts`; tokens canónicos em `src/lib/site-data.ts` | **182 refs confirmados** (181 branches + `main`); prefixos confirmados; 137 churn confirmado; **os dois ficheiros `src/lib/locale-registry.ts` e `src/lib/site-data.ts` estão AUSENTES no `main` de ambos os repositórios verificados** — o próprio E2 o diz e manda não afirmar onde estão | **Confirmado, com a lista de 30 superada.** O E2 diz "16 FINDs"; o `[E2]` lista 6 resumidos — a lista completa está no ficheiro da branch. 19 idiomas: **não verificados** (C-09) |
| **E3** | Doutrina: 4 perguntas, uso proporcional, direitos como actos distintos, FIND, `E0–E5` proibidos; `tool-sources.v1.json` presente com `authority` declarada; FIND-CTR-010 (Aldrete 8 vs 9); Senado não devolve texto integral; ISO/ABNT/ISACA/IFRS só metadado | Doutrina confirmada; **FIND-CTR-010 agora provado com fonte primária** (SHA-256 `089dba…`); a frase "8 pontos ou mais" foi verificada literalmente por mim; limite do Senado confirmado pelo `[P-NF]` (catálogo não devolve texto; `catalogo` = 1 linha) | **Confirmado.** Um ponto a corrigir: o E3 diz "o metamodelo do esqueleto já tem `authorityBinding` no schema do ClinicalTool, mas está `CANDIDATE_HOLD`" — o `authorityBinding` está **de facto** presente no schema, mas com **5 chaves e `rule` em texto livre**, o que é mais fraco do que a leitura sugere; e o `CANDIDATE_HOLD` é o `status` do schema de piloto, **não** o `status` canónico do CKO (L-17) |
| **E4** | Benchmark: Raindrop, Readwise, Zotero, Airtable, Linear, Notion, Figma; Capture→Inbox→Triage; Coleções ≠ Saved Searches; Lifecycle & recovery; Guest first-class; "Área" = 15 projeções | Todas as referências conferem com `[P-BP]`, que traz URL e data para cada uma. O E4 diz "**12**" projeções no fim do parágrafo ("Alertas · Calendário · Passaporte") sem contar; a lista completa dá **15** (o `[P-BP]` rev. 2 corrigiu 14→15) | **Confirmado.** A discrepância 14/15 do `[P-BP]` está resolvida a favor de **15** (contagem da lista do E4) |
| **E5** | 45 famílias, 410 serviços, 201 capabilities, 16 bindings, 3 schemas, 905 ficheiros, 70/72 testes, gate 11/11, tudo `CANDIDATE_HOLD`; 11 lacunas; 410 serviços para 3 domínios | 45/410/201/16/3 confirmados `[V]`. **Campos do registo: 14 confirmados.** `Norm` sem schema confirmado. `module-status`: 2 `PRESENT` de 10 confirmado. `metamodel`: 20/10/11 confirmado. **Testes: 73 declarações `test(` (45+20+8)** — não 70/72 (45+20+5) nem 70/70. **Gate: 11 checks** — E5 acertou; o README local diz 8/8 e está desatualizado. `telemetry_contract` é string — confirmado | **Confirmado com duas correções** (contagem de testes; e o E5 mistura "não implementada" com "não declarada" — C-02). "410 serviços lógicos" → "410 entradas, 305 `LOGICAL_SERVICE`" (C-03) |

### Anexo E — Verificação de completude contra os 6 entregáveis upstream

| Entregável | Secções/tabelas que o entregável traz | Onde foi absorvido nesta síntese | Perdas (informação que existe no upstream e **não** está aqui) |
|---|---|---|---|
| `producao-conta-funil` (rev. 3) | Tabela 1 (18 linhas), Tabela 2 (9 elos), Tabela 3 (12 linhas), 10 mudanças "AGORA", 10 decisões do dono, 13 NOT_RUN, 4 tensões | §4 (A-1…A-9, B-7), §5 (L-05, L-06, L-13, L-14), §6.1, §7 (C-01, C-05, C-09, C-13), §8 (a-01…a-07, b-01…b-04, c-01…c-06), §9.1 | A **Tabela 2 completa** (os 9 elos da cadeia entrada→entitlement) está condensada na §4; os **13 NOT_RUN individuais** estão consolidados no Anexo C (N-05…N-09, N-20). As 10 "decisões do dono" da frente estão em §8(c) com os mesmos IDs reatribuídos (c-01…c-10 → c-01…c-13, por unificação com as das outras frentes) |
| `producao-superficie-busca` | Tabela 1 (8 categorias), 2.1 (8 superfícies), Tabela 2 (15 capabilities), Tabela 3 (12 elementos do blueprint de concurso), Tabela 4 (14 linhas), Tabela 5 (medição), 8 NOT_RUN | §4 (B-1…B-8), §5 (L-03, L-04, L-15, L-16), §6.2, §7 (C-02, C-03, C-07), §8 (a-08, a-10, b-06…b-10, b-17), §9.1 | A **Tabela 3** (12 elementos do blueprint de concurso) entra em §4 B-5 e em §8 b-09/b-10 como "8 contratos + 1 camada de ligação"; a lista nominal dos 12 elementos fica no entregável. A amostra de 25 capabilities órfãs fica lá (aqui: L-04) |
| `repo-publico-branches` (rev. 2, 02:01) | Tabela de 181 branches, 6 riscos de bifurcação, 7 "não portar", 7 NOT_RUN, 3 notas | §4 (D-6, D-7), §5 (L-05, L-06, L-11), §6.3, §6.6, §7 (C-01, C-04, C-12), §8 (a-18, a-19, c-12, d-01, d-02, d-04, d-05) | A **tabela de 181 branches** não é reproduzida (é o inventário completo, não um achado); fica referenciada em `branches-todas.json`. A coluna "tema inferido" por branch fica no upstream. A **rev. 2** do upstream (02:01) acrescentou a medição das 10 baselines com `git merge-base --is-ancestor` — **9 fundidas em `main`, 1 não** — absorvida em D-6, d-05 e §4.2 |
| `normativos-enfermagem` (rev. 2) | Tabela 1 (15 afirmações), Tabela 2 (10 riscos R1–R10), 6 fontes primárias, 12 campos em falta no `ClinicalTool`, 5 em falta no `Article`, 3 no `LibraryEntity`, schema `Norm` novo, 9 FINDs, 7 blocos NOT_RUN com comandos, registo de 36 capturas | §4 (C-1…C-7), §5 (L-01, L-02, L-07, L-08, L-11, L-17), §6.4, §7 (C-04, C-06, C-10, C-13, C-16), §8 (a-09…a-20, b-11, b-13…b-16, c-09…c-11), §9.2, Anexos B.2 e C | A lista **nominal dos 12 campos em falta** do `ClinicalTool` e dos 5 do `Article` está no upstream; aqui fica o conjunto estrutural (a-09, a-14, a-15). A Tabela 2 (R1–R10) é absorvida por L-01, L-02, L-08 e §9.2. O registo dos 9 FINDs com severidade fica no upstream (aqui: c-09, c-10, c-11 e a-18) |
| `normativos-federais` | Tabela das 5 normas, o que a produção pode/não pode afirmar (6.1–6.6), NOT_RUN com comandos, 8 normas adjacentes, Anexo A (prova de escopo), Anexo B (reprodução), Anexo C (artefactos) | §4 (C-2, C-6), §5 (L-09, L-10), §6.5, §7 (C-06, C-12), §8 (a-10, b-13), Anexos B.3 e C | As **6.1–6.6** (o que pode e o que não pode afirmar, norma a norma) são o conteúdo mais juridicamente sensível do upstream; aqui ficam condensadas em §4 C-2/C-6 e Anexo B.3. O Anexo B (comandos de reprodução) fica no upstream e é remissado |
| `benchmarks-plataformas` (rev. 3) | Tabela de 20 capacidades, Top 6 gaps com momento canónico/recomendado, 7 "não transferíveis", veredito em 5 linhas, 7 "não se descobre sem telemetria" + instrumentação mínima, 6 concorrentes, 7 riscos de conformidade, 8 NOT_RUN | §4 (D-1…D-5, B-2, B-6), §5 (L-12, L-13, L-14), §6.5, §6.6, §7 (C-07, C-08, C-14), §8 (b-01…b-05, b-17, c-12, d-03, d-06), §9.1, §9.2, Anexos B.6 e C | A coluna **"valor para o profissional de enfermagem"** das 20 linhas e a **justificação dos 6 gaps** ficam no upstream; aqui os gaps estão reordenados por (a)/(b)/(c)/(d) e reclassificados. A lista de 4 eventos propostos e de 19 canónicos entra em b-01 |

### Anexo F — Notas de método e limites desta síntese

1. **O que eu fiz:** li os 6 entregáveis upstream e os 5 packs; **verifiquei por leitura directa** os três catálogos do esqueleto, os schemas, `module-status.ts`, `metamodel.ts`, `state.ts`, `profile-contracts.ts`, o gate, as contagens de teste, `branches-todas.json` e `branch-orphan.tsv`; **verifiquei por hash** as 36 capturas normativas (`sha256sum -c` → 36/36 OK) e **re-contei** os factos que os entregáveis afirmavam sobre a produção (Aldrete 9 vs 8, "73 entradas", 10.175/2026, numeração da 11.211/2026, 281/593 itens NANDA/NIC, 25 domínios, `ano_inclusao` 2/281, "apenas 90% do total", 1.804 URLs no sitemap).
2. **O que eu NÃO fiz:** nenhum comando de build ou teste; nenhuma escrita no repo; nenhum push; nenhuma promoção; nenhum `WO`; nenhum `ADMITTED`. Nenhuma fonte externa nova foi consultada — todo o número com URL vem do upstream e está datado.
3. **O que herdei como confiança inferior:** a medição 236/49 (heurística de tokens) e a de 114/181 (classificador por palavra-chave) são reprodutíveis mas não canónicas; as contagens de tema por branch são inferência a partir do nome; `healthcalculum` é leitura por motor de busca; as afirmações sobre `tool-sources.v1.json`/`tool-bindings.v1.json` não foram re-verificadas neste sandbox.
4. **Actualização do upstream durante a síntese:** `repo-publico-branches` foi revisto para rev. 2 às 02:01 (medição das 10 baselines com `git merge-base --is-ancestor`: 9 fundidas em `main`, 1 não — `fix-supabase-preview-migration-baseline-2026-09-20`). O texto foi relido e a medição está absorvida em D-6, d-05 e §4.2. As restantes secções do upstream não mudaram.
5. **Correções aplicadas ao upstream, não absorvidas em silêncio:** (a) "70/72 testes" → 73 declarações `test(`; (b) "410 serviços lógicos" → 410 entradas, 305 `LOGICAL_SERVICE`; (c) "8/8 gate" do README → 11 checks; (d) "P1/P2 não implementados" → **declarados mas não implementados**; (e) "19 idiomas" → estado de produção **não verificado**; (f) "30q" do E1 → "50 questões" no `meta description` ao vivo; (g) o E1 lista **17 normativos visíveis** na produção; o upstream auditou **15 afirmações normativas** (A1–A15), das quais **10 riscos R1–R10** com fonte primária; (h) a contagem de projeções da "Área" → **15**.
6. **Nenhuma tensão foi resolvida por inferência.** Onde as fontes divergem, a divergência está na §7 com o estado (RESOLVIDA / ABERTA / NÃO RESOLVIDA / NOT_RUN) e com o que falta para fechar.

---

## 11. Summary

Li os 6 entregáveis upstream e os 5 packs do evidence pack, e verifiquei por leitura directa e por hash os factos que deles dependem: registo de 201 capabilities (20 famílias, 14 campos, 100 % `CANDIDATE`), 190 ligações capability↔objecto todas a `PROPOSED`, 410 entradas de catálogo (305 `LOGICAL_SERVICE`), 3 schemas de 16 (`Norm` sem schema), 2 de 10 módulos canónicos presentes, 182 refs no repo público (137 de churn, 7 branches com 1.524.448 bytes órfãos, soma conferida) e as 36 capturas normativas (`sha256sum -c` → 36/36 OK), recontando ainda o corte 9 vs 8 da Aldrete, a lista de notificação em 10.175/2026 e a renumeração da 11.211/2026, e as 281/593 entradas de NANDA/NIC.

O `deliverable.md` é o relatório final comparativo: matriz de cobertura das 6 frentes → secções, TABELA-MESTRE em 7 campos (com a variante de 4 colunas exigida), cadeia de evidência em 17 linhas críticas com evidência → condição/gatilho → impacto → confiança → como verificar, 16 contradições e incertezas explicitadas sem resolução silenciosa, índice de fontes com URL+data / branch+sha / caminho / registo, e 56 deltas classificados em (a) corrigir o esqueleto agora (20), (b) roadmap (17), (c) decisão do dono (13), (d) fora de âmbito (6). Nenhum item implica promoção, `ADMITTED` ou Work Order; guest-first e Clinical Safety são tratados como requisitos duros, com 6 e 8 cláusulas verificáveis.

## 12. Changed files

| Caminho | Acção |
|---|---|
| `/workspace/.mavis/plans/plan_2973fb1f/outputs/sintese-comparativa/deliverable.md` | **criado** (este relatório) |
| `/workspace/.mavis/plans/plan_2973fb1f/outputs/sintese-comparativa/_parte2.md` | ficheiro intermédio de montagem; **removido** após concatenação |
| `/workspace/.mavis/plans/plan_2973fb1f/board.md` | **actualizado** (entradas de progresso) |

Nenhum ficheiro de produto, repo, catálogo, schema ou captura foi alterado. Sem push, sem commit, sem `WO`, sem promoção.

## 13. Notes do owner (01/11/2026) — correcções aplicadas após a verificação

**O que a verificação pegou, e o que foi corrigido:**

1. **A afirmação «os ficheiros `tool-sources.v1.json` e `tool-bindings.v1.json` não existem neste sandbox» era falsa** — existem em `/workspace/repo/contracts/entities/`. Re-verificados por leitura directa: **6/6** `source_type` fora do enum canónico, **6/6** `integrity.sha256` = 64 zeros, e **78/78** bindings com `authority_class`/`decision` fora do enum canónico **ou ausentes**. O número que circulava (**46/78**) contava só os bindings com `decision` preenchida (`BOUND` 46) e ignorava os 32 sem o campo — corrigido em L-11, C-15 e A-21.
2. **O número de testes do E5 estava errado.** O E5 diz «70/72 testes verdes (45 de família + 20 de capability + 5 de piloto)». Contagem por leitura de ficheiro: **65 ficheiros em `src/` (45 famílias + 20 famílias de capability) com 1 declaração cada + `tests/pilot.test.ts` com 8 = 73 declarações**. O E5 contava 5 de piloto; são 8.
3. **O gate tem 11 checks, não 8.** Executado: `node scripts/check-skeleton.mjs` → **11/11 checks verdes**, incluindo «sem serviços órfãos no disco» e «nenhum serviço declarado PASS/APPROVED/ADMITTED sem evidência — 0 violações». O README local que diz «gate 8/8» está desatualizado.
4. **Marcadores de origem reetiquetados.** As contagens de branches herdadas das frentes (`137/181`, `114/181`, `182 refs`, `1.524.448 B`) estavam marcadas `[V]` (verificação própria) quando são `[P-RP]` (medidas na frente do repo) — corrigido, porque `[V]` é o nível mais forte e não pode ser aplicado ao que não foi medido aqui.
5. **Caracteres corrompidos removidos** — três insertions de caracteres CJK colados ao texto português (uma no rótulo de estado de uma linha da tabela-mestre, uma na nota do desvio de roadmap, uma na comparação de plataformas), identificados e reescritos; e `17+]` corrigido para `17+`. **Este relatório não contém agora nenhum caractere fora do repertório português/ASCII**.

**O que NÃO mudou:** a TABELA-MESTRE, a cadeia de evidência, os 56 deltas accionáveis e o veredito por eixo — as correcções são de rastreabilidade e de um número, não de estrutura.

## 13.1 Notes para o verificador

1. **Nenhum entregável upstream em falta** — os 6 existem e foram lidos na íntegra. Se algum dos 6 desaparecer, o mapa da §2.1 diz o que se perde.
2. **A correcção mais material que fiz aos packs**: o E5 diz "70/72 testes verdes (45 família + 20 capability + 5 piloto)" e o README local diz "70/70 (45+20+5)" e "gate 8/8". A árvore tem **73** declarações `test(` (**45 + 20 + 8** piloto) e o gate tem **11** checks. **Nenhum comando foi executado** — a contagem é por leitura de ficheiro, e o resultado verde/vermelho continua `NOT_RUN` (N-01).
3. **A correcção mais material que fiz ao upstream**: "410 serviços lógicos" → **410 entradas de catálogo, das quais 305 são `LOGICAL_SERVICE` e 105 são `EXPERIENCE_CAPABILITY_GROUP`** (o próprio `kind` no catálogo). O número 410 está certo; a designação não.
4. **Duas medições do upstream que não são canónicas** e que marco como tal: 236/49 (sobreposição de tokens) e 114/181 (classificador por palavra-chave). A faixa 47–63 % é o que resta de defensável sem reexecutar o classificador.
5. **A palavra "sync" aparece com dois sentidos** (entitlement vs. dados de utilizador) em dois entregáveis. Não resolvi — está em a-05 e é deltas estrutural.
6. **Não usei rótulos transversais de classificação de evidência** (`SUSTENTADA`, `METADADO`, `DIVERGENTE`) como estado canónico, por causa da doutrina `CKO-AI-INS-LIC-001` rev 1.1.0. Onde o upstream os usa, a leitura é pelas 4 perguntas (fonte / material / direitos / o que prova). A inconsistência interna do `[P-NE]` §2.2 vs §3.3 está registada em C-16.
7. **A "TABELA-MESTRE em 4 colunas"**: o briefing enumera 7 campos e diz "4 colunas". Resolvi com as duas leituras — §4.1 (7 campos, a evidência) e §4.2 (4 colunas, a leitura condensada). A §4.2 não perde informação da §4.1.
8. **Nenhuma promessa de promoção.** As acções (a) e (b) são alterações de **esquema, registo e ligação**; a promoção de qualquer capability continua a exigir FIND → política → validador → WO → OPA → Kernel → testes → auditoria → decisão humana.
9. **O único achado de segurança clínica com prova primária e hash** é o Aldrete (L-01). A lista de notificação (L-02) é igualmente provada, mas o seu efeito é "versão errada em circulação", não "critério clínico errado".
