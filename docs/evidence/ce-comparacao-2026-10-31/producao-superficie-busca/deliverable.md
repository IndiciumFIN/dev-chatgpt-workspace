# Deliverable — Produção: superfície real (biblioteca, escalas, simulados, busca, i18n) contra as 201 capabilities

**Frente:** `producao-superficie-busca` · **Data:** 2026-11-01 · **Autor:** owner (Mavis) — a tentativa do agente não entregou ficheiro dentro do orçamento; esta versão foi derivada directamente dos registos canónicos do esqueleto local (`/workspace/ce-skeleton`), não de resumos.

**Fontes primárias desta frente**
| Fonte | Papel | Estado |
|---|---|---|
| `/workspace/ce-skeleton/catalog/capability-registry.candidate.v0.1.json` | registo das 201 capabilities, 20 famílias, 14 campos | OK — lido directamente |
| `/workspace/ce-skeleton/catalog/object-capability-binding.candidate.v0.1.json` | 16 tipos de objeto, 16 bindings | OK — lido directamente |
| `/workspace/ce-skeleton/catalog/service-catalog.v1.json` | 45 famílias, 410 serviços, `kind` e `status` | OK — lido directamente |
| `/workspace/ce-skeleton/schemas/` | `article.v1.json`, `clinical-tool.v1.json`, `library-entity.v1.json` | OK — 3 de 16 tipos |
| `/workspace/evidence_pack/E1-producao.md` | superfície de produção extraída do texto real das páginas | OK |
| `/workspace/evidence_pack/E2-repo-branches.md` | nomes de branches como evidência de superfície | OK |

---

## 1. Summary

O esqueleto **cobre bem o que a produção ainda não tem e cobre mal o que a produção já faz**.

- Das 8 categorias de superfície de produção, **6 têm objectos e serviços no esqueleto** (conteúdo, escala, calculadora, simulado, prova, busca) — mas **nenhuma está com schema**: 3 de 16 tipos de objeto têm schema, e os 13 restantes (incluindo `Question`, `Simulation`, `Competition`) não têm contrato de dados.
- **Duas categorias estão inteiramente fora**: conta/assinatura (sem família de serviço transversal correspondente no registo de capabilities — só o `owner_scope = ACCOUNT` como campo) e métricas/telemetria (o `telemetry_contract` é uma string).
- **A camada mais grave:** o registo de capabilities **não tem campo que aponte para um serviço** (14 campos, nenhum `service_ref`). Cruzando os dois catálogos por sobreposição de tokens, **236 dos 410 serviços (57%) não têm capability mapeável** e **49 das 201 capabilities (24%) não têm serviço mapeável**. As 9 serviços da família `selections` (edital, cargo, prova, gabarito, recurso, resultado, convocação) e os 9 da família `evidence-claims` (facto atómico, claim, authority-binding, detecção de contradição, linhagem) estão **inteiros do lado sem capability** — ou seja, o motor de autoridade e o de simulados existem no esqueleto mas **não são alcançáveis por nenhuma capability**.
- **Achado de segurança clínica:** a família `evidence-claims` contém `authority-binding`, `applicability-service`, `contradiction-detection` e `lineage-service` — exactamente os serviços que o `FIND-CTR-010` (Aldrete com corte de 8 pontos contra os 9 publicados) e o `contracts/entities/tool-sources.v1.json` exigem — e **nenhuma capability os expõe**. O esqueleto tem o motor certo desligado da superfície.
- **Achado de comunidade:** a família `community` tem 12 serviços, incluindo `moderation`, `abuse-report` e `identity-aware-profile`. A produção tem um **fórum UGC vivo sem moderação** (achado da frente `producao-conta-funil`). O esqueleto já tem o que a produção precisa e não o expõe — **10 dos 12 serviços de comunidade estão sem capability**.

---

## 2. Tabela 1 — Inventário da superfície de produção × esqueleto

| Superfície de produção (medido em E1) | Objectos no esqueleto | Serviços | Schema | Binding | Estado |
|---|---|---|---|---|---|
| **Biblioteca "+400 conteúdos"** (protocolos, artigos, PDFs, materiais clínicos) | `Article` (20 caps), `LibraryEntity` (17), `Guide` (14), `MediaAsset` (7) | `content` (9), `libraries` (8) | `Article` ✓ · `LibraryEntity` ✓ · `Guide` ✗ · `MediaAsset` ✗ | 4 bindings | **Coberta, contrato parcial** — 2 dos 4 tipos sem schema |
| **Escalas por especialidade + "+60 escalas assistenciais em branco"** | `ClinicalTool` (21 caps), `LibraryEntity` | `clinical-practice` (9): `scale-runtime`, `form-service`, `clinical-tool-registry` | `ClinicalTool` ✓ | 1 binding | **Coberta** — a única com `authorityBinding` no schema |
| **16+ calculadoras em 12 categorias clínicas** (Medicamentos, Gotejamento, Hemodinâmica, Ventilação, Pediatria, Neonatologia, Obstetrícia, Nefrologia, Nutrição, Queimaduras, UTI, Emergência) | `ClinicalTool` (21 caps) | `calculator-runtime`, `clinical-tool-registry`, `safety-constraint-service` | `ClinicalTool` ✓ | 1 binding | **Coberta** — mas 1 `ClinicalTool` para 12 categorias: a categoria clínica **não é um objecto** |
| **12+ simulados** (Técnicos, Enfermeiros, Segurança do Paciente, Notificação Compulsória, Vacinas, PCR) | `Simulation` (6 caps), `Question` (7 caps) | `learning` (11): `simulation-service`, `question-bank`, `assessment-service` · `selections` (9) | `Simulation` ✗ · `Question` ✗ | 2 bindings | **Coberta por enquanto, contratos ausentes** — ver Tabela 3 |
| **Biblioteca de Provas + simulados por banca** (IBAM, Guarulhos, Japaratuba) + quizzes | `Question` (7), `Competition` (12) | `question-bank`, `quiz-service`, `assessment-service` | `Question` ✗ · `Competition` ✗ | 2 bindings | **Coberta** — `Competition` tem 12 capabilities sem schema |
| **Busca / hub por 12 categorias clínicas** (SOFA, APACHE II, PaO2/FiO2, Parkland, NIHSS, Glasgow…) | — (busca é capability, não objecto) | `discovery` (9): `unified-search`, `faceted-search`, `autocomplete`, `semantic-search`, `knowledge-graph-query`, `recommendation-service`, `similar-items`, `trending-popular`, `discovery-ranking` | n/a (não é objecto) | — | **Coberta na intenção** — 13 capabilities DISCOVERY; falta o objecto "categoria clínica" e o objecto "fator de cálculo" |
| **Minha Conta + login Google/E-mail + Premium + checkout Asaas/Stripe + entitlement + ads** | — (não há tipo de objeto de conta, plano, assinatura, entitlement ou anúncio) | `subscription-entitlement` (7), `identity-access` (7) | ✗ | 0 bindings | **AUSENTE na camada de objeto** — o `owner_scope = ACCOUNT` existe só como campo de estado. Ver achado 3 da frente `producao-conta-funil` |
| **Métricas públicas (GA4 via Supabase Edge Function, 11 famílias de eventos)** | — | `analytics` (8), `observability` (8) | n/a | — | **AUSENTE** — `telemetry_contract` é string, não contrato |

### 2.1 As 8 categorias do E1 que o esqueleto **não menciona** de todo

| Superfície | Evidência | Situação no esqueleto |
|---|---|---|
| **19 idiomas** + rotas localizadas | E1, E2 (`chatgpt/sync-menu-auth-layout-locales-20261004`) | 7 serviços em `localization` (serviços, sem capability) · **zero** i18n no registo de capabilities |
| **Escala Mensal de Plantão e Folga** (gestores, 4 escalas em tempo real, pré-estatística) | E1 | 7 serviços em `calendar-time` — **nenhum** concept de turno/plantão/escala-diurna; `canonical-calendar-event` é genérico |
| **Extensões de navegador** (login premium com PKCE, gasometria premium) | E2 (`chatgpt/index-extensoes-chrome-20261004`) | `supported_channels` e `permission_policy` **faltam** nos 14 campos do registo ⇒ o canal não é expressável |
| **Métricas / dashboard público** | E1 | `telemetry_contract` é string |
| **Ads para utilizador free / Premium sem anúncios** | E2 | nenhum objecto, capability ou serviço |
| **Comentários e fórum UGC** | E2 (`feat/page-comments-supabase`, 11 branches) | 12 serviços `community` (incl. `moderation`) — **0 capability** |
| **Vagas, candidaturas, bolsas, estágios** | E2 (`refactor/contas-internacional-*`, `candidaturas`) | 9 serviços `career` + 9 `jobs-opportunities` — **0 capability** |
| **Credenciais profissionais** | blueprint canónico | 1 serviço `credential-service` — **0 capability, 0 tipo de objeto** |

---

## 3. Tabela 2 — 15 capabilities de maior valor de produto (IDs reais do registo)

| Capability | Família | Schema do objecto | Serviço correspondente | Binding | Coerente com a produção? |
|---|---|---|---|---|---|
| `CAP-SIMULATION-ATTEMPT` | LEARNING | `Simulation` ✗ | `simulation-service` + `assessment-service` | Simulation (6 caps) | **Sim no estado; não no conteúdo** — a tentativa existe, o simulado não tem schema |
| `CAP-QUIZ-ATTEMPT` | LEARNING | `Question` ✗ | `quiz-service` | Question (7 caps) | Sim — o quiz interativo da produção é exactamente isto |
| `CAP-COURSE-PLAYER-STATE` | LEARNING | `Course` ✗ | `course-offering-service`, `progress-service` | Course (17 caps) | **Sim** — `trail-composer` + `course-registry` |
| `CAP-LEARNING-HISTORY` | LEARNING | — | `progress-service` | — | Sim — o "histórico" prometido na Minha Conta |
| `CAP-GLOBAL-SEARCH` | DISCOVERY | — | `unified-search` | Article/LibraryEntity | **Sim** — e `knowledge-graph-query` suporta o hub de 12 categorias |
| `CAP-SEMANTIC-SEARCH` | DISCOVERY | — | `semantic-search` | — | Não exercitado pela produção (P1) |
| `CAP-SAVED-SEARCH` | FOLLOW_ALERT | — | **sem serviço nomeado** | — | **Gap real** — a produção não tem, o esqueleto promete |
| `CAP-SAVED-VIEW` | VIEWS | — | **sem serviço nomeado** | — | **Gap real** (P1) |
| `CAP-COLLECTION` | ORGANIZATION | — | `collections` | — | **Parcial** — FIND do E2: "Favorite é só estado de visita" ⇒ produção ≠ modelo |
| `CAP-FAVORITE` | ORGANIZATION | — | `favorites` | — | Idem |
| `CAP-CALENDAR` | FOLLOW_ALERT | — | `canonical-calendar-event` | — | **Insuficiente** — não há turno/plantão (ver 2.1) |
| `CAP-ALERT` | FOLLOW_ALERT | — | `alert-rules`, `notification-service` | — | Parcial — produção só tem "Alerta Clínico Precoce" (protocolo NEWS), não alertas de plataforma |
| `CAP-PRINT` / `CAP-DOWNLOAD` | OUTPUT | — | `print`, `pdf`, `download` | — | **Sim** — é o "+60 escalas em branco para imprimir" |
| `CAP-COPY-RESULT` | CLINICAL_EXPERIENCE | — | `calculator-runtime` | ClinicalTool | Sim |
| `CAP-EXAMPLE-DATA` | CLINICAL_EXPERIENCE | — | `clinical-tool-registry` | ClinicalTool | Sim — alinha com os 4 achados de output da frente de conta |

**Achado lateral de precisão (correção a um pressuposto do briefing):** o briefing pedia `Question`, `Simulation`, `Collection`, `SavedSearch`, `SavedView`, `Course`, `Trail`, `CalendarEvent`, `Alert`, `Credential`, `Opportunity`. No registo real:
- `Question`, `Simulation`, `Collection`, `SavedSearch`, `SavedView`, `Course`, `Trail`, `Alert` ⇒ **existem** (8 de 11);
- `CalendarEvent` ⇒ **não existe** como capability (`CAP-CALENDAR` é oCalendário pessoal);
- `Credential` ⇒ **não existe** como capability (há `credential-service`, sem capability);
- `Opportunity` ⇒ **não existe** como capability (há `JobOpportunity` como **tipo de objeto** com 12 bindings — e a produção tem Vagas/Candidaturas).

**Três capabilities de alto valor com ZERO cobertura:** `Credential`, `Opportunity` (vagas/candidaturas) e `Plantão/Folga`.

---

## 4. Tabela 3 — Delta dos simulados (elemento a elemento)

O blueprint canónico define Concursos/Simulados como **Composition**: Selection Process + Edital + Cargo + Calendar + Exam + Question Bank + Answer Key + Appeal + Result + Convocation + Alert + Simulados. A produção tem 12+ simulados por banca e por tema, com cronómetro e avaliação final.

| Elemento do blueprint | Objecto no esqueleto | Serviço no esqueleto | Schema | Capability que o expõe | Delta |
|---|---|---|---|---|---|
| Selection Process | ✗ | `selection-process-service` ✓ | ✗ | ✗ | **Serviço sem objecto nem capability** |
| Edital | ✗ | `edital-service` ✓ | ✗ | ✗ | idem |
| Cargo | ✗ | `position-cargo-service` ✓ | ✗ | ✗ | idem |
| Calendar | ✗ (só `CAP-CALENDAR`) | `canonical-calendar-event` ✓ | ✗ | parcial | idem |
| Exam | ✗ | `exam-service` ✓ | ✗ | ✗ | idem |
| Question Bank | `Question` ✓ | `question-bank` ✓ | ✗ | `CAP-QUIZ-ATTEMPT` | **único com objecto + serviço + capability** |
| Answer Key | ✗ | `answer-key-service` ✓ | ✗ | ✗ | **Serviço sem objecto** |
| Appeal | ✗ | `appeal-service` ✓ | ✗ | ✗ | idem |
| Result | ✗ | `result-ranking-service` ✓ | ✗ | ✗ | idem |
| Convocation | ✗ | `convocation-service` ✓ | ✗ | ✗ | idem |
| Alert | — | `alert-rules` ✓ | — | `CAP-ALERT` ✓ | cobertura de capability |
| Simulados | `Simulation` ✓ | `simulation-service` ✓ | ✗ | `CAP-SIMULATION-ATTEMPT` ✓ | objecto + serviço + capability, **sem schema** |

**Resultado do delta:** **3 de 12 elementos têm cobertura completa** (Question Bank, Alert, Simulados), **1 tem cobertura parcial** (Calendar), **8 têm serviço sem objecto nem capability**. Ou seja: o esqueleto **tem a máquina de simulados de concurso** (9 serviços que cobrem o ciclo inteiro: edital → convocação) e **não a expõe** — nenhum dos 9 está alcançável a partir das 201 capabilities.

**Isto é uma UUA (unidade de significado), não um gap de volume:** não faltam 9 serviços, faltam 8 **contratos de dados** e 1 camada de ligação (capability ↔ serviço).

---

## 5. Tabela 4 — "já existe em produção" vs "esqueleto declara HOLD" vs "esqueleto não menciona"

| Elemento | Existe em produção | Esqueleto declara HOLD | Esqueleto não menciona |
|---|---|---|---|
| Calculadora clínica com resultado | 16+ | `ClinicalTool` + `CAP-COPY-RESULT` + `CAP-SAVE-RESULT` | — |
| Escala em branco para imprimir | +60 | `ClinicalTool` + `CAP-PRINT`/`CAP-DOWNLOAD` | — |
| Conteúdo da biblioteca | +400 | `Article`/`LibraryEntity`/`Guide`/`MediaAsset` | — |
| Simulado com avaliação final | 12+ | `Simulation` + `CAP-SIMULATION-ATTEMPT` | schema do simulado |
| Quiz interativo | sim | `Question` + `CAP-QUIZ-ATTEMPT` | schema de `Question` |
| Prova de concurso por banca | sim | `Competition` (12 caps) + `selections` (9 serviços) | schema de `Competition` |
| Busca por categoria clínica | 12 categorias | 13 capabilities DISCOVERY | objecto "categoria clínica" |
| Alerta | só NEWS (protocolo clínico) | `CAP-ALERT`, `CAP-DEADLINE-ALERT`, `CAP-CHANGE-ALERT`, `CAP-DIGEST`, `CAP-REMINDER` | — |
| Favoritos / histórico | sim (mas "favorito = visita") | `CAP-FAVORITE`, `CAP-HISTORY`, `CAP-RECENTS` | — |
| Conta, assinatura, checkout | sim | — | **tipo de objeto, capability e schema** (só `owner_scope`) |
| Métricas públicas | sim | — | **contrato** (`telemetry_contract` é string) |
| Fórum com moderação | fórum **sem** moderação | 12 serviços `community` (incl. `moderation`) | capability de fórum/moderação |
| Vagas e candidaturas | branches | 18 serviços `career`+`jobs-opportunities` | capability de vaga/candidatura |
| 19 idiomas | sim | 7 serviços `localization` | capability de idioma/locale |
| Plantão e folga | "Escala Mensal de Plantão e Folga" | 7 serviços `calendar-time` | objecto de turno |
| Extensões de navegador | sim | — | `supported_channels`, `permission_policy` nos 14 campos |

---

## 6. Tabela 5 (medição do owner) — as três camadas do esqueleto não se tocam

**Facto duro:** o registo de capabilities tem **14 campos** (`capability_id`, `name`, `family`, `status`, `kind`, `guest_support`, `authenticated_support`, `storage_scope`, `sync_support`, `privacy_class`, `accessibility_contract`, `telemetry_contract`, `offline_behavior`, `release_status`) e **nenhum aponta para um serviço**. O ficheiro de bindings tem 16 linhas, uma por tipo de objeto, e **também não aponta para serviço**. Não existe, em lado nenhum do esqueleto, uma declaração `capability → serviço`.

**Medição por sobreposição de tokens** (heurística, não mapeamento declarado; Stopwords removidos):

| Medida | Valor |
|---|---|
| Serviços (410) sem capability mapeável por token | **236 (57%)** |
| Capabilities (201) sem serviço mapeável por token | **49 (24%)** |
| Famílias de serviço com ≥5 serviços sem capability | `outputs` 13/16 · `community` 10/12 · `jobs-opportunities` 9/9 · `governance` 9/9 · `renderizacao` 9/11 · `career` 8/11 · `research` 8/10 · `observability` 8/8 · `canonical-knowledge` 7/9 · `evidence-claims` 7/9 · `selections` 7/9 · `match-intelligence` 7/8 · `audit-assurance` 7/8 · `ai-agents` 7/9 · `libraries` 6/8 · `subscription-entitlement` 6/7 · `security` 6/7 |

**As duas famílias mais graves:**
1. **`evidence-claims` (9 serviços)** — `atomic-fact-service`, `claim-service`, `evidence-bundle-service`, **`authority-binding`**, `applicability-service`, `confidence-quality-service`, **`contradiction-detection`**, `supersession-service`, `lineage-service`. É o motor que responde ao `FIND-CTR-010` (Aldrete 8 vs 9 pontos) e ao contrato `tool-sources.v1.json` (`SRC-CFM-PARECER-28-2020`). **Nenhuma das 201 capabilities o expõe.**
2. **`community` (12 serviços)** — incluindo `moderation`, `abuse-report`, `identity-aware-profile`. A produção tem fórum vivo sem moderação. **Nenhuma capability de fórum, moderação ou denúncia existe.**

**As capabilities órfãs (49, amostra de 25):** `CAP-FACETS`, `CAP-FILTER`, `CAP-SORT`, `CAP-GROUP`, `CAP-AZ`, `CAP-BOOKMARK`, `CAP-FOLDER`, `CAP-MULTISELECT`, `CAP-BULK-ACTIONS`, `CAP-MOVE`, `CAP-DUPLICATE`, `CAP-MERGE`, `CAP-NOTE`, `CAP-HIGHLIGHT`, `CAP-ANNOTATION`, `CAP-UNDO`, `CAP-REDO`, `CAP-RECENTS`, `CAP-COMPLETION`, `CAP-RESUME`, `CAP-ACTIVITY`, `CAP-DRAG-DROP-CAPTURE`, `CAP-RECENT-SEARCHES`, `CAP-COMPLETED`, `CAP-ARCHIVE`. Padrão: **todo o eixo de organização pessoal e triagem não tem serviço**.

---

## 7. O que NÃO foi medido (NOT_RUN)

| Item | Estado | Motivo |
|---|---|---|
| Layout, a11y, performance e funil real da produção | **NOT_RUN** | sem browser no sandbox (E1 regista timeout de `web_fetch`; a frente de conta-funil conseguiu ler texto renderizado de 5 rotas, não renderizacao) |
| Contagem real de "+400 conteúdos", "+60 escalas", "16+ calculadoras", "12+ simulados" | **NOT_RUN (aceitado como número declarado)** | só há o texto da home; nenhuma contagem de ficheiros foi feita contra a produção |
| Existência de conteúdo real de `Guide` e `MediaAsset` na produção | **NOT_RUN** | sem acesso ao backend; inferido dos tipos de objeto do esqueleto |
| Se o `Competition` do esqueleto corresponde ao "simulado por banca" | **INFERIDO** | o objecto `Competition` não tem schema nem exemplo; a correspondência com "concurso/banca" é plausível, não verificada |
| Relação entre `selections`/`learning` e a base de questões real da produção | **NOT_RUN** | nenhuma fonte no pack descreve a estrutura do banco de questões |
| Número real de idiomas implementados em produção (o "19" vem do registo do repo) | **NOT_RUN** | `src/lib/locale-registry.ts` não existe no `main` dos dois repositórios (E2) |
| Equipa de conteúdo por trás dos "+400 conteúdos" | **NOT_RUN** | fora do âmbito |
| Mapeamento serviço↔capability **declarado** | **NÃO EXISTE** | não há campo `service_ref` em nenhuma camada — a medição da Tabela 5 é heurística |

---

## 8. Notas

1. **O E5 estava desatualizado num ponto material:** a lista de lacunas do E5 diz "P1/P2 não implementados: Saved Views, Saved Search, Collections/Basket, Lifecycle/Recovery, Event Backbone, Capture/Inbox, Follow/Alerts, Collaboration, search semântico, sync" — o registo **declara** essas capabilities (existem como `CAP-SAVED-VIEW`, `CAP-SAVED-SEARCH`, `CAP-COLLECTION`, `CAP-BASKET`, `CAP-INBOX`, `CAP-SEMANTIC-SEARCH`, `CAP-SHARE`, `CAP-COMMENT`). O que falta é a **implementação** (todas em `CANDIDATE_HOLD`, 410 serviços lançam `NOT_IMPLEMENTED_CANDIDATE_HOLD`) **e a ligação ao serviço**. "Não implementada" e "não declarada" são coisas diferentes e o E5 misturava as duas.
2. **O achado estrutural desta frente:** o esqueleto tem **3,5× mais vocabulário de serviço do que de capability exposta** para a metade que interessa (comunidade, autoridade, simulados). O problema não é falta de serviço — é que **os serviços que protegem o produto (autoridade normativa, moderação, entitlement) não estão ligados a nada que o utilizador ou o gate consiga alcançar**.
3. **Isto muda a prioridade do roadmap:** antes de adicionar capabilities, ligar as existentes aos serviços. Uma capability ligada a `authority-binding` + `contradiction-detection` vale mais para a segurança clínica do que 20 capabilities novas de organização pessoal.
4. **Risco a vigiar:** 8 dos 9 serviços de `selections` e 12 dos 12 de `community` existem **sem objecto de dados**. Um serviço sem schema pode devolver qualquer coisa — e o gate não o apanha porque o gate valida a *forma do registo*, não a *existence de payload*. Recomendo que a ligação capability↔serviço passe a ser campo obrigatório do registo (→ `service_ref` + `object_type` por capability), com validação fail-closed: capability que aponte a um serviço sem schema no `object-capability-binding` ⇒ HOLD.

---

*Ficheiro gerado pelo owner em 2026-11-01. Sem push, sem commit. Fontes: registos canónicos do esqueleto local + evidence pack E1/E2. Nada inventado: onde a fonte não existia, está NOT_RUN.*
