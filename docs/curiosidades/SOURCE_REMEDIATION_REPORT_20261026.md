# FIND — Curiosidades MEM: auditoria de fontes e propostas de remediação (26/10/2026)

## Decisão de governança

**Status: HOLD_HUMAN, propostas não homologadas.** Não houve qualquer INSERT/UPDATE no Supabase, não alteramos `content_json` nem snapshots `pages/*.json`, e não foi autorizada a publicação dos 87 artigos. Fonte de verdade: banco Supabase `Calculadoras-Smart`, schema `ce_curiosidades_v1`.

## Achados e entregas

- 19 **IDs distintos** não encontrados em `ce_curiosidades_v1.sources`. Dois deles são IDs coringa reusedos incorretamente por artigos distintos: `SRC-ABEN-FAB` (11 ocorrências) e `SRC-AMA-STAFF` (9).
- 46 ocorrências diretamente declaradas nos arrays `content.references[]`, em 43 páginas.
- Mais duas ocorrências presentes somente em `sections[].sources[]`, não declaradas na bibliografia: `SRC-IWM-CAVELL` na seção s2 do artigo sobre enfermeiras de guerra; `SRC-WIKT-TRIAGE` na seção s1 sobre o funeral de Florence Nightingale (mismatch semântico).
- **48 ocorrências** em **44 páginas**: **46 referências alternativas localizadas** (candidatas a revisão), duas ainda sem correspondência defensável.
- Todas as candidatas permanecem `claimLevel=NOT_VALIDATED` e `rights=NOT_ASSESSED`. Página de origem encontrada ≠ verificação de cada afirmação. Link encontrado ≠ licença para reprodução.
- Uma página continua sem `source_sha256`: `17-de-setembro-dia-mundial-da-seguranca-do-paciente`. A OMS oferece referência bibliográfica, mas **não repõe um hash faltante**.
- A auditoria estrutural detectou resposta de FAQ legada como `string`, e não `string[]`. A projeção MEM faz normalização **sem regravar a fonte**, mantendo FIND por item.

## Fontes verificadas e alternativas exemplares

| Uso original incorreto | Referência alternativa | Evidência documental | Destino |
|---|---|---|---|
| `SRC-ABEN-FAB` usado para uniformes rosa (1965) e cinza (1968) | Artigo de revista científica | https://www.scielo.br/j/reben/a/XMNdmZm45xKGqDc8Tr6DCqf/?lang=pt | CANDIDATE |
| `SRC-AMA-STAFF` usado para CAM-ICU | Estudo original de Ely et al. (2001), `SRC-PUBMED-CAMICU-2001` | https://pubmed.ncbi.nlm.nih.gov/11445689/ | CANDIDATE |
| `SRC-AMA-STAFF` usado para RASS | Estudo original de Sessler et al. (2002), `SRC-PUBMED-RASS-2002` | https://pubmed.ncbi.nlm.nih.gov/12421743/ | CANDIDATE |
| `SRC-LOC-CLARABARTON` usado em Clara Barton | `SRC-LOC-BARTON` | https://www.loc.gov/collections/clara-barton-papers/about-this-collection/ | CANDIDATE |
| Mesmo ID de Clara Barton usado no texto atribuído a Santo Agostinho | Estudo sobre Henry Scott Holland e sermão de 1910 | https://www.tandfonline.com/doi/abs/10.1080/1474225X.2015.1006494 | CANDIDATE / verificar contexto integral |
| `SRC-NYPL-WALD` usado para Linda Richards | Diploma original da enfermeira, Smithsonian | https://americanhistory.si.edu/collections/object/nmah_728044 | CANDIDATE |
| `SRC-OMS-PATIENT-SAFETY` | `SRC-WHO-WPSD`, campanha da OMS | https://www.who.int/campaigns/world-patient-safety-day | CANDIDATE |
| `SRC-STCHRIS-SAUNDERS` | História/biografia oficial do St Christopher's Hospice | https://www.stchristophers.org.uk/about/damecicelysaunders/ | CANDIDATE |
| `SRC-SCIENCEMUSEUM-SYRINGE` usado no artigo do estetoscópio | Acervo específico Cammann, Science Museum | https://collection.sciencemuseumgroup.org.uk/objects/co90885/cammann-type-binaural-stethoscope | CANDIDATE |

## Sem correspondência suficiente

1. `relogio-com-ponteiros-de-minutos-e-segundos-um-requisito-documentado-em-uma-escola-de-enfermagem-brasileira`: exigir a norma/catálogo/documento original da escola, com edição e página verificáveis.
2. `nursing-in-america-a-history-of-social-reform-1990-documentario-historico`: exigir cadastro audiovisual com direção, produção, data, distribuidora e créditos. Não atribuir à NCSBN ou a Peplau por semelhança do tema.

## Alterações de implementação já realizadas

- `registers/curiosidades/mem-source-alternatives.v1.json`: matriz determinística *slug × ID legado × referência alternativa*, incluindo seção de origem, URL, tipo de verificação e motivo.
- `scripts/test-curiosidades-source-alternatives.mjs`: CI reconcilia todas as 48 ocorrências aos respectivos snapshots (sem remap implícito) e exige dois HOLDs documentados.
- `src/components/templates/curiosity-view.tsx` e `src/components/article/curiosity-page.tsx`: exibem, **somente na prévia isolada**, uma lista expansível de alternativas bibliográficas, com declaração de `NOT_VALIDATED`. O texto e a bibliografia original são preservados.
- `scripts/curiosidades-audit-finds.mjs`: agrega candidatas ao FIND por página para revisão de equipe e governança.
- `.github/workflows/curiosidades-mem.yml`: exige cobertura mecânica das alternativas antes do typecheck.

## Plano de homologação

Para cada uma das 48 ocorrências, um especialista deve conferir: `evidence->claim` (documento, versão, página ou identificador), pertinência da fonte, ato jurídico/data se aplicável, licença, atribuição, integridade/hash, status editorial e aprovação humana. Só após isso é admissível gerar patch de conteúdo e/ou inserir registro definitivo na autoridade canônica Supabase através de WO/Kernel, com revalidação independente.

**Importante:** esta entrega **não** equivale a 46 citações corrigidas no banco: são 46 alternativas vinculadas à prévia editorial e 2 HOLD explícitos.
