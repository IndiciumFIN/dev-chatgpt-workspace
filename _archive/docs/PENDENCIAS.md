# Pendencias — branch-bibliotecas

Gerado por `scripts/generate-pendencias.mjs` a partir do estado MEDIDO em **2026-10-23 18:37Z**.
Nada aqui vem de memoria: cada item carrega a evidencia que o produziu.

> A lista so cresce quando algo esta de fato por fazer. Se um gate passa, o item desaparece.

## Estado apurado

| Medida | Valor |
|---|---|
| GATE VERDE | **12** |
| GATE VERMELHO | **0** |
| DESVIO DE TEMPLATE | **5** |
| TEMPLATE SEM PAGINA | **8** |
| UTC EM ABERTO | **12** |
| SCHEMA CKO IMPLEMENTADO | **0** |
| SCHEMA CKO AUSENTE | **41** |

## Templates (13)

### Calculadoras Trabalhistas — sem pagina
- **Estado:** CONTEUDO GOVERNADO
- **Detalhe:** CFM/ANVISA/COREN — a qualificar
- **Evidencia:** `src/lib/template-catalog.ts#calculadoras-trabalhistas`

### Doencas Compulsorias — sem pagina
- **Estado:** CONTEUDO GOVERNADO
- **Detalhe:** CFM/CID — a qualificar
- **Evidencia:** `src/lib/template-catalog.ts#doencas-compulsorias`

### Exames Laboratoriais — sem pagina
- **Estado:** CONTEUDO GOVERNADO
- **Detalhe:** consensos/sociedades — a qualificar
- **Evidencia:** `src/lib/template-catalog.ts#exames-laboratoriais`

### SBAR — sem pagina
- **Estado:** CONTEUDO GOVERNADO
- **Detalhe:** protocolo de passagem de plantao — a qualificar
- **Evidencia:** `src/lib/template-catalog.ts#sbar`

### Conteudo de curiosidades — sem pagina
- **Estado:** CONTEUDO GOVERNADO
- **Detalhe:** 87 slots reservados, sem conteudo escrito
- **Evidencia:** `src/lib/template-catalog.ts#curiosidades`

### Ferramentas de pesquisa — sem pagina
- **Estado:** CONTEUDO GOVERNADO
- **Detalhe:** a definir com o dono
- **Evidencia:** `src/lib/template-catalog.ts#ferramentas-pesquisa`

### Forum de enfermagem — sem pagina
- **Estado:** CONTEUDO GOVERNADO
- **Detalhe:** a definir com o dono
- **Evidencia:** `src/lib/template-catalog.ts#forum`

### Album de Enfermagem — sem pagina
- **Estado:** CONTEUDO GOVERNADO
- **Detalhe:** a definir com o dono
- **Evidencia:** `src/lib/template-catalog.ts#album`

### editorial — desvio de contrato
- **Estado:** DESVIO MEDIDO
- **Detalhe:** /modelos/institucional toc sidebar != none | tools a mais: favorite,listen
- **Evidencia:** `scripts/audit-templates.mjs -> audit/audit-templates-latest.log`

### Institucional — desvio de contrato
- **Estado:** DESVIO MEDIDO
- **Detalhe:** /modelos/institucional toc sidebar != none
- **Evidencia:** `scripts/audit-templates.mjs -> audit/audit-templates-latest.log`

### Biblioteca de Imagens — desvio de contrato
- **Estado:** DESVIO MEDIDO
- **Detalhe:** /bibliotecas/anatomia toc none != sidebar | related false != true | note none != inline | tools faltando: favorite,print,readingTime,listen
- **Evidencia:** `scripts/audit-templates.mjs -> audit/audit-templates-latest.log`

### Area do administrador — desvio de contrato
- **Estado:** DESVIO MEDIDO
- **Detalhe:** /admin hero none != page | crumbs false != true
- **Evidencia:** `scripts/audit-templates.mjs -> audit/audit-templates-latest.log`

### Slides — desvio de contrato
- **Estado:** DESVIO MEDIDO
- **Detalhe:** /modelos/slides hero none != page | related false != true | note none != inline | tools faltando: print,readingTime
- **Evidencia:** `scripts/audit-templates.mjs -> audit/audit-templates-latest.log`

## Politica CKO (CKO-POL-UT-001) (28)

### UTC-003 — verdade clinica governada em runtime
- **Estado:** NAO COBERTO PELO GATE
- **Detalhe:** primeiro na ordem: esta na lista de HOLDs da Aldrete
- **Evidencia:** `docs/CKO-POL-UT-001.md`

### UTC-023 — os 7 estados de uma ferramenta
- **Estado:** NAO COBERTO PELO GATE
- **Detalhe:** a pagina tem 2 (Aguardando / Calculado)
- **Evidencia:** `docs/CKO-POL-UT-001.md`

### UTC-024 — formula declarativa + test vectors
- **Estado:** NAO COBERTO PELO GATE
- **Detalhe:** src/lib/tools/formulas.ts existe, sem vetores
- **Evidencia:** `docs/CKO-POL-UT-001.md`

### UTC-028 — contrato de resultado
- **Estado:** NAO COBERTO PELO GATE
- **Detalhe:** resultado nao tem contrato proprio
- **Evidencia:** `docs/CKO-POL-UT-001.md`

### UTC-053 — regras de pontuacao
- **Estado:** NAO COBERTO PELO GATE
- **Detalhe:** nao coberto
- **Evidencia:** `docs/CKO-POL-UT-001.md`

### UTC-056 — faixas de referencia por faixa etaria
- **Estado:** NAO COBERTO PELO GATE
- **Detalhe:** nao coberto
- **Evidencia:** `docs/CKO-POL-UT-001.md`

### UTC-071 — reconhecimento do consumidor
- **Estado:** NAO COBERTO PELO GATE
- **Detalhe:** parcial
- **Evidencia:** `docs/CKO-POL-UT-001.md`

### UTC-072 — E2E
- **Estado:** NAO COBERTO PELO GATE
- **Detalhe:** scripts/e2e/ nao entregue
- **Evidencia:** `docs/CKO-POL-UT-001.md`

### UTC-080 — ABNT NBR 6023
- **Estado:** NAO COBERTO PELO GATE
- **Detalhe:** verificador nao entregue
- **Evidencia:** `docs/CKO-POL-UT-001.md`

### UTC-081 — ABNT NBR 10520
- **Estado:** NAO COBERTO PELO GATE
- **Detalhe:** verificador nao entregue
- **Evidencia:** `docs/CKO-POL-UT-001.md`

### UTC-082 — ABNT NBR 5891
- **Estado:** NAO COBERTO PELO GATE
- **Detalhe:** verificador nao entregue
- **Evidencia:** `docs/CKO-POL-UT-001.md`

### UTC-097 — disclaimer de emergencia
- **Estado:** DECISAO DO DONO
- **Detalhe:** DECISAO DO DONO
- **Evidencia:** `docs/CKO-POL-UT-001.md`

### Paridade com os 56 schemas do CKO
- **Estado:** 0 IMPLEMENTADO · 7 PARCIAL · 8 DECLARADO-MORTO · 41 AUSENTE
- **Detalhe:** nenhum schema esta integralmente implementado; a cobertura dos campos obrigatorios do CKO estabiliza em 0,50-0,57
- **Evidencia:** `audit/cko-parity.v1.json · docs/PARIDADE-CKO.md`

### authority_binding — 5 campo(s) declarados e nunca lidos
- **Estado:** PARCIAL
- **Detalhe:** requirement_id, validity, validator_ids, evidence_bundle_ids, exception_reason
- **Evidencia:** `audit/cko-parity.v1.json#authority_binding`

### clinical_result — 7 campo(s) declarados e nunca lidos
- **Estado:** PARCIAL
- **Detalhe:** tool_ref, raw_value_ref, normalized_value_ref, precision_policy_ref, interpretation_ref, replay_hash_ref, unit_ref
- **Evidencia:** `audit/cko-parity.v1.json#clinical_result`

### clinical_rule — 7 campo(s) declarados e nunca lidos
- **Estado:** DECLARADO-MORTO
- **Detalhe:** rule_kind, antecedents, consequences, authority_binding_refs, applicability_ref, fail_mode, test_vector_refs
- **Evidencia:** `audit/cko-parity.v1.json#clinical_rule`

### component — 9 campo(s) declarados e nunca lidos
- **Estado:** PARCIAL
- **Detalhe:** owner_module, semantic_role, props_schema_ref, state_machine_ref, design_system_token_refs, a11y_profile_ref, reusability_scope, deprecated_aliases, exceptions
- **Evidencia:** `audit/cko-parity.v1.json#component`

### field_definition — 8 campo(s) declarados e nunca lidos
- **Estado:** PARCIAL
- **Detalhe:** semantic_concept_ref, value_type, privacy_policy, applicability_ref, unit_ref, validation_rule_ids, message_key, allowed_values_ref
- **Evidencia:** `audit/cko-parity.v1.json#field_definition`

### formula — 10 campo(s) declarados e nunca lidos
- **Estado:** DECLARADO-MORTO
- **Detalhe:** expression_ast_ref, input_field_refs, output_quantity_ref, rounding_mode, rounding_stage, calculation_precision, display_precision, test_vector_refs, source_binding_refs, override_justification_ref
- **Evidencia:** `audit/cko-parity.v1.json#formula`

### inference — 6 campo(s) declarados e nunca lidos
- **Estado:** DECLARADO-MORTO
- **Detalhe:** inference_class, allowed_use, source_claim_refs, model_or_rule_ref, human_review, prohibited_authority_mutation
- **Evidencia:** `audit/cko-parity.v1.json#inference`

### interpretation — 7 campo(s) declarados e nunca lidos
- **Estado:** PARCIAL
- **Detalhe:** result_ref, rule_refs, population_ref, limitations, evidence_refs, review_state, display_message_key
- **Evidencia:** `audit/cko-parity.v1.json#interpretation`

### privacy — 9 campo(s) declarados e nunca lidos
- **Estado:** DECLARADO-MORTO
- **Detalhe:** sensitive_capture, lgpd_capture, optional_context_fields, forbidden_fields, persistence, transmission, analytics, advertising, logs
- **Evidencia:** `audit/cko-parity.v1.json#privacy`

### source — 5 campo(s) declarados e nunca lidos
- **Estado:** PARCIAL
- **Detalhe:** retrieved_at, effective_from, effective_until, license_ref, citacao
- **Evidencia:** `audit/cko-parity.v1.json#source`

### tool — 24 campo(s) declarados e nunca lidos
- **Estado:** PARCIAL
- **Detalhe:** input_bindings, engine_ref, result_schema_ref, privacy_profile, safety_profile, test_vector_refs, inference_policy_ref, ui_profile_ref, output_precision_policy_ref, authority_binding_refs, field_definition_refs, formula_ref, rule_refs, interpretation_ref, result_ref, component_refs, about_tool, required_fields, conditional_fields, evidence_refs, patient_safety, seo_profile_ref, i18n_profile_ref, analytics_profile_ref
- **Evidencia:** `audit/cko-parity.v1.json#tool`

### 8 perfis UE-LTS v0.2.0 — versao materializada
- **Estado:** PASS_WITH_SCOPED_HOLDS
- **Detalhe:** 8/8 perfis com layout_contract por canal e governance (facts_from_canonical_only, rights/a11y/evidence gates). O proprio pacote declara browser_pixel_qa=0 e print_preflight=0 (G6 HOLD_SCOPED).
- **Evidencia:** `contracts/cko-editorial/profiles/*.json · evidence/validation_report.json`

### renderer universal — 21 linhas, 6 de 27 blocos
- **Estado:** STUB
- **Detalhe:** renderBlock/renderProjection cobrem action_bar, claim, figure, lead, references, title. Faltam 21 blocos. G5 marca PASS por existir, nao por cobrir.
- **Evidencia:** `contracts/cko-editorial/renderer/web/universal_renderer.js`

### 6 schemas do UE-LTS fora do catalogo de 56
- **Estado:** AUSENTES NA BRANCH
- **Detalhe:** block_instance, projection_request, template_manifest, content_projection_classification, resource_binding, assessment_item
- **Evidencia:** `contracts/cko-editorial/schemas/`

### md_gate CLOSED
- **Estado:** FECHADO POR DECISAO
- **Detalhe:** enquanto fechado, nada pode ir a RELEASED — a Aldrete segue como candidata, fora do indice
- **Evidencia:** `registers/governance/find-register.v1.json`

## Design system (3)

### Token mapping do pacote CKO
- **Estado:** NAO INICIADO
- **Detalhe:** src/styles/library-canonical.css
- **Evidencia:** `src/lib/template-applicability.ts / registers/design/`

### Token mapping do pacote CKO — VEREDITO
- **Estado:** NOT_APPLICABLE_JUSTIFIED
- **Detalhe:** a paleta semantica do CKO (391 tokens, 8 camadas) cobre 9 de 26 valores do nosso DS. Faltam navy-deep #163269, sky #4a90e2, ink #0f2440, canvas #f9fafb e foco #ff0 — 5 dos 9 tokens que o dono congelou. Mapear sobrescreveria a paleta congelada.
- **Evidencia:** `contracts/cko-tokens/tokens/02-semantic.tokens.json vs src/styles.css @theme`

### Paleta congelada do dono — 9/9tokens presentes no codigo
- **Estado:** CONFORME
- **Detalhe:** navy, navy-mid, navy-deep, sky, ink, slate, muted, canvas e foco #ff0 (shell.tsx) conferem contra src/styles.css e shell.tsx
- **Evidencia:** `src/styles.css @theme · src/components/site/shell.tsx`

## Conteudo (5)

### Acervo de imagem das 87 paginas de curiosidade
- **Estado:** SLOTS RESERVADOS, SEM CONTEUDO
- **Detalhe:** nenhuma pagina escrita — texto clinico nao se inventa
- **Evidencia:** `src/lib/content/articles/`

### 27 libraries do CKO — homologacao clinica
- **Estado:** NOT_REVIEWED · jurisdiction decision_required
- **Detalhe:** 568 blocos de texto real e 325 modulos; review_status=not_reviewed, evidence_verification_status=not_verified, approved_by=null. Estrutura PASS, conteudo nao verificado.
- **Evidencia:** `contracts/cko-bibliotecas/validation/validation.json`

### 18 libraries sem equivalente no acervo atual
- **Estado:** MATERIA-PRIMA EXTRAIDA, NAO PUBLICADA
- **Detalhe:** doencas, epidemiologia, exames-laboratoriais, ferimentos, geriatria, legislacao, materiais-cirurgicos, notificacao-compulsoria, pediatria, protocolos-enfermagem, saude-mental, seguranca-do-paciente, sinais-vitais, sondas, uti-emergencia, vacinas, ventilacao-mecanica, medicamentos
- **Evidencia:** `contracts/cko-bibliotecas/entities/libraries/`

### biblioteca `medicamentos` — conteudo ausente na origem
- **Estado:** NULL_IN_SOURCE nas 4 camadas
- **Detalhe:** a biblioteca de medicamentos nao foi entregue; bloqueia Calculadoras Trabalhistas no material do CKO
- **Evidencia:** `contracts/cko-bibliotecas/validation/validation.json#null_bindings`

### 8 perfis UE-LTS com manifest ausente
- **Estado:** DRAFT · blocos=[] · manifests nao vieram no pacote
- **Detalhe:** article, case, flashcard, quiz, infographic, pdf, pocket_guide, slides — os 8 referenciam profiles/*.json que nao existem no pacote
- **Evidencia:** `contracts/cko-skeleton/catalog/profiles/`

## O que ja esta fechado

- Build de producao (`build:spa`) — 52 HTML, 53 arquivos materializados
- `npx tsc --noEmit` — limpo
- `npm test` — 187/187
- Gates de release — 12/12 verdes
- Contratos runtime — derivados do codigo, gate barra entidade sem contrato e contrato orfao
- Route Registry (UTC-051) — canonical e hreflang derivados do catalogo
- Sitemap — 41 URLs, gerado no prebuild, conferido pelo gate
- Aldrete — candidata, fora do indice, com os 7 HOLDs declarados
- Catalogo de 30 templates — cada um com kind, frame, nota e materia-prima declarados
