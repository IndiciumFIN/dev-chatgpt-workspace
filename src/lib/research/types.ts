/**
 * Tipos canônicos para o bloco "Pesquisador Científico".
 *
 * Inspirados nos schemas CKO:
 *  - `_archive/download/cko-skeletons/03-contratos-canonicos/fundamentos-e-evidencia/source.schema.json`
 *  - `_archive/download/cko-skeletons/03-contratos-canonicos/fundamentos-e-evidencia/reference.schema.json`
 *  - `_archive/download/cko-skeletons/03-contratos-canonicos/bibliotecas-e-conteudo/research_method.schema.json`
 *
 * Versão simplificada para uso client-side (localStorage). Sem SHA-256 nem
 * snapshot arquivado — esses campos ficam para o runtime CKO governado. O
 * objetivo aqui é dar ao pesquisador uma ferramenta usável hoje, com modelo
 * de dados que pode subir para o backend depois sem reshape.
 */

// ============================================================
// SOURCE (Fonte) — espelha source.schema.json
// ============================================================

export type SourceType =
  | "OFFICIAL_LAW"      // Lei, decreto, resolução (ex.: Lei 7.498/86, Resolução COFEN)
  | "REGULATOR"         // Agência reguladora (ANVISA, ANS, ANATEL)
  | "STANDARD"          // Norma técnica (ABNT NBR, ISO)
  | "TERMINOLOGY"       // Sistema terminológico (NANDA-I, SNOMED CT, LOINC)
  | "PRIMARY_STUDY"     // Estudo primário (RCT, coorte, caso-controle)
  | "GUIDELINE"         // Diretriz clínica (OMS, SBE, SBP, SBC)
  | "TEXTBOOK"          // Livro didático ou capítulo
  | "DATASET_API"       // Dataset público ou API
  | "SOFTWARE"          // Software, pacote estatístico
  | "IMAGE"             // Imagem, fotografia, ilustração
  | "INTERNAL_GOVERNED"; // Documento interno governado

export type SourceRights =
  | "UNKNOWN"
  | "PERMITTED"
  | "RESTRICTED"
  | "LICENSED"
  | "PUBLIC_DOMAIN"
  | "NOT_APPLICABLE";

export type SourceStatus =
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

/**
 * Autores no formato ABNT: SOBRENOME, Nome.
 * Ex.: "Silva, Maria Aparecida da".
 * O `surname` é usado para ordenação alfabética na citação.
 */
export interface SourceAuthor {
  surname: string;   // "Silva"
  givenName: string; // "Maria Aparecida da"
}

export interface SourceLocator {
  uri: string;        // URL canônica (DOI, ISBN, URL)
  pinpoint: string;  // p. 123; cap. 4; art. 12
}

export interface Source {
  /** ID canônico estável: ex.: "SRC-PAYEN-2001-BPS" */
  id: string;
  /** Versão do registro, incrementada a cada edição */
  version: string;
  status: SourceStatus;
  updatedAt: string; // ISO date

  source_type: SourceType;

  /** Título da obra (artigo, livro, lei) */
  title: string;
  /** Autoridade emissora (ex.: "Ministério da Saúde", "Sociedade Brasileira de Cardiologia") */
  authority: string;

  /** Autores, no formato ABNT (sobrenome primeiro). */
  authors: SourceAuthor[];

  /** Local de publicação (cidade) — ABNT exige */
  place: string;
  /** Editora — ABNT exige para livros */
  publisher?: string;
  /** Ano de publicação */
  year: string;
  /** Edição, se aplicável */
  edition?: string;

  locator: SourceLocator;
  rights: SourceRights;
  jurisdiction: string;  // "BR", "US", "International"
  retrievedAt: string;   // data de acesso

  /** Datas de vigência (para leis, normas, diretrizes) */
  effectiveFrom?: string;
  effectiveUntil?: string;

  /** Licença aplicável (CC-BY, etc.) */
  licenseRef?: string;
  /** Idioma da fonte (ISO 639-1: "pt-BR", "en", "es") */
  language: string;

  /** Resumo curto do que é a fonte (para o pesquisador lembrar) */
  notes?: string;

  /** DOI ou outro identificador persistente (ex.: 10.1590/...) */
  doi?: string;

  /** Tags livres para organizar a biblioteca */
  tags: string[];
}

// ============================================================
// REFERENCE (Citação) — espelha reference.schema.json
// ============================================================

export type CitationStyle = "ABNT_6023_2018" | "OTHER_GOVERNED";

export type CitationType =
  | "DIRECT_SHORT"      // Citação direta curta (até 3 linhas)
  | "DIRECT_LONG"       // Citação direta longa (mais de 3 linhas, recuo)
  | "PARAPHRASE"        // Paráfrase
  | "APUD"              // Citado por (fonte secundária)
  | "TRANSLATION"       // Tradução
  | "LEGAL"             // Documento legal (lei, resolução)
  | "TECHNICAL_STANDARD" // Norma técnica (ABNT, ISO)
  | "SCIENTIFIC"        // Artigo científico
  | "DATASET"           // Dataset
  | "SOFTWARE"          // Software
  | "IMAGE"             // Imagem, figura, ilustração
  | "AI_DISCLOSURE";    // Uso de IA com disclosure

export type CitationRights = "UNKNOWN" | "CLEAR" | "LICENSED" | "HOLD";

export interface Reference {
  id: string;
  /** ID da fonte (Source.id) */
  sourceId: string;
  /** Estilo de citação (atualmente só ABNT 6023:2018 está implementado) */
  citationStyle: CitationStyle;
  /** Tipo de citação */
  citationType: CitationType;
  /** Texto citado, em aspas se direta */
  citedText?: string;
  /** Página ou localização específica: "p. 45", "art. 12, caput" */
  locator: string;
  /** Data de acesso ao conteúdo */
  accessedAt: string;
  /** URI direta (caso diferente da fonte) */
  directUri?: string;
  /** Estado dos direitos de uso */
  rightsStatus: CitationRights;
  /** Para APUD: fonte secundária que citou a primária */
  secondarySourceId?: string;
  /** Para AI_DISCLOSURE: ferramenta usada (ex.: "GPT-4", "Claude 3.5") */
  aiTool?: string;
  /** Notas do pesquisador sobre esta citação */
  notes?: string;
}

// ============================================================
// RESEARCH_METHOD (Caderno de Pesquisa) — espelha research_method.schema.json
// ============================================================

export type ResearchType =
  | "QUALITATIVE"
  | "QUANTITATIVE"
  | "MIXED"
  | "REVIEW"
  | "IMPLEMENTATION"
  | "OTHER";

export type EthicsReviewPolicy =
  | "REQUIRES_HUMAN_CHECK"
  | "DOCUMENTED_NOT_APPLICABLE"
  | "APPROVED";

/**
 * Estrutura PICO para a pergunta de pesquisa.
 *  P: População/Paciente
 *  I: Intervenção/Indicador
 *  C: Comparação/Controle
 *  O: Outcome/Desfecho
 * (Para revisões sistemáticas pode haver T: Timing, S: Setting — PICO-TS)
 */
export interface PICOQuestion {
  population: string;    // P
  intervention: string;  // I
  comparison: string;    // C (pode ser vazio se não houver comparação)
  outcome: string;       // O
  timing?: string;       // T (opcional)
  setting?: string;      // S (opcional)
}

export interface ResearchMethod {
  id: string;
  version: string;
  status: SourceStatus;
  updatedAt: string;

  /** Título do projeto de pesquisa */
  title: string;
  /** Pesquisador responsável */
  researcher: string;
  /** Instituição */
  institution?: string;

  researchType: ResearchType;

  /** Pergunta PICO estruturada */
  question: PICOQuestion;
  /** Pergunta de pesquisa em linguagem natural (narrativa) */
  questionNarrative: string;

  /** Delineamento: "RCT", "coorte prospectivo", "caso-controle", etc. */
  studyDesign: string;
  /** Hipótese principal, se houver */
  hypothesis?: string;

  ethicsReviewPolicy: EthicsReviewPolicy;
  /** Número do Parecer CEP/CONEP, se aplicável */
  ethicsApprovalNumber?: string;

  /** IDs das escalas/ferramentas usadas como instrumentos (ex.: "braden", "glasgow") */
  instrumentRefs: string[];

  /** Descrição da população e amostra */
  populationSampling: string;
  /** Tamanho amostral calculado (n) */
  sampleSize?: number;
  /** Critérios de inclusão */
  inclusionCriteria?: string;
  /** Critérios de exclusão */
  exclusionCriteria?: string;

  /** Plano de análise estatística */
  analysisPlan: string;

  /** Referências a fontes cadastradas (Source.id) */
  sourceRefs: string[];
  /** Referências a citações cadastradas (Reference.id) */
  referenceRefs: string[];

  /** Engines de cálculo vinculados (slugs das ferramentas, ex.: "braden", "imc") */
  calculationEngineRefs: string[];

  /** Notas gerais */
  notes?: string;
}

// ============================================================
// Helpers de validação e constantes
// ============================================================

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  OFFICIAL_LAW: "Lei / Decreto / Resolução",
  REGULATOR: "Agência reguladora",
  STANDARD: "Norma técnica",
  TERMINOLOGY: "Sistema terminológico",
  PRIMARY_STUDY: "Estudo primário",
  GUIDELINE: "Diretriz clínica",
  TEXTBOOK: "Livro / Capítulo",
  DATASET_API: "Dataset / API",
  SOFTWARE: "Software",
  IMAGE: "Imagem / Ilustração",
  INTERNAL_GOVERNED: "Documento governado",
};

export const CITATION_TYPE_LABELS: Record<CitationType, string> = {
  DIRECT_SHORT: "Citação direta curta (≤3 linhas)",
  DIRECT_LONG: "Citação direta longa (>3 linhas, com recuo)",
  PARAPHRASE: "Paráfrase",
  APUD: "Apud (citado por)",
  TRANSLATION: "Tradução",
  LEGAL: "Documento legal",
  TECHNICAL_STANDARD: "Norma técnica",
  SCIENTIFIC: "Artigo científico",
  DATASET: "Dataset",
  SOFTWARE: "Software",
  IMAGE: "Imagem",
  AI_DISCLOSURE: "Uso de IA (disclosure)",
};

export const RESEARCH_TYPE_LABELS: Record<ResearchType, string> = {
  QUALITATIVE: "Qualitativa",
  QUANTITATIVE: "Quantitativa",
  MIXED: "Métodos mistos",
  REVIEW: "Revisão (sistemática, escopo, etc.)",
  IMPLEMENTATION: "Implementação / Tradução",
  OTHER: "Outra",
};

export const ETHICS_LABELS: Record<EthicsReviewPolicy, string> = {
  REQUIRES_HUMAN_CHECK: "Exige aprovação CEP/CONEP",
  DOCUMENTED_NOT_APPLICABLE: "Não aplicável (documentado)",
  APPROVED: "Aprovado por CEP/CONEP",
};

export const RIGHTS_LABELS: Record<SourceRights, string> = {
  UNKNOWN: "Desconhecido",
  PERMITTED: "Permitido (uso justo)",
  RESTRICTED: "Restrito",
  LICENSED: "Licenciado",
  PUBLIC_DOMAIN: "Domínio público",
  NOT_APPLICABLE: "Não aplicável",
};

/** Gera um ID estável baseado em timestamp + aleatório. */
export function generateId(prefix: string): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${ts}-${rnd}`;
}
