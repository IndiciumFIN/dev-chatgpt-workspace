/**
 * Tipos canônicos para o Fórum de Enfermagem.
 * Espelho direto de: src/data/contracts/cko-schemas/forum_thread.schema.json
 */

export type ForumStatus =
  | "CANDIDATE" | "DRAFT" | "SOURCE_QUALIFIED" | "EVIDENCE_BOUND"
  | "REVIEW_REQUIRED" | "HOLD_HUMAN" | "ASSURED"
  | "ELIGIBLE_FOR_RELEASE" | "RELEASED" | "RETIRED";

export type AuthorRole = "NURSE" | "TECHNICIAN" | "STUDENT" | "PROFESSOR" | "COORDINATOR" | "OTHER";

export type ForumCategory =
  | "CLINICAL_PRACTICE" | "MANAGEMENT" | "EDUCATION" | "RESEARCH"
  | "CAREER" | "ETHICS" | "WELLBEING" | "TECHNOLOGY" | "GENERAL";

export type Visibility = "PUBLIC" | "PROFESSIONALS_ONLY" | "INSTITUTIONAL";

export type ModerationStatus = "PENDING" | "APPROVED" | "FLAGGED" | "HIDDEN" | "DELETED";

export interface ForumReply {
  id: string;
  author_id: string;
  author_display_name?: string;
  author_role?: AuthorRole;
  body_text: string;
  posted_at: string;             // ISO date-time
  moderation_status: ModerationStatus;
  parent_reply_id?: string;
  likes_count?: number;
}

export interface ForumThread {
  schema_version: "0.1.0";
  canonical_id: string;
  version: string;
  status: ForumStatus;
  updated_at: string;
  provenance_refs: string[];

  title: string;
  body_text: string;
  author_id: string;
  author_display_name?: string;
  author_role?: AuthorRole;
  category: ForumCategory;
  visibility: Visibility;
  moderation_status: ModerationStatus;
  tags?: string[];
  replies: ForumReply[];
  views_count?: number;
  likes_count?: number;
  pinned?: boolean;
  closed?: boolean;
}

export const AUTHOR_ROLE_LABELS: Record<AuthorRole, string> = {
  NURSE: "Enfermeiro(a)", TECHNICIAN: "Técnico(a)", STUDENT: "Estudante",
  PROFESSOR: "Professor(a)", COORDINATOR: "Coordenador(a)", OTHER: "Outro",
};

export const FORUM_CATEGORY_LABELS: Record<ForumCategory, string> = {
  CLINICAL_PRACTICE: "Prática clínica", MANAGEMENT: "Gestão", EDUCATION: "Educação",
  RESEARCH: "Pesquisa", CAREER: "Carreira", ETHICS: "Ética",
  WELLBEING: "Bem-estar", TECHNOLOGY: "Tecnologia", GENERAL: "Geral",
};

export const VISIBILITY_LABELS: Record<Visibility, string> = {
  PUBLIC: "Público", PROFESSIONALS_ONLY: "Profissionais only", INSTITUTIONAL: "Institucional",
};

export const MODERATION_LABELS: Record<ModerationStatus, string> = {
  PENDING: "Pendente", APPROVED: "Aprovado", FLAGGED: "Sinalizado",
  HIDDEN: "Oculto", DELETED: "Excluído",
};

export function generateId(prefix: string): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${ts}-${rnd}`;
}

export function createEmptyThread(authorId = "anon", authorName = "Anônimo", authorRole: AuthorRole = "NURSE"): ForumThread {
  return {
    schema_version: "0.1.0",
    canonical_id: `FT-${generateId("NEW")}`,
    version: "1.0.0",
    status: "RELEASED",
    updated_at: new Date().toISOString().slice(0, 10),
    provenance_refs: [],
    title: "",
    body_text: "",
    author_id: authorId,
    author_display_name: authorName,
    author_role: authorRole,
    category: "GENERAL",
    visibility: "PUBLIC",
    moderation_status: "APPROVED",
    tags: [],
    replies: [],
    views_count: 0,
    likes_count: 0,
    pinned: false,
    closed: false,
  };
}

/** Seed inicial com alguns tópicos de exemplo (auto-apagáveis pelo usuário). */
export const FORUM_SEED_THREADS: ForumThread[] = [
  {
    ...createEmptyThread("seed-1", "Equipe Editorial", "PROFESSOR"),
    canonical_id: "FT-SEED-001",
    title: "Bem-vindo ao Fórum de Enfermagem",
    body_text: "Este é um espaço local para discussões entre profissionais de enfermagem. Os tópicos ficam salvos apenas no seu navegador (localStorage) e podem ser exportados/importados em JSON.\n\nSugestões de uso:\n- Discussão de casos clínicos (sem identificar pacientes)\n- Dúvidas sobre protocolos e escalas\n- Compartilhar boas práticas\n- Trocar experiências de carreira e residência\n\nPara tópicos sensíveis, use a visibilidade 'Profissionais only'.",
    category: "GENERAL",
    tags: ["boas-vindas", "manual"],
    replies: [],
  },
  {
    ...createEmptyThread("seed-2", "Equipe Editorial", "PROFESSOR"),
    canonical_id: "FT-SEED-002",
    title: "Como vocês aplicam a escala de Braden na sua unidade?",
    body_text: "Gostaria de trocar experiências sobre a rotina de aplicação da escala de Braden. Na minha UTI aplicamos diariamente na admissão e a cada 48h, mas ouvi de colegas que em algumas unidades aplicam apenas na admissão.\n\nAlguém tem protocolo institucional formalizado e poderia compartilhar a frequência e os critérios de reavaliação?",
    category: "CLINICAL_PRACTICE",
    tags: ["braden", "lesao-por-pressao", "uti"],
    replies: [],
  },
];
