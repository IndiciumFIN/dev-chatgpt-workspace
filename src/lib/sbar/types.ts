/**
 * Tipos canônicos para o bloco SBAR (Passagem de Plantão).
 *
 * Espelho direto de:
 *   src/data/contracts/cko-schemas/sbar_handoff.schema.json
 * (derivado de safety_check.schema.json).
 */

export type SbarStatus =
  | "CANDIDATE" | "DRAFT" | "SOURCE_QUALIFIED" | "EVIDENCE_BOUND"
  | "REVIEW_REQUIRED" | "HOLD_HUMAN" | "ASSURED"
  | "ELIGIBLE_FOR_RELEASE" | "RELEASED" | "RETIRED";

export type SbarSeverity = "INFO" | "CAUTION" | "WARNING" | "BLOCKER";

export type Shift = "MORNING" | "AFTERNOON" | "NIGHT" | "CONTINUOUS";

export type PatientSex = "F" | "M" | "UNKNOWN";

export type IsolationPrecaution = "CONTACT" | "DROPLET" | "AIRBORNE" | "STANDARD";

export type FallRisk = "LOW" | "MEDIUM" | "HIGH";

export type PressureInjuryRisk = "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH";

export interface VitalSigns {
  pas?: number; pad?: number; fc?: number; fr?: number; tax?: number; spo2?: number;
  glasgow?: number;
}

export interface HandoffContext {
  from_shift: Shift;
  to_shift: Shift;
  location: string;
  handoff_at: string;       // ISO date-time
  from_professional?: string;
  to_professional?: string;
}

export interface Situation {
  patient_id: string;
  patient_age?: number;
  patient_sex?: PatientSex;
  reason: string;
  allergies?: string[];
  isolation_precautions?: IsolationPrecaution[];
}

export interface Background {
  clinical_history: string;
  comorbidities?: string[];
  medications_current?: string[];
  vital_signs_last?: VitalSigns;
  lines_drains?: string[];
}

export interface RiskAssessments {
  braden_score?: number;
  morse_score?: number;
  fall_risk?: FallRisk;
  pressure_injury_risk?: PressureInjuryRisk;
}

export interface Assessment {
  current_status: string;
  pending_results?: string[];
  risk_assessments?: RiskAssessments;
}

export interface Recommendation {
  plan: string;
  medications_to_administer?: string[];
  procedures_scheduled?: string[];
  alerts_to_monitor?: string[];
  escalation_criteria?: string;
}

export interface CriticalItem {
  item: string;
  checked: boolean;
  notes?: string;
}

export interface SbarHandoff {
  schema_version: "0.1.0";
  canonical_id: string;
  version: string;
  status: SbarStatus;
  updated_at: string;
  provenance_refs: string[];

  severity: SbarSeverity;
  disclosure_policy: string;

  handoff_context: HandoffContext;
  situation: Situation;
  background: Background;
  assessment: Assessment;
  recommendation: Recommendation;
  critical_items?: CriticalItem[];
}

// Labels
export const SHIFT_LABELS: Record<Shift, string> = {
  MORNING: "Manhã", AFTERNOON: "Tarde", NIGHT: "Noite", CONTINUOUS: "Contínuo",
};
export const SEVERITY_LABELS: Record<SbarSeverity, string> = {
  INFO: "Rotina", CAUTION: "Atenção", WARNING: "Alerta", BLOCKER: "Crítico",
};
export const SEVERITY_TONE: Record<SbarSeverity, "info" | "warn" | "danger"> = {
  INFO: "info", CAUTION: "warn", WARNING: "warn", BLOCKER: "danger",
};
export const SEX_LABELS: Record<PatientSex, string> = { F: "Feminino", M: "Masculino", UNKNOWN: "Não informado" };
export const ISOLATION_LABELS: Record<IsolationPrecaution, string> = {
  CONTACT: "Contato", DROPLET: "Gotículas", AIRBORNE: "Aerossóis", STANDARD: "Padrão",
};
export const FALL_RISK_LABELS: Record<FallRisk, string> = { LOW: "Baixo", MEDIUM: "Médio", HIGH: "Alto" };
export const PRESSURE_RISK_LABELS: Record<PressureInjuryRisk, string> = {
  LOW: "Baixo", MODERATE: "Moderado", HIGH: "Alto", VERY_HIGH: "Muito alto",
};

export function generateId(prefix: string): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${ts}-${rnd}`;
}

export function createEmptyHandoff(): SbarHandoff {
  return {
    schema_version: "0.1.0",
    canonical_id: `SBAR-${generateId("NEW")}`,
    version: "1.0.0",
    status: "CANDIDATE",
    updated_at: new Date().toISOString().slice(0, 10),
    provenance_refs: [],
    severity: "INFO",
    disclosure_policy: "PROFESSIONAL",
    handoff_context: {
      from_shift: "MORNING",
      to_shift: "AFTERNOON",
      location: "",
      handoff_at: new Date().toISOString(),
    },
    situation: {
      patient_id: "",
      reason: "",
    },
    background: {
      clinical_history: "",
    },
    assessment: {
      current_status: "",
    },
    recommendation: {
      plan: "",
    },
    critical_items: [
      { item: "Paciente identificado por pulseira", checked: false },
      { item: "Alergias conferidas", checked: false },
      { item: "Bombas de infusão conferidas", checked: false },
      { item: "Drenos e sondas patentes", checked: false },
      { item: "Sinais vitais atuais registrados", checked: false },
      { item: "Medicações pendentes comunicadas", checked: false },
    ],
  };
}
