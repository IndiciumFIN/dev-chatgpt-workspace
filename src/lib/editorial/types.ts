/**
 * Tipos canônicos para o bloco Curiosidades de Enfermagem.
 * Espelho direto de: src/data/contracts/cko-schemas/fun_fact.schema.json
 */

export type FunFactStatus =
  | "CANDIDATE" | "DRAFT" | "SOURCE_QUALIFIED" | "EVIDENCE_BOUND"
  | "REVIEW_REQUIRED" | "HOLD_HUMAN" | "ASSURED"
  | "ELIGIBLE_FOR_RELEASE" | "RELEASED" | "RETIRED";

export type FactType =
  | "HISTORICAL" | "BIOGRAPHICAL" | "SCIENTIFIC" | "CULTURAL"
  | "STATISTICAL" | "ETYMOLOGICAL" | "PROFESSIONAL" | "OTHER";

export type FactCategory =
  | "HISTORY" | "PIONEERS" | "WARS" | "BRAZIL" | "SPECIALTIES"
  | "EDUCATION" | "TECHNOLOGY" | "PROFESSION" | "FUNDS_AND_AWARDS" | "OTHER";

export type RightsStatus = "UNKNOWN" | "CLEAR" | "LICENSED" | "HOLD" | "PUBLIC_DOMAIN";

export interface FunFact {
  schema_version: "0.1.0";
  canonical_id: string;
  version: string;
  status: FunFactStatus;
  updated_at: string;
  provenance_refs: string[];
  title: string;
  body_text: string;
  fact_type: FactType;
  category: FactCategory;
  year_ref?: number;
  person_ref?: string;
  source_id: string;
  rights_status: RightsStatus;
  tags?: string[];
  estimated_reading_seconds?: number;
}

export const FACT_TYPE_LABELS: Record<FactType, string> = {
  HISTORICAL: "Histórico", BIOGRAPHICAL: "Biográfico", SCIENTIFIC: "Científico",
  CULTURAL: "Cultural", STATISTICAL: "Estatístico", ETYMOLOGICAL: "Etimológico",
  PROFESSIONAL: "Profissional", OTHER: "Outro",
};

export const FACT_CATEGORY_LABELS: Record<FactCategory, string> = {
  HISTORY: "História da enfermagem", PIONEERS: "Pioneiras e pioneiros",
  WARS: "Enfermagem em guerras", BRAZIL: "Enfermagem no Brasil",
  SPECIALTIES: "Especialidades", EDUCATION: "Educação",
  TECHNOLOGY: "Tecnologia", PROFESSION: "A profissão",
  FUNDS_AND_AWARDS: "Prêmios e títulos", OTHER: "Outros",
};

export const RIGHTS_LABELS: Record<RightsStatus, string> = {
  UNKNOWN: "Desconhecido", CLEAR: "Livre", LICENSED: "Licenciado",
  HOLD: "Em hold", PUBLIC_DOMAIN: "Domínio público",
};

export function generateId(prefix: string): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${ts}-${rnd}`;
}
