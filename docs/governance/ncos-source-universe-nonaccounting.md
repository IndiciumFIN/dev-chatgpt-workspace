# NCOS — universo normativo/editorial multiorigem, excluindo contabilidade

Escopo autorizado: Calculadoras de Enfermagem/NCOS, incluindo normativos clínicos, legais, acessibilidade, educação, software, segurança, terminologias e material editorial com direitos demonstrados. Os materiais de contabilidade, Conselho Federal de Contabilidade (CFC), NBC, IFRS/CPC e Escrituração Contábil Digital não integram o objeto NCOS. O repositório de origem permanece intacto: exclusão é por escopo, nunca DELETE.

## Fontes existentes a reconciliar, não duplicar

- Supabase **Calculadoras-Smart**: \`cko_evidence\` (sources/snapshots/fragments/assertions/claims), \`cko_regulatory\`, \`cko_governance.normative_reference_catalog\`, \`field_normative_bindings\`, \`cko_master\` (entities/relationships), \`calculadoras_de_enfermagem.document_atomization/source_lineage\`, e outros módulos conforme verificação de domínio.
- GitHub: contratos CKO vendorizados, seis fontes clínicas vinculadas ao runtime, biblioteca editorial e manifestos de proveniência, 21 atos públicos com índice de 1.577 ocorrências de artigos, arquivos originais e extraídos versionados.
- Sandbox/Library: \`CKO_Health_Source_Registry_Standard_v0.2.0.docx\` e \`inventario_analitico_normativos_preliminar.csv\` localizados como insumos de governança; este CSV é histórico e não substitui readback atual. Binários externos e licença só podem ser tratados em execução autorizada.

## Resultado read-only (UTC 2026-11-14)

- Catálogo normativo: 362, dos quais **255 CFC/contabilidade excluídos** e **107 não contábeis candidatos**. 44 refs distintas concentram 10.925 vínculos por campo, sem referência CFC detectada.
- CKO evidence: 157 fontes, 84 snapshots (72 fontes com snapshot), 103 fragmentos, 46 assertions e 41 claims. Há 24 correspondências por URL normalizada em 21 referências; nenhuma é identidade canônica homologada.
- Atomização: 17 documentos e 25.508 átomos textuais registrados, 887 referências visuais, 17 casos sem publicação aprovada, 61 correspondências de fonte não verificadas. O texto integral dos átomos não foi reconstruído nem admitido por esta auditoria.
- Grafo físico do repositório mestre: 1.164 entidades e 7.558 relações, mas 6.916 relações envolvem entidades CFC; apenas 642 não têm esse vínculo direto (ainda exigem classificação por domínio). 256 de 276 entidades regulatórias têm padrão CFC.
- Registro \`public.regulatory_instruments\`: 253 instrumentos, 249 do CFC e 2 atos fiscais de ECD. Apenas os outros 2 são o Decreto 94.406/1987 e a Lei 7.498/1986; não importar em duplicidade nem reproduzir dados contábeis.

## Cadeia canônica

Fonte (emissor, edição, jurisdição, direitos, URI e hash) -> snapshot -> fragmento/átomo contextualizado (pinpoint, hash, limites de uso) -> assertion/claim com relação a requisito e vigência -> \`cko_master\` e contratos CKO existentes -> \`authority_binding\`/metamodelo/dicionário -> projeções SQL e editoriais.

O editorial é uma projeção e fonte adicional de interpretação autoral, **não autoridade regulatória substitutiva**. Conteúdos clínicos publicados precisam de claims/átomos vinculados, sem inferir a interpretação de metadados, nomes de arquivos ou FKs.

## Automação entregue

\`registers/governance/ncos-source-universe-supabase-snapshot-20261114.v1.json\` é um espelho **somente metadados**, criado por consultas SQL somente leitura, sem replicar trechos integrais, direitos protegidos ou dados pessoais. Não atualiza sozinho em CI: requer nova captura autorizada no Supabase; o CI sempre trabalha sobre o snapshot versionado e sobre arquivos GitHub verificáveis.

\`node scripts/ncos-multisource-audit.mjs --inventory\` valida integridade de referências e emite \`audit-evidence/ncos-multisource-universe/universe-report.v1.json\`.
\`node scripts/ncos-multisource-audit.mjs --enforce-release\` bloqueia admissão/liberação enquanto fontes/átomos/rights não comprovados persistirem. Testes \`node --test scripts/ncos-multisource-audit.test.mjs\`. Nenhum script conecta em Supabase/Neon, altera tabelas, traduz normas licenciadas ou aprova publicação.

## Bloqueios

Identidades entre 24 candidatos URL precisam de conferência de emissor, edição, escopo e vigência; vários URLs podem apontar para landing pages e não identificar univocamente normas. Os 17 pacotes de atomização exigem bytes verificáveis (hash e armazenamento), sign-off clínico e licença. Linhagens de fonte não verificadas não são canonizadas. Promoção segue FIND → política → validador → tarefa → WO → Kernel → testes/auditoria → aprovação por papéis independentes.

Não usar \`main\` ou deploy enquanto PR #52 mantiver gates históricos e os novos gates em HOLD.


## Existing master normative handoff (historical, not an admitted policy)

The user-owned Library file \`CKO_NORMATIVE_MASTER_INSTRUCTION_v1.0.0.md\` (2026-09-09, handoff only) documents an already developed chain: Authority → Mandate → Standards Registry → Source → Version → Snapshot → Structure → Fragment → Atom → Requirement → Applicability → Conflict/Crosswalk → Risk/Control → PolicyBasis → Policy/Rule → Validator/CI/Runtime → Assurance → Projection. This is **not** permission to create a new source of truth or to promote a handoff draft. The current versioned contracts and Kernel admission remain authoritative.

The CI now creates \`schema-drift-delta.v1.json\`, grouping runtime source/binding/field enum divergences from the existing CKO JSON Schemas. All values remain pending checker disposition; no automatic mapping to another enum, source license, atom, or clinical claim.


## Original PDF byte recovery / checksum attestation (2026-11-14)

All 17 original PDFs were fetched from the authenticated Primary Drive account using each recorded Drive file ID. Independent byte hashes were calculated with \`hashlib.sha256\` and checked against the immutable \`calculadoras_de_enfermagem.document_atomization.source_pdf_sha256\` fields: **17 matched, 0 mismatched**. The local metadata-only attestation is \`validacao_sha256_17_pdfs_ncos.json\` (SHA256 \`4da04445000831317ae36ae1cca7ef1fe284d51ffc66714c0aeaec88eb0cb446\`), not the protected PDF content.

The source manifest \`registers/governance/ncos-drive-atomization-recovery-20261114.v1.json\` now carries independently observed SHA256 values with verification method and date. No PDF bytes are committed.

To independently re-run the comparison after legitimately acquiring the same PDFs:
\`node scripts/ncos-recheck-original-pdf-bytes.mjs /path/to/authorized/drive/pdfs\`
This generates \`audit-evidence/ncos-multisource-universe/pdf-independent-byte-check.v1.json\` and exits nonzero on any missing or mismatched file. Synthetic negative cases run automatically in CI.

**Still unresolved:** 17 JSONL artifacts are not independently located or byte-hash-verified. Even a fully matching source PDF does not prove exact atom segmentation or semantic correctness; all 17 clinical sign-offs and publication decisions remain HOLD. Respect source rights, including academic literature and licensed standards.


## Controlled regulatory provisions — source-first graph

A read-only inspection of \`cko_regulatory.instruments/provisions\`, \`cko_evidence\`, and \`cko_master.entities/relationships\` verified 10 non-accounting nursing/legal instruments, 65 provisions with source fragments, and 18 amendment relations. A 1:1 join through the existing \`REGULATORY_PROVISION\` node's \`attributes.provision_id\` found **49** already materialized nodes, **16** missing for Lei 2.604/1955; 7 of the 10 instruments have no itemized provisions yet.

The one cross-source provision, Lei 7.498/1986 art. 15-E, points to an official fragment from Lei 14.602/2023 and is supported by an explicit \`AMENDS_PROVISION\` edge whose provenance is that amendment source. It is **not** an orphan.

The current consolidated snapshot for Lei 7.498/1986 is **derived** (\`SRC-DERIVED-LEI7498-CURRENT-V0266\`), with source version 0.26.6, base+amendment snapshots and the semantic invariant \`PROJETO_DE_LEI_NAO_E_LEI\`. Its own metadata says \`not_an_official_publication=true\` and \`legal_status_inference=false\`: preserve those restrictions; never call it an official text or assert legal validity based on the composition.

The versioned scope manifest is \`registers/governance/ncos-regulatory-provision-lineage-20261114.v1.json\`; \`node scripts/ncos-provision-lineage.mjs --inventory\` checks source/fragment/master IDs and explicit amendments, generating \`regulatory-atom-source-chain.v1.json\` in CI. \`--enforce-release\` is always HOLD pending legal/clinical approval, rights, and the missing 16+7 projection gaps. No normative full text is committed in this manifest and no Supabase writes occur.


## Rights and non-admitted master projections — 14/11/2026

Two metadata-only delta manifests were derived without content or SQL writes:

- \`registers/governance/ncos-rights-triage-20261114.v1.json\`: 17 original PDF SHA256 identities; **six** have specific publisher/license terms located in their front matter and **11** remain unreviewed/unknown. Examples: RCP NEWS2 requires attribution and unmodified colour charts; Amsterdam UMC/JAMA Sepsis-3 contains restrictive redistribution text; two Ministry of Health editions state CC BY-NC-SA 4.0. Neither attribution nor Creative Commons metadata alone grants clinical or product publication approval. PDF content was not copied into the repo.
- \`registers/governance/ncos-master-provision-delta-20261114.v1.json\`: 16 existing provision IDs of Lei 2.604/1955 have complete registered fragment/source hash references but **no cko_master provision projection**. All 16 have \`RECOVERED_TEXT_PENDING_PROVISION_LEVEL_REVALIDATION\`. Candidate canonical IDs are \`null\`; there is no invented legal text, status inference or SQL upsert.

Run \`node scripts/ncos-rights-master-gate.mjs --inventory\` after \`node --test scripts/ncos-rights-master-gate.test.mjs\` to create \`audit-evidence/ncos-multisource-universe/rights-master-projection-gate.v1.json\`. Structural validity only; release always needs independent review. The rights manifest is an **assessment overlay**, not a second canonical license registry.

A historic ZIP scan found \`CORPUS_MANIFESTOS_SHA256_v0_3.zip\`, \`NORMATIVE_DOCUMENT_RECONCILIATION_v0_3.zip\` and \`CANONICAL_RECONCILIATION_v0_2.zip\` in the user's Drive; none of these three archives contained the 17 named original atomized JSONLs or their stored hash references. This is not a claim that no other backup exists. Work order #59 remains HOLD_SOURCE_MISSING; work order #60 remains HOLD_PROVISION_REVALIDATION.


## Historical separate atomized DATA corpus (Drive README v1.1.0)

The connected Drive document \`README_ATOMIZADO_v1.1.0.md\` (id \`14Ic3GbF5Ecy0MYZoGddf8ClntH8seK3F\`) **reports** 547,908 atoms in 15 themes: phase 1 eight themes / 498,178 records and phase 2 seven themes / 49,730 records. It describes generator atomizar.py v1.1.0 and validator verificar.py v1.1.0. The actual source JSONL and per-theme MANIFESTO.json files were not verified in this audit. The exact per-theme documentary counts are in \`registers/governance/ncos-atomized-data-library-v1_1_0-candidate.json\`.

This is NOT the 17 original PDF text extraction corpus (25,508 reported text atoms). Protocol PDF records in this historical DATA corpus are only **index records** with no full PDF text extraction, and Sepsis-3/NEWS2/BP classification fields include explicitly marked manual transcriptions. The README documents one exact item-level crosswalk candidate, COFEN 736/2024, with an original PDF SHA256 prefix. The PDF hash was independently verified; the individual atom record was not. No atom or identifier has been merged.

\`node scripts/ncos-dual-corpus.mjs --inventory\` generates a separate read-only gate report; \`node --test scripts/ncos-dual-corpus.test.mjs\` tests deliberate corpus-count mixing, unverified atom ID admission and mislabeled manual transcription. Copyright/clinical/rights obligations remain independent.


## RECOVERED: original 17 atomized JSONL byte-identical to database (2026-11-14)

The archive \`GROK_FONTES_NORMALIZADAS_ATOMIZADAS_v1.0.0.zip\` was recovered **from the user's ChatGPT Library**, original file id \`file_000000004cc8820eacc1773e98e88238\`, byte length **3,575,511**, SHA256 **86f269d099d94bb36ef00826dd19b45a0d3f1ed1cb4c756e5508ccf26379561f**. It contains 17 original JSONL under \`atomic_docs/\`.

Each file was opened independently as original ZIP bytes, hashed with SHA256 and compared with the existing exact \`calculadoras_de_enfermagem.document_atomization.atomized_jsonl_sha256\` entry: **17/17 exact matches**, without rewriting JSON. Each JSONL line was parsed; **26,395/26,395** valid JSON records, representing **25,508 literal-text atoms and 887 visual-asset references**. Independent per-atom SHA256 checks, PDF source SHA checks, original PyMuPDF \`page.get_text(text,sort=False)\` reconstruction across **1,192 pages** and embedded-image SHA comparisons for **887 references** found **zero mismatches**. The private full verification report was generated locally with SHA256 \`2b6e201129fce7a63f8f62e120ee34048dcfaa021f8d1776732ed0c6659aaf80\`.

**Corrections to previous HOLD:** the original JSONLs have now been located and verified. The repository's original database as-of snapshot retains \`LOCAL_ARTIFACT_NOT_DURABLE\` as a historical value, while the *new* versioned manifest \`registers/governance/ncos-drive-atomization-recovery-20261114.v1.json\` carries the exact archive member, independent hash and recovered location. All original source bytes remain in the private Library, **not in the Git repository or CI**. The metadata-only attestation \`registers/governance/ncos-17-original-jsonl-restoration-attestation.v1.json\` is checked by \`node scripts/ncos-original-archive-attestation.mjs\`; this CI step validates a pinned audit record, **not** the confidential raw ZIP itself.

These verifications authorize *only historical literal-extraction integrity*: NOT semantic clinical qualification, image interpretation, copyright re-use, regulatory legal status, CKO claim promotion, Supabase publication or \`main\` merge. Clinical sign-off is PENDING, visual review HOLD and publication BLOCKED throughout.


## Gap after original ZIP recovery: no exact PDF SHA256 in cko_evidence.snapshots

A read-only equality join on \`cko_evidence.snapshots.content_sha256 = calculadoras_de_enfermagem.document_atomization.source_pdf_sha256\` returned **0/17**, even though original PDF and JSONL source bytes have been verified independently. This is an *exact snapshot byte match* check, **not** proof that the same regulatory instrument/edition is missing from the CKO source registry.

A separate historical \`canonical_corpus.sqlite\` file (Drive id \`1d3GKhN9HQZTOM-Xvb5-u38gpX1-SUP0p\`, sha256 \`cad94fa782918fb3ef9f77666306537139e3d04ebc96631425bdbd6383372142\`) contains 118 source metadata rows, 124 documents, and 28,001 evidence atoms; it has five exact PDF byte matches with the 17-source original inventory: 2 COFEN 736/2024 PDFs (99 historical evidence atoms in the other corpus) and 3 NEWS2 PDFs (0 evidence atoms, conditionally gated in the historical corpus). These are **NOT** the 17 original JSONL records and must not be counted or promoted as them.

Two original COFEN 736 PDF documents are candidates for identity review against existing CKO source \`SRC-COFEN-RES-736-2024\`, whose source record already exists, but their exact PDF hashes do not match any CKO snapshot; edition, official publisher, source rights and version must be reviewed before linking. **Never create a second COFEN official source merely by filename equality.**

The metadata-only crosswalk is \`registers/governance/ncos-recovered-pdf-cko-snapshot-gap.v1.json\` (17 rows). Verify with \`node scripts/ncos-cko-snapshot-admission.mjs --inventory\` plus negative tests. Release HOLD and zero database mutations remain mandatory. This is WO #63 under parent #58.


## Original atom source page proof roots, noncontent stage

An independent read of the 17 **original** JSONL archived in the user's private Library generated a complete, **non-content** ledger of 1,192 pages: 25,508 text-atom identity digests, 887 visual references, 26,395 unique atom IDs. 1,185 pages have an original source-page-text hash in the text atoms; seven have none. This is metadata, not a publication or interpretation of source content. Every page stores its source PDF SHA256, page number, original page-text SHA256 where present, count and stable digest of IDs/hash values of its original atoms, with null CKO source/snapshot/fragment IDs and false rights/clinical/publication approvals.

Full local ledger: \`ncos-source-page-lineage-ledger.v1.json\`, SHA256 \`ac3f03707fa9a83b29fe91f8f0291e97da0214ecf4ae33ffe5e9d8ea258fcc0f\`. Private source ZIP SHA256 and full per-PDF root hashes in \`registers/governance/ncos-pdf-page-lineage-roots-20261114.v1.json\`. Per-document root hash algorithm: SHA256(UTF8 Python \`json.dumps(pages,sort_keys=True,separators=(',',':'),ensure_ascii=False)\`), where each ordered page object contains \`page\`, \`pageTextSha256\`, \`textAtoms\`, \`visualReferences\`, \`textAtomDigest\`, \`visualAtomDigest\`. Page atom digest: SHA256 of \`NCOS_PAGE_ATOM_IDENTITY_V1\n\` followed by lexically sorted \`atom_id|content_sha256\` lines and terminal newline. Blank page digest uses empty-identity sentinel, not invented content.

CI's \`scripts/ncos-page-evidence.mjs\` checks 17 roots against the pinned original recovery manifest, with six negative tests. CI intentionally has **no access to the copyrighted source bytes**: it checks consistency of existing attestation metadata, *not* a new independent PDF extraction. To reproduce byte-level page ledger, run the private \`ncos_build_page_lineage.py\` from the original ZIP and the independently verified audit. The local script is not a clinical validator. Pending CKO edition, norm rights, visual interpretation and clinical reviews remain HOLD.


## Mixed-issuer DOU page source quarantine — Resolution Cofen 736/2024

Read-only original-source verification identified TWO distinct binary PDF files \`dou_2024-01-23_s1_p74.pdf\` and \`Resolucao_Cofen_no_736_2024_Processo_de_Enfermagem.pdf\` that have **identical page text** (SHA256 \`032645e548aba3d6725029bc19654af048412b493833bc9c04cd9e6abc8a143b\`), identical ordered 29 text blocks and identical bounding boxes; however, their full PDF SHA256 values are **different**. Do not delete or coalesce binary provenance just because extracted text matches.

**Critical scope issue:** the official page includes Cofen Resolution 736/2024 AND resolutions of the Conselho Federal de Fisioterapia e Terapia Ocupacional (COFFITO) about debt refinancing, outside the CE/nursing corpus. The whole DOU-page text **cannot** become a single Cofen normative claim. All 58 text-atom occurrences from the two binary copies are now marked **HOLD_HUMAN_ISSUER_SEGMENTATION** for act-by-act, issuer-by-issuer source pinpoints. The SEI/Cofen 4-page document is a third distinct representation (different text layer) of the named regulatory act, with a separate version/edition review.

Official Cofen regulatory landing page: https://www.cofen.gov.br/resolucao-cofen-no-736-de-17-de-janeiro-de-2024/ ; official Cofen-hosted DOU page https://www.cofen.gov.br/wp-content/uploads/2024/01/Resolucao-736-2024.pdf. The existing CKO source \`SRC-COFEN-RES-736-2024\` is a **candidate for all three manifestations**, not an automatic source edition. The DOU candidate in the metadata-only CKO crosswalk is now explicitly marked \`OFFICIAL_GAZETTE_CONTAINS_COFEN_736_AND_OTHER_ISSUERS\`, bringing reviewed-candidate count from 2 to 3 while **approved aliases remain zero**.

Source evidence: \`registers/governance/ncos-cofen736-mixed-gazette-page-quarantine.v1.json\`; reproducible structural checks via \`scripts/ncos-gazette-issuer-boundary.mjs\` and negative tests. No source fragment, canonical ID, SQL or publication was created. Another regulator's text must NEVER be attributed to COFEN.


## Source-first page reuse (composite surgery protocol, Gazette, NEWS2 cover)

A deterministic **non-content** scan of the original JSONLs found **14 exact-page-text equivalence groups** (13 between different PDF binaries, one within NEWS2 final report). Of the cross-PDF groups, **12 pages** of the standalone \`Protocolo_para_Cirurgia_Segura_PNSP.pdf\` (pages 1–12) are text-block, bbox and image-hash identical to pages **3–14** of the larger \`Portaria_GM_MS_2_095_2013_com_anexos_Protocolo_de_Prevencao_de_Ulcera_por_Pressa.pdf\` (35 pages). This reuses 304 text atom occurrences and one image hash, preserving both document origins. The composite source also has introductory Portaria pages 1–2 and pressure-ulcer protocol pages 15–35, according to the original section headings. **It must never be treated as a single protocol for one clinical topic.**

Another page equivalence pair is the official mixed-issuer COFEN DOU page (29 original text atom occurrences), and the within-document duplicate is the NEWS2 report's pages 1/2 (2 text atoms). In total, 333 cross-PDF text-atom occurrences and one image reference are potential reuse/dedup **candidates**, not 333 approved, unique or reusable clinical facts.

The official Anvisa Digital Library entry https://bibliotecadigital.anvisa.gov.br/jspui/handle/anvisa/1771?mode=full reports **CC BY-NC-ND 4.0** on its surgical-protocol repository item. The exact byte identity to our historical surgical PDF has **not** been established; this is a license-screening candidate, **not** publication permission. Do not create derivative/translated/rephrased published copies from this registry without rights/legal evaluation; fact extraction and independent editorial creation require separate sourced claims and clinical review.

Versioned metadata-only \`registers/governance/ncos-source-page-reuse-candidates-20261114.v1.json\`; structural gate and negative tests \`scripts/ncos-source-page-reuse.mjs\`, \`scripts/ncos-source-page-reuse.test.mjs\`. Local independent full 14-group report SHA \`40f824ec10bc300bf902d44eba43904f5d819c0dd6b66787a49bf9689f35ec60\`. No source IDs invented, no rights/clinical approval, no DB write, no main merge.
