
export type CuriosityMeta = {
  slug: string;
  title: string;
  category: string;
  source_package: string;
  section_count: number;
  reference_count: number;
  content_status: "BLOCKED_SOURCE" | "NEEDS_REVIEW" | string;
  review_reason: string | null;
  updated_at: string;
};

export type CuriosityComponentItem = {
  title?: string;
  text?: string;
  bullets?: string[];
  q?: string;
  paragraphs?: string[];
  k?: string;
  f?: string;
  time?: string;
};

export type CuriosityComponent = {
  type: "checkgrid" | "callout" | "faq" | "pair" | "stats" | "evidence" | "cards" | "timeline" | "conflict" | "quote";
  items?: CuriosityComponentItem[];
  text?: string;
  label?: string;
  variant?: string;
  cite?: string;
  cols?: number;
  compact?: boolean;
};

export type CuriositySection = {
  id: string;
  title: string;
  paragraphs: string[];
  sources: string[];
  components: CuriosityComponent[];
};

export type CuriosityContent = {
  slug: string;
  title: string;
  subtitle?: string;
  hero_lead?: string;
  seo_description?: string;
  category: string;
  period?: string;
  region?: string;
  intro?: { lead?: string; context?: string; bullets?: string[] };
  sections: CuriositySection[];
  references: { id: string }[];
  related_slugs?: string[];
  summary_items?: unknown[];
  top_ids?: string[];
};

export type CuriosityRecord = CuriosityMeta & {
  source_sha256: string | null;
  html_source_sha256: string | null;
  content: CuriosityContent;
};

export type CuriositySource = {
  source_id: string;
  organization: string | null;
  title: string | null;
  source_year: string | null;
  url: string | null;
  doi: string | null;
  rights_status: string | null;
  web_status: string | null;
  validated_at: string | null;
};
