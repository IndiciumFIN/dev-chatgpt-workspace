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
