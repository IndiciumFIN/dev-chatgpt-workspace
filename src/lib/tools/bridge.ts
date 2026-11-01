import type { Band, ClinicalTool, ToolKind } from "@/lib/tools/types";

export type ToolCover = {
  slug: string;
  kind: string;
  title: string;
  lead: string;
  category: string | null;
  nandaMode: string | null;
  bandFrom: string | null;
  evidence: string | null;
  version: string | null;
};

export type ToolSheet = {
  cover: ToolCover;
  criteria: { id: string; label: string; help: string; position: number }[];
  choices: { criterionId: string; value: unknown; label: string; position: number }[];
  fields: { id: string; label: string; unit: string; min: unknown; max: unknown; step: unknown; position: number }[];
  selects: { id: string; label: string; position: number }[];
  selectOptions: { selectId: string; value: unknown; label: string; position: number }[];
  metas: { id: string; label: string; position: number }[];
  metaOptions: { metaId: string; value: string; label: string; position: number }[];
  outputs: { id: string; label: string; unit: string; digits: unknown; position: number }[];
  bands: { min: unknown; max: unknown; label: string; tone: string; note: string }[];
  nanda: { min: unknown; label: string }[];
  references: { citation: string; position: number }[];
  steps: { body: string; position: number }[];
  faqs: { question: string; answer: string; position: number }[];
  related: { slug: string; position: number }[];
  specific: { body: string; position: number }[];
};

function num(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function byPosition<T extends { position: number }>(rows: T[]) {
  return [...rows].sort((a, b) => a.position - b.position);
}

function toneOf(value: string): Band["tone"] {
  if (value === "ok" || value === "info" || value === "warn" || value === "danger") return value;
  return "info";
}

export function hasStoredSheet(sheet: Pick<ToolSheet, "criteria" | "fields" | "selects">) {
  return sheet.criteria.length + sheet.fields.length + sheet.selects.length > 0;
}

export function assembleTool(sheet: ToolSheet, fallback?: ClinicalTool): ClinicalTool | null {
  const kind: ToolKind | null = sheet.cover.kind === "escala" || sheet.cover.kind === "calculadora" ? sheet.cover.kind : fallback?.kind ?? null;
  if (!kind) return null;
  const nandaMode = sheet.cover.nandaMode === "sugerir" || sheet.cover.nandaMode === "nao-fechar" ? sheet.cover.nandaMode : fallback?.nandaMode ?? "nao-fechar";
  const criteria = byPosition(sheet.criteria).map((criterion) => ({
    id: criterion.id,
    label: criterion.label,
    help: criterion.help,
    choices: byPosition(sheet.choices.filter((choice) => choice.criterionId === criterion.id)).map((choice) => ({
      value: num(choice.value),
      label: choice.label,
    })),
  }));
  const fields = byPosition(sheet.fields).map((field) => ({
    id: field.id,
    label: field.label,
    unit: field.unit,
    min: num(field.min),
    max: num(field.max),
    step: num(field.step),
  }));
  const selects = byPosition(sheet.selects).map((field) => ({
    id: field.id,
    label: field.label,
    options: byPosition(sheet.selectOptions.filter((option) => option.selectId === field.id)).map((option) => ({
      value: num(option.value),
      label: option.label,
    })),
  }));
  const metaFields = byPosition(sheet.metas).map((field) => ({
    id: field.id,
    label: field.label,
    options: byPosition(sheet.metaOptions.filter((option) => option.metaId === field.id)).map((option) => ({
      value: option.value,
      label: option.label,
    })),
  }));
  const outputs = byPosition(sheet.outputs).map((output) => ({
    id: output.id,
    label: output.label,
    unit: output.unit,
    digits: num(output.digits),
  }));
  const bands = [...sheet.bands]
    .sort((a, b) => num(a.min) - num(b.min))
    .map((band) => ({
      min: num(band.min),
      max: num(band.max),
      label: band.label,
      tone: toneOf(band.tone),
      note: band.note,
      nanda: sheet.nanda.filter((item) => num(item.min) === num(band.min)).map((item) => item.label),
    }));
  return {
    slug: sheet.cover.slug,
    kind,
    category: sheet.cover.category || fallback?.category || "",
    title: sheet.cover.title,
    lead: sheet.cover.lead,
    criteria: criteria.length ? criteria : undefined,
    fields: fields.length ? fields : undefined,
    selects: selects.length ? selects : undefined,
    metaFields: metaFields.length ? metaFields : undefined,
    outputs: outputs.length ? outputs : undefined,
    bandFrom: sheet.cover.bandFrom ?? fallback?.bandFrom,
    bands: bands.length ? bands : undefined,
    nandaMode,
    howTo: byPosition(sheet.steps).map((step) => step.body),
    faqs: byPosition(sheet.faqs).map((faq) => ({ q: faq.question, a: faq.answer })),
    references: byPosition(sheet.references).map((item) => item.citation),
    related: byPosition(sheet.related).map((item) => item.slug),
    version: sheet.cover.version ?? undefined,
    evidence: sheet.cover.evidence ?? undefined,
    specific: sheet.specific.length ? byPosition(sheet.specific).map((item) => item.body) : undefined,
  };
}
