# Entrega — `normas-requisitos`

**Tarefa:** `normas-requisitos` · **Data:** 2026-10-26 (UTC) · **Árvore:** `/workspace/workspace-repo` · branch `feat/projection-unica-f0-suite-real`, `HEAD` `51dfc7b`
**Registro por chave canônica:** `deliverables/normas-requisitos/entrega.json` (29 chaves)

O mesmo registro, em prosa, está em `deliverables/normas-requisitos/deliverable.md`, com a tabela de hash dos 79 arquivos, os 11 requisitos, o resumo do plano e a lista de NOT_RUN.

---

## O que foi feito

**1. Conferência de hash — 79/79 conferidos, 0 divergência.**

Nenhum download foi repetido (o runbook proíbe repetir download de fonte já preservada com hash idêntico sem motivo documentado). Foram feitas duas conferências independentes:

- **Contra o `SNAPSHOT-MANIFEST.json`:** 50 entradas, SHA-256 **e** `sizeBytes` recalculados → **50/50 batem**, 0 divergem, 0 ausentes. Os 29 arquivos fora do manifesto (índice por artigo, readback, eMAG estendido, README e o próprio manifesto) não têm hash de referência e foram conferidos pelo segundo método.
- **Contra a linhagem de governança:** `git hash-object` de cada um dos 79 arquivos, comparado com `git ls-tree -r origin/preview/central-comando-20261026` → **79/79 blobs idênticos**, 0 divergentes, 0 órfãos em qualquer lado.

Índice por artigo: **21 fontes**, **1577 fatias**, todas com `reviewed: false`; `kernelAdmission`, `extractionReviewed` e `approvalOrRelease` são `false`.

**2. Confronto com os 11 requisitos** — `docs/normativos/requisitos.md`. Cada requisito traz o que existe (com tabela, rota ou arquivo), o que falta (tarefa nomeada `T-Rx.y`) e onde isso deveria morer no banco.

**3. Plano de captura** — `docs/normativos/plano-de-captura.md`. Robots e *content-signals* por host, três tipos de captura (T1 texto integral / T2 metadado / T3 rótulo de identificação), direito de cada fonte, limite de 1 req/s por host, ordem de execução e 9 pendências nomeadas.

**4. Fontes candidatas de enfermagem** — 3 conferidas na página oficial do COFEN em 26/10/2026 (identificador, data e ementa **literais**); as demais entram só com identificador e `[VERIFICAR: ...]`. **Nenhuma vigência, escopo ou artigo é afirmado.**

---


**4. A camada de origem do conjunto transversal — feita nesta rodada, sem download.**

O inventário medido do catálogo de 47 entradas: **25 com texto integral arquivado** (21 atos + 3 W3C + 1 eMAG) e **22 só com metadado** (18 ISO/ISO-IEC, ABNT NBR 17225:2025, OPA/Rego, ISACA COBIT 2019 e IFRS S1/S2, excluído por aplicabilidade). O texto integral das 22 **não se obtém**: direito controlado, `robots.txt` do ISO em 403, e as 18 ISO/IEC com `applicability: HOLD` / `binding: HOLD_HUMAN` / `isoClauseVerified: false`.

O que foi feito: a camada de origem foi trazida da linhagem de governança **por cópia de blob do Git** (25 registros de fonte, 25 registros de evidência, 18 fichas de metadado, 2 manifestos) e a cadeia foi conferida em **75 hashes** — `input_sha256`, `output_sha256` e `integrity.sha256`, **25/25 cada**, 0 divergência, mais 18/18 `metadataHash`. As **4 fichas de metadado que faltavam** foram preenchidas a partir do catálogo preservado (ABNT NBR 17225:2025, IFRS S1 e IFRS S2, OPA/Rego, TRV-018), e as 47 entradas viraram uma tabela só em `registry/CATALOGO-TRANSVERSAL.md`. **143 hashes conferidos no total na tarefa.**

## Registro por chave canônica

| chave_canonica | contrato_aplicado | evidencia_produzida | dependencia_a_revalidar |
|---|---|---|---|
| `fonte:transversal-public.decreto-7-962-2013.source` | runbook + `contracts/cko-schemas/source.schema.json` + `SNAPSHOT-MANIFEST.json` | `CONFERENCIA-HASH.md` — 1 arquivo conferido; SHA-256 e tamanho batem; blob idêntico; 0 divergências em 79/79 | texto preservado **não revisado** e **não admitido no Kernel**: quem vier depois tem que responder se o cotejo com a edição vigente do DOU foi feito antes de citar como norma em vigor |
| `fonte:transversal-public.decreto-8-771-2016.source` | idem | idem | idem |
| `fonte:transversal-public.emag.source` | idem | idem | idem · direitos `LICENSED` (CC BY 4.0) — o aviso de licença está ao lado do arquivo |
| `fonte:transversal-public.lei-10-098-2000.source` | idem | idem | idem |
| `fonte:transversal-public.lei-10-436-2002.source` | idem | idem | idem |
| `fonte:transversal-public.lei-12-187-2009.source` | idem | idem | idem |
| `fonte:transversal-public.lei-12-305-2010.source` | idem | idem | idem |
| `fonte:transversal-public.lei-12-965-2014.source` | idem | idem | idem |
| `fonte:transversal-public.lei-13-146-2015.source` | idem | idem | idem |
| `fonte:transversal-public.lei-13-709-2018.source` | idem | idem | idem |
| `fonte:transversal-public.lei-13-787-2018.source` | idem | idem | idem |
| `fonte:transversal-public.lei-14-874-2024.source` | idem | idem | idem |
| `fonte:transversal-public.lei-15-042-2024.source` | idem | idem | idem |
| `fonte:transversal-public.lei-15-211-2025.source` | idem | idem | idem |
| `fonte:transversal-public.lei-8-069-1990.source` | idem | idem | idem |
| `fonte:transversal-public.lei-8-078-1990.source` | idem | idem | idem |
| `fonte:transversal-public.lei-9-279-1996.source` | idem | idem | idem |
| `fonte:transversal-public.lei-9-609-1998.source` | idem | idem | idem |
| `fonte:transversal-public.lei-9-610-1998.source` | idem | idem | idem |
| `fonte:transversal-public.resolu-o-anpd-15-2024.source` | idem | idem | idem |
| `fonte:transversal-public.resolu-o-anpd-18-2024.source` | idem | idem | idem |
| `fonte:transversal-public.resolu-o-anpd-19-2024.source` | idem | idem | idem · retificação em 2025: cotejo com o DOU permanece obrigatório |
| `fonte:transversal-public.trv-010.source` | idem | idem | idem · direitos `LICENSED` (W3C) |
| `fonte:transversal-public.w3c-shacl.source` | idem | idem | idem · direitos `LICENSED` (W3C) |
| `fonte:transversal-public.wcag-2-2.source` | idem | idem | idem · direitos `LICENSED` (W3C) — é o padrão de referência da declaração de acessibilidade |
| `documento:docs/normativos/requisitos.md` | `FORMATO-DE-ENTREGA.md` + `REGISTRO-DE-ESCRITA.md` | 11 requisitos, cada um com estado medido, tarefa nomeada e destino no banco; 8 NOT_RUN | a contagem de tabelas (96 no PGlite em 2026-10-26 12:50 UTC) é do instante da medição e a árvore se moveu: rodar o portão de novo, **não copiar o número**. A divergência `kind='norma'` 24 (medido) × 4 (briefing) tem de ser reconciliada com a medição do dono |
| `documento:docs/normativos/plano-de-captura.md` | `FORMATO-DE-ENTREGA.md` + runbook (robots, taxa, não repetir download) | 3 fontes do COFEN com identificador/data/ementa literais conferidos em 2026-10-26; robots e content-signals de 12 hosts; 3 tipos de captura; 9 pendências; **0 download** | a data da Res. COFEN nº 545/2017 está em divergência (18.05.2017 na página × 09 de maio de 2017 em parecer oficial) e a extração de `/legislacao/` falhou: resolver contra o DOU antes de escrever vigência. O padrão `enfermagem.<orgao>.<slug>.source` é proposta e precisa de homologação |
| `documento:audit-evidence/transversal-acquisition/CONFERENCIA-HASH.md` | runbook + `SNAPSHOT-MANIFEST.json` | 79/79 blobs idênticos; 50/50 entradas de manifesto com SHA-256 e tamanho conferidos; 0 divergência; 1577 fatias com `reviewed:false` | a cópia é byte a byte idêntica, então a divergência entre a cópia histórica e a edição vigente do DOU continua inteira: o hash prova a cópia fiel, **não** a atualidade jurídica |
| `documento:audit-evidence/transversal-acquisition/registry/` | runbook + `contracts/cko-schemas/source.schema.json` + `audit_evidence.schema.json` | 72 arquivos: 25 registros de fonte + 25 de evidência + 22 fichas de metadado + 2 manifestos + README; cadeia conferida em 75 hashes (25/25 em cada elo) e 18/18 `metadataHash`; 0 divergência | a cópia é **evidência**, não o registro canônico de origem: o registro canônico continua em `registers/governance/transversal-source-instances/public/source/` na linhagem de governança. Nenhuma das 47 entradas tem cláusula verificada (0) nem admissão no Kernel (false) |
| `documento:audit-evidence/transversal-acquisition/registry/catalogo-transversal.json` | idem | `CATALOGO-TRANSVERSAL.md` + `catalogo-transversal.json` — as 47 entradas: 25 com texto, 22 só metadado (todas com ficha), 3 com data de verificação individual da URL, 0 com cláusula verificada, 0 no Kernel | as 19 entradas sem data de verificação individual (18 ISO/ISACA + TRV-018) mantêm a pendência nomeada no `notVerified`; as 4 fichas preenchidas nesta tarefa foram derivadas do catálogo preservado — quem quiser a versão oficial confere no `transversal-standards-candidates.v1.json` |
| `documento:deliverables/normas-requisitos/deliverable.md` | `FORMATO-DE-ENTREGA.md` | 187 linhas: tabela de hash dos 79 arquivos, 11 requisitos, resumo do plano, 13 NOT_RUN | nenhuma |

---

## Correção de duas premissas do briefing (medido, não opinado)

1. **"só 4 com `kind='norma'`"** — são **24** em `content_object`. As 4 vinham da `site_route`, tabela **retirada** em `migrations/0029_retire_duplicates.sql`.
2. **"coluna `source_quote` INEXISTENTE"** — ela **existe** em `kernel_atom`, criada por `migrations/0038_processo_source.sql` (tarefa de outra pessoa). O que não existe é `source_quote` em **nenhuma** tabela do conteúdo publicado (`content_text`, `content_object`, `fundamento`, `specimen`).
3. **"1.767 rotas"** — o número confere, mas é `content_text` com `status='publicado' AND review_state='revisado'`, não uma tabela de rotas. `site_route` não existe mais.
4. **Número de tabelas** — **96** no PGlite local (13:01 UTC: 96 no banco, 96 no dicionário, 0 fora). Às 12:50 UTC eram 96/94 com 2 fora (`kernel_approval`, `source_publication`, de `0038`) — o índice foi atualizado pela outra tarefa no intervalo. O dono reportou 98 no banco vivo; não reproduzido aqui. **O portão conta o schema — não há número fixo em texto.**
