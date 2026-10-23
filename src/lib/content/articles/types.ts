/** Contrato de uma entrada do catálogo de artigo. */
export type ArticleEntry = {
  slug: string;
  title: string;
  /** Título do <title> e do headline do JSON-LD. */
  seoTitle: string;
  description: string;
  eyebrow: string;
  lead: string;
  toc: readonly (readonly [string, string])[];
  dateModified: string;
  /** Ângulo do schema.org, quando o artigo não é biografia. */
  schema?: Record<string, unknown>;
  section: string;
};
