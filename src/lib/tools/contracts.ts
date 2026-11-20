/**
 * Contrato universal de ferramenta — espelho do sistema CKO.
 *
 * Este arquivo é a PONTE entre o site e o `CKO_Sistema_Universal_Contratos_Canonicos`.
 * Os nomes de campo e as listas de obrigatórios aqui espelham, um a um, os `required`
 * dos schemas do pacote:
 *
 *   CKO                                    aqui
 *   ────────────────────────────────────   ──────────────────────────────────────────
 *   source.schema.json                     FonteNormativa
 *   authority_binding.schema.json          AuthorityBinding
 *   field_definition.schema.json           CampoDefinido
 *   formula.schema.json                    FormulaContrato
 *   clinical_rule.schema.json              RegraClinica
 *   clinical_result.schema.json            ResultadoContrato
 *   interpretation.schema.json             InterpretacaoContrato
 *   inference.schema.json                  InferenciaContrato
 *   tool.schema.json                       ToolContrato
 *   component.schema.json                  ComponenteContrato
 *
 * A REGRA que os dois lados obedecem: `UTC-003` — nenhum dado clínico, limite, unidade,
 * formula, interpretacao, texto clinico, populacao ou regra pode ser fonte de verdade
 * INLINE em HTML/JS/template. E `UTC-001` — a fonte autoritativa e o requisito precedem a
 * implementacao; nenhuma ferramenta define primeiro uma regra clinica para depois procurar
 * uma referencia.
 *
 * Nao e uma reinterpretacao: e a mesma forma, com a mesma exigencia de campo por campo.
 * O que o gate cobrar e o que o CKO cobra.
 */

/* ── identidade compartilhada (CONTRACT_CATALOG.md: "Shared identity and fields") ── */
export type EstadoContrato =
  | "CANDIDATE"
  | "DRAFT"
  | "SOURCE_QUALIFIED"
  | "EVIDENCE_BOUND"
  | "REVIEW_REQUIRED"
  | "ASSURED"
  | "ELIGIBLE_FOR_RELEASE"
  | "RELEASED"
  | "RETIRED"
  | "HOLD_HUMAN";

export type IdentidadeContrato = {
  schema_version: string;
  canonical_id: string;
  version: string;
  status: EstadoContrato;
  updated_at: string;
  provenance_refs: string[];
};

/* ── source.schema.json ─────────────────────────────────────────────────── */
/**
 * `source_type` — enum CANONICO do contrato `source` (contracts/cko-skeleton/
 * catalog/cko-data.json). Medido em 01/11/2026: os valores anteriores
 * (NORMATIVA/VALIDACAO/GUIA/PROTOCOLO/TECNICA/ARTIGO/MANUAL/PAGINA_OFICIAL)
 * nao pertencem a nenhum enum do catalogo CKO.
 */
export type TipoFonte =
  | "OFFICIAL_LAW"
  | "REGULATOR"
  | "STANDARD"
  | "TERMINOLOGY"
  | "PRIMARY_STUDY"
  | "GUIDELINE"
  | "TEXTBOOK"
  | "DATASET_API"
  | "SOFTWARE"
  | "IMAGE"
  | "INTERNAL_GOVERNED";

export type FonteNormativa = IdentidadeContrato & {
  source_type: TipoFonte;
  /**
   * NOTA: o contrato canonico `source` tem `additionalProperties: false` —
   * nao existe campo para a justificativa da classificacao. A razao pela qual
   * cada fonte foi classificada pela natureza do documento vive no registo
   * (docs/PLAN-PMOKERNEL-FINALIZATION-v0.1.0.md, §13.5), e nao dentro do
   * contrato. Nao reintroduzir aqui um campo que o contrato nao admite.
   */
  title: string;
  /** Quem assina: "Conselho Federal de Medicina (CFM)", "CAPES/MEC", "OMS/WHO". */
  authority: string;
  locator: { uri: string; pinpoint: string };
  /** "PUBLIC_DOMAIN" | "LICENSED" | "UNKNOWN" | "PERMISSION_GRANTED". */
  rights: string;
  /** "BR" para a autoridade brasileira. E o eixo do produto. */
  jurisdiction: string;
  retrieved_at: string;
  /**
   * Integridade declarada: `sha256` = 64 hex (hash real do artefacto preservado)
   * OU "NOT_AVAILABLE" — e nesse caso `reason` e `artifact_ref` tem de estar
   * declarados. 64 zeros e um placeholder, nunca integridade. Hash atesta
   * bytes, nao correccao; ausencia declarada e ausencia, nao integridade.
   */
  integrity: {
    sha256: string;
    snapshot_ref: string;
    reason?: string;
    artifact_ref?: string | null;
    method?: string;
  };
  effective_from?: string;
  effective_until?: string;
  license_ref?: string;
  language?: string;
  /** Citacao ABNT NBR 6023:2018 para exibicao. */
  citacao?: string;
};

/* ── authority_binding.schema.json ──────────────────────────────────────── */
export type AuthorityBinding = IdentidadeContrato & {
  /** Caminho do campo dentro da ferramenta. Um binding POR CAMPO (UTC-002). */
  field_path: string;
  requirement_id: string;
  /** `source_ids` referencia `FonteNormativa.canonical_id`. */
  source_ids: string[];
  /**
   * `authority_class` — enum CANONICO do contrato `authority_binding`:
   * REGULATORY | TECHNICAL_STANDARD | AUTHORITATIVE_TERMINOLOGY |
   * CLINICAL_EVIDENCE | INTERNAL_NONCLINICAL.
   */
  authority_class: string;
  validity: { from?: string; until?: string; jurisdiction?: string };
  /**
   * `decision` — enum CANONICO do contrato `authority_binding`:
   * ALLOW | HOLD_HUMAN | REJECT | NOT_APPLICABLE_JUSTIFIED.
   * (O `decision` do contrato `release_gate` — HOLD/REJECTED/APPROVED — e outro
   * vocabulario e nao governa os bindings.)
   */
  decision: string;
  validator_ids?: string[];
  evidence_bundle_ids?: string[];
  exception_reason?: string;
};

/* ── field_definition.schema.json ───────────────────────────────────────── */
export type CampoDefinido = IdentidadeContrato & {
  field_path: string;
  semantic_concept_ref: string;
  value_type: string;
  authority_binding_ref: string;
  /** "EPHEMERAL_NOT_CAPTURED" | "NOT_APPLICABLE" | "PERSISTED_NON_SENSITIVE". */
  privacy_policy: string;
  applicability_ref: string;
  unit_ref?: string;
  validation_rule_ids?: string[];
  message_key?: string;
  allowed_values_ref?: string;
};

/* ── formula.schema.json ────────────────────────────────────────────────── */
export type FormulaContrato = IdentidadeContrato & {
  expression_ast_ref: string;
  input_field_refs: string[];
  output_quantity_ref: string;
  /** ABNT NBR 5891:2014 como baseline. */
  rounding_mode: "HALF_EVEN" | "HALF_UP" | "HALF_DOWN" | "TRUNCATE" | "CEILING" | "FLOOR";
  rounding_stage: string;
  calculation_precision: number;
  display_precision: number;
  test_vector_refs: string[];
  source_binding_refs: string[];
  override_justification_ref?: string;
};

/* ── clinical_rule.schema.json ──────────────────────────────────────────── */
export type RegraClinica = IdentidadeContrato & {
  rule_kind: string;
  antecedents: string[];
  consequences: string[];
  authority_binding_refs: string[];
  applicability_ref: string;
  /** UTC-023: regra que falha e HOLD, nunca chute. */
  fail_mode: string;
  test_vector_refs?: string[];
};

/* ── clinical_result.schema.json ────────────────────────────────────────── */
export type ResultadoContrato = IdentidadeContrato & {
  tool_ref: string;
  raw_value_ref: string;
  normalized_value_ref: string;
  precision_policy_ref: string;
  interpretation_ref: string;
  /** UTC-023: os sete estados. */
  state:
    | "NOT_EVALUATED"
    | "INCOMPLETE"
    | "READY"
    | "CALCULATING"
    | "CALCULATED"
    | "INVALID"
    | "BLOCKED"
    | "ERROR";
  replay_hash_ref: string;
  unit_ref?: string;
};

/* ── interpretation.schema.json ─────────────────────────────────────────── */
export type InterpretacaoContrato = IdentidadeContrato & {
  result_ref: string;
  rule_refs: string[];
  population_ref: string;
  jurisdiction: string;
  limitations: string[];
  evidence_refs: string[];
  review_state: string;
  display_message_key?: string;
};

/* ── inference.schema.json ──────────────────────────────────────────────── */
export type InferenciaContrato = IdentidadeContrato & {
  inference_class:
    | "DETERMINISTIC"
    | "RULE_BASED"
    | "ONTOLOGICAL"
    | "SEMANTIC"
    | "STATISTICAL"
    | "PROBABILISTIC"
    | "LLM_ASSISTED"
    | "HYBRID";
  allowed_use: string[];
  source_claim_refs: string[];
  model_or_rule_ref: string;
  human_review: string;
  /** UTC-027: inferencia nunca altera formula, threshold, dose, classificacao ou norma. */
  prohibited_authority_mutation: boolean;
};

/* ── component.schema.json ──────────────────────────────────────────────── */
export type ComponenteContrato = IdentidadeContrato & {
  component_key: string;
  owner_module: string;
  semantic_role: string;
  props_schema_ref: string;
  state_machine_ref: string;
  design_system_token_refs: string[];
  a11y_profile_ref: string;
  reusability_scope: string;
  deprecated_aliases?: string[];
  exceptions?: string[];
};

/* ── tool.schema.json ───────────────────────────────────────────────────── */
export type ToolContrato = IdentidadeContrato & {
  tool_kind: "ESCALA" | "CALCULADORA";
  input_bindings: string[];
  engine_ref: string;
  result_schema_ref: string;
  privacy_profile: string;
  safety_profile: string;
  test_vector_refs: string[];
  release_gate: string;
  inference_policy_ref?: string;
  ui_profile_ref?: string;
  output_precision_policy_ref?: string;
  /* campos do CKO que o site usa, por serem exigidos pela politica */
  source_ids: string[];
  authority_binding_refs: string[];
  field_definition_refs: string[];
  formula_ref: string;
  rule_refs: string[];
  interpretation_ref: string;
  result_ref: string;
  component_refs: string[];
  about_tool: {
    objetivo: string;
    escopo: string;
    populacao: string;
    publico_alvo: string;
    contexto_assistencial: string;
    limitacoes: string[];
  };
  /** UTC-018/UTC-019: obrigatoriedade declarativa, nunca so asterisco. */
  required_fields: string[];
  conditional_fields: { field_path: string; when: string }[];
  /** §14: o que o usuario ve. */
  visibility: {
    interno: string[];
    sempre: string[];
    sob_demanda: string[];
    regulatorio: string[];
    nunca_para_targeting: string[];
  };
  evidence_refs: string[];
  patient_safety: { certs: string[]; goals: string[] };
  seo_profile_ref: string;
  i18n_profile_ref: string;
  analytics_profile_ref: string;
};

/* ── privacy_profile: a emenda v1.2.0 ───────────────────────────────────── */
export type PrivacyProfile = {
  /** "NO_SENSITIVE_CAPTURE" — principio da §10. */
  sensitive_capture: "NO_SENSITIVE_CAPTURE";
  /** "NO_LGPD_CAPTURE" — emenda v1.2.0 para contexto assistencial. */
  lgpd_capture: "NO_LGPD_CAPTURE";
  /** Campos opcionais, mascarados por padrao. */
  optional_context_fields: { field_path: string; masked: boolean; mask_strategy: "FULL" | "PARTIAL" | "NONE"; capture: "DISABLED" }[];
  forbidden_fields: string[];
  persistence: "NONE";
  transmission: "NONE";
  analytics: "EXCLUDED";
  advertising: "EXCLUDED";
  logs: "EXCLUDED";
};

/* ── a politica de referencia, versionada ───────────────────────────────── */
export const POLITICA_FERRAMENTAS = {
  id: "CKO-POL-UT-001",
  versao: "1.2.0",
  base: "CKO-POL-UT-001@1.1.0",
  emenda: "CKO-POL-UT-001-EMENDA-v1.2.0",
  fonte_normativa: "CKO-POL-UT-001",
  fonte_contratos: "CKO_Sistema_Universal_Contratos_Canonicos_v0.1.0",
  /** §16: o gate de MD esta fechado; Clinical Calculators/Scales herdam HOLD. */
  md_gate: "CLOSED" as "OPEN" | "CLOSED",
  camada_herdada: "Clinical Calculators; Scales & Scores",
  release_gate: "HOLD_HUMAN",
} as const;

/**
 * O gate herdado. Enquanto o gate de MD estiver fechado, uma ferramenta nao pode
 * entrar em `RELEASED` — ela fica em `EVIDENCE_BOUND` e a pagina declara o HOLD.
 * Nao e excecao minha: e a nota de controle da politica v1.1.0 e a §16.
 */
export function estadoPublicavel(estado: EstadoContrato): boolean {
  if (POLITICA_FERRAMENTAS.md_gate === "CLOSED" && estado === "RELEASED") return false;
  return estado !== "HOLD_HUMAN";
}
