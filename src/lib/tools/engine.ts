import { formulas } from "./formulas.ts";
import { findClinicalBand, inspectScaleAnswers, invalidFormulaOutputIds } from "./clinical-invariants.mjs";
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

function criterionMax(criterion: Criterion) {
  return Math.max(...criterion.choices.map((choice) => choice.value));
}

export function evaluateScale(tool: ClinicalTool, answers: Record<string, number>): ToolSuccess | ToolFailure {
  const criteria = tool.criteria ?? [];
  const { missing, invalid } = inspectScaleAnswers(criteria, answers);
  if (missing.length > 0) {
    return {
      ok: false,
      missing,
      message: `Faltam ${missing.length} critério${missing.length === 1 ? "" : "s"}. O escore só aparece com a escala completa.`,
    };
  }
  if (invalid.length > 0) {
    return { ok: false, missing: invalid, message: "Uma ou mais respostas não pertencem às opções válidas da escala. Revise os critérios." };
  }
  if (criteria.length === 0) return { ok: false, message: "Esta escala não possui critérios validados." };
  const total = criteria.reduce((sum, criterion) => sum + answers[criterion.id], 0);
  const band = findClinicalBand(tool.bands, total);
  if (tool.bands?.length && !band) return { ok: false, message: "Faixa de escore não definida: encaminhe para revisão clínica." };
  const max = criteria.reduce((sum, criterion) => sum + criterionMax(criterion), 0);
  return {
    ok: true,
    totalLabel: "Escore",
    total,
    max,
    band,
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
    if (text === "" || !Number.isFinite(value)) fieldErrors[field.id] = "Informe um número finito.";
    else if (value < field.min || value > field.max) fieldErrors[field.id] = `Use um valor entre ${field.min} e ${field.max}.`;
    else values[field.id] = value;
  }
  for (const field of tool.selects ?? []) {
    const value = Number(raw[field.id]);
    if (!field.options.some((option) => option.value === value)) fieldErrors[field.id] = "Escolha uma opção.";
    else values[field.id] = value;
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors, message: "Revise os campos marcados antes de calcular." };
  }
  const computed = formulas[tool.slug]?.(values);
  if (!computed) return { ok: false, message: "Esta calculadora ainda não tem fórmula." };
  if ("error" in computed) return { ok: false, message: computed.error };
  const invalidOutputs = invalidFormulaOutputIds(tool, computed.outputs);
  if ((tool.outputs?.length ?? 0) === 0 || invalidOutputs.length > 0) {
    return { ok: false, message: "Saída da fórmula ausente ou inválida: encaminhe para revisão clínica." };
  }
  const bandKey = tool.bandFrom ? computed.outputs[tool.bandFrom] : undefined;
  const band = bandKey === undefined ? undefined : findClinicalBand(tool.bands, bandKey);
  if (tool.bands?.length && !band) return { ok: false, message: "Faixa de resultado não definida: encaminhe para revisão clínica." };
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
