export type ToolKind = "escala" | "calculadora";

export type Choice = { value: number; label: string };

export type Criterion = {
  id: string;
  label: string;
  help: string;
  choices: Choice[];
};

export type NumericField = {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
};

export type SelectField = {
  id: string;
  label: string;
  options: Choice[];
};

export type MetaField = {
  id: string;
  label: string;
  options: { value: string; label: string }[];
};

export type Band = {
  min: number;
  max: number;
  label: string;
  tone: "ok" | "info" | "warn" | "danger";
  note: string;
  nanda: string[];
};

export type OutputSpec = { id: string; label: string; unit: string; digits: number };

export type ComputeResult = { outputs: Record<string, number>; texts?: Record<string, string> } | { error: string };

export type ClinicalTool = {
  slug: string;
  kind: ToolKind;
  category: string;
  title: string;
  lead: string;
  criteria?: Criterion[];
  fields?: NumericField[];
  selects?: SelectField[];
  metaFields?: MetaField[];
  outputs?: OutputSpec[];
  bandFrom?: string;
  bands?: Band[];
  nandaMode: "sugerir" | "nao-fechar";
  howTo: string[];
  faqs: { q: string; a: string }[];
  references: string[];
  related: string[];
  version?: string;
  evidence?: string;
  specific?: string[];
  /** Candidata fica fora do menu até homologação humana. */
  publicacao?: "candidata" | "publicada";
  holds?: string[];
  sourceIds?: string[];
  status?: string;
};

export const disclaimer =
  "Cálculo e escore têm caráter consultivo e didático. Confira a prescrição, o protocolo da instituição e as referências antes de qualquer conduta. A decisão permanece com a equipe responsável.";
