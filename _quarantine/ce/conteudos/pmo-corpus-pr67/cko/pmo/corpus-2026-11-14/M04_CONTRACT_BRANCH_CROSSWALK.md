# Reconciliação de contratos e branches — corte 14/11/2026

## SHA iguais (comparados por leitura de arquivo nas duas refs)
| Arquivo | main | PR #36 `canonical/foundation-20261101` | Ação |
|---|---|---|---|
| `contracts/cko-editorial/README.md` | `75d6c976358fe7092b587dcce5dd42cbf14bd029` | mesmo SHA | REUSE |
| `contracts/cko-schemas/learning_resource.schema.json` | `25264ac6fabe8b8eab957fb816d8af9e3bca62db` | mesmo SHA | REUSE |
| `contracts/cko-schemas/claim.schema.json` | `ccbb2fa40953557b796205f880370dcffe638e71` | mesmo SHA | REUSE |
| `contracts/cko-editorial/policy/editorial_projection.rego` | `38b84b8181551cbbbf91a99dea17110b86eb9add` | mesmo SHA | REUSE |
| `registers/pmo/queue.v1.json` | `c713557a808857eab9952e511d1f2a10bfa6f828` | mesmo SHA | REUSE — NÃO sobrescrever |

Oito perfis já existem em `contracts/cko-editorial/profiles`: article, case, flashcard, quiz, infographic, pocket_guide, pdf, slides. `TPL-ARTICLE-001` v0.2.0 (SHA `302d6da176a50372b1efb5e4f87841f6981b4682`) é o template utilizado pelos três recursos candidatos M04.

## Branches históricas e critérios de incorporação
| Branch | Encontrado na fonte real | Destino controlado |
|---|---|---|
| `import/drive-cko-nurseos-20261026` | `CKO-Object-Registry.json` (SHA `4186f19db386443e8b3e8ee39da7daea581f3f8a`), objetos Disease, Medication etc. | CROSSWALK DE OBJECT IDS; **não** converter automaticamente para Topic IDs |
| `import/drive-cko-nurseos-20261026` | `_BASE_TEMPLATE_SPEC.md` (SHA `1ed20984845e136b2b08f73ddee09f750e7dbeb5`), modelo antigo tipado por recurso | RASTREAR VERSÃO; não substituir cko-editorial v0.2.0 nem presumir licença/autoria |
| `staging/bibliotecas-corpus-20261026` | README BIB-01 (SHA `ebcb8f5398f1c8da3b044424c9512f3cd9a99bf9`): 94 páginas HTML de revisão, 9 sem título | LIBRARY ENTITY; assets/rights e conteúdo por objeto ainda HOLD |
| `work/editorial-canonical-learning-20261026` | `CKO_DB_FIRST_FULL_TOOL_CONTENT_20261026.md` (SHA `9a657b0c1c588e5cdfa4c8c30681296284453c36`) | DESIGN DB-FIRST: fatos e claims por IDs; projeções sem duplicação |
| `canonical/foundation-20261101` | PR #36 DRAFT; diff de 13.550 arquivos | PRESERVAR; seleção de contratos, nenhum merge massivo |

## Reconciliação documental M04 na PR #66
- **Fonte real:** `canonical_corpus.sqlite` (recuperado e íntegro na M03), não claim derivada de ementa.
- **IDs:** 17 relações `RELATED_TO` com `semantic_mapping=related`, 12 temas canônicos existentes selecionados para prévia, 3 `learning_resource` com `HOLD_HUMAN`.
- **Aferição:** 13/13 verificações estruturais *por leitura de retorno GitHub*, não equivale à execução do script Node/CI.
- **Versão corrigida:** 10 UCs/300h, 51 módulos/295 tópicos detalhados e oito eixos UC08 ainda sem módulos. Anteriormente citados 58 módulos/326 tópicos são a versão não retificada.
- **OH:** nenhuma correspondência de evidence atoms na tabela `evidence_topic_candidates` para os dois temas ocupacionais selecionados. Isso não equivale à inexistência de fontes.
- **Direitos:** as etiquetas `DEFAULT_ACTIVE`, `LICENSE_QUARANTINED` e `HUMAN_REFERENCE_ONLY` pertencem à fila de candidatos; não autorizam publicação nem recombinação do texto.
- **UC08:** 8 eixos idênticos à UC07, título coincide com UC09. Pendência institucional preservada.

## Próximo gate para promoção
É necessário validar documentos originais, direitos por operação, snapshot/vigência de fonte, span de evidência, claims, revisão clínica, além de reexecutar script de testes no CI. Não criar informação clínica apenas pela associação lexical. PMO Mestre Drive continua sem alteração.
