import { formulas } from "./formulas.ts";
import type { Band, ClinicalTool, Criterion } from "@/lib/tools/types";

export type MemoryRow = { label: string; value: string; max: string };

export type ToolSuccess = {
  ok: true;
  totalLabel: string;
  total: number;
  max?: number;
  band?: Band;
  rows: MemoryRow[];
  outputs?: { id: string; label: string; unit: string; value: number; digits: number; text?: string }[];
  steps?: string[];
};

export type ToolFailure = {
  ok: false;
  message: string;
  fieldErrors?: Record<string, string>;
  missing?: string[];
};

export function formatNumber(value: number, digits: number) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function findBand(bands: Band[] | undefined, value: number) {
  return bands?.find((band) => value >= band.min && value <= band.max);
}

function findContinuousBand(bands: Band[] | undefined, value: number) {
  const sorted = [...(bands ?? [])].sort((a, b) => a.min - b.min);
  return sorted.find((band, index) => {
    const next = sorted[index + 1];
    const adjacent = next && Math.abs(next.min - band.max - 0.01) < 1e-8;
    return value >= band.min && (adjacent ? value < next.min : value <= band.max);
  });
}

function criterionMax(criterion: Criterion) {
  return Math.max(...criterion.choices.map((choice) => choice.value));
}

export function evaluateScale(tool: ClinicalTool, answers: Record<string, number>): ToolSuccess | ToolFailure {
  const criteria = tool.criteria ?? [];
  const missing = criteria.filter((criterion) => answers[criterion.id] === undefined).map((criterion) => criterion.id);
  if (missing.length > 0) {
    return {
      ok: false,
      missing,
      message: `Faltam ${missing.length} critério${missing.length === 1 ? "" : "s"}. O escore só aparece com a escala completa.`,
    };
  }
  if (criteria.length === 0 || criteria.some((criterion) => !Number.isFinite(answers[criterion.id]) || !criterion.choices.some((choice) => choice.value === answers[criterion.id]))) {
    return { ok: false, message: "Critério ou pontuação inválida." };
  }
  const total = criteria.reduce((sum, criterion) => sum + answers[criterion.id], 0);
  if (!Number.isFinite(total)) return { ok: false, message: "Escore inválido." };
  const max = criteria.reduce((sum, criterion) => sum + criterionMax(criterion), 0);
  return {
    ok: true,
    totalLabel: "Escore",
    total,
    max,
    band: findBand(tool.bands, total),
    rows: criteria.map((criterion) => {
      const choice = criterion.choices.find((item) => item.value === answers[criterion.id]);
      return {
        label: criterion.label,
        value: `${answers[criterion.id]} · ${choice?.label ?? ""}`,
        max: String(criterionMax(criterion)),
      };
    }),
  };
}

export function evaluateFormula(tool: ClinicalTool, raw: Record<string, string>): ToolSuccess | ToolFailure {
  const values: Record<string, number> = {};
  const fieldErrors: Record<string, string> = {};
  for (const field of tool.fields ?? []) {
    const text = (raw[field.id] ?? "").trim().replace(",", ".");
    const value = Number(text);
    if (text === "" || !Number.isFinite(value)) fieldErrors[field.id] = "Informe um número.";
    else if (value < field.min || value > field.max) fieldErrors[field.id] = `Use um valor entre ${field.min} e ${field.max}.`;
    else values[field.id] = value;
  }
  for (const field of tool.selects ?? []) {
    const text = (raw[field.id] ?? "").trim();
    const value = Number(text);
    if (text === "" || !Number.isFinite(value) || !field.options.some((option) => option.value === value)) fieldErrors[field.id] = "Escolha uma opção.";
    else values[field.id] = value;
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors, message: "Revise os campos marcados antes de calcular." };
  }
  const computed = formulas[tool.slug]?.(values);
  if (!computed) return { ok: false, message: "Esta calculadora ainda não tem fórmula." };
  if ("error" in computed) return { ok: false, message: computed.error };
  if (!(tool.outputs?.length) || tool.outputs.some((output) => !Number.isFinite(computed.outputs[output.id]))) {
    return { ok: false, message: "Resultado ausente ou inválido." };
  }
  const bandKey = tool.bandFrom ? computed.outputs[tool.bandFrom] : undefined;
  if (tool.bandFrom && !Number.isFinite(bandKey)) return { ok: false, message: "Faixa sem resultado válido." };
  // IMC: os limites decimais do catálogo são exibidos com duas casas; a
  // classificação usa o valor bruto, abaixo do próximo limite inferior.
  const band = bandKey === undefined ? undefined : tool.slug === "imc"
    ? findContinuousBand(tool.bands, bandKey) : findBand(tool.bands, bandKey);
  if (tool.bandFrom && !band) return { ok: false, message: "Resultado fora das faixas suportadas." };
  const outputs = (tool.outputs ?? []).map((output) => ({
    ...output,
    value: computed.outputs[output.id],
    text: computed.texts?.[output.id],
  }));
  return {
    ok: true,
    totalLabel: outputs[0]?.label ?? "Resultado",
    total: outputs[0]?.value ?? 0,
    band,
    outputs,
    rows: [
      ...(tool.fields ?? []).map((field) => ({
        label: field.label,
        value: `${formatNumber(values[field.id], field.step < 1 ? 1 : 0)} ${field.unit}`,
        max: "—",
      })),
      ...(tool.selects ?? []).map((field) => ({
        label: field.label,
        value: field.options.find((option) => option.value === values[field.id])?.label ?? "",
        max: "—",
      })),
    ],
    steps: formulaSteps(tool.slug, values, computed.outputs),
  };
}

function formulaSteps(slug: string, values: Record<string, number>, outputs: Record<string, number>) {
  if (slug === "gotejamento") {
    const minutes = values.horas * 60 + values.minutos;
    return [
      `Tempo = ${values.horas} h × 60 + ${values.minutos} min = ${minutes} min.`,
      `mL/h = ${values.volume} ÷ (${minutes} ÷ 60) = ${formatNumber(outputs.mlh ?? 0, 1)}.`,
      `Gotas/min = (${values.volume} × ${values.fator}) ÷ ${minutes} = ${formatNumber(outputs.gotas ?? 0, 0)}, já arredondado.`,
    ];
  }
  if (slug === "imc") {
    const metros = values.altura / 100;
    return [
      `Altura em metros = ${values.altura} ÷ 100 = ${formatNumber(metros, 2)}.`,
      `IMC = ${values.peso} ÷ (${formatNumber(metros, 2)})² = ${formatNumber(outputs.imc ?? 0, 1)}.`,
    ];
  }
  return undefined;
}
