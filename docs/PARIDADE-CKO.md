# Paridade CKO x branch-bibliotecas

Gerado por `scripts/audit-cko-parity.mjs`. Nao editavel a mao.

| Estado | Schemas |
|---|---|
| **IMPLEMENTADO** | 0 |
| **PARCIAL** | 7 |
| **DECLARADO-MORTO** | 8 |
| **AUSENTE** | 41 |

> IMPLEMENTADO = todo campo declarado e lido por um consumidor.
> DECLARADO-MORTO = o campo existe no tipo e nenhum consumidor o le.
> `declarados mas nunca lidos` e a lista do trabalho real.

| Schema CKO | Tipo nosso | Estado | decl | impl | nunca lidos |
|---|---|---|---|---|---|
| `accessibility` | — | AUSENTE | 0 | 0 | — |
| `advertising` | — | AUSENTE | 0 | 0 | — |
| `agent` | — | AUSENTE | 0 | 0 | — |
| `analytics_event` | — | AUSENTE | 0 | 0 | — |
| `assessment_item` | — | AUSENTE | 0 | 0 | — |
| `audit_evidence` | — | AUSENTE | 0 | 0 | — |
| `canonical_object` | — | AUSENTE | 0 | 0 | — |
| `claim` | — | AUSENTE | 0 | 0 | — |
| `design_adapter` | — | AUSENTE | 0 | 0 | — |
| `device` | — | AUSENTE | 0 | 0 | — |
| `export_profile` | — | AUSENTE | 0 | 0 | — |
| `find` | — | AUSENTE | 0 | 0 | — |
| `laboratory_exam` | — | AUSENTE | 0 | 0 | — |
| `learning_resource` | — | AUSENTE | 0 | 0 | — |
| `library` | — | AUSENTE | 0 | 0 | — |
| `measurement` | — | AUSENTE | 0 | 0 | — |
| `medication` | — | AUSENTE | 0 | 0 | — |
| `metadata_seo` | — | AUSENTE | 0 | 0 | — |
| `monitoring` | — | AUSENTE | 0 | 0 | — |
| `performance_budget` | — | AUSENTE | 0 | 0 | — |
| `procedure` | — | AUSENTE | 0 | 0 | — |
| `projection` | — | AUSENTE | 0 | 0 | — |
| `protocol` | — | AUSENTE | 0 | 0 | — |
| `publication` | — | AUSENTE | 0 | 0 | — |
| `reference` | — | AUSENTE | 0 | 0 | — |
| `relation` | — | AUSENTE | 0 | 0 | — |
| `release_gate` | — | AUSENTE | 0 | 0 | — |
| `research_method` | — | AUSENTE | 0 | 0 | — |
| `risk_control` | — | AUSENTE | 0 | 0 | — |
| `runtime_test` | — | AUSENTE | 0 | 0 | — |
| `safety_check` | — | AUSENTE | 0 | 0 | — |
| `search_index` | — | AUSENTE | 0 | 0 | — |
| `state_machine` | — | AUSENTE | 0 | 0 | — |
| `task` | — | AUSENTE | 0 | 0 | — |
| `terminology` | — | AUSENTE | 0 | 0 | — |
| `ui_interaction` | — | AUSENTE | 0 | 0 | — |
| `user_state` | — | AUSENTE | 0 | 0 | — |
| `vaccine` | — | AUSENTE | 0 | 0 | — |
| `visualization` | — | AUSENTE | 0 | 0 | — |
| `work_order` | — | AUSENTE | 0 | 0 | — |
| `workflow` | — | AUSENTE | 0 | 0 | — |
| `applicability` | `Aplicabilidade` | DECLARADO-MORTO | 0 | 0 | — |
| `clinical_rule` | `RegraClinica` | DECLARADO-MORTO | 7 | 0 | `rule_kind`, `antecedents`, `consequences`, `authority_binding_refs`, `applicability_ref`, `fail_mode`, `test_vector_refs` |
| `formula` | `FormulaContrato` | DECLARADO-MORTO | 10 | 0 | `expression_ast_ref`, `input_field_refs`, `output_quantity_ref`, `rounding_mode`, `rounding_stage`, `calculation_precision`, `display_precision`, `test_vector_refs`, `source_binding_refs`, `override_justification_ref` |
| `i18n` | `LocaleRegistry` | DECLARADO-MORTO | 0 | 0 | — |
| `inference` | `InferenciaContrato` | DECLARADO-MORTO | 6 | 0 | `inference_class`, `allowed_use`, `source_claim_refs`, `model_or_rule_ref`, `human_review`, `prohibited_authority_mutation` |
| `media_asset` | `BrandAsset` | DECLARADO-MORTO | 0 | 0 | — |
| `privacy` | `PrivacyProfile` | DECLARADO-MORTO | 9 | 0 | `sensitive_capture`, `lgpd_capture`, `optional_context_fields`, `forbidden_fields`, `persistence`, `transmission`, `analytics`, `advertising`, `logs` |
| `route` | `RotaContrato` | DECLARADO-MORTO | 0 | 0 | — |
| `authority_binding` | `AuthorityBinding` | PARCIAL | 9 | 7 | `validity`, `exception_reason` |
| `clinical_result` | `ResultadoContrato` | PARCIAL | 8 | 1 | `tool_ref`, `raw_value_ref`, `normalized_value_ref`, `precision_policy_ref`, `interpretation_ref`, `replay_hash_ref`, `unit_ref` |
| `component` | `ComponenteContrato` | PARCIAL | 10 | 3 | `owner_module`, `props_schema_ref`, `state_machine_ref`, `design_system_token_refs`, `a11y_profile_ref`, `reusability_scope`, `deprecated_aliases` |
| `field_definition` | `CampoDefinido` | PARCIAL | 10 | 2 | `semantic_concept_ref`, `value_type`, `privacy_policy`, `applicability_ref`, `unit_ref`, `validation_rule_ids`, `message_key`, `allowed_values_ref` |
| `interpretation` | `InterpretacaoContrato` | PARCIAL | 8 | 3 | `result_ref`, `rule_refs`, `population_ref`, `limitations`, `display_message_key` |
| `source` | `FonteNormativa` | PARCIAL | 13 | 13 | — |
| `tool` | `ToolContrato` | PARCIAL | 28 | 6 | `input_bindings`, `engine_ref`, `result_schema_ref`, `safety_profile`, `test_vector_refs`, `inference_policy_ref`, `ui_profile_ref`, `output_precision_policy_ref`, `authority_binding_refs`, `field_definition_refs`, `formula_ref`, `rule_refs`, `interpretation_ref`, `result_ref`, `component_refs`, `about_tool`, `required_fields`, `conditional_fields`, `patient_safety`, `seo_profile_ref`, `i18n_profile_ref`, `analytics_profile_ref` |
