# Auditoria de anexos CKO — uso de conteúdo atômico (14/11/2026)

**Decisão:** `GO_CANDIDATE_INVENTORY / HOLD_SCHEMA / HOLD_SOURCE / HOLD_CLINICAL / HOLD_RIGHTS / NO_PUBLICATION`.

**Origem:** oito pacotes ZIP submetidos pelo responsável em 14/11/2026. Este registro inclui exclusivamente **nomes, hashes e achados de verificação**; nenhum texto clínico ou código de terceiro foi importado neste PR. A análise completa (com os hashes de entrada) está disponível no documento de auditoria entregue na conversa, fora deste repositório público.

## Fatos comprovados por inspeção somente leitura

1. **12 identidades clínicas/educacionais distintas**, não 5+5+12: cinco doenças estão em múltiplas projeções (`cko-research`, `LibraryObject` e `canonical_object`), outros seis objetos clínicos ricos, e um objeto de medicamento. Não há justificativa para gerar novas identidades só porque o arquivo está noutro ZIP.
2. **Integridade do intake:** 20/20 entradas do MANIFEST conferem por SHA-256/tamanho; ZIPs passam CRC e inspeção de traversal/symlink. ZIP de intake foi também incluído *byte a byte* dentro do pacote wrapper: contar uma única vez.
3. **12/12 objetos NO_GO contra contrato do próprio repositório:** `contracts/cko-schemas/canonical_object.schema.json` exige `provenance_refs[]` como **string**, enquanto o intake usa **objeto JSON** em cada caso. O validador anexado só recursa em `spec.items.type === "object"` e ignora arrays do tipo `string`. O `schema_conformance: PASS` do relatório original é, portanto, **falso positivo** para o schema de `main`.
4. **7/12 hashes de origem verificados:** seis arquivos clínicos extensos e o arquivo de dipirona nos anexos batem com SHA-256 de origem declarado pelo intake; as cinco fontes brutas `CKO-DIS-000001..000005` não estão presentes, logo seu hash permanece `HOLD_SOURCE`.
5. **Nenhuma ligação clínica aprovada:** 12/12 projeções estão `CANDIDATE`/`PENDING`, com zero `clinical_claim_ids` e zero `field_binding_ids`. Seus 136 `relationship_ids` são 22 **rótulos genéricos de família**, não 136 relações evidenciadas entre entidades específicas.
6. **Doenças:** cinco `LibraryObject` candidatos trazem 95 `typed_attributes` (80 `declared`, 15 `verified` relativos a consulta de identidade `icd10/snomedCT/medlinePlus`), e 13 regras clínicas **não homologadas**. Um resultado de MedlinePlus Connect prova retorno da API, **não** aprovação de codificação clínica, dose ou recomendação.
7. **Autoafirmação de publicação:** seis arquivos de origem exibem `governance.status = Published`, `reviewedBy` e licença `CC-BY 4.0`. Nada nos ZIPs comprova identidade profissional, independência ou direitos por trecho: **não herdar os três campos** em ingestão.
8. **Modelagem incompleta:** 30 JSON de entidades contêm `required=[]`; o NORM-KERNEL tem 10 `NormAtom` sob dois documentos de teste, não normas reais, e seu `jcs.py` declara suporte parcial a RFC 8785. Use como desenho/fixtures e não como recibos de admissão ou assinatura.

## Intervenção nesta PR — sem nova fonte de verdade

- `scripts/cko-atomic-intake-guard.py`: auditor **somente leitura** que valida integridade do ZIP + hashes + arquivo contra **o contrato canônico presente no repositório**, usando JSON Schema Draft 2020-12 de verdade. Rejeita elementos de array do tipo errado, campos desconhecidos, IDs duplicados, estados auto-promovidos, payloads não manifestados, traversal e SHA alterado.
- `scripts/test_cko_atomic_intake_guard.py`: suítes de testes com **dados sintéticos**, incluindo caso `provenance_refs=[{...}]` que reproduz exatamente a classe de erro dos 12 objetos anexos.
- Workflow `cko-intake-strict-schema-audit.yml`: testa contra `contracts/cko-schemas/canonical_object.schema.json` da branch e não exporta nem inclui pacotes clínicos.
- O comando `--diagnostic-only` retorna 0 **apenas para conformidade estrutural**; independentemente disso, `release_gate_exit_code=2`, `clinical_approval=false` e `publication_allowed=false`. Sem essa opção, **sempre exit 2**.

## Canônico recomendado (não adicionar um DS concorrente)

`CURRICULUM/TOPIC → SOURCE → DOCUMENT_VERSION → EVIDENCE_FRAGMENT → CLAIM → KNOWLEDGE_ATOM → LIBRARY_OBJECT → CONTENT_MASTER → EDUCATIONAL_RESOURCE → PUBLICATION`

`NormAtom` deôntico é um tipo distinto de `ClinicalClaim`; ambos exigem artigo/localizador, versão, checksum, jurisdição, contexto, direitos e homologação. `LibraryObject` é uma **projeção de identidade/agrupamento**, não uma afirmação clínica indivisível. Não converter cada campo heterogêneo em um "átomo" sem separar proposições, exceções e qualificadores.

Manter `canonical_object.schema.json` v0.1.0 na condição de contrato fonte. O gerador precisa mover objetos ricos de `provenance_refs` para um **registro de proveniência tipado** e usar, naquele array, somente IDs/strings resolvíveis, com hashes do original preservados. A mudança exige schema/contrato versionado e testes cruzados, nunca relaxamento de schema para produzir PASS.

**As treze regras clínicas, dosagens e os textos de tratamento seguem `QUARANTINED_NOT_EXECUTABLE`**, sem exposição em calculadora, medicamento, SAE Copilot ou plataforma de ensino até validação de fonte e revisor habilitado. A licença `CC-BY` autoafirmada não concede autorização de redistribuição.

## Próximas WOs por prioridade

| Prioridade | Work item | Condição de conclusão |
|---|---|---|
| P0 | Corrigir adaptador `provenance_refs` e o validador falso-PASS | 12/12 passam schema real com sidecar de origem sem perda de hash e testes adversariais |
| P0 | Homologar claims e regras farmacológicas/clínicas | Revisão independente, licença, vigência, contraindicações e testes; nenhuma regra importada como executável |
| P1 | Recuperar cinco arquivos originais CKO-DIS por hash | Source SHA256 exato, versão e direitos comprovados |
| P1 | Normalizar IDs e relacionamentos entre os 12 conceitos | Um ID canônico por conceito; relacionamento sujeito–predicado–objeto com alvo real, evidência e consistência bidirecional |
| P1 | Reconciliar terminologias/CKO entities e norm-kernel | Não importar fixtures como norma; declarar tipos e invariantes obrigatórios; JCS com implementação completa/testada |
| P2 | Integrar à esteira editorial após gates | `CONTENT_MASTER` e derivados vinculados a claims aprovados e namespace canônico único |

**Limite:** o sucesso do guard e do CI atesta o comportamento do **teste técnico**, não homologa os oito ZIPs nem autoriza que o conteúdo clínico seja publicado.
