/**
 * Tipos canônicos para o bloco Educacional.
 *
 * Espelho direto de:
 *   _archive/download/cko-skeletons/03-contratos-canonicos/bibliotecas-e-conteudo/assessment_item.schema.json
 *   _archive/download/cko-skeletons/03-contratos-canonicos/bibliotecas-e-conteudo/flashcard.schema.json
 *
 * Os schemas derivam de `learning_resource.schema.json` (resource_type=QUIZ/CASE/FLASHCARD).
 */

// ============================================================
// Status (compartilhado com outros contratos CKO)
// ============================================================

export type EducationStatus =
  | "CANDIDATE"
  | "DRAFT"
  | "SOURCE_QUALIFIED"
  | "EVIDENCE_BOUND"
  | "REVIEW_REQUIRED"
  | "HOLD_HUMAN"
  | "ASSURED"
  | "ELIGIBLE_FOR_RELEASE"
  | "RELEASED"
  | "RETIRED";

// ============================================================
// AssessmentItem — espelha assessment_item.schema.json
// ============================================================

export type ItemType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "MULTIPLE_RESPONSE"
  | "FILL_BLANK"
  | "ORDERING"
  | "CASE_BASED";

export type ShufflePolicy = "SHUFFLE_ALL" | "SHUFFLE_KEEP_LAST" | "NO_SHUFFLE";

export type AnswerExposurePolicy = "IMMEDIATE" | "ON_SUBMIT" | "ON_REVIEW" | "NEVER";

export type DifficultyLevel = "BASIC" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export interface AssessmentItem {
  // Campos canônicos herdados
  schema_version: "0.1.0";
  canonical_id: string;
  version: string;
  status: EducationStatus;
  updated_at: string;
  provenance_refs: string[];

  // Campos específicos do assessment_item
  learning_objective_ref: string;
  prompt_key: string;                  // enunciado
  answer_key_ref: string;              // referência textual da chave
  rationale_claim_refs: string[];      // claim_ids que justificam
  evidence_refs: string[];             // source_ids que sustentam
  scoring_rule_ref: string;
  difficulty_source_ref: string;
  license_ref?: string;
  shuffle_policy?: ShufflePolicy;
  answer_exposure_policy?: AnswerExposurePolicy;

  // Campos estendidos (QTI-like)
  item_type: ItemType;
  prompt_options: string[];             // alternativas
  correct_answer_index: number;         // índice 0-based
  rationale_text: string;               // justificativa exibida na revisão
  topic?: string;
  subject?: string;
  tags?: string[];
  estimated_time_seconds?: number;
  /** Slug da ferramenta (escala/calculadora) vinculada */
  linked_tool_slug?: string;
}

// ============================================================
// Flashcard — espelha flashcard.schema.json
// ============================================================

export interface SpacedRepetitionState {
  box: number;                          // 1-7 (Leitner)
  next_review_at?: string;
  last_reviewed_at?: string;
  success_count: number;
  fail_count: number;
}

export interface Flashcard {
  schema_version: "0.1.0";
  canonical_id: string;
  version: string;
  status: EducationStatus;
  updated_at: string;
  provenance_refs: string[];

  learning_objective_ref: string;
  front_text: string;
  back_text: string;
  rationale_claim_refs: string[];
  evidence_refs: string[];
  topic?: string;
  subject?: string;
  tags?: string[];
  difficulty?: DifficultyLevel;
  linked_tool_slug?: string;
  spaced_repetition_state?: SpacedRepetitionState;
}

// ============================================================
// QuizDeck — coleção de AssessmentItems formando um quiz
// (derivado do template TPL-QUIZ-001)
// ============================================================

export interface QuizDeck {
  schema_version: "0.1.0";
  canonical_id: string;
  version: string;
  status: EducationStatus;
  updated_at: string;
  title: string;
  description?: string;
  topic?: string;
  subject?: string;
  /** IDs dos AssessmentItems incluídos (ordem original) */
  item_refs: string[];
  /** Tempo total limite em segundos (0 = sem limite) */
  time_limit_seconds?: number;
  /** Embaralhar questões ao iniciar */
  shuffle_items: boolean;
  /** Aplicar shuffle_policy de cada item */
  shuffle_options: boolean;
  /** Política de exposição da resposta (override por item) */
  default_answer_exposure: AnswerExposurePolicy;
  /** Nota de aprovação (0-100) */
  passing_score?: number;
  tags?: string[];
}

// ============================================================
// Simulado — quiz de prova com cronômetro
// ============================================================

export interface Simulado extends QuizDeck {
  /** Banco/órgão (ex.: CESPE, FGV, VUNESP, COREN) */
  banca?: string;
  /** Ano do edital */
  ano_edital?: number;
  /** Número de vagas */
  vagas?: number;
  /** Cargo (ex.: Enfermeiro, Técnico de Enfermagem) */
  cargo?: string;
}

// ============================================================
// Labels
// ============================================================

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  MULTIPLE_CHOICE: "Múltipla escolha",
  TRUE_FALSE: "Certo / Errado",
  MULTIPLE_RESPONSE: "Resposta múltipla",
  FILL_BLANK: "Preencher lacuna",
  ORDERING: "Ordenação",
  CASE_BASED: "Baseado em caso clínico",
};

export const SHUFFLE_POLICY_LABELS: Record<ShufflePolicy, string> = {
  SHUFFLE_ALL: "Embaralhar todas as opções",
  SHUFFLE_KEEP_LAST: "Embaralhar exceto a última",
  NO_SHUFFLE: "Não embaralhar",
};

export const ANSWER_EXPOSURE_LABELS: Record<AnswerExposurePolicy, string> = {
  IMMEDIATE: "Imediata (ao selecionar)",
  ON_SUBMIT: "Ao finalizar",
  ON_REVIEW: "Apenas na revisão",
  NEVER: "Nunca (prova oficial)",
};

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  BASIC: "Básico",
  INTERMEDIATE: "Intermediário",
  ADVANCED: "Avançado",
  EXPERT: "Especialista",
};

export const DIFFICULTY_TONE: Record<DifficultyLevel, "info" | "warn" | "danger"> = {
  BASIC: "info",
  INTERMEDIATE: "info",
  ADVANCED: "warn",
  EXPERT: "danger",
};

// ============================================================
// Helpers
// ============================================================

export function generateId(prefix: string): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${ts}-${rnd}`;
}

export function createEmptyAssessmentItem(): AssessmentItem {
  return {
    schema_version: "0.1.0",
    canonical_id: `ASMT-${generateId("NEW")}`,
    version: "1.0.0",
    status: "CANDIDATE",
    updated_at: new Date().toISOString().slice(0, 10),
    provenance_refs: [],
    learning_objective_ref: "",
    prompt_key: "",
    answer_key_ref: "",
    rationale_claim_refs: [],
    evidence_refs: [],
    scoring_rule_ref: "SR-CORRECT-1",
    difficulty_source_ref: "DF-MEDIUM",
    shuffle_policy: "SHUFFLE_ALL",
    answer_exposure_policy: "ON_SUBMIT",
    item_type: "MULTIPLE_CHOICE",
    prompt_options: ["", ""],
    correct_answer_index: 0,
    rationale_text: "",
  };
}

export function createEmptyFlashcard(): Flashcard {
  return {
    schema_version: "0.1.0",
    canonical_id: `FC-${generateId("NEW")}`,
    version: "1.0.0",
    status: "CANDIDATE",
    updated_at: new Date().toISOString().slice(0, 10),
    provenance_refs: [],
    learning_objective_ref: "",
    front_text: "",
    back_text: "",
    rationale_claim_refs: [],
    evidence_refs: [],
    difficulty: "BASIC",
    spaced_repetition_state: { box: 1, success_count: 0, fail_count: 0 },
  };
}

export function createEmptyQuizDeck(): QuizDeck {
  return {
    schema_version: "0.1.0",
    canonical_id: `QD-${generateId("NEW")}`,
    version: "1.0.0",
    status: "CANDIDATE",
    updated_at: new Date().toISOString().slice(0, 10),
    title: "",
    description: "",
    item_refs: [],
    shuffle_items: true,
    shuffle_options: true,
    default_answer_exposure: "ON_SUBMIT",
    passing_score: 70,
  };
}
