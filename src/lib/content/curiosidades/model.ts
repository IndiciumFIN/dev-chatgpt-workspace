/**
 * Contrato da projeção editorial CE Curiosidades v1, usando o MEM do blog.
 * Fonte do conteúdo: ce_curiosidades_v1.pages.content_json (Supabase, READ_ONLY).
 * Sem carregamento remoto neste módulo e SEM publicação automática.
 */
export type CuriosityBlockType =
  | "cards" | "pair" | "stats" | "timeline" | "faq" | "callout"
  | "evidence" | "conflict" | "checkgrid" | "quote";

export type CuriosityBlock = {
  type: CuriosityBlockType | string;
  text?: string;
  label?: string;
  cite?: string;
  variant?: string;
  cols?: number;
  compact?: boolean;
  items?: Array<{
    title?: string;
    text?: string;
    time?: string;
    k?: string;
    f?: string;
    v?: string;
    q?: string;
    paragraphs?: string[];
    bullets?: string[];
  }>;
};

export type CuriositySection = {
  id: string;
  title: string;
  paragraphs: string[];
  sources: string[];
  components: CuriosityBlock[];
};

export type CuriosityContent = {
  slug: string;
  title: string;
  subtitle?: string;
  hero_lead: string;
  seo_description: string;
  category: string;
  period?: string;
  region?: string;
  intro: { lead?: string; bullets?: string[]; context?: string };
  sections: CuriositySection[];
  references: { id: string }[];
  related_slugs?: string[];
  summary_items?: string[];
};

export type CuriositySource = {
  source_id: string;
  title: string;
  organization?: string;
  url?: string;
  doi?: string;
  rights_status?: string;
  web_status?: string;
};

export type CuriosityPublicationGate = {
  /** Decisão explícita do fluxo editorial, jamais inferida do conteúdo. */
  editorialApproved: boolean;
  sourceValidated: boolean;
  rightsCleared: boolean;
  mediaCleared: boolean;
  accessibilityPassed: boolean;
  visualPassed: boolean;
  ownerApproved: boolean;
};

export type CuriosityRow = {
  slug: string;
  title: string;
  content_json: CuriosityContent;
  content_status: string;
  source_sha256?: string | null;
};

export const CURIOSITY_BLOCK_TYPES: readonly CuriosityBlockType[] = [
  "cards", "pair", "stats", "timeline", "faq", "callout",
  "evidence", "conflict", "checkgrid", "quote",
] as const;

const blockTypes = new Set<string>(CURIOSITY_BLOCK_TYPES);

/** A validação é fail-closed. Não substitui revisão clínica/editorial. */
export function validateCuriosityContent(
  row: CuriosityRow,
  sources: ReadonlyMap<string, CuriositySource>,
): string[] {
  const errors: string[] = [];
  const page = row.content_json;
  if (!page || page.slug !== row.slug || !page.title || !page.hero_lead) {
    errors.push("HEADER_OR_SLUG_INVALID");
    return errors;
  }
  if (!Array.isArray(page.sections) || page.sections.length === 0) errors.push("SECTIONS_MISSING");
  if (!Array.isArray(page.references) || page.references.length === 0) errors.push("REFERENCES_MISSING");
  const referenceIds = new Set((page.references ?? []).map((r) => r.id));
  if (referenceIds.size !== (page.references ?? []).length) errors.push("DUPLICATE_REFERENCE");
  for (const id of referenceIds) if (!sources.has(id)) errors.push("SOURCE_NOT_FOUND:" + id);
  const sectionIds = new Set<string>();
  for (const section of page.sections ?? []) {
    if (!section.id || sectionIds.has(section.id)) errors.push("DUPLICATE_OR_INVALID_SECTION:" + section.id);
    sectionIds.add(section.id);
    if (!section.title || !Array.isArray(section.paragraphs)) errors.push("SECTION_INVALID:" + section.id);
    for (const id of section.sources ?? []) {
      if (!referenceIds.has(id) || !sources.has(id)) errors.push("SECTION_CITATION_UNBOUND:" + section.id + ":" + id);
    }
    for (const block of section.components ?? []) {
      if (!blockTypes.has(block.type)) errors.push("UNSUPPORTED_COMPONENT:" + section.id + ":" + block.type);
      if (["cards", "pair", "stats", "timeline", "faq", "conflict", "checkgrid"].includes(block.type)
        && (!Array.isArray(block.items) || block.items.length === 0)) {
        errors.push("EMPTY_COMPONENT:" + section.id + ":" + block.type);
      }
      if (["callout", "evidence", "quote"].includes(block.type) && !block.text) {
        errors.push("EMPTY_COMPONENT:" + section.id + ":" + block.type);
      }
    }
  }
  return errors;
}

export function mayPublishCuriosity(
  row: CuriosityRow,
  sources: ReadonlyMap<string, CuriositySource>,
  gates: CuriosityPublicationGate,
): boolean {
  // Registros do banco em NEEDS_REVIEW / BLOCKED_SOURCE nunca ganham acesso público.
  if (row.content_status !== "APPROVED") return false;
  if (validateCuriosityContent(row, sources).length > 0) return false;
  return Object.values(gates).every((passed) => passed === true);
}

/**
 * A base histórica contém FAQs com um parágrafo representado como string,
 * em vez de string[]. Normalizar somente na projeção e registrar FIND na
 * auditoria; nunca reescrever o snapshot de origem silenciosamente.
 */
export function normalizeFaqParagraphs(value: unknown): string[] {
  if (typeof value === "string") return value.trim() ? [value] : [];
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  return [];
}

export function curiosityReferenceNumbers(page: CuriosityContent): Map<string, number> {
  return new Map((page.references ?? []).map((item, idx) => [item.id, idx + 1]));
}

export function curiosityToc(page: CuriosityContent) {
  return [
    { id: "introducao", label: "Introdução" },
    ...(page.sections ?? []).map((s) => ({ id: s.id, label: s.title })),
    { id: "referencias", label: "Referências" },
  ];
}
