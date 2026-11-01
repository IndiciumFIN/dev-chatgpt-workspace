/**
 * Tipos canônicos para Currículo profissional.
 *
 * Espelho direto de:
 *   _archive/download/cko-skeletons/03-contratos-canonicos/bibliotecas-e-conteudo/curriculum.schema.json
 *
 * O schema deriva de `learning_resource.schema.json` (resource_type=CURRICULUM).
 * Todos os campos obrigatórios do schema são obrigatórios aqui.
 */

// ============================================================
// Status (igual ao dos outros contratos CKO)
// ============================================================

export type CurriculumStatus =
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

export type PrivacyProfile =
  | "PUBLIC"
  | "PROFESSIONAL_NETWORK"
  | "INSTITUTIONAL"
  | "PRIVATE";

export type ProjectionTarget =
  | "LATTES"
  | "ABNT_14724"
  | "EINF"
  | "LINKEDIN"
  | "PRINT_PDF";

// ============================================================
// Owner (dados pessoais)
// ============================================================

export type ProfessionalIdType =
  | "COREN"
  | "CRM"
  | "CRF"
  | "CRFA"
  | "CRO"
  | "CFE"
  | "OTHER";

export interface OwnerAddress {
  city?: string;
  state?: string;
  country?: string;
}

export interface CurriculumOwner {
  full_name: string;
  preferred_name?: string;
  professional_id: string;        // ex.: "COREN-SP 123456"
  professional_id_type?: ProfessionalIdType;
  birth_date?: string;            // ISO date
  nationality?: string;
  email?: string;
  phone?: string;
  orcid?: string;                  // ex.: "0000-0002-1234-5678"
  lattes_id?: string;
  linkedin_url?: string;
  address?: OwnerAddress;
}

// ============================================================
// Education (formação acadêmica)
// ============================================================

export type EducationDegree =
  | "TECHNICAL"
  | "GRADUATION"
  | "SPECIALIZATION"
  | "MBA"
  | "MASTER"
  | "DOCTORATE"
  | "POSTDOC"
  | "RESIDENCY"
  | "FELLOWSHIP"
  | "OTHER";

export type EducationStatus = "ONGOING" | "COMPLETED" | "ABANDONED";

export interface Education {
  id: string;
  degree: EducationDegree;
  field: string;
  institution: string;
  start_date: string;             // ISO date
  end_date?: string;
  status: EducationStatus;
  advisor?: string;
  thesis_title?: string;
  /** Source ID (vincula ao bloco Pesquisa) que atesta o diploma */
  source_id?: string;
}

// ============================================================
// Experience (experiência profissional)
// ============================================================

export type ExperienceStatus = "CURRENT" | "PAST";

export interface Experience {
  id: string;
  role: string;
  institution: string;
  department?: string;
  start_date: string;
  end_date?: string;
  status: ExperienceStatus;
  workload_hours_week?: number;
  description?: string;
  /** Source ID do atestado/carta */
  source_id?: string;
}

// ============================================================
// Certification
// ============================================================

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  expiry_date?: string;
  valid_until?: string;
  registry_number?: string;
  source_id?: string;
}

// ============================================================
// Skill
// ============================================================

export type SkillCategory =
  | "CLINICAL"
  | "TECHNICAL"
  | "MANAGEMENT"
  | "COMMUNICATION"
  | "RESEARCH"
  | "EDUCATION"
  | "DIGITAL"
  | "OTHER";

export type SkillLevel = "BASIC" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  evidence_ref?: string;
}

// ============================================================
// Language
// ============================================================

export type LanguageProficiency =
  | "NONE"
  | "BASIC"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "FLUENT"
  | "NATIVE";

export interface Language {
  id: string;
  language: string;
  speaking: LanguageProficiency;
  writing: LanguageProficiency;
  reading: LanguageProficiency;
  certification_ref?: string;
}

// ============================================================
// Award
// ============================================================

export interface Award {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description?: string;
}

// ============================================================
// Membership
// ============================================================

export type MembershipStatus = "ACTIVE" | "INACTIVE";

export interface Membership {
  id: string;
  organization: string;
  role: string;
  start_date: string;
  end_date?: string;
  status: MembershipStatus;
}

// ============================================================
// Event participation
// ============================================================

export type EventType =
  | "CONGRESS"
  | "SEMINAR"
  | "WORKSHOP"
  | "COURSE"
  | "LECTURE"
  | "PANEL"
  | "OTHER";

export type EventRole =
  | "ATTENDEE"
  | "SPEAKER"
  | "ORGANIZER"
  | "PANELIST"
  | "INSTRUCTOR";

export interface EventParticipation {
  id: string;
  event_name: string;
  event_type?: EventType;
  role: EventRole;
  date: string;
  workload_hours?: number;
  source_id?: string;
}

// ============================================================
// Curriculum (entidade raiz)
// ============================================================

export interface Curriculum {
  // Campos canônicos herdados de learning_resource
  schema_version: "0.1.0";
  canonical_id: string;
  version: string;
  status: CurriculumStatus;
  updated_at: string;
  provenance_refs: string[];
  canonical_topic_ids: string[];
  resource_type: "CURRICULUM";
  projection_profile_ref: string;
  source_claim_ids: string[];
  privacy_profile: PrivacyProfile;
  evaluation_contract_ref?: string;

  // Campos específicos do curriculum
  owner: CurriculumOwner;
  summary: string;
  education_refs: Education[];
  experience_refs: Experience[];
  /** IDs de Reference (citações) do bloco Pesquisa */
  publication_refs: string[];
  certification_refs: Certification[];
  skill_refs: Skill[];
  language_refs: Language[];
  award_refs?: Award[];
  membership_refs?: Membership[];
  event_participation_refs?: EventParticipation[];
  projection_target: ProjectionTarget;
}

// ============================================================
// Labels (PT-BR)
// ============================================================

export const DEGREE_LABELS: Record<EducationDegree, string> = {
  TECHNICAL: "Curso Técnico",
  GRADUATION: "Graduação",
  SPECIALIZATION: "Especialização (Lato Sensu)",
  MBA: "MBA",
  MASTER: "Mestrado (Stricto Sensu)",
  DOCTORATE: "Doutorado",
  POSTDOC: "Pós-Doutorado",
  RESIDENCY: "Residência",
  FELLOWSHIP: "Fellowship",
  OTHER: "Outro",
};

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  CLINICAL: "Clínica",
  TECHNICAL: "Técnica",
  MANAGEMENT: "Gestão",
  COMMUNICATION: "Comunicação",
  RESEARCH: "Pesquisa",
  EDUCATION: "Educação",
  DIGITAL: "Digital",
  OTHER: "Outra",
};

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  BASIC: "Básico",
  INTERMEDIATE: "Intermediário",
  ADVANCED: "Avançado",
  EXPERT: "Especialista",
};

export const LANGUAGE_PROFICIENCY_LABELS: Record<LanguageProficiency, string> = {
  NONE: "Nenhum",
  BASIC: "Básico",
  INTERMEDIATE: "Intermediário",
  ADVANCED: "Avançado",
  FLUENT: "Fluente",
  NATIVE: "Nativo",
};

export const PROJECTION_TARGET_LABELS: Record<ProjectionTarget, string> = {
  LATTES: "Plataforma Lattes",
  ABNT_14724: "ABNT NBR 14724 (trabalho acadêmico)",
  EINF: "e-Infraestrutura",
  LINKEDIN: "LinkedIn",
  PRINT_PDF: "PDF para impressão",
};

export const PRIVACY_PROFILE_LABELS: Record<PrivacyProfile, string> = {
  PUBLIC: "Público",
  PROFESSIONAL_NETWORK: "Rede profissional",
  INSTITUTIONAL: "Institucional",
  PRIVATE: "Privado",
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  CONGRESS: "Congresso",
  SEMINAR: "Seminário",
  WORKSHOP: "Workshop",
  COURSE: "Curso",
  LECTURE: "Palestra",
  PANEL: "Mesa-redonda",
  OTHER: "Outro",
};

export const EVENT_ROLE_LABELS: Record<EventRole, string> = {
  ATTENDEE: "Participante",
  SPEAKER: "Palestrante",
  ORGANIZER: "Organizador",
  PANELIST: "Convidado de mesa",
  INSTRUCTOR: "Instrutor",
};

// ============================================================
// Helpers
// ============================================================

/** Gera ID estável baseado em timestamp + aleatório. */
export function generateId(prefix: string): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${ts}-${rnd}`;
}

/** Cria um Curriculum vazio no estado CANDIDATE. */
export function createEmptyCurriculum(): Curriculum {
  return {
    schema_version: "0.1.0",
    canonical_id: `CV-${generateId("NEW")}`,
    version: "1.0.0",
    status: "CANDIDATE",
    updated_at: new Date().toISOString().slice(0, 10),
    provenance_refs: [],
    canonical_topic_ids: [],
    resource_type: "CURRICULUM",
    projection_profile_ref: "TPL-CV-001",
    source_claim_ids: [],
    privacy_profile: "PROFESSIONAL_NETWORK",
    owner: {
      full_name: "",
      professional_id: "",
    },
    summary: "",
    education_refs: [],
    experience_refs: [],
    publication_refs: [],
    certification_refs: [],
    skill_refs: [],
    language_refs: [],
    projection_target: "LATTES",
  };
}
