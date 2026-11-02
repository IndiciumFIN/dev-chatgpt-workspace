# NORM-KERNEL — Source Playbook (como o agente usa cada fonte) v1.0.0

**Norma:** POL-NK-001 (P7: sem licença, sem extração) + POL-NK-006 (C6: jobs são
OS) + POL-NK-002 (comunicação via kernel) · **Registro:** SourceRegistry (banco,
10 fontes) + backlog.json + extraction_jobs.json

## 1. Regras de ouro (o agente SÓ opera dentro disto)

1. **Só fontes registradas** no SourceRegistry com `license_ref` válido (P7).
   Fonte nova = OS de criação de `NormSource` ANTES de qualquer download.
2. **Fonte `pending_license` está BLOQUEADA** para texto integral (ex.:
   SRC-ISO): só metadados de citação. Extrair sem licença = violação P7.
3. **Todo job é OS**: job nasce de um item de backlog (`NK-BL-NNNN`), ganha OS
   própria, registra CADA tentativa (extraction_jobs.json) e termina em
   run + documento + evidência — tudo rastreável.
4. **Hash imediato**: o binário baixado recebe checksum sha256 NO MOMENTO do
   download, antes de qualquer parse (P4 — proveniência).
5. **Citação obrigatória** em todo documento e átomo (Lei 9.610 art. 8º).
6. **Falha é evidência**: tentativa que falha fica registrada com erro e
   outcome; NÃO se repete às cegas — cada retry é uma nova tentativa
   registrada com justificativa.
7. **Nada além do que a OS cobre** (POL-NK-006 C2): diff fora do escopo da
   OS = bloqueio + finding.

## 2. Protocolo de job (end-to-end tracking)

```
NK-BL-NNNN (backlog) → NK-JOB-NNNN (job) → NK-OS-NNNN (ordem do kernel)
  → tentativas (attempts[]) → download + hash → parse (structure_tree)
  → atomização (NK-ATOM-*) → gates G1..G11 → evidência (EV-NK-NNNN)
  → run via OS (NK-RUN-NNNN) → documento (NK-DOC-NNNNN) → front-end gerado
```

Cada elo referencia o anterior: backlog_ref ↔ job_id ↔ os_ref ↔ run_id ↔
doc_id ↔ atom_ids ↔ evidence_id. Qualquer elo quebrado = registro órfão =
bloqueio (P2, nada órfão).

## 3. Fichas por fonte (como usar)

### SRC-DOU — Diário Oficial da União (KL-0001, ativa)
- **Quando usar:** normas federais (portarias, decretos, leis publicadas).
- **API:** leitura do jornal por data/seção em in.gov.br (JSON + PDF)
  **(verificar endpoint oficial do IN; há serviço web)**.
- **Método:** api-json-pdf; fallback PDF + parse/OCR (declarar tentativa).
- **Cuidados:** PDFs escaneados (OCR é débita declarada); dados pessoais em
  publicações (LGPD H11 — propósito e retenção).

### SRC-PLANALTO — Legislação federal consolidada (KL-0001, ativa)
- **Quando usar:** texto consolidado de leis/decretos (LGPD, 9.610 etc.).
- **Método:** scraping HTML **(sem API oficial — verificar; cadência baixa)**.
- **Cuidados:** estrutura HTML muda; registrar tentativa por alteração de
  layout; citação canônica obrigatória.

### SRC-CAMARA / SRC-SENADO — Dados Abertos (KL-0001, ativas)
- **Quando usar:** tramitação e metadados legislativos, normas em pipeline.
- **API:** dadosabertos.camara.leg.br, dadosabertos.senado.leg.br (REST JSON).
- **Método:** api-json. Limites de rate: respeitar e registrar.

### SRC-MQD — Meu Querido Diário (KL-0002, ativa)
- **Quando usar:** diários municipais (V2).
- **API:** queridodiario.ok.org.br/api **(verificar versão/limites)**.
- **Método:** api-json, downloads em texto.
- **Cuidados:** qualidade varia por município; R4 (reconstrução) detecta
  perdas; LGPD para dados pessoais.

### SRC-RFC — RFC Editor / IETF (KL-0003, ativa)
- **Quando usar:** calibração deôntica (RFC 2119) e normas técnicas (8785).
- **Método:** api-txt (rfc-editor.org/rfc/rfcNNNN.txt) + metadados datatracker
  **(verificar formato exato)**.
- **Vantagem:** deôntica EXPLÍCITA (MUST/SHOULD/MAY) — melhor primeiro caso.

### SRC-W3C — Technical Reports (KL-0006, ativa)
- **Quando usar:** WCAG 2.2 (H8), specs web.
- **Método:** scraping-html de w3.org/TR/*.

### SRC-NIST — Publicações (KL-0007, ativa)
- **Quando usar:** SP 800-53 (GRC/OSCAL), FIPS.
- **Método:** api-pdf em nvlpubs.nist.gov (domínio público).

### SRC-ISO — Organização Internacional de Normalização (KL-0004, PENDING_LICENSE)
- **BLOQUEADA para texto integral.** Só metadados de catálogo/citação até
  contrato registrado em KnowledgeLicense (P7). Job NK-BL-0014 bloqueado.

### SRC-CAL-FIXTURE — Fixtures de calibração (KL-0005, ativa)
- **Quando usar:** calibração de gates e drills (nunca produção).

## 4. Validação (o que fecha um job)

G1 reconstrução (R4) · G2 cobertura 100% declarada · G3 links · G4 anexo+pin
· G5 ISO 8000 · G6 conformidade de valor · G7 camadas normativas · G8
materialização · G9 registro universal · G10 findings · G11 backlog. Evidência
assinada (JCS/RFC 8785) + run via OS. Sem PASS, não publica.

## 5. Débitas declaradas (verificar antes do primeiro job real)

DOU endpoint oficial; Planalto sem API (cadência); MQD versão de API;
datatracker formato; fonte HL7 FHIR própria (NK-BL-0015); OCR escaneado;
validação léxica de strings do kernel (NK-FIND-0004).
