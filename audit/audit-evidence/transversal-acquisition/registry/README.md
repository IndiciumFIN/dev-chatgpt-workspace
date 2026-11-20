# Camada de origem — cópia preservada da linhagem de governança

**O que é esta pasta.** A evidência bruta da aquisição transversal (`snapshots/`, `article-index/`, `runs/`) já estava nesta árvore e tem hash conferido. Faltava a camada que diz **de onde** veio cada arquivo: o registro canônico de fonte (autoridade, direitos, locator, proveniência) e o registro de evidência que liga o arquivo arquivado ao registro.

**Esta pasta é essa camada**, trazida da linhagem de governança (`origin/preview/central-comando-20261026`) **por cópia de blob do Git — sem download**. Ela é **evidência**, não registro canônico: o registro canônico de verdade continua em `registers/governance/transversal-source-instances/public/source/` na linhagem de governança. Ninguém aqui deve editar estes arquivos como se fossem o registro de origem; a cópia existe para que a evidência desta árvore seja autodescritiva e verificável sem trocar de árvore.

## O que tem dentro

| Subpasta | Arquivos | Origem | O que é |
|---|---:|---|---|
| `source/` | 25 | `registers/governance/transversal-source-instances/public/source/` | Registro canônico de fonte: `canonical_id`, autoridade, direitos, `locator`, `integrity.sha256`, `provenance_refs`, `retrieved_at`, `status` |
| `audit-evidence/` | 25 | `registers/governance/transversal-source-instances/public/audit-evidence/` | Registro de evidência: `input_sha256` (hash do documento arquivado), `output_sha256` (hash do registro de fonte), `result`, `limit_statement` |
| `metadata/` | 22 | 18 copiados da linhagem + **4 preenchidos nesta tarefa** | Ficha de metadado do catálogo: identificador, autoridade, edição, URL oficial, data, e a lista do que **não** foi verificado |
| `public-materialization-manifest.json` | 1 | linhagem de governança | Os 25 com `originalPath`, `originalSha256`, `sourceJsonSha256`, `normativeClausesVerified` |
| `materialization-manifest.json` | 1 | linhagem de governança | Os 18 candidatos ISO/IEC com `applicability: HOLD`, `binding: HOLD_HUMAN`, `isoClauseVerified: false` |
| `catalogo-transversal.json` | 1 | **gerado nesta tarefa** | As 47 entradas do catálogo em uma tabela só, com a decisão de aquisição e a pendência de cada uma |
| `CATALOGO-TRANSVERSAL.md` | 1 | **gerado nesta tarefa** | A mesma tabela em Markdown |

## As 4 fichas de metadado preenchidas nesta tarefa

O catálogo de origem declarava `metadataVerified: 18` e `remainingMetadataOnly: 22`. Quatro entradas do catálogo estavam **sem ficha de metadado** — e uma delas (TRV-018, ISACA COBIT 2019) **sem data de verificação individual da URL**:

| Ficha | Decisão | Data da verificação individual da URL |
|---|---|---|
| `ABNT NBR 17225:2025.json` | `METADATA_ONLY` | 2026-10-24T05:08:11Z |
| `IFRS S1 e IFRS S2.json` | `NOT_APPLICABLE_JUSTIFIED` | 2026-10-24T05:08:12Z |
| `OPA-Rego.json` | `METADATA_ONLY` | 2026-10-24T05:08:12Z |
| `TRV-018.json` | `METADATA_ONLY` | **nenhuma** — `verificationStatus: PENDENTE_VERIFICACAO_INDIVIDUAL_DA_URL` |

Elas foram derivadas **somente** do catálogo já preservado (`snapshots/20261024/manifest.json` e o `transversal-standards-candidates.v1.json` da linhagem de governança). Cada ficha carrega `addedBy: "normas-requisitos 2026-10-26"` e `derivedFrom` com os dois caminhos de onde saiu. **Nenhuma informação nova foi inventada e nenhum download foi feito.** A ficha do TRV-018 declara explicitamente o que falta.

## O que esta pasta **não** é

- **Não é admissão no Kernel.** `kernelAdmission` é `false` em todas as 47 entradas e `normativeClausesVerified` é **0** em todas.
- **Não é vigência.** Nenhuma entrada declara vigência, revogação ou escopo de aplicação.
- **Não é texto integral dos 22 só-metadado.** O runbook (`docs/governance/TRANSVERSAL-ACQUISITION-RUNBOOK.md`) manda: *"Para ISO/ABNT/ISACA/IFRS: não copiar texto integral, guardar somente metadados e o motivo de retenção."* O `robots.txt` do ISO respondeu 403 na rodada de 26/10, e o do ISACA não chegou a ser lido.
- **Não substitui o registro canônico.** A cópia é evidência; o registro de origem está na linhagem de governança.
