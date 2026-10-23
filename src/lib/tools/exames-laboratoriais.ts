import type { ClinicalTool } from "@/lib/tools/types";
import { examesData, type Exame } from "@/lib/tools/exames-laboratoriais.data";

/**
 * Exames Laboratoriais — interpreta o resultado contra a faixa de referencia.
 *
 * Os 149 exames e as 21 categorias vem do `exames-laboratoriais.data.ts`, que e a MESMA base que
 * roda no site publicado; este modulo so a governa. O texto nao foi escrito
 * aqui: ele veio da pagina de referencia do proprio site, com as fontes
 * declaradas em `references`.
 *
 * As faixas sao de referencia clinica, nao de diagnostico. Por isso a
 * ferramenta e `candidata`: fica ALCANCAVEL para revisao e FORA do indice
 * ate a homologacao humana que a politica exige.
 */

const exames: Exame[] = examesData;

/** As categorias, na ordem em que a base as traz — a ordem e do dado, nossa. */
export const categoriasExames = [...new Set(exames.map((e) => e.categoria))];

export function examesPorCategoria(categoria: string) {
  return exames.filter((e) => e.categoria === categoria);
}

/**
 * Onde o resultado cai: abaixo, dentro ou acima da faixa.
 *
 * `genero` so entra quando a faixa e por sexo; caso contrario a mesma faixa
 * vale para todos. Devolve `indisponivel` quando o exame nao tem faixa — e
 * honesto dizer que nao sabemos, em vez de inventar um valor.
 */
export function interpretar(
  exame: Exame,
  valor: number,
  genero: "homem" | "mulher" | "nao-binario" | "nao-informado",
) {
  const r = exame.ref;
  const porSexo = r.porSexo && (genero === "homem" || genero === "mulher");
  const min = porSexo ? (genero === "homem" ? r.minH : r.minM) : r.min;
  const max = porSexo ? (genero === "homem" ? r.maxH : r.maxM) : r.max;

  // Faixa PARCIAL e o caso perigoso: o Colesterol HDL vem com minimo e sem
  // maximo. Dizer "na faixa" ali seria afirmar que o valor esta dentro de um
  // intervalo que a base nao declara. A ferramenta diz so o que sabe.
  if (min === null && max === null) {
    return { situacao: "indisponivel" as const, cobertura: "nenhuma" as const, min, max, unidade: r.unidade };
  }
  // A COBERTURA vem do intervalo, nao do ramo: uma faixa so com minimo
  // continua parcial mesmo quando o resultado saiu "abaixo".
  const cobertura = min === null || max === null ? "parcial" : "completa";
  if (min !== null && valor < min) {
    return { situacao: "abaixo" as const, cobertura, min, max, unidade: r.unidade };
  }
  if (max !== null && valor > max) {
    return { situacao: "acima" as const, cobertura, min, max, unidade: r.unidade };
  }
  return {
    situacao: max === null ? ("acima-do-minimo" as const) : ("na-faixa" as const),
    cobertura: max === null ? ("parcial-sem-maximo" as const) : "completa",
    min, max, unidade: r.unidade,
  };
}

/**
 * Os 149 exames, como select da ferramenta — gerados da base, nunca a mao.
 *
 * O `value` e o INDICE na base, porque o motor usa `Choice.value` numerico
 * (a Braden e a IMC tambem). O id continua sendo a chave estavel: o indice
 * pode mudar se a base crescer, o id nao. Por isso `examePorIndice` resolve.
 */
export const selectExames = categoriasExames.flatMap((categoria) =>
  examesPorCategoria(categoria).map((e) => ({
    value: exames.findIndex((x) => x.id === e.id),
    label: `${e.categoria} · ${e.nome} — ${e.ref.unidade || "s/unidade"}`,
  })),
);

/** Resolve o select de volta para o exame. Indice fora da base => undefined. */
export function examePorIndice(indice: number): Exame | undefined {
  return exames[indice];
}

/** E tambem pelo id, que e a chave estavel. */
export function examePorId(id: string): Exame | undefined {
  return exames.find((e) => e.id === id);
}


export const examesLaboratoriais: ClinicalTool = {
  slug: "exames-laboratoriais",
  kind: "calculadora",
  category: "Laboratório",
  title: "Calculadora de Exames Laboratoriais",
  lead:
    "Informe o resultado e compare com a faixa de referência do exame. A leitura é da faixa, não do diagnóstico: um valor fora da faixa é um dado para conversar com a equipe, não uma conclusão.",
  nandaMode: "nao-fechar",
  related: ["exames-laboratoriais"],
  // Os 149 exames entram como UM select gerado da base, e o valor como UM campo
  // numerico. Nenhum componente novo: e o mesmo par campo+select que a Braden
  // e a IMC ja usam.
  selects: [
    { id: "exame", label: "Exame", options: selectExames },
    {
      id: "sexo",
      label: "Sexo (usado apenas quando a faixa e por sexo)",
      options: [
        { value: 0, label: "Nao informado" },
        { value: 1, label: "Homem" },
        { value: 2, label: "Mulher" },
      ],
    },
  ],
  fields: [{ id: "valor", label: "Resultado", unit: "", min: 0, max: 100000, step: 0.01 }],
  outputs: [{ id: "situacao", label: "Situacao", unit: "", digits: 0 }],
  howTo: [
    "Escolha a categoria do exame e localize o analito.",
    "Informe o valor exatamente como veio no laudo.",
    "Se a faixa depender do sexo, selecione-o antes de ler o resultado.",
    "Leia a situação: dentro da faixa, abaixo ou acima.",
  ],
  faqs: [
    {
      q: "Um resultado fora da faixa significa doença?",
      a: "Não. A faixa de referência é uma faixa populacional, não um limite entre saudável e doente. Fator interfering — refeição, exercício, horário da coleta, medicação em uso — move o número.",
    },
    {
      q: "Por que algumas faixas dependem do sexo?",
      a: "Porque a distribuição de referência foi estabelecida separadamente. Quando a base traz faixa por sexo, o cálculo usa a faixa do sexo informado; quando não traz, a mesma faixa vale para todos e o campo é ignorado.",
    },
    {
      q: "O que significa 'indisponivel'?",
      a: "Que aquele exame não tem faixa de referência na base. A ferramenta não estima uma — dizer que não sabemos é mais honesto do que preencher um número inventado.",
    },
  ],
  publicacao: "candidata",
  holds: [
    "UTC-024 — a comparacao e aritmetica, nao motor de formula com test vectors",
    "UTC-028 — o resultado nao tem contrato proprio (clinical_result)",
    "UTC-053 — as faixas vem da base do site, sem regra de pontuacao versionada",
    "UTC-056 — faixa por sexo existe em 10 dos 149 exames; os demais nao declaram faixa etaria",
    "UTC-072 — sem E2E",
    "UTC-080/081/082 — referencias em texto, sem verificador ABNT",
    "UTC-097 — sem disclaimer de emergencia",
  ],
  references: [
    "Sociedade Brasileira de Patologia Clínica/Medicina Laboratorial. Valores de Referência para Exames Laboratoriais (2023).",
    "Henry, J. B. Clinical Diagnosis and Management by Laboratory Methods (24ª ed.). Elsevier, 2021.",
    "Tietz Textbook of Clinical Chemistry and Molecular Diagnostics. Elsevier.",
  ],
};

export { exames };