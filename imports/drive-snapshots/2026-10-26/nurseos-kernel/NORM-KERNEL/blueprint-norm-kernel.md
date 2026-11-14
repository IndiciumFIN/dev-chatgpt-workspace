# NORM-KERNEL — Blueprint de Atomização Normativa

**Versão:** 0.2 (blueprint + expansões de diretriz) · **Data:** 2026-09-29 · **Autor:** Leivis Lima (direção) + Brio (arquitetura)

---

## 1. Visão

Um sistema (aplicativo + pipeline + base governada) que:

1. **Extrai** normas de fontes oficiais (Diário Oficial da União, diários municipais via Meu Querido Diário, ISO, RFC, regulação sanitária etc.);
2. **Atomiza** cada norma em *átomos normativos* — a menor unidade normativa indivisível, canonizada em schema próprio;
3. **Canoniza** tudo em bancos fundamentais governados, onde **nenhum campo existe sem norma vinculada** (padrão POL-026 do NURSE-OS: norma granular por campo, anexo fixado por sha256 dentro da política);
4. Garante rastreabilidade ponta a ponta: **fonte oficial → texto verbatim → átomo → campo → norma do campo → política → gate → evidência → front-end gerado**.

### Princípios não negociáveis

| # | Princípio | Mecanismo |
|---|-----------|-----------|
| P1 | Nenhum campo sem norma granular | `field_norms.json` anexado e pinado (sha256) dentro da política; campo órfão bloqueia o gate |
| P2 | Nada órfão | `check_links.py`: todo link (átomo↔documento↔fonte↔dicionário↔política) resolve ou o gate bloqueia |
| P3 | Cobertura declarada | 100% do texto normativo pertence a ≥1 átomo OU está classificado explicitamente como não-normativo; universo desconhecido é EXPLÍCITO (padrão POL-027) |
| P4 | Proveniência assinada | Todo átomo carrega texto verbatim + checksum + localizador + versão do extrator |
| P5 | Canonização não destrói | Texto bruto sempre preservado; canonização é uma camada acima, nunca uma substituição |
| P6 | Front-end gerado, nunca editado | HTML/API gerados a partir do grafo verificado; mudar MD/registro e regenerar |
| P7 | Licença como gate | Nenhuma fonte entra sem registro `KnowledgeLicense` válido; ingestão sem licença = violação |
| P8 | Temporalidade explícita | Todo átomo tem janela de vigência; revogação/alteração são elos versionados, não sobrescritas |
| P9 | Incerteza declarada | Atomização incerta (ambiguidade deôntica) vai para fila de revisão humana, nunca para produção silenciosa |

---

## 2. O Átomo Normativo

### 2.1 Definição

Um **átomo normativo** é a menor unidade de texto normativo que carrega **exatamente uma** proposição deôntica ou uma definição normativa, com proveniência completa e canonização semântica.

Tipos de átomo:

- `obligation` — obrigação (dever, "deve", "é obrigado a")
- `prohibition` — proibição ("vedado", "não poderá", "é proibido")
- `permission` — permissão/faculdade ("poderá", "é facultado")
- `right` — direito/garantia ("assegurado", "é assegurado")
- `definition` — definição normativa (art. que define termo) — gera entrada no Dicionário
- `scope` — âmbito de aplicação ("aplica-se a...")
- `sanction` — consequência pelo descumprimento (penalidade, nulidade)
- `delegation` — delegação de competência ("fica autorizado a editar")

### 2.2 Regras de atomicidade (invariantes do kernel)

| Regra | Enunciado | Verificação |
|-------|-----------|-------------|
| R1 | 1 átomo = 1 proposição deôntica OU 1 definição | parser + fuzzing de invariantes |
| R2 | Localizador completo e unívoco (art. → § → inciso → alínea → índice) | schema + checagem de unicidade |
| R3 | Todo átomo tem texto verbatim + checksum sha256 | gate |
| R4 | **Teste de reconstrução**: a união dos átomos + trechos classificados regenera o documento-fonte (por checksum de cobertura) | gate de cobertura P3 |
| R5 | Cada caractere não-atomizado do documento está classificado (`preamble`, `signature`, ` boilerplate`, `non_normative`) com localizador | gate |
| R6 | Sujeito/ação/objeto têm `canon_ref` para Dicionário E `raw` verbatim | gate de canonização |
| R7 | Condições e exceções são **elos**, nunca fusão de átomos | parser |
| R8 | Átomo com ambiguidade deôntica → `review_pending`, jamais `valid` | fila HITL (padrão POL-002) |
| R9 | Sanção é átomo próprio, vinculado ao átomo violável por elo `sanction_for` | gate de integridade de elos |

### 2.3 Template de schema do átomo (o "atomização-template")

```json
{
  "identity": {
    "atom_id": "NK-ATOM-0000123",
    "slug": "dou-2026-port123-anvisa-art4-par2-incII-ob",
    "version": "1.0.0",
    "status": "valid | review_pending | revoked | superseded | draft"
  },
  "provenance": {
    "source_ref": "SRC-DOU-SECAO1",
    "license_ref": "KL-0007",
    "document": {
      "doc_ref": "NK-DOC-00456",
      "doc_type": "portaria | lei | decreto | resolucao | rfc | iso | spec",
      "number": "123", "year": "2026",
      "issuer": {"raw": "Agência Nacional de Vigilância Sanitária", "canon_ref": "DICT:authority:ANVISA"},
      "hierarchy_rank": 4
    },
    "locator": {
      "hierarchy_path": ["art. 4º", "§ 2º", "inciso II"],
      "page": 42, "section": "Seção 1",
      "edition_date": "2026-08-15",
      "verbatim_text": "Os fabricantes deverão notificar a autoridade sanitária em até 72 horas."
    },
    "checksum": "sha256:...",
    "extracted_at": "2026-09-29T10:00:00-03:00",
    "extractor_version": "extractor-v0.1.0",
    "coverage_token": "sha256 do trecho do documento que este átomo cobre"
  },
  "deontic_core": {
    "atom_type": "obligation",
    "modality": "shall | shall_not | may | should | is_entitled",
    "subject": {"raw": "Os fabricantes", "canon_ref": "DICT:agent:fabricante"},
    "action": {"raw": "notificar a autoridade sanitária", "canon_ref": "DICT:action:notificar"},
    "object": {"raw": "eventos adversos", "canon_ref": "DICT:object:evento-Adverso"},
    "deadline": {"raw": "em até 72 horas", "norm": {"value": 72, "unit": "hours"}},
    "conditions": [
      {"type": "activation | exception | temporal | territorial", "raw": "...", "atom_ref": "NK-ATOM-..."}
    ],
    "confidence": 0.94,
    "uncertainty": null
  },
  "classification": {
    "jurisdiction": {"country": "BR", "level": "federal | estadual | municipal", "uf": null, "municipality": null},
    "domain": ["health", "regulatory"],
    "themes": ["vigilancia-sanitaria", "tecnovigilancia"],
    "hierarchy_rank": 4,
    "validity": {
      "in_force_at": "2026-09-01",
      "revoked_at": null, "revoked_by": null,
      "tempus_regit": "revogação expressa | tácita (verificar)"
    }
  },
  "links": {
    "contradicts": [], "contradiction_refs": [],
    "supersedes": [], "superseded_by": [],
    "depends_on": [], "implements": [], "regulated_by": [],
    "sanction_for": [], "conditions_for": [],
    "policy_refs": ["POL-001"], "cko_refs": []
  },
  "i18n": {
    "en": {"text": "...", "status": "machine | human_reviewed"},
    "es": {"text": "...", "status": "machine"}
  },
  "accessibility": {
    "plain_language_ptbr": "Fabricantes têm 3 dias para avisar a ANVISA sobre problemas com seus produtos.",
    "reading_level": "medio", "wcag_notes": "alternativa em linguagem simples disponível"
  },
  "seo": {
    "title_ptbr": "Prazo de 72h para notificação de eventos adversos (Portaria 123/2026 ANVISA, art. 4º §2º II)",
    "description": "...", "keywords": ["ANVISA", "tecnovigilância", "evento adverso"],
    "uri_slug": "br/federal/portaria/2026/123/art4-par2-incII"
  },
  "governance": {
    "field_norms_ref": "annex:field_norms.json#atom.deontic_core.deadline",
    "evidence_id": "EV-NK-0001",
    "gate_result": "PASSED",
    "reviewed_by": "human:leivis | agent:pipeline | null",
    "validation_timestamp": "..."
  },
  "analytics": {
    "usage_count": 0, "citation_count": 0, "last_validated": null
  },
  "metadata": {"created_date": "auto", "updated_date": "auto", "created_by": "auto"}
}
```

**Regra de template:** cada domínio (ISO, RFC, DOU...) usa este núcleo + um **módulo de domínio** (20–30%), nunca um schema solto — mesma arquitetura Core+Módulo do CKO.

### 2.4 Schema do documento-fonte (NormDocument)

```json
{
  "identity": {"doc_id": "NK-DOC-00456", "slug": "portaria-123-2026-anvisa", "version": "1.0.0"},
  "source_ref": "SRC-DOU-SECAO1",
  "canonical_citation": "BR, Portaria nº 123, de 14 de agosto de 2026, DOU Seção 1, 15/08/2026, p. 42",
  "hierarchy": {"rank": 4, "rank_label": "portaria regulamentar", "parent_refs": []},
  "structure_tree": ["ementa", "art. 1º", "art. 2º", "..."],
  "coverage": {
    "atom_count": 87, "non_normative_tokens": 12,
    "reconstruction_checksum": "sha256:...", "coverage_percent": 100.0
  },
  "amendments": [{"amended_by_ref": "NK-DOC-...", "fields": ["art. 4º"]}],
  "license_ref": "KL-0007",
  "evidence_id": "EV-NK-0002"
}
```

---

## 3. O Kernel

O **Kernel Normativo** é o núcleo mínimo autocontido do qual tudo deriva. Nada fora do kernel pode criar registros; tudo só pode usá-lo.

| Componente | Conteúdo | Papel |
|------------|----------|-------|
| **K1 Metaschema** | Schemas dos schemas (definição de tipo, campo, norma-de-campo, elo) | só o metaschema define o que é um campo válido |
| **K2 Registros (registers)** | 7 registros canônicos (ver §4) | fonte única de verdade por tipo de objeto |
| **K3 Dicionários** | Dicionário canônico de termos (agente, ação, objeto, autoridade) | canonização semântica com `raw` preservado |
| **K4 Invariantes** | R1–R9 + regras de cobertura | o que o sistema **sempre** garante |
| **K5 Gates** | pipeline de validação bloqueante com evidência assinada | enforcement |
| **K6 Geradores** | `build_frontend.py`, `build_api.py` | front-end/API sempre derivados, nunca editados |
| **K7 Cadeia de políticas** | field_norms pinado dentro da política por sha256 | mudança de registro sem ato de política = DRIFT (padrão POL-026 v1.2) |

---

## 4. Registros (Registers) e Dicionários

### 4.1 Os 7 registros canônicos

1. **SourceRegistry** (`SRC-*`) — fontes de extração: DOU, MQD, ISO, RFC... cada uma com endpoint, método, frequência, licença vinculada (`license_ref` obrigatório, princípio P7) e política de citação.
2. **DocumentRegistry** (`NK-DOC-*`) — documentos normativos completos, com árvore estrutural e cobertura.
3. **AtomRegistry** (`NK-ATOM-*`) — os átomos.
4. **DictionaryRegistry** (`DICT:*`) — termos canônicos: `agent`, `action`, `object`, `authority`, `theme`. Cada termo: definição, fonte da definição, elos para átomos `definition`.
5. **FieldNormsRegistry** (`annex:field_norms.json`) — **a norma granular de cada campo de cada schema** (padrão NURSE-OS POL-026 v1.1: 23 campos → aqui estendido a todos os campos de todos os schemas). Pinado por sha256 dentro da política.
6. **EvidenceRegistry** (`EV-NK-*`) — artefatos de evidência com checksum e gate_result.
7. **LicenseRegistry** (`KL-*`) — reutiliza a entidade `KnowledgeLicense` existente no app.

### 4.2 Reuso de entidades já existentes no app (NURSE-OS)

- `RegulatoryItem` → registra cada norma/alteração regulatória com `impact_refs` e `impact_status` (é exatamente o registro de rastreio regulatório).
- `Contradiction` → conflitos entre átomos (`claim_a`/`claim_b`, `cko_refs`, `requires_human_review`).
- `KnowledgeChange` → versionamento e recertificação de mudanças de conhecimento.
- `PolicyEvidence`, `AgentPolicy` → cadeia de políticas e evidências.

### 4.3 Entidades novas a criar (modelo de dados)

| Entidade | Campos-chave |
|----------|--------------|
| `NormSource` | source_id, name, kind (dou/mqd/iso/rfc/other), api_endpoint, auth_mode, fetch_cadence, license_ref, citation_policy, status |
| `NormDocument` | doc_id, source_ref, doc_type, number, year, issuer, canonical_citation, hierarchy_rank, structure_tree, coverage_json, amendments, license_ref, evidence_id |
| `NormAtom` | atom_id, doc_ref, atom_type, modality, subject_raw, subject_canon, action_raw, action_canon, object_raw, object_canon, deadline_raw, conditions_json, verbatim_text, locator_path, checksum, confidence, status, validity_json, links_json, field_norms_ref, evidence_id |
| `DictionaryTerm` | term_id, namespace (agent/action/object/authority/theme), label, definition, definition_source_ref, i18n, atom_definition_ref, status |
| `ExtractionRun` | run_id, source_ref, doc_refs, atoms_created, coverage_percent, failures, extractor_version, evidence_id, status |

---

## 5. Fontes de Extração

### 5.1 Tabela de fontes

| Fonte | Onde / API | Formato | Licença | Gate |
|-------|------------|---------|---------|------|
| **DOU (Diário Oficial da União)** | in.gov.br — serviço de leitura do jornal por data/seção (JSON + PDF) **(verificar endpoints oficiais; há serviço web do IN)** | JSON, PDF | dados públicos; texto é domínio público legal (obra oficial, art. 8º Lei 9.610) | LIBRE |
| **Legislação federal consolidada** | Planalto (CCivil) — textos consolidados; **sem API oficial** (scraping controlado) **(verificar)** | HTML | domínio público de obras oficiais | LIBRE |
| **Câmara dos Deputados** | dadosabertos.camara.leg.br (API REST oficial) | JSON | dados abertos | LIBRE |
| **Senado** | dadosabertos.senado.leg.br (API oficial) | JSON | dados abertos | LIBRE |
| **Meu Querido Diário (OKBR)** | API pública queridodiario.ok.org.br — busca em diários municipais, downloads em texto **(verificar versão/limites da API)** | JSON, TXT | dados abertos (diários são públicos; LGPD aplica a dados pessoais contidos) | LIBRE c/ cuidado LGPD |
| **RFC (IETF)** | rfc-editor.org (texto integral), datatracker.ietf.org API (metadados + errata) **(verificar formato exato da API)** | TXT, JSON | IETF Trust — uso livre com restrições de atribuição/mutação | LIBRE c/ atribuição |
| **W3C** | páginas TR de cada spec | HTML | licenças W3C (permissivas) | LIBRE |
| **ISO** | iso.org / Online Browsing Platform — catálogo com API; **texto integral exige licença paga** **(verificar)** | XML/HTML | **PROPRIETÁRIA** — compra/assinatura obrigatória; ingestão integral só com contrato | LICENSED |
| **ABNT** | catálogo ABNT — texto integral licenciado **(verificar)** | — | **PROPRIETÁRIA** | LICENSED |
| **NIST (FIPS, SP 800)** | nvlpubs.nist.gov (PDFs públicos) | PDF | domínio público (governo dos EUA) | LIBRE |
| **ANVISA / CFM / COFEN / MS** | sítios oficiais + **originariamente DOU** (usar DOU como fonte canônica) | HTML/PDF | obras oficiais + regulamentos setoriais | LIBRE |
| **HL7 FHIR** | spec.hl7.org + packages FHIR (simplify) | HTML, JSON | livre (HL7 license) | LIBRE |
| **WHO ICD-11** | API ICD-11 (registro gratuito) | JSON | licença WHO (uso sob condições) | REGISTERED |
| **LOINC** | loinc.org / API | CSV/JSON | licença LOINC (gratuita, com aceitação) | REGISTERED |

**Regra de fonte:** toda fonte nasce no `SourceRegistry` com `license_ref` válido **antes** da primeira extração. Extrair de fonte não registrada = violação de gate. Texto integral de ISO/ABNT só entra com contrato registrado em `KnowledgeLicense` — sem isso, só metadados de catálogo (título, escopo, status) como átomo `definition` de citação.

### 5.2 Hierarquia normativa (para `hierarchy_rank`)

1. Constituição Federal (e emendas)
2. Lei complementar / Lei ordinária / Tratados
3. Medida provisória
4. Decreto
5. Portaria / Resolução / Instrução normativa
6. Norma técnica (ISO/ABNT) — **não é lex, é norma voluntária**; entra como camada técnica vinculável por `implements`/`regulated_by`
7. RFC/spec — norma técnica de fato

---

## 6. Pipeline de Conversão (E-P-A-C-V-G-P)

```
EXTRACT → PARSE → ATOMIZE → CANONIZE → VALIDATE → GOVERN → PUBLISH
```

| Estágio | O que faz | Artefato | Gate de saída |
|---------|-----------|----------|---------------|
| **1. EXTRACT** | Baixa o documento da fonte registrada, registra hash imediato, guarda binário original | `ExtractionRun`, arquivo bruto | fonte registrada + licença válida |
| **2. PARSE** | Estrutura o documento: árvore (art./§/inc./alínea), metadados, ementa | `NormDocument.structure_tree` | árvore sem nós órfãos |
| **3. ATOMIZE** | Segmenta em átomos deônticos (R1–R9); classifica não-normativo | `NormAtom` (status `review_pending`) | cobertura P3 = 100% com universo desconhecido explícito |
| **4. CANONIZE** | Mapeia sujeito/ação/objeto a termos do Dicionário; cria termos novos a partir de átomos `definition` | `DictionaryTerm`, `canon_ref` | canon_ref resolve ou cria termo com evidência |
| **5. VALIDATE** | Schema + invariantes R1–R9 + fuzzing property-based (padrão POL-027: 2000 casos) + teste de reconstrução R4 | relatório de validação | FPs = falha crítica (padrão NurseBench) |
| **6. GOVERN** | Gates de política, field_norms, elos, contradições (detecção → `Contradiction` com `requires_human_review`), evidência assinada sha256 | `PolicyEvidence`, `EV-NK-*` | gate bloqueante |
| **7. PUBLISH** | Regenera front-end e API do grafo verificado | HTML, JSON API, sitemap | front-end nunca editado à mão (P6) |

Fluxo HITL embutido: átomos com `confidence < 0.85` OU ambiguidade deôntica → fila de revisão humana → só então `valid` (padrão POL-002/POL-004 do NURSE-OS).

---

## 7. Camadas Horizontais (transversais)

Cada camada é um "tecido" que atravessa **todos** os bancos e **todas** as camadas verticais. Cada campo de cada schema tem vínculo com ≥1 camada horizontal via `field_norms.json`.

| # | Camada | Conteúdo | Norma de referência (exemplos, registrar tudo em field_norms) |
|---|--------|----------|----------------------------------------------------------------|
| H1 | **Metamodelo & Registros** | 7 registros, metaschema, IDs estáveis | próprio kernel (auto-referência), ISO/IEC 11179 metadados **(verificar)** |
| H2 | **Identidade & Versionamento** | IDs, slugs, versionamento semântico de átomos, chain de alterações | ISO/IEC 38500 **(verificar)**; prática interna vMAJOR.MINOR |
| H3 | **Proveniência & Evidência** | checksums, evidence graph, não-repúdio dos gates | W3C PROV; padrão PolicyEvidence existente |
| H4 | **Policy-as-Code** | políticas como código, field_norms pinado, gates bloqueantes, DRIFT = bloqueio | padrão POL-026 v1.2 comprovado |
| H5 | **Temporalidade** | vigência, revogação, retroatividade, timeline por átomo | LINDB; teoria lex posterior (registrar como norma interna) |
| H6 | **Canonização Semântica** | dicionários, deôntica, desambiguação, elos de contradição | lógica deôntica padrão; ISO 1087 terminologia **(verificar)** |
| H7 | **Licenciamento** | registro por fonte, citação obrigatória, restrição ISO/ABNT | Lei 9.610/1998 art. 8º (obras oficiais); contratos |
| H8 | **Acessibilidade** | WCAG 2.2 AA, linguagem simples por átomo (campo `plain_language_ptbr` obrigatório), contraste, ARIA | WCAG 2.2; LGPD art. 9º; Decreto 5.296 **(verificar)** |
| H9 | **i18n** | pt-BR fonte, en/es derivados com status de revisão | padrão CKO (pt/en/es) |
| H10 | **SEO & Descobribilidade** | URI tipo ELI (European Legislation Identifier como padrão de URI para legislação), JSON-LD `schema.org/Legislation` + `Dataset`, sitemap, slags canônicos | schema.org; ELI (padrão UE, adotar o esquema de URI) **(verificar aderência BR)** |
| H11 | **Segurança & Privacidade** | dados pessoais em diários oficiais (nomes em portarias!) → política de pseudonimização/limite de propósito; OWASP Top 10 + OWASP LLM Top 10 | LGPD arts. 2º, 5º, 11; OWASP |
| H12 | **Front-end Gerado** | render do grafo verificado, aderência exibida por campo ("aderência evidenciada", norma em `<details>`) | padrão POL-026 v1.1 comprovado |

---

## 8. Camadas Verticais (domínios)

Cada vertical = 1 pipeline E-P-A-C-V-G-P completo, com fonte(s) própria(s), dicionário-adjacente e fatia de entrega independente. Todas compartilham o kernel e as 12 horizontais.

| # | Vertical | Fontes | Conteúdo | Estado inicial |
|---|----------|--------|----------|----------------|
| **V1** | Legislação federal | DOU, Planalto, Câmara, Senado | CF, leis, decretos, portarias | **PRIMEIRA FATIA** — 1 portaria ANVISA ponta a ponta |
| **V2** | Diários subnacionais | Meu Querido Diário (municipais), diários estaduais | decretos municipais, portarias locais | Fase 2 |
| **V3** | Normalização técnica | ISO, ABNT (LICENSED), NIST (livre) | normas técnicas citáveis | Fase 3 — gating por licença |
| **V4** | Internet & tecnologia | RFC, W3C | MUST/SHOULD/MAY → átomos deônticos perfeitos (a deôntica RFC já é explícita: RFC 2119) | Fase 3 — **melhor caso de teste** para o parser |
| **V5** | Regulação setorial saúde | ANVISA, CFM, COFEN, MS, ANS (via DOU canônico) | resoluções, normas técnicas sanitárias | Fase 2 — integra direto com NURSE-OS |
| **V6** | Interoperabilidade clínica | HL7 FHIR, LOINC, SNOMED CT, ICD-11, terminologias | perfis, requisitos SHALL de specs clínicas | Fase 4 — ponte com o CKO |

**Por que V4 (RFC) é o melhor validador:** RFC 2119 define MUST/SHOULD/MAY como deôntica explícita, em texto estruturado, licença livre — é o cenário ideal para calibrar o atomizador antes de encarar o português jurídico do DOU. Recomendo V4 como *teste de fumaça* e V1 como *primeira fatia de valor*.

---

## 9. Governança: a cadeia completa

```
FONTE OFICIAL (registrada + licenciada)
  → DOCUMENTO (árvore + cobertura + reconstrução)
    → ÁTOMO (verbatim + checksum + deôntica)
      → CAMPO (todo campo com norma granular em field_norms.json)
        → POLÍTICA (field_norms pinado por sha256 dentro da política)
          → GATE (bloqueante, fuzzing + invariante + teste de reconstrução)
            → EVIDÊNCIA (assinada, rastreável, coverage 100% declarada)
              → FRONT-END/API (gerado do grafo, aderência por campo visível)
```

Regras de gate (herdadas do NURSE-OS, comprovadas):

- **Cobertura de campo:** nenhum schema entra em produção com campo sem norma em `field_norms.json`. `check_links.py` bloqueia campo órfão.
- **Cobertura de texto:** teste de reconstrução R4 falha = bloqueio.
- **Falsos positivos de atomização = falha crítica** (padrão do detector v0.3 do NURSE-OS).
- **Mudança sem ato de política = DRIFT bloqueado** (prova do drill POL-026 v1.2: editar registro sem re-pin só passa com ato de política documentado).
- **Universo desconhecido explícito** (padrão POL-027): no primeiro corte, declarar honestamente — ex.: parsing OCR de PDFs escaneados, deôntica implícita sem modal explícito, resolução automática de conflitos normativos, anonimato de agente passivo, qualidade do TXT do MQD, variação de formato entre diários municipais.

---

## 10. Roadmap

| Fase | Entrega | Critério de aceite |
|------|---------|-------------------|
| **0. Kernel** | Schemas (átomo, documento, fonte, termo, field_norms), registros, invariantes R1–R9, gates, evidência assinada | gate PASS com cobertura de campo 100% e universos desconhecidos declarados |
| **1. V4 RFC + V1 DOU** | Atomizador calibrado em RFC 2119; 1 portaria ANVISA ponta a ponta (DOU→front-end) | teste de reconstrução 100%; P=R=F1 no golden set de deôntica (padrão EV-VS-0101: golden ≥100 casos) |
| **2. V5 + V2** | Regulação sanitária + Meu Querido Diário; fila HITL de revisão deôntica | 3 documentos reais atomizados com revisão humana; política LGPD para dados pessoais em diários |
| **3. V3 ISO** | Metadados de catálogo ISO/ABNT livres + texto integral **somente com contrato** | KnowledgeLicense registrado ou bloqueio explícito documentado |
| **4. V6 + ponte CKO/NURSE-OS** | Specs clínicas (FHIR SHALL) como átomos; `cko_refs` e `policy_refs` ligando ao NURSE-OS | átomo normativo alimentando `RegulatoryItem.impact_refs` e policies POL-* |

---

## 11. Riscos e dívidas declaradas (universo desconhecido, v0)

1. **OCR/PDF escaneado** — DOU e diários municipais têm PDFs de qualidade variável; parser de texto pode falhar silenciosamente → cobertura R4 detecta, mas a correção é manual (verificar Tesseract/layout).
2. **Deôntica implícita** — "fica responsável por", "considera-se" exigem classificação semiautomática → confiança baixa → HITL.
3. **ISO/ABNT** — sem contrato, vertical V3 fica em metadados; **decisão de compra pendente**.
4. **Endpoints de API** — tudo marcado **(verificar)** precisa de validação empírica antes da Fase 1 (DOU, Planalto, MQD, datatracker).
5. **Qualidade do TXT do Meu Querido Diário** — extrator municipal varia por município; R4 protege, mas o custo de correção cresce.
6. **LGPD em diários** — diários contêm dados pessoais (nomeações, licitações); H11 exige política de propósito e retenção antes da Fase 2.
7. **Conflitos normativos** — resolução automática fora de escopo no v0; `Contradiction` + HITL é o caminho.

---

## 12. Decisões tomadas neste blueprint

1. Nome de trabalho: **NORM-KERNEL (NK)** — descritivo, conecta com NURSE-OS sem confundir.
2. RFC 2119 como calibração, DOU/ANVISA como primeira fatia de valor.
3. ISO/ABNT nunca com texto integral sem licença registrada — metadados de catálogo são o fallback sempre disponível.
4. Reuso máximo das entidades NURSE-OS (`RegulatoryItem`, `Contradiction`, `KnowledgeChange`, `KnowledgeLicense`, `PolicyEvidence`, `AgentPolicy`).
5. O átomo carrega acessibilidade (linguagem simples) e SEO como campos de primeira classe, não como camada depois.

---

# PARTE II — v0.2: Expansões de Diretriz (2026-09-29)

Diretrizes novas do Leivis integradas: policy-as-code, W3C PROV, sustentabilidade digital, OG image, agentes, segurança, governança, JSON canônico, ISO 8000, OSCAL, direitos autorais (Lei 9.610), acessibilidade/SEO/metadata/i18n com excelência nativa, componentes com contratos, versionamento, e: **agentes não controlam nada — solicitam serviços; o kernel é orquestrador e guardião, mas NÃO é a autoridade máxima.**

## 13. Hierarquia de Autoridade (o kernel não é a autoridade máxima)

A autoridade desce assim, de cima para baixo:

```
1. A NORMA VIGENTE (a lei/regulamento extraído — a fonte oficial em si)
2. ATO DE POLÍTICA assinado por humano (policy-as-code, com HITL)
3. KERNEL — orquestrador e guardião: aplica, faz cumprir, jamais emenda
4. COMPONENTES E SERVIÇOS (contratados, versionados)
5. AGENTS — solicitam serviços, nunca controlam o banco diretamente
```

**O kernel PODE:** executar gates, aplicar invariantes R1–R9, orquestrar o pipeline E-P-A-C-V-G-P, guardar os 7 registros, gerar evidência assinada, bloquear tudo que violar política.

**O kernel NÃO PODE:** alterar política, re-pin de `field_norms.json` sem ato de política, aprovar exceção, auto-modificar-se (padrão POL-009 do NURSE-OS: proibida automodificação silenciosa). Kernel que "corrige" uma política é um kernel em DRIFT — e DRIFT é bloqueado.

A autoridade máxima operacional é o **ato de política aprovado por humano**; acima dele, a própria norma. O kernel é o guardião da cadeia, não o dono dela.

## 14. Qualidade de Dados — ISO 8000 (camada transversal obrigatória)

A série ISO 8000 vira camada horizontal H18 com **métrica de qualidade por campo**, com norma vinculada — "nenhum campo sem norma e sem métrica de qualidade":

| Dimensão ISO 8000 | Mecanismo NK | Gate |
|---|---|---|
| Qualidade **sintática** | JSON Schema (draft 2020-12) em todos os schemas + RFC 8785 (serialização canônica) | validação de schema bloqueante |
| Qualidade **semântica** | Dicionário canônico, `canon_ref` por sujeito/ação/objeto, SKOS | termo não resolvido = review_pending |
| **Proveniência** | série de proveniência ISO 8000 + W3C PROV-O (§16) | átomos sem proveniência completa = bloqueio |
| **Dados de referência/mestre** | DictionaryRegistry como dados-mestre, versionados | R4 reconstrução |
| **Medição de qualidade** | métricas por campo (completude, precisão, atualidade, consistência) em `field_norms.json` | score abaixo do mínimo = review |

ISO 8000 é série **PROPRIETÁRIA**: texto integral exige licença (KL-*); a aplicação dos princípios acima é interna, mas as partes citadas (8000-1 fundamentos, série 100 gestão, série 200 sintática/semântica, série 300 proveniência, 110 dados-mestre) devem ser **(verificar)** e registradas como dívida com aquisição recomendada — é a única série ISO cuja compra eu recomendo fazer cedo, porque rege a qualidade de TODO o banco.

## 15. Policy-as-Code com OSCAL

As políticas do NK ganham uma camada de interoperabilidade GRC em **OSCAL** (NIST, Open Security Controls Assessment Language):

- `AgentPolicy` → mapeada para **OSCAL component-definition** (componentes com control-implementation); controles com análogo em **NIST SP 800-53** mapeados quando aplicável (acesso, auditoria, integridade, manutenção).
- Execução de gates → **OSCAL assessment-plan / assessment-results** exportáveis para qualquer ferramenta GRC.
- `field_norms.json` → mapeado como OSCAL set-parameter + control mappings.
- Tudo nasce em JSON legível por máquina primeiro; OSCAL é a camada de export/import de compliance (ferramentas GRC consomem OSCAL nativamente).
- **(verificar)** versão do modelo OSCAL (1.1.0) e detalhes de cada layer.

## 16. Proveniência — W3C PROV-O

O grafo de evidências (`EV-NK-*`) é serializado em **PROV-O** (ontologia W3C):

- `prov:Entity` (átomo, documento, registro) — `prov:wasGeneratedBy` → `prov:Activity` (extração, atomização, canonização, revisão humana, ato de política) — `prov:used` → `prov:Entity` (fonte, arquivo bruto) — `prov:wasAttributedTo` (extrator/agente/humano) — `prov:wasDerivedFrom`.
- Cada evidência exporta JSON-LD PROV-O **mais** PROV-N legível para auditoria humana.
- Interop dupla: ISO 8000 (proveniência) ↔ W3C PROV — mesma camada H3, dois vocabulários oficiais.

## 17. JSON Canônico e Contratos de Componentes

**RFC 8785 (JSON Canonicalization Scheme, JCS):** TODO checksum e assinatura do NK usa serialização canônica JCS — o teste de reconstrução R4 e o pin de `field_norms.json` por sha256 só são determinísticos com JCS. Sem isso, dois JSONs "idênticos" têm hashes diferentes e o gate vira loteria.

**Contratos obrigatórios por componente (nada sem contrato):**

| Superfície | Contrato | Teste |
|---|---|---|
| Todo schema | JSON Schema draft 2020-12 (incluindo o metaschema K1) | validação + fuzzing property-based |
| Toda API | OpenAPI 3.1 | contract tests bloqueantes em CI (geração de casos) |
| Todo componente front-end | contrato de props/dados (JSON Schema) + contrato de acessibilidade (roles, focus, contraste) + tokens de design | testes de contrato + axe por componente |
| Todo gerador | `build_frontend.py` / `build_api.py` com versão e contrato de saída | snapshot determinístico (JCS) |

## 18. Novas Camadas Horizontais (H13–H18)

Complementam as H1–H12 do §7; cada uma também com norma granular por campo em `field_norms.json`:

| # | Camada | Conteúdo | Referência |
|---|--------|----------|------------|
| H13 | **Sustentabilidade digital** | W3C Web Sustainability Guidelines (WSG) **(verificar status)**, peso de página, carbono por visualização (Sustainable Web Manifesto), green hosting, orçamento de bytes, imagens otimizadas, dark mode, cache de longo prazo — sustentabilidade como MÉTRICA de registro com norma, não como intenção | W3C WSG; Sustainable Web Manifesto |
| H14 | **OG image & social cards** | `build_frontend.py` gera `og:image` + `twitter:card` por átomo/documento/vertical A PARTIR DO GRAFO (nunca desenhado à mão), com alt-text obrigatório e template versionado | Open Graph; Twitter/X cards |
| H15 | **Metadados completos** | Dublin Core Terms (dct:title, dct:issued, dct:publisher, dct:rights...), SKOS para dicionários (skos:Concept, prefLabel, altLabel, definition, inScheme), schema.org Legislation + Dataset, DataCite para datasets exportados | DCMI; SKOS; schema.org |
| H16 | **SEO excelência** | URLs canônicas por átomo (esquema ELI), hreflang completo pt/en/es, sitemaps por vertical, JSON-LD em toda página gerada, orçamentos de performance (Core Web Vitals) como GATE de publicação | ELI; schema.org; CWV |
| H17 | **i18n completo** | mensagens ICU, glossário normativo traduzido com status de revisão (machine/human_reviewed), data/hora localizadas, RTL-ready, hreflang, TRADUÇÃO COMO ÁTOMO VERSIONADO (não arquivo lateral) | padrão CKO i18n |
| H18 | **Qualidade ISO 8000** | §14 acima — métrica de qualidade por campo com norma vinculada | ISO 8000 (LICENSED, **(verificar)** partes) |

**"Já nasce excelente"** (acessibilidade e SEO não são fase posterior): o gate PUBLISH inclui **axe-core/pa11y** (WCAG 2.2 AA mínimo, AAA onde aplicável) e **Lighthouse ≥ 95** (accessibility, SEO, performance, best-practices) — falha bloqueia a publicação, igual a qualquer outro gate.

## 19. Modelo de Agentes (nada sob controle direto do agente)

- **Agents NUNCA escrevem no banco.** Eles solicitam serviços ao kernel via **capability registry** — padrão POL-020 do NURSE-OS (entidades existentes: `Capability`, `DelegationRequest` com candidates, selected, selection_reason, policies_satisfied).
- Todo acesso é um `DelegationRequest`: agente + capacidade + políticas satisfeitas + escopo + evidência. O kernel valida (capacidade existe, `min_trust_score`, `required_policies` satisfeitas) e executa EM NOME DO agente.
- Agentes extraem, atomizam, canonizam, traduzem — sempre sob contrato (§17); o banco só muda por ato do kernel guardião com gate + evidência.
- Segurança agêntica transversal: **OWASP Top 10 + OWASP LLM Top 10**, behavioral envelope por agente (entidade existente `BehaviorProfile`), threat screening (`ThreatEvent`), registro de acesso por execução.

## 20. Direitos Autorais (Lei 9.610/1998)

- **Obras oficiais** (normas jurídicas, atos oficiais do governo — textos do DOU, leis, portarias) **não são protegidas** (art. 8º da Lei 9.610/1998; entendimento consolidado de que normas jurídicas não têm copyright): uso integral permitido **COM citação de fonte e data** — o que o átomo já carrega por design (`canonical_citation`, verbatim, proveniência).
- **ISO/ABNT são protegidas**: texto integral exige contrato registrado em `KnowledgeLicense`; sem contrato, só metadados de catálogo + citação breve (H7 já gating; aqui reforçado como matéria de LEI, não só de política).
- Política de citação por fonte registrada no `SourceRegistry`; front-end e OG images exibem **sempre** fonte + licença.
- **(verificar)**: direitos sobre bases/compilações (seleção/organização do agregado pode gerar direito próprio — art. 88 e súmulas correlatas), e termo de uso dos sítios (in.gov.br, MQD) quanto a scraping e redistribuição.

## 21. Roadmap e Dívidas Atualizados

**Fase 0 ganha:** serialização JCS RFC 8785 (base de TODO checksum), mapeamento OSCAL das políticas, export PROV-O das evidências, métricas ISO 8000 por campo em `field_norms.json`, gates axe/pa11y/Lighthouse no PUBLISH, capability registry + `DelegationRequest` para agents, gerador de OG images.

**Novas dívidas (universo desconhecido, v0.2):** verificação do modelo OSCAL 1.1.0, status da W3C WSG, aquisição ISO 8000 (recomendada cedo), partes exatas da série citadas em §14, termos de uso dos sítios de extração, integração Lighthouse CI.

**Decisões v0.2:** kernel = orquestrador+guardião, autoridade máxima = ato de política humano (acima: a norma em si); agentes só solicitam serviços; RFC 8785 como base canônica de todo hash; accessibility/SEO/sustentabilidade/metadata/i18n nascem no átomo e no gate, nunca depois.
