# CE — auditoria direcionada de direitos PR #78

Data de referência: 2026-11-28. Baseline main: `060b0f139c4baa7cc268ab55975bbff2993a02e2`. Origem PR #78: `4d5e22f5b144d83da455b108a0293b2c1785210e`.

## Resultado

Três blobs continuam HOLD_RAW_COPY. O registro preserva apenas caminhos, hashes, decisões e fontes, sem reproduzir os conteúdos pendentes. Não constitui parecer jurídico ou homologação clínica. Não há autorização de publicação, IA externa, processamento de corpus ou aposentadoria de refs.

## Base de decisão

Lei 9.610/1998 arts. 7 §3, 8 I e IV, 29 e 41: distinguir método/fato/ato oficial de expressão protegida, tradução e reprodução. GitHub público não concede licença geral. A árvore completa da main não contém arquivo denominado LICENSE/COPYING; isso não demonstra ausência de todos os instrumentos de titularidade ou licença. Não atribuir licença ao repositório sem titular competente.

## Itens revisados

| ID | Decisão | Fundamentação / próxima ação |
|---|---|---|
| FF-001 | HOLD_PROVENANCE | Historical claim and mortality figures need precise primary evidence and original wording. |
| FF-002 | HOLD_PROVENANCE | Historical claims and wording need exact source. |
| FF-003 | OFFICIAL_ACT_REWRITE_CANDIDATE | Law 7498 official text excluded by art. 8 IV; existing editorial wording not cleared automatically. |
| FF-004 | HOLD_PROVENANCE | Claim and wording not traced. |
| FF-005 | FACT_REWRITE_CANDIDATE | WHO May 12 corroborates date; independent wording and precise attribution needed. |
| FF-006 | HOLD_PROVENANCE | Etymology source not located precisely. |
| FF-007 | FACT_REWRITE_CANDIDATE | WHO confirms occupational-group fact; no blanket public-domain grant. |
| FF-008 | HOLD_TRANSLATION_RIGHTS | Quoted Portuguese pledge translation not identified; age of original does not clear translation. |
| FF-009 | OFFICIAL_ACT_REWRITE_CANDIDATE | COFEN 736 official text; source seed HOLD and main RELEASED mismatch; clinical review remains. |
| FF-010 | HOLD_PROVENANCE | Historical claims and wording need exact source. |
| FF-011..FF-087 | PLACEHOLDERS_NOT_EVIDENCE | 77 generated placeholders with UNKNOWN rights and no provenance; not published content. |
| braden | HOLD_PERMISSION_P0 | Copyright owner identified; seek written authorization for exact version, Portuguese adaptation and digital use. |
| morse | HOLD_PERMISSION_P0 | Fall TIPS reports permission required; Portuguese paper CC BY-NC 4.0 does not establish underlying scale rights. |
| apgar | METHOD_REIMPLEMENTATION_CANDIDATE | Independent method implementation may be possible under art. 8 I; ACOG presentation copyright; CC BY article alternative subject to third-party exclusions, clinical validation. |
| gotejamento | METHOD_REIMPLEMENTATION_CANDIDATE | Mathematical formula itself excluded by art. 8 I; code authorship and original expression still to verify; clinical validation. |
| imc | METHOD_REIMPLEMENTATION_CANDIDATE | Formula/method itself distinct from copyrighted WHO presentation; 2000 publication not retroactively relicensed under WHO post-2017 policy. Verify source and clinical applicability. |

## Achado prioritário — main

A main já contém seed editorial com dez itens RELEASED/PUBLIC_DOMAIN e catálogo ativo com Braden, Morse, Apgar, gotejamento e IMC. A rota curiosidades importa o seed completo e aplica filtro de RELEASED condicional. Isto é evidência estática, não confirmação de exposição em produção. Priorizar revisão de bloqueios de publicação, autorização do titular, proveniência por item, reimplementação independente e teste de não exposição. Não apagar versões históricas até plano de retenção. O seed candidato difere da main e contém FF-009 HOLD; o gerado candidato contém nove registros. 77 placeholders não são evidência clínica.

## Fontes consultadas

- law: https://www.planalto.gov.br/ccivil_03/leis/l9610.htm
- github: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository
- braden: https://www.bradenscale.com/
- morse: https://falltips.org/faqs/
- morsePt: https://revistas.usp.br/reeusp/pt_BR/article/view/77996
- apgar: https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2015/10/the-apgar-score
- apgarOpen: https://pmc.ncbi.nlm.nih.gov/articles/PMC11198217/
- who: https://www.who.int/about/policies/publishing/copyright
- whoLegacy: https://www.who.int/about/policies/publishing/open-access
- whoFacts: https://www.who.int/news-room/fact-sheets/detail/nursing-and-midwifery
- law7498: https://www.planalto.gov.br/ccivil_03/leis/l7498.htm
- cofen736: https://www.cofen.gov.br/resolucao-cofen-no-736-de-17-de-janeiro-de-2024/

## PR #68 e limite de escopo

149/149 blobs de quarentena conferidos após merge da PR #139. A PR #68 preserva 34 arquivos de metadados e código candidato; isso não autoriza reproduzir arquivos científicos subjacentes ou executar IA/SQL. Auditoria integral de direitos por arquivo e de histórico não realizada. Direitos de código, autorias e dependências requerem trilha específica.

Registro detalhado: `registers/governance/ce-branch-live-cohort-20261121.v1.json` (technical_retirement.rights_audit_pr78_20261128).
