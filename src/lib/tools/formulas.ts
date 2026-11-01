import type { ComputeResult } from "@/lib/tools/types";
import { examePorIndice, interpretar } from "@/lib/tools/exames-laboratoriais";

const leituraExame: Record<string, string> = {
  indisponivel: "Faixa indisponível nesta base.",
  abaixo: "Abaixo da faixa de referência.",
  acima: "Acima da faixa de referência.",
  "na-faixa": "Dentro da faixa de referência.",
  "acima-do-minimo": "Acima do mínimo declarado. A base não traz máximo.",
};

/** O método de cada conta está em tool_formula. Estas funções só interpretam soma, gotejamento, imc e a faixa do exame. */
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
  "exames-laboratoriais": (values) => {
    const exame = examePorIndice(values.exame);
    if (!exame) return { error: "Escolha um exame da lista." };
    const genero = values.sexo === 1 ? "homem" : values.sexo === 2 ? "mulher" : "nao-informado";
    const leitura = interpretar(exame, values.valor, genero);
    return {
      outputs: { situacao: values.valor },
      texts: { situacao: `${exame.nome}: ${leituraExame[leitura.situacao]}` },
    };
  },
};
