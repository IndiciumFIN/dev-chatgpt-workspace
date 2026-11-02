# Produção × Esqueleto — conta, login, assinatura e o guest-first

> Frente: `producao-conta-funil` · Agente: `conversion-funnel` · Data: 2026-11-01 · **rev. 3 — correção do owner** (rev. 2 do agente + reancoragem da Tabela 3 em IDs reais + remoção da atribuição de aprovação ao verificador)
> Base: `/workspace/evidence_pack/` (E1, E2, E4, E5, `branches-publicas.json`, `branches-todas.json`) + leituras de texto da produção nesta frente.
> **Rev. 2 (agente)**: bloco 7 reformulado como "tensões entre promessa publicada e comportamento" (3 tensões reais + 1 por apurar); o antigo C6 foi reclassificado como **NOT_RUN** e o antigo C2 como **T4/D2** (escopos diferentes → não é contradição provada). Tabelas 1-3, A1-A10 e D1-D10 mantidos; ajustes de rótulo pontuais nas células, declarados na secção 11.
>
> **Rev. 3 (owner, 01/11)**: (a) a Tabela 3 foi **reancorada em IDs reais** do registo canónico (`CAP-*`) e no tipo de objeto vinculado; (b) foi removida a atribuição ao verificador de uma aprovação que ele nunca deu — a rev. 1 foi **reprovada**; (c) acrescentada a medição de que **todos os 16 bindings estão a `support: PROPOSED`**.

---

## 1. Summary

O guest-first do esqueleto **não é a mesma coisa** que a produção: em produção ele vale para o **núcleo clínico** (calcular, ler, imprimir a própria escala — sem login) e **não vale** para monetização, identidade, comunidade e telemetria, que já são account-centric. Confirmado em produção nesta frente: existe "Minha Conta" com promessa de *salvar favoritos / acompanhar histórico / desbloquear recursos exclusivos*, paywall Premium sobre os formulários em branco, checkout Asaas (+Stripe internacional), ads para usuário free, dashboard público de GA4 via Supabase Edge Function e um fórum UGC que pede identificação sem moderação — **nenhuma** dessas seis superfícies existe no esqueleto (que tem 201 capabilities, todas `CANDIDATE`, e 410 serviços que lançam `NOT_IMPLEMENTED_CANDIDATE_HOLD`). O achado estrutural: **86 das 182 branches públicas (47%) estão no núcleo conta→login→assinatura→pagamento→entitlement→ads, e 137 (75%) são `fix`/`codex`/`copilot`/`refactor`** — ou seja, a superfície mais churnada da produção é precisamente a que o esqueleto não modela. E há **3 tensões reais (mais 1 por apurar) entre a promessa publicada e o comportamento observado**, que só o dono pode decidir — **isto não é parecer jurídico**.

---

## 2. Método e estado da recolha

O E1 registra `web_fetch` com timeout (15 s) em 3 tentativas. **Nesta frente o `web_fetch` funcionou de forma intermitente** e devolveu conteúdo real de 5 rotas `.html`; rotas sem extensão e o `sitemap.xml` continuaram em `file load failed`. Fontes usadas:

| Fonte | Tipo | Estado | Uso |
|---|---|---|---|
| `www.calculadorasdeenfermagem.com.br/` (raiz) | leitura direta | OK | contagens, estrutura da home |
| `/conteudos_da_pagina.html` | leitura direta | OK | paywall Premium |
| `/metricas.html` | leitura direta | OK | taxonomia de eventos, GA4, Edge Function |
| `/news.html` | leitura direta | OK | UI clínica, PDF/Imprimir, disclaimers |
| `/forum-enfermagem.html` | leitura direta | OK | UGC, campos de identificação, moderação |
| `/politica.html`, `/politicaapp.html`, `/termos.html`, `/reembolso.html`, `/downloads.html`, `/fugulin.html`, `/objetivo.html`, `/mapa-do-site.html` | indexação de busca (texto real da página) | OK | promessa legal e de produto |
| `…/balancohidrico.html` | indexação de busca — **o texto extraído inclui cabeçalho e breadcrumb** | OK | rótulo "Entrar", breadcrumb "Início › Minha Conta", texto da conta |
| `branches-todas.json` (182 branches, com sha) | evidência de superfície | OK | 100% do bloco de divergência |
| E1/E2/E4/E5 | pack | OK | modelo do esqueleto e blueprint |

Limite assumido: **texto renderizado, não browser**. Nenhuma medição de layout, a11y, performance, clique real ou taxa de conversão.

---

## 3. A pergunta: guest-first e produção são a mesma coisa?

**Não.** São a mesma coisa em **uma camada** e coisas diferentes em **duas**.

| Camada | Guest-first em produção? | Verdade |
|---|---|---|
| **L1 — conteúdo e ferramenta clínica** (calcular, ler, imprimir a própria escala) | **Sim, confirmado** | `/objetivo.html`: "O usuário insere os dados solicitados e a calculadora realiza automaticamente as fórmulas matemáticas necessárias" — sem login. `/news.html`: calculadora NEWS completa sem menção a login. `/fugulin.html`: "Armazenados apenas no cache do seu computador" (= escopo LOCAL_DEVICE). `/politicaapp.html`: "não exige a criação de contas, login". **O esqueleto está certo aqui.** |
| **L2 — monetização** (Premium, checkout, entitlement, "sem anúncios") | **Não** — exige conta e servidor | `/conteudos_da_pagina.html`: "Para baixar e imprimir, assine o plano Premium". Conta promete "desbloquear recursos exclusivos". 60 branches de billing/premium/checkout. **O esqueleto não tem o conceito.** |
| **L3 — identidade, comunidade e telemetria** (Minha Conta, fórum, métricas públicas) | **Não** — exige identidade | "Minha Conta" (Google + E-mail); fórum pede nome/país/profissão/local de trabalho; `/metricas.html` publica usuários ativos, sessões, 15 países, 20 cidades em tempo real. **O esqueleto não tem o conceito.** |

**Conclusão de arquitetura:** o `owner_scope` já canónico do esqueleto (`SESSION | LOCAL_DEVICE | ACCOUNT | WORKSPACE`) contém a resposta certa — **guest-first é do escopo do conteúdo/ferramenta (L1); entitlement é, por definição, de `ACCOUNT` e não pode viver em `SESSION`/`LOCAL_DEVICE`**. O esqueleto não está errado: está **incompleto** — e o complemento errado (se alguém "resolver" o gap criando entitlement local) produziria o pior resultado possível: Premium liberado no device, revogável em qualquer device, sem servidor.

---

## 4. Tabela 1 — Produção → esqueleto (18 linhas)

| # | Promessa / estado de produção | Capability / família do esqueleto envolvida | Coincide / Divergência / Ausente | Risco | Evidência |
|---|---|---|---|---|---|
| 1 | Home vende "+400 Conteúdos" e "+60 escalas assistenciais em branco para imprimir"; biblioteca "gratuita" | Biblioteca/Conteúdo (objetos `LibraryEntity`, `Article`, `Norm`, `Guide` — 16 tipos declarados) | **Coincide** na forma · **Ausente** no runtime (3/16 tipos com schema, sem UI) | — | `/downloads.html`; `/conteudos_da_pagina.html`; E1 l.10-12 |
| 2 | **Paywall real**: os formulários em branco só baixam "assinando o plano Premium" | `output.ts` (P0 ausente) + família **Entitlement** (inexistente) | **Divergência** · oferta × entrega → **T3** (ver secção 7) | **Dark pattern**: o item anunciado na home como benefício é Premium; e a política promete uso "sem cadastro" | `/conteudos_da_pagina.html` |
| 3 | CTA "Assine já" (Premium) | família transversal **Entitlement/Subscription** (inexistente) | **Ausente** | Dark pattern (promessa × entrega — **entrega NOT_RUN**, ver secção 9) | E1 l.20; `chatgpt/assinatura-layout-20261004` @ `52f5673f` |
| 4 | "Minha Conta": *"Acesse sua conta para salvar favoritos, acompanhar seu histórico e desbloquear recursos exclusivos"* | **Favoritos** + **Lifecycle/Event Backbone** + **Entitlement** (3 famílias) | **Divergência de UUa** — a produção já promete o tripé que o esqueleto mantém `CANDIDATE` | Risco de paridade: capability que só existe no papel | texto da conta via indexação de `/balancohidrico.html` |
| 5 | Entrada: "Entrar com Google" **ou** "Entrar com E-mail" (nome completo) | `owner_scope = ACCOUNT` + família **Identity** (inexistente) | **Ausente** (só o escopo existe) | Privacy | idem; `chatgpt/login-google-email-only-20261004` @ `952d4303`; `copilot/fix-sistema-login-e-assinaturas` @ `82425cd5` |
| 6 | Checkout **Asaas** (BR) + **Stripe** (internacional) | família **Billing/Payment** (inexistente) | **Ausente** | **Dark pattern**: payer sem acesso. Há branches que corrigem exatamente isso | `chore/sync-asaas-checkout-v106` @ `a6f90c53`; `fix/billing-access-empty-entitlement` @ `914e3127`; `fix/premium-asaas-webhook-reconciliation` @ `a249a1c5`; `codex/stripe-premium-3-usd-eur` @ `839e42f8` |
| 7 | Ads para free, **Premium "sem anúncios"** | família **Ads** (inexistente) | **Ausente** | **Dark pattern**: se o entitlement vier vazio, o cliente pago vê anúncio | `feat/ads-controlado` @ `b158baa9`; `feat/premium-sem-anuncios-canonico` @ `4a1af310`; `fix/ads-free-users-20260914` @ `45ac64e4`; `codex/fix-medicamentos-premium-ads-governance` @ `51bde38c` |
| 8 | Dashboard público de métricas (GA4 `522498030` via **Supabase Edge Function**, 11 famílias de eventos, auto-refresh 60 s) | **Event Backbone** (P1, ausente) + `telemetry_contract` (é **string**, não contrato) | **Divergência de UUa** | Privacy: evento é identidade quando correlacionado com checkout | `/metricas.html`; `feat/metricas-ga4-dashboard` @ `e2571cb3` |
| 9 | Política do site: *"Não realizamos nenhum tipo de coleta… Você pode navegar e utilizar todas as calculadoras livremente, sem cadastro, login, e sem fornecer nome, e-mail"* | Guest-first (L1) + família **Consent/Privacy** (inexistente) | **Divergência** · mesma página, mesmo escopo → **T1** (ver secção 7) | **Privacy**: mesma política cobre login Google, checkout (dados de cliente) e GA4 | `/politica.html` |
| 10 | Política do **app**: *"não exibe anúncios nem utiliza cookies"*, *"dados… descartados assim que o aplicativo é fechado"*, *"Nenhum desses dados é enviado para nossos servidores"* | Escopo `LOCAL_DEVICE` + Telemetria | **Condicional** — app ≠ web: **não há contradição provada**. Vira **T4/D2** (ver secções 7 e 8.2) | **Privacy**, se e somente se o app/CE herdar o modelo web (ads, GA4, Supabase, comentários) | `/politicaapp.html` |
| 11 | Termos: *"ferramentas… disponibilizadas gratuitamente"* — mas existe assinatura cobrada com reembolso em 7 dias | Oferta comercial (não é capability) | **Divergência** · **T2** (ver secção 7) | Oferta: o termo "gratuitamente" colide com a assinatura cobrada | `/termos.html` + `/reembolso.html` |
| 12 | Calculadora NEWS: campos **"Nome do paciente"**, "Setor/Leito", "Profissional/Avaliador"; saída "Salvar PDF" e "Imprimir" | `output.ts` (P0 ausente) + `profile-contracts.output` (**vazio por decisão**) + Preview | **Divergência de UUa** | **Clinically misleading** (laudo PDF com nome de paciente) + **privacy** | `/news.html` |
| 13 | "Compartilhar Escala" (com dados no cache do device) | **Share/Collaboration** (P1, ausente) + `LOCAL_DEVICE` | **Coincide** na intenção · **Ausente** na estrutura | — | `/fugulin.html` |
| 14 | **Fórum de Enfermagem**: publicar/comentar com nome, país, profissão, área e **local de trabalho**; 19 idiomas; 150+ países; **sem moderação, denúncia ou aprovação** | **Capture/Inbox** + **Collaboration** (P1/P2, ausentes) | **Ausente** | **Dark pattern + privacy**: o formulário pede identificação sem moderação → **T3** (ver secção 7) | `/forum-enfermagem.html`; `feat/page-comments-supabase` @ `88bee938`; 11 branches `comment`/`forum` |
| 15 | 19 idiomas + rotas de conta/checkout localizadas + "plataforma Global" | i18n/plataforma — esqueleto: **zero i18n, zero runtime** | **Divergência** | — | `chatgpt/sync-menu-auth-layout-locales-20261004` @ `4adc5719`; `fix/localized-account-routes-20260929` @ `1af76730`; `refactor/contas-internacional-fase1..10`; `/mapa-do-site.html` |
| 16 | Extensões de navegador (login premium com PKCE, gasometria premium) | `supported_channels` (**campo ausente no registo**) + `permission_policy` (**ausente**) | **Ausente** | Privacy/permission: entitlement fora do navegador, com refresh | `chatgpt/index-extensoes-chrome-20261004` @ `e7ba18df`; `codex/fix-extension-premium-pkce` @ `6ef9ae3a`; `codex/extensao-gasometria-premium` @ `00eb8bb2` |
| 17 | Admin/desenvolvedor: menu de conta, ativação segura de Premium, admin premium | família **Admin/Developer** (inexistente) | **Ausente** | Privacy (ativação manual de plano) | `codex/admin-developer-premium` @ `86aadfc9`; `codex/secure-developer-premium-activation` @ `df6a765a`; `codex/fix-developer-account-menu` @ `6f767014`; `docs/auditoria-canonica-contas-2026-10-01` @ `32659629` |
| 18 | **Churn**: 86/182 branches (47%) no núcleo conta→entitlement; 137/182 (75%) `fix`/`codex`/`copilot`/`refactor` | (meta) | **Evidência de UUa** | A superfície que mais consome manutenção é a não modelada | `branches-todas.json` |

> **O que a tabela 1 responde:** as promessas de L1 (conteúdo, calcular, imprimir) **coincidem** com o esqueleto. Tudo o que toca **identidade, dinheiro ou telemetria** está **ausente** no esqueleto. As linhas **2, 9 e 14** são tensões de promessa × comportamento verificável (**T1-T3**, secção 7); as linhas **6 e 7** são riscos de dark pattern já-visíveis na produção (branches de correção); as linhas **3 e 11** apanham em **T2** e em **NOT_RUN** (plano/preço não lidos); a linha **10** é **condicional** (escopo app ≠ web).

---

## 5. Tabela 2 — Cadeia entrada → entitlement (produção × esqueleto)

| Elo | Existe em produção (medido) | O esqueleto declara | Veredito | Risco |
|---|---|---|---|---|
| **1. Entrada / login** | "Entrar com Google" **ou** "Entrar com E-mail" + "Nome completo"; rótulo de cabeçalho "Entrar"; branch `chatgpt/login-google-email-only-20261004`; correções de `auth core listeners`, `auth-menu-dropdown-bootstrap`, `profile-auth-bootstrap-timeout`, `account-auth-bootstrap-nonblocking` | Nada. `owner_scope = ACCOUNT` existe como **campo de estado**, sem runtime, sem serviço, sem schema | **Divergência (UUa)**: o esqueleto tem o *escopo* e não tem a *entrada*. E a produção tem entrada **e** falha de entrada (4 branches de bootstrap/listeners) | Privacy; risco de "Entrar" quebrar no 1º clique (production já teve) |
| **2. Sessão** | GA4 `session_start`/`first_visit`; `fix/corrigir-auth-core-listeners` @ `89676a5c`; `fix/auth-menu-dropdown-bootstrap` @ `4c440848`; FIND: "ToolViewBar grava configuração em **sessionStorage**" | `state.ts` com 11 campos, `owner_scope = SESSION` — **canónico** | **Coincide no modelo, divergente na prática**: produção persiste configuração de ferramenta em `sessionStorage` (volátil, por aba); o esqueleto já tem o escopo certo e não tem runtime | Perda de preferência entre sessões (prod) vs. escopo modelado e não implementado (esq.) |
| **3. Device / local** | "Armazenados apenas no cache do seu computador" (`/fugulin.html`); "descartados assim que o aplicativo é fechado" (`/politicaapp.html`) | `owner_scope = LOCAL_DEVICE` — declarado | **Coincide na semântica**, ausente no runtime | Se o CE local for o "aplicativo", esta é a **âncora de conformidade** da política do app |
| **4. Sync** | "sync" em produção = **sync de entitlement/checkout** (`chore/sync-asaas-checkout-v106`, `sync-premium-main-2026-09-20`, `fix/premium-asaas-webhook-reconciliation`) — **não** é sync de dados de usuário | "sync" é gap **P1/P2 não implementado** = sync de dados de usuário | **Divergência de vocabulário (perigosa)**: a mesma palavra, dois objetos. Se não for desambiguado no registo, o próximo que ler "sync" vai modelar a coisa errada | Loss: plano aplicado no device A, não visível no device B |
| **5. Conta** | "Minha Conta" (breadcrumb "Início › Minha Conta"), estado "verificando assinatura" (`fix/account-subscription-verifying-state` @ `40c5d466`), rotas localizadas, perfil travado (`fix/profile-page-hang`) | `owner_scope = ACCOUNT` declarado; nenhum runtime, nenhum schema de conta | **Divergência (UUa)**: produção já tem **conta como superfície de navegação**, não só como escopo | Promessa da conta ("favoritos, histórico, exclusivos") não tem morada no modelo |
| **6. Assinatura** | "plano Premium"; `chatgpt/assinatura-layout-20261004`; `refactor/contas-free-premium` @ `573a7267` (tiers free/premium); **planos e preços NOT_RUN** (ver secção 9) | Ausente | **Ausente** | Plano/preço não verificados → não é possível auditar a coerência do CTA |
| **7. Pagamento** | Asaas (BR) + Stripe (internacional): `fix/asaas-checkout-customer-data` @ `09cd4236`, `codex/asaas-immediate-first-card-charge`, `codex/fix-asaas-date-first-payment`, `fix/international-stripe-checkout` @ `feddc068` | Ausente | **Ausente** | Dois PSPs ativos = duas ordens canônicas de cobrança |
| **8. Entitlement** | `fix/premium-access-{bootstrap,canonical-resolution,root-cause,root-cause-2}`, `fix/premium-entitlement-readonly` @ `18a83cc8`, `fix/billing-access-empty-entitlement` @ `914e3127`, `sanitize-premium-access-2026-09-20` @ `3b0c72ac`, `fix/premium-homologation-gates` @ `707b1a29`, `fix/premium-ads-build-order` @ `9903d4c0` (6+ branches só de resolução de acesso) | Ausente. `resolver.ts` devolve estados, mas **não há plano, nem tier, nem reason code de bloqueio** | **Divergência máxima**: é o conceito central do produto e não existe no modelo | **Dark pattern** (paga e não acessa) — já aconteceu 6 vezes em branches |
| **9. Privacidade** | `/politica.html` (sem cadastro/login, sem dados pessoais) · `/politicaapp.html` (sem ads, sem cookies, nada sai do device) · **contra**: login Google/E-mail, checkout com dados de cliente, GA4 + dashboard público de país/cidade, fórum que pede nome/profissão/local de trabalho, comentários em Supabase | Guest-first estrutural; `telemetry_contract` é string; `permission_policy`/`audiences`/`policy_refs` **faltam no registo** (11 campos em falta) | **Tensão comprovada no mesmo escopo (T1)** entre a política do **site** e o comportamento do **site**. A comparação app×web é escopo distinto → **T4/D2** | **Privacy** — o passivo é do dono, não do esqueleto |

---

## 6. Tabela 3 — Capabilities que a produção **já** exercita e o esqueleto mantém `CANDIDATE` (12 linhas)

> Estado do esqueleto, igual em todas as linhas: **201 capabilities, 20 famílias, 100% `CANDIDATE`**; os 410 serviços lançam `NOT_IMPLEMENTED_CANDIDATE_HOLD` (E5). "CANDIDATE sem qualquer implementação" = **todas**. O que muda por linha é **por que** isso já é divergência e não só lacuna.

| # | Capability (ID real do registo) | Família | Tipo de objeto vinculado | Evidência de que a produção já exercita | Estado no esqueleto | Tipo de divergência | Risco |
|---|---|---|---|---|---|---|---|
| 1 | `CAP-FAVORITE`, `CAP-COLLECTION` | ORGANIZATION | 9 tipos (ClinicalTool, LibraryEntity, Article, Question, Simulation, Norm, Competition, Course, MediaAsset) | "salvar favoritos" na Minha Conta; FIND: *"Favorite é só estado de visita"* (E2 l.33) — produção marca visita, esqueleto modela coleção persistida | `CANDIDATE_HOLD`; binding `support: PROPOSED` | **UUa** — mesmo nome, objeto diferente (visita × coleção) | Favorito que não sobrevive à sessão: promessa vazia |
| 2 | `CAP-HISTORY`, `CAP-LEARNING-HISTORY` | CONTINUITY / LEARNING | Article, LibraryEntity, ClinicalTool, Simulation | "acompanhar seu histórico" na Minha Conta; `copilot/review-session-history` @ `e2e17f28` (+ `…-again`); `fix/account-subscription-verifying-state` | `CANDIDATE_HOLD`; Lifecycle/Recovery e Event Backbone **não implementados** | **UUa** — o histórico de conta é o gatilho do checkout; sem ele, o topo de funil não tem memória | Funil de upgrade sem histórico = gatilho cego |
| 3 | `CAP-RESUME`, `CAP-LAST-POSITION` | CONTINUITY | Article, Course, Simulation | Briefing do owner nomeia "continuar"; produção mostra estado por página ("Memória da Avaliação", `0/7` variáveis preenchidas em `/news.html`) | `CANDIDATE_HOLD` | **UUa** — produção tem estado de sessão *intra-página*, esqueleto modela *escopo* sem runtime | Retomar cálculo à meia-avaliação não é possível |
| 4 | `CAP-LATER` | TRIAGE | Article, Course | Briefing do owner nomeia "ver depois"; **sem URL/branch no pack que o confirme** | `CANDIDATE_HOLD` | **Evidência indireta** — confirmado como promessa do blueprint (E4 l.12), não medido em produção | Baixo |
| 5 | `CAP-ALERT`, `CAP-DEADLINE-ALERT`, `CAP-CHANGE-ALERT`, `CAP-DIGEST`, `CAP-REMINDER` (FOLLOW_ALERT) · `CAP-SAFETY-ALERT` (CLINICAL_EXPERIENCE) | FOLLOW_ALERT / CLINICAL_EXPERIENCE | Norm, Competition, Course, ClinicalTool | ⚠️ O único "Alerta" medido é **"Alerta Clínico Precoce"** do NEWS — é **protocolo clínico**, não notificação de estado. Nenhum branch/evento de notificação | `CANDIDATE_HOLD`; Follow/Alerts P1/P2 **não implementado** | **Gap (não UUA)** — corrigindo o pressuposto do briefing: produção **não** exercita alerta como notificação. `CAP-SAFETY-ALERT` é o único que é clínico (e liga-se a `ClinicalTool`) | Baixo agora; alto se o esqueleto prometer alertas de conteúdo |
| 6 | `CAP-SHARE`, `CAP-COPY-LINK`, `CAP-PUBLIC-LINK`, `CAP-PRIVATE-LINK` | SHARING_COLLAB | 12 tipos | "Compartilhar Escala" com dados no cache do device (`/fugulin.html`); fórum como partilha social | `CANDIDATE_HOLD`; Collaboration P1 ausente | **UUa** — produção compartilha *dado clínico*; esqueleto não tem objeto de partilha nem consentimento | Partilha de escala com nome do paciente sem aviso |
| 7 | `CAP-OUTPUT`, `CAP-PRINT`, `CAP-DOWNLOAD`, `CAP-COPY-CONTENT` | OUTPUT | 12 tipos | `/news.html`: "Salvar PDF" e "Imprimir"; paywall da impressão (`/conteudos_da_pagina.html`); FIND: *"template-contract mistura favorite/print/pdf/docx/listen/readingTime"* | `CANDIDATE_HOLD`; `output.ts` P0 ausente; `profile-contracts.output` **vazio por decisão** | **UUa forte** — o contrato de template **já existe** em produção e o esqueleto vai reescrevê-lo | Duas verdades para a mesma saída; PDF de prontuário sem disclaimer |
| 8 | `CAP-CALC-HISTORY`, `CAP-LAST-INPUTS`, `CAP-CALC-STEPS`, `CAP-SAVE-RESULT` | CLINICAL_EXPERIENCE | ClinicalTool | `/news.html`: tabela "Memória da Avaliação" com parâmetro, gravidade máxima, escore, total | `CANDIDATE_HOLD` | **UUa** — o estado de avaliação já é um objeto de primeira classe em produção | — |
| 9 | **nenhuma** — `telemetry_contract` é um *campo* (string), não uma capability | — | — | `/metricas.html`: `page_view`, `session_start`, `first_visit`, `user_engagement`, `scroll`, `click_menu_*`, `click_calcular_*`, `tempo_permanencia`, `subscription_checkout_*`, `subscription_payment_*` | `telemetry_contract` é **string**; Event Backbone P1 ausente | **UUa** — a produção já tem taxonomia de eventos nomeados, incluindo a escada checkout→pagamento | Funil não mensurável; contrato vira prosa |
| 10 | `CAP-SESSION-RESUME`, `CAP-LAST-POSITION` + `owner_scope` SESSION/LOCAL_DEVICE | CONTINUITY | — | `fix/corrigir-auth-core-listeners`, `fix/auth-menu-dropdown-bootstrap`; config de ferramenta em `sessionStorage` (FIND) | `state.ts` com `owner_scope` SESSION/LOCAL_DEVICE | **UUa** — o esqueleto modela o escopo certo e ignora a semântica real (aba ≠ device) | Preferência perdida a cada aba |
| 11 | `CAP-QUIZ-ATTEMPT` (Question) · `CAP-SIMULATION-ATTEMPT` (Simulation) · `CAP-COPY-CITATION` (Norm) · `CAP-CALC-STEPS` (ClinicalTool) | LEARNING / OUTPUT / CLINICAL_EXPERIENCE | Question, Simulation, Norm, ClinicalTool, LibraryEntity | 12+ simulados (50q/30q/14/32/22/20), "+400 conteúdos", 16+ normativos (NANDA-I 2018, NIC, COFEN 736/2024, Portaria 6.734/2025), 16+ calculadoras em 12 categorias | Tipos declarados (16), **3/16 com schema** (`article`, `clinical-tool`, `library-entity`); sem runtime, sem UI | **Gap de runtime** (forma coincide, execução não) | **Clinically misleading**: a forma canônica não carrega versão, fonte normativa, nem disclaimer |
| 12 | `CAP-SAVED-VIEW`, `CAP-VIEW-PRESET`, `CAP-GRID-VIEW`, `CAP-LIST-VIEW`, `CAP-GALLERY-VIEW`, `CAP-FAVORITE-VIEW` (VIEWS) · `CAP-FILTER`, `CAP-SORT` (DISCOVERY) | VIEWS / DISCOVERY | LibraryEntity, Competition, Course | Menu global (19 menus), "Mapa do Site", "plataforma Global"; FIND: *"PageTools e LibraryActions duplicam ações"* | `views.ts` P1 ausente; Saved Views/Search não implementados | **UUa** — a produção já tem a duplicação que o esqueleto quer unificar; sem absorvê-la, a reimplementação nasce em cima da dívida | Duas gramáticas de ação convivendo |

> **Âncora desta reescrita (rev. 3):** os IDs vêm do registo canónico `/workspace/ce-skeleton/catalog/capability-registry.candidate.v0.1.json` (201 capabilities, 20 famílias) e dos bindings `/workspace/ce-skeleton/catalog/object-capability-binding.candidate.v0.1.json` (16 tipos de objeto). Leitura directa do ficheiro pelo owner, não de resumo. Facto adicional medido nesta leitura: **as 16 linhas de binding têm todas `support: "PROPOSED"`** — nenhuma relação capability↔objeto está aprovada; e **todos os 16 bindings têm `guest`/`authenticated` a `POLICY_DEFINED`**, o que é coerente com guest-first mas **não está decidido** por nenhuma policy.

**Resumo da tabela 3:** 10 de 12 são **UUa** (a semântica de produção já existe e o esqueleto a modela diferente ou não a modela), 1 é **Gap de runtime** (objetos de conteúdo) e 1 (Alertas) **corrige o briefing**: produção **não** tem notificação "alerted" — o que existe é "Alerta Clínico Precoce", nome de protocolo. Nenhuma das 12 pode ser promovida de `CANDIDATE` sem escrever implementação — mas **todas as 12 exigem decisão de semântica antes** de haver código.

---

## 7. Tensões entre promessa publicada e comportamento (3 reais + 1 por apurar)

> **Não é parecer jurídico.** Isto é um registo de auditoria de conversão: constata-se o que a página publicada promete e o que a página publicada oferece, e aponta-se onde os dois textos divergem. A qualificação jurídica (LGPD/ANPD,CDC, direito do consumidor) não foi feita e não é competência desta frente.

| # | Tensão | Texto lido (produção) | Mesmo escopo? | Status |
|---|---|---|---|---|
| **T1** | **Política de privacidade × identidade e cobrança.** A política do *site* nega coleta e nega login; o *site* tem login e checkout | *"Não realizamos nenhum tipo de coleta, armazenamento ou compartilhamento de dados pessoais identificáveis. Você pode navegar e utilizar todas as calculadoras livremente, sem cadastro, login, e sem fornecer nome, e-mail ou qualquer outro dado pessoal"* (`/politica.html`) **vs.** "Entrar com Google" / "Entrar com E-mail" (Minha Conta) e cobrança de assinatura com reembolso (`/reembolso.html`) | **Sim** — mesma política, mesmo domínio, mesma página | **Tensão real, comprovada por texto lido.** O que **não** foi provado: quais dados o checkout grava no servidor (nenhum código lido) |
| **T2** | **Termos de uso × assinatura cobrada.** Os Termos descrevem as ferramentas como gratuitas; existe assinatura cobrada, com reembolso | *"ferramentas, que são disponibilizadas gratuitamente com caráter informativo, educativo e consultivo"* (`/termos.html`) **vs.** *"Você pode solicitar o reembolso da sua assinatura em até 7 (sete) dias após a cobrança"* (`/reembolso.html`) e *"assine o plano Premium"* (`/conteudos_da_pagina.html`) | **Sim** — mesmo domínio, mesma oferta | **Tensão real, comprovada por texto lido** |
| **T3** | **Oferta × paywall, e fórum UGC × promessa de privacidade.** A home apresenta as "+60 escalas assistenciais em branco para imprimir" como benefício do acervo; o download exige Premium. E o fórum exige identificação, contra a promessa de não coletar dados identificáveis | *"Mais de 60 escalas assistenciais em branco para imprimir"* (raiz) **vs.** *"Para baixar e imprimir, assine o plano Premium"* (`/conteudos_da_pagina.html`). **e** formulário do fórum pede nome/apelido, país, profissão e local de trabalho, sem moderação/denúncia (`/forum-enfermagem.html`) **vs.** `/politica.html` | **Sim** — mesmo domínio, mesma promessa | **Tensão real, comprovada por texto lido.** O que **não** foi provado: se o fórum guarda esses dados e onde (nenhum código lido) |
| **T4** | **Política do *app* × plataforma *web*.** A política do aplicativo promete sem ads, sem cookies e nada sai do device; a plataforma web tem ads, GA4, Supabase Edge Function e comentários | *"Atualmente, o aplicativo não exibe anúncios nem utiliza cookies"* · *"Nenhum desses dados é enviado para nossos servidores ou para terceiros"* (`/politicaapp.html`) **vs.** `/metricas.html`, `feat/ads-controlado`, `feat/page-comments-supabase` | **Não** — **escopos diferentes** (app vs. web) | **Por apurar → D2.** Não é contradição provada: só se o app/CE local herdar o modelo web é que passa a ser contradição |

**Reclassificação do item C6 (rev. 1):** o argumento "o CTA 'Entrar' convida a conta mas o plano não é legível" **não é uma tensão** — é uma **falta de medição**. A página de assinatura (`/assinatura`, `/assinatura.html`, `/premium`) devolveu `file load failed` e o preço/plano **não** foram lidos. Isso está registado como **NOT_RUN** na secção 9, e a coerência do CTA de assinatura permanece **não verificada**.

---

## 8. Veredito

### 8.1 O que o esqueleto tem de mudar **AGORA** (estrutura — sem tocar em oferta comercial)

| # | Mudança estrutural | Onde | Por quê (produção) |
|---|---|---|---|
| A1 | **Declarar 4 eixos transversais ausentes**: `Identity/Account`, `Billing`, `Entitlement`, `Telemetry/Consent` — como famílias transversais, **não** como capabilities de domínio | registo canónico (`experience-capability-registry.candidate`) + 45 famílias | 86/182 branches (47%) estão nesse núcleo; nenhuma família correspondente existe no esqueleto |
| A2 | **Regra dura no metamodelo**: *entitlement só existe com `owner_scope = ACCOUNT`*; `SESSION`/`LOCAL_DEVICE` nunca podem ser fonte de autorização | `metamodelo.ts` (fail-closed) + `state.ts` | 6+ branches de `premium-access-root-cause` e `billing-access-empty-entitlement`: a lição já foi paga em produção |
| A3 | **Entitlement como estado resolvido com *reason codes*** — `guest` / `sem_plano` / `pagamento_pendente` / `verificando` / `ativo` / `expirado` — e não booleano | `resolver.ts` (16 tipos) + `profile-contracts.ts` | `fix/account-subscription-verifying-state` prova o estado "verificando" em produção |
| A4 | **Desambiguar "sync"**: `sync_entitlement` (produção) vs `sync_user_data` (blueprint) | registo + glossário | produção usa "sync" para reconciliação de webhook, não para dados de usuário |
| A5 | **Preencher os 11 campos em falta do registo**, priorizando `supported_channels`, `permission_policy`, `audiences`, `policy_refs` | `metamodelo.ts` | são exatamente os campos onde vivem consentimento, canal (extensão Chrome) e audiência |
| A6 | **Reescrever `telemetry_contract` como contrato** com os nomes de evento já em produção (`subscription_checkout_*`, `subscription_payment_*`) | `telemetry_contract` (hoje string) | `/metricas.html` já publica esses eventos; o esqueleto não os conhece |
| A7 | **Reconciliar o contrato de saída** (print/pdf/docx) com o `template-contract` de produção antes de escrever `output.ts` | `output.ts` (P0) + `profile-contracts.output` | FIND: o contrato de produção mistura favorite/print/pdf/docx/listen/readingTime → risco de duas verdades |
| A8 | **Modelar o par guests-vs-conta no fórum**: pseudônimo obrigatório + `moderation_state` + `report`, mesmo sem backend | `Capture/Inbox` + `Collaboration` (P1/P2) | fórum já pede identificação real sem moderação; sem modelo, o esqueleto herda a dívida |
| A9 | **Criar um "divergence register" produção↔esqueleto**: cada linha da tabela 3 vira FIND com dono, evidência e decisão | junto ao `find-register.v1.json` (16 FINDs ainda não registrados) | o baseline de não-regressão não existe; sem ele, cada FIND se perde |
| A10 | **Declarar `ACCOUNT`/`WORKSPACE` como reservados e sem backend**, com o mesmo fail-closed dos 410 serviços — **não** simular | `state.ts` + `module-status.ts` | `policy_refs`/`audiences` dependem de servidor; simular entitlement local é o pior desfecho possível |

### 8.2 O que **depende de decisão do dono** (eu não decido)

| # | Decisão | Alternativas | Impacto se mal decidida |
|---|---|---|---|
| D1 | A promessa "sem cadastro e sem dados pessoais" da política é **vinculante**? | (a) manter política → sem login/ads/GA4/fórum; (b) manter produto → reescrever política | Passivo jurídico + perda de confiança |
| D2 | O escopo do **aplicativo** (e do CE local) herda ads/GA4/conta da plataforma web? — **apuração de T4**, não contradição provida: escopos (app) e (web) são diferentes | (a) app 100% local e anônimo (alinhado a `/politicaapp.html`); (b) app igual ao web | Se (b), nasce a tensão T4; se (a), mantém-se a separação de escopos |
| D3 | **Premium é produto real e vendável agora?** Se sim: Asaas e Stripe convivem? Qual é a ordem canônica? | (a) Asaas só; (b) Asaas BR + Stripe internacional; (c) adiar checkout | Dupla cobrança, entitlement ambíguo |
| D4 | **Login Google-only ou Google + E-mail?** (a página medida mostra os dois; a branch `…login-google-email-only` sugere só Google) | manter ambos / só Google / só e-mail | Exclui quem usa e-mail institucional — público-alvo |
| D5 | Ads para usuário free junto de conteúdo clínico — aceitável? Premium "sem anúncios" é requisito ou benefit? | ads controlados / ads removidos / ads só em não-clínico | **Dark pattern** se o cliente pago continuar vendo anúncio |
| D6 | **Fórum entra no CE?** Com moderação? Com identidade real ou pseudônimo? | (a) sim, com `moderation_state`; (b) sim, sem UGC; (c) fora do escopo do CE | UGC sem moderação é passivo de saúde |
| D7 | O **CE local** terá backend algum dia? Se nunca → `ACCOUNT`/`WORKSPACE` ficam permanentemente reservados e a produção **não pode** ser espelhada localmente | sim / não | Esqueleto casa ou não com a produção |
| D8 | Preço e **conteúdo do plano** (o que o Premium destrava além das escalas em branco)? — hoje **NOT_RUN** | — | Plano opaco: "desbloquear recursos exclusivos" sem lista |
| D9 | Extensões Chrome são canal do CE? (permission model + refresh de entitlement) | sim / não | Gap de canal e de permissão |
| D10 | A home deve continuar anunciando "+60 escalas em branco" **sem** indicar que são Premium? | (a) sim, com selo; (b) retirar o número; (c) mover para Premium | T3 — oferta × paywall |

---

## 9. O que **NÃO** foi medido (NOT_RUN)

| Item | Estado | Motivo |
|---|---|---|
| Página de **login** (`/login`, `/login.html`, `/conta.html`, `/minha-conta.html`) | **NOT_RUN** | `file load failed` em todas as tentativas; o conteúdo da conta só foi obtido via indexação de outra página |
| Página de **assinatura/Premium**: planos, preço, o que o plano destrava | **NOT_RUN** | `/assinatura`, `/assinatura.html`, `/premium` → `file load failed` |
| Existência e **integridade** do CTA "Assine já" no cabeçalho, e coerência entre o que promete e o que entrega | **NOT_RUN** | o rótulo "Entrar" apareceu (título indexado); "Assine já" veio do E1 (medido pelo owner); **conteúdo do plano não lido → a coerência do CTA de assinatura não pode ser afirmada nem negada** (item C6 da rev. 1, reclassificado aqui) |
| Coerência do **CTA "Entrar"** (o que a conta entrega vs. o que a página promete) | **NOT_RUN** | o texto da conta veio de indexação de outra página; nenhuma interação, nenhum estado autenticado |
| **Número de cliques até a primeira ação de valor** (calcular uma escala / criar conta) | **NOT_RUN** | exige navegador; o texto extraído não dá contagem de cliques nem funil |
| **Taxa de conversão** do checkout, do ads→assinatura, e de rejeição de entitlement | **NOT_RUN** | só existe instrumentação (`/metricas.html`); não há números públicos lidos |
| **Estado do login no build** (variável de ambiente, flag de feature) | **NOT_RUN** | nenhuma árvore de build inspecionada nesta frente (fora do escopo do pack) |
| **Contrato real de entitlement** (campos, fontes, TTL, reason codes) | **NOT_RUN** | só nomes de branch; nenhum arquivo lido |
| **Dados efetivamente gravados** pelo checkout e pelo fórum (nome/e-mail do titular; identificação do autor) | **NOT_RUN** | nenhum código lido; as tensões T1 e T3 estão provadas **no texto publicado**, não no armazenamento |
| **Existência de backend de sync** de dados de usuário (o "sync" de produção é de entitlement) | **NOT_RUN** | idem |
| **IDs das 201 capabilities** e binding exato capability↔produção | **NOT_RUN** | o pack não lista os IDs; o mapeamento usa os eixos canônicos de E4 (Favoritos, Continuar, Recentes, Ler depois, Coleções, Cesta, Alertas, Calendário, Passaporte, …) |
| **Acessibilidade, layout, performance** dos CTAs | **NOT_RUN** | sem browser (timeout do owner registrado no E1 l.4; aqui só houve leitura de texto) |
| **Qualificação jurídica** das políticas vs. comportamento (LGPD/ANPD, CDC, direito do consumidor) | **NOT_RUN / fora de competência** | não é parecer jurídico; ver ressalva na secção 7 |
| **Quais ferramentas de ads**, em quais páginas, com quais formatos | **NOT_RUN** | `feat/ads-controlado` sugere controle; nada foi lido |
| Se o **CE local** (esqueleto) e a **produção web** compartilham código | **NOT_RUN** | fora do escopo do pack; `src/lib/site-data.ts` ausente no `main` dos dois repos (E2 l.43-45) |
| Moderação, denúncia e retenção do **fórum** | **NOT_RUN** | a página não apresenta moderação; a existência de backend de moderação é **não verificada** |

---

## 10. Changed files

- `/workspace/.mavis/plans/plan_2973fb1f/outputs/producao-conta-funil/deliverable.md` — **reescrito** (rev. 2: bloco 7 reformulado, C6 → NOT_RUN, C2 → T4/D2, manchete corrigida, rótulos de célula ajustados).
- `/workspace/.mavis/plans/plan_2973fb1f/board.md` — **atualizado** (entradas de progresso).
- Nenhum outro arquivo alterado. Sem push, sem commit, sem alteração fora de `deliverable.md`/board.

## 11. Notes

1. **Correções desta revisão (pedidas na verificação da rev. 1 — a rev. 1 foi REPROVADA, não aceite):**
   - **C6 não era contradição** — era falta de medição. Reclassificado como **NOT_RUN** e movido para a secção 9 (linhas "Página de assinatura/Premium" e "Existência e integridade do CTA 'Assine já'"), com a nota explícita de que a coerência do CTA de assinatura **não pode ser afirmada nem negada**.
   - **C2 não era contradição provada** — comparava o *app* (`/politicaapp.html`) com a plataforma *web*, escopos diferentes. Reclassificado como **T4 (por apurar) → D2**, e o texto da linha 10 da Tabela 1 passou de "Contradição direta" para "**Condicional** — app ≠ web".
   - **Manchete corrigida**: "6 contradições duras entre documentos legais" → "**3 tensões reais + 1 por apurar** entre a promessa publicada e o comportamento observado", com ressalva explícita de que **não é parecer jurídico**.
2. **Rótulos de célula ajustados (conteúdo preservado)**: Tabela 1 linhas 2, 9, 11, 14 ganhou ponteiro para T1-T3; linha 10 passou a "Condicional (T4/D2)"; linha 3 ganhou "(entrega NOT_RUN)"; Tabela 2 linha 9 passou a "Tensão comprovada no mesmo escopo (T1)"; nota de rodapé da Tabela 1 reescrita. **Tabelas 1-3, A1-A10 e D1-D10 mantêm conteúdo, ordem e conclusões.**
3. **Corrige um pressuposto do briefing**: "alerted" **não** é exercitado pela produção — o único "Alerta" medido é "Alerta Clínico Precoce", nome de protocolo do NEWS (`/news.html`). Está marcado como **Gap**, não UUA, na tabela 3 (linha 5).
4. **O `web_fetch` funcionou parcialmente** nesta frente (5 rotas `.html` + indexação de busca), contrariando o "timeout em 3 tentativas" do E1. Rotas sem extensão e `sitemap.xml` mantiveram `file load failed`. Toda a evidência de produção aqui é **texto renderizado**, não browser — nenhuma captura, nenhum clique real.
5. **Nomes de branch são evidência de superfície, não de estado**: `fix/premium-access-root-cause` prova que o problema existiu, não que está resolvido. As conclusões de billing/entitlement da tabela 1 e 2 são **inferência forte**, marcada como tal.
6. **Reancoragem (rev. 3, owner):** a Tabela 3 passou a citar os **IDs reais** do registo (`CAP-FAVORITE`, `CAP-RESUME`, `CAP-SHARE`, `CAP-OUTPUT`, `CAP-SIMULATION-ATTEMPT`…) e o **tipo de objeto** vinculado, lidos directamente de `catalog/capability-registry.candidate.v0.1.json` e `catalog/object-capability-binding.candidate.v0.1.json`. A versão anterior (rev. 2) usava eixos canónicos do E4 e **deixava de fora** o que o registo já declara — em particular, `CAP-SAFETY-ALERT` (o único alerta que é clínico) e `CAP-CALC-STEPS`/`CAP-LAST-INPUTS` (o estado de avaliação). Note-se que `CAP-ALERT`/`CAP-DEADLINE-ALERT`/`CAP-CHANGE-ALERT`/`CAP-DIGEST`/`CAP-REMINDER` estão **declarados** no registo embora a produção não os exercite — é divergência de *exercício*, não de *vocabulário*.

7. **Nada aqui mexe na oferta comercial.** As 10 decisões da secção 8.2 são do dono; as 10 mudanças da 8.1 são estruturais e não alteram o que o visitante vê.
8. **Achado transversal para a frente de shell/CTA**: o rótulo "Entrar" do cabeçalho **existe** em produção (título "Entrar - Calculadoras de Enfermagem" na indexação) e a página de destino promete "salvar favoritos, acompanhar seu histórico e desbloquear recursos exclusivos" — ou seja, **o CTA de produção já é account-centric**, ao contrário do esqueleto local, que é guest-first. Qualquer decisão sobre "Assine já"/"Entrar" no espelho local deve ser lida contra essa assimetria.
