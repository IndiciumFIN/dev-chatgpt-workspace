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
