import type { ComputeResult } from "@/lib/tools/types";

/** Fórmulas ficam fora do objeto da ferramenta: o roteador serializa o instrumento, não a função. */
export const formulas: Record<string, (values: Record<string, number>) => ComputeResult> = {
  gotejamento: (values) => {
    const minutes = values.horas * 60 + values.minutos;
    if (minutes <= 0) return { error: "Informe um tempo maior que zero." };
    const mlh = values.volume / (minutes / 60);
    const gotas = (values.volume * values.fator) / minutes;
    return { outputs: { mlh, gotas: Math.round(gotas) } };
  },
  imc: (values) => {
    const metros = values.altura / 100;
    return { outputs: { imc: values.peso / (metros * metros) } };
  },
};
